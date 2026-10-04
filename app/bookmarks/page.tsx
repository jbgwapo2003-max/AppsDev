import { BookmarkList } from "@/components/bookmark-list";
import { spotSummaries } from "@/lib/mock-data";

export default function BookmarksPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-8 pt-24 sm:px-6 lg:px-8">
      <BookmarkList spots={spotSummaries} />
    </main>
  );
}
