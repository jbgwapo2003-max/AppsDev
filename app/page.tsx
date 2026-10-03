import { Discovery } from "@/components/discovery";
import { getSupabaseSpotSummaries } from "@/lib/supabase/spots";

export const dynamic = "force-dynamic";

export default async function Home() {
  const spots = await getSupabaseSpotSummaries();

  return <Discovery initialSpots={spots} />;
}
