"use client";

import { Check, ChefHat, Clock3, Flame, PackageCheck, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import AuthGate from "@/components/operations/AuthGate";
import InventoryPanel from "@/components/operations/InventoryPanel";
import OperationsShell from "@/components/operations/OperationsShell";
import StatusBadge from "@/components/operations/StatusBadge";
import { meatheadApi, type InventoryItem, type OperationsProfile, type OrderStatus, type OrderSummary } from "@/lib/meathead-api";

const kitchenStatuses: OrderStatus[] = ["PLACED", "CONFIRMED", "PREPARING", "READY_FOR_DISPATCH"];
const nextStep: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  PLACED: { status: "CONFIRMED", label: "Accept order" },
  CONFIRMED: { status: "PREPARING", label: "Start preparing" },
  PREPARING: { status: "READY_FOR_DISPATCH", label: "Mark ready" },
};

export default function ChefPage() {
  return <AuthGate allowedRoles={["ADMIN", "CHEF"]} workspace="Chef">{({ session, profile, signOut }) => <ChefWorkspace token={session.access_token} profile={profile} signOut={signOut} />}</AuthGate>;
}

function ChefWorkspace({ token, profile, signOut }: { token: string; profile: OperationsProfile; signOut: () => Promise<void> }) {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyOrderId, setBusyOrderId] = useState("");
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError("");
    try {
      const [nextOrders, nextInventory] = await Promise.all([
        meatheadApi.adminOrders(token),
        meatheadApi.adminInventory(token),
      ]);
      setOrders(nextOrders.filter((order) => kitchenStatuses.includes(order.status)));
      setInventory(nextInventory);
      setLastUpdated(new Date());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Kitchen data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(true), 15_000);
    return () => window.clearInterval(interval);
  }, [load]);

  async function moveOrder(order: OrderSummary, nextStatus: OrderStatus) {
    setBusyOrderId(order.id);
    setError("");
    try {
      await meatheadApi.updateOrderStatus(token, order.id, nextStatus);
      await load(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The order could not be updated.");
    } finally {
      setBusyOrderId("");
    }
  }

  async function refresh() {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  }

  const counts = useMemo(() => Object.fromEntries(kitchenStatuses.map((status) => [status, orders.filter((order) => order.status === status).length])) as Record<OrderStatus, number>, [orders]);
  const item = inventory[0];
  const stock = item?.batches.filter((batch) => batch.status === "ACTIVE").reduce((sum, batch) => sum + batch.totalQuantity - batch.reservedQuantity - batch.soldQuantity, 0) ?? 0;

  return <OperationsShell active="chef" profile={profile} title="Kitchen queue" onSignOut={signOut}>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <p aria-live="polite" className="text-sm text-white/55">Auto-refreshes every 15 seconds{lastUpdated ? ` · Updated ${lastUpdated.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}` : ""}</p>
      <button type="button" onClick={() => void refresh()} disabled={loading || refreshing} className="inline-flex min-h-11 items-center gap-2 border border-white/20 px-4 font-data text-xs font-bold uppercase tracking-[0.1em] text-white/75 hover:border-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meathead-red disabled:opacity-50"><RefreshCw size={16} aria-hidden="true" className={loading || refreshing ? "motion-safe:animate-spin" : ""} /> Refresh</button>
    </div>

    {error && <div role="alert" className="mb-5 rounded-lg border-l-2 border-meathead-red bg-meathead-red/10 px-4 py-3 text-sm text-red-100">{error}</div>}

    <section aria-label="Kitchen summary" className="grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 lg:grid-cols-4">
      <KitchenMetric icon={<Clock3 aria-hidden="true" />} label="New" value={String(counts.PLACED ?? 0)} />
      <KitchenMetric icon={<ChefHat aria-hidden="true" />} label="Confirmed" value={String(counts.CONFIRMED ?? 0)} />
      <KitchenMetric icon={<Flame aria-hidden="true" />} label="Preparing" value={String(counts.PREPARING ?? 0)} />
      <KitchenMetric icon={<PackageCheck aria-hidden="true" />} label="Patties available" value={String(stock)} />
    </section>

    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.8fr)] xl:items-start">
      <section className="border border-white/10 bg-meathead-charcoal" aria-labelledby="queue-heading">
        <header className="border-b border-white/10 p-4 sm:p-5"><h2 id="queue-heading" className="font-heading text-2xl uppercase">Orders to prepare</h2></header>
        {loading && !orders.length ? <div className="space-y-px bg-white/10" aria-busy="true" aria-label="Loading kitchen orders">{[0, 1, 2].map((row) => <div key={row} className="h-32 bg-meathead-charcoal motion-safe:animate-pulse" />)}</div> : null}
        {!loading && !orders.length ? <div className="px-5 py-14 text-center"><Check className="mx-auto text-emerald-400" size={32} aria-hidden="true" /><h3 className="mt-4 font-heading text-2xl uppercase">Kitchen clear</h3></div> : null}
        {orders.length ? <ol className="divide-y divide-white/10">{orders.map((order) => {
          const action = nextStep[order.status];
          const patties = order.items.reduce((total, orderItem) => {
            const recipe = item?.products.find((product) => product.name === orderItem.productName);
            return total + orderItem.quantity * (recipe?.inventoryUnitsPerItem ?? 0);
          }, 0);
          return <li key={order.id} className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"><strong className="font-data text-sm">{order.orderNumber}</strong><StatusBadge status={order.status} /></div>
              <p className="mt-3 font-semibold">{order.items.map((orderItem) => `${orderItem.quantity}× ${orderItem.productName}`).join(" · ")}</p>
              <p className="mt-1 text-sm text-white/50">{patties || "—"} patties · {order.customerName}</p>
            </div>
            {action ? <button type="button" disabled={busyOrderId === order.id} onClick={() => void moveOrder(order, action.status)} className="min-h-11 bg-meathead-red px-5 font-data text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-50">{busyOrderId === order.id ? "Updating…" : action.label}</button> : <p className="border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200">Waiting for rider pickup</p>}
          </li>;
        })}</ol> : null}
      </section>

      <InventoryPanel items={inventory} />
    </div>
  </OperationsShell>;
}

function KitchenMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="bg-meathead-charcoal p-4 sm:p-5"><div className="flex items-center gap-2 text-white/50 [&>svg]:h-4 [&>svg]:w-4"><span className="font-data text-[11px] font-bold uppercase tracking-[0.12em]">{label}</span>{icon}</div><strong className="mt-4 block font-data text-2xl">{value}</strong></div>;
}
