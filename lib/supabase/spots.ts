import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCategoryAverages, getSpotAverage } from "@/lib/reviews";
import type { Review, SpotPhoto, SpotPrice, SpotSummary } from "@/lib/types";

type SpotRow = {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  neighborhood: string;
  lat: number;
  lng: number;
  price_range: string;
  open_hours: string | null;
  tags: string[];
  spot_photos?: PhotoRow[];
  spot_prices?: PriceRow[];
  reviews?: ReviewRow[];
};

type PhotoRow = {
  id: string;
  storage_path: string;
  alt_text: string;
};

type PriceRow = {
  id: string;
  item: string;
  price_php: number;
  notes: string | null;
};

type ReviewRow = {
  id: string;
  comment: string;
  quantity_rating: number;
  quality_rating: number;
  cleanliness_rating: number;
  value_rating: number;
  service_rating: number;
  created_at: string;
};

const spotSelect = `
  id,
  name,
  description,
  address,
  city,
  neighborhood,
  lat,
  lng,
  price_range,
  open_hours,
  tags,
  spot_photos(id, storage_path, alt_text),
  spot_prices(id, item, price_php, notes),
  reviews(id, comment, quantity_rating, quality_rating, cleanliness_rating, value_rating, service_rating, created_at)
`;

export async function getSupabaseSpotSummaries(): Promise<SpotSummary[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("streetfood_spots")
    .select(spotSelect)
    .eq("status", "visible")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return (data as SpotRow[]).map((spot) => mapSpotRow(spot));
}

export async function getSupabaseSpotById(id: string): Promise<SpotSummary | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("streetfood_spots")
    .select(spotSelect)
    .eq("id", id)
    .eq("status", "visible")
    .maybeSingle();

  if (error || !data) return null;

  return mapSpotRow(data as SpotRow);
}

function mapSpotRow(spot: SpotRow): SpotSummary {
  const reviews = mapReviews(spot.reviews ?? []);

  return {
    id: spot.id,
    name: spot.name,
    description: spot.description,
    address: spot.address,
    city: spot.city,
    neighborhood: spot.neighborhood,
    lat: spot.lat,
    lng: spot.lng,
    tags: spot.tags ?? [],
    priceRange: spot.price_range,
    openHours: spot.open_hours ?? "Hours not listed",
    photos: mapPhotos(spot.spot_photos ?? []),
    prices: mapPrices(spot.spot_prices ?? []),
    reviews,
    averageRating: getSpotAverage(reviews),
    reviewCount: reviews.length,
    categoryAverages: getCategoryAverages(reviews)
  };
}

function mapPhotos(photos: PhotoRow[]): SpotPhoto[] {
  return photos.map((photo) => ({
    id: photo.id,
    url: getPublicPhotoUrl(photo.storage_path),
    alt: photo.alt_text
  }));
}

function mapPrices(prices: PriceRow[]): SpotPrice[] {
  return prices.map((price) => ({
    id: price.id,
    item: price.item,
    pricePhp: Number(price.price_php),
    notes: price.notes ?? undefined
  }));
}

function mapReviews(reviews: ReviewRow[]): Review[] {
  return reviews.map((review) => ({
    id: review.id,
    userName: "Kanto Finds user",
    createdAt: review.created_at,
    comment: review.comment,
    ratings: {
      quantity: review.quantity_rating,
      quality: review.quality_rating,
      cleanliness: review.cleanliness_rating,
      value: review.value_rating,
      service: review.service_rating
    }
  }));
}

function getPublicPhotoUrl(path: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return "/photos/spot-placeholder.svg";

  return `${supabaseUrl}/storage/v1/object/public/spot-photos/${path}`;
}
