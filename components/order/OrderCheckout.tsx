"use client";

import { ArrowLeft, Check, LoaderCircle, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import LocationPicker, { type DeliveryPoint } from "@/components/order/LocationPicker";
import {
  MeatheadApiError,
  meatheadApi,
  type CatalogProduct,
  type CreatedOrder,
  type StoreConfig,
} from "@/lib/meathead-api";

const inputClass = "mt-2 min-h-12 w-full border border-white/20 bg-meathead-black px-3 text-base text-white outline-none placeholder:text-white/25 focus:border-meathead-red focus:ring-2 focus:ring-meathead-red/30";
const money = (paisa: number) => new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(paisa / 100);

export default function OrderCheckout() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [point, setPoint] = useState<DeliveryPoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<CreatedOrder | null>(null);
  const idempotencyKey = useRef("");

  async function loadCatalog() {
    setLoading(true);
    setError("");
    try {
      const [nextProducts, nextConfig] = await Promise.all([meatheadApi.catalog(), meatheadApi.storeConfig()]);
      setProducts(nextProducts);
      setConfig(nextConfig);
      setProductId((current) => current || nextProducts[0]?.id || "");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The menu could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadCatalog(); }, []);

  const selected = useMemo(() => products.find((product) => product.id === productId), [productId, products]);
  const subtotal = (selected?.unitPricePaisa ?? 0) * quantity;
  const total = subtotal + (config?.deliveryFeePaisa ?? 0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!selected) return setError("Choose a product before placing the order.");
    if (!point) return setError("Set the delivery pin on the map before placing the order.");

    const form = new FormData(event.currentTarget);
    if (!idempotencyKey.current) idempotencyKey.current = crypto.randomUUID();
    setSubmitting(true);
    try {
      const result = await meatheadApi.createOrder({
        customerName: String(form.get("customerName") || "").trim(),
        customerPhone: String(form.get("customerPhone") || "").trim(),
        customerEmail: String(form.get("customerEmail") || "").trim() || undefined,
        deliveryAddress: String(form.get("deliveryAddress") || "").trim(),
        deliveryNotes: `[TEST CHECKOUT] ${String(form.get("deliveryNotes") || "").trim()}`.trim(),
        latitude: point.latitude,
        longitude: point.longitude,
        paymentMethod: "COD",
        items: [{ productId: selected.id, quantity }],
      }, idempotencyKey.current);
      setCreated(result);
    } catch (requestError) {
      if (requestError instanceof MeatheadApiError && requestError.code === "OUT_OF_STOCK") {
        setError("There is not enough active patty stock for this order. Try a smaller pack or quantity.");
      } else {
        setError(requestError instanceof Error ? requestError.message : "The order could not be placed.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function startAnother() {
    setCreated(null);
    setPoint(null);
    setQuantity(1);
    setError("");
    idempotencyKey.current = "";
  }

  if (created) return <Success order={created} onReset={startAnother} />;

  return <main className="min-h-screen bg-meathead-black text-white">
    <header className="border-b border-white/10 px-4 py-5 sm:px-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-white/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meathead-red"><ArrowLeft size={17} aria-hidden="true" /> Waitlist home</Link>
        <span className="font-data text-xs font-bold uppercase tracking-[0.18em] text-meathead-red">Internal test</span>
      </div>
    </header>

    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="max-w-2xl">
        <p className="font-data text-xs font-bold uppercase tracking-[0.18em] text-meathead-red">Test checkout</p>
        <h1 className="mt-2 font-heading text-5xl uppercase leading-none sm:text-7xl">Build the order.</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-white/60">This page is temporary and unlinked. It creates a real operations order, reserves active inventory, and generates the customer tracking link.</p>
      </div>

      {loading ? <LoadingState /> : error && !products.length ? <LoadError message={error} onRetry={loadCatalog} /> :
        <form onSubmit={submit} className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="space-y-8">
            <section aria-labelledby="product-heading">
              <SectionHeading number="01" id="product-heading">Choose the pack</SectionHeading>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {products.map((product) => <label key={product.id} className={`relative cursor-pointer border p-4 transition-colors ${productId === product.id ? "border-meathead-red bg-meathead-red/10" : "border-white/15 bg-meathead-charcoal hover:border-white/35"}`}>
                  <input type="radio" name="product" value={product.id} checked={productId === product.id} onChange={() => setProductId(product.id)} className="sr-only" />
                  <span className="block font-heading text-2xl uppercase">{product.name}</span>
                  <span className="mt-2 block font-data text-sm font-bold text-meathead-red">{money(product.unitPricePaisa)}</span>
                  <span className="mt-3 block text-xs leading-5 text-white/50">{product.description}</span>
                  <span className="mt-2 block text-xs text-white/40">{product.inventoryUnitsPerItem} × 125 g patties</span>
                </label>)}
              </div>
              <div className="mt-4 flex items-center justify-between border border-white/15 bg-meathead-charcoal p-3">
                <div><p className="text-sm font-semibold">Pack quantity</p><p className="mt-1 text-xs text-white/45">Maximum 20 per order</p></div>
                <div className="flex items-center">
                  <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="grid h-11 w-11 place-items-center border border-white/20 hover:border-white/50"><Minus size={16} /></button>
                  <output className="grid h-11 min-w-12 place-items-center border-y border-white/20 font-data font-bold">{quantity}</output>
                  <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => Math.min(20, value + 1))} className="grid h-11 w-11 place-items-center border border-white/20 hover:border-white/50"><Plus size={16} /></button>
                </div>
              </div>
            </section>

            <section aria-labelledby="details-heading">
              <SectionHeading number="02" id="details-heading">Customer details</SectionHeading>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Full name"><input required name="customerName" autoComplete="name" className={inputClass} placeholder="Saad" /></Field>
                <Field label="Phone number"><input required name="customerPhone" type="tel" autoComplete="tel" className={inputClass} placeholder="03XX XXXXXXX" /></Field>
                <Field label="Email" optional><input name="customerEmail" type="email" autoComplete="email" className={inputClass} placeholder="Optional" /></Field>
                <Field label="Payment"><div className={`${inputClass} flex items-center text-sm`}><Check className="mr-2 text-meathead-red" size={16} /> Cash on delivery</div></Field>
              </div>
            </section>

            <section aria-labelledby="delivery-heading">
              <SectionHeading number="03" id="delivery-heading">Delivery location</SectionHeading>
              <div className="mt-4 grid gap-4">
                <Field label="Full delivery address"><textarea required name="deliveryAddress" autoComplete="street-address" rows={3} className={`${inputClass} py-3`} placeholder="House, street, sector, city" /></Field>
                <Field label="Delivery notes" optional><input name="deliveryNotes" className={inputClass} placeholder="Gate, landmark, or rider instructions" /></Field>
                <LocationPicker value={point} onChange={setPoint} />
              </div>
            </section>
          </div>

          <aside className="border border-white/15 bg-meathead-charcoal p-5 lg:sticky lg:top-6">
            <p className="font-data text-xs font-bold uppercase tracking-[0.16em] text-meathead-red">Order total</p>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4 text-white/60"><span>{quantity} × {selected?.name ?? "Pack"}</span><span>{money(subtotal)}</span></div>
              <div className="flex justify-between gap-4 text-white/60"><span>Delivery</span><span>{money(config?.deliveryFeePaisa ?? 0)}</span></div>
              <div className="flex justify-between gap-4 border-t border-white/15 pt-4 text-base font-bold"><span>Total</span><span className="font-data">{money(total)}</span></div>
            </div>
            {error && <p role="alert" className="mt-5 border-l-2 border-meathead-red bg-meathead-red/10 px-3 py-2 text-sm leading-5 text-red-100">{error}</p>}
            <button type="submit" disabled={submitting || !selected} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-meathead-red px-5 font-data text-xs font-bold uppercase tracking-[0.12em] hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50">
              {submitting && <LoaderCircle className="motion-safe:animate-spin" size={17} aria-hidden="true" />}{submitting ? "Placing order…" : "Place real test order"}
            </button>
            <p className="mt-3 text-xs leading-5 text-white/40">Submitting reserves stock immediately. Use a small pack for the first test.</p>
          </aside>
        </form>}
    </div>
  </main>;
}

function Field({ label, optional = false, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return <label className="block text-sm font-semibold">{label}{optional && <span className="ml-1 font-normal text-white/40">(optional)</span>}{children}</label>;
}

function SectionHeading({ number, id, children }: { number: string; id: string; children: React.ReactNode }) {
  return <div className="flex items-center gap-3"><span className="font-data text-xs font-bold text-meathead-red">{number}</span><h2 id={id} className="font-heading text-3xl uppercase">{children}</h2></div>;
}

function LoadingState() {
  return <div className="mt-10 grid gap-4" aria-label="Loading menu" aria-busy="true"><div className="h-36 bg-white/5 motion-safe:animate-pulse" /><div className="h-80 bg-white/5 motion-safe:animate-pulse" /></div>;
}

function LoadError({ message, onRetry }: { message: string; onRetry: () => Promise<void> }) {
  return <div className="mt-10 border border-meathead-red/40 bg-meathead-red/10 p-5" role="alert"><p>{message}</p><button type="button" onClick={() => void onRetry()} className="mt-4 min-h-11 bg-meathead-red px-5 font-data text-xs font-bold uppercase tracking-[0.1em]">Retry</button></div>;
}

function Success({ order, onReset }: { order: CreatedOrder; onReset: () => void }) {
  let trackingHref = order.trackingLink;
  try {
    const trackingUrl = new URL(order.trackingLink);
    trackingHref = `${trackingUrl.pathname}${trackingUrl.search}${trackingUrl.hash}`;
  } catch { /* Keep the API value if it is already relative. */ }

  return <main className="grid min-h-screen place-items-center bg-meathead-black px-4 py-12 text-white"><div className="w-full max-w-xl border border-white/15 bg-meathead-charcoal p-6 sm:p-10"><div className="grid h-12 w-12 place-items-center bg-meathead-red"><Check aria-hidden="true" /></div><p className="mt-7 font-data text-xs font-bold uppercase tracking-[0.18em] text-meathead-red">Real order created</p><h1 className="mt-2 font-heading text-5xl uppercase">{order.orderNumber}</h1><p className="mt-4 text-white/60">The order is now visible to the operations team and {money(order.totalAmountPaisa)} is due on delivery.</p><a href={trackingHref} target="_blank" rel="noreferrer" className="mt-7 inline-flex min-h-12 w-full items-center justify-center bg-meathead-red px-5 text-center font-data text-xs font-bold uppercase tracking-[0.1em] hover:bg-red-700">Open customer tracking</a><button type="button" onClick={onReset} className="mt-3 min-h-11 w-full border border-white/20 px-5 font-data text-xs font-bold uppercase tracking-[0.1em] hover:border-white/50">Place another test order</button><Link href="/" className="mt-5 block text-center text-sm text-white/45 hover:text-white">Back to waitlist home</Link></div></main>;
}
