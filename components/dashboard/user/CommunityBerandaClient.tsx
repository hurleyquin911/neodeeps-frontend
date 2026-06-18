"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  fetchCommunityProfile,
  fetchCommunityPosts,
  createCommunityPost,
  deleteCommunityPost,
  toggleLikePost,
  togglePinPost,
  fetchPostComments,
  createPostComment,
  deletePostComment,
  joinCommunity,
  leaveCommunity,
  uploadImage,
  normalizeImageUrls,
  type CommunityItem,
  type CommunityPostItem,
  type CommunityPostComment,
  type PostType,
} from "@/lib/api";
import { getStoredToken } from "@/lib/auth-storage";
import { CommunityDiscussionPanel } from "./CommunityDiscussionPanel";

/* ── Helpers ── */
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

function UserAvatar({ name, photo, size = "md" }: { name: string; photo?: string | null; size?: "sm" | "md" | "lg" }) {
  const px = size === "lg" ? "h-14 w-14 text-xl" : size === "md" ? "h-10 w-10 text-base" : "h-8 w-8 text-sm";
  if (photo) return <img src={photo} alt={name} className={`${px} shrink-0 rounded-full object-cover`} />;
  return (
    <div className={`${px} shrink-0 rounded-full bg-teal-100 flex items-center justify-center font-extrabold text-teal-700`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

/* ── Comment Section ── */
function CommentSection({ post, communityUuid, token, isMember }: {
  post: CommunityPostItem;
  communityUuid: string;
  token: string;
  isMember: boolean;
}) {
  const [comments, setComments] = useState<CommunityPostComment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchPostComments(token || null, communityUuid, post.uuid)
      .then((r) => { setComments(r.data); setTotal(r.meta.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [communityUuid, post.uuid, token]);

  async function send() {
    if (!text.trim() || !token) return;
    setSending(true);
    try {
      const c = await createPostComment(token, communityUuid, post.uuid, text.trim());
      setComments((prev) => [...prev, c]);
      setTotal((t) => t + 1);
      setText("");
    } catch { /* silent */ }
    finally { setSending(false); }
  }

  async function removeComment(commentUuid: string) {
    if (!token) return;
    try {
      await deletePostComment(token, communityUuid, post.uuid, commentUuid);
      setComments((prev) => prev.filter((c) => c.uuid !== commentUuid));
      setTotal((t) => t - 1);
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
                  <UserAvatar name={c.author.name} photo={c.author.profile_photo_url} size="sm" />
                </Link>
              ) : (
                <UserAvatar name={c.author?.name ?? "?"} photo={c.author?.profile_photo_url} size="sm" />
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
                <div className="flex items-center gap-3 mt-1">
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

      {isMember && !post.is_locked && (
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

/* ── Post Card ── */
function PostCard({ post, communityUuid, token, myRole, onDelete, onPin }: {
  post: CommunityPostItem;
  communityUuid: string;
  token: string;
  myRole: string | null;
  onDelete: (uuid: string) => void;
  onPin: (uuid: string, pinned: boolean) => void;
}) {
  const [liked, setLiked] = useState(post.liked_by_me);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [liking, setLiking] = useState(false);

  const isAdminOrOwner = myRole === "owner" || myRole === "admin";
  const isMember = !!myRole;

  async function handleLike() {
    if (!token || liking) return;
    setLiking(true);
    try {
      const r = await toggleLikePost(token, communityUuid, post.uuid);
      setLiked(r.liked);
      setLikesCount(r.likes_count);
    } catch { /* silent */ }
    finally { setLiking(false); }
  }

  async function handlePin() {
    if (!token) return;
    try {
      const pinned = await togglePinPost(token, communityUuid, post.uuid);
      onPin(post.uuid, pinned);
    } catch { /* silent */ }
  }

  async function handleDelete() {
    if (!token || !window.confirm("Hapus post ini?")) return;
    try {
      await deleteCommunityPost(token, communityUuid, post.uuid);
      onDelete(post.uuid);
    } catch { /* silent */ }
  }

  const postTypeBadge: Record<PostType, { label: string; cls: string }> = {
    text: { label: "", cls: "" },
    image: { label: "", cls: "" },
    announcement: { label: "📢 Pengumuman", cls: "bg-amber-100 text-amber-800" },
    event_share: { label: "📅 Acara", cls: "bg-teal-100 text-teal-700" },
  };
  const badge = postTypeBadge[post.post_type];
  const authorName = post.author?.name ?? "Pengguna";
  const authorUuid = post.author?.uuid;
  const mediaUrls = normalizeImageUrls(post.image_urls);
  const hasMedia = mediaUrls.length > 0;

  return (
    <article className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${post.is_pinned ? "border-amber-200 ring-1 ring-amber-100" : "border-gray-200"}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
        <div className="flex min-w-0 items-start gap-3">
          {authorUuid ? (
            <Link href={`/dashboard/user/profile/${authorUuid}`} className="shrink-0 transition hover:opacity-80">
              <UserAvatar name={authorName} photo={post.author?.profile_photo_url} size="md" />
            </Link>
          ) : (
            <UserAvatar name={authorName} photo={post.author?.profile_photo_url} size="md" />
          )}
          <div className="min-w-0">
            {authorUuid ? (
              <Link href={`/dashboard/user/profile/${authorUuid}`} className="text-sm font-bold text-gray-900 hover:underline">
                {authorName}
              </Link>
            ) : (
              <p className="text-sm font-bold text-gray-900">{authorName}</p>
            )}
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-400">
              <span>{timeAgo(post.created_at)}</span>
              {post.is_pinned && <span className="font-semibold text-amber-600">📌 Disematkan</span>}
              {badge.label && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.cls}`}>{badge.label}</span>
              )}
            </div>
          </div>
        </div>
        {(isAdminOrOwner || token) && (
          <div className="flex shrink-0 gap-1">
            {isAdminOrOwner && (
              <button type="button" onClick={handlePin}
                className={`rounded-lg px-2 py-1 text-[10px] font-bold transition ${post.is_pinned ? "bg-amber-100 text-amber-800" : "text-gray-400 hover:bg-gray-50"}`}>
                {post.is_pinned ? "Unpin" : "Pin"}
              </button>
            )}
            <button type="button" onClick={handleDelete}
              className="rounded-lg px-2 py-1 text-[10px] font-bold text-red-400 hover:bg-red-50">
              Hapus
            </button>
          </div>
        )}
      </div>

      {!hasMedia && post.content && (
        <div className="px-4 pb-3">
          <p className="text-[15px] leading-relaxed text-gray-800 whitespace-pre-wrap">{post.content}</p>
        </div>
      )}

      {hasMedia && <PostMediaGallery urls={mediaUrls} />}

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
        {hasMedia && post.content && (
          <p className="text-sm leading-relaxed text-gray-800">
            {authorUuid ? (
              <Link href={`/dashboard/user/profile/${authorUuid}`} className="mr-1.5 font-bold text-gray-900 hover:underline">
                {authorName}
              </Link>
            ) : (
              <span className="mr-1.5 font-bold text-gray-900">{authorName}</span>
            )}
            <span className="whitespace-pre-wrap">{post.content}</span>
          </p>
        )}
        {post.comments_count > 0 && !showComments && (
          <button type="button" onClick={() => setShowComments(true)} className="text-sm text-gray-400 hover:text-gray-600">
            Lihat {post.comments_count} komentar
          </button>
        )}
      </div>

      {showComments && (
        <div className="border-t border-gray-100 px-4 pb-4">
          <CommentSection post={post} communityUuid={communityUuid} token={token} isMember={isMember} />
        </div>
      )}
    </article>
  );
}

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|ogg|avi|mkv)(\?|$)/i.test(url);
}

function PostMediaGallery({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null;
  if (urls.length === 1) {
    const url = urls[0];
    return (
      <div className="-mx-5 bg-neutral-100 sm:mx-0 sm:rounded-none">
        {isVideoUrl(url) ? (
          <video src={url} controls className="mx-auto max-h-[min(520px,72vh)] w-full bg-black" />
        ) : (
          <img src={url} alt="" className="mx-auto max-h-[min(520px,72vh)] w-full object-contain" />
        )}
      </div>
    );
  }
  return (
    <div className={`-mx-5 grid gap-0.5 bg-neutral-100 sm:mx-0 ${urls.length >= 2 ? "grid-cols-2" : ""}`}>
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

/* ── Create Post Form ── */
function CreatePostForm({ communityUuid, token, onPost, isAdminOrOwner }: {
  communityUuid: string;
  token: string;
  onPost: (post: CommunityPostItem) => void;
  isAdminOrOwner: boolean;
}) {
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<PostType>("text");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [postErr, setPostErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setUploadErr(null);
    try {
      const urls = await Promise.all(files.map((f) => uploadImage(token, f)));
      setMediaUrls((prev) => {
        const next = [...prev, ...urls];
        // Otomatis set tipe post ke "image" kalau ada media
        if (next.length > 0) setPostType("image");
        return next;
      });
    } catch (ex) {
      setUploadErr(ex instanceof Error ? ex.message : "Upload gagal, coba lagi.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handlePost() {
    if ((!content.trim() && mediaUrls.length === 0) || posting) return;
    setPosting(true);
    setPostErr(null);
    try {
      const post = await createCommunityPost(token, communityUuid, {
        content: content.trim() || undefined,
        image_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
        post_type: postType,
      });
      onPost(post);
      setContent("");
      setMediaUrls([]);
      setPostType("text");
    } catch (ex) {
      setPostErr(ex instanceof Error ? ex.message : "Gagal posting, coba lagi.");
    } finally { setPosting(false); }
  }

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
      <div className="flex gap-3">
        <div className="h-10 w-10 shrink-0 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-extrabold text-lg">✏️</div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ceritakan sesuatu ke komunitasmu…"
          rows={3}
          className="min-w-0 flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50/60 px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100/40"
        />
      </div>

      {/* Preview media (gambar & video) */}
      {mediaUrls.length > 0 && (
        <div className="flex flex-wrap gap-2 pl-13">
          {mediaUrls.map((url, i) => (
            <div key={i} className="relative">
              {isVideoUrl(url) ? (
                <video src={url} className="h-24 w-24 rounded-xl object-cover bg-black" muted />
              ) : (
                <img src={url} alt="" className="h-24 w-24 rounded-xl object-cover" />
              )}
              <button
                type="button"
                onClick={() => setMediaUrls((prev) => prev.filter((_, j) => j !== i))}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow hover:bg-red-600"
              >
                ✕
              </button>
              {isVideoUrl(url) && (
                <span className="absolute bottom-1 left-1 rounded px-1 py-0.5 text-[9px] font-bold bg-black/60 text-white">VIDEO</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Error upload */}
      {uploadErr && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{uploadErr}</p>
      )}
      {postErr && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{postErr}</p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          {/* Upload gambar/video */}
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
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleMediaUpload}
          />

          {/* Tipe post — hanya admin/owner */}
          {isAdminOrOwner && (
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value as PostType)}
              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-600 outline-none focus:border-amber-400"
            >
              <option value="text">📝 Post biasa</option>
              <option value="image">🖼️ Post media</option>
              <option value="announcement">📢 Pengumuman</option>
            </select>
          )}
        </div>

        <button
          type="button"
          onClick={handlePost}
          disabled={posting || (!content.trim() && mediaUrls.length === 0)}
          className="rounded-full bg-teal-500 px-5 py-2 text-sm font-bold text-white shadow hover:brightness-105 disabled:opacity-40 transition"
        >
          {posting ? "Posting…" : "Posting"}
        </button>
      </div>
    </div>
  );
}

/* ── Community Header ── */
function CommunityHeader({ community, myMembership, onJoin, onLeave, joining }: {
  community: CommunityItem;
  myMembership: { role: string; status: string } | null;
  onJoin: () => void;
  onLeave: () => void;
  joining: boolean;
}) {
  const isOwner = myMembership?.role === "owner";
  const isAdminOrOwner = myMembership?.role === "owner" || myMembership?.role === "admin";

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      {/* Cover image */}
      {community.cover_image_url ? (
        <img src={community.cover_image_url} alt="" className="h-40 w-full object-cover sm:h-52" />
      ) : (
        <div className="h-32 w-full bg-gradient-to-r from-teal-400 to-teal-600 sm:h-44" />
      )}

      <div className="px-5 pb-5">
        {/* Avatar */}
        <div className="-mt-8 flex items-end justify-between gap-4">
          {community.avatar_url ? (
            <img src={community.avatar_url} alt="" className="h-16 w-16 rounded-2xl border-4 border-white object-cover shadow" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-teal-500 text-2xl font-extrabold text-white shadow">
              {community.name.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Tombol aksi */}
          <div className="flex flex-wrap gap-2 pb-1">
            {isAdminOrOwner && (
              <Link href={`/dashboard/user/communities/${community.uuid}/manage`}
                className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 transition">
                👥 Kelola
              </Link>
            )}
            {!myMembership ? (
              <button type="button" onClick={onJoin} disabled={joining}
                className="rounded-full bg-teal-500 px-5 py-2 text-sm font-bold text-white shadow hover:brightness-105 disabled:opacity-50">
                {joining ? "Bergabung…" : "+ Bergabung"}
              </button>
            ) : myMembership.role !== "owner" ? (
              <button type="button" onClick={onLeave} disabled={joining}
                className="rounded-full border border-gray-200 px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                Keluar
              </button>
            ) : null}
          </div>
        </div>

        {/* Info */}
        <div className="mt-3 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold text-gray-900">{community.name}</h1>
            {myMembership && (
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                myMembership.role === "owner" ? "bg-amber-100 text-amber-900" :
                myMembership.role === "admin" ? "bg-teal-100 text-teal-800" :
                "bg-gray-100 text-gray-600"
              }`}>
                {myMembership.role === "owner" ? "👑 Owner" : myMembership.role === "admin" ? "🛡️ Admin" : "Anggota"}
              </span>
            )}
          </div>
          {community.subtitle && <p className="text-sm font-semibold text-gray-600">{community.subtitle}</p>}
          {community.description && (
            <p className="text-sm text-gray-500 line-clamp-3">{community.description}</p>
          )}
          <div className="flex flex-wrap gap-4 pt-1 text-xs text-gray-500">
            <span>👥 {community.member_count_cache} anggota</span>
            <span>📅 {community.event_count_cache} acara</span>
            {community.primary_category && <span>🏷️ {community.primary_category}</span>}
            {community.city && <span>📍 {community.city}{community.province ? `, ${community.province}` : ""}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main ── */
export function CommunityBerandaClient({ communityUuid }: { communityUuid: string }) {
  const [community, setCommunity] = useState<CommunityItem | null>(null);
  const [myMembership, setMyMembership] = useState<{ role: string; status: string } | null>(null);
  const [posts, setPosts] = useState<CommunityPostItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    const t = getStoredToken() ?? "";
    setToken(t);
  }, []);

  // Load profil komunitas
  useEffect(() => {
    if (token === undefined) return; // masih loading token
    fetchCommunityProfile(token || null, communityUuid)
      .then((r) => {
        setCommunity(r.data);
        setMyMembership(r.my_membership);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [communityUuid, token]);

  // Load feed
  const loadPosts = useCallback(async (p: number, replace = false) => {
    setPostsLoading(true);
    try {
      const r = await fetchCommunityPosts(token || null, communityUuid, { page: p, limit: 15 });
      setPosts((prev) => replace ? r.data : [...prev, ...r.data]);
      setTotal(r.meta.total);
    } catch { /* silent */ }
    finally { setPostsLoading(false); }
  }, [communityUuid, token]);

  useEffect(() => {
    if (!loading) { // tunggu profil dulu
      void loadPosts(1, true);
    }
  }, [loading, loadPosts]);

  async function handleJoin() {
    if (!token) return;
    setJoining(true);
    try {
      await joinCommunity(token, communityUuid);
      setMyMembership({ role: "member", status: community?.requires_host_approval ? "pending" : "active" });
      if (community) setCommunity({ ...community, member_count_cache: community.member_count_cache + 1 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal bergabung");
    } finally { setJoining(false); }
  }

  async function handleLeave() {
    if (!token || !window.confirm("Keluar dari komunitas ini?")) return;
    setJoining(true);
    try {
      await leaveCommunity(token, communityUuid);
      setMyMembership(null);
      if (community) setCommunity({ ...community, member_count_cache: Math.max(0, community.member_count_cache - 1) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal keluar");
    } finally { setJoining(false); }
  }

  function handleNewPost(post: CommunityPostItem) {
    setPosts((prev) => [post, ...prev]);
    setTotal((t) => t + 1);
  }

  function handleDeletePost(uuid: string) {
    setPosts((prev) => prev.filter((p) => p.uuid !== uuid));
    setTotal((t) => t - 1);
  }

  function handlePinPost(uuid: string, pinned: boolean) {
    setPosts((prev) => {
      const updated = prev.map((p) =>
        p.uuid === uuid ? { ...p, is_pinned: pinned } : p
      );
      return [...updated].sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    });
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-52 animate-pulse rounded-3xl bg-gray-100" />
        <div className="h-32 animate-pulse rounded-3xl bg-gray-100" />
      </div>
    );
  }

  if (error && !community) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-red-200 bg-red-50 py-20 text-center">
        <span className="text-4xl">⚠️</span>
        <p className="font-bold text-red-700">{error}</p>
        <Link href="/dashboard/user/communities" className="rounded-full bg-teal-500 px-5 py-2 text-sm font-bold text-white">
          ← Kembali
        </Link>
      </div>
    );
  }

  if (!community) return null;

  const isMember = !!myMembership && myMembership.status === "active";
  const isAdminOrOwner = isMember && (myMembership?.role === "owner" || myMembership?.role === "admin");
  const hasMore = posts.length < total;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/dashboard/user/communities" className="text-xs font-bold text-teal-600 hover:underline">
        ← Komunitas saya
      </Link>

      {/* Header komunitas */}
      <CommunityHeader
        community={community}
        myMembership={myMembership}
        onJoin={handleJoin}
        onLeave={handleLeave}
        joining={joining}
      />

      {/* Pending join notice */}
      {myMembership?.status === "pending" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          ⏳ Permintaan bergabung kamu sedang menunggu persetujuan admin/owner komunitas.
        </div>
      )}

      {/* Diskusi komunitas (group chat) — di atas feed posting */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-500">Diskusi</h2>
        </div>
        <CommunityDiscussionPanel
          communityUuid={communityUuid}
          token={token}
          isMember={isMember}
        />
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {/* Header feed */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-500">Feed Komunitas</h2>
          {isMember && (
            <p className="text-xs text-gray-400">Kamu anggota aktif · {total} post</p>
          )}
        </div>

        {/* Form buat post */}
        {isMember && (
          <CreatePostForm
            communityUuid={communityUuid}
            token={token}
            onPost={handleNewPost}
            isAdminOrOwner={isAdminOrOwner}
          />
        )}

        {/* Bukan anggota / belum login */}
        {!myMembership && (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50/50 py-10 text-center">
            <p className="font-semibold text-gray-600">Bergabung dulu untuk melihat dan ikut berdiskusi di feed komunitas ini.</p>
            {!token && (
              <Link href="/login" className="mt-3 inline-block rounded-full bg-teal-500 px-5 py-2 text-sm font-bold text-white shadow hover:brightness-105">
                Masuk
              </Link>
            )}
          </div>
        )}

        {/* List posts */}
        {postsLoading && posts.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-40 animate-pulse rounded-3xl bg-gray-100" />)}
          </div>
        ) : posts.length === 0 && isMember ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
            <span className="text-4xl">✨</span>
            <p className="font-bold text-gray-700">Belum ada postingan</p>
            <p className="text-sm text-gray-400">Jadilah yang pertama memulai diskusi!</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.uuid}
                post={post}
                communityUuid={communityUuid}
                token={token}
                myRole={myMembership?.role ?? null}
                onDelete={handleDeletePost}
                onPin={handlePinPost}
              />
            ))}

            {hasMore && (
              <button type="button"
                disabled={postsLoading}
                onClick={() => { const next = page + 1; setPage(next); void loadPosts(next, false); }}
                className="w-full rounded-2xl border border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                {postsLoading ? "Memuat…" : "Muat lebih banyak"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
