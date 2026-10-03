import { Star } from "lucide-react";
import { reviewCategories } from "@/lib/reviews";
import type { ReviewCategory } from "@/lib/types";

export function RatingPill({ rating, count }: { rating: number; count?: number }) {
  return (
    <span className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-turmeric/30 bg-rice/95 px-2.5 text-sm font-bold text-charcoal shadow-sm">
      <Star size={16} className="fill-turmeric text-turmeric" aria-hidden="true" />
      {rating ? rating.toFixed(1) : "New"}
      {typeof count === "number" ? <span className="font-medium text-ink/70">({count})</span> : null}
    </span>
  );
}

export function CategoryBars({ averages }: { averages: Record<ReviewCategory, number> }) {
  return (
    <div className="space-y-3">
      {reviewCategories.map((category) => {
        const value = averages[category.key] ?? 0;
        return (
          <div key={category.key}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-charcoal">{category.label}</span>
              <span className="font-mono text-ink/70">{value ? value.toFixed(1) : "—"}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-smoke">
              <div className="h-full rounded-full bg-leaf" style={{ width: `${Math.max(0, Math.min(value / 5, 1)) * 100}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
