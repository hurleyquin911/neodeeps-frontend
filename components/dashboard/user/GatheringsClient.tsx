"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { fetchMyMemberships, fetchMyCreatedEvents, leaveEvent, type MembershipItem, type EventItem } from "@/lib/api";
import { getStoredToken } from "@/lib/auth-storage";

/* ── helpers ── */
const GATHERING_TYPES = ["meetup_gathering", "community_session"];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  } catch { return iso; }
}

const STATUS_BADGE: Record<string, string> = {
  active: "bg-teal-100 text-teal-800",
  pending: "bg-amber-100 text-amber-800",
  waitlist: "bg-blue-100 text-blue-700",
  withdrawn: "bg-gray-100 text-gray-500",
  removed_by_host: "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Aktif",
  pending: "Menunggu",
  waitlist: "Antrean",
  withdrawn: "Keluar",
  removed_by_host: "Dikeluarkan",
};

const EVENT_STATUS_BADGE: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  pending_review: "bg-amber-100 text-amber-700",
  published: "bg-teal-100 text-teal-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
  completed: "bg-violet-100 text-violet-700",
};

/* ── sub-components ── */
function JoinedCard({ item, onLeave, leaving }: { item: MembershipItem; onLeave: (uuid: string) => void; leaving: string | null }) {
  const ev = item.membership_event;
  if (!ev) return null;
  const isLeaving = leaving === ev.uuid;
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-base font-extrabold text-gray-900">{ev.title}</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            {ev.venue_city ?? "—"} · {ev.rsvp_count_cache} anggota
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide ${STATUS_BADGE[item.status] ?? "bg-gray-100 text-gray-600"}`}>
          {STATUS_LABEL[item.status] ?? item.status}
        </span>
      </div>
      {ev.summary && (
        <p className="text-xs leading-relaxed text-gray-600 line-clamp-2">{ev.summary}</p>
      )}
      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        <span>📅 Bergabung {formatDate(item.created_at)}</span>
        <span>{ev.join_policy === "open" ? "🔓 Terbuka" : "🔒 Terbatas"}</span>
        {Array.isArray(ev.tags) && ev.tags.length > 0 && (
          <span>🏷️ {ev.tags.slice(0, 2).map((t) => `#${t}`).join(" ")}</span>
        )}
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-teal-300 hover:text-teal-700">
          Lihat detail
        </button>
        {["active", "pending", "waitlist"].includes(item.status) && (
          <button
            type="button"
            disabled={isLeaving}
            onClick={() => onLeave(ev.uuid)}
            className="ml-auto rounded-full px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            {isLeaving ? "Keluar…" : "Keluar"}
          </button>
        )}
      </div>
    </div>
  );
}

function ManagedCard({ ev }: { ev: EventItem }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-base font-extrabold text-gray-900">{ev.title}</h3>
          <p className="mt-0.5 text-xs text-gray-500">{ev.venue_city ?? "—"} · {ev.rsvp_count_cache} anggota</p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide ${EVENT_STATUS_BADGE[ev.status] ?? "bg-gray-100 text-gray-600"}`}>
          {ev.status.replace("_", " ")}
        </span>
      </div>
      {ev.summary && (
        <p className="text-xs leading-relaxed text-gray-600 line-clamp-2">{ev.summary}</p>
      )}
      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        <span>📅 Dibuat {formatDate(ev.created_at)}</span>
        <span>{ev.join_policy === "open" ? "🔓 Terbuka" : "🔒 Terbatas"}</span>
        {ev.max_attendees && <span>🎯 Maks {ev.max_attendees} anggota</span>}
      </div>
      <div className="flex gap-2 pt-1">
        {ev.status === "draft" && (
          <button type="button" className="rounded-full bg-amber-500 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-amber-600">
            Kirim review
          </button>
        )}
        <button type="button" className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-teal-300 hover:text-teal-700">
          Kelola
        </button>
      </div>
    </div>
  );
}

function EmptyJoined() {
  return (
    <div className="flex flex-col items-center gap-5 rounded-3xl border border-dashed border-gray-200 bg-gray-50/60 py-20 text-center">
      <span className="text-5xl">🏘️</span>
      <div>
        <p className="text-base font-bold text-gray-700">Belum bergabung ke perkumpulan manapun</p>
        <p className="mt-1 text-sm text-gray-500">Temukan dan gabung dari halaman Jelajahi!</p>
      </div>
      <Link href="/dashboard/user/explore" className="rounded-full bg-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow hover:brightness-105">
        Jelajahi sekarang
      </Link>
    </div>
  );
}

function EmptyManaged() {
  return (
    <div className="flex flex-col items-center gap-5 rounded-3xl border border-dashed border-gray-200 bg-gray-50/60 py-20 text-center">
      <span className="text-5xl">✨</span>
      <div>
        <p className="text-base font-bold text-gray-700">Belum ada perkumpulan yang kamu kelola</p>
        <p className="mt-1 text-sm text-gray-500 max-w-xs mx-auto">
          Buat perkumpulan sendiri — atur topik, undang teman, tentukan kebijakan bergabung.
        </p>
      </div>
      <Link href="/dashboard/user/create" className="rounded-full bg-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow hover:brightness-105">
        + Buat perkumpulan
      </Link>
    </div>
  );
}

/* ── main ── */
type Tab = "diikuti" | "dikelola";

export function GatheringsClient() {
  const [tab, setTab] = useState<Tab>("diikuti");
  const [memberships, setMemberships] = useState<MembershipItem[]>([]);
  const [managed, setManaged] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [leaveMsg, setLeaveMsg] = useState<string | null>(null);
  const [totalJoined, setTotalJoined] = useState(0);
  const [totalManaged, setTotalManaged] = useState(0);

  const load = useCallback(async () => {
    const token = getStoredToken();
    if (!token) { setError("Belum masuk."); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const [mResult, eResult] = await Promise.all([
        // Membership perkumpulan (meetup + community)
        fetchMyMemberships(token, { status: "active" }).catch(() => ({ data: [] as MembershipItem[], meta: { page: 1, limit: 20, total: 0 } })),
        // Event yang dibuat oleh user bertipe perkumpulan
        fetchMyCreatedEvents(token).catch(() => ({ data: [] as EventItem[], meta: { page: 1, limit: 20, total: 0 } })),
      ]);
      // Filter membership yang eventnya bertipe perkumpulan/komunitas
      const filtered = mResult.data.filter(
        (m) => m.membership_event && GATHERING_TYPES.includes(m.membership_event.gathering_type)
      );
      const filteredManaged = eResult.data.filter((e) => GATHERING_TYPES.includes(e.gathering_type));
      setMemberships(filtered);
      setTotalJoined(filtered.length);
      setManaged(filteredManaged);
      setTotalManaged(filteredManaged.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleLeave(eventUuid: string) {
    const token = getStoredToken();
    if (!token) return;
    setLeaving(eventUuid);
    setLeaveMsg(null);
    try {
      await leaveEvent(token, eventUuid);
      setLeaveMsg("Berhasil keluar dari perkumpulan.");
      void load();
    } catch (e) {
      setLeaveMsg(e instanceof Error ? e.message : "Gagal keluar.");
    } finally {
      setLeaving(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Pengguna</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Perkumpulan saya 👥</h1>
          <p className="text-base leading-relaxed text-gray-600">Semua komunitas yang kamu ikuti dan yang kamu kelola.</p>
        </div>
        <Link href="/dashboard/user/create" className="rounded-full bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:brightness-105 transition">
          + Buat perkumpulan
        </Link>
      </header>

      {/* Kuota */}
      <div className="flex items-center gap-4 rounded-2xl border border-teal-100/80 bg-teal-50/60 px-5 py-4">
        <span className="text-2xl">🎯</span>
        <div>
          <p className="text-sm font-bold text-teal-900">Kuota perkumpulan aktif: {totalManaged} / 2</p>
          <p className="text-xs text-teal-700">Setiap pengguna dapat mengelola maksimal 2 perkumpulan aktif secara bersamaan.</p>
        </div>
      </div>

      {/* Feedback */}
      {leaveMsg && (
        <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${leaveMsg.startsWith("Berhasil") ? "border-teal-200 bg-teal-50 text-teal-800" : "border-red-200 bg-red-50 text-red-700"}`}>
          {leaveMsg}
        </div>
      )}

      {/* Tab */}
      <div className="flex gap-2 border-b border-gray-100">
        {(["diikuti", "dikelola"] as Tab[]).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`-mb-px rounded-t-xl px-5 py-2.5 text-sm font-bold transition ${tab === t ? "border border-b-white border-gray-100 bg-white text-teal-700 shadow-sm" : "text-gray-400 hover:text-gray-700"}`}
          >
            {t === "diikuti" ? `Yang saya ikuti (${totalJoined})` : `Yang saya kelola (${totalManaged})`}
          </button>
        ))}
      </div>

      {/* Konten */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />)}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}{" "}
          <button type="button" onClick={() => void load()} className="ml-2 underline">Coba lagi</button>
        </div>
      ) : tab === "diikuti" ? (
        memberships.length === 0 ? <EmptyJoined /> : (
          <div className="grid gap-4 sm:grid-cols-2">
            {memberships.map((m) => (
              <JoinedCard key={m.id} item={m} onLeave={handleLeave} leaving={leaving} />
            ))}
          </div>
        )
      ) : (
        managed.length === 0 ? <EmptyManaged /> : (
          <div className="grid gap-4 sm:grid-cols-2">
            {managed.map((ev) => <ManagedCard key={ev.uuid} ev={ev} />)}
          </div>
        )
      )}
    </div>
  );
}
