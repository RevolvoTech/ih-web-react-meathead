"use client";

import { AlertCircle, Check, Clock3, MapPin, Navigation, RefreshCw, Truck } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import StatusBadge, { humanizeStatus } from "@/components/operations/StatusBadge";
import TrackingMap from "@/components/tracking/TrackingMap";
import { meatheadApi, type TrackingOrder } from "@/lib/meathead-api";

export default function TrackingClient({ orderNumber }: { orderNumber: string }) {
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const value = new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";
    setToken(value);
    if (!value) {
      setError("This tracking link is incomplete. Open the full link from your order confirmation.");
      setLoading(false);
    }
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    setError("");
    try {
      setOrder(await meatheadApi.trackOrder(orderNumber, token));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Tracking could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [orderNumber, token]);

  useEffect(() => {
    if (!token) return;
    void load();
    const timer = window.setInterval(() => void load(), 20_000);
    return () => window.clearInterval(timer);
  }, [load, token]);

  const rider = order?.delivery?.riderLocation ?? null;

  return <main className="tracking-app min-h-dvh bg-meathead-black text-white">
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="font-heading text-2xl uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-meathead-red">MEATHEAD</Link>
        <span className="font-data text-xs font-bold uppercase tracking-[0.16em] text-white/45">Order tracking</span>
      </div>
    </header>

    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="font-data text-xs font-bold uppercase tracking-[0.2em] text-meathead-red">{orderNumber}</p><h1 className="mt-2 text-balance font-heading text-4xl uppercase leading-none sm:text-5xl">Your delivery</h1></div>
        <button type="button" onClick={() => void load()} disabled={!token || loading} className="inline-flex min-h-11 items-center justify-center gap-2 self-start border border-white/20 px-4 font-data text-xs font-bold uppercase tracking-[0.1em] text-white/70 hover:border-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meathead-red disabled:opacity-40"><RefreshCw size={15} aria-hidden="true" className={loading ? "motion-safe:animate-spin" : ""} /> Refresh</button>
      </div>

      {error && <div role="alert" className="mb-6 flex items-start gap-3 rounded-lg border border-meathead-red/40 bg-meathead-red/10 p-4 text-sm leading-6 text-red-100"><AlertCircle className="mt-0.5 shrink-0" size={18} aria-hidden="true" />{error}</div>}
      {loading && !order && <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]" aria-busy="true" aria-label="Loading order tracking"><div className="h-96 rounded-xl bg-meathead-charcoal motion-safe:animate-pulse" /><div className="h-96 rounded-xl bg-meathead-charcoal motion-safe:animate-pulse" /></div>}

      {order && <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="overflow-hidden border border-white/10 bg-meathead-charcoal" aria-labelledby="map-heading">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4 sm:p-5"><h2 id="map-heading" className="font-heading text-2xl uppercase">Delivery map</h2><StatusBadge status={order.status} /></div>
          <TrackingMap destination={order.destination} rider={rider} />
          <div className="p-4 sm:p-5">
            <p className="flex items-start gap-2 text-sm leading-6 text-white/65"><MapPin className="mt-1 shrink-0 text-meathead-red" size={16} aria-hidden="true" />{order.deliveryAddress}</p>
            {rider ? <p aria-live="polite" className="mt-3 flex items-center gap-2 text-xs text-white/45"><Navigation size={14} aria-hidden="true" /> Updated {new Date(rider.recordedAt).toLocaleTimeString("en-PK", { hour: "numeric", minute: "2-digit" })}{rider.stale ? " · may be stale" : " · live"}</p> : <p className="mt-3 text-xs text-white/45">Waiting for rider location.</p>}
          </div>
        </section>

        <aside className="border border-white/10 bg-meathead-charcoal" aria-labelledby="progress-heading">
          <div className="border-b border-white/10 p-4 sm:p-5"><h2 id="progress-heading" className="font-heading text-2xl uppercase">Order timeline</h2></div>
          <div className="p-4 sm:p-5">
            <div className="mb-6 grid grid-cols-2 gap-px bg-white/10"><div className="bg-black/20 p-3"><span className="text-xs text-white/45">Payment</span><strong className="mt-1 block font-data text-sm">{humanizeStatus(order.paymentStatus)}</strong></div><div className="bg-black/20 p-3"><span className="text-xs text-white/45">Stop</span><strong className="mt-1 block font-data text-sm">{order.delivery?.stopSequence ? `#${order.delivery.stopSequence}` : "Pending"}</strong></div></div>
            <ol className="space-y-0">
              {order.statusEvents.map((event, index) => {
                const last = index === order.statusEvents.length - 1;
                return <li key={`${event.toStatus}-${event.createdAt}`} className="grid grid-cols-[28px_1fr] gap-3"><div className="flex flex-col items-center"><span className={`flex h-7 w-7 items-center justify-center rounded-full border ${last ? "border-meathead-red bg-meathead-red text-white" : "border-white/20 bg-black text-white/55"}`}>{last ? <Truck size={14} aria-hidden="true" /> : <Check size={13} aria-hidden="true" />}</span>{index < order.statusEvents.length - 1 && <span className="h-10 w-px bg-white/15" aria-hidden="true" />}</div><div className="pt-1"><strong className="text-sm">{humanizeStatus(event.toStatus)}</strong><time className="mt-1 block text-xs text-white/40" dateTime={event.createdAt}>{new Date(event.createdAt).toLocaleString("en-PK", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</time></div></li>;
              })}
            </ol>
            {!order.statusEvents.length && <div className="py-8 text-center"><Clock3 className="mx-auto text-white/25" aria-hidden="true" /><p className="mt-3 text-sm text-white/50">Waiting for the first order update.</p></div>}
          </div>
        </aside>
      </div>}
    </div>
  </main>;
}
