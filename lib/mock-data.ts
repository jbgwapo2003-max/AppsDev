import type { StreetfoodSpot } from "@/lib/types";
import { getCategoryAverages, getSpotAverage } from "@/lib/reviews";

export const spots: StreetfoodSpot[] = [];

export const spotSummaries = spots.map((spot) => ({
  ...spot,
  averageRating: getSpotAverage(spot.reviews),
  reviewCount: spot.reviews.length,
  categoryAverages: getCategoryAverages(spot.reviews)
}));

export function getSpotById(id: string) {
  return spotSummaries.find((spot) => spot.id === id);
}
