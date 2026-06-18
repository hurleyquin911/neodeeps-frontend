import { UserProfileClient } from "@/components/dashboard/user/UserProfileClient";

export const metadata = { title: "Profil Pengguna" };

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  return <UserProfileClient userUuid={uuid} />;
}
