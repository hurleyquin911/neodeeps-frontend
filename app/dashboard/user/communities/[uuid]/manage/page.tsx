import { CommunityManageClient } from "@/components/dashboard/user/CommunityManageClient";

export const metadata = { title: "Kelola Komunitas" };

export default async function CommunityManagePage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  return <CommunityManageClient communityUuid={uuid} />;
}
