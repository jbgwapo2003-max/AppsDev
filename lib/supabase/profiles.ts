import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapReviews, mapSpotRow, type SpotRow } from "@/lib/supabase/spots";
import type { Profile, Review, SpotSummary } from "@/lib/types";

type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
};

type ProfileReviewRow = {
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
  streetfood_spots?: {
    id: string;
    name: string;
    city: string;
    neighborhood: string;
  } | { id: string; name: string; city: string; neighborhood: string }[] | null;
};

export type ProfileReview = Review & {
  spot?: {
    id: string;
    name: string;
    city: string;
    neighborhood: string;
  };
};

export type ProfilePageData = {
  profile: Profile;
  viewerId?: string;
  spots: SpotSummary[];
  reviews: ProfileReview[];
};

const profileSelect = "id, display_name, avatar_url, bio, created_at";

const submittedSpotSelect = `
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

const profileReviewSelect = `
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
  review_likes(user_id),
  streetfood_spots(id, name, city, neighborhood)
`;

export async function getProfilePageData(id: string): Promise<ProfilePageData | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: authData } = await supabase.auth.getUser();
  const viewerId = authData.user?.id;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(profileSelect)
    .eq("id", id)
    .maybeSingle();

  if (profileError || !profile) return null;

  const [{ data: spots }, { data: reviews }] = await Promise.all([
    supabase
      .from("streetfood_spots")
      .select(submittedSpotSelect)
      .eq("submitter_id", id)
      .eq("status", "visible")
      .order("created_at", { ascending: false }),
    supabase
      .from("reviews")
      .select(profileReviewSelect)
      .eq("user_id", id)
      .order("created_at", { ascending: false })
  ]);

  return {
    profile: mapProfile(profile as ProfileRow),
    viewerId,
    spots: ((spots ?? []) as unknown as SpotRow[]).map((spot) => mapSpotRow(spot, viewerId)),
    reviews: ((reviews ?? []) as unknown as ProfileReviewRow[]).map((review) => {
      const [mapped] = mapReviews([review], viewerId);
      const spot = Array.isArray(review.streetfood_spots) ? review.streetfood_spots[0] : review.streetfood_spots;
      return {
        ...mapped,
        spot: spot
          ? {
              id: spot.id,
              name: spot.name,
              city: spot.city,
              neighborhood: spot.neighborhood
            }
          : undefined
      };
    })
  };
}

function mapProfile(profile: ProfileRow): Profile {
  return {
    id: profile.id,
    displayName: profile.display_name || "Kanto Finds user",
    avatarUrl: profile.avatar_url ?? undefined,
    bio: profile.bio ?? undefined,
    createdAt: profile.created_at
  };
}
