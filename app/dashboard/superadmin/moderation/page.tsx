import { SuperadminPageHeader } from "@/components/dashboard/superadmin/SuperadminPageHeader";
import { ApiSoonNote } from "@/components/dashboard/superadmin/ApiSoonNote";
import { ModerationQueueView } from "./ModerationQueueView";

export default function SuperadminModerationPage() {
  return (
    <div className="space-y-10">
      <SuperadminPageHeader
        title="Moderasi"
        description="Susun tayangan baru dan insiden berminta prioritas. Super admin bisa berbagi alur sama dengan admin penyusunan dengan akses penyaringan lebih luas."
      />
      <ApiSoonNote label="Antrian akan mengambil data dari backend saat endpoint moderasi (event, perkumpulan, chat) tersedia." />
      <ModerationQueueView />
    </div>
  );
}
