"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchMe } from "@/lib/api";
import { getStoredToken } from "@/lib/auth-storage";
import type { UserMe } from "@/lib/api";

/* ── helpers ── */
function profileScore(u: UserMe): { pct: number; missing: string[] } {
  const checks: { field: keyof UserMe; label: string }[] = [
    { field: "name", label: "Nama lengkap" },
    { field: "username", label: "Nama pengguna" },
    { field: "email", label: "Email" },
    { field: "phone", label: "Nomor HP" },
    { field: "birth_date", label: "Tanggal lahir" },
    { field: "gender", label: "Gender" },
    { field: "city", label: "Kota" },
    { field: "occupation", label: "Pekerjaan" },
    { field: "bio", label: "Bio" },
    { field: "profile_photo_url", label: "Foto profil" },
  ];
  const missing = checks.filter((c) => !u[c.field]).map((c) => c.label);
  const pct = Math.round(((checks.length - missing.length) / checks.length) * 100);
  return { pct, missing };
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}

/* ── sub-components ── */
function ProfileBadge({ url, name }: { url?: string | null; name: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="h-14 w-14 rounded-2xl object-cover ring-2 ring-white shadow-md"
      />
    );
  }
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 text-xl font-extrabold text-white shadow-md ring-2 ring-white">
      {initials || "?"}
    </span>
  );
}

function CompletenessBar({ pct, missing }: { pct: number; missing: string[] }) {
  const color =
    pct >= 80 ? "bg-teal-500" : pct >= 50 ? "bg-amber-400" : "bg-red-400";
  const label =
    pct === 100
      ? "Profil lengkap! 🎉"
      : pct >= 80
        ? "Hampir sempurna!"
        : pct >= 50
          ? "Lumayan, tinggal sedikit lagi"
          : "Yuk lengkapin dulu";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-800">Kelengkapan profil</p>
        <span className="text-sm font-extrabold text-gray-900">{pct}%</span>
      </div>
      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">{label}</p>
      {missing.length > 0 && pct < 100 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {missing.slice(0, 4).map((m) => (
            <span
              key={m}
              className="rounded-full border border-dashed border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] font-semibold text-gray-500"
            >
              {m}
            </span>
          ))}
          {missing.length > 4 && (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-400">
              +{missing.length - 4} lagi
            </span>
          )}
        </div>
      )}
      <Link
        href="/dashboard/user/settings"
        className="mt-3 inline-flex text-xs font-bold text-teal-600 hover:underline"
      >
        Lengkapi di Pengaturan →
      </Link>
    </div>
  );
}

function QuickNav() {
  const items = [
    {
      href: "/dashboard/user/explore",
      icon: "🔍",
      title: "Jelajahi",
      desc: "Temukan komunitas & acara baru",
      tone: "teal",
    },
    {
      href: "/dashboard/user/gatherings",
      icon: "👥",
      title: "Perkumpulan saya",
      desc: "Komunitas yang kamu ikuti & kelola",
      tone: "teal",
    },
    {
      href: "/dashboard/user/events",
      icon: "📅",
      title: "Acara saya",
      desc: "Semua acara yang kamu daftarkan",
      tone: "amber",
    },
    {
      href: "/dashboard/user/settings",
      icon: "⚙️",
      title: "Pengaturan",
      desc: "Profil, kata sandi & preferensi",
      tone: "gray",
    },
  ];
  return (
    <section>
      <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Menu cepat</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-[2px] hover:border-teal-200 hover:shadow-md"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-xl transition group-hover:bg-teal-100">
              {it.icon}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900">{it.title}</p>
              <p className="text-xs text-gray-500">{it.desc}</p>
            </div>
            <span className="ml-auto shrink-0 text-gray-300 transition group-hover:text-teal-500">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
      <span className="mt-1 text-sm font-semibold text-gray-900 truncate">{value}</span>
    </div>
  );
}

/* ── main ── */
export function UserOverviewClient() {
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const token = getStoredToken();
        if (!token) throw new Error("Belum masuk.");
        const u = await fetchMe(token);
        if (!cancelled) setUser(u);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Gagal memuat.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-36 animate-pulse rounded-3xl bg-gray-100" />
        <div className="h-16 animate-pulse rounded-2xl bg-gray-100" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <span className="text-5xl">😕</span>
        <p className="text-base font-semibold text-gray-700">{error ?? "Sesi tidak ditemukan."}</p>
        <Link
          href="/login"
          className="rounded-full bg-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow hover:brightness-105"
        >
          Masuk kembali
        </Link>
      </div>
    );
  }

  const { pct, missing } = profileScore(user);
  const joined = user.created_at
    ? new Date(user.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long" })
    : "—";

  return (
    <div className="space-y-8">
      {/* Hero greeting */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 to-teal-700 p-7 text-white shadow-xl shadow-teal-500/20">
        <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-amber-400/20 blur-2xl" />
        <div className="relative flex items-center gap-5">
          <ProfileBadge url={user.profile_photo_url} name={user.name} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-teal-100">{greeting()},</p>
            <h1 className="mt-0.5 truncate text-2xl font-extrabold tracking-tight">
              {user.name} 👋
            </h1>
            <p className="mt-1 text-sm text-teal-200">
              @{user.username} · Bergabung {joined}
            </p>
          </div>
        </div>
        {user.bio && (
          <p className="relative mt-5 max-w-xl text-sm leading-relaxed text-teal-100 line-clamp-2">
            {user.bio}
          </p>
        )}
      </section>

      {/* Kelengkapan profil */}
      <CompletenessBar pct={pct} missing={missing} />

      {/* Info chips */}
      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Data singkat</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InfoChip label="Kota" value={user.city ?? "—"} />
          <InfoChip label="Pekerjaan" value={user.occupation ?? "—"} />
          <InfoChip label="MBTI" value={user.mbti ?? "—"} />
          <InfoChip label="Hobi" value={user.hobbies ?? "—"} />
        </div>
      </section>

      {/* Quick nav */}
      <QuickNav />

      {/* Banner tips */}
      <section className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
        <p className="text-sm font-bold text-amber-800">💡 Tip</p>
        <p className="mt-1.5 text-sm leading-relaxed text-amber-700">
          Profil yang lengkap membuat orang lebih mudah menemukan dan mengajakmu bergabung ke komunitas yang tepat.{" "}
          {pct < 100 && (
            <Link href="/dashboard/user/settings" className="font-bold underline underline-offset-2">
              Lengkapi sekarang ({100 - pct}% tersisa)
            </Link>
          )}
        </p>
      </section>
    </div>
  );
}
