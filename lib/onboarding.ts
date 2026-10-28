export const WELCOME_KEY = 'vibespot_seen_welcome';
export const PREFS_KEY = 'vibespot_prefs';

export interface UserPrefs {
  foods: string[];
  mealTimes: string[];
  drinksAlcohol?: boolean | null;
  kidFriendly?: boolean | null;
}

export function getPrefs(): UserPrefs | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? (JSON.parse(raw) as UserPrefs) : null;
  } catch {
    return null;
  }
}
