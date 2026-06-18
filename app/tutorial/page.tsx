import Link from "next/link";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";

export const metadata = {
  title: "Tutorial — Neodeeps",
  description: "Panduan lengkap cara menggunakan Neodeeps untuk menemukan dan bergabung dengan komunitas favoritmu.",
};

const steps = [
  {
    step: "01",
    title: "Buat akun dalam 2 menit",
    desc: "Daftar dengan email atau akun Google kamu. Tidak perlu kartu kredit — fitur dasar selalu gratis.",
    tips: [
      "Gunakan nama tampilan yang mencerminkan dirimu",
      "Tambahkan foto profil agar mudah dikenali",
      "Pilih minat awal untuk rekomendasi yang lebih akurat",
    ],
    gradient: "from-teal-400 to-teal-600",
    icon: "👤",
  },
  {
    step: "02",
    title: "Jelajahi komunitas",
    desc: "Gunakan fitur Explore untuk menemukan komunitas berdasarkan minat, lokasi, atau kata kunci.",
    tips: [
      "Filter berdasarkan kota atau region terdekat",
      "Gunakan tag minat seperti #photography, #coding, #hiking",
      "Cek 'Komunitas Aktif' untuk yang paling sering update",
    ],
    gradient: "from-amber-400 to-amber-500",
    icon: "🔍",
  },
  {
    step: "03",
    title: "Bergabung dengan komunitas",
    desc: "Temukan komunitas yang cocok dan klik Bergabung. Beberapa komunitas terbuka, beberapa perlu persetujuan admin.",
    tips: [
      "Baca deskripsi dan aturan komunitas sebelum bergabung",
      "Perkenalkan dirimu di channel #perkenalan jika tersedia",
      "Mulai berinteraksi dengan merespons postingan anggota lain",
    ],
    gradient: "from-teal-500 to-amber-400",
    icon: "🤝",
  },
  {
    step: "04",
    title: "Ikuti event & gathering",
    desc: "Setiap komunitas bisa punya jadwal event. Daftar acara yang menarik dan temui anggota lain secara langsung.",
    tips: [
      "Aktifkan notifikasi event agar tidak ketinggalan",
      "Konfirmasi kehadiran tepat waktu agar admin bisa mempersiapkan",
      "Bagikan pengalaman setelah event untuk memotivasi yang lain",
    ],
    gradient: "from-amber-300 to-teal-400",
    icon: "📅",
  },
  {
    step: "05",
    title: "Buat komunitas sendiri",
    desc: "Punya ide komunitas? Kamu bisa buat komunitas sendiri dan undang teman-teman yang sefrekuensi.",
    tips: [
      "Tentukan fokus yang spesifik agar anggota yang tepat bergabung",
      "Buat aturan komunitas yang jelas sejak awal",
      "Jadwalkan gathering perdana untuk momentum yang kuat",
    ],
    gradient: "from-teal-600 to-teal-400",
    icon: "🚀",
  },
];

const faqs = [
  {
    q: "Apakah Neodeeps gratis?",
    a: "Ya! Fitur inti Neodeeps — menjelajahi komunitas, bergabung, mengikuti event — sepenuhnya gratis. Kami mungkin menghadirkan fitur premium di masa depan, tapi akses dasar akan selalu tersedia.",
  },
  {
    q: "Apakah saya perlu mengungkap identitas asli?",
    a: "Tidak wajib. Kamu bisa menggunakan nama tampilan apa pun. Namun, profil yang lebih lengkap umumnya mendapat kepercayaan lebih tinggi dari anggota komunitas lain.",
  },
  {
    q: "Bagaimana jika ada anggota yang berperilaku tidak baik?",
    a: "Setiap komunitas punya admin yang bisa mengelola anggota. Kamu juga bisa melaporkan konten atau pengguna melalui tombol Laporkan. Tim moderasi Neodeeps akan menindaklanjuti.",
  },
  {
    q: "Bisakah saya membuat lebih dari satu komunitas?",
    a: "Bisa! Tidak ada batasan jumlah komunitas yang bisa kamu buat. Pastikan kamu punya kapasitas untuk mengelola setiap komunitas dengan baik.",
  },
  {
    q: "Apakah ada aplikasi mobile Neodeeps?",
    a: "Saat ini Neodeeps tersedia di browser mobile yang sudah dioptimasi. Aplikasi native sedang dalam pengembangan — pantau terus update kami!",
  },
];

export default function TutorialPage() {
  return (
    <div className="flex min-h-full flex-col bg-[var(--neo-bg)]">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-teal-100/70">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_15%_-10%,rgba(20,184,166,0.11),transparent_55%),radial-gradient(ellipse_50%_40%_at_85%_20%,rgba(245,158,11,0.09),transparent_50%)]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
            <p className="mb-4 inline-flex items-center rounded-full border border-teal-200/70 bg-white px-4 py-1.5 text-sm font-semibold text-teal-800 shadow-sm">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[var(--brand-primary)] shadow-[0_0_12px_rgba(20,184,166,0.45)]" />
              Panduan lengkap
            </p>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              Tutorial{" "}
              <span className="bg-gradient-to-r from-teal-500 via-teal-400 to-amber-400 bg-clip-text text-transparent">
                Neodeeps
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
              Mulai dari nol hingga jadi anggota komunitas aktif. Ikuti langkah-langkah berikut dan temukan pengalaman
              sosial yang terasa natural.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="border-b border-teal-100/70 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900">5 Langkah Memulai</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-base text-gray-500">
              Dari mendaftar hingga mengelola komunitas sendiri — semua bisa dilakukan dalam hari yang sama.
            </p>
            <div className="mt-14 space-y-8">
              {steps.map((s, i) => (
                <div
                  key={s.step}
                  className={`flex flex-col gap-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-[0_8px_40px_-24px_rgba(20,184,166,0.15)] transition hover:-translate-y-[1px] sm:flex-row ${i % 2 !== 0 ? "sm:flex-row-reverse" : ""}`}
                >
                  <div className="flex-shrink-0">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${s.gradient} text-3xl shadow-md`}>
                      {s.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full bg-gradient-to-r ${s.gradient} px-3 py-0.5 text-xs font-black text-white`}>
                        LANGKAH {s.step}
                      </span>
                    </div>
                    <h3 className="mt-3 text-xl font-bold text-gray-900">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{s.desc}</p>
                    <ul className="mt-4 space-y-2">
                      {s.tips.map((tip) => (
                        <li key={tip} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="mt-0.5 text-teal-500">→</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tips Cepat */}
        <section className="border-b border-teal-100/70 bg-[var(--neo-bg-strong)] py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900">Tips Cepat</h2>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: "🔔", title: "Aktifkan notifikasi", desc: "Agar tidak ketinggalan event dan update terbaru dari komunitas yang kamu ikuti." },
                { icon: "📝", title: "Lengkapi profil", desc: "Profil lengkap meningkatkan kepercayaan anggota lain dan mempermudah networking." },
                { icon: "💬", title: "Mulai dengan reply", desc: "Tidak perlu langsung posting — cukup balas postingan orang lain untuk mulai berinteraksi." },
                { icon: "📍", title: "Aktifkan lokasi", desc: "Temukan komunitas dan event terdekat berdasarkan kota atau area kamu." },
                { icon: "🏷️", title: "Gunakan tag minat", desc: "Tag memudahkan orang menemukan konten dan acara yang relevan denganmu." },
                { icon: "🤲", title: "Saling support", desc: "Komunitas terbaik dibangun dari kebiasaan saling mendukung, bukan kompetisi." },
              ].map((tip) => (
                <li
                  key={tip.title}
                  className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <span className="text-2xl">{tip.icon}</span>
                  <div>
                    <p className="font-bold text-gray-900">{tip.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-500">{tip.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-b border-teal-100/70 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900">
              Pertanyaan yang Sering Diajukan
            </h2>
            <div className="mt-12 space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <h3 className="font-bold text-gray-900">{faq.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-sm text-gray-500">
              Masih ada pertanyaan?{" "}
              <Link href="/kontak" className="font-semibold text-teal-600 hover:underline">
                Hubungi kami
              </Link>{" "}
              dan kami akan siap membantu.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Sudah siap memulai?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              Daftar gratis sekarang dan mulai perjalanan komunitas kamu bersama Neodeeps.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-teal-600 px-10 py-4 text-sm font-bold text-white shadow-xl shadow-teal-400/30 transition hover:brightness-105"
            >
              Mulai sekarang — gratis
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
