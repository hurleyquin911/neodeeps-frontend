export function PlaceholderPanel({
  title,
  description,
  eyebrow,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_8px_30px_-20px_rgba(0,0,0,0.08)]">
      {eyebrow && (
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-700">{eyebrow}</p>
      )}
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">{description}</p>
      <div className="mt-6 rounded-2xl border border-dashed border-teal-200/80 bg-teal-50/40 px-4 py-10 text-center text-sm font-medium text-gray-500">
        Konten API menghubungi backend dalam langkah berikutnya 👋 — ruang kamu udah dibikin nyaman dari sisi desainnya.
      </div>
    </section>
  );
}
