import Link from "next/link";

export function QuickLinkCard({
  href,
  title,
  description,
  tone,
}: {
  href: string;
  title: string;
  description: string;
  tone: "teal" | "amber" | "violet";
}) {
  const ring =
    tone === "teal"
      ? "hover:border-teal-200 hover:shadow-[0_14px_40px_-36px_rgba(20,184,166,0.35)]"
      : tone === "amber"
        ? "hover:border-amber-200 hover:shadow-[0_14px_40px_-36px_rgba(245,158,11,0.32)]"
        : "hover:border-violet-200 hover:shadow-[0_14px_40px_-36px_rgba(139,92,246,0.28)]";

  const cta =
    tone === "teal"
      ? "text-teal-600 group-hover:text-teal-700"
      : tone === "amber"
        ? "text-amber-600 group-hover:text-amber-700"
        : "text-violet-600 group-hover:text-violet-700";

  return (
    <Link
      href={href}
      className={`group block rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-[2px] hover:shadow-md ${ring}`}
    >
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-gray-500">{description}</p>
      <span className={`mt-4 inline-flex text-xs font-bold transition ${cta}`}>
        Buka →
      </span>
    </Link>
  );
}
