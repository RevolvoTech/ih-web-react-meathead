"use client";

import { Check, LocateFixed, MapPin, Navigation, Play, Phone, RefreshCw } from "lucide-react";
import { useMemo } from "react";
import StatusBadge from "@/components/operations/StatusBadge";
import { googleMapsDirectionsUrl, nextPendingStop } from "@/lib/delivery-navigation";
import type { DeliveryRun, DeliveryStop } from "@/lib/meathead-api";

interface RunCardProps {
  run: DeliveryRun;
  activeStopId?: string;
  busyId: string;
  checkingStopId: string;
  cashCollected: Record<string, boolean>;
  locationRunId: string;
  setCashCollected: (stopId: string, checked: boolean) => void;
  onBeginNavigation: (run: DeliveryRun, stop: DeliveryStop) => void;
  onStartRun: () => Promise<void>;
  onStartLocation: () => void;
  onStopLocation: () => void;
  onArrived: (run: DeliveryRun, stop: DeliveryStop) => Promise<void>;
  onDelivered: (stop: DeliveryStop) => Promise<void>;
}

const formatMoney = (paisa: number) => new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
}).format(paisa / 100);

export default function RunCard({
  run,
  activeStopId,
  busyId,
  checkingStopId,
  cashCollected,
  locationRunId,
  setCashCollected,
  onBeginNavigation,
  onStartRun,
  onStartLocation,
  onStopLocation,
  onArrived,
  onDelivered,
}: RunCardProps) {
  const activeStop = useMemo(() => {
    const stored = run.stops.find((stop) => stop.id === activeStopId && stop.status === "PENDING");
    const mostRecentArrival = [...run.stops].reverse().find((stop) => stop.status === "ARRIVED");
    return stored ?? nextPendingStop(run) ?? mostRecentArrival;
  }, [activeStopId, run]);

  return <section className="border border-white/10 bg-meathead-charcoal" aria-labelledby={`run-${run.id}`}>
    <header className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div><div className="flex flex-wrap items-center gap-2"><h2 id={`run-${run.id}`} className="font-data text-lg font-bold">{run.runNumber}</h2><StatusBadge status={run.status} /></div><p className="mt-2 text-sm text-white/50">{run.stops.length} stop{run.stops.length === 1 ? "" : "s"}{run.distanceMeters ? ` · ${(run.distanceMeters / 1000).toFixed(1)} km` : ""}</p></div>
      <div className="flex flex-wrap gap-2">
        {run.status === "ASSIGNED" && <button type="button" disabled={busyId === run.id} onClick={() => void onStartRun()} className="inline-flex min-h-11 items-center gap-2 bg-meathead-red px-4 font-data text-xs font-bold uppercase tracking-[0.1em] hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50"><Play size={16} aria-hidden="true" /> Start run</button>}
        {run.status === "IN_PROGRESS" && locationRunId !== run.id && <button type="button" onClick={onStartLocation} className="inline-flex min-h-11 items-center gap-2 border border-emerald-500/50 bg-emerald-500/10 px-4 font-data text-xs font-bold uppercase tracking-[0.1em] text-emerald-200 hover:bg-emerald-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"><LocateFixed size={16} aria-hidden="true" /> Share location</button>}
        {locationRunId === run.id && <button type="button" onClick={onStopLocation} className="min-h-11 border border-white/20 px-4 font-data text-xs font-bold uppercase tracking-[0.1em] text-white/70 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meathead-red">Stop sharing</button>}
      </div>
    </header>

    {run.status === "IN_PROGRESS" && activeStop && <NextDestination run={run} stop={activeStop} checking={checkingStopId === activeStop.id} onBeginNavigation={onBeginNavigation} />}

    <ol className="divide-y divide-white/10">
      {run.stops.map((stop) => <StopRow
        key={stop.id}
        run={run}
        stop={stop}
        active={activeStop?.id === stop.id}
        busy={busyId === stop.id || checkingStopId === stop.id}
        cashCollected={cashCollected[stop.id] ?? false}
        setCashCollected={(checked) => setCashCollected(stop.id, checked)}
        onBeginNavigation={onBeginNavigation}
        onArrived={() => onArrived(run, stop)}
        onDelivered={() => onDelivered(stop)}
      />)}
    </ol>
  </section>;
}

function NextDestination({ run, stop, checking, onBeginNavigation }: {
  run: DeliveryRun;
  stop: DeliveryStop;
  checking: boolean;
  onBeginNavigation: (run: DeliveryRun, stop: DeliveryStop) => void;
}) {
  const pending = stop.status === "PENDING";
  const mapsUrl = googleMapsDirectionsUrl(Number(stop.order.latitude), Number(stop.order.longitude));

  return <div className="border-b border-white/10 bg-black/30 p-4 sm:p-5">
    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <p className="font-data text-[11px] font-bold uppercase tracking-[0.16em] text-meathead-red">{pending ? "Next destination" : "Delivery confirmation needed"}</p>
        <h3 className="mt-1 break-words text-xl font-bold">Stop {stop.sequence} · {stop.order.customerName}</h3>
        <p className="mt-2 flex items-start gap-2 text-sm leading-5 text-white/60"><MapPin className="mt-0.5 shrink-0 text-meathead-red" size={16} aria-hidden="true" />{stop.order.deliveryAddress}</p>
      </div>
      {pending && <a
        href={mapsUrl}
        onClick={(event) => {
          if (checking) event.preventDefault();
          else onBeginNavigation(run, stop);
        }}
        aria-disabled={checking}
        className="inline-flex min-h-14 w-full items-center justify-center gap-3 bg-meathead-red px-6 font-data text-sm font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:bg-red-800 aria-disabled:pointer-events-none aria-disabled:opacity-60 sm:w-auto"
        aria-label={`Navigate to ${stop.order.customerName} in Google Maps`}
      >
        {checking ? <RefreshCw size={19} className="motion-safe:animate-spin" aria-hidden="true" /> : <Navigation size={19} aria-hidden="true" />}
        {checking ? "Checking…" : "Navigate"}
      </a>}
    </div>
  </div>;
}

function StopRow({ run, stop, active, busy, cashCollected, setCashCollected, onBeginNavigation, onArrived, onDelivered }: {
  run: DeliveryRun;
  stop: DeliveryStop;
  active: boolean;
  busy: boolean;
  cashCollected: boolean;
  setCashCollected: (checked: boolean) => void;
  onBeginNavigation: (run: DeliveryRun, stop: DeliveryStop) => void;
  onArrived: () => Promise<void>;
  onDelivered: () => Promise<void>;
}) {
  const complete = ["DELIVERED", "FAILED", "SKIPPED"].includes(stop.status);
  const mapsUrl = googleMapsDirectionsUrl(Number(stop.order.latitude), Number(stop.order.longitude));
  return <li className={`grid gap-4 p-4 sm:p-5 lg:grid-cols-[48px_minmax(0,1fr)_auto] ${active ? "border-l-2 border-l-meathead-red bg-white/[0.025]" : "border-l-2 border-l-transparent"}`}>
    <div className={`flex size-10 items-center justify-center rounded-lg border bg-black/25 font-data text-sm font-bold ${active ? "border-meathead-red text-meathead-red" : "border-white/15 text-white/55"}`} aria-label={`Stop ${stop.sequence}`}>{stop.sequence}</div>
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2"><strong>{stop.order.customerName}</strong><StatusBadge status={stop.status} />{active && <span className="font-data text-[10px] font-bold uppercase tracking-[0.12em] text-meathead-red">Active</span>}<span className="font-data text-xs text-white/40">{stop.order.orderNumber}</span></div>
      <p className="mt-2 flex items-start gap-2 text-sm leading-5 text-white/65"><MapPin className="mt-0.5 shrink-0 text-meathead-red" size={15} aria-hidden="true" />{stop.order.deliveryAddress}</p>
      {stop.order.deliveryNotes && <p className="mt-2 border-l border-white/15 pl-3 text-xs leading-5 text-white/45">{stop.order.deliveryNotes}</p>}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm"><a href={`tel:${stop.order.customerPhone}`} className="inline-flex min-h-11 items-center gap-2 text-white/70 underline decoration-white/25 underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-meathead-red"><Phone size={15} aria-hidden="true" /> Call customer</a>{stop.status === "PENDING" && <a href={mapsUrl} onClick={() => onBeginNavigation(run, stop)} className="inline-flex min-h-11 items-center gap-2 text-white/70 underline decoration-white/25 underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-meathead-red"><Navigation size={15} aria-hidden="true" /> Open directions</a>}</div>
    </div>
    <div className="min-w-52 lg:text-right">
      <p className="font-data text-sm font-bold">{formatMoney(stop.order.totalAmountPaisa)}</p>
      <p className="mt-1 text-xs text-white/45">{stop.order.paymentMethod} · {stop.order.paymentStatus}</p>
      {!complete && run.status === "IN_PROGRESS" && <div className="mt-3 flex flex-col items-stretch gap-2">
        {stop.order.paymentMethod === "COD" && stop.order.paymentStatus !== "PAID" && <label className="flex min-h-11 cursor-pointer items-center justify-end gap-2 text-sm text-white/70"><input type="checkbox" checked={cashCollected} onChange={(event) => setCashCollected(event.target.checked)} className="h-5 w-5 accent-meathead-red" /> Cash collected</label>}
        {stop.status === "PENDING" && <button type="button" disabled={busy} onClick={() => void onArrived()} className="min-h-11 border border-white/20 px-4 font-data text-xs font-bold uppercase tracking-[0.08em] text-white/75 hover:border-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meathead-red disabled:opacity-50">{busy ? "Checking…" : "Mark arrived"}</button>}
        {stop.status === "ARRIVED" && <button type="button" disabled={busy || (stop.order.paymentMethod === "COD" && stop.order.paymentStatus !== "PAID" && !cashCollected)} onClick={() => void onDelivered()} className="inline-flex min-h-11 items-center justify-center gap-2 bg-meathead-red px-4 font-data text-xs font-bold uppercase tracking-[0.08em] hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40"><Check size={16} aria-hidden="true" /> Delivered</button>}
      </div>}
    </div>
  </li>;
}
