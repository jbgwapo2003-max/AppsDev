"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Filter, ListFilter, MapPinned, Menu, Play, PlusCircle, Search } from "lucide-react";
import { MapView } from "@/components/map-view";
import { SpotCard } from "@/components/spot-card";
import { getLocalSpots } from "@/lib/local-spots";
import type { SpotSummary } from "@/lib/types";

export function Discovery({ initialSpots }: { initialSpots: SpotSummary[] }) {
  const [spots, setSpots] = useState(initialSpots);
  const [isLoading, setIsLoading] = useState(true);
  const topTags = useMemo(() => Array.from(new Set(spots.flatMap((spot) => spot.tags))).slice(0, 7), [spots]);
  const featuredSpot = spots[0];

  useEffect(() => {
    setSpots([...getLocalSpots(), ...initialSpots]);

    const loaderTimer = window.setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => window.clearTimeout(loaderTimer);
  }, [initialSpots]);

  return (
    <>
      {isLoading ? <NewtonsCradleLoader /> : null}

      <IntroHero featuredSpot={featuredSpot} />

      <main id="discover" className="mx-auto grid min-h-screen max-w-7xl scroll-mt-24 gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,420px)_1fr] lg:px-8">
        <section className="order-2 space-y-4 lg:order-1">
          <div className="rounded-lg border border-white/70 bg-rice/80 p-4 shadow-soft backdrop-blur-xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-chili">Philippines streetfood guide</p>
            <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-charcoal sm:text-5xl">Build the map from real finds.</h1>
            <p className="mt-3 text-base leading-7 text-ink/75">No generated food spots are shown here. Add a stall with photos, prices, map pin, and review categories to start the community guide.</p>
            <div className="mt-5 flex min-h-12 items-center gap-3 rounded-lg border border-charcoal/10 bg-rice/80 px-3 shadow-sm">
              <Search size={20} className="text-leaf" aria-hidden="true" />
              <input className="h-12 w-full bg-transparent text-base outline-none placeholder:text-ink/45" placeholder="Search user-added spots..." aria-label="Search streetfood spots" />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar" aria-label="Popular filters">
            <button className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg bg-charcoal px-4 text-sm font-bold text-rice shadow-sm">
              <ListFilter size={17} aria-hidden="true" /> All spots
            </button>
            {topTags.map((tag) => (
              <button key={tag} className="min-h-11 shrink-0 rounded-lg border border-charcoal/10 bg-rice/80 px-4 text-sm font-bold text-charcoal shadow-sm backdrop-blur hover:bg-white">
                {tag}
              </button>
            ))}
          </div>

          {spots.length ? (
            <div className="grid gap-4">
              {spots.map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          ) : (
            <EmptySpots />
          )}
        </section>

        <section className="order-1 lg:sticky lg:top-24 lg:order-2 lg:h-[calc(100vh-110px)]">
          <div className="mb-3 flex items-center justify-between rounded-lg border border-white/70 bg-rice/80 p-3 shadow-sm backdrop-blur-xl lg:hidden">
            <span className="inline-flex items-center gap-2 text-sm font-bold text-charcoal">
              <MapPinned size={18} aria-hidden="true" /> Map view
            </span>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-leaf">
              <Filter size={15} aria-hidden="true" /> {spots.length} finds
            </span>
          </div>
          <MapView spots={spots} height="100%" />
        </section>
      </main>
    </>
  );
}

function NewtonsCradleLoader() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/50 text-rice backdrop-blur-xl" role="status" aria-live="polite" aria-label="Loading Kanto Finds">
      <div className="rounded-lg border border-white/15 bg-charcoal/70 px-8 py-7 text-center shadow-soft">
        <div className="newtons-cradle mx-auto" aria-hidden="true">
          <div className="newtons-cradle__dot"></div>
          <div className="newtons-cradle__dot"></div>
          <div className="newtons-cradle__dot"></div>
          <div className="newtons-cradle__dot"></div>
        </div>
        <p className="mt-5 text-sm font-bold uppercase tracking-[0.28em] text-rice/75">Loading fresh finds</p>
      </div>
    </div>
  );
}

function IntroHero({ featuredSpot }: { featuredSpot?: SpotSummary }) {
  return (
    <section className="relative isolate min-h-dvh overflow-hidden bg-charcoal text-white">
      <Image
        src="/photos/vernon-raineil-cenzon-QAkqxrH6mvc-unsplash.jpg"
        alt="Steam rising over a busy street food stall with skewers and simmering trays"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,9,7,0.78),rgba(10,9,7,0.34)_48%,rgba(10,9,7,0.72)),linear-gradient(180deg,rgba(10,9,7,0.18),rgba(10,9,7,0.82))]" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/25" />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-7xl flex-col px-4 pb-5 pt-24 sm:px-6 lg:px-8">
        <div className="flex min-h-14 items-center justify-between border-b border-white/18 text-white/80">
          <nav className="hidden items-center gap-8 text-xs font-semibold md:flex" aria-label="Intro navigation">
            <a href="#discover" className="hover:text-white">Explore spots</a>
            <Link href="/submit" className="hover:text-white">Share a find</Link>
            <Link href="/bookmarks" className="hover:text-white">Saved routes</Link>
          </nav>
          <Link href="/submit" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-4 text-sm font-bold text-charcoal shadow-soft hover:bg-rice">
            Add a spot <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
          <button className="grid min-h-11 min-w-11 place-items-center rounded-md border border-white/20 bg-white/10 text-white backdrop-blur md:hidden" aria-label="Open menu">
            <Menu size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="grid flex-1 content-center gap-8 py-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end lg:py-16">
          <div className="max-w-5xl">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-turmeric">Philippines streetfood guide</p>
            <h1 className="mt-5 max-w-5xl font-display text-5xl font-semibold leading-[0.92] text-white sm:text-7xl lg:text-8xl">
              Unlock your next streetfood find.
            </h1>
            <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <p className="max-w-md text-base leading-7 text-white/80">
                Discover real stalls, prices, photos, and honest reviews from nearby food walks before the steam fades.
              </p>
              <a href="#discover" className="inline-flex size-16 shrink-0 items-center justify-center rounded-full bg-white/16 text-white backdrop-blur transition hover:scale-105 hover:bg-white/24 focus:outline-none focus:ring-2 focus:ring-white" aria-label="Jump to discovery map">
                <Play size={24} fill="currentColor" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-white/25 bg-white/12 p-3 shadow-soft backdrop-blur-md">
            <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-charcoal/60">
              <Image
                src="/photos/vernon-raineil-cenzon-QAkqxrH6mvc-unsplash.jpg"
                alt="Close view of a night market street food stall"
                fill
                sizes="(min-width: 1024px) 330px, 90vw"
                className="object-cover"
              />
            </div>
            <div className="mt-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Featured route</p>
                <h2 className="mt-1 font-display text-2xl font-semibold leading-tight text-white">
                  {featuredSpot ? featuredSpot.name : "Steam Alley Crawl"}
                </h2>
              </div>
              <span className="rounded-md bg-white px-2.5 py-1 text-xs font-bold text-charcoal">{spotsLabel(featuredSpot)}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-t border-white/18 pt-4 text-sm text-white/80 md:grid-cols-[1fr_auto] md:items-end">
          <div className="flex flex-wrap gap-3">
            <a href="#discover" className="border-b border-white pb-2 font-bold text-white">Explore tours</a>
            <Link href="/submit" className="border-b border-white/25 pb-2 hover:border-white hover:text-white">Add your stall</Link>
            <Link href="/bookmarks" className="border-b border-white/25 pb-2 hover:border-white hover:text-white">Bookmarks</Link>
          </div>
          <p className="max-w-sm leading-6">A community-built map for memorable bites, unusual corners, and repeat-worthy vendors.</p>
        </div>
      </div>
    </section>
  );
}

function spotsLabel(featuredSpot?: SpotSummary) {
  if (!featuredSpot) {
    return "New";
  }

  return featuredSpot.priceRange;
}

function EmptySpots() {
  return (
    <div className="rounded-lg border border-dashed border-charcoal/20 bg-rice/80 p-8 text-center shadow-soft backdrop-blur-xl">
      <div className="mx-auto grid size-14 place-items-center rounded-lg bg-leaf text-white shadow-pin">
        <PlusCircle size={26} aria-hidden="true" />
      </div>
      <h2 className="mt-4 font-display text-3xl font-semibold text-charcoal">No streetfood spots yet</h2>
      <p className="mx-auto mt-2 max-w-xl text-base leading-7 text-ink/70">Be the first to add a real location. Once Supabase is connected, submitted spots will come from the database instead of this browser.</p>
      <Link href="/submit" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-leaf px-4 text-sm font-bold text-white shadow-pin hover:bg-leaf/90">
        <PlusCircle size={18} aria-hidden="true" /> Share a spot
      </Link>
    </div>
  );
}
