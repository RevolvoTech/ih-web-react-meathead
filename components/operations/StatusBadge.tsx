const statusStyles: Record<string, string> = {
  DELIVERED: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  PAID: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  IN_PROGRESS: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  OUT_FOR_DELIVERY: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  ARRIVED: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  DELIVERY_FAILED: "border-meathead-red/40 bg-meathead-red/10 text-red-200",
  FAILED: "border-meathead-red/40 bg-meathead-red/10 text-red-200",
  CANCELLED: "border-white/20 bg-white/5 text-white/55",
};

export const humanizeStatus = (status: string) => status.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-flex border px-2 py-1 font-data text-[11px] font-bold uppercase tracking-[0.08em] ${statusStyles[status] ?? "border-white/20 bg-white/5 text-white/70"}`}>{humanizeStatus(status)}</span>;
}
