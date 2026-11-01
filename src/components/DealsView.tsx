import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Building,
  Check,
  CloudRain,
  LocateFixed,
  MapPin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  CLUB_CONFIG,
  DEALS,
  DealInterestErrors,
  LAUNCH_CITIES,
  OTHER_CITIES,
  ROUNDS,
  TIER_LABELS,
  filterDealsByCity,
  findNearestCity,
  formatDateIN,
  formatRupees,
  normalizeIndianPhone,
  validateDealInterestForm,
} from '../data/clubData';
import {
  MEMBERSHIP_TRANSPARENCY_NOTICE,
  MemberProfile,
  PendingDealIntent,
  canAccessMemberDeals,
} from '../data/membershipData';
import {
  MembershipRequiredError,
  submitDealsInterest,
  unlockMemberDeal,
} from '../utils/api';
import {
  ANIMATION_TIMINGS,
  calculateStaggerDelay,
  getAlternatingDirection,
} from '../utils/animationHelpers';
import { RoutePath } from './Header';
import { Reveal } from './MotionPrimitives';
import { ResilientImage } from './ResilientImage';

interface DealsViewProps {
  initialDealId?: string | null;
  onNavigate: (path: RoutePath, hash?: string) => void;
  member?: MemberProfile | null;
  onRequireMembership?: (intent: PendingDealIntent) => void;
  onMemberUpdated?: (member: MemberProfile) => void;
}

export function DealsView({
  initialDealId,
  onNavigate,
  member = null,
  onRequireMembership,
  onMemberUpdated,
}: DealsViewProps) {
  const [pickedDeals, setPickedDeals] = useState<string[]>(
    initialDealId && DEALS.some((d) => d.id === initialDealId) ? [initialDealId] : []
  );
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [formCity, setFormCity] = useState('Nagpur');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locStatus, setLocStatus] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<DealInterestErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<{
    count: number;
    member: boolean;
  } | null>(null);

  useEffect(() => {
    if (initialDealId && DEALS.some((d) => d.id === initialDealId)) {
      setPickedDeals((prev) => (prev.includes(initialDealId) ? prev : [...prev, initialDealId]));
    }
  }, [initialDealId]);

  useEffect(() => {
    try {
      const savedPhone = localStorage.getItem('gm_phone');
      if (savedPhone) setPhone(savedPhone);
      const savedName = localStorage.getItem('gm_name');
      if (savedName) setName(savedName);
      const savedCity = localStorage.getItem('gm_city');
      if (savedCity) {
        setSelectedCity(savedCity);
        setFormCity(savedCity);
      }
    } catch {
      // ignore
    }
  }, []);

  const pickCity = (city: string) => {
    setSelectedCity(city);
    setFormCity(city);
    try {
      localStorage.setItem('gm_city', city);
    } catch {
      // ignore
    }
  };

  const detectCity = () => {
    if (!('geolocation' in navigator)) {
      setLocStatus('This browser cannot detect location. Pick your city below.');
      return;
    }
    setLocating(true);
    setLocStatus('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const res = findNearestCity(pos.coords.latitude, pos.coords.longitude);
        pickCity(res.city);
        setLocStatus(
          res.city === 'Other'
            ? 'You are not near a city we cover yet.'
            : `Found you near ${res.city}.`
        );
        setLocating(false);
      },
      () => {
        setLocStatus('Could not get your location. Pick your city below.');
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 3600000 }
    );
  };

  useEffect(() => {
    if (member) {
      if (member.name) setName(member.name);
      if (member.mobileNumber) setPhone(member.mobileNumber);
      if (member.city) setFormCity(member.city);
    }
  }, [member]);

  const toggleDeal = async (id: string) => {
    const dealObj = DEALS.find((d) => d.id === id);
    const dealTitle = dealObj ? dealObj.title : id;

    if (!canAccessMemberDeals(member)) {
      onRequireMembership?.({
        type: 'unlock-deal',
        label: `Unlock Deal · ${dealTitle}`,
        returnPath: '/deals',
        returnQuery: `deal=${id}`,
        dealId: id,
        dealTitle,
        createdAt: new Date().toISOString(),
      });
      return;
    }

    setPickedDeals((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    setErrors((prev) => ({ ...prev, deals: undefined }));

    try {
      const res = await unlockMemberDeal(id);
      onMemberUpdated?.(res.member);
    } catch (err) {
      if (err instanceof MembershipRequiredError) {
        onRequireMembership?.({
          type: 'unlock-deal',
          label: `Unlock Deal · ${dealTitle}`,
          returnPath: '/deals',
          returnQuery: `deal=${id}`,
          dealId: id,
          dealTitle,
          createdAt: new Date().toISOString(),
        });
      }
    }
  };

  const isLaunchCity = !selectedCity || (LAUNCH_CITIES as readonly string[]).includes(selectedCity);
  const visibleDeals = filterDealsByCity(selectedCity);
  const nagpurOnlyCount = DEALS.length - visibleDeals.length;
  const todayISO = new Date().toISOString().slice(0, 10);
  const displayCityName = selectedCity === 'Other' ? 'your city' : selectedCity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAccessMemberDeals(member)) {
      const firstId = pickedDeals[0] || initialDealId || 'rooftop-solar';
      const firstDeal = DEALS.find((d) => d.id === firstId);
      onRequireMembership?.({
        type: 'deal-interest',
        label: firstDeal ? `Unlock Deal · ${firstDeal.title}` : 'Unlock Group Deals',
        returnPath: '/deals',
        returnHash: 'interest',
        returnQuery: firstDeal ? `deal=${firstDeal.id}` : undefined,
        dealId: firstDeal?.id,
        dealTitle: firstDeal?.title,
        createdAt: new Date().toISOString(),
      });
      return;
    }

    const validation = validateDealInterestForm({
      deals: pickedDeals,
      name,
      phone,
      city: formCity,
      consent,
    });
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    try {
      const res = await submitDealsInterest({
        deals: pickedDeals,
        name: name.trim(),
        phone: normalizeIndianPhone(phone),
        city: formCity,
        consent,
        source: 'deals-page',
      });
      setSubmittedResult(res);
    } catch (err) {
      if (err instanceof MembershipRequiredError) {
        onRequireMembership?.({
          type: 'deal-interest',
          label: 'Unlock Group Deals',
          returnPath: '/deals',
          returnHash: 'interest',
          createdAt: new Date().toISOString(),
        });
      } else {
        setErrors({
          server: 'Something went wrong. Please try again, or message us on WhatsApp.',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F8F8F3] min-h-screen">
      {/* Header Banner */}
      <section className="bg-[#064E3B] text-white py-14 sm:py-18">
        <Reveal y={18} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FFC928]">
            Free to browse · No payment to show interest
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Every deal for the <em className="not-italic text-[#FFC928]">next 12 months.</em>
          </h1>
          <p className="text-base sm:text-lg text-white/85 max-w-3xl leading-relaxed">
            Deals run in rounds, named by when the work is done. You opt in during the two months
            before, vendors bid for the whole group, and installation follows. Nothing is installed
            in the monsoon. Round 1 is rooftop solar: opt in from 1 November, installed in January.
          </p>
          <p className="flex items-center gap-2 text-sm text-[#FFC928] pt-1">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>{MEMBERSHIP_TRANSPARENCY_NOTICE}</span>
          </p>
        </Reveal>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* City Filter Panel */}
          <Reveal y={16} className="rounded-2xl bg-white border border-[#E4E9E3] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#064E3B]">
                  Deals near you
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-[#073B30] mt-0.5">
                  {selectedCity
                    ? isLaunchCity
                      ? `Deals in ${selectedCity}`
                      : `Not in ${displayCityName} yet`
                    : 'All launch cities'}
                </h2>
              </div>

              <button
                type="button"
                onClick={detectCity}
                disabled={locating}
                className="gm-btn-secondary inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-[#CFE0CF] bg-[#EAF2E9] px-4 py-2.5 text-sm font-semibold text-[#064E3B] hover:bg-[#dce8da] cursor-pointer"
              >
                <LocateFixed className="w-4 h-4" />
                <span>{locating ? 'Finding you…' : 'Detect my city'}</span>
              </button>
            </div>

            {locStatus && (
              <p role="status" className="text-sm font-medium text-[#064E3B]">
                {locStatus}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-pressed={selectedCity === null}
                onClick={() => setSelectedCity(null)}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  selectedCity === null
                    ? 'bg-[#064E3B] text-white'
                    : 'bg-[#F8F8F3] text-[#073B30] border border-[#E4E9E3] hover:bg-[#EAF2E9]'
                }`}
              >
                All cities
              </button>
              {LAUNCH_CITIES.map((city) => (
                <button
                  key={city}
                  type="button"
                  aria-pressed={selectedCity === city}
                  onClick={() => pickCity(city)}
                  className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    selectedCity === city
                      ? 'bg-[#064E3B] text-white'
                      : 'bg-[#F8F8F3] text-[#073B30] border border-[#E4E9E3] hover:bg-[#EAF2E9]'
                  }`}
                >
                  {city}
                </button>
              ))}

              <select
                aria-label="Another city"
                value={selectedCity && !isLaunchCity ? selectedCity : ''}
                onChange={(e) => e.target.value && pickCity(e.target.value)}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold border transition-colors cursor-pointer ${
                  selectedCity && !isLaunchCity
                    ? 'bg-[#064E3B] text-white border-[#064E3B]'
                    : 'bg-[#F8F8F3] text-[#073B30] border-[#E4E9E3]'
                }`}
              >
                <option value="">Another city…</option>
                {[...OTHER_CITIES, 'Other'].map((c) => (
                  <option key={c} value={c} className="bg-white text-[#073B30]">
                    {c === 'Other' ? 'Somewhere else' : c}
                  </option>
                ))}
              </select>
            </div>

            {selectedCity && !isLaunchCity && (
              <p className="text-sm text-[#073B30]/80">
                We start in Maharashtra cities on MSEDCL power, where one solar installer can cover
                them all: {LAUNCH_CITIES.join(', ')}. Tap the deals you would want anyway; we count{' '}
                {selectedCity === 'Other' ? 'each city' : selectedCity}&apos;s interest to decide
                where we go next.
              </p>
            )}

            {selectedCity && isLaunchCity && nagpurOnlyCount > 0 && (
              <p className="text-sm text-[#073B30]/80">
                {nagpurOnlyCount} more deals need a local crew and start in Nagpur first.
              </p>
            )}

            <p className="text-xs text-[#073B30]/65">
              Your location stays on your phone. We only use it to pick your city.
            </p>
          </Reveal>

          {/* Featured Property Deal Spotlight: Vedira Anand */}
          <Reveal y={18} className="rounded-3xl bg-gradient-to-br from-[#064E3B] to-[#043327] text-white overflow-hidden shadow-lg border border-[#0A5F48]">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              <div className="lg:col-span-5 relative min-h-[220px] sm:min-h-[260px] overflow-hidden bg-[#072B23]">
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
                    Vedira Anand
                  </h2>
                  <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                    A scheme of 2 & 3 BHK luxurious flats. Boutique Ground + 6 floors with earthquake-resistant RCC frame, hydraulic stacker parking, 5 kW common solar power, and biometric thumbprint locks.
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
                    <span className="text-white font-semibold">Free to browse:</span> View floor plans, specs & submit direct enquiry
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate('/property/vedira-anand')}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FFC928] px-5 py-2.5 text-sm font-bold text-[#073B30] hover:bg-[#f3bc18] transition-all shadow-md cursor-pointer"
                  >
                    <span>View Project Details & Floor Plans</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </Reveal>

          {/* 5 Rounds List */}
          <div className="space-y-12">
            {ROUNDS.map((round) => {
              const roundDeals = visibleDeals.filter((d) => d.round === round.n);
              if (!roundDeals.length) return null;

              const statusLabel =
                todayISO < round.optInFrom
                  ? `Opt-ins open ${formatDateIN(round.optInFrom)}`
                  : todayISO <= round.optInTo
                  ? 'Opt-ins open now'
                  : 'Opt-ins closed';

              return (
                <section key={round.n} aria-label={`Round ${round.n}`} className="space-y-5">
                  {round.n === 4 && (
                    <Reveal y={14} className="rounded-2xl bg-[#EBF3F5] border border-[#C9DEE3] p-4 sm:p-5 flex items-center gap-3 text-sm font-medium text-[#073B30]">
                      <CloudRain className="w-5 h-5 text-[#064E3B] shrink-0" />
                      <span>
                        June to September: no installations during the monsoon. We use these months
                        to collect opt-ins for October.
                      </span>
                    </Reveal>
                  )}

                  <Reveal
                    variant={getAlternatingDirection(round.n)}
                    x={round.n % 2 === 0 ? -26 : 26}
                    className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#E4E9E3] pb-3"
                  >
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#073B30]">
                        Round {round.n} · installed {round.install}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#073B30]/75 mt-0.5">
                        Opt in {formatDateIN(round.optInFrom)} to {formatDateIN(round.optInTo)}
                      </p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#064E3B]">
                      {statusLabel}
                    </span>
                  </Reveal>

                  <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roundDeals.map((deal, dealIndex) => {
                      const isPicked = pickedDeals.includes(deal.id);
                      const dealDelay = calculateStaggerDelay(dealIndex, 0.03, 0.05, 0.28);
                      return (
                        <li
                          key={deal.id}
                          className={`group gm-card-hover rounded-2xl bg-white border overflow-hidden flex flex-col justify-between ${
                            isPicked
                              ? 'border-[#064E3B] ring-2 ring-[#064E3B]/20 shadow-sm'
                              : 'border-[#E4E9E3] hover:border-[#064E3B]/50'
                          }`}
                        >
                          <Reveal
                            variant="scale-up"
                            scale={0.92}
                            delay={dealDelay}
                            duration={ANIMATION_TIMINGS.cardSeconds}
                            className="flex flex-1 flex-col justify-between"
                          >
                            <div>
                              <Reveal
                                variant="mask-zoom"
                                scale={1.08}
                                delay={dealDelay + 0.04}
                                duration={0.54}
                                className="aspect-[16/10] w-full overflow-hidden bg-[#EAF2E9] relative"
                              >
                                <ResilientImage
                                  src={deal.image}
                                  alt={deal.title}
                                  className="gm-img-zoom h-full w-full object-cover"
                                  containerClassName="h-full w-full"
                                />
                              </Reveal>

                              <div className="p-5 space-y-2.5">
                                <div className="flex items-center gap-2 text-xs text-[#064E3B] font-semibold">
                                  <span>{TIER_LABELS[deal.tier]}</span>
                                  {deal.roundHref && (
                                    <>
                                      <span aria-hidden="true">·</span>
                                      <span className="text-[#073B30] font-bold">Launch deal</span>
                                    </>
                                  )}
                                </div>

                                <h3 className="text-lg font-bold text-[#073B30]">{deal.title}</h3>
                                <p className="text-sm font-semibold text-[#064E3B] tabular-nums">
                                  {deal.ticket}
                                </p>
                                <p className="text-sm text-[#073B30]/80 leading-relaxed">
                                  {deal.why}
                                </p>
                                <p className="text-xs text-[#073B30]/65 pt-1">{deal.brands}</p>
                              </div>
                            </div>

                            <div className="px-5 pb-5 pt-2 flex items-center justify-between gap-3 border-t border-[#E4E9E3]/60">
                              <button
                                type="button"
                                aria-pressed={isPicked}
                                onClick={() => toggleDeal(deal.id)}
                                className={`gm-btn-secondary inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold cursor-pointer ${
                                  isPicked
                                    ? 'bg-[#064E3B] text-white'
                                    : 'bg-[#EAF2E9] text-[#064E3B] hover:bg-[#dce8da]'
                                }`}
                              >
                                {isPicked && <Check className="w-3.5 h-3.5" />}
                                <span>{isPicked ? 'Interested' : "I'm interested"}</span>
                              </button>

                              {deal.roundHref && (
                                <a
                                  href={deal.roundHref}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    onNavigate('/round/solar-nagpur');
                                  }}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#064E3B] hover:underline"
                                >
                                  <span>See the round</span>
                                  <ArrowRight className="gm-arrow-icon w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </Reveal>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              );
            })}
          </div>

          <p className="text-xs sm:text-sm text-[#073B30]/70">
            Prices are typical spends per home, not quotes. Deals marked for a local crew start in
            Nagpur and follow in other cities as we sign crews. Brand names show the kind of vendor
            we work with, not a signed partnership.
          </p>

          {/* Free Notification Signup Form */}
          <div id="interest" className="mx-auto max-w-2xl pt-4">
            {submittedResult ? (
              <div className="rounded-2xl bg-white border border-[#E4E9E3] p-8 shadow-xs space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#064E3B]">
                  You&apos;re on the list
                </p>
                <h2 className="text-2xl font-bold text-[#073B30]">
                  We&apos;ll message you when{' '}
                  {submittedResult.count === 1
                    ? 'this round opens'
                    : `these ${submittedResult.count} rounds open`}
                  .
                </h2>
                {submittedResult.member ? (
                  <p className="text-sm sm:text-base text-[#073B30]/80">
                    You&apos;re already a member, so you&apos;ll get the group price. Thank you.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm sm:text-base text-[#073B30]/80 leading-relaxed">
                      Showing interest is free. To buy at the group price when a round opens, you
                      need a membership: {formatRupees(CLUB_CONFIG.fee)} for your first year if you
                      join by 31 December (it&apos;s {formatRupees(CLUB_CONFIG.regularFee)} a year
                      after that), and the first 1,000 Nagpur members get it back on their first
                      deal.
                    </p>
                    <a
                      href="/join"
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate('/join');
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#FFC928] px-6 py-3.5 text-sm font-bold text-[#073B30] hover:bg-[#f3bc18]"
                    >
                      <span>Join the club</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    <p className="text-xs text-[#073B30]/65">
                      No rush. You can join when the round you want opens.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="rounded-2xl bg-white border border-[#E4E9E3] p-6 sm:p-8 shadow-xs space-y-5"
              >
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#073B30]">
                    Tell me when these open
                  </h2>
                  <p className="text-sm text-[#073B30]/75 mt-1">
                    {pickedDeals.length
                      ? `${pickedDeals.length} deal${pickedDeals.length > 1 ? 's' : ''} picked.`
                      : 'Pick deals above first.'}{' '}
                    Free, no payment.
                  </p>
                  {errors.deals && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errors.deals}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="dname" className="block text-sm font-semibold text-[#073B30] mb-1.5">
                    Your name
                  </label>
                  <input
                    id="dname"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 120))}
                    aria-invalid={!!errors.name}
                    className="w-full rounded-xl border border-[#E4E9E3] bg-[#F8F8F3] px-4 py-3 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                  />
                  {errors.name && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="dphone" className="block text-sm font-semibold text-[#073B30] mb-1.5">
                    WhatsApp number
                  </label>
                  <div className="flex rounded-xl border border-[#E4E9E3] bg-[#F8F8F3] overflow-hidden focus-within:border-[#064E3B] focus-within:bg-white">
                    <span className="inline-flex items-center px-3.5 text-sm font-semibold text-[#073B30]/70 border-r border-[#E4E9E3]">
                      +91
                    </span>
                    <input
                      id="dphone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.slice(0, 14))}
                      aria-invalid={!!errors.phone}
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

                <fieldset className="space-y-2">
                  <legend className="text-sm font-semibold text-[#073B30]">City</legend>
                  <div className="flex flex-wrap gap-2">
                    {LAUNCH_CITIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-pressed={formCity === c}
                        onClick={() => setFormCity(c)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                          formCity === c
                            ? 'bg-[#064E3B] text-white'
                            : 'bg-[#F8F8F3] text-[#073B30] border border-[#E4E9E3]'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label className="flex items-start gap-2.5 text-xs sm:text-sm text-[#073B30]/85 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-[#E4E9E3] text-[#064E3B] focus:ring-[#064E3B]"
                    />
                    <span>
                      Message me on WhatsApp about these deals. I can reply STOP anytime. Gharmalak
                      never sells my data (
                      <a
                        href="/privacy"
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate('/privacy');
                        }}
                        className="underline font-medium text-[#064E3B]"
                      >
                        privacy
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

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-[#FFC928] px-6 py-3.5 text-sm sm:text-base font-bold text-[#073B30] hover:bg-[#f3bc18] transition-colors cursor-pointer"
                >
                  {submitting ? 'Saving…' : 'Notify me, free'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
