"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { clsx } from "clsx";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function BookmarkButton({ spotId, compact = false }: { spotId: string; compact?: boolean }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSavedState() {
      const localSaved = window.localStorage.getItem(`bookmark:${spotId}`) === "true";
      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        if (active) setSaved(localSaved);
        return;
      }

      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        if (active) setSaved(localSaved);
        return;
      }

      const { data: bookmark } = await supabase
        .from("bookmarks")
        .select("spot_id")
        .eq("spot_id", spotId)
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (active) {
        const remoteSaved = Boolean(bookmark);
        window.localStorage.setItem(`bookmark:${spotId}`, String(localSaved || remoteSaved));
        setSaved(localSaved || remoteSaved);
      }
    }

    void loadSavedState();
    return () => {
      active = false;
    };
  }, [spotId]);

  async function toggleBookmark() {
    setBusy(true);
    const next = !saved;
    window.localStorage.setItem(`bookmark:${spotId}`, String(next));
    setSaved(next);
    const supabase = createSupabaseBrowserClient();

    if (supabase) {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        if (next) {
          const { data: existing } = await supabase
            .from("bookmarks")
            .select("spot_id")
            .eq("spot_id", spotId)
            .eq("user_id", data.user.id)
            .maybeSingle();

          if (!existing) {
            await supabase.from("bookmarks").insert({ spot_id: spotId, user_id: data.user.id });
          }
        } else {
          await supabase.from("bookmarks").delete().eq("spot_id", spotId).eq("user_id", data.user.id);
        }
      }
    }

    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={toggleBookmark}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? "Remove bookmark" : "Save streetfood spot"}
      className={clsx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-charcoal/15 bg-white px-3 text-sm font-bold text-charcoal transition hover:bg-smoke disabled:cursor-not-allowed disabled:opacity-60",
        saved && "border-leaf bg-leaf text-white hover:bg-leaf/90",
        compact && "size-11 px-0"
      )}
    >
      <Bookmark size={18} className={saved ? "fill-current" : ""} aria-hidden="true" />
      {!compact ? (saved ? "Saved" : "Save") : null}
    </button>
  );
}
