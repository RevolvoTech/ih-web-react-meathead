"use client";

import { Crosshair, Route } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { meatheadApi, type AdminRider, type OrderSummary } from "@/lib/meathead-api";

interface DispatchPanelProps {
  token: string;
  orders: OrderSummary[];
  onCreated: () => Promise<void>;
}

const inputClass = "min-h-11 w-full border border-white/20 bg-meathead-black px-3 text-base text-white outline-none focus:border-meathead-red focus:ring-2 focus:ring-meathead-red/30";

export default function DispatchPanel({ token, orders, onCreated }: DispatchPanelProps) {
  const readyOrders = useMemo(() => orders.filter((order) => order.status === "READY_FOR_DISPATCH"), [orders]);
  const [riders, setRiders] = useState<AdminRider[]>([]);
  const [riderId, setRiderId] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("meathead-dispatch-origin");
    if (saved) {
      try {
        const origin = JSON.parse(saved) as { latitude: number; longitude: number };
        setLatitude(String(origin.latitude));
        setLongitude(String(origin.longitude));
      } catch { localStorage.removeItem("meathead-dispatch-origin"); }
    }

    void meatheadApi.adminRiders(token)
      .then((nextRiders) => {
        setRiders(nextRiders);
        setRiderId(nextRiders[0]?.id ?? "");
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Riders could not be loaded."))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    const readyIds = new Set(readyOrders.map((order) => order.id));
    setSelectedIds((current) => current.filter((id) => readyIds.has(id)));
  }, [readyOrders]);

  function toggle(orderId: string) {
    setSelectedIds((current) => current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId]);
  }

  function useCurrentLocation() {
    setError("");
    if (!navigator.geolocation) return setError("Location is not available in this browser.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setLatitude(String(coords.latitude));
      setLongitude(String(coords.longitude));
      localStorage.setItem("meathead-dispatch-origin", JSON.stringify({ latitude: coords.latitude, longitude: coords.longitude }));
      setLocating(false);
    }, () => {
      setError("Could not get the dispatch starting point. Allow location access or enter coordinates.");
      setLocating(false);
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });
  }

  async function createRun() {
    setError("");
    setSuccess("");
    const origin = { latitude: Number(latitude), longitude: Number(longitude) };
    if (!riderId) return setError("Choose a rider.");
    if (!selectedIds.length) return setError("Select at least one ready order.");
    if (!Number.isFinite(origin.latitude) || !Number.isFinite(origin.longitude) || !latitude || !longitude) return setError("Set valid dispatch origin coordinates.");

    setSaving(true);
    try {
      localStorage.setItem("meathead-dispatch-origin", JSON.stringify(origin));
      const run = await meatheadApi.createDeliveryRun(token, { riderId, orderIds: selectedIds, origin });
      setSelectedIds([]);
      setSuccess(`${run.runNumber} assigned with ${run.stops.length} stop${run.stops.length === 1 ? "" : "s"}.`);
      await onCreated();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The delivery run could not be created.");
    } finally {
      setSaving(false);
    }
  }

  return <section className="border border-white/10 bg-meathead-charcoal" aria-labelledby="dispatch-heading">
    <header className="border-b border-white/10 p-4 sm:p-5">
      <p className="font-data text-xs font-bold uppercase tracking-[0.16em] text-meathead-red">Delivery desk</p>
      <h2 id="dispatch-heading" className="mt-1 text-lg font-bold">Build a rider run</h2>
      <p className="mt-2 text-sm text-white/50">Select ready orders. The backend arranges the stop sequence from your dispatch origin.</p>
    </header>

    {!readyOrders.length ? <div className="px-5 py-8"><p className="font-semibold">No orders ready for dispatch</p><p className="mt-1 text-sm text-white/45">They appear here after Chef marks them ready.</p></div> : <div className="grid gap-px bg-white/10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <fieldset className="bg-meathead-charcoal p-4 sm:p-5">
        <legend className="font-data text-xs font-bold uppercase tracking-[0.12em] text-white/50">Ready orders</legend>
        <div className="mt-3 divide-y divide-white/10">
          {readyOrders.map((order) => <label key={order.id} className="flex min-h-14 cursor-pointer items-center gap-3 py-3">
            <input type="checkbox" checked={selectedIds.includes(order.id)} onChange={() => toggle(order.id)} className="h-5 w-5 accent-meathead-red" />
            <span className="min-w-0 flex-1"><strong className="font-data text-sm">{order.orderNumber}</strong><span className="mt-1 block truncate text-xs text-white/45">{order.customerName} · {order.deliveryAddress}</span></span>
          </label>)}
        </div>
      </fieldset>

      <div className="bg-meathead-charcoal p-4 sm:p-5">
        <label className="text-sm font-semibold">Rider<select value={riderId} onChange={(event) => setRiderId(event.target.value)} disabled={loading} className={`${inputClass} mt-2`}><option value="">Select rider</option>{riders.map((rider) => <option key={rider.id} value={rider.id}>{rider.displayName}</option>)}</select></label>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="text-sm font-semibold">Origin latitude<input inputMode="decimal" value={latitude} onChange={(event) => setLatitude(event.target.value)} className={`${inputClass} mt-2`} placeholder="33.6844" /></label>
          <label className="text-sm font-semibold">Origin longitude<input inputMode="decimal" value={longitude} onChange={(event) => setLongitude(event.target.value)} className={`${inputClass} mt-2`} placeholder="73.0479" /></label>
        </div>
        <button type="button" onClick={useCurrentLocation} disabled={locating} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 border border-white/20 px-4 font-data text-xs font-bold uppercase tracking-[0.1em] hover:border-white/50 disabled:opacity-50"><Crosshair size={16} />{locating ? "Finding origin…" : "Use current location"}</button>
        {error && <p role="alert" className="mt-4 text-sm text-red-200">{error}</p>}
        {success && <p role="status" className="mt-4 text-sm text-emerald-300">{success}</p>}
        <button type="button" onClick={() => void createRun()} disabled={saving || loading} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-meathead-red px-5 font-data text-xs font-bold uppercase tracking-[0.1em] hover:bg-red-700 disabled:opacity-50"><Route size={17} />{saving ? "Building run…" : `Assign ${selectedIds.length || ""} order${selectedIds.length === 1 ? "" : "s"}`}</button>
      </div>
    </div>}
  </section>;
}
