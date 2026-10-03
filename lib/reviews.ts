import type { Review, ReviewCategory } from "@/lib/types";

export const reviewCategories: { key: ReviewCategory; label: string; description: string }[] = [
  { key: "quantity", label: "Quantity", description: "Portion size for the price" },
  { key: "quality", label: "Quality", description: "Flavor, freshness, and cooking" },
  { key: "cleanliness", label: "Cleanliness", description: "Stall hygiene and food handling" },
  { key: "value", label: "Value", description: "Fairness of price" },
  { key: "service", label: "Service", description: "Warmth and speed" }
];

export function getReviewAverage(review: Review) {
  const values = Object.values(review.ratings);
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function getCategoryAverages(reviews: Review[]) {
  return reviewCategories.reduce(
    (result, category) => {
      const average = reviews.length
        ? reviews.reduce((sum, review) => sum + review.ratings[category.key], 0) / reviews.length
        : 0;
      result[category.key] = Number(average.toFixed(1));
      return result;
    },
    {} as Record<ReviewCategory, number>
  );
}

export function getSpotAverage(reviews: Review[]) {
  if (!reviews.length) return 0;
  const average = reviews.reduce((sum, review) => sum + getReviewAverage(review), 0) / reviews.length;
  return Number(average.toFixed(1));
}
