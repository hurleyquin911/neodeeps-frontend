"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAdminOverview, type AdminOverviewData } from "@/lib/api";
import { getStoredToken } from "@/lib/auth-storage";

function StatTile({
  label, value, sub, tone = "amber", icon,
}: { label: string; value: string | number; sub?: string; tone?: "amber" | "teal" | "gray" | "red"; icon: string }) {
  const colors = {
    amber: "bg-amber-50 text-amber-700 ring-amber-200/70",
    teal:  "bg-teal-50  text-teal-700  ring-teal-200/70",
    gray:  "bg-gray-50  text-gray-600  ring-gray-200/70",
    red:   "bg-red-50   text-red-700   ring-red-200/70",
  };
  return (
    <div className={`flex flex-col gap-3 rounded-2xl p-5 ring-1 ${colors[tone]}`}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-2xl font-extrabold">{value}</span>
      </div>
      <div>
        <p className="text-sm font-bold">{label}</p>
        {sub && <p className="text-xs opacity-70">{sub}</p>}
      </div>
    </div>
  );
}

function timeAgo(iso: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} mnt lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  return `${Math.floor(hrs / 24)} hari lalu`;
}

export function AdminOverviewClient() {
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) { setError("Belum login."); setLoading(false); return; }
    fetchAdminOverview(token)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="max-w-3xl space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Admin</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Selamat datang, Admin 👋
        </h1>
        <p className="text-base text-gray-600">
          Ringkasan platform dan antrian yang perlu kamu tindak lanjuti hari ini.
        </p>
      </header>

      {/* Stat tiles */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon="⏳"
          label="Menunggu moderasi"
          value={data.total_pending}
          sub={`${data.pending_events} acara · ${data.pending_communities} komunitas`}
          tone={data.total_pending > 0 ? "red" : "teal"}
        />
        <StatTile icon="👥" label="Total pengguna" value={data.total_users} sub={`+${data.new_users_week} minggu ini`} tone="amber" />
        <StatTile icon="📅" label="Acara aktif" value={data.published_events} sub="Status published" tone="teal" />
        <StatTile icon="🏘️" label="Komunitas aktif" value={data.published_communities} sub={`${data.total_memberships} keanggotaan`} tone="teal" />
      </section>

      {/* Antrian pending */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending events */}
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-amber-700">
              📅 Acara menunggu review
            </h2>
            <Link href="/dashboard/admin/moderation" className="text-xs font-bold text-teal-600 hover:underline">
              Lihat semua →
            </Link>
          </div>
          {data.recent_pending_events.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Tidak ada acara yang menunggu. 🎉</p>
          ) : (
            <ul className="space-y-3">
              {data.recent_pending_events.map((ev) => (
                <li key={ev.uuid} className="flex items-start justify-between gap-2 rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-900">{ev.title}</p>
                    <p className="text-xs text-gray-500">
                      {ev.creator?.name ?? "—"} · {timeAgo(ev.moderation_submitted_at ?? ev.created_at)}
                    </p>
                  </div>
                  <Link href="/dashboard/admin/moderation"
                    className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-200">
                    Tinjau
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Pending communities */}
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-amber-700">
              🏘️ Komunitas menunggu review
            </h2>
            <Link href="/dashboard/admin/moderation" className="text-xs font-bold text-teal-600 hover:underline">
              Lihat semua →
            </Link>
          </div>
          {data.recent_pending_communities.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Tidak ada komunitas yang menunggu. 🎉</p>
          ) : (
            <ul className="space-y-3">
              {data.recent_pending_communities.map((com) => (
                <li key={com.uuid} className="flex items-start justify-between gap-2 rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-900">{com.name}</p>
                    <p className="text-xs text-gray-500">
                      {com.creator?.name ?? "—"} · {com.primary_category ?? "—"} · {timeAgo(com.moderation_submitted_at ?? com.created_at)}
                    </p>
                  </div>
                  <Link href="/dashboard/admin/moderation"
                    className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-200">
                    Tinjau
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Quick links */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { href: "/dashboard/admin/moderation", icon: "🔍", title: "Antrian Moderasi", desc: "Approve atau tolak acara & komunitas baru" },
          { href: "/dashboard/admin/users", icon: "👤", title: "Manajemen Pengguna", desc: "Cari, lihat detail, dan kelola role pengguna" },
          { href: "/dashboard/admin/quota", icon: "⚡", title: "Manajemen Kuota", desc: "Konfirmasi pembayaran upgrade kuota pengguna" },
          { href: "/dashboard/admin/insights", icon: "📊", title: "Insight Platform", desc: "Statistik pengguna, acara, dan komunitas" },
        ].map((q) => (
          <Link key={q.href} href={q.href}
            className="flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-[2px] hover:shadow-md">
            <span className="text-3xl">{q.icon}</span>
            <div>
              <p className="font-extrabold text-gray-900">{q.title}</p>
              <p className="mt-0.5 text-sm text-gray-500">{q.desc}</p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
