"use client";

import { GoogleMap, InfoWindow, Marker, useJsApiLoader } from "@react-google-maps/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Libraries } from "@react-google-maps/api";
import type { SpotSummary } from "@/lib/types";
import { RatingPill } from "@/components/rating";

const center = { lat: 12.8797, lng: 121.774 };
const libraries: Libraries = ["places"];

export function MapView({ spots, height = "100%" }: { spots: SpotSummary[]; height?: string }) {
  const [selectedId, setSelectedId] = useState<string | null>(spots[0]?.id ?? null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const selected = spots.find((spot) => spot.id === selectedId);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey || "missing-key",
    libraries
  });

  useEffect(() => {
    if (!selectedId && spots[0]) {
      setSelectedId(spots[0].id);
    }
  }, [selectedId, spots]);

  if (!apiKey) {
    return <FallbackMap spots={spots} height={height} />;
  }

  if (!isLoaded) {
    return <div className="grid min-h-[360px] place-items-center rounded-lg border border-white/70 bg-rice/80 text-sm font-semibold text-ink/70 shadow-soft backdrop-blur-xl">Loading map...</div>;
  }

  if (!spots.length) {
    return <EmptyMap height={height} />;
  }

  return (
    <div className="map-shell overflow-hidden rounded-lg border border-white/70 bg-rice/80 shadow-soft backdrop-blur-xl" style={{ height }}>
      <GoogleMap mapContainerStyle={{ width: "100%", height: "100%" }} center={center} zoom={6} options={{ mapTypeControl: false, streetViewControl: false, fullscreenControl: false }}>
        {spots.map((spot) => (
          <Marker key={spot.id} position={{ lat: spot.lat, lng: spot.lng }} title={spot.name} onClick={() => setSelectedId(spot.id)} />
        ))}
        {selected ? (
          <InfoWindow position={{ lat: selected.lat, lng: selected.lng }} onCloseClick={() => setSelectedId(null)}>
            <div className="max-w-56 space-y-2 p-1">
              <RatingPill rating={selected.averageRating} count={selected.reviewCount} />
              <Link href={`/spots/${selected.id}`} className="block font-semibold text-charcoal">
                {selected.name}
              </Link>
              <p className="text-xs text-ink/70">{selected.address}</p>
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
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
        Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to enable Google Maps
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
