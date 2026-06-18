"use client";

import { useMemo, useState } from "react";
import { SuperadminPanel } from "@/components/dashboard/superadmin/SuperadminPanel";

type Priority = "tinggi" | "sedang" | "rendah";

type QueueItem = {
  id: string;
  title: string;
  subtitle: string;
  priority: Priority;
  since: string;
};

const SAMPLE: QueueItem[] = [
  {
    id: "m1",
    title: "Perkumpulan · Desain santai Jawa Timur",
    subtitle: "Judul baru · perlu cek kebijakan nama publik.",
    priority: "sedang",
    since: "2 jam yang lalu",
  },
  {
    id: "m2",
    title: "Workshop cybersecurity weekend",
    subtitle: "Poster belum konsisten sama deskripsi kegiatan.",
    priority: "tinggi",
    since: "1 hari yang lalu",
  },
  {
    id: "m3",
    title: "Chat komunitas musik kota",
    subtitle: "Ada cluster laporan pola pesan aneh.",
    priority: "tinggi",
    since: "3 hari yang lalu",
  },
];

function prioBadge(p: Priority) {
  const m: Record<Priority, string> = {
    tinggi: "border-rose-200 bg-rose-50 text-rose-900 ring-rose-100",
    sedang: "border-amber-200 bg-amber-50 text-amber-950 ring-amber-100",
    rendah: "border-teal-200 bg-teal-50 text-teal-950 ring-teal-100",
  };
  return m[p];
}

export function ModerationQueueView() {
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return SAMPLE;
    return SAMPLE.filter((r) => r.title.toLowerCase().includes(t) || r.subtitle.toLowerCase().includes(t));
  }, [q]);

  return (
    <div className="space-y-8">
      <header className="max-w-2xl space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700/95">Antrian konten hangat 🔥</p>
        <h1 className="text-[1.9rem] font-extrabold text-gray-900 sm:text-4xl leading-tight">Moderasi super admin</h1>
        <p className="text-sm leading-relaxed text-gray-600">
          Data contoh bantu Anda menata UI; sekali ada API moderasi, baris-baris ini auto-replace tinggal satu function call.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <input
          placeholder="Filter judul atau catatan rápido…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="min-w-[220px] flex-1 rounded-2xl border border-teal-100 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 outline-none ring-4 ring-transparent focus:border-orange-300 focus:ring-orange-100"
        />
        <button
          type="button"
          disabled
          className="rounded-full border border-teal-100 bg-teal-50 px-5 py-2 text-xs font-bold text-gray-500 opacity-70"
          title="Menyusul API"
        >
          Ekspor CSV
        </button>
      </div>

      <SuperadminPanel title="Antrian utama">
        <ul className="divide-y divide-orange-50">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-start justify-between gap-4 px-4 py-5 sm:px-5">
              <div className="min-w-0">
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ring-1 ${prioBadge(r.priority)}`}>
                  {r.priority}
                </span>
                <p className="mt-2 font-bold text-gray-900">{r.title}</p>
                <p className="mt-1 max-w-xl text-sm text-gray-600">{r.subtitle}</p>
              </div>
              <span className="shrink-0 text-xs font-bold text-gray-500">{r.since}</span>
              <div className="basis-full ml-[max(0px,calc(100%-12rem))] flex shrink-0 flex-wrap gap-2 sm:basis-auto sm:justify-end">
                <button type="button" disabled className="rounded-full bg-teal-100 px-3 py-1.5 text-[11px] font-bold text-teal-800 opacity-60">
                  Setujui
                </button>
                <button type="button" disabled className="rounded-full bg-teal-50 px-3 py-1.5 text-[11px] font-bold text-orange-950 opacity-60 ring-1 ring-orange-100">
                  Minta revisi ramah ✉️
                </button>
              </div>
            </li>
          ))}
        </ul>
      </SuperadminPanel>
    </div>
  );
}
