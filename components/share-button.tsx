"use client";

import { Share2 } from "lucide-react";

export function ShareButton({ title }: { title: string }) {
  async function shareSpot() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }
    await navigator.clipboard.writeText(url);
  }

  return (
    <button type="button" onClick={shareSpot} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-charcoal/15 bg-white px-4 text-sm font-bold text-charcoal hover:bg-smoke">
      <Share2 size={18} aria-hidden="true" /> Share
    </button>
  );
}
