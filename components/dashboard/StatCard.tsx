type Tone = "teal" | "amber" | "violet" | "gray";

const toneBar: Record<Tone, string> = {
  teal: "bg-gradient-to-b from-teal-400 to-teal-600",
  amber: "bg-gradient-to-b from-amber-300 to-amber-500",
  violet: "bg-gradient-to-b from-violet-400 to-violet-600",
  gray: "bg-gradient-to-b from-gray-300 to-gray-400",
};

export function StatCard({
  label,
  value,
  hint,
  tone = "gray",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: Tone;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_8px_30px_-20px_rgba(0,0,0,0.10)] ring-1 ring-white">
      <div className={`absolute left-0 top-0 h-full w-1 rounded-l-3xl ${toneBar[tone]}`} aria-hidden />
      <div className="py-5 pl-6 pr-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
        <p className="mt-2 text-[1.65rem] font-extrabold tabular-nums text-gray-900">{value}</p>
        {hint && <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{hint}</p>}
      </div>
    </div>
  );
}
