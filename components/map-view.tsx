"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { buildTileGrid, latLngToWorld } from "@/lib/geoapify";
import type { SpotSummary } from "@/lib/types";
import { RatingPill } from "@/components/rating";

const center = { lat: 12.8797, lng: 121.774 };
const defaultMapSize = { width: 880, height: 520 };
const zoom = 6;

export function MapView({ spots, height = "100%" }: { spots: SpotSummary[]; height?: string }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(spots[0]?.id ?? null);
  const [mapSize, setMapSize] = useState(defaultMapSize);
  const geoapifyKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
  const selected = spots.find((spot) => spot.id === selectedId);
  const tiles = useMemo(() => (geoapifyKey ? buildTileGrid({ apiKey: geoapifyKey, center, zoom, ...mapSize }) : []), [geoapifyKey, mapSize]);
  const centerWorld = latLngToWorld(center, zoom);

  useEffect(() => {
    if (!selectedId && spots[0]) {
      setSelectedId(spots[0].id);
    }
  }, [selectedId, spots]);

  useEffect(() => {
    if (selectedId && !spots.some((spot) => spot.id === selectedId)) {
      setSelectedId(spots[0]?.id ?? null);
    }
  }, [selectedId, spots]);

  useEffect(() => {
    const node = mapRef.current;
    if (!node) return;

    const updateSize = () => {
      const rect = node.getBoundingClientRect();
      setMapSize({
        width: Math.max(320, Math.round(rect.width)),
        height: Math.max(360, Math.round(rect.height))
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (!geoapifyKey) {
    return <FallbackMap spots={spots} height={height} />;
  }

  if (!spots.length) {
    return <EmptyMap height={height} />;
  }

  return (
    <div className="map-shell overflow-hidden rounded-lg border border-white/70 bg-rice/80 shadow-soft backdrop-blur-xl" style={{ height }}>
      <div ref={mapRef} className="relative h-full min-h-[360px] overflow-hidden bg-[#edf6fb] sm:min-h-[420px] lg:min-h-0">
        {tiles.map((tile) => (
          <img key={tile.key} src={tile.src} alt="" className="absolute h-64 w-64 max-w-none select-none" draggable={false} style={{ left: tile.left, top: tile.top }} />
        ))}
        {spots.map((spot) => {
          const spotWorld = latLngToWorld({ lat: spot.lat, lng: spot.lng }, zoom);
          const left = mapSize.width / 2 + spotWorld.x - centerWorld.x;
          const top = mapSize.height / 2 + spotWorld.y - centerWorld.y;

          return (
            <button key={spot.id} type="button" onClick={() => setSelectedId(spot.id)} className="absolute z-10 -ml-3 -mt-7 text-leaf drop-shadow focus:outline-none focus:ring-2 focus:ring-charcoal" style={{ left: `${left}px`, top: `${top}px` }} title={spot.name}>
              <MapPin size={30} fill="currentColor" aria-hidden="true" />
            </button>
          );
        })}
        {selected ? (
          <div className="absolute left-4 right-4 top-4 z-20 rounded-lg border border-charcoal/10 bg-white p-3 shadow-soft sm:left-5 sm:right-auto sm:max-w-64">
            <RatingPill rating={selected.averageRating} count={selected.reviewCount} />
            <Link href={`/spots/${selected.id}`} className="mt-2 block font-semibold text-charcoal">
              {selected.name}
            </Link>
            <p className="mt-1 text-xs text-ink/70">{selected.address}</p>
            <button type="button" onClick={() => setSelectedId(null)} className="mt-2 text-xs font-bold text-leaf">
              Close
            </button>
          </div>
        ) : null}
        <div className="absolute bottom-2 right-2 rounded bg-white/90 px-2 py-1 text-[10px] font-semibold text-ink/70">
          © OpenStreetMap contributors © Geoapify
        </div>
      </div>
    </div>
  );
}

function FallbackMap({ spots, height }: { spots: SpotSummary[]; height: string }) {
  if (!spots.length) {
    return <EmptyMap height={height} />;
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-white/70 bg-[#edf6fb]/90 shadow-soft backdrop-blur-xl" style={{ minHeight: height === "100%" ? 480 : height }}>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,121,178,.14)_1px,transparent_1px),linear-gradient(rgba(14,121,178,.14)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="absolute left-5 top-5 rounded-lg border border-white/70 bg-rice/90 px-3 py-2 text-sm font-semibold text-charcoal shadow-sm backdrop-blur">
        Add `NEXT_PUBLIC_GEOAPIFY_API_KEY` to enable maps
      </div>
      {spots.map((spot, index) => (
        <Link
          key={spot.id}
          href={`/spots/${spot.id}`}
          className="absolute rounded-lg bg-leaf px-3 py-2 text-sm font-bold text-white shadow-pin focus:outline-none focus:ring-2 focus:ring-charcoal"
          style={{ left: `${18 + index * 24}%`, top: `${35 + (index % 2) * 26}%` }}
        >
          {spot.name}
        </Link>
      ))}
    </div>
  );
}

function EmptyMap({ height }: { height: string }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-white/70 bg-[#edf6fb]/90 shadow-soft backdrop-blur-xl" style={{ minHeight: height === "100%" ? 480 : height }}>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,121,178,.14)_1px,transparent_1px),linear-gradient(rgba(14,121,178,.14)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="absolute inset-x-5 top-5 rounded-lg border border-white/70 bg-rice/90 px-4 py-3 text-sm font-semibold text-charcoal shadow-sm backdrop-blur">
        No pins yet. Add the first streetfood location to place it on the map.
      </div>
    </div>
  );
}
