"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { SpotCard } from "@/components/spot-card";
import type { SpotSummary } from "@/lib/types";
import { getLocalSpots } from "@/lib/local-spots";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function BookmarkList({ spots }: { spots: SpotSummary[] }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadBookmarks() {
      const allSpots = uniqueSpots([...getLocalSpots(), ...spots]);
      const localIds = allSpots.filter((spot) => window.localStorage.getItem(`bookmark:${spot.id}`) === "true").map((spot) => spot.id);
      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        if (active) {
          setSavedIds(localIds);
          setLoaded(true);
        }
        return;
      }

      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        if (active) {
          setSavedIds(localIds);
          setLoaded(true);
        }
        return;
      }

      const { data: bookmarks } = await supabase
        .from("bookmarks")
        .select("spot_id")
        .eq("user_id", authData.user.id);
      const remoteIds = (bookmarks ?? []).map((bookmark) => bookmark.spot_id as string);

      if (active) {
        setSavedIds(Array.from(new Set([...localIds, ...remoteIds])));
        setLoaded(true);
      }
    }

    void loadBookmarks();
    return () => {
      active = false;
    };
  }, [spots]);

  const allSpots = uniqueSpots([...getLocalSpots(), ...spots]);
  const savedSpots = allSpots.filter((spot) => savedIds.includes(spot.id));

  if (!loaded) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-72 animate-pulse rounded-lg bg-white/80 shadow-sm" />
        ))}
      </div>
    );
  }

  if (!savedSpots.length) {
    return (
      <div className="rounded-lg border border-dashed border-charcoal/20 bg-white p-8 text-center shadow-sm">
        <h2 className="font-display text-3xl font-semibold text-charcoal">No saved spots yet</h2>
        <Link href="/" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-leaf px-4 text-sm font-bold text-white shadow-pin hover:bg-leaf/90">
          <PlusCircle size={18} aria-hidden="true" /> Explore spots
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {savedSpots.map((spot) => (
        <SpotCard key={spot.id} spot={spot} compact />
      ))}
    </div>
  );
}

function uniqueSpots(spots: SpotSummary[]) {
  return Array.from(new Map(spots.map((spot) => [spot.id, spot])).values());
}
