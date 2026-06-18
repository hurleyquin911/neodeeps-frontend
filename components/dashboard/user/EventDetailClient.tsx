"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  fetchEventDetail,
  fetchEventMembers,
  moderateEventMember,
  joinEvent as joinEventApi,
  leaveEvent as leaveEventApi,
  type EventDetail,
  type MembershipStatus,
  type MembershipItem,
} from "@/lib/api";
import { getStoredToken, getStoredUserRaw } from "@/lib/auth-storage";

/* ─── helpers ─── */
function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

/** Normalkan field yang bisa berupa string JSON atau array */
function toArray(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  if (typeof val === "string" && val.trim().startsWith("[")) {
    try { return JSON.parse(val) as string[]; } catch { /* fall through */ }
  }
  return [];
}

const STATUS_LABEL: Record<MembershipStatus, string> = {
  pending: "Menunggu persetujuan",
  active: "Terdaftar ✅",
  waitlist: "Daftar tunggu",
  withdrawn: "Dibatalkan",
  removed_by_host: "Dihapus host",
};
const STATUS_COLOR: Record<MembershipStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  active: "bg-teal-100 text-teal-700",
  waitlist: "bg-blue-100 text-blue-700",
  withdrawn: "bg-gray-100 text-gray-500",
  removed_by_host: "bg-red-100 text-red-600",
};

function FormatBadge({ format }: { format: string }) {
  const map: Record<string, string> = { physical: "🏟️ Fisik", online: "💻 Online", hybrid: "🔀 Hybrid" };
  return <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">{map[format] ?? format}</span>;
}
function TypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    public_event: "📢 Acara Publik", community_session: "🏘️ Sesi Komunitas",
    meetup_gathering: "☕ Meetup", workshop_seminar: "🎓 Workshop",
    chat_room: "💬 Chat Room", other: "📌 Lainnya",
  };
  return <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">{map[type] ?? type}</span>;
}

/* ─── avatar kecil ─── */
function Avatar({ name, src, size = 9 }: { name: string; src?: string | null; size?: number }) {
  const s = `h-${size} w-${size}`;
  if (src) return <img src={src} alt={name} className={`${s} rounded-full object-cover`} />;
  return (
    <div className={`${s} flex items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

/* ─── Map embed ─── */
function MapEmbed({ lat, lng, label }: { lat: number; lng: number; label?: string | null }) {
  const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
      {label && <p className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600">{label}</p>}
      <iframe src={url} className="h-52 w-full" style={{ border: 0 }} loading="lazy" title="Peta lokasi" />
      <a
        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`}
        target="_blank" rel="noreferrer"
        className="block bg-gray-50 py-2 text-center text-xs font-semibold text-teal-600 hover:text-teal-700"
      >
        🗺️ Buka di OpenStreetMap
      </a>
    </div>
  );
}

/* ─── Tiket / status box ─── */
function TicketBox({ membership, onLeave, leaving }: {
  membership: NonNullable<EventDetail["my_membership"]>;
  onLeave: () => void;
  leaving: boolean;
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🎟️</span>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-600">Status Pendaftaran</p>
          <span className={`inline-flex mt-1 items-center rounded-full px-3 py-0.5 text-xs font-bold ${STATUS_COLOR[membership.status]}`}>
            {STATUS_LABEL[membership.status]}
          </span>
        </div>
      </div>
      {membership.joined_at && (
        <p className="text-xs text-gray-500">Mendaftar pada {fmt(membership.joined_at)}</p>
      )}
      {(membership.status === "active" || membership.status === "pending" || membership.status === "waitlist") && (
        <button
          onClick={onLeave}
          disabled={leaving}
          className="w-full rounded-xl border border-red-200 bg-white py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition disabled:opacity-50"
        >
          {leaving ? "Memproses…" : "Batalkan pendaftaran"}
        </button>
      )}
    </div>
  );
}

/* ─── Manajemen Peserta (Host only) ─── */
const STATUS_BADGE: Record<string, string> = {
  pending:          "bg-amber-100 text-amber-800",
  active:           "bg-teal-100 text-teal-700",
  waitlist:         "bg-blue-100 text-blue-700",
  withdrawn:        "bg-gray-100 text-gray-500",
  removed_by_host:  "bg-red-100 text-red-600",
};
const STATUS_LBL: Record<string, string> = {
  pending:          "Menunggu",
  active:           "Aktif ✅",
  waitlist:         "Antrian",
  withdrawn:        "Keluar",
  removed_by_host:  "Dihapus",
};

function EventAttendeesManager({ eventUuid, token }: { eventUuid: string; token: string }) {
  const [members, setMembers] = useState<MembershipItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");
  const [acting, setActing] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const load = useCallback(async (p: number, f: string) => {
    setLoading(true);
    try {
      const r = await fetchEventMembers(token, eventUuid, { page: p, limit: 20 });
      // filter sisi frontend karena backend belum ada filter status
      const filtered = f === "all" ? r.data : r.data.filter((m) => m.status === f);
      setMembers(filtered);
      setTotal(r.meta.total);
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : "Gagal memuat");
    } finally { setLoading(false); }
  }, [token, eventUuid]);

  useEffect(() => { void load(page, filter); }, [page, filter, load]);

  async function act(userUuid: string, status: MembershipStatus) {
    setActing(userUuid);
    setFeedback(null);
    try {
      await moderateEventMember(token, eventUuid, userUuid, status);
      setFeedback(status === "active" ? "✅ Disetujui!" : status === "removed_by_host" ? "Peserta dihapus." : "Status diperbarui.");
      void load(page, filter);
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : "Gagal");
    } finally { setActing(null); }
  }

  const tabs = [
    { key: "pending",  label: "Menunggu" },
    { key: "active",   label: "Aktif" },
    { key: "waitlist", label: "Antrian" },
    { key: "all",      label: "Semua" },
  ];

  return (
    <div className="space-y-4">
      {/* Tab filter */}
      <div className="flex gap-1 rounded-2xl bg-gray-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => { setFilter(t.key); setPage(1); }}
            className={`flex-1 rounded-xl px-3 py-2 text-xs font-bold transition ${filter === t.key ? "bg-white text-teal-700 shadow" : "text-gray-500 hover:text-gray-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {feedback && (
        <p className={`rounded-xl px-3 py-2 text-xs font-semibold ${feedback.startsWith("✅") ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-600"}`}>
          {feedback}
        </p>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map((i) => <div key={i} className="h-14 animate-pulse rounded-2xl bg-gray-100" />)}
        </div>
      ) : members.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
          {filter === "pending" ? "Tidak ada pendaftaran yang menunggu persetujuan" : "Belum ada peserta di kategori ini"}
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((m) => {
            const user = m.membership_user;
            const isActing = acting === user?.uuid;
            return (
              <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                {/* Avatar */}
                {user?.profile_photo_url ? (
                  <img src={user.profile_photo_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-extrabold text-teal-700">
                    {(user?.name ?? "?").charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900">{user?.name ?? "—"}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_BADGE[m.status] ?? ""}`}>
                      {STATUS_LBL[m.status] ?? m.status}
                    </span>
                    {m.guest_count > 0 && (
                      <span className="text-[10px] text-gray-400">+{m.guest_count} tamu</span>
                    )}
                    {m.joined_at && (
                      <span className="text-[10px] text-gray-400">{new Date(m.joined_at).toLocaleDateString("id-ID")}</span>
                    )}
                  </div>
                </div>

                {/* Aksi */}
                <div className="flex shrink-0 gap-1.5">
                  {m.status === "pending" && user?.uuid && (
                    <>
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => act(user.uuid, "active")}
                        className="rounded-full bg-teal-500 px-3 py-1.5 text-[11px] font-bold text-white hover:brightness-105 disabled:opacity-50 transition"
                      >
                        {isActing ? "…" : "✓ Setujui"}
                      </button>
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => act(user.uuid, "removed_by_host")}
                        className="rounded-full border border-red-200 px-3 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
                      >
                        {isActing ? "…" : "✗ Tolak"}
                      </button>
                    </>
                  )}
                  {m.status === "active" && user?.uuid && (
                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => act(user.uuid, "removed_by_host")}
                      className="rounded-full border border-gray-200 px-3 py-1.5 text-[11px] font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition"
                    >
                      {isActing ? "…" : "Hapus"}
                    </button>
                  )}
                  {(m.status === "waitlist") && user?.uuid && (
                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => act(user.uuid, "active")}
                      className="rounded-full bg-blue-500 px-3 py-1.5 text-[11px] font-bold text-white hover:brightness-105 disabled:opacity-50 transition"
                    >
                      {isActing ? "…" : "Pindah ke Aktif"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ringkasan */}
      <p className="text-[11px] text-gray-400 text-right">
        Total terdaftar: {total} peserta
      </p>
    </div>
  );
}

/* ─── KOMPONEN UTAMA ─── */
export function EventDetailClient({ eventUuid }: { eventUuid: string }) {
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [myUuid, setMyUuid] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = getStoredUserRaw();
      if (raw) {
        const u = JSON.parse(raw) as { uuid?: string };
        setMyUuid(u.uuid ?? null);
      }
    } catch { /* ignore */ }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const token = getStoredToken();
      const data = await fetchEventDetail(eventUuid, token);
      setEvent(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Gagal memuat acara.");
    } finally {
      setLoading(false);
    }
  }, [eventUuid]);

  useEffect(() => { load(); }, [load]);

  async function handleJoin() {
    const token = getStoredToken();
    if (!token) { router.push("/login"); return; }
    setJoining(true);
    setActionMsg(null);
    try {
      const res = await joinEventApi(token, eventUuid);
      setActionMsg(res.status === "active" ? "✅ Berhasil bergabung!" : res.status === "pending" ? "⏳ Permintaan terkirim, menunggu persetujuan." : "✅ Kamu masuk daftar tunggu.");
      await load();
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : "Gagal bergabung.");
    } finally {
      setJoining(false);
    }
  }

  async function handleLeave() {
    const token = getStoredToken();
    if (!token) return;
    setLeaving(true);
    setActionMsg(null);
    try {
      await leaveEventApi(token, eventUuid);
      setActionMsg("Pendaftaran dibatalkan.");
      await load();
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : "Gagal membatalkan.");
    } finally {
      setLeaving(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
    </div>
  );
  if (err || !event) return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <p className="text-5xl">😕</p>
      <p className="font-semibold text-gray-600">{err ?? "Acara tidak ditemukan."}</p>
      <button onClick={() => router.back()} className="rounded-xl bg-teal-500 px-6 py-2 text-sm font-bold text-white">Kembali</button>
    </div>
  );

  const isCreator = myUuid === event.creator?.uuid;
  const token = getStoredToken() ?? "";
  const canJoin = !event.my_membership && event.status === "published" && !isCreator;
  const isPast = event.ends_at ? new Date(event.ends_at) < new Date() : new Date(event.starts_at) < new Date();

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-teal-600 transition">
        ← Kembali
      </button>

      {/* Cover */}
      {event.cover_image_url && (
        <img src={event.cover_image_url} alt={event.title} className="w-full rounded-3xl object-cover" style={{ maxHeight: 360 }} />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Konten utama */}
        <div className="space-y-6 lg:col-span-2">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <TypeBadge type={event.gathering_type} />
              <FormatBadge format={event.format} />
              {event.primary_category && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{event.primary_category}</span>
              )}
              {isPast && <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">Sudah selesai</span>}
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">{event.title}</h1>
            {event.subtitle && <p className="text-base text-gray-600">{event.subtitle}</p>}
          </div>

          {/* Waktu */}
          <div className="flex gap-4 rounded-2xl bg-gray-50 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-2xl">📅</div>
            <div>
              <p className="font-bold text-gray-800">{fmt(event.starts_at)}</p>
              <p className="text-sm text-gray-500">
                Pukul {fmtTime(event.starts_at)}
                {event.ends_at && ` – ${fmtTime(event.ends_at)}`}
                {" "}· {event.timezone}
              </p>
              {event.ends_at && (
                <p className="text-xs text-gray-400 mt-0.5">s.d. {fmt(event.ends_at)}</p>
              )}
            </div>
          </div>

          {/* Lokasi */}
          {(event.venue_name || event.venue_city) && (
            <div className="flex gap-4 rounded-2xl bg-gray-50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-2xl">
                {event.format === "online" ? "💻" : "📍"}
              </div>
              <div>
                {event.venue_name && <p className="font-bold text-gray-800">{event.venue_name}</p>}
                {event.venue_address_line && <p className="text-sm text-gray-600">{event.venue_address_line}</p>}
                {event.venue_city && <p className="text-sm text-gray-500">{event.venue_city}</p>}
              </div>
            </div>
          )}

          {/* Map */}
          {event.latitude && event.longitude && (
            <MapEmbed lat={event.latitude} lng={event.longitude} label={event.venue_name} />
          )}

          {/* Deskripsi */}
          {event.description && (
            <div className="space-y-2">
              <h2 className="text-base font-extrabold text-gray-800">Tentang Acara</h2>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                {event.description}
              </div>
            </div>
          )}

          {/* Tags */}
          {toArray(event.tags).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {toArray(event.tags).map((t) => (
                <span key={t} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">#{t}</span>
              ))}
            </div>
          )}

          {/* Host komunitas */}
          {event.hosting_community && (
            <Link href={`/dashboard/user/communities/${event.hosting_community.uuid}`}
              className="flex items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50 p-4 hover:bg-teal-100 transition">
              {event.hosting_community.avatar_url
                ? <img src={event.hosting_community.avatar_url} className="h-10 w-10 rounded-xl object-cover" alt="" />
                : <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-200 text-lg font-bold text-teal-700">{event.hosting_community.name.charAt(0)}</div>
              }
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-teal-500">Diselenggarakan oleh</p>
                <p className="font-bold text-gray-800">{event.hosting_community.name}</p>
              </div>
              <span className="ml-auto text-teal-400">→</span>
            </Link>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Tiket / Join */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
            {/* Kapasitas */}
            <div className="text-center">
              <p className="text-3xl font-extrabold text-gray-900">{event.rsvp_count_cache}</p>
              <p className="text-xs text-gray-500">
                {event.max_attendees ? `dari ${event.max_attendees} tempat tersisa` : "peserta terdaftar"}
              </p>
              {event.max_attendees && (
                <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-teal-400 transition-all"
                    style={{ width: `${Math.min(100, (event.rsvp_count_cache / event.max_attendees) * 100)}%` }}
                  />
                </div>
              )}
            </div>

            {/* Harga */}
            <div className="rounded-xl bg-gray-50 px-4 py-2 text-center">
              {event.is_free
                ? <p className="font-extrabold text-teal-600 text-lg">GRATIS 🎉</p>
                : <p className="font-extrabold text-gray-800 text-lg">{event.price_amount} {event.price_currency}</p>
              }
            </div>

            {/* Aksi */}
            {actionMsg && (
              <p className={`text-center text-sm font-semibold rounded-xl p-2 ${actionMsg.startsWith("✅") || actionMsg.startsWith("⏳") ? "bg-teal-50 text-teal-600" : "bg-red-50 text-red-500"}`}>
                {actionMsg}
              </p>
            )}

            {event.my_membership ? (
              <TicketBox membership={event.my_membership} onLeave={handleLeave} leaving={leaving} />
            ) : isCreator ? (
              <div className="space-y-2">
                <div className="rounded-xl bg-amber-50 py-2 text-center text-xs font-bold text-amber-600">👑 Kamu penyelenggara</div>
                <Link
                  href={`/dashboard/user/events/${eventUuid}/edit`}
                  className="block w-full rounded-xl bg-amber-400 py-2.5 text-center text-sm font-extrabold text-white hover:bg-amber-500 transition"
                >
                  ✏️ Edit Acara
                </Link>
              </div>
            ) : canJoin && !isPast ? (
              <button
                onClick={handleJoin}
                disabled={joining}
                className="w-full rounded-xl bg-teal-500 py-3 text-sm font-extrabold text-white hover:bg-teal-600 transition disabled:opacity-50 shadow-sm"
              >
                {joining
                  ? "Mendaftar…"
                  : (event.join_policy === "restricted" || event.requires_host_approval)
                    ? "📋 Minta Bergabung"
                    : "✅ Daftar Sekarang"}
              </button>
            ) : isPast ? (
              <div className="rounded-xl bg-gray-50 py-2.5 text-center text-sm font-bold text-gray-400">Acara sudah selesai</div>
            ) : null}

            {/* Join policy info */}
            {(event.join_policy === "restricted" || event.requires_host_approval) && (
              <p className="text-center text-[11px] text-gray-400">
                📋 Pendaftaran memerlukan persetujuan penyelenggara. Setelah mendaftar, permintaanmu akan ditinjau oleh host.
              </p>
            )}
          </div>

          {/* Pembuat */}
          {event.creator && (
            <Link href={`/dashboard/user/profile/${event.creator.uuid}`}
              className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:border-teal-200 transition">
              <Avatar name={event.creator.name} src={event.creator.profile_photo_url} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Dibuat oleh</p>
                <p className="text-sm font-bold text-gray-800">{event.creator.name}</p>
              </div>
            </Link>
          )}

          {/* Status badge */}
          <div className={`rounded-2xl px-4 py-3 text-center text-xs font-bold ${
            event.status === "published" ? "bg-green-50 text-green-600"
            : event.status === "cancelled" ? "bg-red-50 text-red-500"
            : event.status === "completed" ? "bg-gray-50 text-gray-500"
            : "bg-amber-50 text-amber-600"
          }`}>
            {event.status === "published" ? "✅ Acara Aktif"
              : event.status === "cancelled" ? "❌ Dibatalkan"
              : event.status === "completed" ? "🏁 Selesai"
              : `⏳ ${event.status}`}
          </div>
        </div>
      </div>

      {/* ─── Panel Kelola Peserta — hanya host ─── */}
      {isCreator && token && (
        <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">👥</span>
            <h2 className="text-base font-extrabold text-gray-900">Kelola Peserta</h2>
            <span className="ml-auto text-xs text-gray-400">Hanya terlihat olehmu sebagai penyelenggara</span>
          </div>
          <EventAttendeesManager eventUuid={eventUuid} token={token} />
        </div>
      )}
    </div>
  );
}
