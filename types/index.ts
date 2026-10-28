export interface Place {
  id: string;
  name: string;
  address: string;
  category: string;
  maps_url: string | null;
  latitude: number | null;
  longitude: number | null;
  price_per_two: number | null;
  tags: string[] | null;
  is_published: boolean;
  created_at: string;
  image_url?: string | null;
  gallery?: string[] | null;
  avg_price_rating?: number | null;
  avg_ambience?: number | null;
  avg_food_quality?: number | null;
  rating_count?: number | null;
  // Computed client-side when user location is available
  distanceKm?: number | null;
}

export interface PlaceRatingSummary {
  place_id: string;
  avg_price_rating: number | null;
  avg_ambience: number | null;
  avg_food_quality: number | null;
  rating_count: number | null;
}

export interface PlaceRating {
  place_id: string;
  firebase_uid: string;
  price_rating: number;
  ambience_rating: number;
  food_quality_rating: number;
  created_at: string;
  updated_at: string;
}

export interface RatingFormData {
  price_rating: number;
  ambience_rating: number;
  food_quality_rating: number;
}

export type SortOption =
  | 'distance_asc'
  | 'rating_desc'
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'default';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';

export interface FilterState {
  search: string;
  category: string;
  tags: string[];
  tagLogic: 'OR' | 'AND';
  minPrice: number;
  maxPrice: number;
  sort: SortOption;
}

export const CATEGORIES = [
  'All',
  'Street Food & Quick Bites',
  'Restaurants & Family Dining',
  'Tiffin & Breakfast',
  'Cafés',
  'Tea, Coffee & Juice',
  'Bakeries, Sweets, Desserts & Ice Cream',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_SHORT: Record<string, string> = {
  'Street Food & Quick Bites': 'Quick Bites',
  'Restaurants & Family Dining': 'Dining',
  'Tiffin & Breakfast': 'Tiffin',
  'Cafés': 'Cafés',
  'Tea, Coffee & Juice': 'Tea & Juice',
  'Bakeries, Sweets, Desserts & Ice Cream': 'Sweets',
};
