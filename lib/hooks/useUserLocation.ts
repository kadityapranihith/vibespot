'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserLocation, LocationStatus } from '@/types';

const STORAGE_KEY = 'vibespot_user_location';

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize from sessionStorage if available
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as UserLocation;
        if (parsed.latitude && parsed.longitude) {
          setLocation(parsed);
          setStatus('granted');
        }
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }, []);

  const requestLocation = useCallback((forceFresh = false) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable');
      setErrorMessage('Geolocation is not supported by your browser or device.');
      return;
    }

    setStatus('requesting');
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        setLocation(newLocation);
        setStatus('granted');
        setErrorMessage(null);

        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newLocation));
        } catch {
          // Ignore storage errors
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setStatus('denied');
          setErrorMessage('Location permission was denied. You can enable it in your browser settings.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setStatus('unavailable');
          setErrorMessage('Your location is currently unavailable. Please check your GPS or device location settings.');
        } else if (error.code === error.TIMEOUT) {
          setStatus('unavailable');
          setErrorMessage('Location request timed out. Please try again.');
        } else {
          setStatus('unavailable');
          setErrorMessage(error.message || 'Unable to retrieve your location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: forceFresh ? 0 : 300000, // 5 min cache unless forced
      }
    );
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setStatus('idle');
    setErrorMessage(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  return {
    location,
    status,
    errorMessage,
    requestLocation,
    refreshLocation: () => requestLocation(true),
    clearLocation,
  };
}

