import React, { useState } from 'react';
import { BadgeCheck, Clock, MapPin, Menu, X } from 'lucide-react';
import { GharmalakMark } from './Logo';
import { MemberProfile, getHeaderMembershipIndicator } from '../data/membershipData';
import { SUPPORTED_LANGUAGES, useLang } from '../data/translations';
import { SupportedCity } from '../utils/location';

export type RoutePath =
  | '/'
  | '/how-it-works'
  | '/deals'
  | '/round/solar-nagpur'
  | '/join'
  | '/privacy'
  | '/for-business'
  | '/property/vedira-anand';

interface HeaderProps {
  currentPath: RoutePath;
  onNavigate: (path: RoutePath, hash?: string) => void;
  selectedCity?: SupportedCity | null;
  onOpenLocationPopup?: () => void;
  member?: MemberProfile | null;
  onOpenMembershipModal?: () => void;
}

export function Header({
  currentPath,
  onNavigate,
  selectedCity,
  onOpenLocationPopup,
  member = null,
  onOpenMembershipModal,
}: HeaderProps) {
  const { t, lang, setLang } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);

  const indicator = getHeaderMembershipIndicator(member);

  const handleNav = (e: React.MouseEvent, path: RoutePath, hash?: string) => {
    e.preventDefault();
    setMobileOpen(false);
    onNavigate(path, hash);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E4E9E3] transition-shadow duration-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-6 lg:gap-8 px-3 sm:px-6 lg:px-8 h-16">
        {/* Zone 1: Brand Title */}
        <a
          href="/"
          onClick={(e) => handleNav(e, '/')}
          className="group flex items-center gap-2 sm:gap-2.5 text-[#073B30] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#064E3B] rounded-md transition-opacity duration-200 hover:opacity-90"
          aria-label="Gharmalak home"
        >
          <GharmalakMark size={26} color="#064E3B" />
          <div className="flex flex-col leading-none">
            <span className="text-base sm:text-lg font-bold tracking-tight">
              Gharmalak<span className="text-[#064E3B]/70 font-medium">.com</span>
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.14em] text-[#073B30]/65 mt-0.5">
              {t.descriptor}
            </span>
          </div>
        </a>

        {/* Zone 2: Primary Navigation Links + Language Switcher */}
        <nav
          aria-label="Main"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#073B30]/85"
        >
          <a
            href="/how-it-works"
            onClick={(e) => handleNav(e, '/how-it-works')}
            className={`gm-nav-link hover:text-[#064E3B] whitespace-nowrap shrink-0 py-1 ${
              currentPath === '/how-it-works' ? 'text-[#064E3B] font-semibold gm-nav-link-active' : ''
            }`}
          >
            {t.nav_how}
          </a>
          <a
            href="/deals"
            onClick={(e) => handleNav(e, '/deals')}
            className={`gm-nav-link hover:text-[#064E3B] whitespace-nowrap shrink-0 py-1 ${
              currentPath === '/deals' ? 'text-[#064E3B] font-semibold gm-nav-link-active' : ''
            }`}
          >
            {t.nav_deals}
          </a>
          <a
            href="/round/solar-nagpur"
            onClick={(e) => handleNav(e, '/round/solar-nagpur')}
            className={`gm-nav-link hover:text-[#064E3B] whitespace-nowrap shrink-0 py-1 ${
              currentPath === '/round/solar-nagpur'
                ? 'text-[#064E3B] font-semibold gm-nav-link-active'
                : ''
            }`}
          >
            {t.nav_round}
          </a>

          {/* Language Selector */}
          <div
            role="group"
            aria-label="Language"
            className="flex items-center gap-1 rounded-lg bg-[#EAF2E9] p-1 border border-[#E4E9E3]"
          >
            {SUPPORTED_LANGUAGES.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={lang === item.id}
                onClick={() => setLang(item.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
                  lang === item.id
                    ? 'bg-[#064E3B] text-white shadow-xs'
                    : 'text-[#073B30]/80 hover:text-[#073B30]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Zone 3: City Selector + Primary Membership Indicator + Mobile Menu Trigger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {onOpenLocationPopup && (
            <button
              type="button"
              onClick={onOpenLocationPopup}
              aria-label={
                selectedCity ? `Selected city: ${selectedCity}. Change city` : 'Select your city'
              }
              className="gm-btn-secondary inline-flex items-center gap-1.5 rounded-lg border border-[#E4E9E3] bg-[#F8F8F3] px-2.5 py-1.5 text-xs font-semibold text-[#073B30] hover:border-[#064E3B]/40 hover:bg-[#EAF2E9] cursor-pointer max-w-[140px] sm:max-w-[180px]"
            >
              <MapPin className="h-3.5 w-3.5 text-[#064E3B] shrink-0" />
              <span className="truncate">{selectedCity ?? 'Select City'}</span>
            </button>
          )}

          {indicator.state === 'active' && (
            <button
              type="button"
              data-testid="header-membership-indicator"
              onClick={() => onOpenMembershipModal?.()}
              className="gm-btn-dark inline-flex items-center gap-1.5 rounded-lg bg-[#064E3B] px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#073B30] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <BadgeCheck className="h-4 w-4 text-[#FFC928] shrink-0" />
              <span>{indicator.label}</span>
              <span className="hidden sm:inline-flex items-center rounded-md bg-[#FFC928] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#073B30]">
                {indicator.badgeText}
              </span>
            </button>
          )}

          {(indicator.state === 'expired' || indicator.state === 'pending') && (
            <button
              type="button"
              data-testid="header-membership-indicator"
              onClick={() => onOpenMembershipModal?.()}
              className="gm-btn-primary inline-flex items-center gap-1.5 rounded-lg bg-amber-100 border border-amber-300 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold text-amber-950 shadow-xs hover:bg-amber-200 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Clock className="h-3.5 w-3.5 text-amber-900 shrink-0" />
              <span>{indicator.label}</span>
            </button>
          )}

          {indicator.state === 'visitor' && (
            <a
              href="/join"
              data-testid="header-membership-indicator"
              onClick={(e) => handleNav(e, '/join')}
              className="gm-btn-primary inline-flex items-center justify-center rounded-lg bg-[#FFC928] px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-[#073B30] shadow-xs hover:bg-[#f3bc18] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#064E3B]"
            >
              {t.nav_join}
            </a>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="inline-flex md:hidden items-center justify-center rounded-lg p-2 text-[#073B30] hover:bg-[#EAF2E9] transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E4E9E3] bg-white px-4 pt-3 pb-5 shadow-lg animate-fadeIn">
          <nav aria-label="Mobile navigation" className="flex flex-col space-y-2">
            <a
              href="/how-it-works"
              onClick={(e) => handleNav(e, '/how-it-works')}
              className="rounded-lg px-3 py-2.5 text-base font-medium text-[#073B30] hover:bg-[#EAF2E9] transition-colors"
            >
              {t.nav_how}
            </a>
            <a
              href="/deals"
              onClick={(e) => handleNav(e, '/deals')}
              className="rounded-lg px-3 py-2.5 text-base font-medium text-[#073B30] hover:bg-[#EAF2E9] transition-colors"
            >
              {t.nav_deals}
            </a>
            <a
              href="/round/solar-nagpur"
              onClick={(e) => handleNav(e, '/round/solar-nagpur')}
              className="rounded-lg px-3 py-2.5 text-base font-medium text-[#073B30] hover:bg-[#EAF2E9] transition-colors"
            >
              {t.nav_round}
            </a>

            {onOpenLocationPopup && (
              <div className="pt-2 border-t border-[#E4E9E3] flex items-center justify-between px-3">
                <span className="text-xs font-medium text-[#073B30]/70 uppercase tracking-wider">
                  City
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenLocationPopup();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#EAF2E9] px-3 py-1.5 text-xs font-semibold text-[#073B30] cursor-pointer"
                >
                  <MapPin className="h-3.5 w-3.5 text-[#064E3B]" />
                  <span>{selectedCity ?? 'Select City'}</span>
                </button>
              </div>
            )}

            <div className="pt-2 border-t border-[#E4E9E3] flex items-center justify-between px-3">
              <span className="text-xs font-medium text-[#073B30]/70 uppercase tracking-wider">
                Language
              </span>
              <div
                role="group"
                aria-label="Mobile Language"
                className="flex items-center gap-1 rounded-lg bg-[#EAF2E9] p-1"
              >
                {SUPPORTED_LANGUAGES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={lang === item.id}
                    onClick={() => setLang(item.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      lang === item.id
                        ? 'bg-[#064E3B] text-white'
                        : 'text-[#073B30]/80 hover:text-[#073B30]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
