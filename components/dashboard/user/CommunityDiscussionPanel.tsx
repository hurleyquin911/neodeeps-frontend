"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchCommunityDiscussion,
  postCommunityDiscussionMessage,
  uploadImage,
  type CommunityDiscussionMessageItem,
  type CommunityChatPermissions,
} from "@/lib/api";
import { getStoredUserRaw } from "@/lib/auth-storage";

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function UserAvatar({ name, photo }: { name: string; photo?: string | null }) {
  if (photo) {
    return <img src={photo} alt={name} className="h-8 w-8 shrink-0 rounded-full object-cover" />;
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-extrabold text-teal-700">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function CommunityDiscussionPanel({
  communityUuid,
  token,
  isMember,
}: {
  communityUuid: string;
  token: string;
  isMember: boolean;
}) {
  const [messages, setMessages] = useState<CommunityDiscussionMessageItem[]>([]);
  const [permissions, setPermissions] = useState<CommunityChatPermissions>({ mode: "all_members" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [myUuid, setMyUuid] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = getStoredUserRaw();
      if (raw) {
        const u = JSON.parse(raw) as { uuid?: string };
        setMyUuid(u.uuid ?? null);
      }
    } catch { /* ignore */ }
  }, []);

  const loadMessages = useCallback(async (silent = false) => {
    if (!token || !isMember) return;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const r = await fetchCommunityDiscussion(token, communityUuid, { limit: 60 });
      setMessages(r.data);
      setPermissions(r.meta.chat_permissions);
    } catch (e) {
      if (!silent) {
        setError(e instanceof Error ? e.message : "Gagal memuat diskusi.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token, communityUuid, isMember]);

  useEffect(() => {
    if (token && isMember) void loadMessages();
    else setLoading(false);
  }, [token, isMember, loadMessages]);

  useEffect(() => {
    if (!token || !isMember) return;
    const id = setInterval(() => void loadMessages(true), 8000);
    return () => clearInterval(id);
  }, [token, isMember, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending || !token) return;
    setSending(true);
    setSendError(null);
    try {
      const msg = await postCommunityDiscussionMessage(token, communityUuid, { body });
      setMessages((prev) => [...prev, msg]);
      setText("");
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Gagal mengirim pesan.");
    } finally {
      setSending(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token || sending) return;
    setUploading(true);
    setSendError(null);
    try {
      const url = await uploadImage(token, file);
      const msg = await postCommunityDiscussionMessage(token, communityUuid, {
        message_type: "image",
        attachments: [{ type: "image", url, name: file.name, mime: file.type, size: file.size }],
      });
      setMessages((prev) => [...prev, msg]);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Gagal mengunggah gambar.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const chatDisabled = permissions.mode === "disabled";
  const canSend = isMember && token && !chatDisabled && permissions.mode !== "disabled";

  if (!isMember) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 text-center">
        <p className="text-sm font-semibold text-gray-600">
          Bergabung sebagai anggota aktif untuk ikut diskusi komunitas.
        </p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
        Masuk ke akun Anda untuk melihat diskusi komunitas.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
        <h2 className="text-sm font-bold text-gray-900">Diskusi Komunitas</h2>
        <p className="text-xs text-gray-500">
          Ruang obrolan grup anggota — terpisah dari feed posting di bawah
        </p>
      </div>

      <div className="flex max-h-[360px] min-h-[200px] flex-col gap-3 overflow-y-auto px-4 py-4">
        {loading && messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">{error}</div>
        ) : chatDisabled ? (
          <div className="flex flex-1 items-center justify-center py-10 text-center text-sm text-gray-500">
            Diskusi komunitas dinonaktifkan oleh admin.
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
            <p className="text-2xl">💬</p>
            <p className="mt-2 text-sm font-semibold text-gray-700">Belum ada pesan diskusi</p>
            <p className="mt-1 text-xs text-gray-400">Mulai percakapan dengan anggota komunitas.</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMine = msg.sender?.uuid === myUuid;
            const isSystem = msg.message_type === "system";
            const prev = messages[i - 1];
            const showDate = !prev || fmtDate(prev.created_at) !== fmtDate(msg.created_at);

            if (isSystem) {
              return (
                <div key={msg.uuid}>
                  {showDate && (
                    <p className="my-2 text-center text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                      {fmtDate(msg.created_at)}
                    </p>
                  )}
                  <p className="text-center text-xs italic text-gray-400">{msg.body}</p>
                </div>
              );
            }

            return (
              <div key={msg.uuid}>
                {showDate && (
                  <p className="my-2 text-center text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    {fmtDate(msg.created_at)}
                  </p>
                )}
                <div className={`flex gap-2 ${isMine ? "flex-row-reverse" : ""}`}>
                  {!isMine && (
                    <UserAvatar name={msg.sender?.name ?? "?"} photo={msg.sender?.profile_photo_url} />
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                      isMine ? "rounded-br-md bg-teal-600 text-white" : "rounded-bl-md bg-gray-100 text-gray-800"
                    }`}
                  >
                    {!isMine && (
                      <p className="mb-0.5 text-[11px] font-bold text-teal-700">
                        {msg.sender?.name ?? "Pengguna"}
                      </p>
                    )}
                    {msg.body && (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.body}</p>
                    )}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {msg.attachments.map((att, idx) =>
                          att.url ? (
                            <img key={idx} src={att.url} alt="" className="max-h-40 rounded-lg object-cover" />
                          ) : null
                        )}
                      </div>
                    )}
                    <p className={`mt-1 text-[10px] ${isMine ? "text-teal-200" : "text-gray-400"}`}>
                      {fmtTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {canSend && (
        <form onSubmit={handleSend} className="border-t border-gray-100 bg-gray-50 p-4">
          {sendError && (
            <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{sendError}</p>
          )}
          <div className="flex gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <button
              type="button"
              disabled={uploading || sending}
              onClick={() => fileRef.current?.click()}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm transition hover:bg-gray-50 disabled:opacity-50"
              title="Kirim gambar"
            >
              {uploading ? "…" : "🖼️"}
            </button>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tulis pesan diskusi…"
              maxLength={2000}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
            <button
              type="submit"
              disabled={sending || !text.trim()}
              className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700 disabled:opacity-50"
            >
              {sending ? "…" : "Kirim"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
