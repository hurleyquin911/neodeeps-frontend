"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  fetchPublicEvents,
  fetchPublicCommunities,
  joinEvent,
  joinCommunity,
  searchUsers,
  type EventItem,
  type CommunityItem,
  type PublicUserItem,
} from "@/lib/api";
import { getStoredToken } from "@/lib/auth-storage";

/* ─── Types ─── */
type WithDist<T> = T & { distance_km?: number };

/* ─── Helpers ─── */
function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      weekday: "short", day: "numeric", month: "short",
    });
  } catch { return iso; }
}

function distLabel(km?: number) {
  if (km == null) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function useDebounce<T>(value: T, delay = 400): T {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return d;
}

const EVENT_CATEGORIES = [
  "meetup", "workshop", "conference", "social", "sports",
  "arts", "education", "tech", "business", "music", "food", "travel", "other",
];
const COMMUNITY_CATEGORIES = [
  "teknologi", "olahraga", "seni & budaya", "pendidikan", "bisnis",
  "musik", "fotografi", "kuliner", "perjalanan", "kesehatan",
  "gaming", "buku", "lingkungan", "komunitas lokal", "lainnya",
];
const RADIUS_OPTIONS = [3, 5, 10, 25, 50, 100];

/* ─── Nearby Bar ─── */
type GeoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "active"; lat: number; lng: number }
  | { status: "error"; message: string };

function NearbyBar({ geo, radius, onActivate, onDeactivate, onRadiusChange }: {
  geo: GeoState;
  radius: number;
  onActivate: () => void;
  onDeactivate: () => void;
  onRadiusChange: (r: number) => void;
}) {
  if (geo.status === "idle" || geo.status === "error") {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3">
        <span className="text-xl">📍</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-teal-900">Temukan yang terdekat dari kamu</p>
          <p className="text-xs text-teal-700">Aktifkan lokasi untuk melihat komunitas & acara dalam radius tertentu</p>
          {geo.status === "error" && (
            <p className="mt-0.5 text-xs text-red-600">⚠️ {geo.message}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onActivate}
          className="shrink-0 rounded-full bg-teal-500 px-4 py-2 text-sm font-bold text-white shadow hover:brightness-105 transition"
        >
          Aktifkan Lokasi
        </button>
      </div>
    );
  }

  if (geo.status === "loading") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
        <p className="text-sm font-semibold text-teal-800">Mendeteksi lokasi kamu…</p>
      </div>
    );
  }

  // active
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-teal-300 bg-teal-100/70 px-4 py-3">
      <span className="text-xl">📍</span>
      <p className="text-sm font-bold text-teal-900 flex-1">Mode Terdekat Aktif</p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-teal-800">Radius:</span>
        {RADIUS_OPTIONS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onRadiusChange(r)}
            className={`rounded-full px-3 py-1 text-xs font-bold transition ${
              radius === r
                ? "bg-teal-600 text-white shadow"
                : "bg-white text-teal-700 hover:bg-teal-50 border border-teal-200"
            }`}
          >
            {r} km
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onDeactivate}
        className="rounded-full border border-teal-300 px-3 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-50"
      >
        ✕ Nonaktifkan
      </button>
    </div>
  );
}

/* ─── Distance Badge ─── */
function DistBadge({ km }: { km?: number }) {
  const label = distLabel(km);
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-700 border border-teal-100">
      📍 {label}
    </span>
  );
}

/* ─── Event Card ─── */
function EventCard({ item, onJoin, joining }: {
  item: WithDist<EventItem>;
  onJoin: (uuid: string) => void;
  joining: string | null;
}) {
  const isJoining = joining === item.uuid;
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-[2px] hover:shadow-md">
      {item.cover_image_url && (
        <img src={item.cover_image_url} alt={item.title} className="h-36 w-full rounded-xl object-cover" />
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-extrabold text-gray-900">{item.title}</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            📅 {formatDate(item.starts_at)}
            {item.venue_city ? ` · ${item.venue_city}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {item.is_free === false && item.price_amount ? (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
              Rp {Number(item.price_amount).toLocaleString("id-ID")}
            </span>
          ) : (
            <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-700">Gratis</span>
          )}
          <DistBadge km={item.distance_km} />
        </div>
      </div>
      {item.summary && (
        <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">{item.summary}</p>
      )}
      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="text-xs text-gray-400">👥 {item.rsvp_count_cache} peserta</span>
        <div className="flex gap-2">
          <a href={`/dashboard/user/events/${item.uuid}`}
            className="rounded-full border border-teal-200 px-3 py-1.5 text-xs font-bold text-teal-600 hover:bg-teal-50 transition">
            Detail
          </a>
          <button
            type="button"
            disabled={isJoining}
            onClick={() => onJoin(item.uuid)}
            className="rounded-full bg-teal-500 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50"
          >
            {isJoining ? "…" : "Daftar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Community Card ─── */
function CommunityCard({ item, onJoin, joining }: {
  item: WithDist<CommunityItem>;
  onJoin: (uuid: string) => void;
  joining: string | null;
}) {
  const isJoining = joining === item.uuid;
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-[2px] hover:shadow-md">
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
          <p className="truncate text-xs text-gray-500">
            {item.primary_category ? `${item.primary_category} · ` : ""}
            👥 {item.member_count_cache} anggota
          </p>
        </div>
        <DistBadge km={item.distance_km} />
      </div>
      {item.city && (
        <p className="text-xs text-gray-500">📍 {item.city}{item.province ? `, ${item.province}` : ""}</p>
      )}
      {item.subtitle && (
        <p className="text-sm font-semibold text-gray-700">{item.subtitle}</p>
      )}
      {item.description && (
        <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">{item.description}</p>
      )}
      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="text-xs text-gray-400">
          {item.join_policy === "open" ? "🔓 Terbuka" : "🔒 Perlu persetujuan"}
        </span>
        <button
          type="button"
          disabled={isJoining}
          onClick={() => onJoin(item.uuid)}
          className="rounded-full bg-teal-500 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50"
        >
          {isJoining ? "…" : "Gabung"}
        </button>
      </div>
    </div>
  );
}

/* ─── Skeleton ─── */
function GridSkeleton({ n = 6 }: { n?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="h-44 animate-pulse rounded-2xl bg-gray-100" />
      ))}
    </div>
  );
}

/* ─── Pagination ─── */
function Pagination({ page, total, limit, onChange }: { page: number; total: number; limit: number; onChange: (p: number) => void }) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3">
      <button disabled={page === 1} onClick={() => onChange(page - 1)}
        className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 disabled:opacity-40 hover:bg-gray-50">← Prev</button>
      <span className="text-sm text-gray-500">{page} / {pages}</span>
      <button disabled={page === pages} onClick={() => onChange(page + 1)}
        className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 disabled:opacity-40 hover:bg-gray-50">Next →</button>
    </div>
  );
}

/* ─── User Card ─── */
function UserCard({ item }: { item: PublicUserItem }) {
  return (
    <Link
      href={`/dashboard/user/profile/${item.uuid}`}
      className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-[2px] hover:shadow-md"
    >
      {item.profile_photo_url ? (
        <img src={item.profile_photo_url} alt={item.name} className="h-12 w-12 shrink-0 rounded-full object-cover" />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-lg font-extrabold text-white">
          {item.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-extrabold text-gray-900">{item.name}</p>
          {item.is_private && <span className="text-xs text-gray-400">🔒</span>}
        </div>
        <p className="truncate text-xs text-gray-500">@{item.username}{item.city ? ` · ${item.city}` : ""}</p>
        {item.bio && <p className="mt-0.5 truncate text-xs text-gray-400">{item.bio}</p>}
      </div>
      <span className="shrink-0 text-xs text-teal-600 font-bold">Lihat →</span>
    </Link>
  );
}

/* ─── Main ─── */
type ExploreTab = "communities" | "events" | "users";

export function ExploreClient() {
  const [tab, setTab] = useState<ExploreTab>("communities");

  /* Pencarian */
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const debQuery = useDebounce(query);
  const debCity  = useDebounce(city);

  /* Geo / nearby */
  const [geo, setGeo] = useState<GeoState>({ status: "idle" });
  const [radius, setRadius] = useState(10);

  /* Pengguna */
  const [users, setUsers] = useState<PublicUserItem[]>([]);
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  /* Komunitas */
  const [communities, setCommunities] = useState<WithDist<CommunityItem>[]>([]);
  const [comPage, setComPage] = useState(1);
  const [comTotal, setComTotal] = useState(0);
  const [comLoading, setComLoading] = useState(false);
  const [comError, setComError] = useState<string | null>(null);
  const [joiningCom, setJoiningCom] = useState<string | null>(null);
  const [joinMsgCom, setJoinMsgCom] = useState<string | null>(null);

  /* Events */
  const [events, setEvents] = useState<WithDist<EventItem>[]>([]);
  const [evPage, setEvPage] = useState(1);
  const [evTotal, setEvTotal] = useState(0);
  const [evLoading, setEvLoading] = useState(false);
  const [evError, setEvError] = useState<string | null>(null);
  const [joiningEv, setJoiningEv] = useState<string | null>(null);
  const [joinMsgEv, setJoinMsgEv] = useState<string | null>(null);

  /* Geo helpers */
  function activateGeo() {
    if (!navigator.geolocation) {
      setGeo({ status: "error", message: "Browser tidak mendukung geolocation." });
      return;
    }
    setGeo({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (pos) => setGeo({ status: "active", lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setGeo({ status: "error", message: err.message || "Izin lokasi ditolak." })
    );
  }
  function deactivateGeo() { setGeo({ status: "idle" }); }

  /* Load users */
  const loadUsers = useCallback(async (page: number) => {
    if (!debQuery || debQuery.length < 2) { setUsers([]); setUserTotal(0); return; }
    setUserLoading(true); setUserError(null);
    try {
      const r = await searchUsers(debQuery, { page, limit: 15 });
      setUsers(r.data); setUserTotal(r.meta.total);
    } catch (e) {
      setUserError(e instanceof Error ? e.message : "Gagal mencari pengguna.");
    } finally { setUserLoading(false); }
  }, [debQuery]);

  /* Load data */
  const loadCommunities = useCallback(async (page: number) => {
    setComLoading(true); setComError(null);
    try {
      const token = getStoredToken();
      const params: Parameters<typeof fetchPublicCommunities>[0] = {
        q: debQuery, category, city: debCity, page, limit: 12, token,
      };
      if (geo.status === "active") {
        params.lat = geo.lat; params.lng = geo.lng; params.radius_km = radius;
      }
      const r = await fetchPublicCommunities(params);
      setCommunities(r.data); setComTotal(r.meta.total);
    } catch (e) {
      setComError(e instanceof Error ? e.message : "Gagal memuat komunitas.");
    } finally { setComLoading(false); }
  }, [debQuery, category, debCity, geo, radius]);

  const loadEvents = useCallback(async (page: number) => {
    setEvLoading(true); setEvError(null);
    try {
      const token = getStoredToken();
      const params: Parameters<typeof fetchPublicEvents>[0] = {
        q: debQuery, category, city: debCity, page, limit: 12, token,
      };
      if (geo.status === "active") {
        params.lat = geo.lat; params.lng = geo.lng; params.radius_km = radius;
      }
      const r = await fetchPublicEvents(params);
      setEvents(r.data); setEvTotal(r.meta.total);
    } catch (e) {
      setEvError(e instanceof Error ? e.message : "Gagal memuat acara.");
    } finally { setEvLoading(false); }
  }, [debQuery, category, debCity, geo, radius]);

  /* Trigger reload ketika filter berubah */
  useEffect(() => { setComPage(1); void loadCommunities(1); }, [loadCommunities]);
  useEffect(() => { setEvPage(1); void loadEvents(1); }, [loadEvents]);
  useEffect(() => { setUserPage(1); void loadUsers(1); }, [loadUsers]);

  /* Paginasi */
  useEffect(() => { void loadCommunities(comPage); }, [comPage, loadCommunities]);
  useEffect(() => { void loadEvents(evPage); }, [evPage, loadEvents]);
  useEffect(() => { void loadUsers(userPage); }, [userPage, loadUsers]);

  async function handleJoinCommunity(uuid: string) {
    const token = getStoredToken();
    if (!token) { setJoinMsgCom("Kamu harus login terlebih dahulu."); return; }
    setJoiningCom(uuid); setJoinMsgCom(null);
    try {
      const r = await joinCommunity(token, uuid);
      setJoinMsgCom(r.message);
      void loadCommunities(comPage);
    } catch (e) {
      setJoinMsgCom(e instanceof Error ? e.message : "Gagal bergabung.");
    } finally { setJoiningCom(null); }
  }

  async function handleJoinEvent(uuid: string) {
    const token = getStoredToken();
    if (!token) { setJoinMsgEv("Kamu harus login terlebih dahulu."); return; }
    setJoiningEv(uuid); setJoinMsgEv(null);
    try {
      await joinEvent(token, uuid);
      setJoinMsgEv("Berhasil mendaftar ke acara!");
      void loadEvents(evPage);
    } catch (e) {
      setJoinMsgEv(e instanceof Error ? e.message : "Gagal mendaftar.");
    } finally { setJoiningEv(null); }
  }

  const geoActive = geo.status === "active";
  const categories = tab === "communities" ? COMMUNITY_CATEGORIES : EVENT_CATEGORIES;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-widest text-teal-700">Jelajahi</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Temukan Komunitasmu 🔍</h1>
        <p className="text-sm text-gray-500">Cari komunitas atau acara berdasarkan minat, kota, atau lokasimu.</p>
      </header>

      {/* Nearby bar */}
      <NearbyBar
        geo={geo}
        radius={radius}
        onActivate={activateGeo}
        onDeactivate={deactivateGeo}
        onRadiusChange={(r) => setRadius(r)}
      />

      {/* Search + filter */}
      <div className="flex flex-col gap-3">
        {/* Baris 1: Search utama */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">🔍</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama, topik, deskripsi…"
            className="w-full rounded-2xl border border-gray-200 bg-gray-50/60 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-200/40"
          />
        </div>
        {/* Baris 2: Kota + Kategori */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">📍</span>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Filter kota (opsional)"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/60 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-teal-400 focus:bg-white"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 rounded-2xl border border-gray-200 bg-gray-50/60 px-4 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:bg-white"
          >
            <option value="">Semua kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          {(query || city || category) && (
            <button
              type="button"
              onClick={() => { setQuery(""); setCity(""); setCategory(""); }}
              className="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 whitespace-nowrap"
            >
              ✕ Reset
            </button>
          )}
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex gap-1 rounded-2xl bg-gray-100/80 p-1.5">
        {(["communities", "events", "users"] as ExploreTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
              tab === t ? "bg-white text-teal-700 shadow" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "communities"
              ? `🏘️ Komunitas${comTotal > 0 ? ` (${comTotal})` : ""}`
              : t === "events"
              ? `📅 Acara${evTotal > 0 ? ` (${evTotal})` : ""}`
              : `👤 Pengguna${userTotal > 0 ? ` (${userTotal})` : ""}`}
          </button>
        ))}
      </div>

      {/* Mode indicator */}
      {geoActive && (
        <p className="text-xs font-semibold text-teal-700">
          🔍 Menampilkan hasil dalam radius <strong>{radius} km</strong> dari lokasimu, diurutkan dari yang terdekat.
        </p>
      )}

      {/* ── TAB KOMUNITAS ── */}
      {tab === "communities" && (
        <>
          {joinMsgCom && (
            <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${joinMsgCom.toLowerCase().includes("berhasil") || joinMsgCom.toLowerCase().includes("dikirim") ? "border-teal-200 bg-teal-50 text-teal-800" : "border-red-200 bg-red-50 text-red-700"}`}>
              {joinMsgCom}
            </div>
          )}
          {comLoading ? <GridSkeleton /> : comError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{comError}</div>
          ) : communities.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-gray-200 bg-gray-50/60 py-16 text-center">
              <span className="text-5xl">🏘️</span>
              <p className="font-bold text-gray-700">
                {geoActive ? `Tidak ada komunitas dalam radius ${radius} km` : "Belum ada komunitas yang cocok"}
              </p>
              <p className="text-sm text-gray-500 max-w-xs">
                {geoActive ? "Coba perluas radius pencarianmu" : <>Coba ubah filter, atau <Link href="/dashboard/user/create-community" className="font-bold text-teal-600 underline">buat komunitas!</Link></>}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {communities.map((c) => (
                <CommunityCard key={c.uuid} item={c} onJoin={handleJoinCommunity} joining={joiningCom} />
              ))}
            </div>
          )}
          <Pagination page={comPage} total={comTotal} limit={12} onChange={setComPage} />
        </>
      )}

      {/* ── TAB PENGGUNA ── */}
      {tab === "users" && (
        <>
          {debQuery.length < 2 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-gray-200 bg-gray-50 py-14 text-center">
              <span className="text-4xl">👤</span>
              <p className="font-bold text-gray-700">Cari pengguna</p>
              <p className="text-sm text-gray-500 max-w-xs">Ketik minimal 2 karakter nama atau username di kolom pencarian di atas.</p>
            </div>
          ) : userLoading ? (
            <GridSkeleton n={6} />
          ) : userError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{userError}</div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-gray-200 bg-gray-50 py-14 text-center">
              <span className="text-4xl">🔍</span>
              <p className="font-bold text-gray-700">Tidak ada pengguna dengan nama "{debQuery}"</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {users.map((u) => <UserCard key={u.uuid} item={u} />)}
            </div>
          )}
          <Pagination page={userPage} total={userTotal} limit={15} onChange={setUserPage} />
        </>
      )}

      {/* ── TAB ACARA ── */}
      {tab === "events" && (
        <>
          {joinMsgEv && (
            <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${joinMsgEv.startsWith("Berhasil") ? "border-teal-200 bg-teal-50 text-teal-800" : "border-red-200 bg-red-50 text-red-700"}`}>
              {joinMsgEv}
            </div>
          )}
          {evLoading ? <GridSkeleton /> : evError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{evError}</div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-gray-200 bg-gray-50/60 py-16 text-center">
              <span className="text-5xl">📭</span>
              <p className="font-bold text-gray-700">
                {geoActive ? `Tidak ada acara dalam radius ${radius} km` : "Tidak ada acara yang cocok"}
              </p>
              <p className="text-sm text-gray-500">
                {geoActive ? "Coba perluas radius pencarianmu" : "Coba ubah kata kunci atau kategori"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((ev) => (
                <EventCard key={ev.uuid} item={ev} onJoin={handleJoinEvent} joining={joiningEv} />
              ))}
            </div>
          )}
          <Pagination page={evPage} total={evTotal} limit={12} onChange={setEvPage} />
        </>
      )}
    </div>
  );
}
