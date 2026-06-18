import { SuperadminPageHeader } from "@/components/dashboard/superadmin/SuperadminPageHeader";
import { ApiSoonNote } from "@/components/dashboard/superadmin/ApiSoonNote";
import { SystemSettingsView } from "./SystemSettingsView";

export default function SuperadminSystemPage() {
  return (
    <div className="space-y-10">
      <SuperadminPageHeader
        title="Sistem"
        description="Konfigurasi berskala platform, batas operasional, dan indikasi kesehatan layanan. Perubahan di sini mempengaruhi seluruh pengguna — gunakan akses pembatas dan audit ketat."
      />
      <ApiSoonNote label="Sakelar hingga kartu status di bawah bersifat tiruan sampai Anda menyimpan preferensi sistem ke backend (mis. PATCH /system/settings)." />
      <SystemSettingsView />
    </div>
  );
}
