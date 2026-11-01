import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  MapPin,
  Sun,
  X,
} from 'lucide-react';
import { LAUNCH_CITIES, OTHER_CITIES } from '../data/clubData';
import {
  SOLAR_INTEREST_CONFIRMATION_MESSAGE,
  SolarRoundData,
  SolarRoundInterestErrors,
  buildSolarRoundInterestPayload,
  getSolarRoundInterestLabel,
  validateSolarRoundInterestForm,
} from '../data/solarRoundsData';
import {
  MemberProfile,
  PendingDealIntent,
} from '../data/membershipData';
import {
  MembershipRequiredError,
  resolveInitialSolarInterestCity,
  submitSolarRoundInterest,
} from '../utils/api';
import { SUPPORTED_CITIES } from '../utils/location';
import { RoutePath } from './Header';

interface SolarInterestModalProps {
  isOpen: boolean;
  selectedRound: SolarRoundData;
  onClose: () => void;
  onNavigate: (path: RoutePath) => void;
  member?: MemberProfile | null;
  onRequireMembership?: (intent: PendingDealIntent) => void;
}

const CITY_OPTIONS: string[] = Array.from(
  new Set([...SUPPORTED_CITIES, ...LAUNCH_CITIES, ...OTHER_CITIES])
);

export function SolarInterestModal({
  isOpen,
  selectedRound,
  onClose,
  onNavigate,
  member = null,
  onRequireMembership,
}: SolarInterestModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Nagpur');
  const [consent, setConsent] = useState(true);
  const [errors, setErrors] = useState<SolarRoundInterestErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedRound, setSubmittedRound] = useState<{
    roundNumber: 1 | 2 | 3 | 4 | 5;
    roundLabel: string;
    interestLabel: string;
    city: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    setSubmitting(false);
    setSubmittedRound(null);
    setConsent(true);
    try {
      const savedName = member?.name || localStorage.getItem('gm_name');
      if (savedName) setName(savedName);
      const savedPhone = member?.mobileNumber || localStorage.getItem('gm_phone');
      if (savedPhone) setPhone(savedPhone);
    } catch {
      // ignore
    }
    setCity(member?.city || resolveInitialSolarInterestCity());
  }, [isOpen, selectedRound.id, member]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const interestLabel = getSolarRoundInterestLabel(selectedRound.roundNumber);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateSolarRoundInterestForm({
      name,
      phone,
      city,
      consent,
    });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildSolarRoundInterestPayload(selectedRound, {
        name,
        phone,
        city,
        consent,
      });
      await submitSolarRoundInterest(payload);
      setSubmittedRound({
        roundNumber: selectedRound.roundNumber,
        roundLabel: selectedRound.tabLabel,
        interestLabel: payload.interestLabel,
        city: payload.city,
      });
    } catch (err) {
      if (err instanceof MembershipRequiredError) {
        onClose();
        onRequireMembership?.({
          type: 'solar-interest',
          label: `Register Interest · ${selectedRound.tabLabel}`,
          returnPath: '/round/solar-nagpur',
          returnQuery: `round=${selectedRound.id}`,
          roundId: selectedRound.id,
          roundNumber: selectedRound.roundNumber,
          createdAt: new Date().toISOString(),
        });
        return;
      }
      setErrors({
        server: 'Something went wrong while saving your interest. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="solar-interest-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#042F23]/60 backdrop-blur-xs p-4 transition-opacity duration-250 ease-out"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#F8F8F3] border border-[#E4E9E3] shadow-2xl transition-all duration-250 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="bg-[#064E3B] px-6 py-5 text-white flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#FFC928]">
              <Sun className="h-3.5 w-3.5 text-[#FFC928] shrink-0" />
              <span>Solar Round {selectedRound.roundNumber}</span>
            </div>
            <h2
              id="solar-interest-modal-title"
              className="text-xl sm:text-2xl font-bold tracking-tight text-white"
            >
              {interestLabel}
            </h2>
            <p className="text-xs text-white/80 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#FFC928] shrink-0" />
              <span>{selectedRound.eyebrow}</span>
            </p>
          </div>

          <button
            type="button"
            aria-label="Close interest form"
            onClick={onClose}
            className="rounded-xl p-1.5 text-white/80 hover:bg-white/12 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {submittedRound ? (
            <div
              role="status"
              data-testid="solar-interest-confirmation"
              className="space-y-5 py-2 text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF2E9] text-[#064E3B]">
                <CheckCircle2 className="h-8 w-8 stroke-[2.2]" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF2E9] px-3 py-1 text-xs font-bold text-[#064E3B]">
                  <span>{submittedRound.interestLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{submittedRound.city}</span>
                </span>
                <p className="text-base sm:text-lg font-bold text-[#073B30] leading-snug">
                  {SOLAR_INTEREST_CONFIRMATION_MESSAGE}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="gm-btn-dark w-full rounded-xl bg-[#064E3B] px-5 py-3 text-sm font-semibold text-white hover:bg-[#073B30] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="rounded-xl bg-white border border-[#E4E9E3] px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                <span className="font-medium text-[#073B30]/75">Selected round:</span>
                <strong
                  data-testid="solar-interest-selected-round"
                  className="font-bold text-[#064E3B] whitespace-nowrap"
                >
                  Solar Round {selectedRound.roundNumber} · {selectedRound.optInWindowLabel}
                </strong>
              </div>

              {/* Visitor Name */}
              <div>
                <label
                  htmlFor="solar-interest-name"
                  className="block text-sm font-semibold text-[#073B30] mb-1.5"
                >
                  Your name
                </label>
                <input
                  id="solar-interest-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value.slice(0, 120));
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  aria-invalid={Boolean(errors.name)}
                  className="w-full rounded-xl border border-[#E4E9E3] bg-white px-4 py-3 text-sm text-[#073B30] focus:border-[#064E3B] focus:outline-none transition-colors"
                />
                {errors.name && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              {/* WhatsApp / Mobile Number */}
              <div>
                <label
                  htmlFor="solar-interest-phone"
                  className="block text-sm font-semibold text-[#073B30] mb-1.5"
                >
                  WhatsApp / mobile number
                </label>
                <div className="flex rounded-xl border border-[#E4E9E3] bg-white overflow-hidden focus-within:border-[#064E3B] transition-colors">
                  <span className="inline-flex items-center px-3.5 text-sm font-semibold text-[#073B30]/70 border-r border-[#E4E9E3] bg-[#F8F8F3]">
                    +91
                  </span>
                  <input
                    id="solar-interest-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/[^\d\s]/g, '').slice(0, 12));
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    aria-invalid={Boolean(errors.phone)}
                    className="w-full px-4 py-3 text-sm text-[#073B30] bg-transparent focus:outline-none"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              {/* Selected City (using saved city preference) */}
              <div>
                <label
                  htmlFor="solar-interest-city"
                  className="block text-sm font-semibold text-[#073B30] mb-1.5"
                >
                  Your city
                </label>
                <div className="relative flex items-center">
                  <MapPin className="w-4 h-4 text-[#064E3B] absolute left-3.5 pointer-events-none" />
                  <select
                    id="solar-interest-city"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
                    }}
                    aria-invalid={Boolean(errors.city)}
                    className="w-full rounded-xl border border-[#E4E9E3] bg-white pl-10 pr-4 py-3 text-sm font-medium text-[#073B30] focus:border-[#064E3B] focus:outline-none transition-colors cursor-pointer"
                  >
                    {CITY_OPTIONS.map((cityOption) => (
                      <option key={cityOption} value={cityOption}>
                        {cityOption}
                      </option>
                    ))}
                    {!CITY_OPTIONS.includes(city) && city && (
                      <option value={city}>{city}</option>
                    )}
                  </select>
                </div>
                {errors.city && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.city}</span>
                  </p>
                )}
              </div>

              {/* Privacy & Consent Notice */}
              <div>
                <label className="flex items-start gap-2.5 text-xs text-[#073B30]/85 cursor-pointer leading-relaxed">
                  <input
                    id="solar-interest-consent"
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      if (errors.consent) setErrors((prev) => ({ ...prev, consent: undefined }));
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-[#E4E9E3] text-[#064E3B] focus:ring-[#064E3B]"
                  />
                  <span>
                    I agree to receive WhatsApp updates from Gharmalak regarding{' '}
                    <strong className="text-[#073B30]">
                      Solar Round {selectedRound.roundNumber}
                    </strong>
                    . We never sell your data (
                    <a
                      href="/privacy"
                      onClick={(e) => {
                        e.preventDefault();
                        onClose();
                        onNavigate('/privacy');
                      }}
                      className="underline font-semibold text-[#064E3B]"
                    >
                      privacy policy
                    </a>
                    ).
                  </span>
                </label>
                {errors.consent && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.consent}</span>
                  </p>
                )}
              </div>

              {errors.server && (
                <p className="flex items-center gap-1.5 text-xs font-semibold text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.server}</span>
                </p>
              )}

              {/* Submit Button */}
              <div className="pt-1 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="gm-btn-primary w-full rounded-xl bg-[#FFC928] px-6 py-3.5 text-sm sm:text-base font-bold text-[#073B30] hover:bg-[#f3bc18] transition-colors cursor-pointer disabled:opacity-60"
                >
                  {submitting
                    ? 'Saving…'
                    : `Register Interest in Solar Round ${selectedRound.roundNumber}`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
