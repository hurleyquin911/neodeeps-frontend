/** Catatan blok saat NEXT_PUBLIC atau fitur menyusul. */
export function ApiSoonNote({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-amber-200/80 bg-amber-50/85 px-4 py-3 text-sm font-semibold text-amber-950 shadow-sm ring-1 ring-amber-100/80">
      {label}
    </div>
  );
}
