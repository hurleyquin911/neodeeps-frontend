import Link from "next/link";
import { RegisterForm } from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[var(--brand-bg)]">
      {/* Background blobs */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_8%_-5%,rgba(20,184,166,0.09),transparent_50%),radial-gradient(ellipse_90%_60%_at_95%_-10%,rgba(245,158,11,0.07),transparent_50%)]"
        aria-hidden
      />

      <div className="relative z-10 flex w-full flex-col lg:min-h-dvh lg:flex-row">
        {/* Panel kiri */}
        <aside className="relative flex flex-shrink-0 flex-col justify-between border-b border-teal-100/75 bg-white/85 px-6 py-10 backdrop-blur-sm sm:px-10 lg:w-[40%] lg:max-w-lg lg:border-b-0 lg:border-r lg:px-12 lg:py-14">
          <div className="pointer-events-none absolute inset-0 overflow-hidden lg:rounded-br-[3rem]">
            <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-gradient-to-br from-teal-300/20 to-transparent blur-3xl" />
            <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-gradient-to-tr from-amber-200/20 to-transparent blur-3xl" />
          </div>

          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-2.5 font-extrabold text-gray-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-700 text-sm font-black text-white shadow-md shadow-teal-400/35">
                n
              </span>
              Neodeeps
            </Link>
            <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.32em] text-teal-700">Gabung santai • tanpa jargon</p>
          </div>

          <div className="relative mt-8 space-y-4 lg:mt-14">
            <h1 className="text-[1.95rem] font-extrabold leading-[1.2] tracking-tight text-gray-900 sm:text-[2.2rem]">
              Satu form buat masa depan koneksi yang lebih fun.
            </h1>
            <p className="max-w-md text-base leading-relaxed text-gray-600">
              Ceritakan tentang kamu sekali biar orang-orang tepat bisa nyapa dengan hangat ketika kalian ketemu.
            </p>
          </div>

          <div className="relative mt-10 hidden lg:block lg:mt-auto lg:pb-4">
            <div className="rounded-3xl border border-teal-100/75 bg-teal-50/60 p-5 text-[13px] leading-relaxed text-gray-700">
              Dengan bikin akun kamu udah dukung ruang sosial yang gak menghakimi 👋 Terima kasih sudah ada di sini.
            </div>
          </div>
        </aside>

        {/* Form kanan */}
        <main className="relative flex flex-1 flex-col justify-center bg-white px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
          <div className="mx-auto w-full max-w-xl">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.26em] text-teal-700">Registrasi</p>
            <h2 className="text-[1.7rem] font-extrabold tracking-tight text-gray-900 sm:text-[1.95rem]">Lengkapin profil awalmu 🇮🇩</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Gratis, mesra-pemula — data ini juga kami pakai supaya orang-orang tepat bisa menemukanmu.
            </p>
            <RegisterForm />
          </div>
        </main>
      </div>
    </div>
  );
}
