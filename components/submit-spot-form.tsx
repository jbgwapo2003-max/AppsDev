"use client";

import { useState } from "react";
import { Camera, Check, MapPin, PhilippinePeso, PlusCircle, Search, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { buildTileGrid, latLngToWorld, worldToLatLng } from "@/lib/geoapify";
import { saveLocalSpot, slugifySpotName } from "@/lib/local-spots";

const defaultCenter = { lat: 14.5995, lng: 120.9842 };
const mapSize = { width: 388, height: 320 };
const mapZoom = 15;
const suggestedTags = ["BBQ", "Siomai", "Tusok-tusok", "Fried", "Sweet", "Spicy", "Dinner", "Budget"];

type GeoapifyResult = {
  formatted: string;
  lat: number;
  lon: number;
};

export function SubmitSpotForm() {
  const [center, setCenter] = useState(defaultCenter);
  const [addressQuery, setAddressQuery] = useState("");
  const [addressResults, setAddressResults] = useState<GeoapifyResult[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const geoapifyKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
  const tiles = geoapifyKey ? buildTileGrid({ apiKey: geoapifyKey, center, zoom: mapZoom, ...mapSize }) : [];
  const centerWorld = latLngToWorld(center, mapZoom);

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
      tags: parseTags(String(form.get("tags"))),
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

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      display_name: data.user.email?.split("@")[0] ?? "Kanto Finds user"
    });

    if (profileError) {
      setMessage(`Could not prepare your profile: ${profileError.message}`);
      setBusy(false);
      return;
    }

    const { data: spot, error } = await supabase
      .from("streetfood_spots")
      .insert({ ...payload, submitter_id: data.user.id })
      .select("id")
      .single();

    if (error || !spot) {
      setMessage(error ? error.message : "Spot could not be published.");
      setBusy(false);
      return;
    }

    const photos = form.getAll("photos").filter((file): file is File => file instanceof File && file.size > 0);
    const photoRecords = [];

    for (const photo of photos) {
      const safeName = photo.name.replace(/[^a-z0-9_.-]/gi, "-").toLowerCase();
      const storagePath = `${data.user.id}/${spot.id}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("spot-photos").upload(storagePath, photo, {
        cacheControl: "3600",
        upsert: false
      });

      if (!uploadError) {
        photoRecords.push({
          spot_id: spot.id,
          user_id: data.user.id,
          storage_path: storagePath,
          alt_text: `${payload.name} photo`
        });
      }
    }

    if (photoRecords.length) {
      await supabase.from("spot_photos").insert(photoRecords);
    }

    setMessage(photos.length && !photoRecords.length ? "Spot published, but photos could not be uploaded." : "Spot submitted and published.");
    setBusy(false);
  }

  async function searchAddress() {
    if (!geoapifyKey || !addressQuery.trim()) return;
    const params = new URLSearchParams({
      text: addressQuery,
      filter: "countrycode:ph",
      bias: `proximity:${center.lng},${center.lat}`,
      format: "json",
      limit: "5",
      apiKey: geoapifyKey
    });
    const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?${params}`);
    const data = (await response.json()) as { results?: GeoapifyResult[] };
    setAddressResults(data.results ?? []);
  }

  function pickAddress(result: GeoapifyResult) {
    setCenter({ lat: result.lat, lng: result.lon });
    setAddressQuery(result.formatted);
    setAddressResults([]);
  }

  function handleMapClick(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = centerWorld.x + event.clientX - rect.left - mapSize.width / 2;
    const y = centerWorld.y + event.clientY - rect.top - mapSize.height / 2;
    setCenter(worldToLatLng(x, y, mapZoom));
  }

  function addTag(tag: string) {
    const cleanTag = tag.trim().replace(/\s+/g, " ");
    if (!cleanTag) return;
    setTags((currentTags) => (currentTags.some((item) => item.toLowerCase() === cleanTag.toLowerCase()) ? currentTags : [...currentTags, cleanTag]));
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((currentTags) => currentTags.filter((item) => item !== tag));
  }

  function handleTagKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" && event.key !== ",") return;
    event.preventDefault();
    addTag(tagInput);
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
        </div>
        <div>
          <label htmlFor="spot-tags" className="text-sm font-bold text-charcoal">Tags</label>
          <input type="hidden" name="tags" value={tags.join(",")} />
          <div className="mt-2 rounded-md border border-charcoal/15 bg-rice p-3">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-leaf px-3 text-sm font-bold text-white">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="grid size-6 place-items-center rounded-full text-white/80 hover:bg-white/15 hover:text-white" aria-label={`Remove ${tag} tag`}>
                    <X size={14} aria-hidden="true" />
                  </button>
                </span>
              ))}
              <input
                id="spot-tags"
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onBlur={() => addTag(tagInput)}
                onKeyDown={handleTagKeyDown}
                className="min-h-9 min-w-[12rem] flex-1 bg-transparent text-base outline-none placeholder:text-ink/45"
                placeholder={tags.length ? "Add another tag" : "Type a tag, then press Enter"}
                aria-describedby="spot-tags-help"
              />
            </div>
          </div>
          <p id="spot-tags-help" className="mt-2 text-sm text-ink/65">Use tags for foods, cravings, or meal times so people can filter your stall in Explore.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestedTags.map((tag) => (
              <button key={tag} type="button" onClick={() => addTag(tag)} className="min-h-9 rounded-md border border-charcoal/10 bg-white px-3 text-sm font-bold text-charcoal shadow-sm hover:bg-smoke">
                {tag}
              </button>
            ))}
          </div>
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
            </div>
          </div>
          <input name="photos" type="file" accept="image/*" multiple className="mt-3 block w-full text-sm text-ink/70 file:mr-3 file:min-h-11 file:rounded-md file:border-0 file:bg-charcoal file:px-4 file:text-sm file:font-bold file:text-white" />
        </div>
      </section>

      <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-lg border border-charcoal/10 bg-white p-4 shadow-sm">
          <label className="block">
            <span className="text-sm font-bold text-charcoal">Search address</span>
            <div className="mt-2 flex gap-2">
              <input name="address" value={addressQuery} onChange={(event) => setAddressQuery(event.target.value)} required className="min-h-12 w-full rounded-md border border-charcoal/15 bg-rice px-3 text-base outline-none" placeholder="Address or landmark" />
              <button type="button" onClick={searchAddress} disabled={!geoapifyKey || !addressQuery.trim()} className="inline-flex min-h-12 w-12 items-center justify-center rounded-md bg-charcoal text-white disabled:cursor-not-allowed disabled:opacity-50" title="Search address">
                <Search size={18} aria-hidden="true" />
              </button>
            </div>
            {addressResults.length ? (
              <div className="mt-2 overflow-hidden rounded-md border border-charcoal/10 bg-white shadow-sm">
                {addressResults.map((result) => (
                  <button key={`${result.lat}-${result.lon}-${result.formatted}`} type="button" onClick={() => pickAddress(result)} className="block w-full border-b border-charcoal/10 px-3 py-2 text-left text-sm font-semibold text-ink last:border-b-0 hover:bg-smoke">
                    {result.formatted}
                  </button>
                ))}
              </div>
            ) : null}
          </label>
          <div className="mt-4 overflow-hidden rounded-md border border-charcoal/10 bg-smoke">
            {geoapifyKey ? (
              <div className="relative h-80 overflow-hidden bg-[#edf6fb]" onClick={handleMapClick}>
                {tiles.map((tile) => (
                  <img key={tile.key} src={tile.src} alt="" className="absolute h-64 w-64 max-w-none select-none" draggable={false} style={{ left: tile.left, top: tile.top }} />
                ))}
                <MapPin className="absolute left-1/2 top-1/2 z-10 -ml-3 -mt-8 text-leaf drop-shadow" size={32} fill="currentColor" aria-hidden="true" />
                <div className="absolute bottom-2 right-2 rounded bg-white/90 px-2 py-1 text-[10px] font-semibold text-ink/70">
                  © OpenStreetMap contributors © Geoapify
                </div>
              </div>
            ) : (
              <div className="grid h-80 place-items-center p-5 text-center text-sm font-semibold text-ink/70">
                <MapPin className="mb-2 text-leaf" aria-hidden="true" />
                Add Geoapify API key for address search and map placement.
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

function parseTags(value: string) {
  return Array.from(new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean)));
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
