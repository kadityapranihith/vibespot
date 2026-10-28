'use client';

import { RatingForm } from './RatingForm';

interface RatingFormWrapperProps {
  placeId: string;
}

export function RatingFormWrapper({ placeId }: RatingFormWrapperProps) {
  return <RatingForm placeId={placeId} />;
}
