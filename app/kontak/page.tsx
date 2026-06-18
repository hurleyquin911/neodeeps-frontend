import Link from "next/link";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";

export const metadata = {
  title: "Kontak & Komunikasi — Neodeeps",
  description: "Hubungi tim Neodeeps untuk pertanyaan, kerjasama, laporan, atau informasi platform.",
};

const channels = [
  {
    icon: "📧",
    title: "Email Umum",
    desc: "Untuk pertanyaan umum, saran fitur, atau informasi platform.",
    value: "hello@neodeeps.id",
    href: "mailto:hello@neodeeps.id",
    gradient: "from-teal-400 to-teal-600",
  },
  {
    icon: "🔒",
    title: "Privasi & Data",
    desc: "Permintaan akses, koreksi, atau penghapusan data pribadi.",
    value: "privasi@neodeeps.id",
    href: "mailto:privasi@neodeeps.id",
    gradient: "from-teal-500 to-amber-400",
  },
  {
    icon: "🛡️",
    title: "Moderasi & Laporan",
    desc: "Laporkan pelanggaran, pelecehan, atau konten yang melanggar aturan.",
    value: "moderasi@neodeeps.id",
    href: "mailto:moderasi@neodeeps.id",
    gradient: "from-amber-400 to-amber-500",
  },
  {
    icon: "🤝",
    title: "Kerjasama & Media",
    desc: "Kemitraan komunitas, event bersama, atau kerjasama media.",
    value: "partnership@neodeeps.id",
    href: "mailto:partnership@neodeeps.id",
    gradient: "from-teal-600 to-teal-400",
  },
];

const socials = [
  { name: "Instagram", handle: "@neodeeps.id", href: "https://instagram.com/neodeeps.id", icon: "📸" },
  { name: "Twitter / X", handle: "@neodeeps_id", href: "https://twitter.com/neodeeps_id", icon: "🐦" },
  { name: "Discord", handle: "Neodeeps Community", href: "#", icon: "💬", note: "Segera hadir" },
  { name: "LinkedIn", handle: "Neodeeps", href: "#", icon: "💼", note: "Segera hadir" },
];

const faqs = [
  {
    q: "Berapa lama waktu respons email?",
    a: "Tim kami biasanya merespons dalam 1–3 hari kerja. Untuk laporan moderasi yang mendesak, kami berusaha merespons dalam 24 jam.",
  },
  {
    q: "Bagaimana cara melaporkan pelanggaran?",
    a: "Gunakan tombol Laporkan di dalam platform, atau kirim email ke moderasi@neodeeps.id dengan detail lengkap termasuk tangkapan layar jika ada.",
  },
  {
    q: "Apakah Neodeeps menerima kerjasama komunitas?",
    a: "Ya! Kami terbuka untuk kemitraan dengan komunitas, organisasi, dan event organizer. Hubungi partnership@neodeeps.id dengan proposal singkat.",
  },
];

export default function KontakPage() {
  return (
    <div className="flex min-h-full flex-col bg-[var(--neo-bg)]">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-teal-100/70">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_-10%,rgba(20,184,166,0.12),transparent_55%),radial-gradient(ellipse_60%_50%_at_80%_30%,rgba(245,158,11,0.09),transparent_50%)]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
            <p className="mb-4 inline-flex items-center rounded-full border border-teal-200/70 bg-white px-4 py-1.5 text-sm font-semibold text-teal-800 shadow-sm">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[var(--brand-primary)] shadow-[0_0_12px_rgba(20,184,166,0.45)]" />
              Kami siap mendengar
            </p>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              Hubungi{" "}
              <span className="bg-gradient-to-r from-teal-500 via-teal-400 to-amber-400 bg-clip-text text-transparent">
                Neodeeps
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
              Punya pertanyaan, saran, atau ingin berkolaborasi? Tim kami siap membantu. Pilih saluran komunikasi yang
              paling sesuai dengan kebutuhanmu.
            </p>
          </div>
        </section>

        {/* Saluran Email */}
        <section className="border-b border-teal-100/70 bg-[var(--neo-bg-strong)] py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900">Saluran Komunikasi</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-base text-gray-500">
              Setiap topik punya alamat email khusus agar pesanmu sampai ke tim yang tepat.
            </p>
            <ul className="mt-12 grid gap-6 sm:grid-cols-2">
              {channels.map((ch) => (
                <li
                  key={ch.title}
                  className="group rounded-3xl border border-gray-100 bg-white p-7 shadow-[0_8px_40px_-24px_rgba(20,184,166,0.15)] transition hover:-translate-y-[2px] hover:shadow-[0_16px_50px_-32px_rgba(20,184,166,0.25)]"
                >
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${ch.gradient} text-2xl shadow-md`}>
                    {ch.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{ch.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{ch.desc}</p>
                  <a
                    href={ch.href}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-teal-600 transition group-hover:text-teal-700"
                  >
                    {ch.value}
                    <span aria-hidden>→</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Media Sosial */}
        <section className="border-b border-teal-100/70 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900">Media Sosial</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-base text-gray-500">
              Ikuti kami untuk update fitur, tips komunitas, dan cerita inspiratif dari anggota Neodeeps.
            </p>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {socials.map((s) => (
                <li
                  key={s.name}
                  className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition hover:-translate-y-[1px]"
                >
                  <div className="text-3xl">{s.icon}</div>
                  <p className="mt-3 font-bold text-gray-900">{s.name}</p>
                  {s.note ? (
                    <p className="mt-1 text-xs font-semibold text-gray-400">{s.note}</p>
                  ) : (
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-sm font-semibold text-teal-600 hover:underline"
                    >
                      {s.handle}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Info Platform */}
        <section className="border-b border-teal-100/70 bg-[var(--neo-bg-strong)] py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900">Informasi Platform</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                {
                  icon: "🕐",
                  title: "Jam Operasional",
                  items: ["Senin – Jumat: 09.00 – 18.00 WIB", "Sabtu: 10.00 – 14.00 WIB", "Minggu & libur: email saja"],
                },
                {
                  icon: "🌍",
                  title: "Wilayah Layanan",
                  items: ["Indonesia (seluruh provinsi)", "Bahasa: Bahasa Indonesia", "Zona waktu: WIB / WITA / WIT"],
                },
                {
                  icon: "📋",
                  title: "Dokumen Penting",
                  items: [
                    { label: "Kebijakan Privasi", href: "/privasi#privasi" },
                    { label: "Ketentuan Penggunaan", href: "/privasi#ketentuan" },
                    { label: "Tutorial Penggunaan", href: "/tutorial" },
                  ],
                },
              ].map((info) => (
                <div
                  key={info.title}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <div className="text-2xl">{info.icon}</div>
                  <h3 className="mt-3 font-bold text-gray-900">{info.title}</h3>
                  <ul className="mt-3 space-y-1.5">
                    {info.items.map((item) =>
                      typeof item === "string" ? (
                        <li key={item} className="text-sm text-gray-500">
                          {item}
                        </li>
                      ) : (
                        <li key={item.label}>
                          <Link href={item.href} className="text-sm font-semibold text-teal-600 hover:underline">
                            {item.label}
                          </Link>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Singkat */}
        <section className="border-b border-teal-100/70 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900">Pertanyaan Umum</h2>
            <div className="mt-10 space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900">{faq.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Belum punya akun?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              Bergabung dengan Neodeeps dan mulai temukan komunitas yang sesuai dengan minatmu.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-400/35 transition hover:brightness-105"
              >
                Daftar gratis
              </Link>
              <Link
                href="/tutorial"
                className="inline-flex items-center justify-center rounded-full border-2 border-gray-200 bg-white px-8 py-3.5 text-sm font-bold text-gray-700 transition hover:border-teal-300 hover:bg-teal-50"
              >
                Lihat tutorial
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
