import { CommunityBerandaClient } from "@/components/dashboard/user/CommunityBerandaClient";

export const metadata = { title: "Beranda Komunitas" };

export default async function CommunityBerandaPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  return <CommunityBerandaClient communityUuid={uuid} />;
}
