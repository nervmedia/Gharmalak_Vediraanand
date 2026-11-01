import React, { useCallback, useEffect, useState } from 'react';
import { LangProvider } from './data/translations';
import {
  MemberProfile,
  PendingDealIntent,
  canAccessMemberDeals,
} from './data/membershipData';
import { SolarRoundId } from './data/solarRoundsData';
import { Header, RoutePath } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { HowItWorksView } from './components/HowItWorksView';
import { DealsView } from './components/DealsView';
import { SolarRoundView } from './components/SolarRoundView';
import { JoinView } from './components/JoinView';
import { PrivacyView } from './components/PrivacyView';
import { ForBusinessView } from './components/ForBusinessView';
import { VediraAnandView } from './components/vedira-anand/VediraAnandView';
import { LocationPopup } from './components/LocationPopup';
import {
  MembershipGateModal,
  MembershipModalMode,
} from './components/MembershipGateModal';
import {
  ClubStats,
  PaymentOrderInfo,
  clearMemberSessionToken,
  clearPendingDealIntent,
  fetchClubStats,
  fetchCurrentMember,
  getPendingDealIntent,
  savePendingDealIntent,
  unlockMemberDeal,
} from './utils/api';
import {
  LOCATION_POPUP_DELAY_MS,
  SupportedCity,
  getSavedCity,
  markPopupDismissed,
  saveSelectedCity,
  shouldAutoScheduleLocationPopup,
} from './utils/location';

function resolveRoute(pathname: string): RoutePath {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/how-it-works' || clean === '/how') return '/how-it-works';
  if (clean === '/deals') return '/deals';
  if (clean === '/round/solar-nagpur') return '/round/solar-nagpur';
  if (clean === '/join') return '/join';
  if (clean === '/privacy') return '/privacy';
  if (clean === '/for-business' || clean === '/business') return '/for-business';
  if (
    clean === '/property/vedira-anand' ||
    clean === '/deals/vedira-anand' ||
    clean === '/vedira-anand'
  ) {
    return '/property/vedira-anand';
  }
  return '/';
}

function AppContent() {
  const [route, setRoute] = useState<RoutePath>(() => resolveRoute(window.location.pathname));
  const [dealQueryId, setDealQueryId] = useState<string | null>(() =>
    new URLSearchParams(window.location.search).get('deal')
  );
  const [stats, setStats] = useState<ClubStats>({ members: 1, optins: 1 });
  const [selectedCity, setSelectedCity] = useState<SupportedCity | null>(() => getSavedCity());
  const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);

  // Membership & Deal Access Control State
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [pendingOrder, setPendingOrder] = useState<PaymentOrderInfo | null>(null);
  const [pendingIntent, setPendingIntent] = useState<PendingDealIntent | null>(() =>
    getPendingDealIntent()
  );
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [membershipModalMode, setMembershipModalMode] =
    useState<MembershipModalMode>('gate');
  const [resumedDealId, setResumedDealId] = useState<string | null>(null);
  const [resumedRoundId, setResumedRoundId] = useState<SolarRoundId | null>(null);

  const refreshStats = useCallback(async () => {
    const latest = await fetchClubStats();
    setStats(latest);
  }, []);

  const refreshCurrentMember = useCallback(async () => {
    const res = await fetchCurrentMember();
    setMember(res.member);
    setPendingOrder(res.pendingOrder);
  }, []);

  useEffect(() => {
    refreshStats();
    refreshCurrentMember();
  }, [refreshStats, refreshCurrentMember]);

  // Wait exactly 18 seconds before displaying the location popup on initial visit
  useEffect(() => {
    if (!shouldAutoScheduleLocationPopup() || isMembershipModalOpen) return;

    const timerId = window.setTimeout(() => {
      if (shouldAutoScheduleLocationPopup() && !isMembershipModalOpen) {
        setIsLocationPopupOpen(true);
      }
    }, LOCATION_POPUP_DELAY_MS);

    return () => window.clearTimeout(timerId);
  }, [isMembershipModalOpen]);

  const handleConfirmCity = useCallback((city: SupportedCity) => {
    saveSelectedCity(city);
    setSelectedCity(city);
    setIsLocationPopupOpen(false);
  }, []);

  const handleDismissLocationPopup = useCallback(() => {
    markPopupDismissed();
    setIsLocationPopupOpen(false);
  }, []);

  const handleOpenLocationPopup = useCallback(() => {
    setIsLocationPopupOpen(true);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setRoute(resolveRoute(window.location.pathname));
      setDealQueryId(new URLSearchParams(window.location.search).get('deal'));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((path: RoutePath, hash?: string, query?: string) => {
    const url = `${path}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`;
    window.history.pushState({}, '', url);
    setRoute(path);
    setDealQueryId(query ? new URLSearchParams(query).get('deal') : null);

    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleRequireMembership = useCallback((intent: PendingDealIntent) => {
    savePendingDealIntent(intent);
    setPendingIntent(intent);
    setIsLocationPopupOpen(false);
    setMembershipModalMode('gate');
    setIsMembershipModalOpen(true);
  }, []);

  const handleMemberUpdated = useCallback(
    (nextMember: MemberProfile | null, nextOrder?: PaymentOrderInfo | null) => {
      setMember(nextMember);
      if (nextOrder !== undefined) {
        setPendingOrder(nextOrder);
      }
      refreshStats();
    },
    [refreshStats]
  );

  const handleResumeIntent = useCallback(
    async (intent: PendingDealIntent, activeMember: MemberProfile) => {
      clearPendingDealIntent();
      setPendingIntent(null);
      setIsMembershipModalOpen(false);

      if (intent.dealId) {
        try {
          const unlocked = await unlockMemberDeal(intent.dealId);
          setMember(unlocked.member);
        } catch {
          setMember(activeMember);
        }
      }

      if (intent.returnPath === '/' && intent.dealId) {
        setResumedDealId(intent.dealId);
      }
      if (intent.roundId) {
        setResumedRoundId(intent.roundId as SolarRoundId);
      }

      navigate(intent.returnPath, intent.returnHash, intent.returnQuery);
    },
    [navigate]
  );

  const handleLogoutMember = useCallback(() => {
    clearMemberSessionToken();
    setMember(null);
    setPendingOrder(null);
    setIsMembershipModalOpen(false);
  }, []);

  const handleOpenHeaderMembershipModal = useCallback(() => {
    if (canAccessMemberDeals(member)) {
      setMembershipModalMode('account');
    } else {
      setMembershipModalMode('gate');
    }
    setIsMembershipModalOpen(true);
  }, [member]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F3] text-[#073B30]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-[#FFC928] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-[#073B30]"
      >
        Skip to content
      </a>

      <Header
        currentPath={route}
        onNavigate={navigate}
        selectedCity={selectedCity}
        onOpenLocationPopup={handleOpenLocationPopup}
        member={member}
        onOpenMembershipModal={handleOpenHeaderMembershipModal}
      />

      <main id="main" className="flex-1">
        {route === '/' && (
          <HomeView
            stats={stats}
            onNavigate={navigate}
            member={member}
            onRequireMembership={handleRequireMembership}
            onMemberUpdated={(m) => handleMemberUpdated(m)}
            initialOpenDealId={resumedDealId}
          />
        )}
        {route === '/how-it-works' && <HowItWorksView stats={stats} onNavigate={navigate} />}
        {route === '/deals' && (
          <DealsView
            initialDealId={dealQueryId}
            onNavigate={navigate}
            member={member}
            onRequireMembership={handleRequireMembership}
            onMemberUpdated={(m) => handleMemberUpdated(m)}
          />
        )}
        {route === '/round/solar-nagpur' && (
          <SolarRoundView
            stats={stats}
            onStatsUpdated={refreshStats}
            onNavigate={navigate}
            member={member}
            onRequireMembership={handleRequireMembership}
            resumedRoundId={resumedRoundId}
          />
        )}
        {route === '/join' && (
          <JoinView
            onMemberJoined={refreshStats}
            onNavigate={navigate}
            member={member}
            pendingIntent={pendingIntent}
            onMemberUpdated={handleMemberUpdated}
            onResumeIntent={handleResumeIntent}
            onOpenLoginModal={() => {
              setMembershipModalMode('login');
              setIsMembershipModalOpen(true);
            }}
          />
        )}
        {route === '/privacy' && <PrivacyView />}
        {route === '/for-business' && (
          <ForBusinessView onNavigate={navigate} selectedCity={selectedCity} />
        )}
        {route === '/property/vedira-anand' && (
          <VediraAnandView onNavigate={navigate} member={member} />
        )}
      </main>

      <Footer onNavigate={navigate} />

      <MembershipGateModal
        isOpen={isMembershipModalOpen}
        initialMode={membershipModalMode}
        member={member}
        pendingOrder={pendingOrder}
        pendingIntent={pendingIntent}
        defaultCity={selectedCity}
        onClose={() => setIsMembershipModalOpen(false)}
        onMemberUpdated={handleMemberUpdated}
        onResumeIntent={handleResumeIntent}
        onLogout={handleLogoutMember}
        onNavigate={navigate}
      />

      <LocationPopup
        isOpen={isLocationPopupOpen}
        initialCity={selectedCity}
        onConfirmCity={handleConfirmCity}
        onDismiss={handleDismissLocationPopup}
      />
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AppContent />
    </LangProvider>
  );
}
