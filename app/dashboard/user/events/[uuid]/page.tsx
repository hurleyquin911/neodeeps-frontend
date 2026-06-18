import { EventDetailClient } from "@/components/dashboard/user/EventDetailClient";

export default async function EventDetailPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  return <EventDetailClient eventUuid={uuid} />;
}
