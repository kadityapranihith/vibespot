'use client';

import { useState, useEffect } from 'react';
import {
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  RotateCcw,
  Check,
  Search,
  DollarSign,
  Compass,
} from 'lucide-react';
import { SortOption } from '@/types';
import { formatPrice } from '@/lib/utils';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  sortOption: SortOption;
  setSortOption: (s: SortOption) => void;
  hasLocation: boolean;
  minPrice: number;
  maxPrice: number;
  setMinPrice: (n: number) => void;
  setMaxPrice: (n: number) => void;
  priceBounds: { min: number; max: number };
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  setSelectedTags: (tags: string[]) => void;
  tagLogic: 'OR' | 'AND';
  setTagLogic: (l: 'OR' | 'AND') => void;
  allDynamicTags: string[];
  resultsCount: number;
  resetFilters: () => void;
  activeFilterCount: number;
}

export function FilterModal({
  isOpen,
  onClose,
  sortOption,
  setSortOption,
  hasLocation,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  priceBounds,
  selectedTags,
  toggleTag,
  setSelectedTags,
  tagLogic,
  setTagLogic,
  allDynamicTags,
  resultsCount,
  resetFilters,
  activeFilterCount,
}: FilterModalProps) {
  const [tagSearch, setTagSearch] = useState('');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter tags by search
  const filteredTags = tagSearch.trim()
    ? allDynamicTags.filter((t) =>
        t.toLowerCase().includes(tagSearch.trim().toLowerCase())
      )
    : allDynamicTags;

  const sortChoices: { id: SortOption; label: string; icon: string }[] = [
    { id: 'default', label: 'Recommended', icon: '✨' },
    ...(hasLocation
      ? [{ id: 'distance_asc' as SortOption, label: 'Nearest Distance (GPS)', icon: '📍' }]
      : []),
    { id: 'rating_desc', label: 'Highest Rated', icon: '⭐' },
    { id: 'price_asc', label: 'Price: Low to High', icon: '💰' },
    { id: 'price_desc', label: 'Price: High to Low', icon: '💎' },
    { id: 'name_asc', label: 'Alphabetical (A-Z)', icon: '🔤' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-xl max-h-[90vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-stone-100 flex items-center justify-between shrink-0 bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-stone-900">
                Filter & Refine
              </h3>
              <p className="text-xs text-stone-500">
                Customize budget, vibes, and order
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
            aria-label="Close filters"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Filter Controls */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-stone-800">
          {/* SECTION 1: SORT BY */}
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <ArrowUpDown size={14} className="text-orange-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Sort Order
              </h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {sortChoices.map((choice) => {
                const isSelected = sortOption === choice.id;
                return (
                  <button
                    key={choice.id}
                    onClick={() => setSortOption(choice.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-left flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs scale-[1.01]'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200/80'
                    }`}
                  >
                    <span>{choice.icon}</span>
                    <span className="truncate">{choice.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: PRICE FOR TWO */}
          <div className="pt-4 border-t border-stone-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <DollarSign size={14} className="text-orange-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Price for Two
                </h4>
              </div>
              <span className="text-xs font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200/60">
                {maxPrice >= priceBounds.max && minPrice <= priceBounds.min
                  ? `Any price (up to ${formatPrice(priceBounds.max)})`
                  : `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`}
              </span>
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

            {/* Price Presets */}
            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
              {[
                { label: 'All Budgets', max: priceBounds.max },
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
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    maxPrice === preset.max && minPrice === priceBounds.min
                      ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                      : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-stone-500 mt-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
              <span>Estimated value based on 2 main courses + 1 starter + 2 beverages.</span>
            </p>
          </div>

          {/* SECTION 3: VIBE & DIETARY PREFERENCES */}
          <div className="pt-4 border-t border-stone-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-orange-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Vibes & Dietary Tags
                </h4>
              </div>

              {/* Tag Match Logic (ANY / ALL) */}
              <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg text-[10px]">
                <button
                  type="button"
                  onClick={() => setTagLogic('OR')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                    tagLogic === 'OR'
                      ? 'bg-white text-orange-600 shadow-2xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                  title="Places matching ANY selected tag"
                >
                  ANY (OR)
                </button>
                <button
                  type="button"
                  onClick={() => setTagLogic('AND')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                    tagLogic === 'AND'
                      ? 'bg-white text-orange-600 shadow-2xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                  title="Places matching ALL selected tags"
                >
                  ALL (AND)
                </button>
              </div>
            </div>

            {/* Tag Search Input */}
            <div className="mb-3 relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="text"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder="Search tags (e.g. Pure Veg, AC, Late Night, Mandi)..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-orange-500 text-stone-800"
              />
            </div>

            {/* Tag Chips Grid */}
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1 bg-stone-50/70 rounded-2xl border border-stone-200/70">
              {filteredTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all select-none ${
                      isSelected
                        ? 'bg-stone-900 text-white shadow-2xs'
                        : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200/80'
                    }`}
                  >
                    {isSelected && (
                      <Check size={11} className="text-orange-400 stroke-[3]" />
                    )}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer / Apply Bar */}
        <div className="p-4 sm:p-5 bg-white border-t border-stone-100 flex items-center justify-between gap-3 shrink-0 shadow-xs">
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-bold text-stone-500 hover:text-rose-600 px-3 py-2 transition-colors flex items-center gap-1"
          >
            <RotateCcw size={13} />
            <span>Reset All</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-sm shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
          >
            <span>Show {resultsCount} {resultsCount === 1 ? 'Place' : 'Places'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

