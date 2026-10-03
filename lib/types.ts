export type ReviewCategory = "quantity" | "quality" | "cleanliness" | "value" | "service";

export type Review = {
  id: string;
  userName: string;
  createdAt: string;
  comment: string;
  ratings: Record<ReviewCategory, number>;
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
