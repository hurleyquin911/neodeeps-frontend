"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  fetchMyGlobalFeed,
  fetchPublicCommunities,
  fetchPublicEvents,
  fetchMyCommunityMemberships,
  toggleLikePost,
  fetchPostComments,
  createPostComment,
  deletePostComment,
  createCommunityPost,
  uploadImage,
  normalizeImageUrls,
  type CommunityPostItem,
  type CommunityPostComment,
  type CommunityItem,
  type EventItem,
  type CommunityMembershipItem,
  type PostType,
} from "@/lib/api";
import { getStoredToken } from "@/lib/auth-storage";

/* helper: deteksi URL video */
function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|ogg|avi|mkv)(\?|$)/i.test(url);
}

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
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function Avatar({ name, photo, size = "md" }: { name: string; photo?: string | null; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-base";
  if (photo) return <img src={photo} alt={name} className={`${cls} shrink-0 rounded-full object-cover`} />;
  return (
    <div className={`${cls} shrink-0 rounded-full bg-teal-100 flex items-center justify-center font-extrabold text-teal-700`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function PostMediaGallery({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null;
  if (urls.length === 1) {
    const url = urls[0];
    return (
      <div className="bg-neutral-100">
        {isVideoUrl(url) ? (
          <video src={url} controls className="mx-auto max-h-[min(520px,72vh)] w-full bg-black" />
        ) : (
          <img src={url} alt="" className="mx-auto max-h-[min(520px,72vh)] w-full object-contain" />
        )}
      </div>
    );
  }
  return (
    <div className={`grid gap-0.5 bg-neutral-100 ${urls.length >= 2 ? "grid-cols-2" : ""}`}>
      {urls.slice(0, 4).map((url, i) =>
        isVideoUrl(url) ? (
          <video key={i} src={url} controls className="aspect-square w-full bg-black object-cover" />
        ) : (
          <img key={i} src={url} alt="" className="aspect-square w-full object-cover" />
        )
      )}
    </div>
  );
}

function PostActionBar({
  liked,
  likesCount,
  commentsCount,
  liking,
  hasToken,
  onLike,
  onToggleComments,
}: {
  liked: boolean;
  likesCount: number;
  commentsCount: number;
  liking: boolean;
  hasToken: boolean;
  onLike: () => void;
  onToggleComments: () => void;
}) {
  return (
    <div className="grid grid-cols-2 border-t border-gray-100">
      <button
        type="button"
        onClick={onLike}
        disabled={!hasToken || liking}
        className={`flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition hover:bg-gray-50 disabled:opacity-50 ${
          liked ? "text-red-500" : "text-gray-600"
        }`}
      >
        <span className="text-lg leading-none">{liked ? "❤️" : "🤍"}</span>
        Suka{likesCount > 0 ? ` · ${likesCount}` : ""}
      </button>
      <button
        type="button"
        onClick={onToggleComments}
        className="flex items-center justify-center gap-2 border-l border-gray-100 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
      >
        <span className="text-lg leading-none">💬</span>
        Komentar{commentsCount > 0 ? ` · ${commentsCount}` : ""}
      </button>
    </div>
  );
}

/* ─── Komentar (collapse/expand) ─── */
function CommentSection({ post, token }: { post: CommunityPostItem; token: string }) {
  const communityUuid = (post as unknown as { community?: { uuid?: string } }).community?.uuid ?? "";
  const [comments, setComments] = useState<CommunityPostComment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!communityUuid) return;
    fetchPostComments(token || null, communityUuid, post.uuid)
      .then((r) => { setComments(r.data); setTotal(r.meta.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [communityUuid, post.uuid, token]);

  async function send() {
    if (!text.trim() || !token || !communityUuid) return;
    setSending(true);
    try {
      const c = await createPostComment(token, communityUuid, post.uuid, text.trim());
      setComments((prev) => [...prev, c]);
      setTotal((t) => t + 1);
      setText("");
    } catch { /* silent */ }
    finally { setSending(false); }
  }

  async function removeComment(uuid: string) {
    if (!token || !communityUuid) return;
    try {
      await deletePostComment(token, communityUuid, post.uuid, uuid);
      setComments((prev) => prev.filter((c) => c.uuid !== uuid));
      setTotal((t) => Math.max(0, t - 1));
    } catch { /* silent */ }
  }

  return (
    <div className="mt-3 border-t border-gray-100 pt-3 space-y-3">
      {loading ? (
        <p className="text-xs text-gray-400">Memuat komentar…</p>
      ) : (
        <>
          {comments.map((c) => (
            <div key={c.uuid} className="flex gap-2.5 group">
              {c.author?.uuid ? (
                <Link href={`/dashboard/user/profile/${c.author.uuid}`} className="shrink-0 transition hover:opacity-80">
                  <Avatar name={c.author.name} photo={c.author.profile_photo_url} size="sm" />
                </Link>
              ) : (
                <Avatar name={c.author?.name ?? "?"} photo={c.author?.profile_photo_url} size="sm" />
              )}
              <div className="min-w-0 flex-1">
                <div className="rounded-2xl bg-gray-50 px-3 py-2">
                  {c.author?.uuid ? (
                    <Link
                      href={`/dashboard/user/profile/${c.author.uuid}`}
                      className="text-xs font-bold text-gray-800 hover:text-teal-600 hover:underline"
                    >
                      {c.author.name}
                    </Link>
                  ) : (
                    <p className="text-xs font-bold text-gray-800">{c.author?.name}</p>
                  )}
                  <p className="text-sm text-gray-700 break-words">{c.content}</p>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-[10px] text-gray-400">{timeAgo(c.created_at)}</p>
                  <button type="button" onClick={() => removeComment(c.uuid)}
                    className="hidden group-hover:block text-[10px] text-red-400 hover:text-red-600">
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
          {total > comments.length && (
            <p className="text-xs text-gray-400">{total - comments.length} komentar lainnya…</p>
          )}
        </>
      )}
      {token && !post.is_locked && (
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
            placeholder="Tulis komentar…"
            className="min-w-0 flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          />
          <button type="button" onClick={send} disabled={sending || !text.trim()}
            className="shrink-0 rounded-full bg-teal-500 px-4 py-2 text-xs font-bold text-white hover:brightness-105 disabled:opacity-40">
            Kirim
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Feed Post Card ─── */
function FeedPostCard({ post, token, onLike }: {
  post: CommunityPostItem;
  token: string;
  onLike: (uuid: string, liked: boolean, count: number) => void;
}) {
  const community = (post as unknown as { community?: { uuid?: string; name?: string; avatar_url?: string | null } }).community;
  const [liked, setLiked] = useState(post.liked_by_me);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [liking, setLiking] = useState(false);

  async function handleLike() {
    if (!token || liking || !community?.uuid) return;
    setLiking(true);
    try {
      const r = await toggleLikePost(token, community.uuid, post.uuid);
      setLiked(r.liked);
      setLikesCount(r.likes_count);
      onLike(post.uuid, r.liked, r.likes_count);
    } catch { /* silent */ }
    finally { setLiking(false); }
  }

  const typeLabel: Record<string, string> = {
    announcement: "Pengumuman",
    event_share: "Acara",
  };

  const authorName = post.author?.name ?? "Pengguna";
  const authorUuid = post.author?.uuid;
  const mediaUrls = normalizeImageUrls(post.image_urls);
  const hasMedia = mediaUrls.length > 0;

  return (
    <article className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${post.is_pinned ? "border-amber-200 ring-1 ring-amber-100" : "border-gray-200"}`}>
      {/* Header — satu baris seperti Facebook */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        {authorUuid ? (
          <Link href={`/dashboard/user/profile/${authorUuid}`} className="shrink-0 transition hover:opacity-80">
            <Avatar name={authorName} photo={post.author?.profile_photo_url} />
          </Link>
        ) : (
          <Avatar name={authorName} photo={post.author?.profile_photo_url} />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
            {authorUuid ? (
              <Link href={`/dashboard/user/profile/${authorUuid}`} className="text-sm font-bold text-gray-900 hover:underline">
                {authorName}
              </Link>
            ) : (
              <span className="text-sm font-bold text-gray-900">{authorName}</span>
            )}
            {community && (
              <>
                <span className="text-gray-300">·</span>
                <Link
                  href={`/dashboard/user/communities/${community.uuid}`}
                  className="text-sm font-semibold text-teal-600 hover:underline"
                >
                  {community.name}
                </Link>
              </>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-400">
            <span>{timeAgo(post.created_at)}</span>
            {post.is_pinned && <span className="font-semibold text-amber-600">📌 Disematkan</span>}
            {typeLabel[post.post_type] && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                {typeLabel[post.post_type]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Teks saja — tampil di atas (Facebook) */}
      {!hasMedia && post.content && (
        <div className="px-4 pb-3">
          <p className="text-[15px] leading-relaxed text-gray-800 whitespace-pre-wrap">{post.content}</p>
        </div>
      )}

      {/* Media full-bleed — seperti Instagram */}
      {hasMedia && <PostMediaGallery urls={mediaUrls} />}

      {/* Aksi + meta */}
      <div className="px-0">
        <PostActionBar
          liked={liked}
          likesCount={likesCount}
          commentsCount={post.comments_count}
          liking={liking}
          hasToken={!!token}
          onLike={() => void handleLike()}
          onToggleComments={() => setShowComments((v) => !v)}
        />

        <div className="space-y-1 px-4 py-2.5">
          {likesCount > 0 && (
            <p className="text-sm font-semibold text-gray-900">{likesCount.toLocaleString("id-ID")} suka</p>
          )}

          {/* Caption di bawah media — seperti Instagram */}
          {hasMedia && post.content && (
            <p className="text-sm leading-relaxed text-gray-800">
              <Link href={authorUuid ? `/dashboard/user/profile/${authorUuid}` : "#"} className="mr-1.5 font-bold text-gray-900 hover:underline">
                {authorName}
              </Link>
              <span className="whitespace-pre-wrap">{post.content}</span>
            </p>
          )}

          {post.comments_count > 0 && !showComments && (
            <button
              type="button"
              onClick={() => setShowComments(true)}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Lihat {post.comments_count} komentar
            </button>
          )}
        </div>

        {showComments && (
          <div className="border-t border-gray-100 px-4 pb-4">
            <CommentSection post={post} token={token} />
          </div>
        )}
      </div>
    </article>
  );
}

/* ─── Quick Post Composer (di Global Feed) ─── */
function QuickPostComposer({ token, onPosted }: { token: string; onPosted: () => void }) {
  const [memberships, setMemberships] = useState<CommunityMembershipItem[]>([]);
  const [selectedCommunityUuid, setSelectedCommunityUuid] = useState("");
  const [content, setContent] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [postErr, setPostErr] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    fetchMyCommunityMemberships(token, { status: "active" })
      .then((r) => {
        setMemberships(r.data);
        if (r.data.length > 0) setSelectedCommunityUuid(r.data[0].community?.uuid ?? "");
      })
      .catch(() => {});
  }, [token]);

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setUploadErr(null);
    try {
      const urls = await Promise.all(files.map((f) => uploadImage(token, f)));
      setMediaUrls((prev) => [...prev, ...urls]);
    } catch (ex) {
      setUploadErr(ex instanceof Error ? ex.message : "Upload gagal");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handlePost() {
    if (!selectedCommunityUuid || (!content.trim() && mediaUrls.length === 0) || posting) return;
    setPosting(true);
    setPostErr(null);
    try {
      const type: PostType = mediaUrls.length > 0 ? "image" : "text";
      await createCommunityPost(token, selectedCommunityUuid, {
        content: content.trim() || undefined,
        image_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
        post_type: type,
      });
      setContent("");
      setMediaUrls([]);
      setExpanded(false);
      onPosted();
    } catch (ex) {
      setPostErr(ex instanceof Error ? ex.message : "Gagal posting");
    } finally { setPosting(false); }
  }

  if (!memberships.length) return null;

  return (
    <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Collapsed state — klik untuk expand */}
      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-gray-50/80 transition"
        >
          <div className="h-10 w-10 shrink-0 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-lg">✏️</div>
          <span className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-400">
            Tulis postingan ke komunitasmu…
          </span>
          <span className="text-xs font-bold text-teal-500 shrink-0">Posting</span>
        </button>
      ) : (
        <div className="p-5 space-y-3">
          {/* Pilih komunitas */}
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 shrink-0 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">📢</div>
            <select
              value={selectedCommunityUuid}
              onChange={(e) => setSelectedCommunityUuid(e.target.value)}
              className="min-w-0 flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-teal-400"
            >
              {memberships.map((m) => (
                <option key={m.community?.uuid} value={m.community?.uuid ?? ""}>
                  {m.community?.name ?? "Komunitas"}
                </option>
              ))}
            </select>
          </div>

          {/* Textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ceritakan sesuatu ke komunitas ini…"
            rows={3}
            autoFocus
            className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50/60 px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100/40"
          />

          {/* Preview media */}
          {mediaUrls.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {mediaUrls.map((url, i) => (
                <div key={i} className="relative">
                  {isVideoUrl(url) ? (
                    <video src={url} className="h-20 w-20 rounded-xl object-cover bg-black" muted />
                  ) : (
                    <img src={url} alt="" className="h-20 w-20 rounded-xl object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => setMediaUrls((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white"
                  >✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Errors */}
          {uploadErr && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{uploadErr}</p>}
          {postErr && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{postErr}</p>}

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3.5 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
              >
                {uploading
                  ? <><span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" /> Mengunggah…</>
                  : <>📎 Foto / Video</>
                }
              </button>
              <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleMediaUpload} />

              <button
                type="button"
                onClick={() => { setExpanded(false); setContent(""); setMediaUrls([]); setPostErr(null); setUploadErr(null); }}
                className="rounded-full border border-gray-200 px-3.5 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 transition"
              >
                Batal
              </button>
            </div>

            <button
              type="button"
              onClick={handlePost}
              disabled={posting || !selectedCommunityUuid || (!content.trim() && mediaUrls.length === 0)}
              className="rounded-full bg-teal-500 px-5 py-2 text-sm font-bold text-white shadow hover:brightness-105 disabled:opacity-40 transition"
            >
              {posting ? "Posting…" : "Posting"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Skeleton loader ─── */
function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-sm">
          <div className="h-12 animate-pulse bg-gray-100" />
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 w-32 animate-pulse rounded-full bg-gray-200" />
                <div className="h-2.5 w-20 animate-pulse rounded-full bg-gray-100" />
              </div>
            </div>
            <div className="h-3 w-full animate-pulse rounded-full bg-gray-100" />
            <div className="h-3 w-3/4 animate-pulse rounded-full bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Empty Feed + Rekomendasi ─── */
function EmptyFeed() {
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingRec, setLoadingRec] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = getStoredToken();
        const [c, e] = await Promise.all([
          fetchPublicCommunities({ limit: 4, token }),
          fetchPublicEvents({ limit: 3, token }),
        ]);
        setCommunities(c.data);
        setEvents(e.data);
      } catch { /* silent */ }
      finally { setLoadingRec(false); }
    })();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-400 to-teal-600 p-8 text-white text-center shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 30%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <p className="text-5xl mb-3">🏘️</p>
        <h2 className="text-2xl font-extrabold mb-2">Selamat datang di Neodeeps!</h2>
        <p className="text-teal-100 text-sm max-w-sm mx-auto">Bergabunglah ke komunitas untuk melihat postingan mereka di sini — seperti beranda media sosialmu sendiri.</p>
        <Link href="/dashboard/user/explore"
          className="mt-5 inline-block rounded-full bg-white px-6 py-2.5 text-sm font-extrabold text-teal-600 shadow hover:shadow-md transition">
          🔍 Mulai Jelajahi
        </Link>
      </div>

      {/* Komunitas populer */}
      {!loadingRec && communities.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-gray-800">🔥 Komunitas Populer</h3>
            <Link href="/dashboard/user/explore" className="text-xs font-bold text-teal-500 hover:underline">Lihat semua →</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {communities.map((c) => (
              <Link key={c.uuid} href={`/dashboard/user/communities/${c.uuid}`}
                className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:border-teal-200 hover:shadow-md transition">
                {c.avatar_url
                  ? <img src={c.avatar_url} className="h-12 w-12 rounded-xl object-cover shrink-0" alt="" />
                  : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-xl font-bold text-teal-700">{c.name.charAt(0)}</div>
                }
                <div className="min-w-0">
                  <p className="truncate font-bold text-gray-900 text-sm">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.member_count_cache ?? 0} anggota · {c.primary_category ?? "Komunitas"}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Acara terdekat */}
      {!loadingRec && events.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-gray-800">📅 Acara Mendatang</h3>
            <Link href="/dashboard/user/explore?tab=events" className="text-xs font-bold text-teal-500 hover:underline">Lihat semua →</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {events.map((ev) => (
              <Link key={ev.uuid} href={`/dashboard/user/events/${ev.uuid}`}
                className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:border-teal-200 hover:shadow-md transition">
                {ev.cover_image_url && <img src={ev.cover_image_url} className="h-24 w-full rounded-xl object-cover" alt="" />}
                <p className="font-bold text-sm text-gray-900 line-clamp-2">{ev.title}</p>
                <p className="text-[11px] text-gray-400">📅 {new Date(ev.starts_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}{ev.venue_city ? ` · ${ev.venue_city}` : ""}</p>
                <span className={`self-start rounded-full px-2 py-0.5 text-[10px] font-bold ${ev.is_free ? "bg-teal-50 text-teal-600" : "bg-amber-50 text-amber-600"}`}>
                  {ev.is_free ? "Gratis" : `Rp ${Number(ev.price_amount ?? 0).toLocaleString("id-ID")}`}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {loadingRec && (
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
        </div>
      )}
    </div>
  );
}

/* ─── Main ─── */
export function GlobalFeedClient() {
  const [token, setToken] = useState("");
  const [posts, setPosts] = useState<CommunityPostItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    const t = getStoredToken() ?? "";
    setToken(t);
  }, []);

  const loadFeed = useCallback(async (p: number, replace = false) => {
    const t = getStoredToken() ?? "";
    if (!t) { setLoading(false); setEmpty(true); return; }
    if (replace) setLoading(true); else setLoadingMore(true);
    try {
      const r = await fetchMyGlobalFeed(t, { page: p, limit: 20 });
      setPosts((prev) => replace ? r.data : [...prev, ...r.data]);
      setTotal(r.meta.total);
      if (replace && r.data.length === 0) setEmpty(true);
    } catch { /* silent */ }
    finally { setLoading(false); setLoadingMore(false); }
  }, []);

  useEffect(() => { void loadFeed(1, true); }, [loadFeed]);

  function handleLike(uuid: string, liked: boolean, count: number) {
    setPosts((prev) => prev.map((p) => p.uuid === uuid ? { ...p, liked_by_me: liked, likes_count: count } : p));
  }

  function loadMore() {
    const next = page + 1;
    setPage(next);
    void loadFeed(next, false);
  }

  if (loading) return <FeedSkeleton />;

  if (empty || posts.length === 0) {
    return <EmptyFeed />;
  }

  const hasMore = posts.length < total;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900">Beranda</h2>
          <p className="text-xs text-gray-400">{total} postingan dari komunitas yang kamu ikuti</p>
        </div>
        <button type="button" onClick={() => void loadFeed(1, true)}
          className="rounded-full border border-gray-200 px-3.5 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50">
          🔄 Refresh
        </button>
      </div>

      {/* Quick post composer */}
      {token && <QuickPostComposer token={token} onPosted={() => void loadFeed(1, true)} />}

      {/* Posts */}
      {posts.map((post) => (
        <FeedPostCard key={post.uuid} post={post} token={token} onLike={handleLike} />
      ))}

      {hasMore && (
        <button type="button" disabled={loadingMore} onClick={loadMore}
          className="w-full rounded-2xl border border-gray-200 py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition">
          {loadingMore ? "Memuat…" : "Muat lebih banyak"}
        </button>
      )}
    </div>
  );
}
