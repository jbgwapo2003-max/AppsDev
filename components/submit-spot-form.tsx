"use client";

import { useState } from "react";
import { GoogleMap, Marker, StandaloneSearchBox, useJsApiLoader } from "@react-google-maps/api";
import type { Libraries } from "@react-google-maps/api";
import { Camera, Check, MapPin, PhilippinePeso, PlusCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { saveLocalSpot, slugifySpotName } from "@/lib/local-spots";

const defaultCenter = { lat: 14.5995, lng: 120.9842 };
const libraries: Libraries = ["places"];

export function SubmitSpotForm() {
  const [center, setCenter] = useState(defaultCenter);
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey || "missing-key",
    libraries
  });

  async function submitSpot(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const supabase = createSupabaseBrowserClient();

    const payload = {
      name: String(form.get("name")),
      description: String(form.get("description")),
      address: String(form.get("address")),
      city: String(form.get("city")),
      neighborhood: String(form.get("neighborhood")),
      price_range: String(form.get("priceRange")),
      open_hours: String(form.get("openHours")),
      tags: String(form.get("tags")).split(",").map((tag) => tag.trim()).filter(Boolean),
      lat: center.lat,
      lng: center.lng,
      status: "visible"
    };

    if (!supabase) {
      const id = slugifySpotName(payload.name);
      saveLocalSpot({
        id,
        name: payload.name,
        description: payload.description,
        address: payload.address,
        city: payload.city,
        neighborhood: payload.neighborhood,
        lat: payload.lat,
        lng: payload.lng,
        tags: payload.tags,
        priceRange: payload.price_range,
        openHours: payload.open_hours,
        photos: [{ id: `${id}-photo`, url: "/photos/spot-placeholder.svg", alt: `${payload.name} placeholder photo` }],
        prices: [],
        reviews: []
      });
      setMessage("Spot saved in this browser. Go back to Explore to see it on the map.");
      setBusy(false);
      return;
    }

    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setMessage("Please sign in before sharing a spot.");
      setBusy(false);
      return;
    }

    const { error } = await supabase.from("streetfood_spots").insert({ ...payload, submitter_id: data.user.id });
    setMessage(error ? error.message : "Spot submitted and published.");
    setBusy(false);
  }

  function handlePlacesChanged() {
    const place = searchBox?.getPlaces()?.[0];
    const location = place?.geometry?.location;
    if (!location) return;
    setCenter({ lat: location.lat(), lng: location.lng() });
    const addressInput = document.querySelector<HTMLInputElement>("input[name='address']");
    if (addressInput && place.formatted_address) addressInput.value = place.formatted_address;
  }

  return (
    <form onSubmit={submitSpot} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
      <section className="space-y-5 rounded-lg border border-charcoal/10 bg-white p-5 shadow-soft sm:p-7">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-chili">Community submission</p>
          <h1 className="mt-2 font-display text-5xl font-semibold leading-none text-charcoal">Share a streetfood spot</h1>
          <p className="mt-3 text-base leading-7 text-ink/75">Add enough detail for someone to find the stall, understand the prices, and decide if it fits their cravings.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="name" label="Spot name" placeholder="Aling Nena's BBQ" required />
          <Field name="city" label="City" placeholder="Manila" required />
          <Field name="neighborhood" label="Neighborhood" placeholder="Quiapo" required />
          <Field name="priceRange" label="Price range" placeholder="₱20-₱100" icon={<PhilippinePeso size={18} />} required />
          <Field name="openHours" label="Open hours" placeholder="4:00 PM - 11:00 PM" required />
          <Field name="tags" label="Tags" placeholder="BBQ, Isaw, Dinner" required />
        </div>
        <label className="block">
          <span className="text-sm font-bold text-charcoal">Description</span>
          <textarea name="description" required minLength={24} rows={4} className="mt-2 w-full rounded-md border border-charcoal/15 bg-rice px-3 py-3 text-sm leading-6" placeholder="What is good here? What should people expect?" />
        </label>
        <div className="rounded-md border border-dashed border-charcoal/20 bg-rice p-4">
          <div className="flex items-center gap-3">
            <Camera size={20} className="text-leaf" aria-hidden="true" />
            <div>
              <p className="font-bold text-charcoal">Photos</p>
              <p className="text-sm text-ink/65">Wire this field to Supabase Storage in production; schema and bucket policy are included.</p>
            </div>
          </div>
          <input type="file" accept="image/*" multiple className="mt-3 block w-full text-sm text-ink/70 file:mr-3 file:min-h-11 file:rounded-md file:border-0 file:bg-charcoal file:px-4 file:text-sm file:font-bold file:text-white" />
        </div>
      </section>

      <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-lg border border-charcoal/10 bg-white p-4 shadow-sm">
          <label className="block">
            <span className="text-sm font-bold text-charcoal">Search address</span>
            {apiKey && isLoaded ? (
              <StandaloneSearchBox onLoad={setSearchBox} onPlacesChanged={handlePlacesChanged}>
                <input name="address" required className="mt-2 min-h-12 w-full rounded-md border border-charcoal/15 bg-rice px-3 text-base outline-none" placeholder="Search a street, market, or landmark" />
              </StandaloneSearchBox>
            ) : (
              <input name="address" required className="mt-2 min-h-12 w-full rounded-md border border-charcoal/15 bg-rice px-3 text-base outline-none" placeholder="Address or landmark" />
            )}
          </label>
          <div className="mt-4 overflow-hidden rounded-md border border-charcoal/10 bg-smoke">
            {apiKey && isLoaded ? (
              <GoogleMap mapContainerStyle={{ width: "100%", height: 320 }} center={center} zoom={15} onClick={(event) => event.latLng && setCenter({ lat: event.latLng.lat(), lng: event.latLng.lng() })} options={{ mapTypeControl: false, streetViewControl: false }}>
                <Marker position={center} draggable onDragEnd={(event) => event.latLng && setCenter({ lat: event.latLng.lat(), lng: event.latLng.lng() })} />
              </GoogleMap>
            ) : (
              <div className="grid h-80 place-items-center p-5 text-center text-sm font-semibold text-ink/70">
                <MapPin className="mb-2 text-leaf" aria-hidden="true" />
                Add Google Maps API key for address autocomplete and draggable pin placement.
              </div>
            )}
          </div>
          <p className="mt-3 text-xs font-semibold text-ink/60">Pin: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}</p>
        </div>
        <button type="submit" disabled={busy} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-leaf px-4 text-sm font-bold text-white shadow-pin hover:bg-leaf/90 disabled:cursor-not-allowed disabled:opacity-60">
          {busy ? <PlusCircle size={18} aria-hidden="true" /> : <Check size={18} aria-hidden="true" />} {busy ? "Publishing..." : "Publish spot"}
        </button>
        {message ? <p className="rounded-md bg-smoke px-3 py-2 text-sm font-semibold text-ink">{message}</p> : null}
      </aside>
    </form>
  );
}

function Field({ name, label, placeholder, icon, required }: { name: string; label: string; placeholder: string; icon?: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-charcoal">{label}</span>
      <div className="mt-2 flex min-h-12 items-center gap-2 rounded-md border border-charcoal/15 bg-rice px-3">
        {icon ? <span className="text-leaf">{icon}</span> : null}
        <input name={name} required={required} className="h-12 w-full bg-transparent text-base outline-none" placeholder={placeholder} />
      </div>
    </label>
  );
}
