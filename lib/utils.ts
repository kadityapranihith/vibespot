import type { Place } from '@/types';

/**
 * Format estimated price for two in Indian Rupees (₹)
 */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || isNaN(price)) return 'Price not listed';
  return `₹${price.toLocaleString('en-IN')}`;
}

/**
 * Format rating with one decimal point
 */
export function formatRating(rating: number | null | undefined): string {
  if (rating === null || rating === undefined || isNaN(rating)) return '—';
  return rating.toFixed(1);
}

/**
 * Compute composite average rating from price, ambience, and food quality
 */
export function getOverallRating(
  avgPrice: number | null | undefined,
  avgAmbience: number | null | undefined,
  avgFoodQuality: number | null | undefined
): number | null {
  const values = [avgPrice, avgAmbience, avgFoodQuality].filter(
    (v): v is number => v !== null && v !== undefined && !isNaN(v)
  );
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function getRatingLabel(rating: number | null): string {
  if (!rating) return 'Not yet rated';
  if (rating >= 4.5) return 'Exceptional';
  if (rating >= 4.0) return 'Very Good';
  if (rating >= 3.5) return 'Good';
  if (rating >= 3.0) return 'Average';
  return 'Below Average';
}

export function getRatingColor(rating: number | null): string {
  if (!rating) return 'bg-gray-100 text-gray-600';
  if (rating >= 4.0) return 'bg-emerald-500 text-white';
  if (rating >= 3.0) return 'bg-amber-500 text-white';
  return 'bg-rose-500 text-white';
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function extractAreaFromAddress(address: string): string {
  if (!address) return 'Kakinada';
  const parts = address.split(',').map((p) => p.trim());
  if (parts.length >= 3) {
    // Return area/neighborhood (e.g. "Surya Rao Peta" or "Bhanugudi Junction")
    const candidate = parts[parts.length - 3] || parts[parts.length - 2];
    return candidate.replace(/\b(India|Andhra Pradesh|\d{6})\b/gi, '').trim() || parts[0];
  }
  if (parts.length === 2) {
    return parts[0];
  }
  return address;
}

/**
 * Validate latitude and longitude coordinates
 */
export function isValidCoordinate(
  lat: number | null | undefined,
  lon: number | null | undefined
): boolean {
  if (lat === null || lat === undefined || lon === null || lon === undefined) return false;
  if (typeof lat !== 'number' || typeof lon !== 'number') return false;
  if (isNaN(lat) || isNaN(lon)) return false;
  // Kakinada is ~16.9°N, 82.2°E; general bounds:
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180 && !(lat === 0 && lon === 0);
}

/**
 * Calculate straight-line distance in kilometers using the Haversine formula
 * (Not driving distance or travel time)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format straight-line distance in kilometers or meters
 */
export function formatDistance(distanceKm: number | null | undefined): string | null {
  if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm)) return null;
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
}

/**
 * Normalize tags array from text[] or comma-separated string
 */
export function normalizeTags(tags: string[] | string | null | undefined): string[] {
  if (!tags) return [];
  const list = Array.isArray(tags)
    ? tags
    : typeof tags === 'string'
    ? tags.split(',')
    : [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of list) {
    let clean = String(item).trim();
    if (!clean) continue;
    // Normalize character quirks
    if (clean.toLowerCase() === 'cafe') clean = 'Café';
    if (clean.toLowerCase().includes('caf') && clean.toLowerCase().includes('hangout')) {
      clean = 'Café & Hangout';
    }
    if (!seen.has(clean.toLowerCase())) {
      seen.add(clean.toLowerCase());
      result.push(clean);
    }
  }

  return result;
}

/**
 * Extract all unique tags dynamically from a list of places
 */
export function extractUniqueTags(places: Place[]): string[] {
  const tagMap = new Map<string, string>(); // lower -> original casing

  for (const place of places) {
    const tags = normalizeTags(place.tags);
    for (const t of tags) {
      const lower = t.toLowerCase();
      if (!tagMap.has(lower)) {
        tagMap.set(lower, t);
      }
    }
  }

  return Array.from(tagMap.values()).sort((a, b) => a.localeCompare(b));
}

/**
 * Extract all unique categories dynamically from a list of places
 */
export function extractUniqueCategories(places: Place[]): string[] {
  const catSet = new Set<string>();
  for (const place of places) {
    if (place.category && place.category.trim()) {
      let cat = place.category.trim();
      if (cat.toLowerCase().includes('caf')) {
        cat = 'Cafés';
      }
      catSet.add(cat);
    }
  }
  return Array.from(catSet).sort((a, b) => a.localeCompare(b));
}

/**
 * Derive minimum and maximum price bounds from places
 */
export function getPriceBounds(places: Place[]): { min: number; max: number } {
  const prices = places
    .map((p) => p.price_per_two)
    .filter((p): p is number => typeof p === 'number' && !isNaN(p) && p > 0);

  if (prices.length === 0) return { min: 100, max: 2500 };
  return {
    min: Math.floor(Math.min(...prices) / 50) * 50,
    max: Math.ceil(Math.max(...prices) / 100) * 100,
  };
}

/**
 * Firebase Auth error messages
 */
export function getFirebaseErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again in a few moments.',
    'auth/popup-closed-by-user': 'Sign-in window was closed before completion.',
    'auth/popup-blocked': 'Sign-in popup was blocked by your browser. Please allow popups for this site.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'auth/operation-not-allowed': 'Email/Password sign-in is not enabled in Firebase Console. Go to Authentication > Sign-in method and enable Email/Password.',
    'auth/api-key-not-valid.': 'Firebase API key is invalid or restricted in Google Cloud Console. Check Firebase Project settings.',
    'auth/invalid-api-key': 'Firebase API key is invalid. Please verify the Web API Key in Firebase Project settings.',
    'auth/unauthorized-domain': 'This domain is not authorized in Firebase Console > Authentication > Settings > Authorized domains.',
  };
  return messages[code] || (code ? `Authentication error (${code}). Please check Firebase Console.` : 'An unexpected error occurred. Please try again.');
}
