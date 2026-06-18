"use client";

import { useMemo, useState } from "react";
import { SuperadminPanel } from "@/components/dashboard/superadmin/SuperadminPanel";

type Role = "user" | "admin" | "superadmin";

type Row = {
  uuid: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  status: string;
};

const SAMPLE: Row[] = [
  { uuid: "u1", name: "Neo Admin", username: "neo_sa", email: "super@neo.lab", role: "superadmin", status: "Aktif" },
  { uuid: "u2", name: "Maya Prames", username: "maya_", email: "maya@neo.lab", role: "admin", status: "Aktif" },
  { uuid: "u3", name: "Budi Santoyo", username: "budi", email: "budi@neo.lab", role: "user", status: "Aktif · hangat 🔥" },
  { uuid: "u4", name: "Citra Lestarini", username: "cit", email: "citra@neo.lab", role: "user", status: "Butuh satu langkah lagi" },
];

function roleBadge(role: Role) {
  const map: Record<Role, string> = {
    superadmin: "border-violet-200 bg-violet-50 text-violet-950 ring-violet-100",
    admin: "border-amber-200 bg-amber-50 text-amber-950 ring-amber-100",
    user: "border-teal-200 bg-teal-50 text-teal-950 ring-teal-100",
  };
  return map[role];
}

export function UsersView() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return SAMPLE;
    return SAMPLE.filter((r) => [r.name, r.username, r.email].some((x) => x.toLowerCase().includes(t)));
  }, [q]);

  return (
    <div className="space-y-8">
      <header className="max-w-2xl space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-900/95">Pengguna & peran ✨</p>
        <h1 className="text-[1.9rem] font-extrabold text-gray-900 sm:text-4xl">Ringkasan akun cepat-cepat</h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          UI manis buat masa depan Anda sync ke REST · untuk sekarang cukup santai eksplor tabel sampelnya.
        </p>
      </header>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari nama atau email…"
        className="w-full rounded-3xl border border-teal-100 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none ring-4 ring-transparent focus:border-orange-300 focus:ring-orange-50"
      />

      <SuperadminPanel title="Akun contoh • super admin">
        <ul className="divide-y divide-orange-50 px-5 py-4">
          {rows.map((r) => (
            <li key={r.uuid} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-extrabold text-gray-900">{r.name}</p>
                <p className="text-[13px] font-medium text-teal-800">@{r.username}</p>
                <p className="mt-1 text-[13px] text-gray-600">{r.email}</p>
                <span className="mt-2 inline-flex text-[13px] font-semibold text-gray-700">{r.status}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ring-1 ${roleBadge(r.role)}`}>
                  {r.role}
                </span>
                <button type="button" disabled className="rounded-full bg-teal-50 px-4 py-1.5 text-[11px] font-bold text-gray-500 ring-1 ring-orange-100 opacity-70">
                  Edit peran menyusul
                </button>
              </div>
            </li>
          ))}
          {rows.length === 0 && <li className="py-8 text-center text-sm font-semibold text-gray-500">Tidak ketemu apa-apa 👀</li>}
        </ul>
      </SuperadminPanel>
    </div>
  );
}
