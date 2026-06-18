"use client";

import { useMemo, useState } from "react";
import { SuperadminPanel } from "@/components/dashboard/superadmin/SuperadminPanel";

type Severity = "kritis" | "peringatan" | "info";

type Row = {
  id: string;
  label: string;
  target: string;
  reporter: string;
  severity: Severity;
  tanggal: string;
};

const SAMPLE: Row[] = [
  { id: "r1", label: "Konten menyesatkan", target: "Event #1042", reporter: "@rina", severity: "kritis", tanggal: "21 Mei 2026" },
  { id: "r2", label: "Spam undangan gabung", target: "Komunitas #88", reporter: "@budi", severity: "peringatan", tanggal: "20 Mei 2026" },
  { id: "r3", label: "Obrolan panas sampai bikin gaduh", target: "Ruangan #12", reporter: "@anon_cool", severity: "kritis", tanggal: "19 Mei 2026" },
  { id: "r4", label: "Poster kurang sopan santun", target: "Posting #993", reporter: "@citra", severity: "info", tanggal: "18 Mei 2026" },
];

function sevBadge(s: Severity) {
  const m: Record<Severity, string> = {
    kritis: "border-rose-300 bg-rose-50 text-rose-950 ring-rose-100",
    peringatan: "border-amber-300 bg-amber-50 text-amber-950 ring-amber-100",
    info: "border-sky-200 bg-sky-50 text-sky-950 ring-sky-100",
  };
  return m[s];
}

export function ReportsView() {
  const [severity, setSeverity] = useState<Severity | "semua">("semua");

  const rows = useMemo(
    () => (severity === "semua" ? SAMPLE : SAMPLE.filter((x) => x.severity === severity)),
    [severity]
  );

  return (
    <div className="space-y-8">
      <header className="max-w-2xl space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-800/95">Radar komunitas</p>
        <h1 className="text-[1.9rem] font-extrabold text-gray-900 sm:text-4xl">Laporan pengguna • super admin</h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          Bereskan cepat apa yang bikin orang risih — tetapi dengan bahasa sopan seperti reminder teman kuliah.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["semua", "kritis", "peringatan", "info"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setSeverity(k)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              severity === k
                ? "bg-violet-600 text-white shadow-md shadow-violet-400/35"
                : "border border-teal-100 bg-white text-gray-600 hover:border-teal-200"
            }`}
          >
            {k === "semua" ? "Semua" : k.charAt(0).toUpperCase() + k.slice(1)}
          </button>
        ))}
      </div>

      <SuperadminPanel title="Ringkasan laporan contoh">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-teal-50/60 text-[11px] font-bold uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-5 py-3">Tipe</th>
                <th className="px-5 py-3">Target</th>
                <th className="px-5 py-3 hidden sm:table-cell">Pelapor</th>
                <th className="px-5 py-3 hidden md:table-cell">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-50">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ring-1 ${sevBadge(r.severity)}`}>
                      {r.severity}
                    </span>
                    <span className="mt-2 block font-bold text-gray-900">{r.label}</span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-700">{r.target}</td>
                  <td className="px-5 py-4 hidden font-medium text-violet-800 sm:table-cell">{r.reporter}</td>
                  <td className="px-5 py-4 hidden text-gray-500 md:table-cell">{r.tanggal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SuperadminPanel>
    </div>
  );
}
