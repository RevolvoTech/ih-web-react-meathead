"use client";

import { PackageCheck, RefreshCw, Route } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AuthGate from "@/components/operations/AuthGate";
import OperationsShell from "@/components/operations/OperationsShell";
import RunCard from "@/components/rider/RunCard";
import { useArrivalNavigation } from "@/components/rider/useArrivalNavigation";
import { useRunLocationSharing } from "@/components/rider/useRunLocationSharing";
import { ARRIVAL_RADIUS_METERS } from "@/lib/delivery-navigation";
import { meatheadApi, type DeliveryRun, type OperationsProfile, type OrderSummary } from "@/lib/meathead-api";

export default function RiderPage() {
  return <AuthGate allowedRoles={["RIDER"]} workspace="Rider">{({ session, profile, signOut }) => <RiderWorkspace token={session.access_token} profile={profile} signOut={signOut} />}</AuthGate>;
}

function RiderWorkspace({ token, profile, signOut }: { token: string; profile: OperationsProfile; signOut: () => Promise<void> }) {
  const [runs, setRuns] = useState<DeliveryRun[]>([]);
  const [pickups, setPickups] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [cashCollected, setCashCollected] = useState<Record<string, boolean>>({});

  const load = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      const [nextRuns, nextPickups] = await Promise.all([
        meatheadApi.riderRuns(token),
        meatheadApi.riderPickups(token),
      ]);
      setRuns(nextRuns);
      setPickups(nextPickups);
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
  const { locationRunId, locationIssueRunId, retryLocation } = useRunLocationSharing({
    token,
    runs,
    setError,
    setMessage: setLocationMessage,
  });

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(false), 15_000);
    return () => window.clearInterval(interval);
  }, [load]);

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

  async function pickUpReadyOrders() {
    setBusyId("pickup");
    setError("");
    try {
      const run = await meatheadApi.pickupReadyOrders(token);
      setLocationMessage(`${run.stops.length} order${run.stops.length === 1 ? "" : "s"} picked up.`);
      await load(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The ready orders could not be picked up.");
    } finally {
      setBusyId("");
    }
  }

  async function refresh() {
    setRefreshing(true);
    await load(false);
    setRefreshing(false);
  }

  return <OperationsShell active="rider" profile={profile} title="Delivery runs" onSignOut={signOut}>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div aria-live="polite" className="flex min-h-6 items-center gap-2 font-data text-xs font-bold uppercase text-white/55">{(locationRunId || checkingStopId) && <span className="h-2 w-2 rounded-full bg-emerald-400 motion-safe:animate-pulse" aria-hidden="true" />}{locationMessage || `${ARRIVAL_RADIUS_METERS} m auto-arrival`}</div>
      <button type="button" onClick={() => void refresh()} disabled={loading || refreshing} className="inline-flex min-h-11 items-center gap-2 border border-white/20 px-4 font-data text-xs font-bold uppercase tracking-[0.1em] text-white/75 hover:border-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meathead-red disabled:opacity-50"><RefreshCw size={16} aria-hidden="true" className={loading || refreshing ? "motion-safe:animate-spin" : ""} /> Refresh</button>
    </div>

    {error && <div role="alert" className="mb-5 rounded-lg border-l-2 border-meathead-red bg-meathead-red/10 px-4 py-3 text-sm text-red-100">{error}</div>}
    {loading && !runs.length && !pickups.length ? <div className="space-y-4" aria-busy="true" aria-label="Loading delivery runs">{[0, 1].map((item) => <div key={item} className="h-64 rounded-xl border border-white/10 bg-meathead-charcoal motion-safe:animate-pulse" />)}</div> : null}

    {!loading && pickups.length > 0 && <section className="mb-6 overflow-hidden rounded-xl border border-emerald-400/25 bg-meathead-charcoal shadow-lg shadow-black/20" aria-labelledby="pickup-heading">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300"><PackageCheck size={20} aria-hidden="true" /></div>
        <div className="min-w-0 flex-1"><h2 id="pickup-heading" className="font-heading text-2xl uppercase">Ready at kitchen</h2><p className="mt-1 text-sm text-white/50">{pickups.length} order{pickups.length === 1 ? "" : "s"} packed</p></div>
      </div>
      <ol className="divide-y divide-white/10">
        {pickups.map((order) => <li key={order.id} className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_auto] sm:px-5">
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><strong className="font-data text-sm">{order.orderNumber}</strong><span className="text-sm font-semibold">{order.customerName}</span></div><p className="mt-1 truncate text-xs text-white/45">{order.deliveryAddress}</p></div>
          <span className="text-xs text-white/45 sm:text-right">{order.items.map((item) => `${item.quantity}× ${item.productName}`).join(" · ")}</span>
        </li>)}
      </ol>
      <div className="border-t border-white/10 p-4 sm:p-5">
        {runs.length === 0 ? <button type="button" onClick={() => void pickUpReadyOrders()} disabled={busyId === "pickup"} className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-lg bg-meathead-red px-6 font-data text-sm font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-wait disabled:opacity-50"><PackageCheck size={19} aria-hidden="true" />{busyId === "pickup" ? "Picking up…" : `Pick up ${pickups.length} order${pickups.length === 1 ? "" : "s"}`}</button> : <p className="text-sm font-semibold text-white/60">Finish the current run, then pick these up.</p>}
      </div>
    </section>}

    {!loading && !runs.length && !pickups.length ? <div className="rounded-xl border border-white/10 bg-meathead-charcoal px-5 py-16 text-center shadow-lg shadow-black/20"><Route className="mx-auto text-white/25" size={34} aria-hidden="true" /><h2 className="mt-4 font-heading text-2xl uppercase">No orders ready</h2></div> : null}

    <div className="space-y-6">
      {runs.map((run) => <RunCard
        key={run.id}
        run={run}
        activeStopId={activeStopIds[run.id]}
        busyId={busyId}
        checkingStopId={checkingStopId}
        cashCollected={cashCollected}
        locationRunId={locationRunId}
        locationIssueRunId={locationIssueRunId}
        setCashCollected={(stopId, checked) => setCashCollected((current) => ({ ...current, [stopId]: checked }))}
        onBeginNavigation={beginNavigation}
        onStartRun={() => runAction(run.id, () => meatheadApi.startRun(token, run.id))}
        onRetryLocation={() => retryLocation(run.id)}
        onArrived={markArrived}
        onDelivered={(stop) => runAction(stop.id, () => meatheadApi.updateStop(token, run.id, stop.id, { status: "DELIVERED", cashCollected: cashCollected[stop.id] ?? false }))}
      />)}
    </div>
  </OperationsShell>;
}
