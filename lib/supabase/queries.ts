import { supabase, isSupabaseConfigured } from './client';
import type { Place, PlaceRatingSummary, FilterState } from '@/types';
import { SAMPLE_PLACES } from '@/lib/data/sample-places';
import { normalizeTags } from '@/lib/utils';

interface PlaceWithSummaryRaw extends Omit<Place, 'avg_price_rating' | 'avg_ambience' | 'avg_food_quality' | 'rating_count'> {
  place_rating_summary?: PlaceRatingSummary[] | PlaceRatingSummary | null;
}

function cleanPlace(raw: any): Place {
  let cat = raw.category;
  if (cat && cat.toLowerCase().includes('caf')) {
    cat = 'Cafés';
  }
  return {
    ...raw,
    id: String(raw.id),
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
    const [placesRes, summaryRes] = await Promise.all([
      supabase
        .from('places')
        .select('*')
        .eq('is_published', true)
        .order('name', { ascending: true }),
      supabase
        .from('place_rating_summary')
        .select('*'),
    ]);

    if (placesRes.error || !placesRes.data || placesRes.data.length === 0) {
      console.warn('Supabase query returned empty/error, using sample places fallback:', placesRes.error?.message);
      return SAMPLE_PLACES.map(cleanPlace);
    }

    const summaryMap = new Map<string, PlaceRatingSummary>();
    if (summaryRes.data) {
      for (const s of summaryRes.data as PlaceRatingSummary[]) {
        summaryMap.set(String(s.place_id), s);
      }
    }

    return placesRes.data.map((place: any) => {
      const summary = summaryMap.get(String(place.id));
      let cat = place.category;
      if (cat && cat.toLowerCase().includes('caf')) {
        cat = 'Cafés';
      }

      return {
        ...place,
        id: String(place.id),
        category: cat,
        tags: normalizeTags(place.tags),
        latitude: place.latitude !== null && place.latitude !== undefined ? Number(place.latitude) : null,
        longitude: place.longitude !== null && place.longitude !== undefined ? Number(place.longitude) : null,
        price_per_two: place.price_per_two !== null && place.price_per_two !== undefined ? Number(place.price_per_two) : null,
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
  const sample = SAMPLE_PLACES.find((p) => String(p.id) === String(id));

  if (!isSupabaseConfigured()) {
    return sample ? cleanPlace(sample) : null;
  }

  try {
    const [placeRes, summaryRes] = await Promise.all([
      supabase
        .from('places')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .single(),
      supabase
        .from('place_rating_summary')
        .select('*')
        .eq('place_id', id)
        .maybeSingle(),
    ]);

    if (placeRes.error || !placeRes.data) {
      return sample ? cleanPlace(sample) : null;
    }

    const place = placeRes.data;
    const summary = summaryRes.data as PlaceRatingSummary | null;

    let cat = place.category;
    if (cat && cat.toLowerCase().includes('caf')) {
      cat = 'Cafés';
    }

    return {
      ...place,
      id: String(place.id),
      category: cat,
      tags: normalizeTags(place.tags),
      latitude: place.latitude !== null && place.latitude !== undefined ? Number(place.latitude) : null,
      longitude: place.longitude !== null && place.longitude !== undefined ? Number(place.longitude) : null,
      price_per_two: place.price_per_two !== null && place.price_per_two !== undefined ? Number(place.price_per_two) : null,
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
