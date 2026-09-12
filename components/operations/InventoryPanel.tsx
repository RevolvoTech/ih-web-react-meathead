"use client";

import { AlertTriangle, PackageOpen, Plus, Scale } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { meatheadApi, type InventoryItem } from "@/lib/meathead-api";

interface InventoryPanelProps {
  items: InventoryItem[];
  token?: string;
  onChanged?: () => Promise<void>;
  canManage?: boolean;
}

export default function InventoryPanel({ items, token, onChanged, canManage = false }: InventoryPanelProps) {
  const item = items[0];
  const [stockOpen, setStockOpen] = useState(false);
  const activeBatches = useMemo(() => item?.batches.filter((batch) => batch.status === "ACTIVE") ?? [], [item]);
  const totals = useMemo(() => activeBatches.reduce((sum, batch) => ({
    total: sum.total + batch.totalQuantity,
    reserved: sum.reserved + batch.reservedQuantity,
    used: sum.used + batch.soldQuantity,
  }), { total: 0, reserved: 0, used: 0 }), [activeBatches]);
  const available = Math.max(0, totals.total - totals.reserved - totals.used);
  const low = item?.lowStockThreshold !== null && item?.lowStockThreshold !== undefined && available <= item.lowStockThreshold;

  return <section className="border border-white/10 bg-meathead-charcoal" aria-labelledby="inventory-heading">
    <header className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
      <div>
        <p className="font-data text-xs font-bold uppercase tracking-[0.16em] text-meathead-red">125 g per patty</p>
        <h2 id="inventory-heading" className="mt-1 text-lg font-bold">Meat inventory</h2>
      </div>
      {canManage && <button type="button" onClick={() => setStockOpen((open) => !open)} className="inline-flex min-h-11 items-center justify-center gap-2 bg-meathead-red px-4 font-data text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><Plus size={16} aria-hidden="true" /> Add stock</button>}
    </header>

    {!item ? <div className="px-5 py-12 text-center"><PackageOpen className="mx-auto text-white/25" aria-hidden="true" /><p className="mt-4 font-semibold">Inventory is not configured</p></div> : <>
      {low && <div role="status" className="flex items-start gap-3 border-b border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"><AlertTriangle className="mt-0.5 shrink-0" size={17} aria-hidden="true" /><span>Low stock: {available} patties remain. The warning level is {item.lowStockThreshold}.</span></div>}
      {stockOpen && token && onChanged && <StockForm item={item} token={token} onSaved={async () => { setStockOpen(false); await onChanged(); }} />}

      <div className="grid grid-cols-2 gap-px bg-white/10 lg:grid-cols-4">
        <InventoryMetric label="Available" value={`${available} patties`} detail={`${formatKg(available, item.unitWeightGrams)} kg usable`} />
        <InventoryMetric label="Reserved" value={`${totals.reserved} patties`} detail="Held by open orders" />
        <InventoryMetric label="Consumed" value={`${totals.used} patties`} detail="Completed deliveries" />
        <InventoryMetric label="Low-stock warning" value={item.lowStockThreshold === null ? "Not set" : `${item.lowStockThreshold} patties`} detail={item.lowStockThreshold === null ? "Admin can configure it" : `${formatKg(item.lowStockThreshold, item.unitWeightGrams)} kg`} />
      </div>

      <div className="grid gap-px border-t border-white/10 bg-white/10 lg:grid-cols-2">
        <div className="bg-meathead-charcoal p-4 sm:p-5">
          <div className="flex items-center gap-2"><Scale size={17} className="text-meathead-red" aria-hidden="true" /><h3 className="font-semibold">Product recipes</h3></div>
          <ul className="mt-3 divide-y divide-white/10">
            {item.products.filter((product) => product.active).map((product) => <li key={product.id} className="flex items-center justify-between gap-4 py-3 text-sm"><span>{product.name}</span><strong className="font-data">{product.inventoryUnitsPerItem} {product.inventoryUnitsPerItem === 1 ? "patty" : "patties"}</strong></li>)}
          </ul>
        </div>
        <div className="bg-meathead-charcoal p-4 sm:p-5">
          <h3 className="font-semibold">Stock batches</h3>
          {item.batches.length ? <ul className="mt-3 divide-y divide-white/10">{item.batches.slice(0, 6).map((batch) => {
            const remaining = Math.max(0, batch.totalQuantity - batch.reservedQuantity - batch.soldQuantity);
            return <li key={batch.id} className="flex items-center justify-between gap-4 py-3"><div><p className="font-data text-xs font-bold">{batch.code}</p><p className="mt-1 text-xs text-white/45">{batch.status.toLowerCase()}</p></div><div className="text-right"><strong className="font-data text-sm">{remaining} {batch.status === "ACTIVE" ? "available" : "patties"}</strong><p className="mt-1 text-xs text-white/45">of {batch.totalQuantity}</p></div></li>;
          })}</ul> : <p className="mt-4 text-sm text-white/45">No stock batches have been added.</p>}
        </div>
      </div>
    </>}
  </section>;
}

function formatKg(patties: number, grams: number) {
  return ((patties * grams) / 1000).toLocaleString("en-PK", { maximumFractionDigits: 3 });
}

function InventoryMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="bg-meathead-charcoal p-4"><span className="font-data text-[11px] font-bold uppercase tracking-[0.12em] text-white/45">{label}</span><strong className="mt-3 block font-data text-lg">{value}</strong><span className="mt-1 block text-xs text-white/40">{detail}</span></div>;
}

function StockForm({ item, token, onSaved }: { item: InventoryItem; token: string; onSaved: () => Promise<void> }) {
  const [kilograms, setKilograms] = useState("");
  const [threshold, setThreshold] = useState(item.lowStockThreshold?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const patties = Number(kilograms) * 1000 / item.unitWeightGrams;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!Number.isInteger(patties) || patties < 1) {
      setError(`Stock must divide exactly into ${item.unitWeightGrams} g patties.`);
      return;
    }
    const warning = threshold.trim() === "" ? null : Number(threshold);
    if (warning !== null && (!Number.isInteger(warning) || warning < 0)) {
      setError("Low-stock warning must be a whole number of patties.");
      return;
    }
    setSaving(true);
    try {
      await meatheadApi.createInventoryBatch(token, {
        code: `STOCK-${Date.now()}`,
        inventoryItemId: item.id,
        totalQuantity: patties,
        status: "ACTIVE",
      });
      await meatheadApi.updateInventoryItem(token, item.id, { lowStockThreshold: warning });
      await onSaved();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Stock could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "mt-2 min-h-11 w-full border border-white/20 bg-meathead-black px-3 text-base text-white outline-none focus:border-meathead-red focus:ring-2 focus:ring-meathead-red/30";
  return <form onSubmit={submit} className="grid gap-4 border-b border-white/10 bg-black/20 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-5">
    <label className="text-sm font-semibold">New meat stock (kg)<input required inputMode="decimal" value={kilograms} onChange={(event) => setKilograms(event.target.value)} className={inputClass} placeholder="10" /></label>
    <label className="text-sm font-semibold">Warn below (patties)<input inputMode="numeric" value={threshold} onChange={(event) => setThreshold(event.target.value)} className={inputClass} placeholder="Choose a level" /></label>
    <button type="submit" disabled={saving} className="min-h-11 bg-meathead-red px-5 font-data text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50">{saving ? "Saving…" : `Add ${Number.isInteger(patties) && patties > 0 ? patties : 0} patties`}</button>
    {error && <p role="alert" className="text-sm text-red-200 sm:col-span-3">{error}</p>}
  </form>;
}
