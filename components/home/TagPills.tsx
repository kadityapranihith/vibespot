'use client';

import { useRouter } from 'next/navigation';

interface TagPillsProps {
  tags?: string[];
  selectedTags?: string[];
  onToggleTag?: (tag: string) => void;
}

export function TagPills({
  tags = [],
  selectedTags = [],
  onToggleTag,
}: TagPillsProps) {
  const router = useRouter();

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
      aria-label="Browse by vibe"
    >
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag);
        return (
          <button
            key={tag}
            onClick={() => {
              if (onToggleTag) {
                onToggleTag(tag);
              } else {
                router.push(`/?tags=${encodeURIComponent(tag)}`);
              }
            }}
            className={`flex-shrink-0 flex items-center gap-1.5 border text-xs font-semibold px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
              isSelected
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
            aria-pressed={isSelected}
            aria-label={`Filter by ${tag}`}
          >
            <span>{tag}</span>
          </button>
        );
      })}
    </div>
  );
}
