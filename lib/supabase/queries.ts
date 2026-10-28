import { supabase, isSupabaseConfigured } from './client';
import type { Place, PlaceRatingSummary, FilterState } from '@/types';
import { SAMPLE_PLACES } from '@/lib/data/sample-places';
import { normalizeTags } from '@/lib/utils';

interface PlaceWithSummaryRaw extends Omit<Place, 'avg_price_rating' | 'avg_ambience' | 'avg_food_quality' | 'rating_count'> {
  place_rating_summary?: PlaceRatingSummary[] | PlaceRatingSummary | null;
}

function cleanPlace(raw: Place): Place {
  let cat = raw.category;
  if (cat && cat.toLowerCase().includes('caf')) {
    cat = 'Cafés';
  }
  return {
    ...raw,
    category: cat,
    tags: normalizeTags(raw.tags),
    latitude: raw.latitude !== null && raw.latitude !== undefined ? Number(raw.latitude) : null,
    longitude: raw.longitude !== null && raw.longitude !== undefined ? Number(raw.longitude) : null,
    price_per_two: raw.price_per_two !== null && raw.price_per_two !== undefined ? Number(raw.price_per_two) : null,
  };
}

export async function getPublishedPlaces(): Promise<Place[]> {
  if (!isSupabaseConfigured()) {
    return SAMPLE_PLACES.map(cleanPlace);
  }

  try {
    const { data, error } = await supabase
      .from('places')
      .select(`
        *,
        place_rating_summary (
          avg_price_rating,
          avg_ambience,
          avg_food_quality,
          rating_count
        )
      `)
      .eq('is_published', true)
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('Supabase query returned empty/error, using sample places fallback:', error?.message);
      return SAMPLE_PLACES.map(cleanPlace);
    }

    const rows = data as unknown as PlaceWithSummaryRaw[];

    return rows.map((place) => {
      const { place_rating_summary: rawSummary, ...rest } = place;
      const summary = Array.isArray(rawSummary) 
        ? rawSummary[0] 
        : rawSummary ?? null;

      let cat = rest.category;
      if (cat && cat.toLowerCase().includes('caf')) {
        cat = 'Cafés';
      }

      return {
        ...rest,
        category: cat,
        tags: normalizeTags(rest.tags),
        latitude: rest.latitude !== null && rest.latitude !== undefined ? Number(rest.latitude) : null,
        longitude: rest.longitude !== null && rest.longitude !== undefined ? Number(rest.longitude) : null,
        price_per_two: rest.price_per_two !== null && rest.price_per_two !== undefined ? Number(rest.price_per_two) : null,
        avg_price_rating: summary?.avg_price_rating ?? null,
        avg_ambience: summary?.avg_ambience ?? null,
        avg_food_quality: summary?.avg_food_quality ?? null,
        rating_count: summary?.rating_count ?? null,
      };
    });
  } catch (err) {
    console.error('getPublishedPlaces error:', err);
    return SAMPLE_PLACES.map(cleanPlace);
  }
}

export async function getPlaceById(id: string): Promise<Place | null> {
  const sample = SAMPLE_PLACES.find((p) => p.id === id);

  if (!isSupabaseConfigured()) {
    return sample ? cleanPlace(sample) : null;
  }

  try {
    const { data, error } = await supabase
      .from('places')
      .select(`
        *,
        place_rating_summary (
          avg_price_rating,
          avg_ambience,
          avg_food_quality,
          rating_count
        )
      `)
      .eq('id', id)
      .eq('is_published', true)
      .single();

    if (error || !data) {
      return sample ? cleanPlace(sample) : null;
    }

    const rawPlace = data as unknown as PlaceWithSummaryRaw;
    const { place_rating_summary: rawSummary, ...rest } = rawPlace;
    const summary = Array.isArray(rawSummary)
      ? rawSummary[0]
      : rawSummary ?? null;

    let cat = rest.category;
    if (cat && cat.toLowerCase().includes('caf')) {
      cat = 'Cafés';
    }

    return {
      ...rest,
      category: cat,
      tags: normalizeTags(rest.tags),
      latitude: rest.latitude !== null && rest.latitude !== undefined ? Number(rest.latitude) : null,
      longitude: rest.longitude !== null && rest.longitude !== undefined ? Number(rest.longitude) : null,
      price_per_two: rest.price_per_two !== null && rest.price_per_two !== undefined ? Number(rest.price_per_two) : null,
      avg_price_rating: summary?.avg_price_rating ?? null,
      avg_ambience: summary?.avg_ambience ?? null,
      avg_food_quality: summary?.avg_food_quality ?? null,
      rating_count: summary?.rating_count ?? null,
    };
  } catch {
    return sample ? cleanPlace(sample) : null;
  }
}

export async function getRatingSummary(placeId: string): Promise<PlaceRatingSummary | null> {
  if (!isSupabaseConfigured()) {
    const s = SAMPLE_PLACES.find((p) => p.id === placeId);
    if (!s) return null;
    return {
      place_id: placeId,
      avg_price_rating: s.avg_price_rating ?? null,
      avg_ambience: s.avg_ambience ?? null,
      avg_food_quality: s.avg_food_quality ?? null,
      rating_count: s.rating_count ?? null,
    };
  }

  try {
    const { data, error } = await supabase
      .from('place_rating_summary')
      .select('*')
      .eq('place_id', placeId)
      .single();

    if (error) return null;
    return data as PlaceRatingSummary;
  } catch {
    return null;
  }
}

export async function getUserRating(placeId: string, firebaseUid: string) {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('place_ratings')
      .select('*')
      .eq('place_id', placeId)
      .eq('firebase_uid', firebaseUid)
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}
