"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationItem,
} from "@/lib/api";
import { getStoredToken } from "@/lib/auth-storage";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

const TYPE_ICON: Record<string, string> = {
  community_post: "📝",
  post_like: "❤️",
  post_comment: "💬",
  community_join_approved: "✅",
  community_join_rejected: "❌",
  event_approved: "🎉",
  event_rejected: "😔",
  event_reminder: "⏰",
  new_follower: "👤",
  follow_request: "🙋",
  follow_accepted: "✅",
  direct_message: "💬",
  mention: "🔔",
  system: "ℹ️",
};

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const loadCount = useCallback(async () => {
    const t = getStoredToken();
    if (!t) return;
    try { setUnread(await fetchUnreadCount(t)); } catch { /* ignore */ }
  }, []);

  const loadItems = useCallback(async () => {
    const t = getStoredToken();
    if (!t) return;
    setLoading(true);
    try {
      const r = await fetchNotifications(t, { limit: 15 });
      setItems(r.data);
      setUnread(r.meta.unread_count);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  /* Poll setiap 30 detik */
  useEffect(() => {
    loadCount();
    const id = setInterval(loadCount, 30000);
    return () => clearInterval(id);
  }, [loadCount]);

  /* Tutup dropdown saat klik di luar */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleOpen() {
    if (!open) { loadItems(); }
    setOpen((v) => !v);
  }

  async function handleMarkRead(item: NotificationItem) {
    const t = getStoredToken();
    if (!t) return;
    if (!item.is_read) {
      await markNotificationRead(t, item.uuid);
      setItems((prev) => prev.map((n) => n.uuid === item.uuid ? { ...n, is_read: true } : n));
      setUnread((c) => Math.max(0, c - 1));
    }
    if (item.action_url) {
      setOpen(false);
      router.push(item.action_url);
    }
  }

  async function handleMarkAll() {
    const t = getStoredToken();
    if (!t) return;
    await markAllNotificationsRead(t);
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
  }

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition"
        aria-label="Notifikasi"
      >
        <svg className="h-4.5 w-4.5 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 min-w-[18px] items-center justify-center rounded-full bg-red-500 text-[10px] font-extrabold text-white leading-none px-1">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-gray-100 bg-white shadow-xl ring-1 ring-gray-100/50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-extrabold text-gray-800">
              Notifikasi {unread > 0 && <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-500">{unread}</span>}
            </h3>
            {unread > 0 && (
              <button onClick={handleMarkAll} className="text-[11px] font-bold text-teal-500 hover:underline">
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {loading && (
              <div className="flex justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
              </div>
            )}
            {!loading && items.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <p className="text-2xl">🔔</p>
                <p className="text-xs text-gray-400 font-semibold">Belum ada notifikasi</p>
              </div>
            )}
            {!loading && items.map((item) => (
              <button
                key={item.uuid}
                onClick={() => handleMarkRead(item)}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-gray-50 ${!item.is_read ? "bg-teal-50/60" : ""}`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-base">
                  {item.actor?.profile_photo_url
                    ? <img src={item.actor.profile_photo_url} className="h-8 w-8 rounded-full object-cover" alt="" />
                    : TYPE_ICON[item.type] ?? "🔔"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs leading-snug ${!item.is_read ? "font-bold text-gray-900" : "font-semibold text-gray-600"}`}>
                    {item.title}
                  </p>
                  {item.body && <p className="mt-0.5 text-[11px] text-gray-400 line-clamp-2">{item.body}</p>}
                  <p className="mt-1 text-[10px] text-gray-300">{timeAgo(item.created_at)}</p>
                </div>
                {!item.is_read && <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal-400" />}
              </button>
            ))}
          </div>

          {items.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2.5 text-center">
              <button onClick={() => { setOpen(false); router.push("/dashboard/user/notifications"); }}
                className="text-xs font-bold text-teal-500 hover:underline">
                Lihat semua notifikasi →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
