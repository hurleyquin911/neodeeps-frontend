"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchMyCommunityMemberships,
  fetchMyCreatedCommunities,
  leaveCommunity,
  type CommunityMembershipItem,
  type CommunityItem,
} from "@/lib/api";
import { getStoredToken } from "@/lib/auth-storage";

const STATUS_BADGE: Record<string, string> = {
  active: "bg-teal-100 text-teal-800",
  pending: "bg-amber-100 text-amber-800",
  banned: "bg-red-100 text-red-700",
  left: "bg-gray-100 text-gray-500",
};
const STATUS_LABEL: Record<string, string> = {
  active: "Anggota",
  pending: "Menunggu",
  banned: "Diblokir",
  left: "Keluar",
};
const ROLE_BADGE: Record<string, string> = {
  owner: "bg-violet-100 text-violet-800",
  admin: "bg-amber-100 text-amber-700",
  member: "bg-gray-100 text-gray-600",
};
const COMMUNITY_STATUS_BADGE: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  pending_review: "bg-amber-100 text-amber-700",
  published: "bg-teal-100 text-teal-700",
  rejected: "bg-red-100 text-red-700",
};

/* ── Joined Card ── */
function JoinedCard({ item, onLeave, leaving }: {
  item: CommunityMembershipItem;
  onLeave: (uuid: string) => void;
  leaving: string | null;
}) {
  const com = item.community;
  if (!com) return null;
  const isLeaving = leaving === com.uuid;
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-3">
        {com.avatar_url || com.cover_image_url ? (
          <img src={com.avatar_url ?? com.cover_image_url ?? ""} alt={com.name} className="h-12 w-12 shrink-0 rounded-2xl object-cover" />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-lg font-extrabold text-teal-700">
            {com.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-extrabold text-gray-900">{com.name}</h3>
          <p className="text-xs text-gray-500">
            {com.primary_category ? `${com.primary_category} · ` : ""}
            👥 {com.member_count_cache} anggota
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_BADGE[item.status] ?? "bg-gray-100 text-gray-600"}`}>
            {STATUS_LABEL[item.status] ?? item.status}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${ROLE_BADGE[item.role] ?? ""}`}>
            {item.role}
          </span>
        </div>
      </div>
      {com.subtitle && <p className="text-sm text-gray-600">{com.subtitle}</p>}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <Link
          href={`/dashboard/user/communities/${com.uuid}`}
          className="rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-100 transition"
        >
          🏠 Beranda Komunitas
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {item.joined_at ? `Bergabung ${new Date(item.joined_at).toLocaleDateString("id-ID")}` : "Menunggu"}
          </span>
          {item.role !== "owner" && item.status === "active" && (
            <button
              type="button"
              disabled={isLeaving}
              onClick={() => onLeave(com.uuid)}
              className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              {isLeaving ? "…" : "Keluar"}
            </button>
          )}
          {item.role === "owner" && (
            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">👑 Owner</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Managed Card ── */
function ManagedCard({ item }: { item: CommunityItem }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-3">
        {item.avatar_url || item.cover_image_url ? (
          <img src={item.avatar_url ?? item.cover_image_url ?? ""} alt={item.name} className="h-12 w-12 shrink-0 rounded-2xl object-cover" />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-lg font-extrabold text-teal-700">
            {item.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-extrabold text-gray-900">{item.name}</h3>
          <p className="text-xs text-gray-500">
            {item.primary_category ? `${item.primary_category} · ` : ""}
            👥 {item.member_count_cache} anggota · 📅 {item.event_count_cache} acara
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${COMMUNITY_STATUS_BADGE[item.status] ?? "bg-gray-100 text-gray-600"}`}>
          {item.status.replace(/_/g, " ")}
        </span>
      </div>
      {item.subtitle && <p className="text-sm text-gray-600">{item.subtitle}</p>}
      <p className="text-xs text-gray-400">
        Dibuat {new Date(item.created_at).toLocaleDateString("id-ID")}
        {item.status === "draft" && " — Kirim ke review agar bisa tampil di publik."}
        {item.status === "pending_review" && " — Sedang ditinjau oleh moderator."}
        {item.status === "rejected" && " — Ditolak, kamu bisa edit dan submit ulang."}
      </p>
      <div className="flex gap-2 pt-1">
        <Link
          href={`/dashboard/user/communities/${item.uuid}`}
          className="flex-1 rounded-full border border-teal-200 bg-teal-50 py-2 text-center text-xs font-bold text-teal-700 hover:bg-teal-100 transition"
        >
          🏠 Beranda
        </Link>
        <Link
          href={`/dashboard/user/communities/${item.uuid}/manage`}
          className="flex-1 rounded-full border border-amber-200 bg-amber-50 py-2 text-center text-xs font-bold text-amber-700 hover:bg-amber-100 transition"
        >
          👥 Kelola
        </Link>
        {item.status === "draft" && (
          <Link
            href={`/dashboard/user/create-community`}
            className="flex-1 rounded-full border border-gray-200 py-2 text-center text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
          >
            ✏️ Edit & Submit
          </Link>
        )}
      </div>
    </div>
  );
}

/* ── Main ── */
type Tab = "diikuti" | "dikelola";

export function CommunitiesClient() {
  const [tab, setTab] = useState<Tab>("diikuti");
  const [memberships, setMemberships] = useState<CommunityMembershipItem[]>([]);
  const [managed, setManaged] = useState<CommunityItem[]>([]);
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
      const [mResult, eResult] = await Promise.all([
        fetchMyCommunityMemberships(token).catch(() => ({ data: [] as CommunityMembershipItem[], meta: { page: 1, limit: 50, total: 0 } })),
        fetchMyCreatedCommunities(token).catch(() => ({ data: [] as CommunityItem[], meta: { page: 1, limit: 50, total: 0 } })),
      ]);
      setMemberships(mResult.data);
      setManaged(eResult.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleLeave(communityUuid: string) {
    const token = getStoredToken();
    if (!token) return;
    setLeaving(communityUuid);
    setLeaveMsg(null);
    try {
      await leaveCommunity(token, communityUuid);
      setLeaveMsg("Berhasil keluar dari komunitas.");
      void load();
    } catch (e) {
      setLeaveMsg(e instanceof Error ? e.message : "Gagal keluar.");
    } finally {
      setLeaving(null);
    }
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "diikuti", label: "Diikuti", count: memberships.length },
    { key: "dikelola", label: "Dikelola", count: managed.length },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Pengguna</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Komunitas saya 🏘️</h1>
          <p className="text-base leading-relaxed text-gray-600">Komunitas yang kamu ikuti dan yang kamu kelola.</p>
        </div>
        <Link href="/dashboard/user/create-community"
          className="rounded-full bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:brightness-105 transition">
          + Buat komunitas
        </Link>
      </header>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-teal-100/80 bg-teal-50/60 px-5 py-4">
        <span className="mt-0.5 shrink-0 text-xl">💡</span>
        <p className="text-sm text-teal-900">
          <strong>Komunitas</strong> adalah grup persisten yang bisa kamu ikuti kapan saja.
          Komunitas bisa menyelenggarakan <strong>acara</strong>, tapi kamu tidak perlu ikut komunitas untuk mendaftar ke suatu acara.
        </p>
      </div>

      {/* Feedback */}
      {leaveMsg && (
        <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${leaveMsg.startsWith("Berhasil") ? "border-teal-200 bg-teal-50 text-teal-800" : "border-red-200 bg-red-50 text-red-700"}`}>
          {leaveMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-t-xl px-5 py-2.5 text-sm font-bold transition ${tab === t.key ? "bg-white text-teal-700 shadow-sm border border-b-white border-gray-100 -mb-px" : "text-gray-500 hover:text-gray-700"}`}
          >
            {t.label}
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${tab === t.key ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-500"}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : tab === "diikuti" ? (
        memberships.length === 0 ? (
          <div className="flex flex-col items-center gap-5 rounded-3xl border border-dashed border-gray-200 bg-gray-50/60 py-20 text-center">
            <span className="text-5xl">🏘️</span>
            <div>
              <p className="text-base font-bold text-gray-700">Belum bergabung ke komunitas mana pun</p>
              <p className="mt-1 text-sm text-gray-500 max-w-xs mx-auto">Temukan komunitas yang cocok di halaman Jelajahi.</p>
            </div>
            <Link href="/dashboard/user/explore" className="rounded-full bg-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow hover:brightness-105">
              Jelajahi komunitas
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {memberships.map((m) => (
              <JoinedCard key={m.id} item={m} onLeave={handleLeave} leaving={leaving} />
            ))}
          </div>
        )
      ) : (
        managed.length === 0 ? (
          <div className="flex flex-col items-center gap-5 rounded-3xl border border-dashed border-gray-200 bg-gray-50/60 py-20 text-center">
            <span className="text-5xl">✨</span>
            <div>
              <p className="text-base font-bold text-gray-700">Belum ada komunitas yang kamu kelola</p>
              <p className="mt-1 text-sm text-gray-500 max-w-xs mx-auto">Buat komunitas dengan topik favoritmu dan undang orang-orang untuk bergabung.</p>
            </div>
            <Link href="/dashboard/user/create-community" className="rounded-full bg-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow hover:brightness-105">
              + Buat komunitas
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {managed.map((c) => (
              <ManagedCard key={c.uuid} item={c} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
