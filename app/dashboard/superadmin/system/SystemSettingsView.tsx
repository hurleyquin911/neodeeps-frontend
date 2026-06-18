import { SuperadminPanel } from "@/components/dashboard/superadmin/SuperadminPanel";

function SwitchRow({ title, description, muted }: { title: string; description: string; muted?: boolean }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
      <div className="min-w-0 max-w-xl">
        <p className="font-bold text-gray-900">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-gray-600">{description}</p>
      </div>
      <button
        type="button"
        disabled
        aria-disabled="true"
        className={`relative h-8 w-14 shrink-0 rounded-full border border-teal-100 bg-teal-50/70 ${muted ? "opacity-55" : "opacity-60"}`}
      >
        <span className="absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-sm ring-1 ring-orange-50" />
        <span className="sr-only">Sakelar nonaktif — menyusul API</span>
      </button>
    </div>
  );
}

export function SystemSettingsView() {
  return (
    <div className="space-y-6">
      <SuperadminPanel title="Pengaturan platform global">
        <div className="divide-y divide-orange-50">
          <SwitchRow
            title="Mode pemeliharaan"
            description="Banner informasi bagi pengguna + penangguhan penulisan berat ketika infra lagi dioprek."
            muted
          />
          <SwitchRow
            title="Pendaftaran akun baru"
            description="Kalau OFF, onboarding hanya dari undangan tim internal."
            muted
          />
        </div>
      </SuperadminPanel>
      <SuperadminPanel title="Batas & keamanan">
        <div className="divide-y divide-orange-50">
          <SwitchRow
            title="Kuota aktivitas penyelenggara"
            description="Pengunci produk seperti maks dua perkumpulan aktif per orang."
            muted
          />
          <SwitchRow title="JWT & sesi" description="Durasi sesi bisa disesuaikan di env backend Anda." muted />
          <SwitchRow
            title="CORS / host API"
            description="Origin frontend produksi boleh diwhitelist di ALLOWED_CORS_ORIGINS atau CORS_ORIGIN."
            muted
          />
        </div>
      </SuperadminPanel>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { k: "API publik", v: "200 OK", tint: "text-emerald-700" },
          { k: "Basis data", v: "Tersedia", tint: "text-emerald-700" },
          { k: "Antrean tugas", v: "Worker menyusul", tint: "text-gray-500" },
        ].map((c) => (
          <div key={c.k} className="rounded-3xl border border-teal-100/85 bg-[var(--neo-surface)] px-4 py-3 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{c.k}</p>
            <p className={`mt-1 font-extrabold ${c.tint}`}>{c.v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
