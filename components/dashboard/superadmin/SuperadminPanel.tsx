/** Panel superadmin konsisten tema cerah hangat */
export function SuperadminPanel({
  title,
  action,
  children,
  footer,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-teal-100/85 bg-[var(--neo-surface)] shadow-[0_14px_40px_-32px_rgba(124,58,237,0.18)] ring-1 ring-white/65">
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-50 bg-gradient-to-r from-orange-50/60 to-transparent px-5 py-4">
          {title && <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-violet-900/95">{title}</h2>}
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      )}
      <div>{children}</div>
      {footer ? <footer className="border-t border-orange-50 bg-teal-50/25 px-5 py-3">{footer}</footer> : null}
    </section>
  );
}
