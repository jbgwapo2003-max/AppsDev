import { SpotDetailClient } from "@/components/spot-detail-client";

export default async function SpotDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SpotDetailClient id={id} />;
}
