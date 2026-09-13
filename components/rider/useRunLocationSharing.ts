"use client";

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { meatheadApi, type DeliveryRun } from "@/lib/meathead-api";

interface RunLocationSharingOptions {
  token: string;
  runs: DeliveryRun[];
  setError: Dispatch<SetStateAction<string>>;
  setMessage: Dispatch<SetStateAction<string>>;
}

export function useRunLocationSharing({ token, runs, setError, setMessage }: RunLocationSharingOptions) {
  const [locationRunId, setLocationRunId] = useState("");
  const [locationIssueRunId, setLocationIssueRunId] = useState("");
  const watchId = useRef<number | null>(null);
  const activeLocationRunId = useRef("");
  const lastLocationSentAt = useRef(0);
  const uploadRunning = useRef(false);
  const tokenRef = useRef(token);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const stopLocationSharing = useCallback((message = "") => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    activeLocationRunId.current = "";
    uploadRunning.current = false;
    setLocationRunId("");
    if (message) setMessage(message);
  }, [setMessage]);

  const startLocationSharing = useCallback((runId: string) => {
    setError("");
    if (!("geolocation" in navigator)) {
      setLocationIssueRunId(runId);
      setError("Location services are not available on this device.");
      return;
    }

    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    activeLocationRunId.current = runId;
    lastLocationSentAt.current = 0;
    uploadRunning.current = false;
    setLocationIssueRunId("");
    setLocationRunId(runId);
    setMessage("Waiting for an accurate location…");

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        if (activeLocationRunId.current !== runId) return;
        const now = Date.now();
        if (now - lastLocationSentAt.current < 10_000 || uploadRunning.current) return;
        lastLocationSentAt.current = now;
        uploadRunning.current = true;
        const { latitude, longitude, accuracy, heading, speed } = position.coords;

        void meatheadApi.recordLocation(tokenRef.current, runId, {
          latitude,
          longitude,
          accuracyMeters: accuracy,
          ...(heading !== null ? { headingDegrees: heading } : {}),
          ...(speed !== null ? { speedMetersPerSecond: speed } : {}),
          recordedAt: new Date(position.timestamp).toISOString(),
        }).then(() => {
          if (activeLocationRunId.current === runId) {
            setMessage(`Sharing automatically · ±${Math.round(accuracy)}m`);
          }
        }).catch((requestError) => {
          setError(requestError instanceof Error ? requestError.message : "Location could not be shared.");
        }).finally(() => {
          uploadRunning.current = false;
        });
      },
      (locationError) => {
        if (activeLocationRunId.current !== runId) return;
        if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
        activeLocationRunId.current = "";
        setLocationRunId("");
        setLocationIssueRunId(runId);
        setError(locationError.code === 1
          ? "Location permission is needed for this run. Allow precise location, then tap Enable location."
          : "Your current location could not be read. Check GPS, then retry.");
      },
      { enableHighAccuracy: true, maximumAge: 8_000, timeout: 15_000 },
    );
  }, [setError, setMessage]);

  const activeRunId = runs.find((run) => run.status === "IN_PROGRESS")?.id ?? "";

  useEffect(() => {
    if (!activeRunId) {
      if (watchId.current !== null) stopLocationSharing("Location sharing stopped with the run.");
      if (locationIssueRunId) setLocationIssueRunId("");
      return;
    }
    if (activeLocationRunId.current === activeRunId || locationIssueRunId === activeRunId) return;
    startLocationSharing(activeRunId);
  }, [activeRunId, locationIssueRunId, startLocationSharing, stopLocationSharing]);

  useEffect(() => () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
  }, []);

  return {
    locationRunId,
    locationIssueRunId,
    retryLocation: startLocationSharing,
  };
}

