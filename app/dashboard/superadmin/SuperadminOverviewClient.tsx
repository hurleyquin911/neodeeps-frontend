"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SuperadminOverviewDTO } from "@/lib/api";
import { fetchSuperadminOverview, getApiBase } from "@/lib/api";
import { ApiSoonNote } from "@/components/dashboard/superadmin/ApiSoonNote";
import { SuperadminPageHeader } from "@/components/dashboard/superadmin/SuperadminPageHeader";
import { SuperadminPanel } from "@/components/dashboard/superadmin/SuperadminPanel";
import { QuickLinkCard } from "@/components/dashboard/QuickLinkCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { getStoredToken } from "@/lib/auth-storage";

function formatInt(n: number): string {
  return new Intl.NumberFormat("id-ID").format(n);
}

function formatShortDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function buildActivityTimeline(d: SuperadminOverviewDTO) {
  const fromUsers = d.recent_user_registrations.map((u) => ({
    id: `u-${u.uuid}`,
    label: `Pendaftaran baru: @${u.username} (${u.name}) · peran ${u.role}`,
    at: new Date(u.created_at),
  }));
  const fromEvents = d.pending_review_events.map((ev) => ({
    id: `e-${ev.uuid}`,
    label: `Antrian moderasi: “${ev.title}” (${ev.gathering_type.replace(/_/g, " ")})`,
    at: new Date(ev.moderation_submitted_at || ev.created_at),
  }));
  return [...fromUsers, ...fromEvents].sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, 8);
}

export function SuperadminOverviewClient() {
  const [data, setData] = useState<SuperadminOverviewDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error("Belum ada token sesi — silakan masuk kembali.");
      }
      setData(await fetchSuperadminOverview(token));
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activityTimeline = useMemo(() => (data ? buildActivityTimeline(data) : []), [data]);

  let apiUnavailable = false;
  try {
    getApiBase();
  } catch {
    apiUnavailable = true;
  }

  return (
    <div className="space-y-10">
      <SuperadminPageHeader
        title="Ringkasan kontrol sistem"
        description="Metrik langsung dari database Neodeeps untuk super admin. Pembaruan setiap Anda membuka atau memuat ulang halaman ini."
      />

      {apiUnavailable && (
        <ApiSoonNote label="NEXT_PUBLIC_API_BASE_URL belum diset — tidak dapat memanggil /superadmin/overview." />
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 shadow-sm">
          <p className="font-bold">{error}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => load()}
              className="rounded-full bg-[var(--brand-primary)] px-4 py-2 text-xs font-bold text-white shadow-md hover:brightness-105"
            >
              Coba lagi
            </button>
            <Link href="/login" className="text-xs font-bold text-rose-800 underline underline-offset-2 hover:text-[var(--brand-primary)]">
              Ke halaman masuk
            </Link>
          </div>
        </div>
      )}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`sk-${String(i)}`}
              className="h-[108px] animate-pulse rounded-3xl border border-orange-50 bg-teal-50/55"
            />
          ))}
        </div>
      )}

      {!loading && data && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Pengguna aktif (±30 hari)"
              value={formatInt(data.users_active_30d)}
              hint={`${formatInt(data.users_total)} total terdaftar · berdasarkan updated_at`}
              tone="violet"
            />
            <StatCard
              label="Moderator aktif"
              value={formatInt(data.admin_count + data.superadmin_count)}
              hint={`${formatInt(data.admin_count)} admin · ${formatInt(data.superadmin_count)} super admin`}
              tone="violet"
            />
            <StatCard
              label="Antrian moderasi"
              value={formatInt(data.moderation_pending_count)}
              hint="Status pending_review pada event/perkumpulan"
              tone="gray"
            />
            <StatCard
              label="Kesehatan layanan"
              value={data.health.database === "connected" ? "OK" : "Error"}
              hint={
                data.health.database === "connected"
                  ? `Basis data OK · ${formatInt(data.events_published_count)} tayangan published`
                  : "Basis data tidak dapat dijangkau dari server API"
              }
              tone={data.health.database === "connected" ? "violet" : "gray"}
            />
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Pengguna peran biasa"
              value={formatInt(data.users_regular_count)}
              hint={`${formatInt(data.users_verified_count)} akun dengan email terverifikasi`}
              tone="gray"
            />
            <StatCard
              label="Event / perkumpulan"
              value={formatInt(data.events_total)}
              hint={`${formatInt(data.events_draft_count)} draf · ${formatInt(data.events_rejected_count)} ditolak moderasi`}
              tone="violet"
            />
            <StatCard
              label="Keanggotaan event"
              value={formatInt(data.event_memberships_total)}
              hint="Total baris di tb_event_memberships"
              tone="gray"
            />
            <StatCard
              label="Pesan obrolan"
              value={formatInt(data.chat_messages_total)}
              hint={`${formatInt(data.chat_messages_last_30d)} pesan ±30 hari terakhir`}
              tone="violet"
            />
          </section>

          <p className="text-[11px] leading-relaxed text-gray-500">
            “Pengguna aktif” memakai jumlah akun dengan{" "}
            <code className="rounded-lg bg-teal-50 px-1 py-px text-[10px] font-semibold text-gray-800 ring-1 ring-orange-100">
              updated_at
            </code>{" "}
            dalam 30 hari terakhir sebagai proksi aktivitas (bisa kamu gantikan kolom aktivitas eksplisit nanti).
          </p>
        </>
      )}

      <section>
        <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-gray-500">Modul dari sidebar</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickLinkCard
            href="/dashboard/superadmin/users"
            title="Pengguna"
            description="Kelola akun dan peran; data contoh bisa diganti menjadi API nyata."
            tone="violet"
          />
          <QuickLinkCard
            href="/dashboard/superadmin/moderation"
            title="Moderasi"
            description={`${data ? `${formatInt(data.moderation_pending_count)} tayangan menunggu tinjauan` : "Antrian moderasi platform"}`}
            tone="violet"
          />
          <QuickLinkCard href="/dashboard/superadmin/reports" title="Laporan" description="Gabungan laporan pengguna." tone="violet" />
          <QuickLinkCard
            href="/dashboard/superadmin/system"
            title="Sistem"
            description="Preferensi platform dan indikator kesehatan."
            tone="violet"
          />
        </div>
      </section>

      {!loading && data && (
        <SuperadminPanel title="Aktivitas terbaru · dari backend">
          <ul className="space-y-3 px-4 py-5 sm:px-5">
            {activityTimeline.length === 0 ? (
              <li className="py-10 text-center text-sm font-medium text-gray-500">
                Belum ada pendaftaran baru atau antrian moderasi untuk ditampilkan.
              </li>
            ) : (
              activityTimeline.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-teal-100/90 bg-teal-50/35 px-3 py-3 text-sm shadow-sm"
                >
                  <span className="flex min-w-0 items-start gap-2 text-gray-800">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" aria-hidden />
                    <span>{item.label}</span>
                  </span>
                  <time className="shrink-0 tabular-nums text-[11px] font-semibold text-gray-500" dateTime={item.at.toISOString()}>
                    {formatShortDate(item.at.toISOString())}
                  </time>
                </li>
              ))
            )}
          </ul>
        </SuperadminPanel>
      )}

      <section className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50/95 to-orange-50/40 p-6 shadow-sm">
        <h2 className="text-lg font-extrabold text-gray-900">Keamanan operasional</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-700">
          Endpoint{" "}
          <code className="rounded-lg bg-white/80 px-1.5 py-0.5 text-xs font-semibold text-violet-900 ring-1 ring-violet-100">
            GET /superadmin/overview
          </code>{" "}
          hanya boleh diakses dengan JWT superadmin. Jangan bocorkan snapshot mentah ke luar tim inti Anda.
        </p>
      </section>
    </div>
  );
}
