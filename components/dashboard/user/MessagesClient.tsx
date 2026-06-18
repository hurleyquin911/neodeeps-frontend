"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchMyConversations, type DirectConversationItem } from "@/lib/api";
import { getStoredToken } from "@/lib/auth-storage";

function fmtTime(iso: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso ?? "";
  }
}

function UserAvatar({ name, photo }: { name: string; photo?: string | null }) {
  if (photo) {
    return <img src={photo} alt={name} className="h-12 w-12 shrink-0 rounded-full object-cover" />;
  }
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-100 text-lg font-extrabold text-teal-700">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function MessagesClient() {
  const [conversations, setConversations] = useState<DirectConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const token = getStoredToken();
      if (!token) {
        setError("Silakan masuk terlebih dahulu.");
        setLoading(false);
        return;
      }
      try {
        const r = await fetchMyConversations(token, { limit: 50 });
        setConversations(r.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal memuat daftar pesan.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Pesan</h1>
        <p className="mt-1 text-sm text-gray-500">
          Percakapan privat antar pengguna. Diskusi komunitas ada di halaman masing-masing komunitas.
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {!loading && !error && conversations.length === 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
          <p className="text-4xl">💬</p>
          <p className="mt-3 font-bold text-gray-800">Belum ada percakapan</p>
          <p className="mt-2 text-sm text-gray-500">
            Kunjungi profil pengguna lain dan mulai percakapan dari sana.
          </p>
        </div>
      )}

      {!loading && !error && conversations.length > 0 && (
        <ul className="space-y-3">
          {conversations.map((conv) => {
            const other = conv.other_user;
            const name = other?.name ?? "Pengguna";
            return (
              <li key={conv.uuid}>
                <Link
                  href={`/dashboard/user/messages/${conv.uuid}`}
                  className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md"
                >
                  <UserAvatar name={name} photo={other?.profile_photo_url} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-bold text-gray-900">{name}</p>
                      {conv.unread && (
                        <span className="rounded-full bg-teal-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          Baru
                        </span>
                      )}
                    </div>
                    {conv.last_message && (
                      <p className="mt-0.5 line-clamp-2 text-sm text-gray-500">
                        {conv.last_message.is_mine ? "Anda: " : ""}
                        {conv.last_message.body}
                      </p>
                    )}
                    <p className="mt-1.5 text-xs text-gray-400">
                      {fmtTime(conv.last_message_at ?? conv.updated_at)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm text-teal-500">→</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
