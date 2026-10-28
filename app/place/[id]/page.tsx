import { notFound } from 'next/navigation';
import { getPlaceById } from '@/lib/supabase/queries';
import { PlaceDetailClient } from '@/components/place/PlaceDetailClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const place = await getPlaceById(id);
  if (!place) return { title: 'Spot Not Found — Vibespot Kakinada' };
  return {
    title: `${place.name} — Vibespot Kakinada`,
    description: `Discover ${place.name}, ${place.category} in Kakinada. Price for two: ₹${place.price_per_two || 'N/A'}.`,
  };
}

export default async function PlaceDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sParams = await searchParams;
  const place = await getPlaceById(id);
  if (!place) notFound();

  // Convert searchParams back to query string for preserving active filters on return
  const qList: string[] = [];
  for (const [k, v] of Object.entries(sParams || {})) {
    if (typeof v === 'string') {
      qList.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    } else if (Array.isArray(v)) {
      qList.push(`${encodeURIComponent(k)}=${encodeURIComponent(v.join(','))}`);
    }
  }
  const returnQuery = qList.join('&');

  return <PlaceDetailClient place={place} returnQuery={returnQuery} />;
}
