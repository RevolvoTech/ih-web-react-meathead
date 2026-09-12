"use client";

import { CircleDollarSign, Fuel, PackageOpen, Plus, RefreshCw, ShoppingBag, WalletCards } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import AuthGate from "@/components/operations/AuthGate";
import InventoryPanel from "@/components/operations/InventoryPanel";
import OperationsShell from "@/components/operations/OperationsShell";
import StatusBadge, { humanizeStatus } from "@/components/operations/StatusBadge";
import {
  meatheadApi,
  type AdminDashboard,
  type AnalyticsSummary,
  type Expense,
  type ExpenseCategory,
  type InventoryItem,
  type OperationsProfile,
  type OrderSummary,
} from "@/lib/meathead-api";

const expenseLabels: Record<ExpenseCategory, string> = {
  MEAT: "Meat",
  PACKAGING: "Packaging",
  RIDER_FUEL: "Rider fuel",
};

const formatMoney = (paisa = 0) => new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
}).format(paisa / 100);

export default function OperationsPage() {
  return <AuthGate allowedRoles={["ADMIN"]} workspace="Admin">{({ session, profile, signOut }) => <OperationsDashboard token={session.access_token} profile={profile} signOut={signOut} />}</AuthGate>;
}

function OperationsDashboard({ token, profile, signOut }: { token: string; profile: OperationsProfile; signOut: () => Promise<void> }) {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    try {
      const [nextDashboard, nextOrders, nextAnalytics, nextExpenses, nextInventory] = await Promise.all([
        meatheadApi.adminDashboard(token),
        meatheadApi.adminOrders(token),
        meatheadApi.adminAnalytics(token, from, now.toISOString()),
        meatheadApi.adminExpenses(token),
        meatheadApi.adminInventory(token),
      ]);
      setDashboard(nextDashboard);
      setOrders(nextOrders);
      setAnalytics(nextAnalytics);
      setExpenses(nextExpenses);
      setInventory(nextInventory);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Operations data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  const openOrders = useMemo(() => dashboard?.statusCounts.reduce((total, row) =>
    ["DELIVERED", "CANCELLED", "DELIVERY_FAILED"].includes(row.status) ? total : total + row._count._all, 0) ?? 0, [dashboard]);
  const inventoryAvailable = Math.max(0,
    (dashboard?.inventory.totalQuantity ?? 0) -
    (dashboard?.inventory.reservedQuantity ?? 0) -
    (dashboard?.inventory.soldQuantity ?? 0),
  );

  return <OperationsShell active="admin" profile={profile} title="Today at a glance" onSignOut={signOut}>
    <div className="mb-5 flex flex-wrap items-center justify-end gap-3">
      <div className="flex gap-2">
        <button type="button" onClick={() => setFormOpen((open) => !open)} className="inline-flex min-h-11 items-center gap-2 bg-meathead-red px-4 font-data text-xs font-bold uppercase tracking-[0.1em] transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><Plus size={16} aria-hidden="true" /> Add expense</button>
        <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex min-h-11 items-center gap-2 border border-white/20 px-4 font-data text-xs font-bold uppercase tracking-[0.1em] text-white/75 transition-colors hover:border-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meathead-red disabled:opacity-50"><RefreshCw size={16} aria-hidden="true" className={loading ? "motion-safe:animate-spin" : ""} /> Refresh</button>
      </div>
    </div>

    {error && <div role="alert" className="mb-5 rounded-lg border-l-2 border-meathead-red bg-meathead-red/10 px-4 py-3 text-sm text-red-100">{error}</div>}
    {formOpen && <ExpenseForm token={token} onSaved={async () => { setFormOpen(false); await load(); }} />}

    {loading && !dashboard ? <DashboardSkeleton /> : <>
      <section aria-label="Operations summary" className="grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 lg:grid-cols-4">
        <Metric icon={<ShoppingBag aria-hidden="true" />} label="Open orders" value={String(openOrders)} />
        <Metric icon={<PackageOpen aria-hidden="true" />} label="Patties available" value={String(inventoryAvailable)} />
        <Metric icon={<Fuel aria-hidden="true" />} label="Active runs" value={String(dashboard?.activeRuns ?? 0)} />
        <Metric icon={<CircleDollarSign aria-hidden="true" />} label="Month expenses" value={formatMoney(analytics?.expenseTotalPaisa)} detail={`${analytics?.deliveredOrders ?? 0} delivered`} />
      </section>

      <div className="mt-6">
        <InventoryPanel items={inventory} token={token} canManage onChanged={load} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
        <section className="border border-white/10 bg-meathead-charcoal" aria-labelledby="latest-orders-heading">
          <div className="flex items-end justify-between border-b border-white/10 px-4 py-4 sm:px-5">
            <h2 id="latest-orders-heading" className="font-heading text-2xl uppercase">Latest orders</h2>
            <span className="text-xs text-white/45">Showing {orders.length}</span>
          </div>
          {orders.length ? <ul className="divide-y divide-white/10">
            {orders.map((order) => <li key={order.id} className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto] sm:px-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><strong className="font-data text-sm">{order.orderNumber}</strong><StatusBadge status={order.status} /></div>
                <p className="mt-2 font-semibold">{order.customerName} <span className="font-normal text-white/45">· {order.customerPhone}</span></p>
                <p className="mt-1 truncate text-sm text-white/55" title={order.deliveryAddress}>{order.deliveryAddress}</p>
                <p className="mt-1 text-xs text-white/40">{order.items.map((item) => `${item.quantity}× ${item.productName}`).join(" · ")}</p>
              </div>
              <div className="sm:text-right"><strong className="font-data text-sm">{formatMoney(order.totalAmountPaisa)}</strong><p className="mt-2 text-xs text-white/45">{humanizeStatus(order.paymentStatus)} · {order.paymentMethod}</p></div>
            </li>)}
          </ul> : <EmptyState title="No orders yet" />}
        </section>

        <div className="space-y-6">
          <section className="border border-white/10 bg-meathead-charcoal" aria-labelledby="expenses-heading">
            <div className="border-b border-white/10 px-4 py-4"><h2 id="expenses-heading" className="font-heading text-2xl uppercase">This month</h2></div>
            <div className="divide-y divide-white/10">
              {(Object.keys(expenseLabels) as ExpenseCategory[]).map((category) => <div key={category} className="flex items-center justify-between gap-4 px-4 py-3"><span className="text-sm text-white/60">{expenseLabels[category]}</span><strong className="font-data text-sm">{formatMoney(analytics?.expensesByCategory[category] ?? 0)}</strong></div>)}
              <div className="flex items-center justify-between gap-4 bg-black/20 px-4 py-4"><span className="text-sm font-semibold">Operating contribution</span><strong className={`font-data text-sm ${(analytics?.operatingContributionPaisa ?? 0) < 0 ? "text-red-300" : "text-emerald-300"}`}>{formatMoney(analytics?.operatingContributionPaisa ?? 0)}</strong></div>
            </div>
          </section>

          <section className="border border-white/10 bg-meathead-charcoal" aria-labelledby="recent-expenses-heading">
            <div className="border-b border-white/10 px-4 py-4"><h2 id="recent-expenses-heading" className="font-heading text-2xl uppercase">Recent expenses</h2></div>
            {expenses.length ? <ul className="divide-y divide-white/10">{expenses.slice(0, 6).map((expense) => <li key={expense.id} className="flex items-start justify-between gap-4 px-4 py-3"><div><p className="text-sm font-semibold">{expenseLabels[expense.category as ExpenseCategory] ?? "Other"}</p><p className="mt-1 text-xs text-white/45">{expense.vendor || expense.note || new Date(expense.incurredAt).toLocaleDateString("en-PK")}</p></div><strong className="font-data text-sm tabular-nums">{formatMoney(expense.amountPaisa)}</strong></li>)}</ul> : <EmptyState title="No expenses" compact />}
          </section>
        </div>
      </div>
    </>}
  </OperationsShell>;
}

function Metric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail?: string }) {
  return <div className="bg-meathead-charcoal p-4 sm:p-5"><div className="flex items-center gap-2 text-white/50 [&>svg]:h-4 [&>svg]:w-4"><span className="font-data text-[11px] font-bold uppercase tracking-[0.12em]">{label}</span>{icon}</div><strong className="mt-4 block font-data text-xl tabular-nums sm:text-2xl">{value}</strong>{detail && <span className="mt-1 block text-xs text-white/40">{detail}</span>}</div>;
}

function EmptyState({ title, compact = false }: { title: string; compact?: boolean }) {
  return <div className={compact ? "px-4 py-6" : "px-5 py-12 text-center"}><WalletCards className={compact ? "mb-3 text-white/25" : "mx-auto mb-4 text-white/25"} aria-hidden="true" /><p className="font-semibold">{title}</p></div>;
}

function DashboardSkeleton() {
  return <div className="space-y-6" aria-busy="true" aria-label="Loading operations data"><div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/10 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 bg-meathead-charcoal motion-safe:animate-pulse" />)}</div><div className="h-80 rounded-xl border border-white/10 bg-meathead-charcoal motion-safe:animate-pulse" /></div>;
}

function ExpenseForm({ token, onSaved }: { token: string; onSaved: () => Promise<void> }) {
  const [category, setCategory] = useState<ExpenseCategory>("MEAT");
  const [amount, setAmount] = useState("");
  const [vendor, setVendor] = useState("");
  const [note, setNote] = useState("");
  const [incurredAt, setIncurredAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const amountPaisa = Math.round(Number(amount) * 100);
      if (!Number.isFinite(amountPaisa) || amountPaisa < 1) throw new Error("Enter an expense amount greater than zero.");
      await meatheadApi.createExpense(token, {
        category,
        amountPaisa,
        incurredAt: new Date(`${incurredAt}T12:00:00+05:00`).toISOString(),
        ...(vendor.trim() ? { vendor: vendor.trim() } : {}),
        ...(note.trim() ? { note: note.trim() } : {}),
      });
      await onSaved();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The expense could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "min-h-11 w-full border border-white/20 bg-meathead-black px-3 text-base text-white outline-none focus:border-meathead-red focus:ring-2 focus:ring-meathead-red/30";
  return <section className="mb-6 border border-meathead-red/35 bg-meathead-charcoal p-4 sm:p-5" aria-labelledby="new-expense-heading">
    <h2 id="new-expense-heading" className="font-heading text-2xl uppercase">Log an expense</h2>
    <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <label className="text-sm font-semibold">Category<select value={category} onChange={(event) => setCategory(event.target.value as ExpenseCategory)} className={`${inputClass} mt-2`}><option value="MEAT">Meat</option><option value="PACKAGING">Packaging</option><option value="RIDER_FUEL">Rider fuel</option></select></label>
      <label className="text-sm font-semibold">Amount (PKR)<input required inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} className={`${inputClass} mt-2`} placeholder="0" /></label>
      <label className="text-sm font-semibold">Date<input required type="date" value={incurredAt} onChange={(event) => setIncurredAt(event.target.value)} className={`${inputClass} mt-2 [color-scheme:dark]`} /></label>
      <label className="text-sm font-semibold">Vendor <span className="font-normal text-white/40">optional</span><input value={vendor} onChange={(event) => setVendor(event.target.value)} className={`${inputClass} mt-2`} /></label>
      <label className="text-sm font-semibold">Note <span className="font-normal text-white/40">optional</span><input value={note} onChange={(event) => setNote(event.target.value)} className={`${inputClass} mt-2`} /></label>
      {error && <p role="alert" className="text-sm text-red-200 sm:col-span-2 lg:col-span-4">{error}</p>}
      <button type="submit" disabled={saving} className="min-h-11 bg-meathead-red px-5 font-data text-xs font-bold uppercase tracking-[0.1em] hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50 lg:col-start-5">{saving ? "Saving…" : "Save expense"}</button>
    </form>
  </section>;
}
