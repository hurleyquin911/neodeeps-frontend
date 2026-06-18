"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  fetchDirectMessages,
  sendDirectMessage,
  type DirectMessageItem,
  type DirectMessageUser,
} from "@/lib/api";
import { getStoredToken, getStoredUserRaw } from "@/lib/auth-storage";

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function DirectMessageThreadClient({ conversationUuid }: { conversationUuid: string }) {
  const [messages, setMessages] = useState<DirectMessageItem[]>([]);
  const [otherUser, setOtherUser] = useState<DirectMessageUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [myUuid, setMyUuid] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setToken(getStoredToken() ?? "");
    try {
      const raw = getStoredUserRaw();
      if (raw) {
        const u = JSON.parse(raw) as { uuid?: string };
        setMyUuid(u.uuid ?? null);
      }
    } catch { /* ignore */ }
  }, []);

  const loadMessages = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const r = await fetchDirectMessages(token, conversationUuid, { limit: 60 });
      setMessages(r.data);
      setOtherUser(r.meta.other_user);
      window.dispatchEvent(new CustomEvent("dm-inbox-refresh"));
    } catch (e) {
      if (!silent) {
        setError(e instanceof Error ? e.message : "Gagal memuat pesan.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token, conversationUuid]);

  useEffect(() => {
    if (token) void loadMessages();
  }, [token, loadMessages]);

  useEffect(() => {
    const id = setInterval(() => void loadMessages(true), 5000);
    return () => clearInterval(id);
  }, [loadMessages]);

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
      const msg = await sendDirectMessage(token, conversationUuid, { body });
      setMessages((prev) => [...prev, msg]);
      setText("");
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Gagal mengirim pesan.");
    } finally {
      setSending(false);
    }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center">
        <p className="text-sm text-gray-500">Silakan masuk untuk melihat percakapan ini.</p>
        <Link href="/login" className="mt-4 inline-block text-sm font-bold text-teal-600 hover:underline">
          Masuk
        </Link>
      </div>
    );
  }

  const displayName = otherUser?.name ?? "Pengguna";

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-4 py-4" style={{ height: "calc(100dvh - 5rem)" }}>
      <div className="mb-4 flex items-center gap-3">
        <Link href="/dashboard/user/messages" className="text-sm font-bold text-teal-600 hover:underline">
          ← Pesan
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {otherUser?.profile_photo_url ? (
            <img src={otherUser.profile_photo_url} alt={displayName} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 font-extrabold text-teal-700">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-bold text-gray-900">{displayName}</p>
            {otherUser?.username && (
              <p className="truncate text-xs text-gray-400">@{otherUser.username}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
          {loading && messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">{error}</div>
          ) : messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
              <p className="text-2xl">💬</p>
              <p className="mt-2 text-sm font-semibold text-gray-700">Belum ada pesan</p>
              <p className="mt-1 text-xs text-gray-400">Kirim pesan pertama untuk memulai percakapan.</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMine = msg.sender?.uuid === myUuid;
              const prev = messages[i - 1];
              const showDate = !prev || fmtDate(prev.created_at) !== fmtDate(msg.created_at);

              return (
                <div key={msg.uuid}>
                  {showDate && (
                    <p className="my-2 text-center text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                      {fmtDate(msg.created_at)}
                    </p>
                  )}
                  <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                        isMine
                          ? "rounded-br-md bg-teal-600 text-white"
                          : "rounded-bl-md bg-gray-100 text-gray-800"
                      }`}
                    >
                      {!isMine && (
                        <p className="mb-0.5 text-[11px] font-bold text-teal-700">
                          {msg.sender?.name ?? "Pengguna"}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.body}</p>
                      {msg.attachments && Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.attachments.map((att, idx) =>
                            att.url ? (
                              <img
                                key={idx}
                                src={att.url}
                                alt=""
                                className="max-h-48 rounded-lg object-cover"
                              />
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

        <form onSubmit={handleSend} className="border-t border-gray-100 bg-gray-50 p-4">
          {sendError && (
            <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{sendError}</p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tulis pesan…"
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
      </div>
    </div>
  );
}
