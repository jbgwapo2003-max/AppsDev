import { Bookmark } from "lucide-react";
import { BookmarkList } from "@/components/bookmark-list";
import { spotSummaries } from "@/lib/mock-data";

export default function BookmarksPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-md bg-leaf text-white">
          <Bookmark size={21} aria-hidden="true" />
        </span>
        <div>
          <h1 className="font-display text-4xl font-semibold text-charcoal">Bookmarked spots</h1>
          <p className="text-sm text-ink/70">Sign in with Supabase to sync saved places across devices. Local demo bookmarks are stored in this browser.</p>
        </div>
      </div>
      <BookmarkList spots={spotSummaries} />
    </main>
  );
}
