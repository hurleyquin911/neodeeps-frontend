"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchCommunityMembers,
  fetchMyRoleInCommunity,
  updateCommunityMemberRole,
  kickCommunityMember,
  banCommunityMember,
  unbanCommunityMember,
  reviewJoinRequest,
  updateAdminPermissions,
  transferCommunityOwnership,
  type CommunityMemberItem,
  type MyRoleInCommunity,
  type AdminPermissions,
} from "@/lib/api";
import { getStoredToken } from "@/lib/auth-storage";

/* ── Constants ── */
const ROLE_BADGE: Record<string, string> = {
  owner: "bg-amber-100 text-amber-900 ring-1 ring-amber-200",
  admin: "bg-teal-100 text-teal-800 ring-1 ring-teal-200",
  member: "bg-gray-100 text-gray-600",
};
const ROLE_LABEL: Record<string, string> = { owner: "Owner", admin: "Admin", member: "Anggota" };
const STATUS_BADGE: Record<string, string> = {
  active:   "bg-emerald-100 text-emerald-700",
  pending:  "bg-amber-100 text-amber-700",
  banned:   "bg-red-100 text-red-700",
  removed:  "bg-gray-100 text-gray-500",
  rejected: "bg-gray-100 text-gray-500",
  left:     "bg-gray-100 text-gray-400",
};
const STATUS_LABEL: Record<string, string> = {
  active: "Aktif", pending: "Menunggu", banned: "Diblokir",
  removed: "Dikeluarkan", rejected: "Ditolak", left: "Keluar",
};

/* ── Sub-components ── */
function MemberAvatar({ member }: { member: CommunityMemberItem }) {
  const u = member.member_user;
  if (!u) return <div className="h-10 w-10 rounded-2xl bg-gray-200 shrink-0" />;
  if (u.profile_photo_url) {
    return <img src={u.profile_photo_url} alt="" className="h-10 w-10 shrink-0 rounded-2xl object-cover" />;
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 text-sm font-extrabold text-white">
      {u.name.charAt(0).toUpperCase()}
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel, loading, danger = false }: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  danger?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{danger ? "⚠️" : "❓"}</span>
          <p className="text-sm font-semibold text-gray-800 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onCancel} disabled={loading}
            className="rounded-2xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition">
            Batal
          </button>
          <button type="button" onClick={onConfirm} disabled={loading}
            className={`rounded-2xl px-5 py-2.5 text-sm font-bold text-white shadow disabled:opacity-50 transition ${danger ? "bg-red-500 hover:bg-red-600" : "bg-teal-500 hover:bg-teal-600"}`}>
            {loading ? "Memproses…" : "Ya, lanjutkan"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Member Tab ── */
type MemberStatusTab = "active" | "pending" | "banned";

function MembersTab({ communityUuid, myRole, token }: {
  communityUuid: string;
  myRole: MyRoleInCommunity;
  token: string;
}) {
  const [statusTab, setStatusTab] = useState<MemberStatusTab>("active");
  const [members, setMembers] = useState<CommunityMemberItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [acting, setActing] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ type: string; uuid: string; name: string } | null>(null);
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);

  const perms = myRole.permissions;
  const isOwner = myRole.role === "owner";

  const load = useCallback(async (p: number) => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await fetchCommunityMembers(token, communityUuid, {
        status: statusTab, role: roleFilter, q, page: p, limit: 30,
      });
      setMembers(r.data);
      setTotal(r.meta.total);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [token, communityUuid, statusTab, roleFilter, q]);

  useEffect(() => { setPage(1); void load(1); }, [load]);
  useEffect(() => { void load(page); }, [page, load]);

  async function doAction(type: string, memberUuid: string) {
    setActing(memberUuid); setFeedback(null);
    try {
      if (type === "promote")  await updateCommunityMemberRole(token, communityUuid, memberUuid, "admin");
      if (type === "demote")   await updateCommunityMemberRole(token, communityUuid, memberUuid, "member");
      if (type === "kick")     await kickCommunityMember(token, communityUuid, memberUuid);
      if (type === "ban")      await banCommunityMember(token, communityUuid, memberUuid);
      if (type === "unban")    await unbanCommunityMember(token, communityUuid, memberUuid);
      if (type === "approve")  await reviewJoinRequest(token, communityUuid, memberUuid, "approve");
      if (type === "reject")   await reviewJoinRequest(token, communityUuid, memberUuid, "reject");
      if (type === "transfer") await transferCommunityOwnership(token, communityUuid, memberUuid);
      setFeedback({ msg: "Berhasil!", ok: true });
      void load(page);
    } catch (e) {
      setFeedback({ msg: e instanceof Error ? e.message : "Gagal", ok: false });
    } finally { setActing(null); setConfirm(null); }
  }

  const totalPages = Math.ceil(total / 30);
  const STATUS_TABS: { key: MemberStatusTab; label: string; emoji: string }[] = [
    { key: "active",  label: "Anggota Aktif", emoji: "✅" },
    { key: "pending", label: "Menunggu",      emoji: "⏳" },
    { key: "banned",  label: "Diblokir",      emoji: "🚫" },
  ];

  return (
    <div className="space-y-5">
      {confirm && (
        <ConfirmDialog
          message={
            confirm.type === "ban"      ? `Blokir "${confirm.name}" dari komunitas ini? Mereka tidak bisa bergabung lagi.` :
            confirm.type === "kick"     ? `Keluarkan "${confirm.name}" dari komunitas ini?` :
            confirm.type === "transfer" ? `Transfer kepemilikan komunitas ke "${confirm.name}"? Kamu akan menjadi Admin setelahnya.` :
            `Lakukan tindakan pada "${confirm.name}"?`
          }
          loading={acting === confirm.uuid}
          danger={["ban", "kick", "transfer"].includes(confirm.type)}
          onConfirm={() => doAction(confirm.type, confirm.uuid)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {feedback && (
        <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold ${feedback.ok ? "border-teal-200 bg-teal-50 text-teal-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          <span>{feedback.ok ? "✅" : "❌"}</span>
          {feedback.msg}
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-1 rounded-2xl bg-gray-100 p-1">
        {STATUS_TABS.map((t) => (
          <button key={t.key} type="button"
            onClick={() => { setStatusTab(t.key); setPage(1); }}
            className={`flex-1 rounded-xl px-3 py-2.5 text-xs font-bold transition ${statusTab === t.key ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-700"}`}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="search" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama anggota…"
            className="w-full rounded-2xl border border-gray-200 bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition"
          />
        </div>
        {statusTab === "active" && (
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-400 transition">
            <option value="">Semua role</option>
            <option value="owner">👑 Owner</option>
            <option value="admin">🛡️ Admin</option>
            <option value="member">👤 Anggota</option>
          </select>
        )}
      </div>

      {/* Counter */}
      <p className="text-xs text-gray-400 font-semibold">{total} {statusTab === "active" ? "anggota aktif" : statusTab === "pending" ? "permintaan bergabung" : "anggota diblokir"}</p>

      {/* Member list */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
          <span className="text-4xl">{statusTab === "pending" ? "⏳" : statusTab === "banned" ? "🚫" : "👥"}</span>
          <p className="font-bold text-gray-500">
            {statusTab === "pending" ? "Tidak ada permintaan bergabung" :
             statusTab === "banned"  ? "Tidak ada anggota yang diblokir" :
             "Belum ada anggota"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((m) => {
            const u = m.member_user;
            return (
              <div key={m.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow transition">
                <div className="flex items-center gap-3">
                  <MemberAvatar member={m} />

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-extrabold text-gray-900">{u?.name ?? "—"}</p>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${ROLE_BADGE[m.role] ?? ""}`}>
                        {ROLE_LABEL[m.role] ?? m.role}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STATUS_BADGE[m.status] ?? ""}`}>
                        {STATUS_LABEL[m.status] ?? m.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400 truncate">
                      {u?.email}
                      {u?.city ? ` · ${u.city}` : ""}
                    </p>
                    {m.ban_reason && (
                      <p className="mt-1 text-xs text-red-500 font-semibold">Alasan: {m.ban_reason}</p>
                    )}
                    {m.joined_at && (
                      <p className="mt-0.5 text-xs text-gray-400">
                        Bergabung {new Date(m.joined_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-1.5 shrink-0">
                    {/* Pending → approve / reject */}
                    {statusTab === "pending" && perms?.can_approve_members && (
                      <>
                        <button type="button" disabled={acting === u?.uuid}
                          onClick={() => u && doAction("approve", u.uuid)}
                          className="rounded-xl bg-teal-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-600 disabled:opacity-50 transition">
                          ✓ Terima
                        </button>
                        <button type="button" disabled={acting === u?.uuid}
                          onClick={() => u && doAction("reject", u.uuid)}
                          className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition">
                          ✗ Tolak
                        </button>
                      </>
                    )}

                    {/* Banned → unban */}
                    {statusTab === "banned" && (isOwner || perms?.can_ban_members) && (
                      <button type="button" disabled={acting === u?.uuid}
                        onClick={() => u && doAction("unban", u.uuid)}
                        className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-100 disabled:opacity-50 transition">
                        Buka Blokir
                      </button>
                    )}

                    {/* Active member actions */}
                    {statusTab === "active" && m.role !== "owner" && (
                      <>
                        {(isOwner || perms?.can_promote_members) && m.role === "member" && (
                          <button type="button" disabled={acting === u?.uuid}
                            onClick={() => u && doAction("promote", u.uuid)}
                            className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-100 disabled:opacity-50 transition">
                            ↑ Jadikan Admin
                          </button>
                        )}
                        {isOwner && m.role === "admin" && (
                          <button type="button" disabled={acting === u?.uuid}
                            onClick={() => u && doAction("demote", u.uuid)}
                            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition">
                            ↓ Turunkan
                          </button>
                        )}
                        {isOwner && (
                          <button type="button" disabled={acting === u?.uuid}
                            onClick={() => u && setConfirm({ type: "transfer", uuid: u.uuid, name: u.name })}
                            className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100 disabled:opacity-50 transition">
                            👑 Transfer
                          </button>
                        )}
                        {perms?.can_remove_members && (m.role !== "admin" || isOwner) && (
                          <button type="button" disabled={acting === u?.uuid}
                            onClick={() => u && setConfirm({ type: "kick", uuid: u.uuid, name: u.name })}
                            className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 hover:bg-orange-100 disabled:opacity-50 transition">
                            Keluarkan
                          </button>
                        )}
                        {perms?.can_ban_members && (m.role !== "admin" || isOwner) && (
                          <button type="button" disabled={acting === u?.uuid}
                            onClick={() => u && setConfirm({ type: "ban", uuid: u.uuid, name: u.name })}
                            className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-50 transition">
                            Blokir
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">{total} anggota · Hal {page}/{totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold disabled:opacity-40 hover:bg-gray-50 transition">
              ← Prev
            </button>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold disabled:opacity-40 hover:bg-gray-50 transition">
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Settings Tab ── */
function SettingsTab({ communityUuid, token, myRole }: {
  communityUuid: string;
  token: string;
  myRole: MyRoleInCommunity;
}) {
  const isOwner = myRole.role === "owner";
  const [perms, setPerms] = useState<AdminPermissions>({
    can_approve_members:  true,
    can_remove_members:   true,
    can_ban_members:      false,
    can_edit_community:   false,
    can_manage_events:    true,
    can_promote_members:  false,
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (myRole.permissions) setPerms(myRole.permissions);
  }, [myRole.permissions]);

  async function save() {
    setSaving(true); setFeedback(null);
    try {
      const updated = await updateAdminPermissions(token, communityUuid, perms);
      setPerms(updated);
      setFeedback({ msg: "Pengaturan izin berhasil disimpan!", ok: true });
    } catch (e) {
      setFeedback({ msg: e instanceof Error ? e.message : "Gagal menyimpan", ok: false });
    } finally { setSaving(false); }
  }

  const PERM_LABELS: { key: keyof AdminPermissions; label: string; desc: string; icon: string }[] = [
    { key: "can_approve_members", label: "Terima anggota baru",    icon: "✅", desc: "Admin bisa setujui atau tolak permintaan bergabung" },
    { key: "can_remove_members",  label: "Keluarkan anggota",      icon: "🚪", desc: "Admin bisa mengeluarkan member dari komunitas" },
    { key: "can_ban_members",     label: "Blokir anggota",         icon: "🚫", desc: "Admin bisa memblokir member secara permanen" },
    { key: "can_edit_community",  label: "Edit info komunitas",    icon: "✏️", desc: "Admin bisa ubah nama, deskripsi, dan foto komunitas" },
    { key: "can_manage_events",   label: "Kelola acara komunitas", icon: "📅", desc: "Admin bisa membuat dan mengelola acara atas nama komunitas" },
    { key: "can_promote_members", label: "Promosikan anggota",     icon: "⬆️", desc: "Admin bisa menjadikan member lain sebagai admin" },
  ];

  return (
    <div className="space-y-8">

      {/* Panduan Peran */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-gray-900">Panduan Peran Komunitas</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Setiap anggota komunitas memiliki peran dengan tanggung jawab yang berbeda.
          </p>
        </div>

        <div className="space-y-3">
          {/* Owner */}
          <div className="flex gap-4 rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-xl">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-extrabold text-amber-900">Owner</p>
                <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">Otoritas penuh</span>
              </div>
              <p className="mt-0.5 text-xs text-amber-700 leading-relaxed">
                Pemilik komunitas dengan akses penuh. Bisa mengatur izin admin, transfer kepemilikan, serta melakukan semua tindakan pengelolaan komunitas.
              </p>
            </div>
          </div>

          {/* Admin */}
          <div className="flex gap-4 rounded-2xl border border-teal-100 bg-teal-50/60 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-xl">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-extrabold text-teal-900">Admin</p>
                <span className="rounded-full bg-teal-200 px-2 py-0.5 text-[10px] font-bold text-teal-800">Sesuai izin Owner</span>
              </div>
              <p className="mt-0.5 text-xs text-teal-700 leading-relaxed">
                Membantu owner mengelola komunitas. Tindakan yang bisa dilakukan admin ditentukan oleh owner melalui pengaturan izin di bawah ini.
              </p>
            </div>
          </div>

          {/* Anggota */}
          <div className="flex gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-xl">
              👤
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-extrabold text-gray-900">Anggota</p>
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-600">Akses terbatas</span>
              </div>
              <p className="mt-0.5 text-xs text-gray-600 leading-relaxed">
                Dapat melihat konten komunitas, membuat postingan, serta berinteraksi sesuai aturan yang ditetapkan komunitas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <hr className="border-gray-100" />

      {/* Izin Admin */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-gray-900">Izin Admin</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {isOwner
              ? "Atur apa saja yang boleh dilakukan admin di komunitasmu."
              : "Izin yang saat ini berlaku untuk admin komunitas ini (hanya owner yang bisa mengubah)."}
          </p>
        </div>

        <div className="space-y-2.5">
          {PERM_LABELS.map(({ key, label, desc, icon }) => (
            <div key={key}
              className={`flex items-center gap-4 rounded-2xl border p-4 transition ${perms[key] ? "border-teal-100 bg-teal-50/40" : "border-gray-100 bg-white"}`}>
              <span className="text-xl w-8 text-center shrink-0">{icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
              <button
                type="button"
                disabled={!isOwner}
                onClick={() => isOwner && setPerms({ ...perms, [key]: !perms[key] })}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${perms[key] ? "bg-teal-500" : "bg-gray-200"} ${!isOwner ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                aria-label={label}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${perms[key] ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>

        {!isOwner && (
          <p className="text-xs text-gray-400 text-center">
            Hanya owner yang dapat mengubah pengaturan izin admin.
          </p>
        )}

        {isOwner && (
          <div className="space-y-3">
            {feedback && (
              <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold ${feedback.ok ? "border-teal-200 bg-teal-50 text-teal-700" : "border-red-200 bg-red-50 text-red-700"}`}>
                <span>{feedback.ok ? "✅" : "❌"}</span>
                {feedback.msg}
              </div>
            )}
            <button type="button" onClick={save} disabled={saving}
              className="w-full rounded-2xl bg-teal-500 py-3 text-sm font-extrabold text-white shadow hover:bg-teal-600 disabled:opacity-40 transition">
              {saving ? "Menyimpan…" : "Simpan Pengaturan Izin"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

/* ── Main Component ── */
type ManageTab = "members" | "settings";

export function CommunityManageClient({ communityUuid }: { communityUuid: string }) {
  const [myRole, setMyRole] = useState<MyRoleInCommunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ManageTab>("members");
  const [token, setToken] = useState("");

  useEffect(() => {
    const t = getStoredToken() ?? "";
    setToken(t);
    if (!t) { setLoading(false); return; }
    fetchMyRoleInCommunity(t, communityUuid)
      .then(setMyRole)
      .catch(() => setMyRole({ role: null, permissions: null }))
      .finally(() => setLoading(false));
  }, [communityUuid]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded-2xl bg-gray-100" />
        <div className="h-12 rounded-2xl bg-gray-100" />
        <div className="h-64 rounded-3xl bg-gray-100" />
      </div>
    );
  }

  if (!myRole?.role || !["owner", "admin"].includes(myRole.role)) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-3xl border border-dashed border-gray-200 bg-gray-50 py-24 text-center">
        <span className="text-5xl">🔒</span>
        <div>
          <p className="font-extrabold text-gray-800 text-lg">Akses Ditolak</p>
          <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
            Halaman ini hanya bisa diakses oleh owner dan admin komunitas.
          </p>
        </div>
        <Link href="/dashboard/user/communities"
          className="rounded-2xl bg-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-teal-600 transition">
          ← Komunitas saya
        </Link>
      </div>
    );
  }

  const isOwner = myRole.role === "owner";

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <Link href="/dashboard/user/communities"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:underline mb-3">
          ← Kembali ke Komunitas Saya
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              Kelola Komunitas
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Kamu login sebagai{" "}
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${isOwner ? "bg-amber-100 text-amber-900" : "bg-teal-100 text-teal-800"}`}>
                {isOwner ? "👑 Owner" : "🛡️ Admin"}
              </span>
            </p>
          </div>
        </div>
      </header>

      {/* Tab navigation */}
      <div className="flex gap-1 rounded-2xl bg-gray-100 p-1">
        <button type="button" onClick={() => setTab("members")}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition flex items-center justify-center gap-2 ${tab === "members" ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-700"}`}>
          👥 Anggota
        </button>
        <button type="button" onClick={() => setTab("settings")}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition flex items-center justify-center gap-2 ${tab === "settings" ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-700"}`}>
          ⚙️ Pengaturan &amp; Peran
        </button>
      </div>

      {/* Tab content */}
      {tab === "members" && (
        <MembersTab communityUuid={communityUuid} myRole={myRole} token={token} />
      )}
      {tab === "settings" && (
        <SettingsTab communityUuid={communityUuid} token={token} myRole={myRole} />
      )}
    </div>
  );
}
