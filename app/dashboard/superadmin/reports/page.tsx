import { SuperadminPageHeader } from "@/components/dashboard/superadmin/SuperadminPageHeader";
import { ApiSoonNote } from "@/components/dashboard/superadmin/ApiSoonNote";
import { ReportsView } from "./ReportsView";

export default function SuperadminReportsPage() {
  return (
    <div className="space-y-10">
      <SuperadminPageHeader
        title="Laporan"
        description="Menyatukan laporan pengguna atas target tertentu (konten, komunitas, ruang chat). Tingkat keparahan membantu menentukan urutan tinjauan."
      />
      <ApiSoonNote label="Tabel berikut memakai data contoh di peramban; integrasi akan memakai endpoint laporan di backend Anda." />
      <ReportsView />
    </div>
  );
}
