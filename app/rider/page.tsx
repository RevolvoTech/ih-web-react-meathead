"use client";

import { RefreshCw, Route } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import AuthGate from "@/components/operations/AuthGate";
import OperationsShell from "@/components/operations/OperationsShell";
import RunCard from "@/components/rider/RunCard";
import { useArrivalNavigation } from "@/components/rider/useArrivalNavigation";
import { ARRIVAL_RADIUS_METERS } from "@/lib/delivery-navigation";
import { meatheadApi, type DeliveryRun, type OperationsProfile } from "@/lib/meathead-api";

export default function RiderPage() {
  return <AuthGate allowedRoles={["ADMIN", "RIDER"]} workspace="Rider">{({ session, profile, signOut }) => <RiderWorkspace token={session.access_token} profile={profile} signOut={signOut} />}</AuthGate>;
}

function RiderWorkspace({ token, profile, signOut }: { token: string; profile: OperationsProfile; signOut: () => Promise<void> }) {
  const [runs, setRuns] = useState<DeliveryRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [locationRunId, setLocationRunId] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [cashCollected, setCashCollected] = useState<Record<string, boolean>>({});
  const watchId = useRef<number | null>(null);
  const lastLocationSentAt = useRef(0);

  const load = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      setRuns(await meatheadApi.riderRuns(token));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Delivery runs could not be loaded.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [token]);

  const { activeStopIds, beginNavigation, checkingStopId, markArrived } = useArrivalNavigation({
    token,
    runs,
    reload: load,
    setBusyId,
    setError,
    setMessage: setLocationMessage,
  });

  useEffect(() => { void load(); }, [load]);
  useEffect(() => () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
  }, []);

  const runAction = useCallback(async (id: string, action: () => Promise<unknown>) => {
    setBusyId(id);
    setError("");
    try {
      await action();
      await load(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The rider action could not be completed.");
    } finally {
      setBusyId("");
    }
  }, [load]);

  function stopLocationSharing() {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    setLocationRunId("");
    setLocationMessage("Location sharing stopped.");
  }

  function startLocationSharing(runId: string) {
    if (!("geolocation" in navigator)) {
      setError("Location services are not available on this device.");
      return;
    }
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    setLocationRunId(runId);
    setLocationMessage("Waiting for an accurate location…");
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        if (now - lastLocationSentAt.current < 10_000) return;
        lastLocationSentAt.current = now;
        const { latitude, longitude, accuracy, heading, speed } = position.coords;
        void meatheadApi.recordLocation(token, runId, {
          latitude,
          longitude,
          accuracyMeters: accuracy,
          ...(heading !== null ? { headingDegrees: heading } : {}),
          ...(speed !== null ? { speedMetersPerSecond: speed } : {}),
          recordedAt: new Date(position.timestamp).toISOString(),
        }).then(() => setLocationMessage(`Live location shared · ${Math.round(accuracy)}m accuracy`))
          .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Location could not be shared."));
      },
      (locationError) => {
        setLocationRunId("");
        setError(locationError.code === 1 ? "Location permission was denied. Enable it in browser settings to share tracking." : "Your current location could not be read.");
      },
      { enableHighAccuracy: true, maximumAge: 8_000, timeout: 15_000 },
    );
  }

  return <OperationsShell active="rider" profile={profile} title="Delivery runs" subtitle="Navigate one stop at a time. Returning from Maps checks your arrival and prepares the next destination." onSignOut={signOut}>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div aria-live="polite" className="flex min-h-6 items-center gap-2 text-sm text-white/55">{(locationRunId || checkingStopId) && <span className="h-2 w-2 rounded-full bg-emerald-400 motion-safe:animate-pulse" aria-hidden="true" />}{locationMessage || `Arrival advances automatically within ${ARRIVAL_RADIUS_METERS}m.`}</div>
      <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex min-h-11 items-center gap-2 border border-white/20 px-4 font-data text-xs font-bold uppercase tracking-[0.1em] text-white/75 hover:border-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meathead-red disabled:opacity-50"><RefreshCw size={16} aria-hidden="true" className={loading ? "motion-safe:animate-spin" : ""} /> Refresh</button>
    </div>

    {error && <div role="alert" className="mb-5 border-l-2 border-meathead-red bg-meathead-red/10 px-4 py-3 text-sm text-red-100">{error}</div>}
    {loading && !runs.length ? <div className="space-y-4" aria-busy="true" aria-label="Loading delivery runs">{[0, 1].map((item) => <div key={item} className="h-64 border border-white/10 bg-meathead-charcoal motion-safe:animate-pulse" />)}</div> : null}
    {!loading && !runs.length ? <div className="border border-white/10 bg-meathead-charcoal px-5 py-16 text-center"><Route className="mx-auto text-white/25" size={34} aria-hidden="true" /><h2 className="mt-4 text-lg font-bold">No active delivery run</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/50">Assigned runs will appear here after dispatch creates them.</p></div> : null}

    <div className="space-y-6">
      {runs.map((run) => <RunCard
        key={run.id}
        run={run}
        activeStopId={activeStopIds[run.id]}
        busyId={busyId}
        checkingStopId={checkingStopId}
        cashCollected={cashCollected}
        locationRunId={locationRunId}
        setCashCollected={(stopId, checked) => setCashCollected((current) => ({ ...current, [stopId]: checked }))}
        onBeginNavigation={beginNavigation}
        onStartRun={() => runAction(run.id, () => meatheadApi.startRun(token, run.id))}
        onStartLocation={() => startLocationSharing(run.id)}
        onStopLocation={stopLocationSharing}
        onArrived={markArrived}
        onDelivered={(stop) => runAction(stop.id, () => meatheadApi.updateStop(token, run.id, stop.id, { status: "DELIVERED", cashCollected: cashCollected[stop.id] ?? false }))}
      />)}
    </div>
  </OperationsShell>;
}
