import { Suspense } from 'react';
import { getPublishedPlaces } from '@/lib/supabase/queries';
import { DiscoveryExperience } from '@/components/home/DiscoveryExperience';
import { PlaceCardSkeleton } from '@/components/ui/LoadingSkeleton';

export const dynamic = 'force-dynamic';

function BrowseLoadingFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="animate-pulse space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-10">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <PlaceCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function BrowsePage() {
  const places = await getPublishedPlaces();

  return (
    <Suspense fallback={<BrowseLoadingFallback />}>
      <DiscoveryExperience initialPlaces={places} />
    </Suspense>
  );
}
