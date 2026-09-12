"use client";

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import {
  distanceInMeters,
  isConfidentArrival,
  nextPendingStop,
  type LocationReading,
} from "@/lib/delivery-navigation";
import { meatheadApi, type DeliveryRun, type DeliveryStop } from "@/lib/meathead-api";

const NAVIGATION_ATTEMPT_KEY = "meathead:rider-navigation-attempt";
const ACTIVE_STOPS_KEY = "meathead:rider-active-stops";
const NAVIGATION_ATTEMPT_TTL_MS = 4 * 60 * 60 * 1_000;

interface NavigationAttempt {
  runId: string;
  stopId: string;
  openedAt: number;
}

interface ArrivalNavigationOptions {
  token: string;
  runs: DeliveryRun[];
  reload: (showLoading?: boolean) => Promise<void>;
  setBusyId: Dispatch<SetStateAction<string>>;
  setError: Dispatch<SetStateAction<string>>;
  setMessage: Dispatch<SetStateAction<string>>;
}

function readStoredJson<T>(key: string): T | null {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : null;
  } catch {
    return null;
  }
}

function writeStoredJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Navigation still works if private browsing prevents local storage.
  }
}

function readCurrentLocation(): Promise<LocationReading> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracyMeters: position.coords.accuracy,
      }),
      reject,
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15_000 },
    );
  });
}

function pause(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

export function useArrivalNavigation({
  token,
  runs,
  reload,
  setBusyId,
  setError,
  setMessage,
}: ArrivalNavigationOptions) {
  const [activeStopIds, setActiveStopIds] = useState<Record<string, string>>({});
  const [checkingStopId, setCheckingStopId] = useState("");
  const runsRef = useRef<DeliveryRun[]>([]);
  const arrivalCheckRunning = useRef(false);

  useEffect(() => {
    const storedStops = readStoredJson<Record<string, string>>(ACTIVE_STOPS_KEY);
    if (storedStops) setActiveStopIds(storedStops);
  }, []);

  useEffect(() => {
    runsRef.current = runs;
  }, [runs]);

  const setActiveStop = useCallback((runId: string, stopId?: string) => {
    setActiveStopIds((current) => {
      const updated = { ...current };
      if (stopId) updated[runId] = stopId;
      else delete updated[runId];
      writeStoredJson(ACTIVE_STOPS_KEY, updated);
      return updated;
    });
  }, []);

  const advanceAfterArrival = useCallback((run: DeliveryRun, arrivedStop: DeliveryStop) => {
    const upcoming = nextPendingStop(run, arrivedStop.sequence, arrivedStop.id);
    setActiveStop(run.id, upcoming?.id);
    setMessage(upcoming
      ? `Arrived at ${arrivedStop.order.customerName}. Next destination: ${upcoming.order.customerName}.`
      : "Arrived at the final stop. Confirm delivery to finish the run.");
  }, [setActiveStop, setMessage]);

  const checkArrivalAfterNavigation = useCallback(async () => {
    if (arrivalCheckRunning.current || !("geolocation" in navigator)) return;
    const attempt = readStoredJson<NavigationAttempt>(NAVIGATION_ATTEMPT_KEY);
    if (!attempt || Date.now() - attempt.openedAt > NAVIGATION_ATTEMPT_TTL_MS) {
      window.localStorage.removeItem(NAVIGATION_ATTEMPT_KEY);
      return;
    }
    if (runsRef.current.length === 0) return;

    const run = runsRef.current.find((item) => item.id === attempt.runId && item.status === "IN_PROGRESS");
    const stop = run?.stops.find((item) => item.id === attempt.stopId);
    if (!run || !stop || stop.status !== "PENDING") {
      window.localStorage.removeItem(NAVIGATION_ATTEMPT_KEY);
      return;
    }

    arrivalCheckRunning.current = true;
    setCheckingStopId(stop.id);
    setMessage(`Checking proximity to ${stop.order.customerName}…`);
    try {
      const first = await readCurrentLocation();
      await pause(800);
      const second = await readCurrentLocation();
      const destination = { latitude: Number(stop.order.latitude), longitude: Number(stop.order.longitude) };

      if (isConfidentArrival([first, second], destination)) {
        await meatheadApi.updateStop(token, run.id, stop.id, { status: "ARRIVED", cashCollected: false });
        window.localStorage.removeItem(NAVIGATION_ATTEMPT_KEY);
        advanceAfterArrival(run, stop);
        await reload(false);
        return;
      }

      const closestDistance = Math.min(distanceInMeters(first, destination), distanceInMeters(second, destination));
      const bestAccuracy = Math.min(first.accuracyMeters, second.accuracyMeters);
      setMessage(bestAccuracy > 75
        ? `GPS accuracy is ${Math.round(bestAccuracy)}m. Keep this screen open for a clearer arrival check.`
        : `${Math.round(closestDistance)}m from ${stop.order.customerName}. Navigate remains set to this stop.`);
    } catch (locationError) {
      const permissionDenied = typeof locationError === "object"
        && locationError !== null
        && "code" in locationError
        && locationError.code === 1;
      setError(permissionDenied
        ? "Location permission was denied. Enable precise location so arrivals can advance automatically."
        : "Arrival could not be checked. You can still mark the stop arrived manually.");
    } finally {
      setCheckingStopId("");
      arrivalCheckRunning.current = false;
    }
  }, [advanceAfterArrival, reload, setError, setMessage, token]);

  useEffect(() => {
    if (runs.length > 0) void checkArrivalAfterNavigation();
  }, [checkArrivalAfterNavigation, runs]);

  useEffect(() => {
    const checkOnVisible = () => {
      if (document.visibilityState === "visible") void checkArrivalAfterNavigation();
    };
    document.addEventListener("visibilitychange", checkOnVisible);
    window.addEventListener("pageshow", checkOnVisible);
    window.addEventListener("focus", checkOnVisible);
    return () => {
      document.removeEventListener("visibilitychange", checkOnVisible);
      window.removeEventListener("pageshow", checkOnVisible);
      window.removeEventListener("focus", checkOnVisible);
    };
  }, [checkArrivalAfterNavigation]);

  const beginNavigation = useCallback((run: DeliveryRun, stop: DeliveryStop) => {
    writeStoredJson(NAVIGATION_ATTEMPT_KEY, { runId: run.id, stopId: stop.id, openedAt: Date.now() });
    setActiveStop(run.id, stop.id);
    setMessage(`Navigating to ${stop.order.customerName}. Arrival will be checked when you return.`);
  }, [setActiveStop, setMessage]);

  const markArrived = useCallback(async (run: DeliveryRun, stop: DeliveryStop) => {
    setBusyId(stop.id);
    setError("");
    try {
      await meatheadApi.updateStop(token, run.id, stop.id, { status: "ARRIVED", cashCollected: false });
      window.localStorage.removeItem(NAVIGATION_ATTEMPT_KEY);
      advanceAfterArrival(run, stop);
      await reload(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The arrival could not be saved.");
    } finally {
      setBusyId("");
    }
  }, [advanceAfterArrival, reload, setBusyId, setError, token]);

  return { activeStopIds, beginNavigation, checkingStopId, markArrived };
}
