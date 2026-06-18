import Link from "next/link";
import { AppNotifyForm } from "../components/AppNotifyForm";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

const features = [
  {
    number: "01",
    title: "Komunitas Berbasis Minat",
    desc: "Temukan komunitas yang relevan berdasarkan hobi, bidang karier, atau lokasi Anda. Setiap komunitas memiliki fokus yang spesifik sehingga Anda bertemu orang-orang yang benar-benar satu tujuan.",
    accent: "bg-teal-500",
  },
  {
    number: "02",
    title: "Acara yang Terstruktur",
    desc: "Setiap komunitas dapat menyelenggarakan acara dengan jadwal yang jelas — mulai dari diskusi tematik, workshop, hingga pertemuan informal. Semua dapat diakses dari satu tempat.",
    accent: "bg-amber-400",
  },
  {
    number: "03",
    title: "Partisipasi Tanpa Tekanan",
    desc: "Tidak ada kewajiban kehadiran rutin. Bergabunglah kapan Anda siap, ikuti acara sesuai jadwal Anda, dan keluar tanpa prosedur yang mempersulit.",
    accent: "bg-teal-600",
  },
  {
    number: "04",
    title: "Buat Komunitas Sendiri",
    desc: "Punya gagasan komunitas? Buat dan kelola komunitas Anda sendiri dalam beberapa menit. Undang anggota, jadwalkan acara, dan mulai membangun jaringan yang bermakna.",
    accent: "bg-amber-500",
  },
];

const steps = [
  {
    label: "Daftar",
    desc: "Buat akun menggunakan email dalam waktu kurang dari dua menit.",
  },
  {
    label: "Jelajahi",
    desc: "Temukan komunitas berdasarkan minat, kota, atau kata kunci yang relevan.",
  },
  {
    label: "Bergabung",
    desc: "Ikuti komunitas yang sesuai dan mulai berinteraksi dengan anggotanya.",
  },
  {
    label: "Berkontribusi",
    desc: "Hadiri acara, bagikan wawasan, atau selenggarakan pertemuan Anda sendiri.",
  },
];


export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <SiteHeader />

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-gray-100">
          {/* Subtle grid background */}
          <div
            className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(20,184,166,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.045)_1px,transparent_1px)] [background-size:48px_48px]"
            aria-hidden
          />
          {/* Gradient overlay to fade grid */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_75%_at_100%_50%,rgba(255,255,255,0)_0%,rgba(255,255,255,0.92)_60%,white_80%)]"
            aria-hidden
          />

          <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:py-28">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                <span className="text-xs font-semibold uppercase tracking-widest text-teal-700">
                  Platform Komunitas
                </span>
              </div>

              <h1 className="text-[2.75rem] font-black leading-[1.08] tracking-tight text-gray-900 sm:text-5xl lg:text-[3.5rem]">
                Temukan komunitas
                <br />
                yang{" "}
                <span className="relative whitespace-nowrap">
                  <span className="relative z-10 text-teal-600">benar-benar</span>
                  <span
                    aria-hidden
                    className="absolute bottom-1 left-0 z-0 h-3 w-full -rotate-1 rounded bg-teal-100/80"
                  />
                </span>{" "}
                relevan
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-500">
                Neodeeps adalah platform yang menghubungkan Anda dengan komunitas berbasis minat, acara, dan pertemuan nyata — di kota Anda.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:-translate-y-px hover:bg-teal-700 active:translate-y-0"
                >
                  Mulai Bergabung
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/tentang"
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-7 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                >
                  Tentang Neodeeps
                </Link>
              </div>

              {/* App download */}
              <div className="mt-8 border-t border-gray-100 pt-7">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Tersedia di
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="#"
                    aria-label="Download di Google Play"
                    className="group inline-flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm transition hover:border-gray-300 hover:shadow"
                  >
                    {/* Play Store icon */}
                    <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.18 1.56a1 1 0 0 0-.18.56v19.76a1 1 0 0 0 .18.56L3.27 22.5l11.06-11.06v-.26L3.27 1.5l-.09.06Z" fill="#EA4335" />
                      <path d="m17.92 15.13-3.59-3.59v-.26l3.59-3.6.08.05 4.25 2.41c1.21.69 1.21 1.81 0 2.5l-4.25 2.41-.08.08Z" fill="#FBBC04" />
                      <path d="m18 15.05-3.67-3.67L3.18 22.44c.4.42 1.05.47 1.77.05L18 15.05Z" fill="#34A853" />
                      <path d="M18 8.95 4.95 1.51C4.23 1.09 3.58 1.14 3.18 1.56l11.15 11.16L18 8.95Z" fill="#4285F4" />
                    </svg>
                    <div className="text-left">
                      <p className="text-[10px] leading-none text-gray-400">Tersedia di</p>
                      <p className="text-sm font-bold leading-tight text-gray-800">Google Play</p>
                    </div>
                  </a>

                  <a
                    href="#"
                    aria-label="Download di App Store"
                    className="group inline-flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm transition hover:border-gray-300 hover:shadow"
                  >
                    {/* App Store icon */}
                    <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    <div className="text-left">
                      <p className="text-[10px] leading-none text-gray-400">Download di</p>
                      <p className="text-sm font-bold leading-tight text-gray-800">App Store</p>
                    </div>
                  </a>

                  <a
                    href="#"
                    aria-label="Unduh file APK"
                    className="group inline-flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 shadow-sm transition hover:border-teal-300 hover:bg-teal-100"
                  >
                    <svg className="h-6 w-6 shrink-0 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 15V3m0 12-4-4m4 4 4-4" />
                      <path d="M2 17l.621 2.485A2 2 0 0 0 4.561 21H19.44a2 2 0 0 0 1.94-1.515L22 17" />
                    </svg>
                    <div className="text-left">
                      <p className="text-[10px] leading-none text-teal-500">Unduh langsung</p>
                      <p className="text-sm font-bold leading-tight text-teal-800">File APK</p>
                    </div>
                  </a>
                </div>
                <p className="mt-2.5 text-[11px] text-gray-400">
                  Aplikasi mobile sedang dalam pengembangan. Daftarkan email Anda untuk mendapat notifikasi saat diluncurkan.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ── Fitur ───────────────────────────────────────────── */}
        <section className="border-b border-gray-100 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-teal-600">Fitur Utama</p>
              <h2 className="text-4xl font-black tracking-tight text-gray-900">
                Dirancang untuk koneksi yang nyata
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-500">
                Setiap fitur Neodeeps dikembangkan agar proses menemukan dan membangun komunitas terasa alami — bukan seperti pekerjaan tambahan.
              </p>
            </div>

            <div className="grid gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 sm:grid-cols-2">
              {features.map((f) => (
                <div key={f.number} className="group bg-white p-8 transition hover:bg-gray-50/70">
                  <div className="flex items-start gap-5">
                    <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${f.accent} text-xs font-black text-white`}>
                      {f.number}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{f.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-500">{f.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Cara Kerja ──────────────────────────────────────── */}
        <section className="border-b border-gray-100 bg-gray-50 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-teal-600">Cara Kerja</p>
              <h2 className="text-4xl font-black tracking-tight text-gray-900">Mulai dalam empat langkah</h2>
              <p className="mt-4 text-sm text-gray-500">
                Proses dari pendaftaran hingga bergabung dengan komunitas dirancang sesederhana mungkin.{" "}
                <Link href="/tutorial" className="font-semibold text-teal-600 hover:underline">
                  Lihat panduan lengkap →
                </Link>
              </p>
            </div>

            <ol className="relative mx-auto grid max-w-4xl gap-0 sm:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s.label} className="relative flex flex-col items-center text-center sm:px-4">
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute left-1/2 top-5 hidden h-0.5 w-full bg-teal-100 sm:block"
                      style={{ transform: "translateX(50%)" }}
                    />
                  )}
                  <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-sm font-black text-white shadow ring-4 ring-gray-50">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-sm font-bold text-gray-900">{s.label}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Nilai Platform ───────────────────────────────────── */}
        <section className="border-b border-gray-100 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="overflow-hidden rounded-2xl bg-gray-900">
              <div className="grid lg:grid-cols-2">
                {/* Left text */}
                <div className="flex flex-col justify-center px-10 py-14 lg:py-16">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-teal-400">Mengapa Neodeeps</p>
                  <h2 className="text-3xl font-black leading-snug tracking-tight text-white sm:text-4xl">
                    Platform komunitas yang menjaga privasi dan kenyamanan Anda
                  </h2>
                  <p className="mt-5 text-sm leading-relaxed text-gray-400">
                    Kami tidak menjual data pengguna, tidak menerapkan algoritma yang manipulatif, dan tidak memaksa interaksi yang tidak diperlukan. Neodeeps bekerja untuk Anda — bukan sebaliknya.
                  </p>
                  <div className="mt-8 flex gap-3">
                    <Link
                      href="/privasi"
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-700 px-5 py-2.5 text-sm font-semibold text-gray-300 transition hover:border-gray-500 hover:text-white"
                    >
                      Baca Kebijakan Privasi
                    </Link>
                  </div>
                </div>

                {/* Right — value points */}
                <div className="grid grid-rows-3 divide-y divide-gray-800 border-t border-gray-800 lg:border-l lg:border-t-0">
                  {[
                    { icon: "🚫", title: "Data tidak diperjualbelikan", desc: "Informasi Anda hanya digunakan untuk kebutuhan layanan platform." },
                    { icon: "🔐", title: "Enkripsi menyeluruh", desc: "Seluruh data transit dan tersimpan dilindungi dengan enkripsi standar industri." },
                    { icon: "🗑️", title: "Hapus kapan saja", desc: "Tutup akun Anda kapanpun — semua data dihapus secara permanen dalam 30 hari." },
                  ].map((v) => (
                    <div key={v.title} className="flex items-start gap-4 px-8 py-7">
                      <span className="text-xl">{v.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-white">{v.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-gray-400">{v.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Download App ────────────────────────────────────── */}
        <section className="border-b border-gray-100 bg-gray-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="grid items-center gap-0 lg:grid-cols-2">
                {/* Left */}
                <div className="px-10 py-12 lg:py-14">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <span className="text-xs font-semibold uppercase tracking-widest text-amber-700">
                      Segera Hadir
                    </span>
                  </div>
                  <h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
                    Neodeeps di genggaman Anda
                  </h2>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-gray-500">
                    Aplikasi mobile Neodeeps sedang dalam pengembangan. Dapatkan notifikasi pertama saat diluncurkan di Google Play, App Store, maupun melalui unduhan file APK langsung.
                  </p>

                  {/* Buttons */}
                  <div className="mt-8 flex flex-wrap gap-3">
                    <a
                      href="#"
                      aria-label="Download di Google Play"
                      className="inline-flex items-center gap-3 rounded-xl border-2 border-gray-900 bg-gray-900 px-5 py-3 text-white transition hover:bg-gray-800"
                    >
                      <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.18 1.56a1 1 0 0 0-.18.56v19.76a1 1 0 0 0 .18.56L3.27 22.5l11.06-11.06v-.26L3.27 1.5l-.09.06Z" fill="#EA4335" />
                        <path d="m17.92 15.13-3.59-3.59v-.26l3.59-3.6.08.05 4.25 2.41c1.21.69 1.21 1.81 0 2.5l-4.25 2.41-.08.08Z" fill="#FBBC04" />
                        <path d="m18 15.05-3.67-3.67L3.18 22.44c.4.42 1.05.47 1.77.05L18 15.05Z" fill="#34A853" />
                        <path d="M18 8.95 4.95 1.51C4.23 1.09 3.58 1.14 3.18 1.56l11.15 11.16L18 8.95Z" fill="#4285F4" />
                      </svg>
                      <div className="text-left">
                        <p className="text-[10px] leading-none text-gray-400">Tersedia di</p>
                        <p className="text-sm font-bold leading-tight">Google Play</p>
                      </div>
                    </a>

                    <a
                      href="#"
                      aria-label="Download di App Store"
                      className="inline-flex items-center gap-3 rounded-xl border-2 border-gray-900 bg-gray-900 px-5 py-3 text-white transition hover:bg-gray-800"
                    >
                      <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                      </svg>
                      <div className="text-left">
                        <p className="text-[10px] leading-none text-gray-400">Download di</p>
                        <p className="text-sm font-bold leading-tight">App Store</p>
                      </div>
                    </a>

                    <a
                      href="#"
                      aria-label="Unduh file APK"
                      className="inline-flex items-center gap-3 rounded-xl border-2 border-teal-600 bg-teal-600 px-5 py-3 text-white transition hover:bg-teal-700"
                    >
                      <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 15V3m0 12-4-4m4 4 4-4" />
                        <path d="M2 17l.621 2.485A2 2 0 0 0 4.561 21H19.44a2 2 0 0 0 1.94-1.515L22 17" />
                      </svg>
                      <div className="text-left">
                        <p className="text-[10px] leading-none text-teal-200">Unduh langsung</p>
                        <p className="text-sm font-bold leading-tight">File APK</p>
                      </div>
                    </a>
                  </div>
                  <p className="mt-4 text-xs text-gray-400">
                    Daftarkan email di bawah ini untuk mendapat pemberitahuan peluncuran pertama.
                  </p>
                </div>

                {/* Right — email capture */}
                <div className="flex flex-col justify-center border-t border-gray-100 bg-gray-50 px-10 py-12 lg:border-l lg:border-t-0 lg:py-14">
                  <p className="text-sm font-semibold text-gray-700">Beritahu saya saat aplikasi diluncurkan</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Kami akan mengirimkan satu email notifikasi — tidak ada spam.
                  </p>
                  <AppNotifyForm />
                  <div className="mt-8 grid grid-cols-3 gap-3 border-t border-gray-200 pt-7">
                    {[
                      { icon: "📱", label: "Android", note: "Google Play" },
                      { icon: "🍎", label: "iOS", note: "App Store" },
                      { icon: "📦", label: "APK", note: "Unduh Langsung" },
                    ].map((p) => (
                      <div key={p.label} className="rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm">
                        <p className="text-2xl">{p.icon}</p>
                        <p className="mt-1.5 text-sm font-bold text-gray-800">{p.label}</p>
                        <p className="text-[11px] text-gray-400">{p.note}</p>
                        <span className="mt-2 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                          Segera
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────── */}
        <section className="py-28">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
              Bergabung dengan{" "}
              <span className="text-teal-600">Neodeeps</span>
              <br />
              sekarang.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-gray-500">
              Daftar dan mulai temukan komunitas yang sesuai dengan minat Anda hari ini.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-9 py-4 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:-translate-y-px hover:bg-teal-700"
              >
                Buat Akun Gratis
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/tutorial"
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-9 py-4 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                Lihat Tutorial
              </Link>
            </div>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
