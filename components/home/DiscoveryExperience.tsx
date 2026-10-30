'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  X,
  SlidersHorizontal,
  Navigation,
  RotateCcw,
  Sparkles,
  Compass,
  ArrowUpDown,
  Coffee,
  UtensilsCrossed,
  Soup,
  Flame,
  Cake,
  CupSoda,
  Check,
  AlertCircle,
  Filter,
} from 'lucide-react';
import type { Place, SortOption } from '@/types';
import { PlaceCard } from '@/components/place/PlaceCard';
import { FilterModal } from '@/components/home/FilterModal';
import { useUserLocation } from '@/lib/hooks/useUserLocation';
import {
  calculateDistanceKm,
  isValidCoordinate,
  extractUniqueTags,
  extractUniqueCategories,
  getPriceBounds,
  getOverallRating,
  formatPrice,
} from '@/lib/utils';

interface DiscoveryExperienceProps {
  initialPlaces: Place[];
}

export function DiscoveryExperience({ initialPlaces }: DiscoveryExperienceProps) {
  const searchParams = useSearchParams();
  const {
    location,
    status: locationStatus,
    errorMessage: locationError,
    requestLocation,
    refreshLocation,
  } = useUserLocation();

  // Dynamic bounds & options derived from real dataset
  const dynamicCategories = useMemo(
    () => ['All', ...extractUniqueCategories(initialPlaces)],
    [initialPlaces]
  );
  const allDynamicTags = useMemo(
    () => extractUniqueTags(initialPlaces),
    [initialPlaces]
  );
  const priceBounds = useMemo(
    () => getPriceBounds(initialPlaces),
    [initialPlaces]
  );

  // Pure vegetarian tag matcher
  const vegTag = useMemo(
    () =>
      allDynamicTags.find(
        (t) =>
          t.toLowerCase() === 'pure vegetarian' ||
          t.toLowerCase() === 'pure veg'
      ) || 'Pure Vegetarian',
    [allDynamicTags]
  );

  // Parse initial state from URL search params
  const paramSearch = searchParams.get('q') || searchParams.get('search') || '';
  const paramCategory = searchParams.get('category') || 'All';
  const paramTags = searchParams.get('tags')
    ? searchParams.get('tags')!.split(',').filter(Boolean)
    : [];
  const paramTagLogic = (searchParams.get('tagLogic') as 'OR' | 'AND') || 'OR';
  const paramMaxPrice = searchParams.get('maxPrice')
    ? Number(searchParams.get('maxPrice'))
    : priceBounds.max;
  const paramMinPrice = searchParams.get('minPrice')
    ? Number(searchParams.get('minPrice'))
    : priceBounds.min;
  const paramSort =
    (searchParams.get('sort') as SortOption) ||
    (location ? 'distance_asc' : 'default');

  // Filter States
  const [search, setSearch] = useState(paramSearch);
  const [category, setCategory] = useState(paramCategory);
  const [selectedTags, setSelectedTags] = useState<string[]>(paramTags);
  const [tagLogic, setTagLogic] = useState<'OR' | 'AND'>(paramTagLogic);
  const [minPrice, setMinPrice] = useState<number>(paramMinPrice);
  const [maxPrice, setMaxPrice] = useState<number>(paramMaxPrice);
  const [sortOption, setSortOption] = useState<SortOption>(paramSort);

  // Filter Modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Auto-switch to distance sorting when location is granted if user hasn't explicitly selected another sort
  useEffect(() => {
    if (location && sortOption === 'default') {
      setSortOption('distance_asc');
    }
  }, [location, sortOption]);

  // Apply URL parameters directly to state (independent shortcuts, no unintended intersections)
  const applyUrlFilters = useCallback((params: URLSearchParams) => {
    const newCat = params.get('category') || 'All';
    const newSearch = params.get('q') || params.get('search') || '';
    const newTags = params.get('tags') ? params.get('tags')!.split(',').filter(Boolean) : [];
    const newSort = (params.get('sort') as SortOption) || (location ? 'distance_asc' : 'default');
    const newMaxPrice = params.get('maxPrice') ? Number(params.get('maxPrice')) : priceBounds.max;
    const newMinPrice = params.get('minPrice') ? Number(params.get('minPrice')) : priceBounds.min;
    const newTagLogic = (params.get('tagLogic') as 'OR' | 'AND') || 'OR';

    setCategory(newCat);
    setSearch(newSearch);
    setSelectedTags(newTags);
    setSortOption(newSort);
    setMaxPrice(newMaxPrice);
    setMinPrice(newMinPrice);
    setTagLogic(newTagLogic);
  }, [location, priceBounds]);

  // Listen to custom header shortcut events & popstate (browser back/forward)
  useEffect(() => {
    const handleShortcut = (e: CustomEvent<string>) => {
      const url = new URL(e.detail, window.location.origin);
      applyUrlFilters(url.searchParams);
    };

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      applyUrlFilters(params);
    };

    window.addEventListener('vibespot:shortcut', handleShortcut as EventListener);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('vibespot:shortcut', handleShortcut as EventListener);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [applyUrlFilters]);

  // Sync state to URL search parameters for back-navigation preservation
  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (category !== 'All') params.set('category', category);
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    if (tagLogic !== 'OR') params.set('tagLogic', tagLogic);
    if (maxPrice < priceBounds.max) params.set('maxPrice', String(maxPrice));
    if (minPrice > priceBounds.min) params.set('minPrice', String(minPrice));
    if (sortOption !== (location ? 'distance_asc' : 'default')) params.set('sort', sortOption);

    const queryString = params.toString();
    const newUrl = queryString ? `/?${queryString}` : '/';

    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', newUrl);
    }
  }, [search, category, selectedTags, tagLogic, minPrice, maxPrice, sortOption, priceBounds, location]);

  // Current return query string to pass to PlaceCard for preserving filters
  const currentReturnQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (category !== 'All') params.set('category', category);
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    if (tagLogic !== 'OR') params.set('tagLogic', tagLogic);
    if (maxPrice < priceBounds.max) params.set('maxPrice', String(maxPrice));
    if (minPrice > priceBounds.min) params.set('minPrice', String(minPrice));
    if (sortOption !== (location ? 'distance_asc' : 'default')) params.set('sort', sortOption);
    return params.toString();
  }, [search, category, selectedTags, tagLogic, minPrice, maxPrice, sortOption, priceBounds, location]);

  // Tag selection toggler
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSearch('');
    setCategory('All');
    setSelectedTags([]);
    setMinPrice(priceBounds.min);
    setMaxPrice(priceBounds.max);
    setSortOption(location ? 'distance_asc' : 'default');
  };

  // Check if any non-default filters are active
  const hasActiveFilters =
    search.trim() !== '' ||
    category !== 'All' ||
    selectedTags.length > 0 ||
    maxPrice < priceBounds.max ||
    minPrice > priceBounds.min ||
    sortOption !== (location ? 'distance_asc' : 'default');

  // Count active modal filters (tags, price range, non-default sort)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedTags.length > 0) count += selectedTags.length;
    if (maxPrice < priceBounds.max || minPrice > priceBounds.min) count += 1;
    if (sortOption !== (location ? 'distance_asc' : 'default')) count += 1;
    return count;
  }, [selectedTags, maxPrice, minPrice, priceBounds, sortOption, location]);

  // Filter & Sort calculation
  const processedPlaces = useMemo(() => {
    // 1. Calculate distance for each place if user location is available
    let list: Place[] = initialPlaces.map((p) => {
      let distanceKm: number | null = null;
      if (
        location &&
        isValidCoordinate(p.latitude, p.longitude) &&
        isValidCoordinate(location.latitude, location.longitude)
      ) {
        distanceKm = calculateDistanceKm(
          location.latitude,
          location.longitude,
          p.latitude!,
          p.longitude!
        );
      }
      return {
        ...p,
        distanceKm,
      };
    });

    // 2. Search filter (Name, Address, Category, Tags)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => {
        const matchName = p.name.toLowerCase().includes(q);
        const matchAddr = p.address.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        const matchTags = (p.tags || []).some((t) => t.toLowerCase().includes(q));
        return matchName || matchAddr || matchCat || matchTags;
      });
    }

    // 3. Category filter
    if (category !== 'All') {
      list = list.filter((p) => p.category === category);
    }

    // 4. Tag filters (with OR / AND logic)
    if (selectedTags.length > 0) {
      list = list.filter((p) => {
        const placeTags = p.tags || [];
        if (tagLogic === 'AND') {
          return selectedTags.every((st) => placeTags.includes(st));
        }
        return selectedTags.some((st) => placeTags.includes(st));
      });
    }

    // 5. Price-for-two filter
    if (maxPrice < priceBounds.max || minPrice > priceBounds.min) {
      list = list.filter((p) => {
        if (p.price_per_two === null || p.price_per_two === undefined) {
          return false;
        }
        return p.price_per_two >= minPrice && p.price_per_two <= maxPrice;
      });
    }

    // 6. Sorting
    const sorted = [...list];
    if (sortOption === 'distance_asc') {
      sorted.sort((a, b) => {
        const hasA = a.distanceKm !== null && a.distanceKm !== undefined;
        const hasB = b.distanceKm !== null && b.distanceKm !== undefined;
        if (hasA && hasB) return a.distanceKm! - b.distanceKm!;
        if (hasA && !hasB) return -1;
        if (!hasA && hasB) return 1;
        return a.name.localeCompare(b.name);
      });
    } else if (sortOption === 'rating_desc') {
      sorted.sort((a, b) => {
        const ratingA = getOverallRating(a.avg_food_quality, a.avg_ambience, a.avg_price_rating) || 0;
        const ratingB = getOverallRating(b.avg_food_quality, b.avg_ambience, b.avg_price_rating) || 0;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return (b.rating_count || 0) - (a.rating_count || 0);
      });
    } else if (sortOption === 'price_asc') {
      sorted.sort((a, b) => {
        const priceA = a.price_per_two ?? 999999;
        const priceB = b.price_per_two ?? 999999;
        return priceA - priceB;
      });
    } else if (sortOption === 'price_desc') {
      sorted.sort((a, b) => {
        const priceA = a.price_per_two ?? 0;
        const priceB = b.price_per_two ?? 0;
        return priceB - priceA;
      });
    } else if (sortOption === 'name_asc') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    return sorted;
  }, [
    initialPlaces,
    location,
    search,
    category,
    selectedTags,
    tagLogic,
    minPrice,
    maxPrice,
    sortOption,
    priceBounds,
  ]);

  // Category Icon Resolver
  const getCategoryIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c === 'all') return Sparkles;
    if (c.includes('caf')) return Coffee;
    if (c.includes('bakeries') || c.includes('dessert') || c.includes('sweets')) return Cake;
    if (c.includes('tiffin') || c.includes('breakfast')) return Flame;
    if (c.includes('tea') || c.includes('juice')) return CupSoda;
    if (c.includes('dining') || c.includes('family')) return Soup;
    return UtensilsCrossed;
  };

  return (
    <div className="w-full">
      {/* ========================================================= */}
      {/* SECTION B: HERO SECTION                                   */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/70 via-amber-50/30 to-transparent pt-10 pb-8 sm:pt-14 sm:pb-12 border-b border-orange-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.1]">
              Find your next <br className="hidden sm:block" />
              <span className="text-orange-600 logo-script font-bold">favourite food spot</span> in Kakinada.
            </h1>

            {/* Prominent Search Field */}
            <div className="mt-6 sm:mt-7 relative max-w-2xl mx-auto">
              <div className="relative flex items-center bg-white rounded-2xl shadow-md shadow-orange-500/5 border border-stone-200 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all">
                <Search size={20} className="text-stone-400 ml-4 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search spots by name, area (e.g. Bhanugudi), category, or cravings..."
                  className="w-full py-3.5 sm:py-4 pl-3 pr-10 bg-transparent text-sm sm:text-base text-stone-900 placeholder-stone-400 focus:outline-none"
                  aria-label="Search restaurants in Kakinada"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="p-2 mr-2 text-stone-400 hover:text-stone-600"
                    aria-label="Clear search query"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Geolocation Banner / CTA */}
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs">
              {locationStatus === 'granted' && location ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                  <Navigation size={13} className="text-emerald-600 rotate-45" />
                  <span>
                    Location active • Places sorted by nearest distance
                  </span>
                  <button
                    onClick={() => refreshLocation()}
                    className="ml-1 text-emerald-700 underline hover:text-emerald-900 font-bold"
                    title="Recalculate location"
                  >
                    Refresh
                  </button>
                </div>
              ) : locationStatus === 'denied' ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                  <AlertCircle size={13} className="text-amber-600" />
                  <span>Location access denied in browser. Displaying default order.</span>
                  <button
                    onClick={() => requestLocation(true)}
                    className="ml-1 text-amber-900 underline font-bold"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => requestLocation()}
                  disabled={locationStatus === 'requesting'}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-bold transition-all shadow-xs group hover:scale-[1.02]"
                >
                  <Navigation
                    size={13}
                    className={`text-orange-400 rotate-45 group-hover:text-orange-300 ${
                      locationStatus === 'requesting' ? 'animate-spin' : ''
                    }`}
                  />
                  <span>
                    {locationStatus === 'requesting'
                      ? 'Detecting coordinates...'
                      : 'Sort by Nearest (Use GPS)'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Discovery Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        {/* ========================================================= */}
        {/* SLEEK CATEGORY & FILTER TOOLBAR                            */}
        {/* ========================================================= */}
        <section className="mb-6 space-y-3">
          {/* Main Controls Row: Filter Button + Category chips + Quick shortcuts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {/* 1. Sleek Filter Modal Trigger Button */}
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 border shadow-xs ${
                activeFilterCount > 0
                  ? 'bg-stone-900 text-white border-stone-900 shadow-stone-900/15 scale-[1.02]'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-200'
              }`}
              aria-label="Open filter options"
            >
              <SlidersHorizontal
                size={14}
                className={activeFilterCount > 0 ? 'text-orange-400' : 'text-orange-600'}
              />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-[10px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="h-6 w-px bg-stone-200 shrink-0 mx-0.5" />

            {/* 2. Category Chips Carousel */}
            {dynamicCategories.map((cat) => {
              const isSelected = category === cat;
              const Icon = getCategoryIcon(cat);
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                    isSelected
                      ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/25 scale-[1.02]'
                      : 'bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-900 border border-stone-200'
                  }`}
                  aria-pressed={isSelected}
                >
                  <Icon
                    size={13}
                    className={isSelected ? 'text-white' : 'text-orange-500'}
                  />
                  <span>{cat}</span>
                </button>
              );
            })}

            <div className="h-6 w-px bg-stone-200 shrink-0 mx-0.5" />

            {/* 3. Quick 1-Tap Filter Pills */}
            <button
              onClick={() => toggleTag(vegTag)}
              className={`inline-flex items-center gap-1 px-3.5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 border ${
                selectedTags.includes(vegTag)
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200'
              }`}
            >
              <span>🌱 Pure Veg</span>
            </button>

            <button
              onClick={() => {
                if (maxPrice === 400 && minPrice === priceBounds.min) {
                  setMaxPrice(priceBounds.max);
                } else {
                  setMinPrice(priceBounds.min);
                  setMaxPrice(400);
                }
              }}
              className={`inline-flex items-center gap-1 px-3.5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 border ${
                maxPrice === 400 && minPrice === priceBounds.min
                  ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200'
              }`}
            >
              <span>💰 Under ₹400</span>
            </button>

            <button
              onClick={() => {
                if (sortOption === 'rating_desc') {
                  setSortOption(location ? 'distance_asc' : 'default');
                } else {
                  setSortOption('rating_desc');
                }
              }}
              className={`inline-flex items-center gap-1 px-3.5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 border ${
                sortOption === 'rating_desc'
                  ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200'
              }`}
            >
              <span>⭐ Top Rated</span>
            </button>
          </div>

          {/* Active Summary Badges (Only displayed when any filters are active) */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-1">
                Active:
              </span>
              {search && (
                <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg font-medium">
                  Search: &quot;{search}&quot;
                  <button onClick={() => setSearch('')} className="hover:text-stone-900">
                    <X size={12} />
                  </button>
                </span>
              )}
              {category !== 'All' && (
                <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-2.5 py-1 rounded-lg font-medium">
                  {category}
                  <button onClick={() => setCategory('All')} className="hover:text-orange-950">
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-stone-800 text-white px-2.5 py-1 rounded-lg font-medium"
                >
                  {tag}
                  <button onClick={() => toggleTag(tag)} className="hover:text-stone-300">
                    <X size={12} />
                  </button>
                </span>
              ))}
              {(maxPrice < priceBounds.max || minPrice > priceBounds.min) && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg font-medium">
                  {minPrice > priceBounds.min ? `${formatPrice(minPrice)} – ` : 'Up to '}
                  {formatPrice(maxPrice)}
                  <button
                    onClick={() => {
                      setMinPrice(priceBounds.min);
                      setMaxPrice(priceBounds.max);
                    }}
                    className="hover:text-amber-950"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {sortOption !== (location ? 'distance_asc' : 'default') && (
                <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-800 px-2.5 py-1 rounded-lg font-medium">
                  Sorted:{' '}
                  {sortOption === 'rating_desc'
                    ? 'Top Rated'
                    : sortOption === 'price_asc'
                    ? 'Price: Low-High'
                    : sortOption === 'price_desc'
                    ? 'Price: High-Low'
                    : 'A-Z'}
                  <button
                    onClick={() => setSortOption(location ? 'distance_asc' : 'default')}
                    className="hover:text-sky-950"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}
        </section>

        {/* Results Header: Count & Sort Quick Selector */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
            {processedPlaces.length}{' '}
            <span className="font-semibold text-stone-500 text-sm sm:text-base">
              {processedPlaces.length === 1 ? 'spot found' : 'spots to explore'}
            </span>
          </h2>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-stone-400 hidden sm:inline">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-700 focus:outline-none shadow-2xs cursor-pointer"
            >
              {location && (
                <option value="distance_asc">📍 Nearest First</option>
              )}
              <option value="default">✨ Recommended</option>
              <option value="rating_desc">⭐ Top Rated</option>
              <option value="price_asc">💰 Budget (Low-High)</option>
              <option value="price_desc">💎 Premium (High-Low)</option>
              <option value="name_asc">🔤 A to Z</option>
            </select>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION E: RESTAURANT DISCOVERY LIST (RESPONSIVE GRID)     */}
        {/* ========================================================= */}
        {processedPlaces.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                userCoords={location}
                returnQuery={currentReturnQuery}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-stone-200 p-10 sm:p-14 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
              <Search size={24} />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              No matching spots found
            </h3>
            <p className="text-sm text-stone-500 mb-6 leading-relaxed">
              We couldn&apos;t find any restaurants matching your combination of filters. Try clearing tags, expanding your price budget, or broadening your search terms.
            </p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-sm shadow-orange-500/20"
            >
              <RotateCcw size={14} />
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Filter Modal Sheet */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        sortOption={sortOption}
        setSortOption={setSortOption}
        hasLocation={Boolean(location)}
        minPrice={minPrice}
        maxPrice={maxPrice}
        setMinPrice={setMinPrice}
        setMaxPrice={setMaxPrice}
        priceBounds={priceBounds}
        selectedTags={selectedTags}
        toggleTag={toggleTag}
        setSelectedTags={setSelectedTags}
        tagLogic={tagLogic}
        setTagLogic={setTagLogic}
        allDynamicTags={allDynamicTags}
        resultsCount={processedPlaces.length}
        resetFilters={resetFilters}
        activeFilterCount={activeFilterCount}
      />
    </div>
  );
}
