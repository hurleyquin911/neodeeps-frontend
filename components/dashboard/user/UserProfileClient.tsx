"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchPublicProfile,
  uploadImage,
  updateMyProfile,
  followUser,
  unfollowUser,
  fetchFollowRequests,
  reviewFollowRequest,
  normalizeImageUrls,
  type PublicProfileResponse,
  type CommunityPostItem,
  type CommunityItem,
  type EventItem,
  type FollowListItem,
  type FollowStatus,
} from "@/lib/api";
import { getStoredToken } from "@/lib/auth-storage";

/* ─── Helpers ─── */
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

/* ─── Avatar ─── */
function Avatar({ name, photo, size = "xl" }: { name: string; photo?: string | null; size?: "sm" | "md" | "xl" }) {
  const cls = size === "xl" ? "h-24 w-24 text-3xl" : size === "md" ? "h-12 w-12 text-lg" : "h-9 w-9 text-sm";
  if (photo) return <img src={photo} alt={name} className={`${cls} relative z-20 shrink-0 rounded-full object-cover ring-4 ring-white shadow-lg`} />;
  return (
    <div className={`${cls} relative z-20 shrink-0 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center font-extrabold text-white ring-4 ring-white shadow-lg`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

/* ─── Stat Chip ─── */
function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xl font-extrabold text-gray-900">{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

/* ─── Post mini card ─── */
type PostWithCom = CommunityPostItem & {
  community?: { uuid: string; name: string; avatar_url?: string | null } | null;
};

function PostMini({ post }: { post: PostWithCom }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      {post.community && (
        <Link href={`/dashboard/user/communities/${post.community.uuid}`}
          className="flex items-center gap-1.5 text-[11px] font-bold text-teal-600 hover:underline">
          {post.community.avatar_url
            ? <img src={post.community.avatar_url} alt="" className="h-4 w-4 rounded-full object-cover" />
            : <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-100 text-[9px] font-extrabold text-teal-700">{post.community.name.charAt(0)}</span>
          }
          {post.community.name}
        </Link>
      )}
      {post.post_type === "announcement" && (
        <span className="inline-block w-fit rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">📢 Pengumuman</span>
      )}
      {post.content && (
        <p className="line-clamp-3 text-sm text-gray-800 leading-relaxed">{post.content}</p>
      )}
      {(() => {
        const mediaUrls = normalizeImageUrls(post.image_urls);
        if (mediaUrls.length === 0) return null;
        return <img src={mediaUrls[0]} alt="" className="h-32 w-full rounded-xl object-cover" />;
      })()}
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span>❤️ {post.likes_count}</span>
        <span>💬 {post.comments_count}</span>
        <span className="ml-auto">{timeAgo(post.created_at)}</span>
      </div>
    </div>
  );
}

/* ─── Community mini card ─── */
function CommunityMini({ item }: { item: CommunityItem }) {
  return (
    <Link href={`/dashboard/user/communities/${item.uuid}`}
      className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm hover:shadow-md transition hover:-translate-y-[1px]">
      {item.avatar_url || item.cover_image_url ? (
        <img src={item.avatar_url ?? item.cover_image_url!} alt={item.name} className="h-10 w-10 shrink-0 rounded-xl object-cover" />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-sm font-extrabold text-teal-700">
          {item.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-gray-900">{item.name}</p>
        <p className="text-xs text-gray-500">👥 {item.member_count_cache} anggota</p>
      </div>
    </Link>
  );
}

/* ─── Event mini card ─── */
function EventMini({ item }: { item: EventItem }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
      {item.cover_image_url ? (
        <img src={item.cover_image_url} alt={item.title} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-xl">📅</div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-gray-900">{item.title}</p>
        <p className="text-xs text-gray-500">{formatDate(item.starts_at)}{item.venue_city ? ` · ${item.venue_city}` : ""}</p>
      </div>
    </div>
  );
}

/* ─── Section wrapper ─── */
function Section({ title, children, empty, emptyText }: { title: string; children: React.ReactNode; empty: boolean; emptyText?: string }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-extrabold uppercase tracking-widest text-gray-500">{title}</h3>
      {empty ? (
        <p className="text-sm text-gray-400 italic">{emptyText ?? "Belum ada konten."}</p>
      ) : children}
    </div>
  );
}

/* ─── Private screen ─── */
/* ─── Upload banner langsung di halaman profil ─── */
function BannerUploadButton({ currentUrl }: { currentUrl: string | null }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    /*
     * Hanya menutupi 2/3 atas banner (bukan seluruh area).
     * Bagian bawah banner (tempat avatar overlap) dibiarkan bebas
     * sehingga foto profil tidak tertimpa / ter-trigger.
     */
    <div className="absolute inset-x-0 top-0 h-2/3 flex items-start justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
      <label className={`pointer-events-auto cursor-pointer flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-bold text-white shadow backdrop-blur-sm hover:bg-black/70 transition ${uploading ? "opacity-70 !cursor-not-allowed" : ""}`}>
        {uploading ? "⏳ Mengunggah…" : "📷 Ubah Banner"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            const token = getStoredToken();
            if (!file || !token) return;
            setUploading(true);
            setErr(null);
            try {
              const url = await uploadImage(token, file);
              await updateMyProfile(token, { profile_banner_url: url });
              window.location.reload();
            } catch (ex) {
              setErr(ex instanceof Error ? ex.message : "Upload gagal");
            } finally {
              setUploading(false);
              e.target.value = "";
            }
          }}
        />
      </label>
      {err && (
        <span className="absolute top-10 right-3 rounded-lg bg-red-500 px-3 py-1 text-[11px] font-bold text-white shadow">
          {err}
        </span>
      )}
    </div>
  );
}

function PrivateScreen({
  user,
  followStatus,
  onFollow,
  followLoading,
  hasToken,
}: {
  user: PublicProfileResponse["data"];
  followStatus: FollowStatus | null;
  onFollow: () => void;
  followLoading: boolean;
  hasToken: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-gray-200 bg-gray-50 py-14 text-center">
      <span className="text-5xl">🔒</span>
      <div>
        <p className="font-extrabold text-gray-700">Akun ini privat</p>
        <p className="mt-1 text-sm text-gray-500 max-w-xs">
          Konten {user.name} hanya bisa dilihat setelah permintaan follow disetujui.
        </p>
      </div>
      {!hasToken ? (
        <Link href="/login" className="rounded-full bg-teal-500 px-5 py-2 text-sm font-bold text-white">
          Masuk untuk mengikuti
        </Link>
      ) : followStatus === "pending" ? (
        <span className="rounded-full border border-amber-200 bg-amber-50 px-5 py-2 text-sm font-bold text-amber-700">
          ⏳ Menunggu konfirmasi
        </span>
      ) : followStatus === "active" ? null : (
        <button
          type="button"
          onClick={onFollow}
          disabled={followLoading}
          className="rounded-full bg-teal-500 px-5 py-2 text-sm font-bold text-white hover:bg-teal-600 disabled:opacity-60"
        >
          {followLoading ? "…" : "Minta Ikuti"}
        </button>
      )}
    </div>
  );
}

function FollowRequestsPanel({ token }: { token: string }) {
  const [requests, setRequests] = useState<FollowListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    fetchFollowRequests(token, { limit: 20 })
      .then((r) => setRequests(r.data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleReview(requestUuid: string, action: "approve" | "reject") {
    setActing(requestUuid);
    try {
      await reviewFollowRequest(token, requestUuid, action);
      setRequests((prev) => prev.filter((r) => r.uuid !== requestUuid));
    } catch { /* silent */ }
    finally { setActing(null); }
  }

  if (loading || requests.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5 space-y-3">
      <h3 className="text-sm font-extrabold text-amber-900">Permintaan Follow ({requests.length})</h3>
      <ul className="space-y-2">
        {requests.map((req) => (
          <li key={req.uuid} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 shadow-sm">
            {req.user?.profile_photo_url ? (
              <img src={req.user.profile_photo_url} alt="" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
                {req.user?.name?.charAt(0) ?? "?"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-gray-900">{req.user?.name ?? "Pengguna"}</p>
              <p className="text-xs text-gray-400">@{req.user?.username}</p>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={acting === req.uuid}
                onClick={() => void handleReview(req.uuid, "approve")}
                className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-50"
              >
                Terima
              </button>
              <button
                type="button"
                disabled={acting === req.uuid}
                onClick={() => void handleReview(req.uuid, "reject")}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Tolak
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FollowButton({
  userUuid,
  isPrivate,
  followStatus,
  token,
  loading,
  onFollow,
  onUnfollow,
}: {
  userUuid: string;
  isPrivate: boolean;
  followStatus: FollowStatus | null;
  token: string | null;
  loading: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
}) {
  if (!token) {
    return (
      <Link href="/login" className="rounded-full bg-teal-500 px-4 py-1.5 text-xs font-bold text-white">
        Masuk untuk mengikuti
      </Link>
    );
  }

  if (followStatus === "active") {
    return (
      <button
        type="button"
        onClick={onUnfollow}
        disabled={loading}
        className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
      >
        {loading ? "…" : "Berhenti Ikuti"}
      </button>
    );
  }

  if (followStatus === "pending") {
    return (
      <button
        type="button"
        onClick={onUnfollow}
        disabled={loading}
        className="rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-700 disabled:opacity-60"
      >
        {loading ? "…" : "Batalkan Permintaan"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onFollow}
      disabled={loading}
      className="rounded-full bg-teal-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-teal-600 disabled:opacity-60"
    >
      {loading ? "…" : isPrivate ? "Minta Ikuti" : "Ikuti"}
    </button>
  );
}

/* ─── Main ─── */
export function UserProfileClient({ userUuid }: { userUuid: string }) {
  const [profile, setProfile] = useState<PublicProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myUuid, setMyUuid] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);

  const loadProfile = useCallback(async (t: string | null) => {
    setLoading(true);
    setError(null);
    try {
      setProfile(await fetchPublicProfile(userUuid, t));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat profil.");
    } finally {
      setLoading(false);
    }
  }, [userUuid]);

  useEffect(() => {
    const t = getStoredToken();
    setToken(t);
    try {
      if (t) {
        const payload = JSON.parse(atob(t.split(".")[1]));
        setMyUuid(payload.uuid ?? null);
      }
    } catch { /* silent */ }
    void loadProfile(t);
  }, [loadProfile]);

  async function handleFollow() {
    if (!token) return;
    setFollowLoading(true);
    try {
      await followUser(token, userUuid);
      await loadProfile(token);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal mengikuti.");
    } finally {
      setFollowLoading(false);
    }
  }

  async function handleUnfollow() {
    if (!token) return;
    setFollowLoading(true);
    try {
      await unfollowUser(token, userUuid);
      await loadProfile(token);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal berhenti mengikuti.");
    } finally {
      setFollowLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 animate-pulse rounded-3xl bg-gray-100" />
        <div className="h-32 animate-pulse rounded-3xl bg-gray-100" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />)}
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <span className="text-5xl">⚠️</span>
        <p className="font-bold text-gray-700">{error ?? "Profil tidak ditemukan."}</p>
        <Link href="/dashboard/user/explore" className="rounded-full bg-teal-500 px-5 py-2 text-sm font-bold text-white">← Kembali</Link>
      </div>
    );
  }

  const { data: user, content_visible, communities, events, posts, followers_count, following_count, my_follow_status } = profile;
  const isSelf = myUuid === user.uuid;
  const followStatus = (my_follow_status ?? "none") as FollowStatus;

  const gallery = Array.isArray(user.profile_photos) ? user.profile_photos : [];

  const infoRows = [
    user.city && { icon: "📍", label: user.city },
    user.occupation && { icon: "💼", label: user.occupation },
    user.mbti && { icon: "🧠", label: user.mbti },
    user.zodiac && { icon: "✨", label: user.zodiac },
  ].filter(Boolean) as { icon: string; label: string }[];

  const tags = Array.isArray(user.interest_tags) ? user.interest_tags : [];

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/dashboard/user/explore" className="text-xs font-bold text-teal-600 hover:underline">← Jelajahi</Link>

      {/* Profile header */}
      <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Banner / Cover */}
        <div className="relative h-36 group">
          {user.profile_banner_url
            ? <img src={user.profile_banner_url} alt="Banner profil" className="h-full w-full object-cover" />
            : <div className="h-full w-full bg-gradient-to-r from-teal-400 via-teal-500 to-amber-400" />
          }
          {/* Tombol upload banner — hanya muncul kalau ini profil sendiri */}
          {isSelf && <BannerUploadButton currentUrl={user.profile_banner_url ?? null} />}
        </div>

        <div className="px-6 pb-6">
          <div className="relative z-10 -mt-12 flex items-end justify-between gap-4">
            <Avatar name={user.name} photo={user.profile_photo_url} size="xl" />
            <div className="flex items-center gap-2 pb-1">
              {user.is_private && (
                <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold text-gray-600">🔒 Privat</span>
              )}
              {!isSelf && (
                <FollowButton
                  userUuid={user.uuid}
                  isPrivate={user.is_private}
                  followStatus={followStatus}
                  token={token}
                  loading={followLoading}
                  onFollow={() => void handleFollow()}
                  onUnfollow={() => void handleUnfollow()}
                />
              )}
              {isSelf && (
                <Link href="/dashboard/user/settings"
                  className="rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-100 transition">
                  ✏️ Edit Profil
                </Link>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">{user.name}</h1>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>

            {user.bio && (
              <p className="text-sm leading-relaxed text-gray-700 max-w-lg">{user.bio}</p>
            )}

            {/* Info row */}
            {infoRows.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-1">
                {infoRows.map((r) => (
                  <span key={r.label} className="flex items-center gap-1 text-xs text-gray-600">
                    <span>{r.icon}</span> {r.label}
                  </span>
                ))}
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  🗓️ Bergabung {formatDate(user.created_at)}
                </span>
              </div>
            )}

            {/* Interest tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((t) => (
                  <span key={t} className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-700 border border-teal-100">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-8 pt-3 border-t border-gray-50 mt-3">
              <Stat label="Pengikut" value={followers_count} />
              <Stat label="Mengikuti" value={following_count} />
              <Stat label="Komunitas" value={communities.length > 0 ? communities.length : "—"} />
              <Stat label="Acara dibuat" value={events.length > 0 ? events.length : "—"} />
            </div>
          </div>
        </div>
      </div>

      {/* Permintaan follow masuk — profil sendiri & akun privat */}
      {isSelf && user.is_private && token && <FollowRequestsPanel token={token} />}

      {/* Galeri foto (selalu tampil jika ada, meski privat) */}
      {gallery.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-gray-500">🖼️ Galeri Foto</h3>
          <div className={`grid gap-2 ${gallery.length === 1 ? "" : gallery.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
            {gallery.map((url, i) => (
              <img key={i} src={url} alt="" className="w-full aspect-square object-cover rounded-2xl shadow-sm" />
            ))}
          </div>
        </div>
      )}

      {/* Private screen */}
      {!content_visible && (
        <PrivateScreen
          user={user}
          followStatus={followStatus}
          onFollow={() => void handleFollow()}
          followLoading={followLoading}
          hasToken={!!token}
        />
      )}

      {/* Content sections */}
      {content_visible && (
        <div className="space-y-8">
          {/* Komunitas */}
          <Section title="🏘️ Komunitas yang Dibuat" empty={communities.length === 0} emptyText="Belum membuat komunitas.">
            <div className="grid gap-3 sm:grid-cols-2">
              {communities.map((c) => <CommunityMini key={c.uuid} item={c} />)}
            </div>
          </Section>

          {/* Acara */}
          <Section title="📅 Acara yang Dibuat" empty={events.length === 0} emptyText="Belum membuat acara.">
            <div className="grid gap-3 sm:grid-cols-2">
              {events.map((ev) => <EventMini key={ev.uuid} item={ev} />)}
            </div>
          </Section>

          {/* Posts */}
          <Section title="✏️ Postingan Terbaru" empty={posts.length === 0} emptyText="Belum ada postingan.">
            <div className="grid gap-3 sm:grid-cols-2">
              {(posts as PostWithCom[]).map((p) => <PostMini key={p.uuid} post={p} />)}
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
