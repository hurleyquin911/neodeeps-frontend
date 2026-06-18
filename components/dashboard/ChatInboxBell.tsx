"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchDirectMessageUnreadCount,
  fetchMyConversations,
  type DirectConversationItem,
} from "@/lib/api";
import { getStoredToken } from "@/lib/auth-storage";

function fmtTime(iso: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

function UserAvatar({ name, photo }: { name: string; photo?: string | null }) {
  if (photo) {
    return <img src={photo} alt={name} className="h-9 w-9 shrink-0 rounded-full object-cover" />;
  }
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-extrabold text-teal-700">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function ChatInboxBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<DirectConversationItem[]>([]);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const loadUnreadCount = useCallback(async () => {
    const t = getStoredToken();
    if (!t) return;
    try {
      setUnreadTotal(await fetchDirectMessageUnreadCount(t));
    } catch {
      /* abaikan — badge tetap nilai terakhir */
    }
  }, []);

  const loadConversations = useCallback(async () => {
    const t = getStoredToken();
    if (!t) return;
    setLoading(true);
    try {
      const r = await fetchMyConversations(t, { limit: 15 });
      setConversations(r.data);
      setUnreadTotal(r.meta.unread_total);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUnreadCount();
    const id = setInterval(() => void loadUnreadCount(), 15000);
    return () => clearInterval(id);
  }, [loadUnreadCount]);

  useEffect(() => {
    function onFocus() {
      void loadUnreadCount();
    }
    function onRefresh() {
      void loadUnreadCount();
      if (open) void loadConversations();
    }
    window.addEventListener("focus", onFocus);
    window.addEventListener("dm-inbox-refresh", onRefresh);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("dm-inbox-refresh", onRefresh);
    };
  }, [loadUnreadCount, loadConversations, open]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleOpen() {
    if (!open) void loadConversations();
    setOpen((v) => !v);
  }

  function goToThread(uuid: string) {
    setOpen(false);
    router.push(`/dashboard/user/messages/${uuid}`);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={handleOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition hover:bg-gray-50"
        aria-label="Pesan"
      >
        <svg className="h-4.5 w-4.5 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
          />
        </svg>
        {unreadTotal > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
            {unreadTotal > 9 ? "9+" : unreadTotal}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-gray-100 bg-white shadow-xl ring-1 ring-gray-100/50">
          <div className="border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-extrabold text-gray-800">Pesan</h3>
            <p className="text-[11px] text-gray-400">Percakapan privat antar pengguna</p>
          </div>

          <div className="max-h-96 divide-y divide-gray-50 overflow-y-auto">
            {loading && (
              <div className="flex justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
              </div>
            )}
            {!loading && conversations.length === 0 && (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <p className="text-2xl">💬</p>
                <p className="text-xs font-semibold text-gray-500">Belum ada percakapan</p>
                <p className="text-[11px] text-gray-400">
                  Mulai chat dari profil pengguna lain.
                </p>
              </div>
            )}
            {!loading &&
              conversations.map((conv) => {
                const other = conv.other_user;
                const name = other?.name ?? "Pengguna";
                const unreadCount = conv.unread_count ?? (conv.unread ? 1 : 0);
                return (
                  <button
                    key={conv.uuid}
                    type="button"
                    onClick={() => goToThread(conv.uuid)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-gray-50"
                  >
                    <UserAvatar name={name} photo={other?.profile_photo_url} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`truncate text-xs ${unreadCount > 0 ? "font-extrabold text-gray-900" : "font-bold text-gray-900"}`}>
                          {name}
                        </p>
                        {unreadCount > 0 && (
                          <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-teal-500 px-1 text-[9px] font-bold text-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </div>
                      {conv.last_message && (
                        <p className={`mt-0.5 line-clamp-1 text-[11px] ${unreadCount > 0 ? "font-semibold text-gray-600" : "text-gray-400"}`}>
                          {conv.last_message.is_mine ? "Anda: " : ""}
                          {conv.last_message.body}
                        </p>
                      )}
                      <p className="mt-1 text-[10px] text-gray-300">
                        {fmtTime(conv.last_message_at ?? conv.updated_at)}
                      </p>
                    </div>
                  </button>
                );
              })}
          </div>

          <div className="border-t border-gray-100 px-4 py-2.5 text-center">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/dashboard/user/messages");
              }}
              className="text-xs font-bold text-teal-500 hover:underline"
            >
              Lihat semua pesan →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
