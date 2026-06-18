import Link from "next/link";

/** Kartu pemilih peran untuk /dashboard (hub). */
export function DashboardRolePicker() {
  return (
    <div className="space-y-10">
      <header className="max-w-3xl space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-teal-700">Pusat akun</p>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl">
          Selamat datang — mana yang kamu lagi butuh sekarang?
        </h1>
        <p className="text-base leading-relaxed text-gray-600">
          Tiap tombol bikin suasana sidebar beda supaya tugas utama kamu cepat kepilih: main komunitas, jaga tayangan sebagai admin, atau
          kendali penuh sebagai super admin.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          href="/dashboard/user"
          title="Pengguna"
          description="Ikut komunitas, lihat acara, dan keseharian santai sosial Anda."
          tint="from-teal-200 via-teal-100 to-teal-50"
          subtitle="Komunitas & acara Anda"
          ctaClass="text-teal-700 group-hover:text-teal-900"
        />
        <DashboardCard
          href="/dashboard/admin"
          title="Admin"
          description="Pastikan tayangan baru tetap vibes-nya cocok sama komunitas kita bareng-bareng."
          tint="from-amber-200 via-amber-100 to-amber-50"
          subtitle="Moderasi & laporan"
          ctaClass="text-amber-700 group-hover:text-amber-900"
        />
        <DashboardCard
          href="/dashboard/superadmin"
          title="Super Admin"
          description="Kelola struktur besar: pengguna, sistem, serta kebijakan yang menyangkut semua orang."
          tint="from-violet-200 via-violet-100 to-violet-50"
          subtitle="Kontrol penuh"
          className="sm:col-span-2 lg:col-span-1"
          ctaClass="text-violet-700 group-hover:text-violet-900"
        />
      </div>
    </div>
  );
}

function DashboardCard({
  href,
  title,
  description,
  subtitle,
  tint,
  className = "",
  ctaClass = "",
}: {
  href: string;
  title: string;
  description: string;
  subtitle: string;
  tint: string;
  className?: string;
  ctaClass?: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white shadow-[0_8px_30px_-20px_rgba(0,0,0,0.10)] transition hover:-translate-y-1 hover:shadow-xl ${className}`}
    >
      <div className={`relative h-[7.75rem] overflow-hidden bg-gradient-to-br ${tint}`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_100%_at_20%_-20%,rgba(255,255,255,0.55),transparent_55%)]" />
      </div>
      <div className="relative space-y-2 px-5 pb-6 pt-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{subtitle}</p>
        <h2 className="text-xl font-extrabold text-gray-900">{title}</h2>
        <p className="text-sm leading-relaxed text-gray-600">{description}</p>
        <span className={`inline-flex pt-3 text-sm font-bold transition ${ctaClass}`}>Masuk zona ini →</span>
      </div>
    </Link>
  );
}
