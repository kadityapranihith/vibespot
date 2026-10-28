import { UtensilsCrossed, SearchX, Star } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-places' | 'no-results' | 'no-ratings';
  message?: string;
}

export function EmptyState({ type, message }: EmptyStateProps) {
  const configs = {
    'no-places': {
      icon: <UtensilsCrossed size={52} className="text-gray-300" />,
      title: 'No places yet',
      description: message || 'New restaurants are being added soon.',
    },
    'no-results': {
      icon: <SearchX size={52} className="text-gray-300" />,
      title: 'Nothing found',
      description: message || 'Try different keywords or remove filters.',
    },
    'no-ratings': {
      icon: <Star size={52} className="text-gray-300" />,
      title: 'No ratings yet',
      description: 'Be the first to rate this place!',
    },
  };
  const { icon, title, description } = configs[type];

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="mb-4 opacity-60">{icon}</div>
      <h3 className="text-lg font-bold text-gray-700 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed">{description}</p>
    </div>
  );
}
