import Link from "next/link";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";

export const metadata = {
  title: "Privasi & Ketentuan — Neodeeps",
  description: "Kebijakan Privasi dan Ketentuan Penggunaan platform Neodeeps.",
};

const sections = [
  {
    id: "privasi",
    title: "Kebijakan Privasi",
    lastUpdated: "7 Juni 2026",
    content: [
      {
        heading: "1. Data yang Kami Kumpulkan",
        body: `Kami mengumpulkan data yang kamu berikan secara langsung saat mendaftar dan menggunakan Neodeeps, meliputi:
        
• Informasi akun: nama tampilan, alamat email, foto profil (opsional)
• Informasi profil: minat, lokasi kota (opsional), bio
• Konten yang kamu buat: postingan di komunitas, komentar, deskripsi event
• Data penggunaan: komunitas yang diikuti, event yang dihadiri, waktu aktivitas

Kami juga mengumpulkan data teknis secara otomatis:
• Alamat IP dan informasi perangkat/browser
• Log aktivitas untuk keperluan keamanan dan debugging
• Cookie dan penyimpanan lokal untuk menjaga sesi login`,
      },
      {
        heading: "2. Cara Kami Menggunakan Data",
        body: `Data yang kami kumpulkan digunakan untuk:

• Menyediakan dan meningkatkan layanan Neodeeps
• Memberikan rekomendasi komunitas dan event yang relevan
• Mengirim notifikasi terkait aktivitas komunitas kamu (bisa dinonaktifkan)
• Memastikan keamanan platform dan mencegah penyalahgunaan
• Menganalisis tren penggunaan secara agregat (anonim) untuk pengembangan fitur

Kami TIDAK menjual data pribadimu kepada pihak ketiga manapun.`,
      },
      {
        heading: "3. Berbagi Data dengan Pihak Ketiga",
        body: `Kami hanya berbagi data dalam kondisi terbatas:

• Penyedia layanan infrastruktur (server, database) yang terikat perjanjian kerahasiaan
• Penegak hukum jika diwajibkan oleh peraturan perundang-undangan yang berlaku
• Anggota komunitas lain — hanya data profil publik yang kamu pilih untuk ditampilkan

Setiap integrasi pihak ketiga (misalnya login Google) mengikuti kebijakan privasi mereka masing-masing.`,
      },
      {
        heading: "4. Keamanan Data",
        body: `Kami menerapkan langkah-langkah keamanan standar industri:

• Enkripsi data saat transit (HTTPS/TLS) dan saat penyimpanan
• Kata sandi di-hash menggunakan algoritma bcrypt
• Akses data internal dibatasi sesuai prinsip least privilege
• Pemantauan keamanan dan audit log secara rutin

Meski demikian, tidak ada sistem yang 100% aman. Kami mendorong kamu untuk menggunakan kata sandi yang kuat dan unik.`,
      },
      {
        heading: "5. Hak Kamu atas Data",
        body: `Kamu memiliki hak penuh atas data pribadimu:

• Akses: lihat semua data yang kami simpan tentang kamu melalui pengaturan akun
• Koreksi: perbarui informasi yang tidak akurat kapan saja
• Hapus: hapus akun beserta semua datamu secara permanen dari pengaturan
• Ekspor: minta salinan datamu dalam format yang dapat dibaca mesin
• Keberatan: nonaktifkan jenis notifikasi tertentu dari pengaturan notifikasi

Untuk menggunakan hak-hak ini, kunjungi halaman Pengaturan atau hubungi kami.`,
      },
      {
        heading: "6. Retensi Data",
        body: `Kami menyimpan data selama akun kamu aktif. Setelah penghapusan akun:

• Data profil dan konten publik dihapus dalam 30 hari
• Data log keamanan disimpan hingga 90 hari untuk keperluan forensik
• Beberapa data mungkin disimpan lebih lama jika diwajibkan hukum

Konten yang sudah dibagikan di komunitas publik mungkin masih terlihat untuk sementara selama proses penghapusan.`,
      },
      {
        heading: "7. Cookie",
        body: `Neodeeps menggunakan cookie untuk:

• Menjaga sesi login kamu tetap aktif
• Menyimpan preferensi tampilan
• Menganalisis penggunaan platform secara agregat (anonim)

Kamu dapat mengelola atau menonaktifkan cookie melalui pengaturan browser, namun beberapa fitur mungkin tidak berfungsi optimal.`,
      },
    ],
  },
  {
    id: "ketentuan",
    title: "Ketentuan Penggunaan",
    lastUpdated: "7 Juni 2026",
    content: [
      {
        heading: "1. Penerimaan Ketentuan",
        body: `Dengan mendaftar atau menggunakan Neodeeps, kamu menyatakan setuju dengan Ketentuan Penggunaan ini. Jika kamu tidak setuju, harap hentikan penggunaan layanan kami.

Kami berhak memperbarui ketentuan ini sewaktu-waktu. Perubahan signifikan akan diberitahukan melalui email atau notifikasi in-app. Penggunaan berkelanjutan setelah perubahan dianggap sebagai penerimaan ketentuan baru.`,
      },
      {
        heading: "2. Kelayakan Pengguna",
        body: `Untuk menggunakan Neodeeps, kamu harus:

• Berusia minimal 17 tahun, atau memiliki izin orang tua/wali jika di bawah itu
• Memberikan informasi pendaftaran yang akurat dan tidak menyesatkan
• Hanya membuat satu akun per orang (kecuali untuk akun organisasi yang diizinkan)
• Tidak pernah dilarang menggunakan layanan kami sebelumnya`,
      },
      {
        heading: "3. Konten yang Dilarang",
        body: `Dilarang keras memposting atau membagikan konten yang:

• Mengandung kebencian, diskriminasi berdasarkan SARA, atau ujaran kebencian
• Bersifat pornografi, eksploitasi anak, atau konten seksual eksplisit
• Mengandung ancaman, intimidasi, atau pelecehan terhadap individu maupun kelompok
• Melanggar hak cipta atau hak kekayaan intelektual pihak lain
• Merupakan spam, phishing, atau penipuan dalam bentuk apapun
• Mengandung malware, virus, atau kode berbahaya
• Menyebarkan informasi palsu (hoaks) yang berpotensi merugikan`,
      },
      {
        heading: "4. Aturan Komunitas",
        body: `Setiap komunitas di Neodeeps dapat menetapkan aturan tambahan. Sebagai anggota, kamu wajib:

• Menghormati aturan spesifik setiap komunitas yang kamu ikuti
• Memperlakukan sesama anggota dengan sopan dan hormat
• Tidak melakukan promosi berlebihan atau spam di luar konteks komunitas
• Tidak menyalin dan menyebarkan konten komunitas privat ke luar tanpa izin

Pelanggaran aturan komunitas dapat mengakibatkan pengeluaran dari komunitas oleh admin.`,
      },
      {
        heading: "5. Hak Kekayaan Intelektual",
        body: `Konten yang kamu buat di Neodeeps tetap menjadi milikmu. Dengan mempostingnya, kamu memberikan Neodeeps lisensi non-eksklusif untuk menampilkan, mendistribusikan, dan mempromosikan konten tersebut dalam platform.

Nama, logo, dan merek dagang Neodeeps adalah milik kami. Kamu tidak diizinkan menggunakannya tanpa izin tertulis.`,
      },
      {
        heading: "6. Penangguhan dan Penghentian Akun",
        body: `Kami berhak menangguhkan atau menghapus akun yang:

• Melanggar Ketentuan Penggunaan atau Kebijakan Privasi ini
• Terlibat dalam aktivitas yang merugikan pengguna lain atau platform
• Tidak aktif selama lebih dari 2 tahun tanpa aktivitas apapun

Kamu dapat mengajukan banding atas keputusan penangguhan melalui saluran kontak kami dalam 14 hari.`,
      },
      {
        heading: "7. Batasan Tanggung Jawab",
        body: `Neodeeps disediakan "sebagaimana adanya" (as-is). Kami tidak bertanggung jawab atas:

• Konten yang dibuat oleh pengguna lain
• Kerugian akibat gangguan layanan atau kehilangan data
• Interaksi offline antara anggota komunitas
• Layanan atau situs pihak ketiga yang terhubung dari platform kami

Penggunaan Neodeeps adalah risiko kamu sendiri. Harap selalu berhati-hati saat bertemu anggota komunitas secara offline.`,
      },
      {
        heading: "8. Hukum yang Berlaku",
        body: `Ketentuan ini tunduk pada hukum Republik Indonesia. Setiap sengketa yang tidak dapat diselesaikan secara musyawarah akan diselesaikan melalui pengadilan yang berwenang di Indonesia.`,
      },
    ],
  },
];

export default function PrivasiPage() {
  return (
    <div className="flex min-h-full flex-col bg-[var(--neo-bg)]">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-teal-100/70">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_10%_-10%,rgba(20,184,166,0.10),transparent_55%),radial-gradient(ellipse_50%_40%_at_90%_20%,rgba(245,158,11,0.08),transparent_50%)]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <p className="mb-4 inline-flex items-center rounded-full border border-teal-200/70 bg-white px-4 py-1.5 text-sm font-semibold text-teal-800 shadow-sm">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[var(--brand-primary)] shadow-[0_0_12px_rgba(20,184,166,0.45)]" />
              Transparansi &amp; kepercayaan
            </p>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              Privasi &amp; Ketentuan{" "}
              <span className="bg-gradient-to-r from-teal-500 via-teal-400 to-amber-400 bg-clip-text text-transparent">
                Penggunaan
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600">
              Kami percaya bahwa kepercayaan dibangun lewat transparansi. Baca bagaimana kami melindungi data dan hak
              kamu, serta apa yang kami harapkan dari penggunaan platform.
            </p>
            {/* Jump links */}
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#privasi"
                className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-5 py-2 text-sm font-semibold text-teal-700 shadow-sm transition hover:bg-teal-50"
              >
                🔒 Kebijakan Privasi
              </a>
              <a
                href="#ketentuan"
                className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-5 py-2 text-sm font-semibold text-amber-700 shadow-sm transition hover:bg-amber-50"
              >
                📋 Ketentuan Penggunaan
              </a>
            </div>
          </div>
        </section>

        {/* Ringkasan Singkat */}
        <section className="border-b border-teal-100/70 bg-[var(--neo-bg-strong)] py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-extrabold text-gray-900">Ringkasan Singkat (TL;DR)</h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-sm text-gray-500">
              Dokumen lengkap ada di bawah, tapi ini intinya:
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: "🚫", title: "Tidak Dijual", desc: "Data pribadimu tidak pernah dijual ke pihak manapun." },
                { icon: "🔐", title: "Terenkripsi", desc: "Semua data transit dan tersimpan dalam kondisi terenkripsi." },
                { icon: "🗑️", title: "Bisa Dihapus", desc: "Hapus akunmu kapanpun dan semua datamu ikut terhapus." },
                { icon: "✅", title: "Kamu Kontrolnya", desc: "Kamu punya kendali atas apa yang ditampilkan di profilmu." },
              ].map((item) => (
                <li
                  key={item.title}
                  className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-bold text-gray-900">{item.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Isi Dokumen */}
        {sections.map((sec) => (
          <section
            key={sec.id}
            id={sec.id}
            className="scroll-mt-20 border-b border-teal-100/70 py-16"
          >
            <div className="mx-auto max-w-4xl px-4 sm:px-6">
              <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">{sec.title}</h2>
                <span className="text-xs text-gray-400">Terakhir diperbarui: {sec.lastUpdated}</span>
              </div>
              <div className="space-y-8">
                {sec.content.map((block) => (
                  <div key={block.heading} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900">{block.heading}</h3>
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600">{block.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* Kontak */}
        <section className="py-20">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <div className="rounded-3xl border border-teal-100 bg-gradient-to-r from-teal-50 to-amber-50/60 p-10 shadow-sm">
              <p className="text-2xl font-extrabold text-gray-900">Ada pertanyaan tentang privasi?</p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Tim kami siap menjawab pertanyaan seputar data dan privasi kamu. Hubungi kami kapanpun.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Link
                  href="/kontak"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-teal-600 px-7 py-3 text-sm font-bold text-white shadow-md shadow-teal-400/30 transition hover:brightness-105"
                >
                  Hubungi Kami
                </Link>
                <Link
                  href="mailto:privasi@neodeeps.id"
                  className="inline-flex items-center justify-center rounded-full border-2 border-gray-200 bg-white px-7 py-3 text-sm font-bold text-gray-700 transition hover:border-teal-300 hover:bg-teal-50"
                >
                  privasi@neodeeps.id
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
