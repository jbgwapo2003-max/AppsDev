"use client";

import type { SpotSummary, StreetfoodSpot } from "@/lib/types";
import { getCategoryAverages, getSpotAverage } from "@/lib/reviews";

const STORAGE_KEY = "bambi:user-spots";

export function getLocalSpots(): SpotSummary[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const spots = raw ? (JSON.parse(raw) as StreetfoodSpot[]) : [];
    return spots.map(toSummary);
  } catch {
    return [];
  }
}

export function getLocalSpotById(id: string): SpotSummary | undefined {
  return getLocalSpots().find((spot) => spot.id === id);
}

export function saveLocalSpot(spot: StreetfoodSpot) {
  const current = getLocalSpots();
  const next = [toSummary(spot), ...current.filter((item) => item.id !== spot.id)];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function slugifySpotName(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `${base || "streetfood-spot"}-${Date.now().toString(36)}`;
}

function toSummary(spot: StreetfoodSpot): SpotSummary {
  return {
    ...spot,
    averageRating: getSpotAverage(spot.reviews),
    reviewCount: spot.reviews.length,
    categoryAverages: getCategoryAverages(spot.reviews)
  };
}
