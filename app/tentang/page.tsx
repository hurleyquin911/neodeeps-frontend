import Link from "next/link";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";

export const metadata = {
  title: "Tentang Neodeeps",
  description: "Kenali lebih dalam platform komunitas Neodeeps — visi, misi, dan nilai yang kami pegang.",
};

export default function TentangPage() {
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
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
            <p className="mb-4 inline-flex items-center rounded-full border border-teal-200/70 bg-white px-4 py-1.5 text-sm font-semibold text-teal-800 shadow-sm">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[var(--brand-primary)] shadow-[0_0_12px_rgba(20,184,166,0.45)]" />
              Cerita di balik platform
            </p>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              Tentang{" "}
              <span className="bg-gradient-to-r from-teal-500 via-teal-400 to-amber-400 bg-clip-text text-transparent">
                Neodeeps
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
              Platform komunitas yang lahir dari keresahan sederhana: susahnya menemukan orang-orang yang satu frekuensi
              di tengah keramaian media sosial.
            </p>
          </div>
        </section>

        {/* Asal Usul */}
        <section className="border-b border-teal-100/70 bg-[var(--neo-bg-strong)] py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Kenapa Neodeeps?</h2>
              <p className="mt-5 text-base leading-relaxed text-gray-600">
                Kami percaya bahwa koneksi manusia yang bermakna tidak seharusnya terasa rumit. Terlalu banyak platform
                yang membuat kita tenggelam dalam notifikasi, algoritma, dan keramaian yang justru membuat kita semakin
                merasa sendirian.
              </p>
              <p className="mt-4 text-base leading-relaxed text-gray-600">
                Neodeeps hadir sebagai ruang yang berbeda — tempat di mana kamu bisa menemukan komunitas berdasarkan
                minat nyata, bukan hanya follower count. Di sini, kedekatan dibangun lewat interaksi yang jujur, bukan
                performa di depan layar.
              </p>
            </div>
          </div>
        </section>

        {/* Visi & Misi */}
        <section className="border-b border-teal-100/70 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900">Visi &amp; Misi</h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              <div className="rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-8 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-2xl">
                  🌟
                </div>
                <h3 className="text-xl font-bold text-gray-900">Visi</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  Menjadi platform komunitas terpercaya yang menghubungkan setiap orang dengan lingkaran sosial yang
                  hangat, autentik, dan bermakna — di mana pun mereka berada di Indonesia.
                </p>
              </div>
              <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-8 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
                  🎯
                </div>
                <h3 className="text-xl font-bold text-gray-900">Misi</h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-gray-600">
                  <li className="flex gap-2">
                    <span className="mt-0.5 text-teal-500">✓</span>
                    Memudahkan siapapun menemukan komunitas sesuai minat dengan cepat
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 text-teal-500">✓</span>
                    Mendorong interaksi offline yang hangat melalui event dan gathering
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 text-teal-500">✓</span>
                    Membangun ekosistem komunitas yang aman, inklusif, dan bebas tekanan
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 text-teal-500">✓</span>
                    Selalu gratis untuk fitur dasar — akses komunitas untuk semua
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Nilai */}
        <section className="border-b border-teal-100/70 bg-[var(--neo-bg-strong)] py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900">Nilai yang Kami Pegang</h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-base text-gray-500">
              Prinsip-prinsip ini membentuk setiap keputusan yang kami buat dalam membangun Neodeeps.
            </p>
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { emoji: "🤝", title: "Autentisitas", desc: "Jadilah dirimu sendiri. Kami menghargai kejujuran di atas kepopuleran." },
                { emoji: "🌏", title: "Inklusivitas", desc: "Semua orang berhak punya komunitas, apapun latar belakangnya." },
                { emoji: "🔒", title: "Keamanan", desc: "Privasi dan keamanan anggota adalah prioritas, bukan tambahan." },
                { emoji: "💚", title: "Kesejahteraan", desc: "Platform yang tidak membuat ketagihan — hubungan nyata di atas metrik." },
              ].map((val) => (
                <li
                  key={val.title}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_8px_30px_-20px_rgba(20,184,166,0.15)] transition hover:-translate-y-[2px]"
                >
                  <div className="mb-3 text-3xl">{val.emoji}</div>
                  <h3 className="font-bold text-gray-900">{val.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{val.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Tim */}
        <section className="border-b border-teal-100/70 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900">Siapa Kami?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-gray-600">
              Kami adalah tim kecil yang bersemangat — pengembang, desainer, dan pembangun komunitas yang percaya bahwa
              teknologi bisa membuat hubungan manusia lebih bermakna.
            </p>
            <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-teal-100 bg-gradient-to-r from-teal-50 to-amber-50/50 p-8 text-center shadow-sm">
              <p className="text-base leading-relaxed text-gray-600">
                Neodeeps dibangun dengan cinta dari Indonesia 🇮🇩 untuk semua orang yang pernah merasa kewalahan mencari
                teman dengan minat yang sama. Kami ada di sini untuk membuat proses itu lebih mudah, hangat, dan menyenangkan.
              </p>
              <Link
                href="/kontak"
                className="mt-6 inline-flex items-center justify-center rounded-full border-2 border-teal-200 bg-white px-6 py-2.5 text-sm font-bold text-teal-700 transition hover:bg-teal-50"
              >
                Hubungi kami →
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Siap jadi bagian dari{" "}
              <span className="text-teal-500">Neodeeps</span>?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              Gabung sekarang dan mulai temukan komunitas yang terasa seperti rumah.
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
