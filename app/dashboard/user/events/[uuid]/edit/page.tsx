import { EditEventClient } from "@/components/dashboard/user/EditEventClient";

export default async function EditEventPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  return <EditEventClient eventUuid={uuid} />;
}
