"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { fetchMyMemberships, fetchMyCreatedEvents, leaveEvent, type MembershipItem, type EventItem } from "@/lib/api";
import { getStoredToken } from "@/lib/auth-storage";

/* ── helpers ── */
const EVENT_TYPE = "scheduled_event";

function formatDate(iso: string, tz = "Asia/Jakarta") {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: tz,
    });
  } catch { return iso; }
}

function formatTime(iso: string, tz = "Asia/Jakarta") {
  try {
    return new Date(iso).toLocaleTimeString("id-ID", {
      hour: "2-digit", minute: "2-digit", timeZone: tz,
    });
  } catch { return ""; }
}

const MEM_STATUS_BADGE: Record<string, string> = {
  active: "bg-teal-100 text-teal-800",
  pending: "bg-amber-100 text-amber-800",
  waitlist: "bg-blue-100 text-blue-700",
  withdrawn: "bg-gray-100 text-gray-500",
  removed_by_host: "bg-red-100 text-red-700",
};

const MEM_STATUS_LABEL: Record<string, string> = {
  active: "Terdaftar",
  pending: "Menunggu",
  waitlist: "Antrean",
  withdrawn: "Dibatalkan",
  removed_by_host: "Dikeluarkan",
};

const EV_STATUS_BADGE: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  pending_review: "bg-amber-100 text-amber-700",
  published: "bg-teal-100 text-teal-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
  completed: "bg-violet-100 text-violet-700",
};

/* ── cards ── */
function UpcomingCard({ item, onLeave, leaving }: { item: MembershipItem; onLeave: (uuid: string) => void; leaving: string | null }) {
  const ev = item.membership_event;
  if (!ev) return null;
  const isLeaving = leaving === ev.uuid;
  const isPast = new Date(ev.starts_at) < new Date();

  return (
    <div className={`flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${isPast ? "border-gray-100 opacity-80" : "border-gray-100 hover:-translate-y-[2px]"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span className={`rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide ${MEM_STATUS_BADGE[item.status] ?? "bg-gray-100"}`}>
          {MEM_STATUS_LABEL[item.status] ?? item.status}
        </span>
        {item.guest_count > 0 && (
          <span className="text-xs font-semibold text-gray-500">+{item.guest_count} tamu</span>
        )}
      </div>
      <h3 className="text-base font-extrabold text-gray-900">{ev.title}</h3>
      {ev.summary && <p className="text-xs leading-relaxed text-gray-600 line-clamp-2">{ev.summary}</p>}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
        <span>📅 {formatDate(ev.starts_at, ev.timezone)}</span>
        <span>🕐 {formatTime(ev.starts_at, ev.timezone)}</span>
        {ev.ends_at && <span>– {formatTime(ev.ends_at, ev.timezone)}</span>}
        {ev.venue_name && <span>📍 {ev.venue_name}{ev.venue_city ? `, ${ev.venue_city}` : ""}</span>}
        {ev.is_free ? <span className="font-semibold text-teal-600">Gratis</span> : (
          <span className="font-semibold text-amber-700">
            {ev.price_currency ?? "IDR"} {Number(ev.price_amount ?? 0).toLocaleString("id-ID")}
          </span>
        )}
      </div>
      <div className="flex gap-2 pt-1">
        <Link href={`/dashboard/user/events/${ev.uuid}`} className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-teal-300 hover:text-teal-700">
          Lihat detail
        </Link>
        {["active", "pending", "waitlist"].includes(item.status) && !isPast && (
          <button type="button" disabled={isLeaving} onClick={() => onLeave(ev.uuid)}
            className="ml-auto rounded-full px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            {isLeaving ? "Membatalkan…" : "Batalkan"}
          </button>
        )}
      </div>
    </div>
  );
}

function HostingCard({ ev }: { ev: EventItem }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-[2px] hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span className={`rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide ${EV_STATUS_BADGE[ev.status] ?? "bg-gray-100"}`}>
          {ev.status.replace(/_/g, " ")}
        </span>
        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 rounded-full px-2.5 py-0.5">Kamu penyelenggara</span>
      </div>
      <h3 className="text-base font-extrabold text-gray-900">{ev.title}</h3>
      {ev.summary && <p className="text-xs leading-relaxed text-gray-600 line-clamp-2">{ev.summary}</p>}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
        <span>📅 {formatDate(ev.starts_at, ev.timezone)}</span>
        <span>🕐 {formatTime(ev.starts_at, ev.timezone)}</span>
        {ev.venue_city && <span>📍 {ev.venue_city}</span>}
        <span>👥 {ev.rsvp_count_cache} terdaftar{ev.max_attendees ? ` / ${ev.max_attendees}` : ""}</span>
      </div>
      <div className="flex gap-2 pt-1">
        <Link href={`/dashboard/user/events/${ev.uuid}`}
          className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-teal-300 hover:text-teal-700">
          Detail
        </Link>
        <Link href={`/dashboard/user/events/${ev.uuid}/edit`}
          className="rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100">
          ✏️ Edit
        </Link>
      </div>
    </div>
  );
}

function EmptyState({ tab }: { tab: EventTab }) {
  const cfg = {
    upcoming: { emoji: "📅", title: "Tidak ada acara terdaftar", desc: "Daftar ke acara dari halaman Jelajahi!", href: "/dashboard/user/explore", cta: "Jelajahi acara" },
    hosting: { emoji: "🎤", title: "Belum pernah membuat acara", desc: "Buat acara untuk komunitas yang kamu kelola.", href: "/dashboard/user/create", cta: "+ Buat acara", disabled: false },
    past: { emoji: "🕰️", title: "Belum ada riwayat", desc: "Acara yang sudah selesai akan muncul di sini.", href: "/dashboard/user/explore", cta: "Lihat acara" },
  }[tab];

  return (
    <div className="flex flex-col items-center gap-5 rounded-3xl border border-dashed border-gray-200 bg-gray-50/60 py-20 text-center">
      <span className="text-5xl">{cfg.emoji}</span>
      <div>
        <p className="text-base font-bold text-gray-700">{cfg.title}</p>
        <p className="mt-1 text-sm text-gray-500 max-w-xs mx-auto">{cfg.desc}</p>
      </div>
      <Link href={cfg.href} className="rounded-full bg-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow hover:brightness-105">{cfg.cta}</Link>
    </div>
  );
}

/* ── main ── */
type EventTab = "upcoming" | "hosting" | "past";

export function EventsClient() {
  const [tab, setTab] = useState<EventTab>("upcoming");
  const [memberships, setMemberships] = useState<MembershipItem[]>([]);
  const [hosting, setHosting] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [leaveMsg, setLeaveMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getStoredToken();
    if (!token) { setError("Belum masuk."); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const [mResult, hResult] = await Promise.all([
        fetchMyMemberships(token).catch(() => ({ data: [] as MembershipItem[], meta: { page: 1, limit: 50, total: 0 } })),
        fetchMyCreatedEvents(token, { gathering_type: EVENT_TYPE }).catch(() => ({ data: [] as EventItem[], meta: { page: 1, limit: 50, total: 0 } })),
      ]);
      // Hanya ambil membership untuk scheduled_event
      const eventMems = mResult.data.filter(
        (m) => m.membership_event?.gathering_type === EVENT_TYPE
      );
      setMemberships(eventMems);
      setHosting(hResult.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const now = new Date();
  const upcoming = memberships.filter((m) =>
    ["active", "pending", "waitlist"].includes(m.status) &&
    m.membership_event && new Date(m.membership_event.starts_at) >= now
  );
  const past = memberships.filter((m) =>
    m.membership_event && new Date(m.membership_event.starts_at) < now
  );

  async function handleLeave(uuid: string) {
    const token = getStoredToken();
    if (!token) return;
    setLeaving(uuid);
    setLeaveMsg(null);
    try {
      await leaveEvent(token, uuid);
      setLeaveMsg("Pendaftaran berhasil dibatalkan.");
      void load();
    } catch (e) {
      setLeaveMsg(e instanceof Error ? e.message : "Gagal membatalkan.");
    } finally {
      setLeaving(null);
    }
  }

  const tabs: { key: EventTab; label: string; count: number }[] = [
    { key: "upcoming", label: "Akan datang", count: upcoming.length },
    { key: "hosting", label: "Saya buat", count: hosting.length },
    { key: "past", label: "Riwayat", count: past.length },
  ];

  const currentItems = tab === "upcoming" ? upcoming : tab === "past" ? past : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Pengguna</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Acara saya 📅</h1>
          <p className="text-base leading-relaxed text-gray-600">Semua acara yang kamu daftarkan, yang kamu buat, dan rekap yang sudah berlalu.</p>
        </div>
        <Link href="/dashboard/user/create" className="rounded-full bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:brightness-105 transition">
          + Buat acara
        </Link>
      </header>

      {/* Feedback */}
      {leaveMsg && (
        <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${leaveMsg.startsWith("Pendaftaran") ? "border-teal-200 bg-teal-50 text-teal-800" : "border-red-200 bg-red-50 text-red-700"}`}>
          {leaveMsg}
        </div>
      )}

      {/* Tab */}
      <div className="flex gap-2 border-b border-gray-100">
        {tabs.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={`-mb-px flex items-center gap-1.5 rounded-t-xl px-5 py-2.5 text-sm font-bold transition ${tab === t.key ? "border border-b-white border-gray-100 bg-white text-teal-700 shadow-sm" : "text-gray-400 hover:text-gray-700"}`}
          >
            {t.label}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${tab === t.key ? "bg-teal-100 text-teal-800" : "bg-gray-100 text-gray-500"}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Konten */}
      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2].map((i) => <div key={i} className="h-44 animate-pulse rounded-2xl bg-gray-100" />)}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}{" "}
          <button type="button" onClick={() => void load()} className="ml-2 underline">Coba lagi</button>
        </div>
      ) : tab === "hosting" ? (
        hosting.length === 0 ? <EmptyState tab="hosting" /> : (
          <div className="grid gap-4 lg:grid-cols-2">
            {hosting.map((ev) => <HostingCard key={ev.uuid} ev={ev} />)}
          </div>
        )
      ) : currentItems.length === 0 ? (
        <EmptyState tab={tab} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {currentItems.map((m) => (
            <UpcomingCard key={m.id} item={m} onLeave={handleLeave} leaving={leaving} />
          ))}
        </div>
      )}
    </div>
  );
}
