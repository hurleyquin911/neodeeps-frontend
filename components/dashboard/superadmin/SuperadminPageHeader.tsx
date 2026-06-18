/** Judul atas halaman superadmin dengan subjudul santai */
export function SuperadminPageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="max-w-3xl space-y-3 pb-4">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-800/95">Super admin</p>
      <h1 className="text-[1.95rem] font-extrabold tracking-tight text-gray-900 sm:text-4xl">{title}</h1>
      <p className="max-w-[52ch] text-base leading-relaxed text-gray-600">{description}</p>
    </header>
  );
}
