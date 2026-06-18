"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminPendingEvents,
  fetchAdminPendingCommunities,
  moderateEvent,
  moderateCommunity,
  type EventItem,
  type CommunityItem,
} from "@/lib/api";
import { getStoredToken } from "@/lib/auth-storage";

type Tab = "events" | "communities";

const STATUS_COLORS: Record<string, string> = {
  pending_review: "bg-amber-100 text-amber-800",
  published:      "bg-teal-100 text-teal-700",
  rejected:       "bg-red-100 text-red-700",
  draft:          "bg-gray-100 text-gray-500",
};

function timeAgo(iso: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return `${Math.floor(diff / 60000)} mnt lalu`;
  if (hrs < 24) return `${hrs} jam lalu`;
  return `${Math.floor(hrs / 24)} hari lalu`;
}

/* ── Modal Reject ── */
function RejectModal({ type, name, onConfirm, onCancel, loading }: {
  type: "event" | "community";
  name: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-extrabold text-gray-900">Tolak {type === "event" ? "Acara" : "Komunitas"}</h3>
        <p className="text-sm text-gray-600">
          Kamu akan menolak <strong>{name}</strong>. Pembuat akan menerima notifikasi.
        </p>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Alasan penolakan (opsional)</label>
          <textarea
            className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 resize-none min-h-[5rem]"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Jelaskan alasan penolakan agar pembuat bisa memperbaiki…"
          />
        </div>
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onCancel} disabled={loading}
            className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Batal
          </button>
          <button type="button" onClick={() => onConfirm(reason)} disabled={loading}
            className="rounded-full bg-red-500 px-5 py-2 text-sm font-bold text-white shadow hover:brightness-105 disabled:opacity-50">
            {loading ? "Menolak…" : "Tolak"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Event Card ── */
function EventCard({ item, onApprove, onReject, acting }: {
  item: EventItem;
  onApprove: (uuid: string) => void;
  onReject: (uuid: string) => void;
  acting: string | null;
}) {
  const isActing = acting === item.uuid;
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-base font-extrabold text-gray-900">{item.title}</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            oleh <strong>{item.creator?.name ?? "—"}</strong>
            {" · "}
            {item.format} · {item.gathering_type?.replace(/_/g, " ")}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_COLORS[item.status] ?? ""}`}>
          {item.status.replace(/_/g, " ")}
        </span>
      </div>

      {item.summary && (
        <p className="line-clamp-2 text-sm text-gray-600">{item.summary}</p>
      )}

      <div className="flex flex-wrap gap-2 text-xs text-gray-400">
        {item.starts_at && <span>📅 {new Date(item.starts_at).toLocaleDateString("id-ID")}</span>}
        {item.venue_city && <span>📍 {item.venue_city}</span>}
        <span>⏰ Diajukan {timeAgo(item.moderation_submitted_at ?? item.created_at)}</span>
      </div>

      {item.status === "pending_review" && (
        <div className="flex gap-2 pt-1">
          <button type="button" disabled={isActing} onClick={() => onApprove(item.uuid)}
            className="flex-1 rounded-full bg-teal-500 py-2 text-xs font-bold text-white shadow hover:brightness-105 disabled:opacity-50">
            {isActing ? "…" : "✓ Setujui"}
          </button>
          <button type="button" disabled={isActing} onClick={() => onReject(item.uuid)}
            className="flex-1 rounded-full border border-red-200 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50">
            {isActing ? "…" : "✗ Tolak"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Community Card ── */
function CommunityCard({ item, onApprove, onReject, acting }: {
  item: CommunityItem;
  onApprove: (uuid: string) => void;
  onReject: (uuid: string) => void;
  acting: string | null;
}) {
  const isActing = acting === item.uuid;
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        {item.avatar_url ? (
          <img src={item.avatar_url} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-lg font-extrabold text-amber-700">
            {item.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-extrabold text-gray-900">{item.name}</h3>
          <p className="text-xs text-gray-500">
            oleh <strong>{item.creator?.name ?? "—"}</strong>
            {item.primary_category ? ` · ${item.primary_category}` : ""}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_COLORS[item.status] ?? ""}`}>
          {item.status.replace(/_/g, " ")}
        </span>
      </div>

      {item.subtitle && <p className="text-sm font-semibold text-gray-700">{item.subtitle}</p>}
      {item.description && <p className="line-clamp-2 text-sm text-gray-600">{item.description}</p>}

      <p className="text-xs text-gray-400">
        ⏰ Diajukan {timeAgo(item.moderation_submitted_at ?? item.created_at)}
        {" · "}👥 {item.member_count_cache} anggota
      </p>

      {item.status === "pending_review" && (
        <div className="flex gap-2 pt-1">
          <button type="button" disabled={isActing} onClick={() => onApprove(item.uuid)}
            className="flex-1 rounded-full bg-teal-500 py-2 text-xs font-bold text-white shadow hover:brightness-105 disabled:opacity-50">
            {isActing ? "…" : "✓ Setujui"}
          </button>
          <button type="button" disabled={isActing} onClick={() => onReject(item.uuid)}
            className="flex-1 rounded-full border border-red-200 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50">
            {isActing ? "…" : "✗ Tolak"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Main ── */
export function AdminModerationClient() {
  const [tab, setTab] = useState<Tab>("events");

  const [events, setEvents] = useState<EventItem[]>([]);
  const [evTotal, setEvTotal] = useState(0);
  const [evPage, setEvPage] = useState(1);
  const [evLoading, setEvLoading] = useState(true);

  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [comTotal, setComTotal] = useState(0);
  const [comPage, setComPage] = useState(1);
  const [comLoading, setComLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("pending_review");
  const [q, setQ] = useState("");

  const [acting, setActing] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<{ uuid: string; name: string; type: "event" | "community" } | null>(null);
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);

  const loadEvents = useCallback(async (page: number) => {
    const token = getStoredToken();
    if (!token) return;
    setEvLoading(true);
    try {
      const r = await fetchAdminPendingEvents(token, { status: statusFilter, q, page, limit: 12 });
      setEvents(r.data);
      setEvTotal(r.meta.total);
    } catch (e) {
      setFeedback({ msg: e instanceof Error ? e.message : "Gagal memuat", ok: false });
    } finally {
      setEvLoading(false);
    }
  }, [statusFilter, q]);

  const loadCommunities = useCallback(async (page: number) => {
    const token = getStoredToken();
    if (!token) return;
    setComLoading(true);
    try {
      const r = await fetchAdminPendingCommunities(token, { status: statusFilter, q, page, limit: 12 });
      setCommunities(r.data);
      setComTotal(r.meta.total);
    } catch (e) {
      setFeedback({ msg: e instanceof Error ? e.message : "Gagal memuat", ok: false });
    } finally {
      setComLoading(false);
    }
  }, [statusFilter, q]);

  useEffect(() => { setEvPage(1); void loadEvents(1); }, [loadEvents]);
  useEffect(() => { setComPage(1); void loadCommunities(1); }, [loadCommunities]);
  useEffect(() => { void loadEvents(evPage); }, [evPage, loadEvents]);
  useEffect(() => { void loadCommunities(comPage); }, [comPage, loadCommunities]);

  async function handleApproveEvent(uuid: string) {
    const token = getStoredToken(); if (!token) return;
    setActing(uuid); setFeedback(null);
    try {
      await moderateEvent(token, uuid, "approve");
      setFeedback({ msg: "Acara disetujui dan dipublikasikan!", ok: true });
      void loadEvents(evPage);
    } catch (e) {
      setFeedback({ msg: e instanceof Error ? e.message : "Gagal", ok: false });
    } finally { setActing(null); }
  }

  async function handleApproveComm(uuid: string) {
    const token = getStoredToken(); if (!token) return;
    setActing(uuid); setFeedback(null);
    try {
      await moderateCommunity(token, uuid, "approve");
      setFeedback({ msg: "Komunitas disetujui dan dipublikasikan!", ok: true });
      void loadCommunities(comPage);
    } catch (e) {
      setFeedback({ msg: e instanceof Error ? e.message : "Gagal", ok: false });
    } finally { setActing(null); }
  }

  async function handleRejectConfirm(reason: string) {
    if (!rejectTarget) return;
    const token = getStoredToken(); if (!token) return;
    setActing(rejectTarget.uuid); setFeedback(null);
    try {
      if (rejectTarget.type === "event") {
        await moderateEvent(token, rejectTarget.uuid, "reject", { rejection_reason: reason });
        void loadEvents(evPage);
      } else {
        await moderateCommunity(token, rejectTarget.uuid, "reject", { rejection_reason: reason });
        void loadCommunities(comPage);
      }
      setFeedback({ msg: `${rejectTarget.type === "event" ? "Acara" : "Komunitas"} ditolak.`, ok: true });
      setRejectTarget(null);
    } catch (e) {
      setFeedback({ msg: e instanceof Error ? e.message : "Gagal", ok: false });
    } finally { setActing(null); }
  }

  const evPages = Math.ceil(evTotal / 12);
  const comPages = Math.ceil(comTotal / 12);

  return (
    <div className="space-y-8">
      {rejectTarget && (
        <RejectModal
          type={rejectTarget.type}
          name={rejectTarget.name}
          loading={acting === rejectTarget.uuid}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      <header className="max-w-2xl space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Admin</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Antrian Moderasi 🔍</h1>
        <p className="text-base text-gray-600">Tinjau dan setujui atau tolak acara & komunitas yang menunggu publikasi.</p>
      </header>

      {/* Feedback */}
      {feedback && (
        <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${feedback.ok ? "border-teal-200 bg-teal-50 text-teal-800" : "border-red-200 bg-red-50 text-red-700"}`}>
          {feedback.msg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari judul…"
          className="min-w-0 flex-1 rounded-2xl border border-gray-200 bg-gray-50/60 px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-2xl border border-gray-200 bg-gray-50/60 px-4 py-2.5 text-sm outline-none focus:border-amber-400"
        >
          <option value="pending_review">Menunggu review</option>
          <option value="published">Sudah disetujui</option>
          <option value="rejected">Ditolak</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl bg-gray-100/80 p-1.5">
        <button type="button" onClick={() => setTab("events")}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition ${tab === "events" ? "bg-white text-amber-700 shadow" : "text-gray-500 hover:text-gray-700"}`}>
          📅 Acara {evTotal > 0 && `(${evTotal})`}
        </button>
        <button type="button" onClick={() => setTab("communities")}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition ${tab === "communities" ? "bg-white text-amber-700 shadow" : "text-gray-500 hover:text-gray-700"}`}>
          🏘️ Komunitas {comTotal > 0 && `(${comTotal})`}
        </button>
      </div>

      {/* Events list */}
      {tab === "events" && (
        <>
          {evLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />)}
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-gray-200 bg-gray-50/60 py-20 text-center">
              <span className="text-5xl">🎉</span>
              <p className="font-bold text-gray-700">Tidak ada acara dengan status ini</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((ev) => (
                <EventCard
                  key={ev.uuid}
                  item={ev}
                  acting={acting}
                  onApprove={handleApproveEvent}
                  onReject={(uuid) => setRejectTarget({ uuid, name: ev.title, type: "event" })}
                />
              ))}
            </div>
          )}
          {evPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button disabled={evPage === 1} onClick={() => setEvPage(evPage - 1)}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold disabled:opacity-40 hover:bg-gray-50">← Prev</button>
              <span className="text-sm text-gray-500">{evPage}/{evPages}</span>
              <button disabled={evPage === evPages} onClick={() => setEvPage(evPage + 1)}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold disabled:opacity-40 hover:bg-gray-50">Next →</button>
            </div>
          )}
        </>
      )}

      {/* Communities list */}
      {tab === "communities" && (
        <>
          {comLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />)}
            </div>
          ) : communities.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-gray-200 bg-gray-50/60 py-20 text-center">
              <span className="text-5xl">🎉</span>
              <p className="font-bold text-gray-700">Tidak ada komunitas dengan status ini</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {communities.map((com) => (
                <CommunityCard
                  key={com.uuid}
                  item={com}
                  acting={acting}
                  onApprove={handleApproveComm}
                  onReject={(uuid) => setRejectTarget({ uuid, name: com.name, type: "community" })}
                />
              ))}
            </div>
          )}
          {comPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button disabled={comPage === 1} onClick={() => setComPage(comPage - 1)}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold disabled:opacity-40 hover:bg-gray-50">← Prev</button>
              <span className="text-sm text-gray-500">{comPage}/{comPages}</span>
              <button disabled={comPage === comPages} onClick={() => setComPage(comPage + 1)}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold disabled:opacity-40 hover:bg-gray-50">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
