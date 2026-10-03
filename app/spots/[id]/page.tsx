import { SpotDetailClient } from "@/components/spot-detail-client";
import { getSupabaseSpotById } from "@/lib/supabase/spots";

export const dynamic = "force-dynamic";

export default async function SpotDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const spot = await getSupabaseSpotById(id);

  return <SpotDetailClient id={id} initialSpot={spot} />;
}
