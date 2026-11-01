import React, { useRef, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  Check,
  ChevronDown,
  ClipboardList,
  Coins,
  IndianRupee,
  MapPin,
  MessageCircle,
  Percent,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { useLang } from '../data/translations';
import {
  CLUB_CONFIG,
  DEALS,
  DEFAULT_EXPANDED_SEASON,
  DealItem,
  LAUNCH_CITIES,
  REACH_LABELS,
  ROUND_1_SOLAR,
  SEASON_CATEGORIES,
  SeasonGroup,
  TIER_LABELS,
  buildWhatsAppUrl,
  formatRupees,
  getRemainingSeats,
  getRoundForDeal,
  getRoundProgress,
  isSeasonGroupExpanded,
  toggleSeasonExpanded,
} from '../data/clubData';
import {
  MEMBERSHIP_TRANSPARENCY_NOTICE,
  MemberProfile,
  PendingDealIntent,
  canAccessMemberDeals,
} from '../data/membershipData';
import {
  DEFAULT_SOLAR_ROUND_ID,
  SolarRoundId,
  calculateSolarRoundProgress,
  getSolarRoundById,
  getSolarRoundsData,
} from '../data/solarRoundsData';
import { ClubStats, MembershipRequiredError, unlockMemberDeal } from '../utils/api';
import {
  ANIMATION_TIMINGS,
  calculateCardTilt,
  calculateStaggerDelay,
  getAlternatingDirection,
  getWhoCardVariant,
} from '../utils/animationHelpers';
import { RoutePath } from './Header';
import { GroupComparisonSection } from './GroupComparisonSection';
import { MalakCard } from './MalakCard';
import {
  CountUpNumber,
  FaqAccordionItem,
  HeroEntrance,
  MagneticWrap,
  ParallaxWrap,
  Reveal,
  WordGroupHeadline,
  usePrefersReducedMotion,
} from './MotionPrimitives';
import { ResilientImage } from './ResilientImage';
import { SolarRoundTabs } from './SolarRoundTabs';

interface HomeViewProps {
  stats: ClubStats;
  onNavigate: (path: RoutePath, hash?: string, query?: string) => void;
  member?: MemberProfile | null;
  onRequireMembership?: (intent: PendingDealIntent) => void;
  onMemberUpdated?: (member: MemberProfile) => void;
  initialOpenDealId?: string | null;
}

export function HomeView({
  stats,
  onNavigate,
  member = null,
  onRequireMembership,
  onMemberUpdated,
  initialOpenDealId = null,
}: HomeViewProps) {
  const { lang, t } = useLang();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [selectedSolarRoundId, setSelectedSolarRoundId] = useState<SolarRoundId>(
    DEFAULT_SOLAR_ROUND_ID
  );
  const [activeSeason, setActiveSeason] = useState<'all' | SeasonGroup>('all');
  const [expandedSeason, setExpandedSeason] = useState<SeasonGroup | null>(
    DEFAULT_EXPANDED_SEASON
  );
  const [selectedDeal, setSelectedDeal] = useState<DealItem | null>(() =>
    initialOpenDealId ? DEALS.find((d) => d.id === initialOpenDealId) || null : null
  );
  const [unlockingDeal, setUnlockingDeal] = useState(false);
  const [unlockedDealFeedback, setUnlockedDealFeedback] = useState<string | null>(null);
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({
    5: true,
    1: false,
    2: false,
    3: false,
    4: false,
  });
  const [showVideoModal, setShowVideoModal] = useState(false);

  React.useEffect(() => {
    if (initialOpenDealId) {
      const found = DEALS.find((d) => d.id === initialOpenDealId);
      if (found) {
        setSelectedDeal(found);
        setExpandedSeason(found.seasonGroup);
      }
    }
  }, [initialOpenDealId]);

  // Hero Malak Card subtle desktop perspective hover around base angle (-15deg Y, 2deg X)
  const heroCardRef = useRef<HTMLDivElement>(null);
  const [heroCardTilt, setHeroCardTilt] = useState({ rotateX: 2, rotateY: -15 });

  const handleHeroCardPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const el = heroCardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width;
    const normY = (e.clientY - rect.top) / rect.height;
    setHeroCardTilt(calculateCardTilt(normX, normY, 7, 10, 2, -15));
  };

  const handleHeroCardPointerLeave = () => {
    setHeroCardTilt({ rotateX: 2, rotateY: -15 });
  };

  const roundProgress = getRoundProgress(stats.optins);
  void roundProgress;
  const solarRounds = getSolarRoundsData(lang, stats.optins);
  const selectedSolarRound = getSolarRoundById(solarRounds, selectedSolarRoundId);
  const solarRoundProgress = calculateSolarRoundProgress(selectedSolarRound);
  const seatsInfo = getRemainingSeats(stats.members);
  const seatsLabel = t.plan_seats.replace('{n}', seatsInfo.remaining.toLocaleString('en-IN'));

  const toggleFaq = (id: number) => {
    setOpenFaqs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleSeason = (seasonId: SeasonGroup) => {
    setExpandedSeason((prev) => toggleSeasonExpanded(prev, seasonId));
  };

  const handleNavClick = (
    e: React.MouseEvent,
    path: RoutePath,
    hash?: string,
    query?: string
  ) => {
    e.preventDefault();
    onNavigate(path, hash, query);
  };

  const howSteps = [
    {
      num: '01',
      title: t.step1_t,
      body: t.step1_b,
      Icon: ClipboardList,
    },
    {
      num: '02',
      title: t.step2_t,
      body: t.step2_b,
      Icon: MessageCircle,
    },
    {
      num: '03',
      title: t.step3_t,
      body: t.step3_b,
      Icon: Users,
    },
    {
      num: '04',
      title: t.step4_t,
      body: t.step4_b,
      Icon: ShieldCheck,
    },
  ];
  void howSteps;

  const whoCards = [
    {
      id: 1,
      title: t.who1_t,
      body: t.who1_b,
      image: '/images/independent-house.jpg',
      alt: 'Modern Indian independent bungalow with a garden and greenery',
    },
    {
      id: 2,
      title: t.who2_t,
      body: t.who2_b,
      image: '/images/apartment-building.jpg',
      alt: 'Modern Indian residential apartment building with multiple balconies',
    },
    {
      id: 3,
      title: t.who3_t,
      body: t.who3_b,
      image: '/images/homeowners.jpg',
      alt: 'Elderly Indian couple sitting comfortably together inside their home',
    },
  ];

  const faqIds = [5, 1, 2, 3, 4] as const;

  const visibleSeasons =
    activeSeason === 'all'
      ? SEASON_CATEGORIES
      : SEASON_CATEGORIES.filter((s) => s.id === activeSeason);

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#F8F8F3] border-b border-[#E4E9E3] min-h-[calc(100vh-4rem)] flex items-stretch">
        {/* Background Residential Bungalow Photograph with Rooftop Solar: Cinematic zoom-out reveal */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <HeroEntrance
            variant="zoom-out-cinematic"
            scale={1.09}
            duration={0.95}
            className="relative h-full w-full lg:w-[70%] lg:ml-auto overflow-hidden"
          >
            <ResilientImage
              src="/images/hero-bungalow.jpg"
              alt="Modern Indian bungalow with rooftop solar panels and landscaped garden"
              loading="eager"
              className="h-full w-full object-cover object-center lg:object-[center_45%]"
              containerClassName="h-full w-full"
            />
            {/* Smooth Blend from Left Off-White Canvas into Natural Daylight Photo */}
            <div
              aria-hidden="true"
              className="hidden lg:block absolute inset-y-0 left-0 w-[40%] bg-gradient-to-r from-[#F8F8F3] via-[#F8F8F3]/80 to-transparent"
            />
            <div
              aria-hidden="true"
              className="lg:hidden absolute inset-0 bg-gradient-to-r from-[#F8F8F3]/95 via-[#F8F8F3]/88 via-55% to-[#F8F8F3]/35"
            />
          </HeroEntrance>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1380px] px-4 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20 flex items-center">
          <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
            {/* Left Column: Eyebrow, Word-Group Left-to-Right Headline, Bottom Supporting Text, Scale Primary CTA & Right-Slide Secondary CTA */}
            <div className="lg:col-span-7 max-w-[660px] my-auto">
              <HeroEntrance
                as="p"
                variant="slide-left"
                x={-22}
                delay={0.03}
                duration={0.62}
                className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-[#064E3B] mb-3.5"
              >
                {t.hero_over}
              </HeroEntrance>

              <WordGroupHeadline
                text={t.hero_title}
                baseDelay={0.09}
                stepDelay={0.07}
                wordsPerGroup={2}
                className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-[-0.02em] leading-[1.08] text-[#073B30]"
              />

              {/* Supporting text: gentle fade-in from the bottom */}
              <HeroEntrance
                as="p"
                variant="fade-up"
                y={18}
                delay={0.26}
                duration={0.7}
                className="mt-4 text-lg sm:text-xl font-medium text-[#073B30]/85"
              >
                {t.h_line}
              </HeroEntrance>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                {/* Primary CTA: scale-in with a slight delay + desktop magnetic hover */}
                <HeroEntrance
                  variant="scale-up"
                  scale={0.88}
                  y={8}
                  delay={0.34}
                  duration={0.64}
                  className="inline-flex"
                >
                  <MagneticWrap>
                    <a
                      href="/join"
                      onClick={(e) => handleNavClick(e, '/join')}
                      className="gm-btn-primary inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFC928] px-7 py-4 text-sm sm:text-base font-bold text-[#073B30] shadow-xs hover:bg-[#f3bc18] whitespace-nowrap shrink-0"
                    >
                      <span>{t.hero_cta}</span>
                      <ArrowRight className="gm-arrow-icon w-4 h-4 stroke-[2.5]" />
                    </a>
                  </MagneticWrap>
                </HeroEntrance>

                {/* Secondary CTA: slide in from the right */}
                <HeroEntrance
                  variant="slide-right"
                  x={28}
                  delay={0.41}
                  duration={0.68}
                  className="inline-flex"
                >
                  <a
                    href="/deals"
                    onClick={(e) => handleNavClick(e, '/deals')}
                    className="gm-btn-secondary inline-flex items-center justify-center gap-2 rounded-xl border border-[#064E3B]/55 bg-white/85 backdrop-blur-xs px-7 py-4 text-sm sm:text-base font-semibold text-[#073B30] hover:bg-white hover:border-[#064E3B] whitespace-nowrap shrink-0"
                  >
                    <span>{t.h_deals}</span>
                  </a>
                </HeroEntrance>
              </div>

              <HeroEntrance
                as="p"
                variant="fade-up"
                y={12}
                delay={0.47}
                duration={0.62}
                className="mt-6 text-xs sm:text-sm font-medium text-[#073B30]/90 leading-[1.5] max-w-lg"
              >
                {t.hero_note.includes('. ') ? (
                  <>
                    {t.hero_note.split('. ')[0]}.
                    <br />
                    {t.hero_note.split('. ').slice(1).join('. ')}
                  </>
                ) : (
                  t.hero_note
                )}
              </HeroEntrance>
            </div>

            {/* Right Column: Bottom-Right 3D Angled Dark-Green Malak Card Visual */}
            <HeroEntrance
              variant="perspective-3d"
              y={22}
              scale={0.95}
              delay={0.28}
              duration={ANIMATION_TIMINGS.heroSeconds}
              className="lg:col-span-5 h-full flex justify-start lg:justify-end items-end self-end lg:pb-2"
            >
              <div className="gm-malak-float w-full max-w-[340px] sm:max-w-[380px]">
                <div
                  ref={heroCardRef}
                  onPointerMove={handleHeroCardPointerMove}
                  onPointerLeave={handleHeroCardPointerLeave}
                  className="gm-malak-sheen relative w-full rounded-2xl bg-gradient-to-br from-[#0A5C46] via-[#064E3B] to-[#043326] text-white shadow-2xl border border-white/15 overflow-hidden select-none transition-transform duration-200 ease-out"
                  style={{
                    transform: `perspective(820px) rotateY(${heroCardTilt.rotateY}deg) rotateX(${heroCardTilt.rotateX}deg)`,
                    boxShadow: '0 24px 48px -12px rgba(4, 47, 35, 0.65)',
                  }}
                >
                  <div className="px-6 pt-6 pb-10 flex items-center justify-between gap-4 relative z-10">
                    {/* Left Side of Card: Gharmalak Homeowners' Club */}
                    <div className="pr-2">
                      <div className="text-2xl sm:text-[26px] font-bold tracking-tight text-white leading-none">
                        Gharmalak
                      </div>
                      <div className="mt-1.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
                        {t.descriptor}
                      </div>
                    </div>

                    {/* Center Divider */}
                    <div className="h-14 w-px bg-white/20 shrink-0" aria-hidden="true" />

                    {/* Right Side of Card: Crown + The Malak Card + Founding Member */}
                    <div className="pl-1 flex flex-col items-start">
                      <div className="flex items-center justify-between w-full gap-3">
                        <span className="text-xs sm:text-sm font-medium text-white/90 leading-none">
                          The
                        </span>
                        {/* Crown SVG Icon */}
                        <svg
                          viewBox="0 0 24 20"
                          className="w-6 h-5 text-[#FFC928] fill-current shrink-0 -mt-1"
                          aria-hidden="true"
                        >
                          <path d="M2 16L4 6L9 11L12 3L15 11L20 6L22 16H2ZM2 18H22V20H2V18Z" />
                        </svg>
                      </div>
                      <div className="text-lg sm:text-xl font-bold text-[#FFC928] leading-tight mt-0.5 whitespace-nowrap">
                        Malak Card
                      </div>
                      <div className="text-[11px] font-medium text-[#FFC928]/85 mt-0.5">
                        {t.card_member}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Golden Wave Ribbon */}
                  <svg
                    viewBox="0 0 400 60"
                    preserveAspectRatio="none"
                    className="absolute bottom-0 inset-x-0 w-full h-9 pointer-events-none"
                    aria-hidden="true"
                  >
                    <path
                      d="M0,45 C90,15 170,15 260,38 C320,52 365,42 400,20 L400,60 L0,60 Z"
                      fill="#D4A437"
                      opacity="0.92"
                    />
                    <path
                      d="M0,52 C100,26 180,28 270,46 C330,58 370,48 400,30 L400,60 L0,60 Z"
                      fill="#043326"
                      opacity="0.55"
                    />
                  </svg>
                </div>
              </div>
            </HeroEntrance>
          </div>
        </div>
      </section>

      {/* 2. WHY GHARMALAK SECTION */}
      <section className="bg-[#F8F8F3] py-16 sm:py-20 border-b border-[#E4E9E3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Heading slides in from the left, Supporting description reveals from the right */}
            <div className="lg:col-span-7 space-y-4">
              <Reveal variant="slide-left" x={-36} duration={0.62} className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#064E3B]">
                  {t.st_over}
                </p>
                <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#073B30] leading-tight">
                  {t.st_title}
                </h2>
              </Reveal>
              <Reveal variant="slide-right" x={32} delay={0.1} duration={0.64}>
                <p className="text-base sm:text-lg text-[#073B30]/80 leading-relaxed max-w-2xl">
                  {t.st_body}
                </p>
              </Reveal>
            </div>

            {/* Right Column: Savings Highlight scales up smoothly with number-counting & rotating icon */}
            <Reveal
              variant="scale-up"
              scale={0.91}
              delay={0.12}
              duration={ANIMATION_TIMINGS.sectionSeconds}
              className="lg:col-span-5"
            >
              <div className="gm-card-hover rounded-2xl bg-white border border-[#E4E9E3] p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-5 pb-6 border-b border-[#E4E9E3]">
                  <Reveal
                    variant="rotate-in"
                    rotate={-20}
                    scale={0.8}
                    delay={0.18}
                    duration={ANIMATION_TIMINGS.cardSeconds}
                    className="gm-icon-badge flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#FFC928]/25 text-[#064E3B]"
                  >
                    <Coins className="h-8 w-8 text-[#064E3B]" />
                  </Reveal>
                  <div>
                    <div className="text-4xl sm:text-5xl font-bold text-[#064E3B] tabular-nums">
                      <CountUpNumber value={10} suffix="%" durationMs={720} />
                    </div>
                    <p className="text-sm sm:text-base font-medium text-[#073B30]/85 mt-0.5">
                      {t.stat_saving}
                    </p>
                  </div>
                </div>

                {/* Live Club Counters */}
                <div
                  role="list"
                  className="grid grid-cols-3 gap-4 pt-1 text-center sm:text-left"
                >
                  <Reveal variant="scale-up" scale={0.88} delay={0.22} duration={0.38}>
                    <div role="listitem">
                      <span className="block text-2xl sm:text-3xl font-bold text-[#073B30] tabular-nums">
                        <CountUpNumber value={stats.members} durationMs={620} />
                      </span>
                      <span className="text-xs text-[#073B30]/75">{t.stat_members}</span>
                    </div>
                  </Reveal>
                  <Reveal variant="scale-up" scale={0.88} delay={0.28} duration={0.38}>
                    <div role="listitem">
                      <span className="block text-2xl sm:text-3xl font-bold text-[#073B30] tabular-nums">
                        <CountUpNumber value={stats.optins} durationMs={620} />
                      </span>
                      <span className="text-xs text-[#073B30]/75">{t.stat_optins}</span>
                    </div>
                  </Reveal>
                  <Reveal variant="scale-up" scale={0.88} delay={0.34} duration={0.38}>
                    <div role="listitem">
                      <span className="block text-2xl sm:text-3xl font-bold text-[#073B30] tabular-nums">
                        <CountUpNumber value={LAUNCH_CITIES.length} durationMs={660} />
                      </span>
                      <span className="text-xs text-[#073B30]/75">{t.stat_cities}</span>
                    </div>
                  </Reveal>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 3. SOLO HOMEOWNER VS. GHARMALAK CLUB ROUND & INTERACTIVE SAVINGS ESTIMATOR */}
      <GroupComparisonSection />

      {/* 4. FEATURED ROOFTOP SOLAR DEAL */}
      <section className="bg-[#F8F8F3] py-16 sm:py-24 border-b border-[#E4E9E3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Five Interactive Solar Round Tabs */}
          <SolarRoundTabs
            rounds={solarRounds}
            selectedRoundId={selectedSolarRound.id}
            onSelectRound={setSelectedSolarRoundId}
            idPrefix="home-solar"
          />

          <div
            id={`home-solar-tabpanel-${selectedSolarRound.roundNumber}`}
            role="tabpanel"
            aria-labelledby={`home-solar-tab-${selectedSolarRound.roundNumber}`}
            className="group overflow-hidden rounded-3xl bg-white border border-[#E4E9E3] shadow-sm gm-card-hover transition-all duration-250 ease-out"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              {/* Left: Photograph reveals using a smooth diagonal clip-path animation */}
              <Reveal
                variant="clip-diagonal"
                scale={1.07}
                duration={0.78}
                className="lg:col-span-6 relative min-h-[280px] sm:min-h-[360px] overflow-hidden"
              >
                <ResilientImage
                  src={selectedSolarRound.image}
                  alt={selectedSolarRound.imageAlt}
                  className="gm-img-zoom h-full w-full object-cover object-center"
                  containerClassName="h-full w-full"
                />
                <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-[#042F23]/90 backdrop-blur-xs px-4 py-3 text-white text-xs sm:text-sm flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-medium">
                    <Sun className="w-4 h-4 text-[#FFC928] shrink-0" />
                    <span>{selectedSolarRound.systemCapacity}</span>
                  </span>
                  <span className="text-[#FFC928] font-semibold">
                    {selectedSolarRound.subsidyInformation.badgeLabel}
                  </span>
                </div>
              </Reveal>

              {/* Right: Deal information slides in from the right; price & metadata staggered */}
              <Reveal
                variant="slide-right"
                x={36}
                delay={0.08}
                duration={0.68}
                className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#064E3B]">
                    <span>{selectedSolarRound.eyebrow}</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#073B30]">
                    {selectedSolarRound.title}
                  </h2>

                  <p className="text-base font-medium text-[#064E3B]">
                    {selectedSolarRound.installationTimeline}
                  </p>

                  <p className="text-sm sm:text-base text-[#073B30]/80 leading-relaxed">
                    {selectedSolarRound.description}
                  </p>
                </div>

                {/* Compact Metadata Grid with Staggered Reveal */}
                <div className="grid grid-cols-2 gap-4 rounded-2xl bg-[#F8F8F3] border border-[#E4E9E3] p-4 sm:p-5">
                  <Reveal
                    variant="scale-up"
                    scale={0.92}
                    delay={0.16}
                    duration={0.38}
                    className="flex items-start gap-3"
                  >
                    <Calendar className="w-5 h-5 text-[#064E3B] shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-xs text-[#073B30]/70">Opt-in window</span>
                      <strong className="text-sm font-semibold text-[#073B30]">
                        {selectedSolarRound.optInWindowLabel}
                      </strong>
                    </div>
                  </Reveal>

                  <Reveal
                    variant="scale-up"
                    scale={0.92}
                    delay={0.22}
                    duration={0.38}
                    className="flex items-start gap-3"
                  >
                    <IndianRupee className="w-5 h-5 text-[#064E3B] shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-xs text-[#073B30]/70">
                        {selectedSolarRound.priceInformation.label}
                      </span>
                      <strong className="text-sm font-semibold text-[#073B30]">
                        {selectedSolarRound.priceInformation.value}
                      </strong>
                    </div>
                  </Reveal>

                  <Reveal
                    variant="scale-up"
                    scale={0.92}
                    delay={0.28}
                    duration={0.38}
                    className="flex items-start gap-3"
                  >
                    <Percent className="w-5 h-5 text-[#064E3B] shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-xs text-[#073B30]/70">
                        {selectedSolarRound.benchmarkInformation.label}
                      </span>
                      <strong className="text-sm font-semibold text-[#073B30]">
                        {selectedSolarRound.benchmarkInformation.value}
                      </strong>
                    </div>
                  </Reveal>

                  <Reveal
                    variant="scale-up"
                    scale={0.92}
                    delay={0.34}
                    duration={0.38}
                    className="flex items-start gap-3"
                  >
                    <Users className="w-5 h-5 text-[#064E3B] shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-xs text-[#073B30]/70">Minimum group</span>
                      <strong className="text-sm font-semibold text-[#073B30] tabular-nums">
                        {solarRoundProgress.participatingHomes} / {solarRoundProgress.minimumHomes}{' '}
                        {t.round_homes}
                      </strong>
                    </div>
                  </Reveal>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div
                    role="progressbar"
                    aria-valuenow={solarRoundProgress.participatingHomes}
                    aria-valuemin={0}
                    aria-valuemax={solarRoundProgress.minimumHomes}
                    aria-label={`${selectedSolarRound.tabLabel} ${t.round_homes}`}
                    className="h-2.5 w-full overflow-hidden rounded-full bg-[#EAF2E9]"
                  >
                    <div
                      className="h-full rounded-full bg-[#064E3B] transition-all duration-700 ease-out"
                      style={{ width: `${solarRoundProgress.barWidthPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#073B30]/75 tabular-nums">
                    <span>
                      <strong className="text-[#073B30]">
                        {solarRoundProgress.participatingHomes}
                      </strong>{' '}
                      / {solarRoundProgress.minimumHomes} {t.round_homes}
                    </span>
                    <span>
                      {t.round_closes}: {selectedSolarRound.closingDate}
                    </span>
                  </div>
                </div>

                {/* Primary CTA: Gentle scale and hover interaction */}
                <Reveal
                  variant="scale-up"
                  scale={0.92}
                  delay={0.38}
                  duration={0.42}
                  className="pt-1 flex flex-wrap items-center gap-4"
                >
                  <MagneticWrap>
                    <a
                      href={
                        selectedSolarRound.id === DEFAULT_SOLAR_ROUND_ID
                          ? '/round/solar-nagpur'
                          : `/round/solar-nagpur?round=${selectedSolarRound.id}`
                      }
                      onClick={(e) =>
                        handleNavClick(
                          e,
                          '/round/solar-nagpur',
                          undefined,
                          selectedSolarRound.id === DEFAULT_SOLAR_ROUND_ID
                            ? undefined
                            : `round=${selectedSolarRound.id}`
                        )
                      }
                      className="gm-btn-dark inline-flex items-center justify-center gap-2 rounded-xl bg-[#064E3B] px-6 py-3.5 text-sm sm:text-base font-semibold text-white hover:bg-[#073B30] whitespace-nowrap shrink-0"
                    >
                      <span>{t.round_cta}</span>
                      <ArrowRight className="gm-arrow-icon w-4 h-4" />
                    </a>
                  </MagneticWrap>

                  <span className="text-xs text-[#073B30]/70">
                    {selectedSolarRound.typicalSpendNote}
                  </span>
                </Reveal>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TWELVE-MONTH DEAL CALENDAR */}
      <section className="bg-white py-16 sm:py-24 border-b border-[#E4E9E3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <Reveal variant="slide-left" x={-32} className="space-y-2 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#064E3B]">
                {t.ahead_over}
              </p>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#073B30]">
                {t.ahead_title}
              </h2>
              <p className="text-base text-[#073B30]/80">{t.ahead_sub}</p>
              <p className="text-xs font-medium text-[#064E3B] pt-1 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span>{MEMBERSHIP_TRANSPARENCY_NOTICE}</span>
              </p>
            </Reveal>

            <Reveal variant="slide-right" x={28} delay={0.08} className="flex flex-wrap items-center gap-3">
              <a
                href="/deals"
                onClick={(e) => handleNavClick(e, '/deals')}
                className="gm-btn-secondary inline-flex items-center gap-2 rounded-xl bg-[#EAF2E9] hover:bg-[#dce8da] px-4 py-2.5 text-sm font-semibold text-[#064E3B] whitespace-nowrap shrink-0"
              >
                <span>{t.ahead_cta}</span>
                <ArrowRight className="gm-arrow-icon w-4 h-4" />
              </a>
            </Reveal>
          </div>

          {/* Interactive Season Filter Bar */}
          <Reveal variant="scale-up" scale={0.96} delay={0.06}>
            <div
              role="group"
              aria-label="Filter deals by season"
              className="flex flex-wrap items-center gap-1.5 p-1.5 mb-8 rounded-xl bg-[#F8F8F3] border border-[#E4E9E3] w-fit"
            >
              <button
                type="button"
                onClick={() => setActiveSeason('all')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
                  activeSeason === 'all'
                    ? 'bg-[#064E3B] text-white shadow-2xs'
                    : 'text-[#073B30]/80 hover:text-[#073B30]'
                }`}
              >
                All 23 Deals
              </button>
              {SEASON_CATEGORIES.map((season) => (
                <button
                  key={season.id}
                  type="button"
                  onClick={() => setActiveSeason(season.id)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
                    activeSeason === season.id
                      ? 'bg-[#064E3B] text-white shadow-2xs'
                      : 'text-[#073B30]/80 hover:text-[#073B30]'
                  }`}
                >
                  {season.name}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Seasonal Groups Grid: Alternating Seasonal Headings + Staggered Scale-In Deal Cards + Masked Zoom Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {visibleSeasons.map((season, seasonIndex) => {
              const seasonDeals = DEALS.filter((d) => d.seasonGroup === season.id);
              const headingDirection = getAlternatingDirection(seasonIndex);
              const seasonDelay = calculateStaggerDelay(seasonIndex, 0.04, 0.07, 0.36);
              const isSeasonExpanded = isSeasonGroupExpanded(expandedSeason, season.id);
              const seasonPanelId = `season-deals-panel-${season.id}`;
              const seasonHeaderId = `season-header-btn-${season.id}`;

              return (
                <div
                  key={season.id}
                  className={`rounded-2xl border ${season.borderClass} ${season.bgClass} p-5 flex flex-col justify-between transition-shadow duration-300 hover:shadow-xs`}
                >
                  <div>
                    {/* Seasonal heading: reveal from alternating directions, clickable dropdown header */}
                    <Reveal
                      variant={headingDirection}
                      x={seasonIndex % 2 === 0 ? -24 : 24}
                      delay={seasonDelay}
                      duration={0.44}
                    >
                      <button
                        id={seasonHeaderId}
                        type="button"
                        aria-expanded={isSeasonExpanded}
                        aria-controls={seasonPanelId}
                        onClick={() => handleToggleSeason(season.id)}
                        className={`w-full rounded-xl ${season.headerBgClass} px-4 py-2.5 flex items-center justify-between gap-2 text-left cursor-pointer select-none transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#064E3B]`}
                      >
                        <h3 className="text-xs font-bold tracking-[0.16em] uppercase text-[#073B30]">
                          {season.name}
                        </h3>
                        <span className="inline-flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-medium text-[#073B30]/75">
                            {seasonDeals.length} deals
                          </span>
                          <ChevronDown
                            aria-hidden="true"
                            className={`h-4 w-4 text-[#073B30]/75 transition-transform duration-300 ease-out ${
                              isSeasonExpanded ? 'rotate-180' : 'rotate-0'
                            }`}
                          />
                        </span>
                      </button>
                    </Reveal>

                    {/* Individual deal cards: smooth collapsible height, opacity, and staggered downward reveal */}
                    <div
                      id={seasonPanelId}
                      role="region"
                      aria-labelledby={seasonHeaderId}
                      aria-hidden={!isSeasonExpanded}
                      className={`grid transition-[grid-template-rows,opacity,margin-top] duration-300 ease-out ${
                        isSeasonExpanded
                          ? 'grid-rows-[1fr] opacity-100 mt-4'
                          : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
                      }`}
                    >
                      <div className="overflow-hidden min-h-0">
                        <div
                          className={`space-y-3 transition-transform duration-300 ease-out ${
                            isSeasonExpanded ? 'translate-y-0' : '-translate-y-1.5'
                          }`}
                        >
                          {seasonDeals.map((deal, dealIdx) => (
                            <div
                              key={deal.id}
                              style={{
                                transitionDelay: isSeasonExpanded ? `${dealIdx * 55}ms` : '0ms',
                              }}
                              className={`transition-all duration-300 ease-out ${
                                isSeasonExpanded
                                  ? 'opacity-100 translate-y-0 scale-100'
                                  : 'opacity-0 translate-y-2 scale-[0.98]'
                              }`}
                            >
                              <button
                                type="button"
                                tabIndex={isSeasonExpanded ? 0 : -1}
                                onClick={() => setSelectedDeal(deal)}
                                className="gm-deal-row-hover group w-full text-left rounded-xl bg-white border border-[#E4E9E3] p-3 hover:border-[#064E3B] flex items-center gap-3.5 cursor-pointer"
                              >
                                <div className="h-16 w-22 shrink-0 overflow-hidden rounded-lg bg-[#EAF2E9]">
                                  <ResilientImage
                                    src={deal.image}
                                    alt={deal.title}
                                    fallbackLabel={deal.title}
                                    className="gm-img-zoom h-full w-full object-cover"
                                    containerClassName="h-full w-full"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-[11px] font-medium text-[#064E3B] truncate">
                                    {deal.seasonLabel}
                                  </p>
                                  <h4 className="text-sm font-semibold text-[#073B30] leading-snug line-clamp-2 mt-0.5">
                                    {deal.title}
                                  </h4>
                                  <p className="text-xs text-[#073B30]/70 mt-1 tabular-nums truncate">
                                    {deal.ticket}
                                  </p>
                                </div>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTY DEAL: VEDIRA ANAND */}
      <section className="bg-white py-12 sm:py-16 border-b border-[#E4E9E3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-[#064E3B] to-[#043327] text-white overflow-hidden shadow-xl border border-[#0A5F48]">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              <div className="lg:col-span-5 relative min-h-[240px] sm:min-h-[280px] overflow-hidden bg-[#072B23]">
                <ResilientImage
                  src="/assets/aistudio/image_dc17df3b.png"
                  alt="Vedira Anand Featured Property Deal Gopal Nagar Nagpur"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
                <span className="absolute top-3 left-3 rounded-md bg-[#FFC928] text-[#073B30] text-[11px] font-black px-2.5 py-1 uppercase tracking-wider">
                  Featured Property Deal
                </span>
              </div>

              <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#FFC928]">
                      <Sparkles className="w-3.5 h-3.5" />
                      WallStone Realty Pvt. Ltd.
                    </span>
                    <span className="text-white/40">·</span>
                    <span className="inline-flex items-center gap-1 text-xs text-white/80">
                      <MapPin className="w-3.5 h-3.5 text-[#FFC928]" />
                      Plot No. 8, Dr. Padhan Layout, Gopal Nagar, Nagpur
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Vedira Anand · 2 & 3 BHK Luxurious Flats
                  </h2>
                  <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-xl">
                    Ground + 6 floors boutique residential building. Earthquake-resistant RCC construction, hydraulic car parking, 5 kW common solar power, and biometric thumbprint locks.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="rounded-lg bg-white/10 px-3 py-1 font-semibold text-white border border-white/15">
                      2 BHK · 1,292 sq. ft. (S-B/UP)
                    </span>
                    <span className="rounded-lg bg-white/10 px-3 py-1 font-semibold text-white border border-white/15">
                      3 BHK · 2,190 sq. ft. (S-B/UP)
                    </span>
                    <span className="rounded-lg bg-[#FFC928] px-3 py-1 font-bold text-[#073B30]">
                      Price on Request
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-white/15">
                  <div className="text-xs text-white/70">
                    <span className="text-white font-semibold">Free to browse:</span> Explore vector blueprints, specs & schedule site visit
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleNavClick(e, '/property/vedira-anand')}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FFC928] px-5 py-2.5 text-sm font-bold text-[#073B30] hover:bg-[#f3bc18] transition-all shadow-md cursor-pointer"
                  >
                    <span>Explore Vedira Anand</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHO IT IS FOR */}
      <section className="bg-[#F8F8F3] py-14 sm:py-20 border-b border-[#E4E9E3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="slide-left" x={-28} className="mb-7 sm:mb-8 max-w-2xl">
            <p className="text-xs sm:text-sm font-bold text-[#073B30]">
              {t.who_over}
            </p>
            <div
              aria-hidden="true"
              className="w-6 h-[3px] rounded-full bg-[#FFC928] mt-1.5 mb-2.5"
            />
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight text-[#073B30] leading-tight">
              {t.who_title}
            </h2>
          </Reveal>

          {/* Card 1: slide-left, Card 2: scale-up, Card 3: slide-right */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whoCards.map((card, index) => {
              const cardVariant = getWhoCardVariant(index);
              const cardDelay = calculateStaggerDelay(index, 0.06, 0.1, 0.35);
              return (
                <Reveal
                  key={card.id}
                  variant={cardVariant}
                  delay={cardDelay}
                  duration={0.54}
                  className="group gm-who-card-hover overflow-hidden rounded-2xl bg-white border border-[#E4E9E3] shadow-xs flex flex-col"
                >
                  <article className="flex flex-col flex-1">
                    {/* Photograph: subtle zoom reveal */}
                    <Reveal
                      variant="zoom-out-cinematic"
                      scale={1.08}
                      delay={cardDelay + 0.05}
                      duration={0.68}
                      className="aspect-[16/9] w-full overflow-hidden rounded-t-2xl bg-[#EAF2E9]"
                    >
                      <ResilientImage
                        src={card.image}
                        alt={card.alt}
                        className="gm-img-zoom h-full w-full object-cover object-center"
                        containerClassName="h-full w-full"
                      />
                    </Reveal>
                    {/* Title and description: staggered fade-in */}
                    <Reveal
                      variant="fade-up"
                      y={12}
                      delay={cardDelay + 0.12}
                      duration={0.42}
                      className="px-5 py-4 sm:px-6 sm:py-5 flex-1"
                    >
                      <h3 className="text-base sm:text-lg font-bold text-[#073B30] leading-snug">
                        {card.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#073B30]/80 leading-relaxed mt-1">
                        {card.body}
                      </p>
                    </Reveal>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. TRUST AND PROMISE SECTION */}
      <section className="bg-[#064E3B] text-white py-16 sm:py-24 transition-colors duration-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Main heading: reveal from the left */}
          <Reveal variant="slide-left" x={-36} className="max-w-4xl space-y-4 mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FFC928]">
              {t.not_over}
            </p>
            <h2 className="text-2xl sm:text-4xl lg:text-[40px] font-bold tracking-tight leading-tight text-white">
              {t.not_title}
            </h2>
          </Reveal>

          {/* Three benefit blocks: staggered entrance from alternating directions + rotating/scaling icons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 border-t border-white/15">
            <Reveal
              variant="slide-left"
              x={-30}
              delay={calculateStaggerDelay(0, 0.06, 0.1)}
              duration={0.5}
              className="gm-trust-block space-y-3 pt-4"
            >
              <Reveal
                variant="rotate-in"
                rotate={-18}
                scale={0.8}
                delay={0.12}
                duration={0.42}
                className="gm-icon-badge flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[#FFC928]"
              >
                <ShieldCheck className="h-6 w-6" />
              </Reveal>
              <h3 className="text-xl font-bold text-white">{t.why1_t}</h3>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed">{t.why1_b}</p>
            </Reveal>

            <Reveal
              variant="scale-up"
              scale={0.9}
              delay={calculateStaggerDelay(1, 0.06, 0.1)}
              duration={0.5}
              className="gm-trust-block space-y-3 pt-4"
            >
              <Reveal
                variant="rotate-in"
                rotate={16}
                scale={0.8}
                delay={0.22}
                duration={0.42}
                className="gm-icon-badge flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[#FFC928]"
              >
                <IndianRupee className="h-6 w-6" />
              </Reveal>
              <h3 className="text-xl font-bold text-white">{t.why2_t}</h3>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed">{t.why2_b}</p>
            </Reveal>

            <Reveal
              variant="slide-right"
              x={30}
              delay={calculateStaggerDelay(2, 0.06, 0.1)}
              duration={0.5}
              className="gm-trust-block space-y-3 pt-4"
            >
              <Reveal
                variant="rotate-in"
                rotate={-16}
                scale={0.8}
                delay={0.32}
                duration={0.42}
                className="gm-icon-badge flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[#FFC928]"
              >
                <Wrench className="h-6 w-6" />
              </Reveal>
              <h3 className="text-xl font-bold text-white">{t.why3_t}</h3>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed">{t.why3_b}</p>
            </Reveal>
          </div>

          {/* Coming soon homeowner vault note */}
          <Reveal
            variant="scale-up"
            scale={0.96}
            delay={0.26}
            className="mt-12 rounded-2xl bg-white/8 border border-white/15 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start sm:items-center gap-3.5">
              <Sparkles className="w-5 h-5 text-[#FFC928] shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <h4 className="text-sm font-semibold text-white">{t.why4_t}</h4>
                <p className="text-xs sm:text-sm text-white/80">{t.why4_b}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 8. FOUNDING MEMBERSHIP SECTION */}
      <section id="join" className="bg-[#F8F8F3] py-16 sm:py-24 border-b border-[#E4E9E3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="slide-left" x={-30} className="space-y-2 mb-12 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#064E3B]">
              {t.join_over}
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#073B30]">
              {t.plan_title}
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            {/* Left Column: Membership Card with 3D perspective reveal (no continuous float) & Seats Remaining Panel */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <Reveal
                variant="perspective-3d"
                rotate={10}
                scale={0.93}
                delay={0.06}
                duration={0.68}
                className="flex flex-col items-center lg:items-start"
              >
                <MalakCard
                  name="Rahul Joshi"
                  number="GM · 0002 · NGP"
                  label={t.card_member}
                  over={t.card_over}
                  variant="brass"
                  float={false}
                />
              </Reveal>

              {/* Separate Founding Seats Availability Panel */}
              <Reveal
                variant="slide-left"
                x={-24}
                delay={0.14}
                duration={0.5}
                className="gm-card-hover rounded-2xl bg-white border border-[#E4E9E3] p-6 space-y-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-[#073B30] tabular-nums">
                    {seatsLabel}
                  </span>
                  <span className="text-xs font-medium text-[#064E3B]">Nagpur Founding Batch</span>
                </div>

                <div
                  role="progressbar"
                  aria-valuenow={seatsInfo.joined}
                  aria-valuemin={0}
                  aria-valuemax={CLUB_CONFIG.foundingSeats}
                  aria-label={seatsLabel}
                  className="h-2.5 w-full overflow-hidden rounded-full bg-[#EAF2E9]"
                >
                  <div
                    className="h-full rounded-full bg-[#064E3B] transition-all duration-700 ease-out"
                    style={{ width: `${Math.max(seatsInfo.percentFull, 3)}%` }}
                  />
                </div>

                <p className="text-xs sm:text-sm text-[#073B30]/80 leading-relaxed">
                  {t.pay_credit}
                </p>
              </Reveal>
            </div>

            {/* Right Column: Founding Membership Pricing (Animated Count-Up) & Staggered Checkmark Benefits */}
            <Reveal
              variant="perspective-3d"
              rotate={7}
              scale={0.95}
              delay={0.12}
              duration={0.66}
              className="lg:col-span-7"
            >
              <div className="gm-card-hover h-full rounded-3xl bg-white border border-[#E4E9E3] p-6 sm:p-10 shadow-xs flex flex-col justify-between space-y-8">
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E4E9E3]">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#064E3B]">
                        {t.plan_badge}
                      </span>
                      <div className="mt-2 flex items-baseline gap-3 tabular-nums">
                        <s className="text-xl sm:text-2xl text-[#073B30]/45 font-medium">
                          {formatRupees(CLUB_CONFIG.regularFee)}
                        </s>
                        <span className="text-4xl sm:text-5xl font-bold text-[#073B30]">
                          <CountUpNumber value={CLUB_CONFIG.fee} prefix="₹" durationMs={720} />
                        </span>
                        <span className="text-base font-medium text-[#073B30]/75">
                          {t.plan_per}
                        </span>
                      </div>
                    </div>

                    <Reveal
                      variant="scale-up"
                      scale={0.88}
                      delay={0.22}
                      duration={0.38}
                      className="flex items-center gap-2 text-sm font-semibold text-[#064E3B]"
                    >
                      <BadgeCheck className="w-5 h-5 text-[#064E3B]" />
                      <span>{t.plan_save}</span>
                    </Reveal>
                  </div>

                  {/* Benefits Checklist: Staggered checkmark reveals */}
                  <ul className="space-y-4">
                    {[t.plan_t1, t.plan_t2, t.plan_t3, t.plan_t4].map((benefit, bIdx) => (
                      <li key={benefit}>
                        <Reveal
                          variant="slide-right"
                          x={22}
                          delay={calculateStaggerDelay(bIdx, 0.16, 0.07, 0.44)}
                          duration={0.42}
                          className="flex items-start gap-3.5 text-base text-[#073B30]"
                        >
                          <Reveal
                            variant="rotate-in"
                            rotate={-20}
                            scale={0.75}
                            delay={calculateStaggerDelay(bIdx, 0.19, 0.07, 0.46)}
                            duration={0.38}
                            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EAF2E9] text-[#064E3B]"
                          >
                            <Check className="h-4 w-4 stroke-[2.5]" />
                          </Reveal>
                          <span>{benefit}</span>
                        </Reveal>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA: Gentle scale-in and hover lift */}
                <Reveal
                  variant="scale-up"
                  scale={0.93}
                  delay={0.36}
                  duration={0.44}
                  className="space-y-3 pt-2"
                >
                  <MagneticWrap className="block w-full">
                    <a
                      href="/join"
                      onClick={(e) => handleNavClick(e, '/join')}
                      className="gm-btn-primary flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFC928] px-6 py-4 text-base font-bold text-[#073B30] shadow-xs hover:bg-[#f3bc18]"
                    >
                      <span>{t.hero_cta}</span>
                      <ArrowRight className="gm-arrow-icon w-5 h-5" />
                    </a>
                  </MagneticWrap>
                  <p className="text-center text-xs sm:text-sm text-[#073B30]/70">{t.plan_note}</p>
                </Reveal>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 9. FAQ SECTION */}
      <section className="bg-white py-16 sm:py-24 border-b border-[#E4E9E3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="slide-left" x={-28} className="mb-10">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#073B30]">
              {t.faq_title}
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {faqIds.map((id, index) => {
              const question = String(t[`faq${id}_q` as keyof typeof t]);
              const answer = String(t[`faq${id}_a` as keyof typeof t]);
              const isOpen = !!openFaqs[id];
              return (
                <FaqAccordionItem
                  key={id}
                  id={`home-${id}`}
                  index={index}
                  question={question}
                  answer={answer}
                  isOpen={isOpen}
                  onToggle={() => toggleFaq(id)}
                  delay={calculateStaggerDelay(index, 0.04, 0.06, 0.3)}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. FINAL CALL TO ACTION */}
      <section className="bg-[#F8F8F3] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="group overflow-hidden rounded-3xl bg-[#064E3B] text-white shadow-md grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Left: Slow cinematic zoom + subtle parallax movement */}
            <Reveal
              variant="zoom-out-cinematic"
              scale={1.1}
              duration={0.85}
              className="lg:col-span-5 relative min-h-[260px] sm:min-h-[320px] overflow-hidden"
            >
              <ParallaxWrap maxShiftPx={14} className="h-full w-full">
                <ResilientImage
                  src="/images/final-cta-home.jpg"
                  alt="Attractive Indian residential home in warm daylight"
                  className="gm-img-zoom h-full w-full object-cover object-center"
                  containerClassName="h-full w-full"
                />
              </ParallaxWrap>
              <div
                aria-hidden="true"
                className="hidden lg:block absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-[#064E3B]"
              />
            </Reveal>

            {/* Right: Heading reveals from the right, Buttons staggered scale-in */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-center space-y-6">
              <Reveal variant="slide-right" x={36} delay={0.08} duration={0.62} className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FFC928]">
                  {t.end_over}
                </p>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                  {t.end_title}
                </h2>
              </Reveal>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Reveal
                  variant="scale-up"
                  scale={0.88}
                  delay={0.18}
                  duration={0.44}
                  className="inline-flex"
                >
                  <MagneticWrap>
                    <a
                      href="/join"
                      onClick={(e) => handleNavClick(e, '/join')}
                      className="gm-btn-primary inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFC928] px-6 py-3.5 text-base font-semibold text-[#073B30] hover:bg-[#f3bc18] whitespace-nowrap shrink-0"
                    >
                      <span>{t.hero_cta}</span>
                      <ArrowRight className="gm-arrow-icon w-5 h-5" />
                    </a>
                  </MagneticWrap>
                </Reveal>

                <Reveal
                  variant="scale-up"
                  scale={0.88}
                  delay={0.26}
                  duration={0.44}
                  className="inline-flex"
                >
                  <a
                    href={buildWhatsAppUrl('Hi Gharmalak, I want to know more about the club.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gm-btn-secondary inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-base font-semibold text-white hover:bg-white/20 whitespace-nowrap shrink-0"
                  >
                    <MessageCircle className="w-5 h-5 text-[#FFC928]" />
                    <span>{t.hero_wa}</span>
                  </a>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEAL DETAIL MODAL */}
      {selectedDeal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="deal-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 transition-opacity duration-250 ease-out"
          onClick={() => setSelectedDeal(null)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white border border-[#E4E9E3] shadow-2xl transition-all duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-52 w-full bg-[#EAF2E9] overflow-hidden">
              <ResilientImage
                src={selectedDeal.image}
                alt={selectedDeal.title}
                className="h-full w-full object-cover"
                containerClassName="h-full w-full"
              />
              <button
                type="button"
                aria-label="Close deal details"
                onClick={() => setSelectedDeal(null)}
                className="absolute top-3 right-3 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-medium text-[#064E3B]">
                <span>Round {selectedDeal.round}</span>
                <span aria-hidden="true">·</span>
                <span>{getRoundForDeal(selectedDeal).install}</span>
                <span aria-hidden="true">·</span>
                <span>{TIER_LABELS[selectedDeal.tier]}</span>
              </div>

              <h3 id="deal-modal-title" className="text-2xl font-bold text-[#073B30]">
                {selectedDeal.title}
              </h3>

              <p className="text-lg font-semibold text-[#064E3B] tabular-nums">
                Typical spend: {selectedDeal.ticket}
              </p>

              <p className="text-sm sm:text-base text-[#073B30]/85 leading-relaxed">
                {selectedDeal.why}
              </p>

              <div className="rounded-xl bg-[#F8F8F3] border border-[#E4E9E3] p-4 space-y-1.5 text-xs sm:text-sm">
                <p>
                  <strong className="text-[#073B30]">Vendors &amp; brands:</strong>{' '}
                  <span className="text-[#073B30]/80">{selectedDeal.brands}</span>
                </p>
                <p>
                  <strong className="text-[#073B30]">Coverage:</strong>{' '}
                  <span className="text-[#073B30]/80">{REACH_LABELS[selectedDeal.reach]}</span>
                </p>
              </div>

              {canAccessMemberDeals(member) &&
                member?.unlockedDeals?.includes(selectedDeal.id) && (
                  <div
                    role="status"
                    data-testid="deal-unlocked-badge"
                    className="rounded-xl bg-[#EAF2E9] border border-[#CFE0CF] p-3.5 text-xs sm:text-sm font-medium text-[#064E3B] flex items-center gap-2"
                  >
                    <BadgeCheck className="h-4 w-4 shrink-0" />
                    <span>
                      {unlockedDealFeedback ||
                        `Deal unlocked for Member ${member.memberId}. You are registered for group pricing updates on ${selectedDeal.title}.`}
                    </span>
                  </div>
                )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  data-testid="modal-unlock-deal-btn"
                  disabled={unlockingDeal}
                  onClick={async () => {
                    const deal = selectedDeal;
                    if (!canAccessMemberDeals(member)) {
                      setSelectedDeal(null);
                      onRequireMembership?.({
                        type: 'unlock-deal',
                        label: `Unlock Deal · ${deal.title}`,
                        returnPath: '/',
                        dealId: deal.id,
                        dealTitle: deal.title,
                        createdAt: new Date().toISOString(),
                      });
                      return;
                    }
                    setUnlockingDeal(true);
                    setUnlockedDealFeedback(null);
                    try {
                      const res = await unlockMemberDeal(deal.id);
                      onMemberUpdated?.(res.member);
                      setUnlockedDealFeedback(
                        `Unlocked! Your member group price access for ${deal.title} is active (${res.member.memberId}).`
                      );
                    } catch (err) {
                      if (err instanceof MembershipRequiredError) {
                        setSelectedDeal(null);
                        onRequireMembership?.({
                          type: 'unlock-deal',
                          label: `Unlock Deal · ${deal.title}`,
                          returnPath: '/',
                          dealId: deal.id,
                          dealTitle: deal.title,
                          createdAt: new Date().toISOString(),
                        });
                      }
                    } finally {
                      setUnlockingDeal(false);
                    }
                  }}
                  className="gm-btn-primary inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FFC928] px-5 py-3 text-sm font-bold text-[#073B30] hover:bg-[#f3bc18] cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#064E3B]" />
                  <span>
                    {unlockingDeal
                      ? 'Unlocking…'
                      : canAccessMemberDeals(member) &&
                        member?.unlockedDeals?.includes(selectedDeal.id)
                      ? 'Deal Unlocked'
                      : 'Unlock Deal'}
                  </span>
                </button>

                {selectedDeal.roundHref ? (
                  <a
                    href={selectedDeal.roundHref}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedDeal(null);
                      onNavigate('/round/solar-nagpur');
                    }}
                    className="gm-btn-dark inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#064E3B] px-5 py-3 text-sm font-semibold text-white hover:bg-[#073B30]"
                  >
                    <span>See the solar round</span>
                    <ArrowRight className="gm-arrow-icon w-4 h-4" />
                  </a>
                ) : (
                  <a
                    href={`/deals?deal=${selectedDeal.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const deal = selectedDeal;
                      setSelectedDeal(null);
                      if (!canAccessMemberDeals(member)) {
                        onRequireMembership?.({
                          type: 'deal-interest',
                          label: `Register Interest · ${deal.title}`,
                          returnPath: '/deals',
                          returnHash: 'interest',
                          returnQuery: `deal=${deal.id}`,
                          dealId: deal.id,
                          dealTitle: deal.title,
                          createdAt: new Date().toISOString(),
                        });
                        return;
                      }
                      onNavigate('/deals', 'interest', `deal=${deal.id}`);
                    }}
                    className="gm-btn-dark inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#064E3B] px-5 py-3 text-sm font-semibold text-white hover:bg-[#073B30]"
                  >
                    <span>Register in group round</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXPLAINER VIDEO MODAL */}
      {showVideoModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.vid_label}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 transition-opacity duration-250 ease-out"
          onClick={() => setShowVideoModal(false)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-[#042F23] border border-white/20 shadow-2xl transition-all duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/15 text-white">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <PlayCircle className="w-5 h-5 text-[#FFC928]" />
                <span>{t.vid_label}</span>
                <span className="text-xs font-normal text-white/70">· {t.vid_note}</span>
              </div>
              <button
                type="button"
                aria-label="Close video"
                onClick={() => setShowVideoModal(false)}
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <video
                controls
                autoPlay
                playsInline
                poster="/videos/how-gharmalak-works-16x9.jpg"
                className="h-full w-full"
              >
                <source src="/videos/how-gharmalak-works-16x9.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
