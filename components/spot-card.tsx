import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Utensils } from "lucide-react";
import type { SpotSummary } from "@/lib/types";
import { RatingPill } from "@/components/rating";
import { BookmarkButton } from "@/components/bookmark-button";

export function SpotCard({ spot, compact = false }: { spot: SpotSummary; compact?: boolean }) {
  const photo = spot.photos[0] ?? { url: "/photos/spot-placeholder.svg", alt: `${spot.name} photo placeholder` };

  return (
    <article className="group min-w-0 overflow-hidden rounded-lg border border-charcoal/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <Link href={`/spots/${spot.id}`} className="block focus:outline-none focus:ring-2 focus:ring-leaf">
        <div className="relative aspect-[4/3] overflow-hidden bg-smoke">
          <Image src={photo.url} alt={photo.alt} fill sizes="(min-width: 1024px) 360px, 100vw" className="object-cover transition duration-300 group-hover:scale-105" />
          <div className="absolute left-3 top-3">
            <RatingPill rating={spot.averageRating} count={spot.reviewCount} />
          </div>
        </div>
      </Link>
      <div className="space-y-4 p-4">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/spots/${spot.id}`} className="font-display text-2xl font-semibold leading-tight text-charcoal [overflow-wrap:anywhere] hover:text-leaf">
              {spot.name}
            </Link>
            <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-ink/70">
              <MapPin size={15} className="shrink-0" aria-hidden="true" /> <span className="min-w-0 truncate">{spot.neighborhood}, {spot.city}</span>
            </p>
          </div>
          <BookmarkButton spotId={spot.id} compact />
        </div>
        {!compact ? <p className="line-clamp-2 text-sm leading-6 text-ink/80">{spot.description}</p> : null}
        <div className="flex flex-wrap gap-2">
          {spot.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-md bg-smoke px-2.5 py-1 text-xs font-bold text-ink">
              {tag}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 border-t border-charcoal/10 pt-3 text-sm text-ink/75">
          <span className="flex min-w-0 items-center gap-1.5">
            <Utensils size={15} className="shrink-0" aria-hidden="true" /> <span className="min-w-0 truncate">{spot.priceRange}</span>
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            <Clock size={15} className="shrink-0" aria-hidden="true" /> <span className="min-w-0 truncate">{spot.openHours}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
