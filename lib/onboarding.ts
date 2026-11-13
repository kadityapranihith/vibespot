export const WELCOME_KEY = 'whystayin_seen_welcome';
export const PREFS_KEY = 'whystayin_prefs';

export interface UserPrefs {
  foods: string[];
  mealTimes: string[];
  drinksAlcohol?: boolean | null;
  kidFriendly?: boolean | null;
}

export function getPrefs(): UserPrefs | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PREFS_KEY) || localStorage.getItem('vibespot_prefs');
    return raw ? (JSON.parse(raw) as UserPrefs) : null;
  } catch {
    return null;
  }
}
