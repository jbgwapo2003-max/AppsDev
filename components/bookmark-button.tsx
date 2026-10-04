"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { clsx } from "clsx";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function BookmarkButton({ spotId, compact = false }: { spotId: string; compact?: boolean }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

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

  useEffect(() => {
    if (!notice) return;

    const timeout = window.setTimeout(() => setNotice(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  async function toggleBookmark() {
    setBusy(true);
    const next = !saved;
    window.localStorage.setItem(`bookmark:${spotId}`, String(next));
    setSaved(next);
    const supabase = createSupabaseBrowserClient();

    if (supabase) {
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError) {
        window.localStorage.setItem(`bookmark:${spotId}`, String(saved));
        setSaved(saved);
        setNotice("Couldn't update bookmark. Please try again.");
        setBusy(false);
        return;
      }

      if (data.user) {
        let error: { message: string } | null = null;

        if (next) {
          const { data: existing, error: lookupError } = await supabase
            .from("bookmarks")
            .select("spot_id")
            .eq("spot_id", spotId)
            .eq("user_id", data.user.id)
            .maybeSingle();

          error = lookupError;
          if (!lookupError && !existing) {
            const { error: insertError } = await supabase
              .from("bookmarks")
              .insert({ spot_id: spotId, user_id: data.user.id });
            error = insertError;
          }
        } else {
          const { error: deleteError } = await supabase
            .from("bookmarks")
            .delete()
            .eq("spot_id", spotId)
            .eq("user_id", data.user.id);
          error = deleteError;
        }

        if (error) {
          window.localStorage.setItem(`bookmark:${spotId}`, String(saved));
          setSaved(saved);
          setNotice("Couldn't update bookmark. Please try again.");
          setBusy(false);
          return;
        }
      }
    }

    setNotice(next ? "Spot bookmarked." : "Bookmark removed.");
    setBusy(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={toggleBookmark}
        disabled={busy}
        aria-pressed={saved}
        aria-label={saved ? "Remove bookmark" : "Save streetfood spot"}
        className={clsx(
          "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
          saved
            ? "border-leaf bg-leaf text-white hover:bg-leaf/90"
            : "border-charcoal/15 bg-white text-charcoal hover:bg-smoke",
          compact && "size-11 px-0"
        )}
      >
        <Bookmark size={18} className={saved ? "fill-current" : ""} aria-hidden="true" />
        {!compact ? (saved ? "Saved" : "Save") : null}
      </button>
      {notice ? (
        <span
          role="status"
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-md bg-charcoal px-4 py-3 text-sm font-semibold text-white shadow-lg"
        >
          {notice}
        </span>
      ) : null}
    </>
  );
}
