"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminUsers,
  fetchAdminUserDetail,
  adminUpdateUserRole,
  type AdminUserItem,
  type AdminUserDetail,
} from "@/lib/api";
import { getStoredToken } from "@/lib/auth-storage";

const ROLE_BADGE: Record<string, string> = {
  user:       "bg-gray-100 text-gray-600",
  admin:      "bg-amber-100 text-amber-800",
  superadmin: "bg-violet-100 text-violet-800",
};

const ROLE_LABELS: Record<string, string> = {
  user: "User",
  admin: "Admin",
  superadmin: "Superadmin",
};

function Avatar({ user, size = "md" }: { user: AdminUserItem; size?: "sm" | "md" | "lg" }) {
  const px =
    size === "lg" ? "h-14 w-14 text-xl" :
    size === "md" ? "h-10 w-10 text-base" :
    "h-8 w-8 text-sm";
  if (user.profile_photo_url) {
    return <img src={user.profile_photo_url} alt="" className={`${px} shrink-0 rounded-xl object-cover`} />;
  }
  return (
    <div className={`${px} shrink-0 rounded-xl bg-amber-100 flex items-center justify-center font-extrabold text-amber-700`}>
      {user.name.charAt(0).toUpperCase()}
    </div>
  );
}

function UserDetailDrawer({
  uuid, token, onClose,
}: { uuid: string; token: string; onClose: () => void }) {
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newRole, setNewRole] = useState<"user" | "admin">("user");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchAdminUserDetail(token, uuid)
      .then((d) => {
        setUser(d);
        setNewRole(d.role === "superadmin" ? "admin" : (d.role as "user" | "admin"));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [uuid, token]);

  async function handleSaveRole() {
    if (!user) return;
    setSaving(true); setFeedback(null);
    try {
      await adminUpdateUserRole(token, user.uuid, newRole);
      setUser({ ...user, role: newRole });
      setFeedback({ msg: `Role diubah ke '${newRole}'.`, ok: true });
    } catch (e) {
      setFeedback({ msg: e instanceof Error ? e.message : "Gagal", ok: false });
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="flex w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-extrabold text-gray-900">Detail Pengguna</h2>
          <button type="button" onClick={onClose}
            className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-bold text-gray-600 hover:bg-gray-200">
            ✕ Tutup
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col gap-4 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : !user ? (
          <div className="p-6 text-sm text-gray-500">Gagal memuat data pengguna.</div>
        ) : (
          <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center gap-4">
              <Avatar user={user} size="lg" />
              <div>
                <p className="text-lg font-extrabold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">@{user.username}</p>
                <span className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${ROLE_BADGE[user.role] ?? ""}`}>
                  {ROLE_LABELS[user.role] ?? user.role}
                </span>
              </div>
            </div>

            <div className="grid gap-0.5">
              {[
                { label: "Email", value: user.email },
                { label: "Kota", value: user.city ?? "—" },
                { label: "Bergabung", value: new Date(user.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) },
                { label: "Email terverifikasi", value: user.email_verified_at ? "Ya" : "Belum" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between border-b border-gray-50 py-2.5 text-sm">
                  <span className="font-semibold text-gray-500">{label}</span>
                  <span className="font-bold text-gray-900 text-right max-w-[60%]">{value}</span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-gray-50 p-4 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-extrabold text-gray-900">{user.stats.created_events}</p>
                <p className="text-[11px] text-gray-500">Acara dibuat</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900">{user.stats.created_communities}</p>
                <p className="text-[11px] text-gray-500">Komunitas</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900">{user.stats.event_memberships}</p>
                <p className="text-[11px] text-gray-500">Ikut acara</p>
              </div>
            </div>

            {user.bio && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Bio</p>
                <p className="mt-1 text-sm text-gray-700">{user.bio}</p>
              </div>
            )}

            {user.role !== "superadmin" && (
              <div className="rounded-2xl border border-gray-100 p-4 space-y-3">
                <p className="text-sm font-extrabold text-gray-800">Ubah Role</p>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as "user" | "admin")}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-amber-400"
                >
                  <option value="user">User (biasa)</option>
                  <option value="admin">Admin (moderator)</option>
                </select>
                {feedback && (
                  <p className={`text-xs font-semibold ${feedback.ok ? "text-teal-600" : "text-red-600"}`}>
                    {feedback.msg}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleSaveRole}
                  disabled={saving || newRole === user.role}
                  className="w-full rounded-full bg-amber-500 py-2 text-sm font-bold text-white shadow hover:brightness-105 disabled:opacity-40"
                >
                  {saving ? "Menyimpan…" : "Simpan Role"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminUsersClient() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const LIMIT = 20;

  useEffect(() => {
    setToken(getStoredToken() ?? "");
  }, []);

  const load = useCallback(
    async (p: number) => {
      if (!token) return;
      setLoading(true);
      try {
        const r = await fetchAdminUsers(token, { q, role: roleFilter, page: p, limit: LIMIT });
        setUsers(r.data);
        setTotal(r.meta.total);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    },
    [token, q, roleFilter]
  );

  useEffect(() => { setPage(1); void load(1); }, [load]);
  useEffect(() => { void load(page); }, [page, load]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-8">
      {selectedUuid && (
        <UserDetailDrawer
          uuid={selectedUuid}
          token={token}
          onClose={() => setSelectedUuid(null)}
        />
      )}

      <header className="max-w-2xl space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Admin</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Manajemen Pengguna 👤
        </h1>
        <p className="text-base text-gray-600">
          Cari, lihat detail, dan kelola role pengguna.{" "}
          <span className="font-bold text-gray-900">{total.toLocaleString("id-ID")}</span> pengguna terdaftar.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama, username, email…"
          className="min-w-0 flex-1 rounded-2xl border border-gray-200 bg-gray-50/60 px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-2xl border border-gray-200 bg-gray-50/60 px-4 py-2.5 text-sm outline-none focus:border-amber-400"
        >
          <option value="">Semua role</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Superadmin</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-gray-200 bg-gray-50/60 py-20 text-center">
          <span className="text-5xl">🔍</span>
          <p className="font-bold text-gray-700">Pengguna tidak ditemukan</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="hidden sm:grid sm:grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 border-b border-gray-100 bg-gray-50/60 px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-400">
            <span>Pengguna</span>
            <span>Email</span>
            <span>Role</span>
            <span>Bergabung</span>
            <span />
          </div>

          {users.map((u, idx) => (
            <div
              key={u.uuid}
              className={`flex sm:grid sm:grid-cols-[2fr_2fr_1fr_1fr_auto] items-center gap-4 px-5 py-4 transition hover:bg-amber-50/30 ${idx > 0 ? "border-t border-gray-50" : ""}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar user={u} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-gray-900">{u.name}</p>
                  <p className="truncate text-xs text-gray-400">@{u.username}</p>
                </div>
              </div>
              <p className="hidden sm:block truncate text-sm text-gray-600">{u.email}</p>
              <span className={`hidden sm:inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${ROLE_BADGE[u.role] ?? ""}`}>
                {ROLE_LABELS[u.role] ?? u.role}
              </span>
              <p className="hidden sm:block text-xs text-gray-400">
                {new Date(u.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
              <button
                type="button"
                onClick={() => setSelectedUuid(u.uuid)}
                className="ml-auto shrink-0 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100"
              >
                Detail
              </button>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Halaman {page} dari {totalPages} · {total} pengguna
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold disabled:opacity-40 hover:bg-gray-50"
            >
              ← Prev
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold disabled:opacity-40 hover:bg-gray-50"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
