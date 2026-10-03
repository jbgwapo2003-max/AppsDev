"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { SpotCard } from "@/components/spot-card";
import type { SpotSummary } from "@/lib/types";
import { getLocalSpots } from "@/lib/local-spots";

export function BookmarkList({ spots }: { spots: SpotSummary[] }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    const allSpots = [...getLocalSpots(), ...spots];
    const ids = allSpots.filter((spot) => window.localStorage.getItem(`bookmark:${spot.id}`) === "true").map((spot) => spot.id);
    setSavedIds(ids);
  }, [spots]);

  const allSpots = [...getLocalSpots(), ...spots];
  const savedSpots = allSpots.filter((spot) => savedIds.includes(spot.id));

  if (!savedSpots.length) {
    return (
      <div className="rounded-lg border border-dashed border-charcoal/20 bg-white p-8 text-center shadow-sm">
        <h2 className="font-display text-3xl font-semibold text-charcoal">No saved spots yet</h2>
        <p className="mx-auto mt-2 max-w-xl text-base leading-7 text-ink/70">Save stalls from the discovery map or detail pages. Once Supabase is connected, bookmarks will sync to your account.</p>
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
