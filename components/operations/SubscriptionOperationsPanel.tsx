"use client";

import { CalendarDays, Check, CircleDollarSign, Clock3, LoaderCircle, Pause, Play, Plus, RotateCcw, Users } from "lucide-react";
import { type FormEvent, useState } from "react";
import LocationPicker, { type DeliveryPoint } from "@/components/order/LocationPicker";
import {
  meatheadApi,
  type Subscription,
  type SubscriptionOverview,
  type SubscriptionPaymentMethod,
  type SubscriptionPlan,
} from "@/lib/meathead-api";

const money = (paisa: number) => new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(paisa / 100);
function dateOnly(value = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(value);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
const inputClass = "mt-2 min-h-11 w-full border border-white/20 bg-meathead-black px-3 text-base text-white outline-none focus:border-meathead-red focus:ring-2 focus:ring-meathead-red/30";

interface Props {
  token: string;
  subscriptions: Subscription[];
  overview: SubscriptionOverview | null;
  loading?: boolean;
  onChanged: () => Promise<void>;
  onOrdersGenerated: () => Promise<void>;
}

export default function SubscriptionOperationsPanel({ token, subscriptions, overview, loading = false, onChanged, onOrdersGenerated }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");

  async function generateToday() {
    setGenerating(true);
    setMessage("");
    try {
      const result = await meatheadApi.generateSubscriptionOrders(token, overview?.date ?? dateOnly());
      setMessage(result.failed.length
        ? `${result.generated} created · ${result.failed.length} failed: ${result.failed[0]?.error}`
        : `${result.generated} subscription ${result.generated === 1 ? "order" : "orders"} ready for the kitchen.`);
      await onOrdersGenerated();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Orders could not be generated.");
    } finally {
      setGenerating(false);
    }
  }

  return <div className="space-y-6">
    <section className="overflow-hidden border border-white/10 bg-meathead-charcoal" aria-labelledby="today-protocol-heading">
      <header className="grid gap-5 border-b border-white/10 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="font-data text-xs font-bold uppercase tracking-[0.16em] text-meathead-red">Daily production contract</p>
          <h2 id="today-protocol-heading" className="mt-1 text-balance font-heading text-3xl uppercase">Today&apos;s protocol</h2>
          <p className="mt-2 text-sm text-white/45">{overview?.date ? new Date(`${overview.date}T12:00:00`).toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long" }) : "Loading today"}</p>
        </div>
        <button type="button" onClick={() => void generateToday()} disabled={generating || !overview?.today.ungeneratedOrders} className="inline-flex min-h-11 items-center justify-center gap-2 bg-meathead-red px-4 font-data text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40">
          {generating ? <LoaderCircle className="motion-safe:animate-spin" size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          {generating ? "Generating…" : overview?.today.ungeneratedOrders ? `Generate ${overview.today.ungeneratedOrders} orders` : "Orders generated"}
        </button>
      </header>

      <div className="grid grid-cols-2 gap-px bg-white/10 lg:grid-cols-5">
        <ProtocolMetric label="Patties" value={String(overview?.today.patties ?? 0)} detail={`${(overview?.today.kilograms ?? 0).toFixed(2)} kg`} focal />
        <ProtocolMetric label="Stops" value={String(overview?.today.deliveries ?? 0)} detail={`${overview?.today.generatedOrders ?? 0} generated`} />
        <ProtocolMetric label="2-a-day" value={String(overview?.today.byPlan.DAILY_2 ?? 0)} detail="subscribers" />
        <ProtocolMetric label="4-a-day" value={String(overview?.today.byPlan.DAILY_4 ?? 0)} detail="subscribers" />
        <ProtocolMetric label="Skipped" value={String(overview?.today.skipped ?? 0)} detail="today" />
      </div>

      {!!overview?.today.byWindow.length && <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 px-4 py-3 text-xs text-white/50 sm:px-5">
        {overview.today.byWindow.map((group) => <span key={group.window}><strong className="text-white">{group.window}</strong> · {group.deliveries} stops · {group.patties} patties</span>)}
      </div>}
      {message && <p role="status" className="border-t border-white/10 px-4 py-3 text-sm text-white/65 sm:px-5">{message}</p>}
    </section>

    <section className="border border-white/10 bg-meathead-charcoal" aria-labelledby="subscription-finance-heading">
      <header className="border-b border-white/10 p-4 sm:p-5">
        <p className="font-data text-xs font-bold uppercase tracking-[0.16em] text-meathead-red">Subscription economics</p>
        <h2 id="subscription-finance-heading" className="mt-1 font-heading text-2xl uppercase">Committed cash and work</h2>
      </header>
      <div className="grid grid-cols-2 gap-px bg-white/10 lg:grid-cols-4">
        <ProtocolMetric label="Active" value={String(overview?.activeSubscribers ?? 0)} detail={`${overview?.pausedSubscribers ?? 0} paused`} icon={<Users />} />
        <ProtocolMetric label="Monthly revenue" value={money(overview?.monthlyRecurringRevenuePaisa ?? 0)} detail={`${overview?.renewalsDueNextSevenDays ?? 0} renewals in 7 days`} icon={<RotateCcw />} />
        <ProtocolMetric label="Expected contribution" value={money(overview?.projectedContributionPaisa ?? 0)} detail="before fixed OPEX" icon={<CircleDollarSign />} />
        <ProtocolMetric label="Fulfilment reserve" value={money(overview?.fulfillmentLiabilityPaisa ?? 0)} detail="cash still owed as deliveries" icon={<Clock3 />} />
      </div>
      <div className="grid gap-px border-t border-white/10 bg-white/10 sm:grid-cols-3">
        <ProtocolMetric label="Collected this month" value={money(overview?.collectedThisMonthPaisa ?? 0)} />
        <ProtocolMetric label="Next 7 days" value={`${overview?.inventory.committedNextSevenDays ?? 0} patties`} detail={`${(overview?.inventory.requiredKilogramsNextSevenDays ?? 0).toFixed(2)} kg required`} />
        <ProtocolMetric label="Stock runway" value={overview?.inventory.daysRemaining === null || overview?.inventory.daysRemaining === undefined ? "No demand yet" : `${overview.inventory.daysRemaining} days`} detail={`${overview?.inventory.availablePatties ?? 0} patties available`} />
      </div>
    </section>

    <section className="border border-white/10 bg-meathead-charcoal" aria-labelledby="subscribers-heading">
      <header className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
        <div>
          <p className="font-data text-xs font-bold uppercase tracking-[0.16em] text-meathead-red">Recurring customers</p>
          <h2 id="subscribers-heading" className="mt-1 font-heading text-2xl uppercase">Subscribers</h2>
        </div>
        <button type="button" onClick={() => setFormOpen((open) => !open)} className="inline-flex min-h-11 items-center justify-center gap-2 border border-white/20 px-4 font-data text-xs font-bold uppercase tracking-[0.1em] text-white/80 transition-colors hover:border-white/45 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meathead-red">
          <Plus size={16} aria-hidden="true" /> {formOpen ? "Close form" : "Add subscriber"}
        </button>
      </header>
      {formOpen && <SubscriberForm token={token} onSaved={async () => { setFormOpen(false); await onChanged(); }} />}
      {loading && !subscriptions.length ? <div className="h-40 bg-white/[0.025] motion-safe:animate-pulse" aria-label="Loading subscribers" /> : subscriptions.length ? <ul className="divide-y divide-white/10">
        {subscriptions.map((subscription) => <SubscriberRow key={subscription.id} subscription={subscription} token={token} onChanged={onChanged} />)}
      </ul> : <div className="px-5 py-10 text-center"><Users className="mx-auto text-white/25" aria-hidden="true" /><p className="mt-3 font-semibold">No subscribers yet</p><p className="mt-1 text-sm text-white/40">Convert a waitlist lead after receiving the first payment.</p></div>}
    </section>
  </div>;
}

function ProtocolMetric({ label, value, detail, focal = false, icon }: { label: string; value: string; detail?: string; focal?: boolean; icon?: React.ReactNode }) {
  return <div className={`${focal ? "bg-meathead-red/10" : "bg-meathead-charcoal"} min-w-0 p-4 sm:p-5`}>
    <div className="flex items-center gap-2 font-data text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">{icon && <span className="[&>svg]:size-4 [&>svg]:text-meathead-red">{icon}</span>}{label}</div>
    <strong className={`${focal ? "text-meathead-red" : "text-white"} mt-3 block truncate font-data text-xl font-bold tabular-nums sm:text-2xl`}>{value}</strong>
    {detail && <span className="mt-1 block text-xs text-white/40">{detail}</span>}
  </div>;
}

function SubscriberForm({ token, onSaved }: { token: string; onSaved: () => Promise<void> }) {
  const [plan, setPlan] = useState<SubscriptionPlan>("DAILY_2");
  const [point, setPoint] = useState<DeliveryPoint | null>(null);
  const [paid, setPaid] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!point) return setError("Set the delivery pin before saving the subscriber.");
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await meatheadApi.createSubscription(token, {
        customerName: String(form.get("name") ?? "").trim(),
        customerPhone: String(form.get("phone") ?? "").trim(),
        customerEmail: String(form.get("email") ?? "").trim() || undefined,
        plan,
        startDate: String(form.get("startDate") ?? dateOnly()),
        deliveryAddress: String(form.get("address") ?? "").trim(),
        area: String(form.get("area") ?? "").trim() || undefined,
        latitude: point.latitude,
        longitude: point.longitude,
        deliveryWindow: String(form.get("window") ?? "").trim(),
        deliveryNotes: String(form.get("notes") ?? "").trim() || undefined,
        ...(paid ? { payment: { method: String(form.get("paymentMethod")) as SubscriptionPaymentMethod, reference: String(form.get("reference") ?? "").trim() || undefined } } : {}),
      });
      await onSaved();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Subscriber could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return <form onSubmit={submit} className="border-b border-white/10 bg-black/20 p-4 sm:p-5">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Name"><input required name="name" autoComplete="name" className={inputClass} /></Field>
      <Field label="WhatsApp"><input required name="phone" type="tel" autoComplete="tel" className={inputClass} placeholder="03XX XXXXXXX" /></Field>
      <Field label="Email" optional><input name="email" type="email" autoComplete="email" className={inputClass} /></Field>
      <Field label="Start date"><input required name="startDate" type="date" defaultValue={dateOnly()} className={`${inputClass} [color-scheme:dark]`} /></Field>
    </div>
    <fieldset className="mt-5"><legend className="text-sm font-semibold">Plan</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">
      {(["DAILY_2", "DAILY_4"] as const).map((value) => <label key={value} className={`flex min-h-14 cursor-pointer items-center justify-between border px-4 ${plan === value ? "border-meathead-red bg-meathead-red/10" : "border-white/15 bg-meathead-black"}`}><span><strong className="font-data text-sm">{value === "DAILY_2" ? "2 patties daily" : "4 patties daily"}</strong><span className="mt-1 block text-xs text-white/40">{value === "DAILY_2" ? "PKR 26,500/month" : "PKR 49,000/month"}</span></span><input type="radio" name="plan" value={value} checked={plan === value} onChange={() => setPlan(value)} className="size-4 accent-meathead-red" /></label>)}
    </div></fieldset>
    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="Area"><input name="area" className={inputClass} placeholder="F-7" /></Field>
      <Field label="Delivery window"><input required name="window" className={inputClass} placeholder="6:00–8:00 PM" /></Field>
      <Field label="Delivery notes" optional><input name="notes" className={inputClass} placeholder="Gate or landmark" /></Field>
      <div className="sm:col-span-2 lg:col-span-3"><Field label="Full delivery address"><textarea required name="address" rows={2} className={`${inputClass} py-3`} /></Field></div>
    </div>
    <div className="mt-5"><LocationPicker value={point} onChange={setPoint} /></div>
    <div className="mt-5 grid gap-4 sm:grid-cols-[auto_1fr_1fr] sm:items-end">
      <label className="flex min-h-11 items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={paid} onChange={(event) => setPaid(event.target.checked)} className="size-5 accent-meathead-red" /> First month paid</label>
      {paid && <><Field label="Payment method"><select name="paymentMethod" defaultValue="BANK_TRANSFER" className={inputClass}><PaymentOptions /></select></Field><Field label="Reference" optional><input name="reference" className={inputClass} /></Field></>}
    </div>
    {error && <p role="alert" className="mt-4 border-l-2 border-meathead-red bg-meathead-red/10 px-3 py-2 text-sm text-red-100">{error}</p>}
    <button type="submit" disabled={saving} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 bg-meathead-red px-5 font-data text-xs font-bold uppercase tracking-[0.1em] hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50">{saving && <LoaderCircle className="motion-safe:animate-spin" size={16} />}{saving ? "Saving…" : "Create subscriber"}</button>
  </form>;
}

function SubscriberRow({ subscription, token, onChanged }: { subscription: Subscription; token: string; onChanged: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState("");
  const expired = new Date(subscription.currentPeriodEnd) <= new Date(`${dateOnly()}T00:00:00Z`);
  const status = expired && subscription.status === "ACTIVE" ? "OVERDUE" : subscription.status;

  async function act(action: () => Promise<unknown>) {
    setBusy(true); setError("");
    try { await action(); await onChanged(); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Could not update subscriber."); }
    finally { setBusy(false); }
  }

  return <li className="p-4 sm:p-5">
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2"><strong className="font-data text-sm">{subscription.customerName}</strong><StatusChip status={status} /><span className="font-data text-[10px] font-bold uppercase tracking-[0.12em] text-meathead-red">{subscription.dailyPattyQuantity}/day</span></div>
        <p className="mt-2 text-sm text-white/55">{subscription.customerPhone} · {subscription.area || subscription.deliveryAddress}</p>
        <p className="mt-1 text-xs text-white/40">{subscription.deliveryWindow} · renews {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })} · {money(subscription.monthlyPricePaisa)}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy || status === "CANCELLED"} onClick={() => void act(() => meatheadApi.updateSubscription(token, subscription.id, { status: status === "PAUSED" ? "ACTIVE" : "PAUSED" }))} className="inline-flex min-h-11 items-center gap-2 border border-white/20 px-3 font-data text-xs font-bold uppercase tracking-[0.08em] hover:border-white/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meathead-red disabled:opacity-40">{status === "PAUSED" ? <Play size={14} /> : <Pause size={14} />}{status === "PAUSED" ? "Resume" : "Pause"}</button>
        <button type="button" onClick={() => setExpanded((value) => !value)} className="min-h-11 border border-white/20 px-3 font-data text-xs font-bold uppercase tracking-[0.08em] hover:border-white/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meathead-red">Manage</button>
      </div>
    </div>
    {error && <p role="alert" className="mt-3 text-sm text-red-200">{error}</p>}
    {expanded && <SubscriberActions subscription={subscription} busy={busy} onRenew={(method, reference) => act(() => meatheadApi.recordSubscriptionPayment(token, subscription.id, { method, reference }))} onSkip={(serviceDate, note) => act(() => meatheadApi.addSubscriptionSkip(token, subscription.id, { serviceDate, note }))} onCancel={() => act(() => meatheadApi.updateSubscription(token, subscription.id, { status: "CANCELLED" }))} />}
  </li>;
}

function SubscriberActions({ subscription, busy, onRenew, onSkip, onCancel }: { subscription: Subscription; busy: boolean; onRenew: (method: SubscriptionPaymentMethod, reference?: string) => Promise<void>; onSkip: (date: string, note?: string) => Promise<void>; onCancel: () => Promise<void> }) {
  const [method, setMethod] = useState<SubscriptionPaymentMethod>("BANK_TRANSFER");
  const [reference, setReference] = useState("");
  const [skipDate, setSkipDate] = useState(dateOnly(new Date(Date.now() + 86_400_000)));
  const [skipNote, setSkipNote] = useState("");
  return <div className="mt-4 grid gap-4 border-t border-white/10 pt-4 lg:grid-cols-2">
    <div className="bg-black/20 p-4"><h3 className="font-data text-xs font-bold uppercase tracking-[0.12em]">Record renewal</h3><div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><Field label="Method"><select value={method} onChange={(event) => setMethod(event.target.value as SubscriptionPaymentMethod)} className={inputClass}><PaymentOptions /></select></Field><Field label="Reference" optional><input value={reference} onChange={(event) => setReference(event.target.value)} className={inputClass} /></Field><button type="button" disabled={busy} onClick={() => void onRenew(method, reference || undefined)} className="min-h-11 bg-meathead-red px-4 font-data text-xs font-bold uppercase tracking-[0.08em] disabled:opacity-50"><Check size={15} className="mr-2 inline" />Paid</button></div></div>
    <div className="bg-black/20 p-4"><h3 className="font-data text-xs font-bold uppercase tracking-[0.12em]">Skip a delivery</h3><div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><Field label="Date"><input type="date" min={dateOnly()} value={skipDate} onChange={(event) => setSkipDate(event.target.value)} className={`${inputClass} [color-scheme:dark]`} /></Field><Field label="Reason" optional><input value={skipNote} onChange={(event) => setSkipNote(event.target.value)} className={inputClass} /></Field><button type="button" disabled={busy} onClick={() => void onSkip(skipDate, skipNote || undefined)} className="min-h-11 border border-white/20 px-4 font-data text-xs font-bold uppercase tracking-[0.08em] disabled:opacity-50"><CalendarDays size={15} className="mr-2 inline" />Skip</button></div></div>
    <div className="flex flex-wrap items-center justify-between gap-3 lg:col-span-2"><div className="flex flex-wrap gap-2 text-xs text-white/45">{subscription.skips.length ? subscription.skips.map((skip) => <span key={skip.id} className="border border-white/10 px-2 py-1">Skip {new Date(skip.serviceDate).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}</span>) : <span>No upcoming skips.</span>}</div>{subscription.status !== "CANCELLED" && <button type="button" disabled={busy} onClick={() => void onCancel()} className="min-h-11 px-3 text-xs font-semibold text-red-300 hover:text-red-200 disabled:opacity-50">Cancel subscription</button>}</div>
  </div>;
}

function PaymentOptions() { return <><option value="BANK_TRANSFER">Bank transfer / Raast</option><option value="EASYPAISA">Easypaisa</option><option value="JAZZCASH">JazzCash</option><option value="CASH">Cash</option><option value="OTHER">Other</option></>; }
function Field({ label, optional = false, children }: { label: string; optional?: boolean; children: React.ReactNode }) { return <label className="block text-sm font-semibold">{label}{optional && <span className="ml-1 font-normal text-white/40">(optional)</span>}{children}</label>; }
function StatusChip({ status }: { status: string }) { const tone = status === "ACTIVE" ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200" : status === "OVERDUE" ? "border-amber-400/25 bg-amber-400/10 text-amber-100" : "border-white/15 bg-white/5 text-white/55"; return <span className={`border px-2 py-0.5 font-data text-[9px] font-bold uppercase tracking-[0.12em] ${tone}`}>{status.toLowerCase()}</span>; }
