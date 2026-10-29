'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  X,
  SlidersHorizontal,
  Navigation,
  RotateCcw,
  Sparkles,
  MapPin,
  Compass,
  ArrowUpDown,
  Coffee,
  UtensilsCrossed,
  Soup,
  Flame,
  Cake,
  CupSoda,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Filter,
} from 'lucide-react';
import type { Place, SortOption } from '@/types';
import { PlaceCard } from '@/components/place/PlaceCard';
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

  // Curated prominent tags (standardized vibe tags first)
  const popularVibeTags = useMemo(() => {
    const priority = [
      'Student-Friendly',
      'Budget-Friendly',
      'Café & Hangout',
      'Pure Vegetarian',
      'Non-Veg Options',
      'Biryani & Rice',
      'Burgers & Fast Food',
      'Buffet & Grills',
      'South Indian & Tiffin',
      'Tea & Coffee',
      'Bakery & Desserts',
      'Quick Snacks & Street Food',
      'Pizza',
    ];
    const availablePriority = priority.filter((p) => allDynamicTags.includes(p));
    const remainder = allDynamicTags.filter((t) => !priority.includes(t));
    return [...availablePriority, ...remainder];
  }, [allDynamicTags]);

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
  const paramSort = (searchParams.get('sort') as SortOption) || 'default';

  // Filter States
  const [search, setSearch] = useState(paramSearch);
  const [category, setCategory] = useState(paramCategory);
  const [selectedTags, setSelectedTags] = useState<string[]>(paramTags);
  const [tagLogic, setTagLogic] = useState<'OR' | 'AND'>(paramTagLogic);
  const [minPrice, setMinPrice] = useState<number>(paramMinPrice);
  const [maxPrice, setMaxPrice] = useState<number>(paramMaxPrice);
  const [sortOption, setSortOption] = useState<SortOption>(paramSort);

  // Compact tag expansion state
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);
  const [tagSearchInput, setTagSearchInput] = useState('');

  // Auto-switch to distance sorting when location is granted if user hasn't explicitly selected another sort
  useEffect(() => {
    if (location && sortOption === 'default') {
      setSortOption('distance_asc');
    }
  }, [location, sortOption]);

  // Synchronize state when URL searchParams change (e.g. clicking header shortcut links)
  useEffect(() => {
    const newCat = searchParams.get('category') || 'All';
    const newSearch = searchParams.get('q') || searchParams.get('search') || '';
    const newTags = searchParams.get('tags') ? searchParams.get('tags')!.split(',').filter(Boolean) : [];
    const newSort = (searchParams.get('sort') as SortOption) || (location ? 'distance_asc' : 'default');
    const newMaxP = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : priceBounds.max;

    setCategory(newCat);
    setSearch(newSearch);
    setSelectedTags(newTags);
    if (searchParams.get('sort')) setSortOption(newSort);
    if (searchParams.get('maxPrice')) setMaxPrice(newMaxP);
  }, [searchParams, location, priceBounds.max]);

  // Sync state to URL search parameters for back-navigation preservation
  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (category !== 'All') params.set('category', category);
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    if (tagLogic !== 'OR') params.set('tagLogic', tagLogic);
    if (maxPrice < priceBounds.max) params.set('maxPrice', String(maxPrice));
    if (minPrice > priceBounds.min) params.set('minPrice', String(minPrice));
    if (sortOption !== 'default') params.set('sort', sortOption);

    const queryString = params.toString();
    const newUrl = queryString ? `/?${queryString}` : '/';

    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', newUrl);
    }
  }, [search, category, selectedTags, tagLogic, minPrice, maxPrice, sortOption, priceBounds]);

  // Current return query string to pass to PlaceCard for preserving filters
  const currentReturnQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (category !== 'All') params.set('category', category);
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    if (tagLogic !== 'OR') params.set('tagLogic', tagLogic);
    if (maxPrice < priceBounds.max) params.set('maxPrice', String(maxPrice));
    if (minPrice > priceBounds.min) params.set('minPrice', String(minPrice));
    if (sortOption !== 'default') params.set('sort', sortOption);
    return params.toString();
  }, [search, category, selectedTags, tagLogic, minPrice, maxPrice, sortOption, priceBounds]);

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
    setTagSearchInput('');
  };

  // Check if any non-default filters are active
  const hasActiveFilters =
    search.trim() !== '' ||
    category !== 'All' ||
    selectedTags.length > 0 ||
    maxPrice < priceBounds.max ||
    minPrice > priceBounds.min;

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
    } else if (sortOption === 'price_asc') {
      sorted.sort((a, b) => {
        const pA = a.price_per_two ?? Infinity;
        const pB = b.price_per_two ?? Infinity;
        return pA - pB;
      });
    } else if (sortOption === 'price_desc') {
      sorted.sort((a, b) => {
        const pA = a.price_per_two ?? -1;
        const pB = b.price_per_two ?? -1;
        return pB - pA;
      });
    } else if (sortOption === 'rating_desc') {
      sorted.sort((a, b) => {
        const rA =
          getOverallRating(a.avg_price_rating, a.avg_ambience, a.avg_food_quality) ?? 0;
        const rB =
          getOverallRating(b.avg_price_rating, b.avg_ambience, b.avg_food_quality) ?? 0;
        return rB - rA;
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

  // Compact tag view: show first 12 tags + selected tags when collapsed; show full search list when expanded
  const displayedTags = useMemo(() => {
    if (isTagsExpanded) {
      if (!tagSearchInput.trim()) return allDynamicTags;
      return allDynamicTags.filter((t) =>
        t.toLowerCase().includes(tagSearchInput.trim().toLowerCase())
      );
    }
    // Collapsed: show top 13 vibe tags + any currently selected tags that are not in top 13
    const top = popularVibeTags.slice(0, 13);
    const extraSelected = selectedTags.filter((t) => !top.includes(t));
    return [...top, ...extraSelected];
  }, [isTagsExpanded, tagSearchInput, allDynamicTags, popularVibeTags, selectedTags]);

  return (
    <div className="w-full">
      {/* ========================================================= */}
      {/* SECTION B: HERO SECTION                                   */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/70 via-amber-50/30 to-transparent pt-10 pb-8 sm:pt-14 sm:pb-12 border-b border-orange-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            {/* City indicator badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-orange-700 text-xs font-bold border border-orange-200/80 shadow-xs mb-4">
              <MapPin size={13} className="text-orange-500 fill-orange-500" />
              <span>Kakinada, Andhra Pradesh</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.1]">
              Find your next <br className="hidden sm:block" />
              <span className="text-orange-600 logo-script font-bold">favourite spot</span> in Kakinada.
            </h1>

            <p className="mt-3 sm:mt-4 text-stone-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Explore 54 curated restaurants, cafés, and quick bites in Kakinada. Filter by budget, ambience, dietary preferences, and straight-line distance.
            </p>

            {/* Prominent Search Field */}
            <div className="mt-6 sm:mt-8 relative max-w-2xl mx-auto">
              <div className="relative flex items-center bg-white rounded-2xl shadow-md shadow-orange-500/5 border border-stone-200 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all">
                <Search size={20} className="text-stone-400 ml-4 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search spots by name, area (e.g. Bhanugudi), category, or cravings..."
                  className="w-full py-4 pl-3 pr-10 bg-transparent text-sm sm:text-base text-stone-900 placeholder-stone-400 focus:outline-none"
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
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              {locationStatus === 'granted' && location ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                  <Navigation size={13} className="text-emerald-600 rotate-45" />
                  <span>
                    Location active • Places sorted by straight-line distance
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
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-bold transition-all shadow-sm group hover:scale-[1.02]"
                >
                  <Navigation
                    size={14}
                    className={`text-orange-400 rotate-45 group-hover:text-orange-300 ${
                      locationStatus === 'requesting' ? 'animate-spin' : ''
                    }`}
                  />
                  <span>
                    {locationStatus === 'requesting'
                      ? 'Detecting your coordinates...'
                      : 'Sort by Nearest (Use My Location)'}
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
        {/* SECTION C: DYNAMIC CATEGORY FILTERS                       */}
        {/* ========================================================= */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Browse by Category
            </h2>
            {category !== 'All' && (
              <button
                onClick={() => setCategory('All')}
                className="text-xs font-bold text-orange-600 hover:text-orange-700"
              >
                Reset to All
              </button>
            )}
          </div>

          {/* Horizontally scrollable category chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {dynamicCategories.map((cat) => {
              const isSelected = category === cat;
              const Icon = getCategoryIcon(cat);
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
                    isSelected
                      ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/25 scale-[1.02]'
                      : 'bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-900 border border-stone-200'
                  }`}
                  aria-pressed={isSelected}
                >
                  <Icon
                    size={14}
                    className={isSelected ? 'text-white' : 'text-orange-500'}
                  />
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION D: COMPACT & ORGANIZED TAG FILTERS                */}
        {/* ========================================================= */}
        <section className="mb-8 p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Filter by Vibe & Diet
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                {allDynamicTags.length} tags
              </span>
            </div>

            {/* Tag Logic Selector (OR default) + Clear tags */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
                <span className="text-[11px] font-medium text-stone-500 pl-1">Match:</span>
                <button
                  onClick={() => setTagLogic('OR')}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
                    tagLogic === 'OR'
                      ? 'bg-white text-orange-600 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Show places matching ANY of the selected tags"
                >
                  ANY (OR)
                </button>
                <button
                  onClick={() => setTagLogic('AND')}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
                    tagLogic === 'AND'
                      ? 'bg-white text-orange-600 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Show places matching ALL selected tags"
                >
                  ALL (AND)
                </button>
              </div>

              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="font-bold text-orange-600 hover:text-orange-700 transition-colors"
                >
                  Clear tags ({selectedTags.length})
                </button>
              )}
            </div>
          </div>

          {/* Quick search when expanded */}
          {isTagsExpanded && (
            <div className="mb-3 relative max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={tagSearchInput}
                onChange={(e) => setTagSearchInput(e.target.value)}
                placeholder="Search specific tags (e.g. Mandi, Chinese)..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-orange-500 text-stone-800"
              />
            </div>
          )}

          {/* Compact Chips Grid */}
          <div className="flex flex-wrap gap-1.5">
            {displayedTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-stone-900'
                  }`}
                  aria-pressed={isSelected}
                >
                  {isSelected && <Check size={12} className="text-orange-400 stroke-[3]" />}
                  <span>{tag}</span>
                </button>
              );
            })}

            {/* Expand / Collapse Toggle Button */}
            <button
              onClick={() => {
                setIsTagsExpanded(!isTagsExpanded);
                if (isTagsExpanded) setTagSearchInput('');
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors select-none"
            >
              {isTagsExpanded ? (
                <>
                  <span>Show fewer</span>
                  <ChevronUp size={13} />
                </>
              ) : (
                <>
                  <span>+ {allDynamicTags.length - 13} more tags</span>
                  <ChevronDown size={13} />
                </>
              )}
            </button>
          </div>

          <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span>
              {tagLogic === 'OR'
                ? '💡 Matching spots have at least one of your selected tags.'
                : '💡 Matching spots must have all of your selected tags.'}
            </span>
            <span className="font-semibold text-stone-600">
              {selectedTags.length} selected
            </span>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 5: PRICE-FOR-TWO & DISCOVERY CONTROLS ROW        */}
        {/* ========================================================= */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
          {/* Price-for-two filter */}
          <div className="flex-1 max-w-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Price for two
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                  {maxPrice >= priceBounds.max && minPrice <= priceBounds.min
                    ? `Any price (up to ${formatPrice(priceBounds.max)})`
                    : `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`}
                </span>
                {(maxPrice < priceBounds.max || minPrice > priceBounds.min) && (
                  <button
                    onClick={() => {
                      setMinPrice(priceBounds.min);
                      setMaxPrice(priceBounds.max);
                    }}
                    className="text-stone-400 hover:text-stone-600 text-xs font-bold"
                    title="Reset price range"
                  >
                    <RotateCcw size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Slider */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold text-stone-400">
                {formatPrice(priceBounds.min)}
              </span>
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                aria-label="Filter maximum price for two"
              />
              <span className="text-[11px] font-semibold text-stone-400">
                {formatPrice(priceBounds.max)}
              </span>
            </div>

            {/* Quick Price Preset Chips */}
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              {[
                { label: 'All', max: priceBounds.max },
                { label: 'Under ₹400', max: 400 },
                { label: 'Under ₹750', max: 750 },
                { label: 'Under ₹1,200', max: 1200 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setMinPrice(priceBounds.min);
                    setMaxPrice(preset.max);
                  }}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-all ${
                    maxPrice === preset.max && minPrice === priceBounds.min
                      ? 'bg-orange-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sorting Dropdown & Results Counter */}
          <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-stone-100 pt-3 md:pt-0 md:pl-5">
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label
                htmlFor="sort-select"
                className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1"
              >
                <ArrowUpDown size={12} />
                Sort By
              </label>
              <select
                id="sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                {location && (
                  <option value="distance_asc">📍 Nearest Distance (GPS)</option>
                )}
                <option value="default">✨ Recommended</option>
                <option value="rating_desc">⭐ Highest Rated</option>
                <option value="price_asc">💰 Price: Low to High</option>
                <option value="price_desc">💎 Price: High to Low</option>
                <option value="name_asc">🔤 Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Header: Active Filter Pills & Results Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {processedPlaces.length}{' '}
              <span className="font-semibold text-stone-500 text-base sm:text-lg">
                {processedPlaces.length === 1 ? 'place to explore' : 'places to explore'}
              </span>
            </h2>

            {/* Clear all active filters button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors ml-2"
              >
                <X size={12} />
                Reset all
              </button>
            )}
          </div>

          {/* Active summary badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {search && (
                <span className="inline-flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-md font-medium text-stone-700">
                  Search: &quot;{search}&quot;
                  <button onClick={() => setSearch('')}><X size={12} /></button>
                </span>
              )}
              {category !== 'All' && (
                <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-2.5 py-1 rounded-md font-medium">
                  {category}
                  <button onClick={() => setCategory('All')}><X size={12} /></button>
                </span>
              )}
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-stone-800 text-white px-2.5 py-1 rounded-md font-medium"
                >
                  {tag}
                  <button onClick={() => toggleTag(tag)}><X size={12} /></button>
                </span>
              ))}
              {maxPrice < priceBounds.max && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md font-medium">
                  Up to {formatPrice(maxPrice)}
                  <button onClick={() => setMaxPrice(priceBounds.max)}><X size={12} /></button>
                </span>
              )}
            </div>
          )}
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
    </div>
  );
}
