import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getReviewsBySpotId, hydrateReviewRows, mapReviews, mapSpotRow, type ReviewRow, type SpotRow } from "@/lib/supabase/spots";
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
  spot_id: string;
  user_id: string;
  comment: string;
  quantity_rating: number;
  quality_rating: number;
  cleanliness_rating: number;
  value_rating: number;
  service_rating: number;
  created_at: string;
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
  submitter_id,
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
  spot_prices(id, item, price_php, notes)
`;

const profileReviewSelect = `
  id,
  spot_id,
  user_id,
  comment,
  quantity_rating,
  quality_rating,
  cleanliness_rating,
  value_rating,
  service_rating,
  created_at
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
  const spotRows = (spots ?? []) as unknown as SpotRow[];
  const reviewsBySpotId = await getReviewsBySpotId(spotRows.map((spot) => spot.id));
  const reviewRows = await hydrateReviewRows((reviews ?? []) as unknown as ReviewRow[]);
  const reviewedSpotIds = Array.from(new Set(reviewRows.map((review) => review.spot_id).filter(Boolean))) as string[];
  const { data: reviewedSpots } = reviewedSpotIds.length
    ? await supabase
        .from("streetfood_spots")
        .select("id, name, city, neighborhood")
        .in("id", reviewedSpotIds)
        .eq("status", "visible")
    : { data: [] };
  const reviewedSpotsById = new Map((reviewedSpots ?? []).map((spot) => [spot.id, spot]));

  return {
    profile: mapProfile(profile as ProfileRow),
    viewerId,
    spots: spotRows.map((spot) => mapSpotRow({ ...spot, reviews: reviewsBySpotId.get(spot.id) ?? [] }, viewerId)),
    reviews: (reviewRows as unknown as ProfileReviewRow[]).map((review) => {
      const [mapped] = mapReviews([review], viewerId);
      const spot = reviewedSpotsById.get(review.spot_id);
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
