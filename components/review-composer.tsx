"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { reviewCategories } from "@/lib/reviews";
import { StarRatingInput } from "@/components/star-rating-input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ReviewCategory } from "@/lib/types";

const initialRatings = reviewCategories.reduce((result, category) => {
  result[category.key] = 4;
  return result;
}, {} as Record<ReviewCategory, number>);

export function ReviewComposer({ spotId }: { spotId: string }) {
  const router = useRouter();
  const [ratings, setRatings] = useState(initialRatings);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setMessage("Demo saved locally. Add Supabase env vars to persist reviews.");
      setBusy(false);
      return;
    }

    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setMessage("Please sign in before leaving a review.");
      setBusy(false);
      return;
    }

    const { error } = await supabase.from("reviews").upsert(
      {
        spot_id: spotId,
        user_id: data.user.id,
        comment,
        quantity_rating: ratings.quantity,
        quality_rating: ratings.quality,
        cleanliness_rating: ratings.cleanliness,
        value_rating: ratings.value,
        service_rating: ratings.service
      },
      { onConflict: "spot_id,user_id" }
    );

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Review saved.");
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submitReview} className="rounded-lg border border-charcoal/10 bg-white p-5 shadow-sm">
      <h2 className="font-display text-3xl font-semibold text-charcoal">Add your review</h2>
      <p className="mt-1 text-sm text-ink/70">Rate the details people actually ask about before they line up.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {reviewCategories.map((category) => (
          <div key={category.key} className="rounded-md bg-rice p-3">
            <span className="block text-sm font-bold text-charcoal">{category.label}</span>
            <span className="block text-xs text-ink/65">{category.description}</span>
            <div className="mt-2">
              <StarRatingInput
                name={`rating-${category.key}`}
                label={`${category.label} rating`}
                value={ratings[category.key]}
                onChange={(value) => setRatings((current) => ({ ...current, [category.key]: value }))}
              />
            </div>
          </div>
        ))}
      </div>
      <label className="mt-4 block">
        <span className="text-sm font-bold text-charcoal">Review notes</span>
        <textarea value={comment} onChange={(event) => setComment(event.target.value)} required minLength={12} rows={4} className="mt-2 w-full rounded-md border border-charcoal/15 bg-rice px-3 py-3 text-sm leading-6" placeholder="What should someone know before they visit?" />
      </label>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-leaf px-4 text-sm font-bold text-white shadow-pin hover:bg-leaf/90 disabled:cursor-not-allowed disabled:opacity-60">
          <Star size={18} aria-hidden="true" /> {busy ? "Saving..." : "Save review"}
        </button>
        {message ? <p className="text-sm font-semibold text-ink/70">{message}</p> : null}
      </div>
    </form>
  );
}
