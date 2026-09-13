"use client";

import { Calculator, Check, Info, Save, Scale, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  meatheadApi,
  type AnalyticsSummary,
  type CostBasis,
  type StandardCostItem,
  type StandardCostModel,
} from "@/lib/meathead-api";

const money = (paisa = 0) => new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
}).format(paisa / 100);

const basisMeta: Array<{ basis: CostBasis; label: string; hint: string }> = [
  { basis: "PER_PATTY", label: "Each patty", hint: "Multiplies by the number of 125 g patties" },
  { basis: "PER_ORDER", label: "Each order", hint: "Charged once regardless of pack size" },
  { basis: "PER_DELIVERY", label: "Each delivery", hint: "Fuel and rider operating cost" },
  { basis: "MONTHLY_FIXED", label: "Monthly overhead", hint: "Paid even when order volume is low" },
  { basis: "STARTUP_ONE_TIME", label: "Opening cash", hint: "Setup only; excluded from monthly margin" },
];

const scenarios = [5, 10, 20, 40];

export default function CostModelPanel({
  token,
  model,
  analytics,
  onUpdated,
}: {
  token: string;
  model: StandardCostModel;
  analytics: AnalyticsSummary | null;
  onUpdated: (next: StandardCostModel) => void;
}) {
  const [selectedProductId, setSelectedProductId] = useState(model.products[0]?.id ?? "");
  const selectedProduct = model.products.find((product) => product.id === selectedProductId) ?? model.products[0];

  return <section className="border border-white/10 bg-meathead-charcoal" aria-labelledby="cost-model-heading">
    <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-5">
      <div>
        <p className="font-data text-[11px] font-bold uppercase tracking-[0.16em] text-meathead-red">Planning assumptions</p>
        <h2 id="cost-model-heading" className="mt-1 font-heading text-3xl uppercase">Standard cost &amp; scale</h2>
      </div>
      <p className="max-w-xl text-sm leading-6 text-white/50">These are editable benchmarks, not booked expenses. Replace every placeholder as quotes and actual operating data arrive.</p>
    </div>

    <div className="grid grid-cols-2 gap-px bg-white/10 lg:grid-cols-5">
      <CostMetric label="Per patty" value={money(model.summary.perPattyPaisa)} />
      <CostMetric label="Per order" value={money(model.summary.perOrderPaisa)} />
      <CostMetric label="Per delivery" value={money(model.summary.perDeliveryPaisa)} />
      <CostMetric label="Monthly fixed" value={money(model.summary.monthlyFixedPaisa)} />
      <CostMetric label="Opening cash" value={money(model.summary.startupOneTimePaisa)} />
    </div>

    <div className="grid gap-px bg-white/10 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.7fr)]">
      <div className="bg-meathead-charcoal p-4 sm:p-5">
        <div className="flex items-center gap-2"><Calculator size={17} className="text-meathead-red" aria-hidden="true" /><h3 className="font-data text-xs font-bold uppercase tracking-[0.12em]">Pack economics</h3></div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-white/15 font-data text-[10px] uppercase tracking-[0.12em] text-white/40"><tr><th className="pb-3 font-medium">Pack</th><th className="pb-3 text-right font-medium">Delivered revenue</th><th className="pb-3 text-right font-medium">Variable cost</th><th className="pb-3 text-right font-medium">Contribution</th><th className="pb-3 text-right font-medium">Margin</th><th className="pb-3 text-right font-medium">Break-even / month</th></tr></thead>
            <tbody className="divide-y divide-white/10">
              {model.products.map((product) => <tr key={product.id}>
                <td className="py-3 pr-4"><strong>{product.name}</strong><span className="ml-2 text-xs text-white/40">{product.inventoryUnitsPerItem} patties</span></td>
                <td className="py-3 text-right font-data tabular-nums">{money(product.deliveredRevenuePaisa)}</td>
                <td className="py-3 text-right font-data tabular-nums text-white/60">{money(product.variableCostPaisa)}</td>
                <td className={`py-3 text-right font-data font-bold tabular-nums ${product.contributionPaisa > 0 ? "text-emerald-300" : "text-red-300"}`}>{money(product.contributionPaisa)}</td>
                <td className={`py-3 text-right font-data tabular-nums ${product.contributionMarginPercent >= 25 ? "text-emerald-300" : "text-amber-300"}`}>{product.contributionMarginPercent.toFixed(1)}%</td>
                <td className="py-3 text-right font-data tabular-nums">{product.breakEvenOrdersPerMonth?.toLocaleString("en-PK") ?? "Never"}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-white/40">Delivered revenue includes the {money(model.deliveryFeePaisa)} delivery charge. Contribution is before monthly overhead and opening costs.</p>
      </div>

      <div className="bg-black/20 p-4 sm:p-5">
        <div className="flex items-center gap-2"><Scale size={17} className="text-meathead-red" aria-hidden="true" /><h3 className="font-data text-xs font-bold uppercase tracking-[0.12em]">30-day volume test</h3></div>
        <label className="mt-4 block text-sm font-semibold">Assume every order is
          <select value={selectedProduct?.id ?? ""} onChange={(event) => setSelectedProductId(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-white/20 bg-meathead-black px-3 text-base outline-none focus:border-meathead-red focus:ring-2 focus:ring-meathead-red/30">
            {model.products.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.inventoryUnitsPerItem} patties</option>)}
          </select>
        </label>
        {selectedProduct && <div className="mt-4 divide-y divide-white/10 border-y border-white/10">
          {scenarios.map((ordersPerDay) => {
            const monthlyOrders = ordersPerDay * 30;
            const result = selectedProduct.contributionPaisa * monthlyOrders - model.summary.monthlyFixedPaisa;
            return <div key={ordersPerDay} className="flex items-center justify-between gap-4 py-3">
              <div><strong className="font-data text-sm">{ordersPerDay}/day</strong><p className="mt-1 text-xs text-white/40">{monthlyOrders} orders/month</p></div>
              <div className="text-right"><strong className={`font-data text-sm tabular-nums ${result >= 0 ? "text-emerald-300" : "text-red-300"}`}>{money(result)}</strong><p className="mt-1 text-xs text-white/40">after fixed costs</p></div>
            </div>;
          })}
        </div>}
      </div>
    </div>

    {analytics && <div className="grid gap-px border-t border-white/10 bg-white/10 sm:grid-cols-3">
      <VarianceMetric label="Standard variable cost" value={money(analytics.standardVariablePaisa)} detail={`${analytics.deliveredPatties} delivered patties`} />
      <VarianceMetric label="Actual variable cash spend" value={money(analytics.actualVariableSpendPaisa)} detail="Purchases can span multiple periods" />
      <VarianceMetric
        label="Cash-spend variance"
        value={money(analytics.variableSpendVariancePaisa)}
        detail={analytics.variableSpendVariancePaisa > 0 ? "Above standard" : analytics.variableSpendVariancePaisa < 0 ? "Below standard" : "On standard"}
        tone={analytics.variableSpendVariancePaisa > 0 ? "bad" : "good"}
      />
    </div>}

    <div className="border-t border-white/10">
      <div className="flex items-start gap-3 border-b border-white/10 bg-black/15 px-4 py-3 text-xs leading-5 text-white/50 sm:px-5"><Info className="mt-0.5 shrink-0 text-meathead-red" size={16} aria-hidden="true" /><p>Seasoning and tamper stickers start disabled. Opening cash is intentionally excluded from operating margin. A rent deposit uses cash but remains an asset if refundable.</p></div>
      {basisMeta.map((group) => {
        const items = model.items.filter((item) => item.basis === group.basis);
        return <div key={group.basis} className="border-b border-white/10 last:border-b-0">
          <div className="bg-black/20 px-4 py-3 sm:px-5"><h3 className="font-data text-xs font-bold uppercase tracking-[0.12em]">{group.label}</h3><p className="mt-1 text-xs text-white/40">{group.hint}</p></div>
          <div className="divide-y divide-white/10">{items.map((item) => <CostRow key={item.key} item={item} token={token} onUpdated={onUpdated} />)}</div>
        </div>;
      })}
    </div>
  </section>;
}

function CostMetric({ label, value }: { label: string; value: string }) {
  return <div className="bg-meathead-charcoal px-4 py-4"><span className="font-data text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">{label}</span><strong className="mt-2 block font-data text-lg tabular-nums">{value}</strong></div>;
}

function VarianceMetric({ label, value, detail, tone }: { label: string; value: string; detail: string; tone?: "good" | "bad" }) {
  const Icon = tone === "bad" ? TrendingDown : tone === "good" ? TrendingUp : Check;
  return <div className="bg-meathead-charcoal p-4 sm:p-5"><div className="flex items-center gap-2 text-white/45"><Icon size={15} aria-hidden="true" /><span className="font-data text-[10px] font-bold uppercase tracking-[0.12em]">{label}</span></div><strong className={`mt-3 block font-data text-lg tabular-nums ${tone === "bad" ? "text-red-300" : tone === "good" ? "text-emerald-300" : ""}`}>{value}</strong><span className="mt-1 block text-xs text-white/40">{detail}</span></div>;
}

function CostRow({ item, token, onUpdated }: { item: StandardCostItem; token: string; onUpdated: (next: StandardCostModel) => void }) {
  const [amount, setAmount] = useState(String(item.amountPaisa / 100));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const changed = Math.round(Number(amount) * 100) !== item.amountPaisa;

  useEffect(() => { setAmount(String(item.amountPaisa / 100)); }, [item.amountPaisa]);
  const inputId = useMemo(() => `standard-cost-${item.key.toLowerCase()}`, [item.key]);

  async function update(input: { amountPaisa?: number; enabled?: boolean }) {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await meatheadApi.updateStandardCost(token, item.key, input);
      onUpdated(await meatheadApi.adminStandardCosts(token));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1600);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update this assumption.");
    } finally {
      setSaving(false);
    }
  }

  async function saveAmount() {
    const amountPaisa = Math.round(Number(amount) * 100);
    if (!Number.isFinite(amountPaisa) || amountPaisa < 0) return setError("Enter zero or a positive PKR amount.");
    await update({ amountPaisa });
  }

  return <div className={`grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5 ${item.enabled ? "" : "opacity-55"}`}>
    <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><label htmlFor={inputId} className="font-semibold">{item.name}</label>{!item.enabled && <span className="rounded-full border border-white/15 px-2 py-0.5 font-data text-[9px] font-bold uppercase tracking-[0.12em] text-white/45">Excluded</span>}</div>{item.note && <p className="mt-1 max-w-3xl text-xs leading-5 text-white/40">{item.note}</p>}{error && <p role="alert" className="mt-2 text-xs text-red-200">{error}</p>}</div>
    <div className="flex items-center gap-2">
      <label className="flex min-h-11 items-center gap-2 px-2 text-xs text-white/50"><input type="checkbox" checked={item.enabled} disabled={saving} onChange={(event) => void update({ enabled: event.target.checked })} className="size-4 accent-meathead-red" /> Include</label>
      <div className="relative"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-data text-xs text-white/35">₨</span><input id={inputId} value={amount} inputMode="decimal" disabled={saving} onChange={(event) => setAmount(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && changed) void saveAmount(); }} className="min-h-11 w-28 rounded-lg border border-white/20 bg-meathead-black pl-7 pr-2 text-right font-data text-sm tabular-nums outline-none focus:border-meathead-red focus:ring-2 focus:ring-meathead-red/30 disabled:opacity-50" aria-label={`${item.name} cost in PKR`} /></div>
      <button type="button" onClick={() => void saveAmount()} disabled={saving || !changed} className="grid size-11 place-items-center rounded-lg border border-white/20 text-white/70 transition-colors hover:border-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meathead-red disabled:opacity-30" aria-label={`Save ${item.name} cost`}>{saved ? <Check size={16} aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}</button>
    </div>
  </div>;
}
