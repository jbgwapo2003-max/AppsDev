"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ReviewHelpfulButton({ reviewId, initialCount, initiallyLiked }: { reviewId: string; initialCount: number; initiallyLiked?: boolean }) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(Boolean(initiallyLiked));
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function toggleHelpful() {
    setBusy(true);
    setMessage(null);
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setMessage("Sign in with Supabase enabled to mark reviews helpful.");
      setBusy(false);
      return;
    }

    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setMessage("Please sign in to mark reviews helpful.");
      setBusy(false);
      return;
    }

    if (liked) {
      const { error } = await supabase.from("review_likes").delete().eq("review_id", reviewId).eq("user_id", data.user.id);
      if (!error) {
        setLiked(false);
        setCount((current) => Math.max(0, current - 1));
      } else {
        setMessage(error.message);
      }
    } else {
      const { error } = await supabase.from("review_likes").upsert({ review_id: reviewId, user_id: data.user.id });
      if (!error) {
        setLiked(true);
        setCount((current) => current + 1);
      } else {
        setMessage(error.message);
      }
    }

    setBusy(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={toggleHelpful} disabled={busy} aria-pressed={liked} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-leaf/25 bg-white px-3 text-sm font-bold text-leaf transition hover:bg-leaf/10 disabled:cursor-not-allowed disabled:opacity-60">
        <ThumbsUp size={16} className={liked ? "fill-leaf" : ""} aria-hidden="true" />
        Helpful
        <span className="font-mono text-ink/70">{count}</span>
      </button>
      {message ? <span className="text-xs font-semibold text-ink/65">{message}</span> : null}
    </div>
  );
}
