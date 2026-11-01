import React, { useEffect, useState } from 'react';
import { Check, Loader2, MapPin, X } from 'lucide-react';
import {
  SUPPORTED_CITIES,
  SupportedCity,
  reverseGeocodeCoordinates,
} from '../utils/location';

interface LocationPopupProps {
  isOpen: boolean;
  initialCity: SupportedCity | null;
  onConfirmCity: (city: SupportedCity) => void;
  onDismiss: () => void;
}

type DetectionStatus =
  | { type: 'idle' }
  | { type: 'detecting' }
  | { type: 'matched'; city: SupportedCity }
  | { type: 'unsupported'; detectedName: string | null }
  | { type: 'error'; message: string };

export function LocationPopup({
  isOpen,
  initialCity,
  onConfirmCity,
  onDismiss,
}: LocationPopupProps) {
  const [selectedCity, setSelectedCity] = useState<SupportedCity | null>(initialCity);
  const [status, setStatus] = useState<DetectionStatus>({ type: 'idle' });
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setSelectedCity(initialCity);
      setStatus({ type: 'idle' });
      const raf = requestAnimationFrame(() => {
        setAnimateIn(true);
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setAnimateIn(false);
      const timer = window.setTimeout(() => {
        setShouldRender(false);
      }, 280);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen, initialCity]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onDismiss]);

  if (!shouldRender) return null;

  const handleDetectLocation = () => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setStatus({
        type: 'error',
        message:
          'Location detection is not supported by your browser. Please select your city below.',
      });
      return;
    }

    setStatus({ type: 'detecting' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const result = await reverseGeocodeCoordinates(latitude, longitude);

          if (result.matchedCity) {
            setSelectedCity(result.matchedCity);
            setStatus({ type: 'matched', city: result.matchedCity });
          } else {
            setStatus({
              type: 'unsupported',
              detectedName: result.detectedCityName,
            });
          }
        } catch {
          setStatus({
            type: 'error',
            message:
              'Could not determine your city automatically. Please choose your city from the list below.',
          });
        }
      },
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setStatus({
            type: 'error',
            message:
              'Location permission was declined. Please select your city manually below.',
          });
        } else if (geoError.code === geoError.TIMEOUT) {
          setStatus({
            type: 'error',
            message:
              'Location request timed out. Please select your city manually below.',
          });
        } else {
          setStatus({
            type: 'error',
            message:
              'Unable to detect your location right now. Please select your city below.',
          });
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const handleContinue = () => {
    if (!selectedCity) return;
    onConfirmCity(selectedCity);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ease-out ${
        animateIn ? 'opacity-100' : 'opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gharmalak-location-popup-title"
      aria-describedby="gharmalak-location-popup-desc"
    >
      {/* Subtle darkened transparent overlay */}
      <div
        className="fixed inset-0 bg-[#073B30]/45 backdrop-blur-[2px]"
        onClick={onDismiss}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className={`relative z-10 w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-[#F8F8F3] border border-[#E4E9E3] p-6 sm:p-8 shadow-2xl text-[#073B30] transition-all duration-300 ease-out ${
          animateIn ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-2 opacity-0'
        }`}
      >
        {/* Top-right Close (X) button */}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss location selection"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-[#073B30]/65 hover:bg-[#EAF2E9] hover:text-[#073B30] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#064E3B]"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header & Branding */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-3.5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF2E9] border border-[#CFE0CF] text-[#064E3B] shadow-2xs">
            <MapPin className="h-6 w-6 stroke-[2.2]" />
          </div>

          <h2
            id="gharmalak-location-popup-title"
            className="text-2xl sm:text-[26px] font-bold tracking-tight text-[#073B30]"
          >
            Welcome to Gharmalak!
          </h2>

          <p className="mt-1.5 text-sm sm:text-base font-semibold text-[#064E3B]">
            Let&apos;s find the best home deals in your city.
          </p>

          <p
            id="gharmalak-location-popup-desc"
            className="mt-2 max-w-md text-xs sm:text-sm leading-relaxed text-[#073B30]/75"
          >
            Select your city to discover relevant homeowner deals, services and offers near you.
          </p>
        </div>

        {/* Detect My Location Button */}
        <div className="mt-5">
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={status.type === 'detecting'}
            className="gm-btn-secondary flex w-full items-center justify-center gap-2.5 rounded-xl bg-white border-2 border-[#064E3B]/20 px-4 py-3 text-sm font-semibold text-[#073B30] shadow-2xs hover:border-[#064E3B] hover:bg-[#EAF2E9]/50 cursor-pointer disabled:opacity-65 disabled:cursor-wait focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#064E3B]"
          >
            {status.type === 'detecting' ? (
              <Loader2 className="h-4 w-4 text-[#064E3B] animate-spin shrink-0" />
            ) : (
              <MapPin className="h-4 w-4 text-[#064E3B] shrink-0" />
            )}
            <span>
              {status.type === 'detecting' ? 'Detecting your location…' : 'Detect My Location'}
            </span>
          </button>

          {/* Status Feedback Banner */}
          {status.type === 'matched' && (
            <p
              role="status"
              className="mt-2.5 rounded-lg bg-[#EAF2E9] border border-[#CFE0CF] px-3 py-2 text-xs font-medium text-[#064E3B] text-center"
            >
              Location matched to <span className="font-bold">{status.city}</span>. Click Continue
              below to proceed.
            </p>
          )}

          {status.type === 'unsupported' && (
            <p
              role="status"
              className="mt-2.5 rounded-lg bg-[#FFF8E1] border border-[#FFE082] px-3 py-2 text-xs font-medium text-[#073B30] text-center"
            >
              {status.detectedName
                ? `We detected your location near ${status.detectedName}, which is currently outside our supported cities. Please select your nearest city below.`
                : 'Your detected location is outside our currently supported cities. Please select a city from the list below.'}
            </p>
          )}

          {status.type === 'error' && (
            <p
              role="status"
              className="mt-2.5 rounded-lg bg-white border border-[#E4E9E3] px-3 py-2 text-xs font-medium text-[#073B30]/80 text-center"
            >
              {status.message}
            </p>
          )}
        </div>

        {/* Divider: OR SELECT YOUR CITY */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="w-full border-t border-[#E4E9E3]" aria-hidden="true" />
          <span className="relative bg-[#F8F8F3] px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#073B30]/60 whitespace-nowrap">
            OR SELECT YOUR CITY
          </span>
          <div className="w-full border-t border-[#E4E9E3]" aria-hidden="true" />
        </div>

        {/* Supported Cities Grid */}
        <div
          role="radiogroup"
          aria-label="Supported cities"
          className="grid grid-cols-2 sm:grid-cols-2 gap-2.5"
        >
          {SUPPORTED_CITIES.map((city) => {
            const isSelected = selectedCity === city;
            const isLongName = city === 'Chhatrapati Sambhajinagar';
            return (
              <button
                key={city}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelectedCity(city)}
                className={`group flex items-center justify-between gap-2 rounded-xl border px-3.5 py-3 text-left text-xs sm:text-sm font-semibold transition-all duration-200 ease-out cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#064E3B] ${
                  isLongName ? 'col-span-2' : ''
                } ${
                  isSelected
                    ? 'bg-[#073B30] border-[#073B30] text-white shadow-sm -translate-y-0.5'
                    : 'bg-white border-[#E4E9E3] text-[#073B30] hover:border-[#064E3B]/50 hover:bg-[#EAF2E9]/45 hover:-translate-y-0.5'
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <MapPin
                    className={`h-3.5 w-3.5 shrink-0 transition-colors duration-200 ${
                      isSelected
                        ? 'text-[#FFC928]'
                        : 'text-[#064E3B]/75 group-hover:text-[#064E3B]'
                    }`}
                  />
                  <span className="truncate">{city}</span>
                </span>
                {isSelected && (
                  <Check className="h-4 w-4 text-[#FFC928] shrink-0" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>

        {/* Continue to Gharmalak Button */}
        <div className="mt-6">
          <button
            type="button"
            disabled={!selectedCity}
            onClick={handleContinue}
            className="gm-btn-primary flex w-full items-center justify-center rounded-xl bg-[#FFC928] px-6 py-3.5 text-sm sm:text-base font-bold text-[#073B30] shadow-xs hover:bg-[#f3bc18] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#064E3B]"
          >
            Continue to Gharmalak
          </button>
        </div>
      </div>
    </div>
  );
}
