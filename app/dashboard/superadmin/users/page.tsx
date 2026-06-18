import { SuperadminPageHeader } from "@/components/dashboard/superadmin/SuperadminPageHeader";
import { ApiSoonNote } from "@/components/dashboard/superadmin/ApiSoonNote";
import { UsersView } from "./UsersView";

export default function SuperadminUsersPage() {
  return (
    <div className="space-y-10">
      <SuperadminPageHeader
        title="Pengguna"
        description="Cari dan kelola akun serta perannya. Kontrol akses penyusunan harus konsisten dengan kebijakan keamanan internal Anda."
      />
      <ApiSoonNote label="Tabel menggunakan data contoh di peramban hingga Anda menyambungkan API daftar pengguna (atau endpoint admin yang disetujui)." />
      <UsersView />
    </div>
  );
}
