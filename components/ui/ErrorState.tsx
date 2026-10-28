import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <AlertCircle className="text-[#ff5722] mb-3" size={44} />
      <h3 className="text-lg font-bold text-gray-800 mb-1">Something went wrong</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-5">
        {message || 'Could not load data. Please try again.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 bg-[#ff5722] text-white font-bold text-sm px-5 py-2.5 rounded-xl"
        >
          <RefreshCw size={15} />
          Try again
        </button>
      )}
    </div>
  );
}
