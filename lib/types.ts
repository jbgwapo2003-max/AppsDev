export type ReviewCategory = "quantity" | "quality" | "cleanliness" | "value" | "service";

export type Review = {
  id: string;
  userId: string;
  userName: string;
  avatarUrl?: string;
  createdAt: string;
  comment: string;
  ratings: Record<ReviewCategory, number>;
  helpfulCount: number;
  viewerHasLiked?: boolean;
};

export type Profile = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
};

export type SpotPhoto = {
  id: string;
  url: string;
  alt: string;
};

export type SpotPrice = {
  id: string;
  item: string;
  pricePhp: number;
  notes?: string;
};

export type StreetfoodSpot = {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  neighborhood: string;
  lat: number;
  lng: number;
  tags: string[];
  priceRange: string;
  openHours: string;
  photos: SpotPhoto[];
  prices: SpotPrice[];
  reviews: Review[];
};

export type SpotSummary = StreetfoodSpot & {
  averageRating: number;
  reviewCount: number;
  categoryAverages: Record<ReviewCategory, number>;
};
