"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Flag, MapPin, PhilippinePeso, PlusCircle, Utensils } from "lucide-react";
import { BookmarkButton } from "@/components/bookmark-button";
import { CategoryBars, RatingPill } from "@/components/rating";
import { ReviewComposer } from "@/components/review-composer";
import { ReviewHelpfulButton } from "@/components/review-helpful-button";
import { ShareButton } from "@/components/share-button";
import { getLocalSpotById } from "@/lib/local-spots";
import { getReviewAverage } from "@/lib/reviews";
import type { SpotSummary } from "@/lib/types";

export function SpotDetailClient({ id, initialSpot }: { id: string; initialSpot?: SpotSummary | null }) {
  const [spot, setSpot] = useState<SpotSummary | null | undefined>(initialSpot);

  useEffect(() => {
    setSpot(initialSpot ?? getLocalSpotById(id) ?? null);
  }, [id, initialSpot]);

  if (spot === undefined) {
    return <main className="mx-auto max-w-7xl px-4 pb-8 pt-24 text-sm font-semibold text-ink/70 sm:px-6 lg:px-8">Loading spot...</main>;
  }

  if (!spot) {
    return (
      <main className="mx-auto max-w-3xl px-4 pb-10 pt-24 text-center sm:px-6 lg:px-8">
        <div className="rounded-lg border border-dashed border-charcoal/20 bg-white p-8 shadow-sm">
          <div className="mx-auto grid size-14 place-items-center rounded-md bg-leaf text-white">
            <PlusCircle size={26} aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-4xl font-semibold text-charcoal">Spot not found</h1>
          <p className="mt-2 text-base leading-7 text-ink/70">This map only shows user-added spots. Add a location first, then its detail page will appear here.</p>
          <Link href="/submit" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-leaf px-4 text-sm font-bold text-white shadow-pin hover:bg-leaf/90">
            <PlusCircle size={18} aria-hidden="true" /> Share a spot
          </Link>
        </div>
      </main>
    );
  }

  const photo = spot.photos[0] ?? { url: "/photos/spot-placeholder.svg", alt: `${spot.name} photo placeholder` };
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`;

  return (
    <main className="mx-auto max-w-7xl px-4 pb-6 pt-24 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-bold text-ink hover:bg-smoke">
        <ArrowLeft size={18} aria-hidden="true" /> Back to map
      </Link>

      <section className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-lg border border-charcoal/10 bg-white shadow-soft">
            <div className="relative aspect-[16/10] bg-smoke">
              <Image src={photo.url} alt={photo.alt} fill priority sizes="(min-width: 1024px) 760px, 100vw" className="object-cover" />
              <div className="absolute left-4 top-4">
                <RatingPill rating={spot.averageRating} count={spot.reviewCount} />
              </div>
            </div>
            <div className="p-5 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-leaf">{spot.neighborhood}, {spot.city}</p>
                  <h1 className="mt-2 font-display text-5xl font-semibold leading-none text-charcoal">{spot.name}</h1>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-ink/75">{spot.description}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <BookmarkButton spotId={spot.id} />
                  <ShareButton title={spot.name} />
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Info label="Address" value={spot.address} icon={<MapPin size={18} />} />
                <Info label="Price range" value={spot.priceRange} icon={<PhilippinePeso size={18} />} />
                <Info label="Best for" value={spot.tags.slice(0, 2).join(", ") || "Streetfood"} icon={<Utensils size={18} />} />
              </div>
            </div>
          </div>

          <section className="rounded-lg border border-charcoal/10 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-display text-3xl font-semibold text-charcoal">Menu prices</h2>
            {spot.prices.length ? (
              <div className="mt-4 divide-y divide-charcoal/10">
                {spot.prices.map((price) => (
                  <div key={price.id} className="flex items-center justify-between gap-5 py-3">
                    <div>
                      <p className="font-bold text-charcoal">{price.item}</p>
                      {price.notes ? <p className="text-sm text-ink/65">{price.notes}</p> : null}
                    </div>
                    <p className="font-mono text-lg font-bold text-leaf">₱{price.pricePhp}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-ink/70">No itemized prices yet. The listed range is {spot.priceRange}.</p>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-chili">Community notes</p>
                <h2 className="font-display text-4xl font-semibold text-charcoal">Reviews</h2>
              </div>
              <RatingPill rating={spot.averageRating} count={spot.reviewCount} />
            </div>
            {spot.reviews.length ? (
              spot.reviews.map((review) => (
                <article key={review.id} className="rounded-lg border border-charcoal/10 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link href={`/profiles/${review.userId}`} className="flex min-h-11 items-center gap-3 rounded-md pr-2 hover:bg-smoke/70 focus:outline-none focus:ring-2 focus:ring-leaf">
                      <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-smoke text-sm font-bold text-leaf">
                        {review.avatarUrl ? <img src={review.avatarUrl} alt={`${review.userName} profile picture`} className="h-full w-full object-cover" /> : review.userName.slice(0, 1).toUpperCase()}
                      </span>
                      <span>
                        <span className="block font-bold text-charcoal">{review.userName}</span>
                        <span className="block text-sm text-ink/60">{new Date(review.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </span>
                    </Link>
                    <RatingPill rating={Number(getReviewAverage(review).toFixed(1))} />
                  </div>
                  <p className="mt-3 text-base leading-7 text-ink/80">{review.comment}</p>
                  <div className="mt-4">
                    <ReviewHelpfulButton reviewId={review.id} initialCount={review.helpfulCount} initiallyLiked={review.viewerHasLiked} />
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-charcoal/20 bg-white p-5 text-sm leading-6 text-ink/70">No reviews yet. Be the first to rate quantity, quality, cleanliness, value, and service.</div>
            )}
            <ReviewComposer spotId={spot.id} />
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-charcoal/10 bg-white p-5 shadow-sm">
            <h2 className="font-display text-3xl font-semibold text-charcoal">Rating breakdown</h2>
            <div className="mt-4">
              <CategoryBars averages={spot.categoryAverages} />
            </div>
          </div>
          <div className="rounded-lg border border-charcoal/10 bg-white p-5 shadow-sm">
            <h2 className="font-display text-3xl font-semibold text-charcoal">Location</h2>
            <p className="mt-2 text-sm leading-6 text-ink/70">{spot.address}</p>
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md bg-leaf px-4 text-sm font-bold text-white shadow-pin hover:bg-leaf/90">
              Open in Google Maps <ExternalLink size={17} aria-hidden="true" />
            </a>
          </div>
          <button className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-chili/30 bg-white px-4 text-sm font-bold text-chili hover:bg-chili/10">
            <Flag size={18} aria-hidden="true" /> Report an issue
          </button>
        </aside>
      </section>
    </main>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-md bg-rice p-4">
      <div className="mb-2 flex items-center gap-2 text-leaf">{icon}<span className="text-xs font-bold uppercase tracking-[0.16em]">{label}</span></div>
      <p className="text-sm font-semibold leading-6 text-charcoal">{value}</p>
    </div>
  );
}
