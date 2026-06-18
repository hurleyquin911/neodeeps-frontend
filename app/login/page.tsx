import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-full flex-col bg-[var(--brand-bg)] lg:min-h-dvh lg:flex-row">
      {/* Subtle background blobs */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_0%_0%,rgba(20,184,166,0.09),transparent_52%),radial-gradient(ellipse_90%_60%_at_100%_10%,rgba(245,158,11,0.07),transparent_48%)]" />

      {/* Panel kiri — sapaan */}
      <aside className="relative z-10 flex flex-col justify-between border-b border-teal-100/80 bg-white/80 px-6 py-12 backdrop-blur-[2px] sm:px-10 lg:w-[42%] lg:max-w-md lg:border-b-0 lg:border-r lg:py-16">
        {/* dekorasi blob */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-12 -top-12 h-52 w-52 rounded-full bg-gradient-to-br from-teal-200/30 to-transparent blur-3xl" />
          <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-gradient-to-tl from-amber-200/25 to-transparent blur-3xl" />
        </div>

        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2.5 font-extrabold text-gray-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-700 text-sm font-black text-white shadow-md shadow-teal-400/35">
              n
            </span>
            Neodeeps
          </Link>
          <p className="mt-10 text-[11px] font-bold uppercase tracking-[0.3em] text-teal-700">Sudah kangen komunitas?</p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight text-gray-900 sm:text-[2rem]">
            Masuk, lanjut obrol santai Anda.
          </h1>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-gray-600">
            Satu kata sandi, banyak cerita baru. Yuk balik lagi ke ruang yang hangat ✨
          </p>
        </div>

        <div className="relative mt-14 hidden lg:block">
          <div className="rounded-3xl border border-teal-100/80 bg-teal-50/60 p-6 text-sm text-gray-700 shadow-inner">
            <p className="font-semibold text-gray-800">Tips kecil:</p>
            <p className="mt-2 leading-relaxed text-gray-600">Pakai WiFi rumah lebih nyaman daripada sinyal jalan untuk verifikasi email nanti 😉</p>
          </div>
        </div>
      </aside>

      {/* Form kanan */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-5 py-12 sm:px-8 lg:py-16">
        <div className="w-full max-w-[420px] rounded-[1.75rem] border border-gray-100 bg-white p-8 shadow-[0_28px_80px_-44px_rgba(20,184,166,0.25)] sm:p-10">
          <h2 className="text-xl font-extrabold text-gray-900">Masuk ke akun</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Email atau nama pengguna + kata sandi — sama kayak biasanya, tanpa drama.
          </p>
          <Suspense fallback={<div className="mt-8 h-48 animate-pulse rounded-2xl bg-teal-50/70" aria-hidden />}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
