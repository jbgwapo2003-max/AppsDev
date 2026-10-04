import { BookmarkList } from "@/components/bookmark-list";
import { getSupabaseSpotSummaries } from "@/lib/supabase/spots";

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const spots = await getSupabaseSpotSummaries();

  return (
    <main className="mx-auto max-w-6xl px-4 pb-8 pt-24 sm:px-6 lg:px-8">
      <BookmarkList spots={spots} />
    </main>
  );
}
