import { DirectMessageThreadClient } from "@/components/dashboard/user/DirectMessageThreadClient";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationUuid: string }>;
}) {
  const { conversationUuid } = await params;
  return <DirectMessageThreadClient conversationUuid={conversationUuid} />;
}
