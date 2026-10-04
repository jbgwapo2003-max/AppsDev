import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCategoryAverages, getSpotAverage } from "@/lib/reviews";
import type { Review, SpotPhoto, SpotPrice, SpotSummary } from "@/lib/types";

export type SpotRow = {
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
  user_id: string;
  comment: string;
  quantity_rating: number;
  quality_rating: number;
  cleanliness_rating: number;
  value_rating: number;
  service_rating: number;
  created_at: string;
  profiles?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  } | { id: string; display_name: string | null; avatar_url: string | null }[] | null;
  review_likes?: { user_id: string }[];
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
  reviews(
    id,
    user_id,
    comment,
    quantity_rating,
    quality_rating,
    cleanliness_rating,
    value_rating,
    service_rating,
    created_at,
    profiles(id, display_name, avatar_url),
    review_likes(user_id)
  )
`;

export async function getSupabaseSpotSummaries(): Promise<SpotSummary[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data: authData } = await supabase.auth.getUser();
  const viewerId = authData.user?.id;

  const { data, error } = await supabase
    .from("streetfood_spots")
    .select(spotSelect)
    .eq("status", "visible")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return (data as unknown as SpotRow[]).map((spot) => mapSpotRow(spot, viewerId));
}

export async function getSupabaseSpotById(id: string): Promise<SpotSummary | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data: authData } = await supabase.auth.getUser();
  const viewerId = authData.user?.id;

  const { data, error } = await supabase
    .from("streetfood_spots")
    .select(spotSelect)
    .eq("id", id)
    .eq("status", "visible")
    .maybeSingle();

  if (error || !data) return null;

  return mapSpotRow(data as unknown as SpotRow, viewerId);
}

export function mapSpotRow(spot: SpotRow, viewerId?: string): SpotSummary {
  const reviews = mapReviews(spot.reviews ?? [], viewerId);

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

export function mapPhotos(photos: PhotoRow[]): SpotPhoto[] {
  return photos.map((photo) => ({
    id: photo.id,
    url: getPublicPhotoUrl(photo.storage_path),
    alt: photo.alt_text
  }));
}

export function mapPrices(prices: PriceRow[]): SpotPrice[] {
  return prices.map((price) => ({
    id: price.id,
    item: price.item,
    pricePhp: Number(price.price_php),
    notes: price.notes ?? undefined
  }));
}

export function mapReviews(reviews: ReviewRow[], viewerId?: string): Review[] {
  return reviews.map((review) => ({
    id: review.id,
    userId: review.user_id,
    userName: getReviewProfile(review)?.display_name || "Kanto Finds user",
    avatarUrl: getReviewProfile(review)?.avatar_url ?? undefined,
    createdAt: review.created_at,
    comment: review.comment,
    helpfulCount: review.review_likes?.length ?? 0,
    viewerHasLiked: viewerId ? review.review_likes?.some((like) => like.user_id === viewerId) : false,
    ratings: {
      quantity: review.quantity_rating,
      quality: review.quality_rating,
      cleanliness: review.cleanliness_rating,
      value: review.value_rating,
      service: review.service_rating
    }
  }));
}

function getReviewProfile(review: ReviewRow) {
  return Array.isArray(review.profiles) ? review.profiles[0] : review.profiles;
}

function getPublicPhotoUrl(path: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return "/photos/spot-placeholder.svg";

  return `${supabaseUrl}/storage/v1/object/public/spot-photos/${path}`;
}
