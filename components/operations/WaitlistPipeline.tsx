"use client";

import { Check, ExternalLink, LoaderCircle, RefreshCw, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type LeadStage = "NEW" | "CONTACTED" | "INTERESTED" | "PILOT_OFFERED" | "PAID" | "NOT_INTERESTED";
interface WaitlistLead {
  id: string;
  timestamp: string;
  phone: string;
  name: string;
  area: string;
  referralCount: number;
  stage: LeadStage;
  preferredPlan: string;
  readyToStart: boolean;
  notes: string;
}

const stages: Array<{ value: LeadStage; label: string }> = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "INTERESTED", label: "Interested" },
  { value: "PILOT_OFFERED", label: "Pilot offered" },
  { value: "PAID", label: "Paid" },
  { value: "NOT_INTERESTED", label: "Not interested" },
];
const controlClass = "min-h-11 border border-white/20 bg-meathead-black px-3 text-sm text-white outline-none focus:border-meathead-red focus:ring-2 focus:ring-meathead-red/30";

export default function WaitlistPipeline({ token }: { token: string }) {
  const [leads, setLeads] = useState<WaitlistLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin-waitlist", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const payload = await response.json() as { leads?: WaitlistLead[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "Could not load waitlist.");
      setLeads(payload.leads ?? []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load waitlist.");
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { void load(); }, [load]);
  const counts = useMemo(() => Object.fromEntries(stages.map((stage) => [stage.value, leads.filter((lead) => lead.stage === stage.value).length])), [leads]);

  async function updateLead(next: WaitlistLead) {
    const previous = leads;
    setError("");
    setLeads((current) => current.map((lead) => lead.id === next.id ? next : lead));
    try {
      const response = await fetch("/api/admin-waitlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(next),
      });
      const payload = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Could not update lead.");
    } catch (requestError) {
      setLeads(previous);
      setError(requestError instanceof Error ? requestError.message : "Could not update lead.");
    }
  }

  return <section className="border border-white/10 bg-meathead-charcoal" aria-labelledby="waitlist-heading">
    <header className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
      <div><p className="font-data text-xs font-bold uppercase tracking-[0.16em] text-meathead-red">Demand pipeline</p><h2 id="waitlist-heading" className="mt-1 font-heading text-2xl uppercase">Waitlist</h2></div>
      <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 border border-white/20 px-4 font-data text-xs font-bold uppercase tracking-[0.1em] text-white/75 hover:border-white/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meathead-red disabled:opacity-50"><RefreshCw size={15} className={loading ? "motion-safe:animate-spin" : ""} /> Refresh leads</button>
    </header>
    <div className="grid grid-cols-3 gap-px bg-white/10 lg:grid-cols-6">
      {stages.map((stage) => <div key={stage.value} className="bg-meathead-charcoal p-3"><span className="font-data text-[9px] font-bold uppercase tracking-[0.1em] text-white/40">{stage.label}</span><strong className="mt-2 block font-data text-xl tabular-nums">{counts[stage.value] ?? 0}</strong></div>)}
    </div>
    {error && <p role="alert" className="border-t border-meathead-red/30 bg-meathead-red/10 px-4 py-3 text-sm text-red-100">{error}</p>}
    {loading && !leads.length ? <div className="h-40 bg-white/[0.025] motion-safe:animate-pulse" aria-label="Loading waitlist" /> : leads.length ? <ul className="divide-y divide-white/10">
      {leads.map((lead) => <WaitlistRow key={lead.id} lead={lead} onChange={updateLead} />)}
    </ul> : <div className="px-5 py-10 text-center"><Users className="mx-auto text-white/25" /><p className="mt-3 font-semibold">No waitlist leads found</p></div>}
  </section>;
}

function WaitlistRow({ lead, onChange }: { lead: WaitlistLead; onChange: (lead: WaitlistLead) => Promise<void> }) {
  const [draft, setDraft] = useState(lead);
  const [saving, setSaving] = useState(false);
  const changed = JSON.stringify(draft) !== JSON.stringify(lead);
  const whatsapp = lead.phone.replace(/\D/g, "").replace(/^0/, "92");
  useEffect(() => { setDraft(lead); }, [lead]);
  async function save() { setSaving(true); await onChange(draft); setSaving(false); }
  return <li className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(180px,0.8fr)_minmax(0,1.6fr)_auto] lg:items-end">
    <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><strong className="font-data text-sm">{lead.name}</strong>{lead.readyToStart && <span className="border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 font-data text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-200">Ready now</span>}</div><p className="mt-2 text-sm text-white/55">{lead.area} · {lead.phone}</p><p className="mt-1 text-xs text-white/35">Joined {lead.timestamp ? new Date(lead.timestamp).toLocaleDateString("en-PK") : "—"}{lead.referralCount ? ` · ${lead.referralCount} referrals` : ""}</p></div>
    <div className="grid gap-3 sm:grid-cols-3">
      <label className="text-xs font-semibold text-white/60">Stage<select value={draft.stage} onChange={(event) => setDraft({ ...draft, stage: event.target.value as LeadStage })} className={`${controlClass} mt-1 w-full`}>{stages.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}</select></label>
      <label className="text-xs font-semibold text-white/60">Plan<select value={draft.preferredPlan} onChange={(event) => setDraft({ ...draft, preferredPlan: event.target.value })} className={`${controlClass} mt-1 w-full`}><option value="">Not selected</option><option value="DAILY_2">2 patties/day</option><option value="DAILY_4">4 patties/day</option></select></label>
      <label className="text-xs font-semibold text-white/60">Notes<input value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} className={`${controlClass} mt-1 w-full`} placeholder="Price, timing, objection" /></label>
    </div>
    <div className="flex gap-2"><a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hi ${lead.name === "Anonymous" ? "there" : lead.name}, this is Saad from Meathead. You joined our launch waitlist — can I ask which daily patty plan would suit you?`)}`} target="_blank" rel="noreferrer" className="grid size-11 place-items-center border border-white/20 text-white/70 hover:border-white/45 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meathead-red" aria-label={`Message ${lead.name} on WhatsApp`}><ExternalLink size={16} /></a><button type="button" disabled={!changed || saving} onClick={() => void save()} className="grid size-11 place-items-center bg-meathead-red text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-30" aria-label={`Save ${lead.name}`} >{saving ? <LoaderCircle size={16} className="motion-safe:animate-spin" /> : <Check size={16} />}</button></div>
  </li>;
}
