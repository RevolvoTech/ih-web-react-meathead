"use client";

import { Check, LocateFixed, MapPin, Navigation, Phone, Play, RefreshCw, Route } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import AuthGate from "@/components/operations/AuthGate";
import OperationsShell from "@/components/operations/OperationsShell";
import StatusBadge from "@/components/operations/StatusBadge";
import { meatheadApi, type DeliveryRun, type DeliveryStop } from "@/lib/meathead-api";

const formatMoney = (paisa: number) => new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
}).format(paisa / 100);

export default function RiderPage() {
  return <AuthGate>{({ session, signOut }) => <RiderWorkspace token={session.access_token} signOut={signOut} />}</AuthGate>;
}

function RiderWorkspace({ token, signOut }: { token: string; signOut: () => Promise<void> }) {
  const [runs, setRuns] = useState<DeliveryRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [locationRunId, setLocationRunId] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [cashCollected, setCashCollected] = useState<Record<string, boolean>>({});
  const watchId = useRef<number | null>(null);
  const lastLocationSentAt = useRef(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRuns(await meatheadApi.riderRuns(token));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Delivery runs could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
  }, []);

  async function runAction(id: string, action: () => Promise<unknown>) {
    setBusyId(id);
    setError("");
    try {
      await action();
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The rider action could not be completed.");
    } finally {
      setBusyId("");
    }
  }

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

  return <OperationsShell active="rider" title="Delivery runs" subtitle="Start your assigned run, share location, and complete stops in sequence." onSignOut={signOut}>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div aria-live="polite" className="flex min-h-6 items-center gap-2 text-sm text-white/55">{locationRunId && <span className="h-2 w-2 rounded-full bg-emerald-400 motion-safe:animate-pulse" aria-hidden="true" />}{locationMessage || "Location is shared only while you choose to share it."}</div>
      <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex min-h-11 items-center gap-2 border border-white/20 px-4 font-data text-xs font-bold uppercase tracking-[0.1em] text-white/75 hover:border-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meathead-red disabled:opacity-50"><RefreshCw size={16} aria-hidden="true" className={loading ? "motion-safe:animate-spin" : ""} /> Refresh</button>
    </div>

    {error && <div role="alert" className="mb-5 border-l-2 border-meathead-red bg-meathead-red/10 px-4 py-3 text-sm text-red-100">{error}</div>}
    {loading && !runs.length ? <div className="space-y-4" aria-busy="true" aria-label="Loading delivery runs">{[0, 1].map((item) => <div key={item} className="h-64 border border-white/10 bg-meathead-charcoal motion-safe:animate-pulse" />)}</div> : null}
    {!loading && !runs.length ? <div className="border border-white/10 bg-meathead-charcoal px-5 py-16 text-center"><Route className="mx-auto text-white/25" size={34} aria-hidden="true" /><h2 className="mt-4 text-lg font-bold">No active delivery run</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/50">Assigned runs will appear here after dispatch creates them.</p></div> : null}

    <div className="space-y-6">
      {runs.map((run) => <section key={run.id} className="border border-white/10 bg-meathead-charcoal" aria-labelledby={`run-${run.id}`}>
        <header className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div><div className="flex flex-wrap items-center gap-2"><h2 id={`run-${run.id}`} className="font-data text-lg font-bold">{run.runNumber}</h2><StatusBadge status={run.status} /></div><p className="mt-2 text-sm text-white/50">{run.stops.length} stop{run.stops.length === 1 ? "" : "s"}{run.distanceMeters ? ` · ${(run.distanceMeters / 1000).toFixed(1)} km` : ""}</p></div>
          <div className="flex flex-wrap gap-2">
            {run.status === "ASSIGNED" && <button type="button" disabled={busyId === run.id} onClick={() => void runAction(run.id, () => meatheadApi.startRun(token, run.id))} className="inline-flex min-h-11 items-center gap-2 bg-meathead-red px-4 font-data text-xs font-bold uppercase tracking-[0.1em] hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50"><Play size={16} aria-hidden="true" /> Start run</button>}
            {run.status === "IN_PROGRESS" && locationRunId !== run.id && <button type="button" onClick={() => startLocationSharing(run.id)} className="inline-flex min-h-11 items-center gap-2 border border-emerald-500/50 bg-emerald-500/10 px-4 font-data text-xs font-bold uppercase tracking-[0.1em] text-emerald-200 hover:bg-emerald-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"><LocateFixed size={16} aria-hidden="true" /> Share location</button>}
            {locationRunId === run.id && <button type="button" onClick={stopLocationSharing} className="min-h-11 border border-white/20 px-4 font-data text-xs font-bold uppercase tracking-[0.1em] text-white/70 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meathead-red">Stop sharing</button>}
          </div>
        </header>
        <ol className="divide-y divide-white/10">
          {run.stops.map((stop) => <StopRow key={stop.id} run={run} stop={stop} busy={busyId === stop.id} cashCollected={cashCollected[stop.id] ?? false} setCashCollected={(checked) => setCashCollected((current) => ({ ...current, [stop.id]: checked }))} onArrived={() => runAction(stop.id, () => meatheadApi.updateStop(token, run.id, stop.id, { status: "ARRIVED", cashCollected: false }))} onDelivered={() => runAction(stop.id, () => meatheadApi.updateStop(token, run.id, stop.id, { status: "DELIVERED", cashCollected: cashCollected[stop.id] ?? false }))} />)}
        </ol>
      </section>)}
    </div>
  </OperationsShell>;
}

function StopRow({ run, stop, busy, cashCollected, setCashCollected, onArrived, onDelivered }: {
  run: DeliveryRun;
  stop: DeliveryStop;
  busy: boolean;
  cashCollected: boolean;
  setCashCollected: (checked: boolean) => void;
  onArrived: () => Promise<void>;
  onDelivered: () => Promise<void>;
}) {
  const complete = ["DELIVERED", "FAILED", "SKIPPED"].includes(stop.status);
  const latitude = Number(stop.order.latitude);
  const longitude = Number(stop.order.longitude);
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  return <li className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[48px_minmax(0,1fr)_auto]">
    <div className="flex h-10 w-10 items-center justify-center border border-white/15 bg-black/25 font-data text-sm font-bold text-meathead-red" aria-label={`Stop ${stop.sequence}`}>{stop.sequence}</div>
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2"><strong>{stop.order.customerName}</strong><StatusBadge status={stop.status} /><span className="font-data text-xs text-white/40">{stop.order.orderNumber}</span></div>
      <p className="mt-2 flex items-start gap-2 text-sm leading-5 text-white/65"><MapPin className="mt-0.5 shrink-0 text-meathead-red" size={15} aria-hidden="true" />{stop.order.deliveryAddress}</p>
      {stop.order.deliveryNotes && <p className="mt-2 border-l border-white/15 pl-3 text-xs leading-5 text-white/45">{stop.order.deliveryNotes}</p>}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm"><a href={`tel:${stop.order.customerPhone}`} className="inline-flex min-h-11 items-center gap-2 text-white/70 underline decoration-white/25 underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-meathead-red"><Phone size={15} aria-hidden="true" /> Call customer</a><a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-white/70 underline decoration-white/25 underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-meathead-red"><Navigation size={15} aria-hidden="true" /> Open directions</a></div>
    </div>
    <div className="min-w-52 lg:text-right">
      <p className="font-data text-sm font-bold">{formatMoney(stop.order.totalAmountPaisa)}</p>
      <p className="mt-1 text-xs text-white/45">{stop.order.paymentMethod} · {stop.order.paymentStatus}</p>
      {!complete && run.status === "IN_PROGRESS" && <div className="mt-3 flex flex-col items-stretch gap-2">
        {stop.order.paymentMethod === "COD" && stop.order.paymentStatus !== "PAID" && <label className="flex min-h-11 cursor-pointer items-center justify-end gap-2 text-sm text-white/70"><input type="checkbox" checked={cashCollected} onChange={(event) => setCashCollected(event.target.checked)} className="h-5 w-5 accent-meathead-red" /> Cash collected</label>}
        {stop.status === "PENDING" && <button type="button" disabled={busy} onClick={() => void onArrived()} className="min-h-11 border border-white/20 px-4 font-data text-xs font-bold uppercase tracking-[0.08em] text-white/75 hover:border-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meathead-red disabled:opacity-50">Mark arrived</button>}
        {stop.status === "ARRIVED" && <button type="button" disabled={busy || (stop.order.paymentMethod === "COD" && stop.order.paymentStatus !== "PAID" && !cashCollected)} onClick={() => void onDelivered()} className="inline-flex min-h-11 items-center justify-center gap-2 bg-meathead-red px-4 font-data text-xs font-bold uppercase tracking-[0.08em] hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40"><Check size={16} aria-hidden="true" /> Delivered</button>}
      </div>}
    </div>
  </li>;
}
