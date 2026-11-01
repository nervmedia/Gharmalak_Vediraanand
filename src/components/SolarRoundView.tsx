import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Info,
  MessageCircle,
  ShieldCheck,
  Sun,
} from 'lucide-react';
import { useLang } from '../data/translations';
import { isValidIndianPhone } from '../data/clubData';
import {
  MEMBERSHIP_TRANSPARENCY_NOTICE,
  MemberProfile,
  PendingDealIntent,
  canAccessMemberDeals,
} from '../data/membershipData';
import {
  DEFAULT_SOLAR_ROUND_ID,
  SOLAR_ROUND_IDS,
  SolarRoundId,
  calculateSolarRoundProgress,
  getSolarRoundById,
  getSolarRoundWhatsAppUrl,
  getSolarRoundsData,
} from '../data/solarRoundsData';
import { ClubStats, submitRoundOptIn } from '../utils/api';
import { RoutePath } from './Header';
import { Reveal } from './MotionPrimitives';
import { ResilientImage } from './ResilientImage';
import { SolarInterestModal } from './SolarInterestModal';
import { SolarRoundTabs } from './SolarRoundTabs';

interface SolarRoundViewProps {
  stats: ClubStats;
  onStatsUpdated: () => void;
  onNavigate: (path: RoutePath) => void;
  member?: MemberProfile | null;
  onRequireMembership?: (intent: PendingDealIntent) => void;
  resumedRoundId?: SolarRoundId | null;
}

function getInitialSolarRoundId(): SolarRoundId {
  try {
    const param = new URLSearchParams(window.location.search).get('round');
    if (param && (SOLAR_ROUND_IDS as readonly string[]).includes(param)) {
      return param as SolarRoundId;
    }
  } catch {
    // ignore
  }
  return DEFAULT_SOLAR_ROUND_ID;
}

export function SolarRoundView({
  stats,
  onStatsUpdated,
  onNavigate,
  member = null,
  onRequireMembership,
  resumedRoundId = null,
}: SolarRoundViewProps) {
  const { lang, t } = useLang();
  const [selectedRoundId, setSelectedRoundId] = useState<SolarRoundId>(getInitialSolarRoundId);
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'busy' | 'done' | 'already' | 'notmember' | 'error'>(
    'idle'
  );
  const [addedOptin, setAddedOptin] = useState(0);
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);

  useEffect(() => {
    try {
      const savedPhone = member?.mobileNumber || localStorage.getItem('gm_phone');
      if (savedPhone) setPhone(savedPhone);
    } catch {
      // ignore
    }
  }, [member]);

  useEffect(() => {
    if (resumedRoundId && (SOLAR_ROUND_IDS as readonly string[]).includes(resumedRoundId)) {
      setSelectedRoundId(resumedRoundId);
    }
  }, [resumedRoundId]);

  const solarRounds = getSolarRoundsData(lang, stats.optins + addedOptin);
  const selectedRound = getSolarRoundById(solarRounds, selectedRoundId);
  const progress = calculateSolarRoundProgress(selectedRound);

  const handleSelectRound = (roundId: SolarRoundId) => {
    setSelectedRoundId(roundId);
    setStatus('idle');
    try {
      const url = new URL(window.location.href);
      if (roundId === DEFAULT_SOLAR_ROUND_ID) {
        url.searchParams.delete('round');
      } else {
        url.searchParams.set('round', roundId);
      }
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAccessMemberDeals(member)) {
      onRequireMembership?.({
        type: 'solar-optin',
        label: `Opt In · ${selectedRound.tabLabel}`,
        returnPath: '/round/solar-nagpur',
        returnQuery: `round=${selectedRound.id}`,
        roundId: selectedRound.id,
        roundNumber: selectedRound.roundNumber,
        createdAt: new Date().toISOString(),
      });
      return;
    }

    const phoneToUse = phone.trim() || member?.mobileNumber || '';
    if (!isValidIndianPhone(phoneToUse)) {
      setStatus('error');
      return;
    }
    setStatus('busy');
    const res = await submitRoundOptIn(phoneToUse, selectedRound.roundNumber);
    if (res.status === 'notmember') {
      setStatus('notmember');
      onRequireMembership?.({
        type: 'solar-optin',
        label: `Opt In · ${selectedRound.tabLabel}`,
        returnPath: '/round/solar-nagpur',
        returnQuery: `round=${selectedRound.id}`,
        roundId: selectedRound.id,
        roundNumber: selectedRound.roundNumber,
        createdAt: new Date().toISOString(),
      });
      return;
    }
    if (res.status === 'done' && res.created) {
      setAddedOptin((prev) => prev + 1);
      onStatsUpdated();
    }
    setStatus(res.status);
  };

  return (
    <div className="bg-[#F8F8F3] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Five Interactive Solar Round Tabs */}
        <SolarRoundTabs
          rounds={solarRounds}
          selectedRoundId={selectedRound.id}
          onSelectRound={handleSelectRound}
          idPrefix="solar-page"
        />

        {/* Active Solar Round Content Panel */}
        <div
          id={`solar-page-tabpanel-${selectedRound.roundNumber}`}
          role="tabpanel"
          aria-labelledby={`solar-page-tab-${selectedRound.roundNumber}`}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start transition-opacity duration-250 ease-out"
        >
          {/* Left Column: Solar Round Full Details */}
          <div className="lg:col-span-7 space-y-8">
            <Reveal variant="slide-left" x={-32} className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#064E3B]">
                <span>{selectedRound.eyebrow}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#073B30]">
                {selectedRound.title}
              </h1>
              <p className="text-sm sm:text-base font-medium text-[#064E3B]">
                {selectedRound.installationTimeline}
              </p>
              <p className="text-base sm:text-lg text-[#073B30]/85 leading-relaxed">
                {selectedRound.description}
              </p>
            </Reveal>

            <Reveal
              variant="clip-diagonal"
              scale={1.06}
              delay={0.08}
              duration={0.74}
              className="group gm-card-hover relative overflow-hidden rounded-2xl border border-[#E4E9E3] bg-white shadow-xs"
            >
              <div className="aspect-[16/9] w-full overflow-hidden">
                <ResilientImage
                  src={selectedRound.image}
                  alt={selectedRound.imageAlt}
                  className="gm-img-zoom h-full w-full object-cover"
                  containerClassName="h-full w-full"
                />
              </div>
              <div className="bg-[#042F23]/92 px-4 py-3 text-white text-xs sm:text-sm flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-medium">
                  <Sun className="w-4 h-4 text-[#FFC928] shrink-0" />
                  <span>{selectedRound.systemCapacity}</span>
                </span>
                <span className="text-[#FFC928] font-semibold">
                  {selectedRound.subsidyInformation.badgeLabel}
                </span>
              </div>
            </Reveal>

            {/* What you get (Benefits and Included Services) */}
            <Reveal
              variant="slide-left"
              x={-26}
              delay={0.12}
              className="gm-card-hover rounded-2xl bg-white border border-[#E4E9E3] p-6 sm:p-8 space-y-4"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#073B30]">
                {selectedRound.benefitsHeading}
              </h2>
              <ul className="space-y-3">
                {selectedRound.benefits.map((item, idx) => (
                  <li key={item}>
                    <Reveal
                      variant="slide-right"
                      x={18}
                      delay={0.14 + idx * 0.06}
                      duration={0.38}
                      className="flex items-start gap-3 text-base text-[#073B30]"
                    >
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EAF2E9] text-[#064E3B]">
                        <Check className="h-4 w-4 stroke-[2.5]" />
                      </div>
                      <span>{item}</span>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* PM Surya Ghar Subsidy & Eligibility Conditions */}
            <Reveal
              variant="slide-right"
              x={24}
              delay={0.14}
              className="gm-card-hover rounded-2xl bg-white border border-[#E4E9E3] p-6 sm:p-8 space-y-5"
            >
              <div className="rounded-xl bg-[#EAF2E9]/70 border border-[#CFE0CF] p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-sm font-bold text-[#064E3B]">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>{selectedRound.subsidyInformation.title}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#073B30]/85 leading-relaxed">
                  {selectedRound.subsidyInformation.details}
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-lg sm:text-xl font-bold text-[#073B30]">
                  {selectedRound.eligibilityHeading}
                </h2>
                <ul className="space-y-2.5">
                  {selectedRound.eligibility.map((cond) => (
                    <li
                      key={cond}
                      className="flex items-start gap-2.5 text-sm sm:text-base text-[#073B30]/90"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#064E3B]"
                      />
                      <span>{cond}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* How to take part */}
            <Reveal
              variant="scale-up"
              scale={0.95}
              delay={0.16}
              className="gm-card-hover rounded-2xl bg-white border border-[#E4E9E3] p-6 sm:p-8 space-y-5"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#073B30]">
                {selectedRound.howHeading}
              </h2>
              <ol className="space-y-4">
                {selectedRound.howSteps.map((step) => (
                  <li
                    key={step.stepNumber}
                    className="gm-step-card flex items-start gap-4 rounded-xl bg-[#F8F8F3] border border-[#E4E9E3] p-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#064E3B] text-xs font-bold text-[#FFC928] tabular-nums">
                      {step.stepNumber}
                    </span>
                    <div>
                      <p className="font-bold text-[#073B30]">{step.title}</p>
                      <p className="text-sm text-[#073B30]/80 mt-0.5">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>

          {/* Right Column: Sticky Deal Status & Opt-In Form */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            {/* Deal Status Card */}
            <Reveal variant="slide-right" x={30} delay={0.1}>
              <article className="gm-card-hover rounded-2xl bg-white border border-[#E4E9E3] p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-[#073B30]">
                    <Sun className="w-5 h-5 text-[#064E3B]" />
                    <span>
                      {t.i_solar} · Round {selectedRound.roundNumber}
                    </span>
                  </h2>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF2E9] px-3 py-1 text-xs font-semibold text-[#064E3B]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{selectedRound.status}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 rounded-xl bg-[#F8F8F3] border border-[#E4E9E3] p-4">
                  <div>
                    <span className="block text-xs text-[#073B30]/70">
                      {selectedRound.priceInformation.label}
                    </span>
                    <strong className="text-sm font-semibold text-[#073B30]">
                      {selectedRound.priceInformation.value}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-xs text-[#073B30]/70">
                      {selectedRound.benchmarkInformation.label}
                    </span>
                    <strong className="text-sm font-semibold text-[#073B30]">
                      {selectedRound.benchmarkInformation.value}
                    </strong>
                  </div>
                  <div className="pt-2 border-t border-[#E4E9E3]">
                    <span className="block text-xs text-[#073B30]/70">Opening date</span>
                    <strong className="text-sm font-semibold text-[#073B30]">
                      {selectedRound.openingDate}
                    </strong>
                  </div>
                  <div className="pt-2 border-t border-[#E4E9E3]">
                    <span className="block text-xs text-[#073B30]/70">Closing date</span>
                    <strong className="text-sm font-semibold text-[#073B30]">
                      {selectedRound.closingDate}
                    </strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <div
                    role="progressbar"
                    aria-valuenow={progress.participatingHomes}
                    aria-valuemin={0}
                    aria-valuemax={progress.minimumHomes}
                    aria-label={`${selectedRound.tabLabel} ${t.round_homes}`}
                    className="h-2.5 w-full overflow-hidden rounded-full bg-[#EAF2E9]"
                  >
                    <div
                      className="h-full rounded-full bg-[#064E3B] transition-all duration-700 ease-out"
                      style={{ width: `${progress.barWidthPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#073B30]/75 tabular-nums">
                    <span>
                      <strong className="text-[#073B30]">{progress.participatingHomes}</strong> /{' '}
                      {progress.minimumHomes} {t.round_homes}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#064E3B]" />
                      <span>
                        {t.round_closes}: {selectedRound.closingDate}
                      </span>
                    </span>
                  </div>
                </div>
              </article>
            </Reveal>

            {/* Opt-In Form */}
            <Reveal variant="perspective-3d" rotate={8} scale={0.95} delay={0.18}>
              <form
                onSubmit={handleSubmit}
                noValidate
                className="rounded-2xl bg-white border border-[#E4E9E3] p-6 shadow-xs space-y-5"
              >
                <div>
                  <h2 className="text-xl font-bold text-[#073B30]">
                    {selectedRound.optInInformation.title}
                  </h2>
                  <p className="text-sm text-[#073B30]/80 mt-1 leading-relaxed">
                    {selectedRound.optInInformation.body}
                  </p>
                  <p className="text-xs font-medium text-[#064E3B] mt-2 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                    <span>{MEMBERSHIP_TRANSPARENCY_NOTICE}</span>
                  </p>
                </div>

                {selectedRound.optInInformation.statusBannerText && (
                  <div
                    role="status"
                    className="flex items-start gap-2.5 rounded-xl bg-[#F8F8F3] border border-[#E4E9E3] p-3.5 text-xs sm:text-sm text-[#073B30]/85"
                  >
                    <Info className="h-4 w-4 text-[#064E3B] shrink-0 mt-0.5" />
                    <span>{selectedRound.optInInformation.statusBannerText}</span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="optin-phone"
                    className="block text-sm font-semibold text-[#073B30] mb-1.5"
                  >
                    {t.f_phone}
                  </label>
                  <div className="flex rounded-xl border border-[#E4E9E3] bg-[#F8F8F3] overflow-hidden focus-within:border-[#064E3B] focus-within:bg-white transition-colors">
                    <span className="inline-flex items-center px-3.5 text-sm font-semibold text-[#073B30]/70 border-r border-[#E4E9E3]">
                      +91
                    </span>
                    <input
                      id="optin-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/[^\d\s]/g, '').slice(0, 12));
                        setStatus('idle');
                      }}
                      className="w-full px-4 py-3 text-sm text-[#073B30] bg-transparent focus:outline-none"
                    />
                  </div>
                  {status === 'error' && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{t.f_err_phone}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  data-testid="solar-optin-submit-btn"
                  disabled={status === 'busy'}
                  className="gm-btn-primary w-full rounded-xl px-6 py-3.5 text-sm sm:text-base font-bold transition-colors bg-[#FFC928] text-[#073B30] hover:bg-[#f3bc18] cursor-pointer"
                >
                  {status === 'busy'
                    ? '…'
                    : selectedRound.isAcceptingOptIns
                    ? selectedRound.optInInformation.ctaLabel
                    : `Opt in to ${selectedRound.tabLabel}`}
                </button>

                {status === 'done' && (
                  <div
                    role="status"
                    data-testid="solar-optin-done-status"
                    className="rounded-xl bg-[#EAF2E9] border border-[#CFE0CF] p-4 text-sm font-medium text-[#064E3B]"
                  >
                    {t.r_opt_done} ({selectedRound.tabLabel})
                  </div>
                )}

                {status === 'already' && (
                  <div
                    role="status"
                    data-testid="solar-optin-already-status"
                    className="rounded-xl bg-[#EAF2E9] border border-[#CFE0CF] p-4 text-sm font-medium text-[#064E3B]"
                  >
                    {t.r_opt_already} ({selectedRound.tabLabel})
                  </div>
                )}

                {status === 'notmember' && (
                  <div
                    role="alert"
                    className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-[#073B30]"
                  >
                    <span>{t.r_opt_notmember} </span>
                    <a
                      href="/join"
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate('/join');
                      }}
                      className="font-bold text-[#064E3B] underline"
                    >
                      {t.nav_join}
                    </a>
                  </div>
                )}

                <a
                  href={getSolarRoundWhatsAppUrl(selectedRound)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gm-btn-secondary flex w-full items-center justify-center gap-2 rounded-xl border border-[#064E3B] bg-white px-5 py-3 text-sm font-semibold text-[#064E3B] hover:bg-[#EAF2E9]"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>{selectedRound.optInInformation.whatsappButtonLabel}</span>
                </a>

                <button
                  type="button"
                  data-testid="solar-im-interested-btn"
                  onClick={() => {
                    if (!canAccessMemberDeals(member)) {
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
                    setIsInterestModalOpen(true);
                  }}
                  className="gm-btn-dark flex w-full items-center justify-center gap-2 rounded-xl bg-[#064E3B] px-5 py-3 text-sm font-semibold text-white hover:bg-[#073B30] transition-all duration-250 cursor-pointer shadow-2xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#FFC928] shrink-0" />
                  <span>I&apos;m Interested</span>
                </button>
              </form>
            </Reveal>
          </aside>
        </div>
      </div>

      <SolarInterestModal
        isOpen={isInterestModalOpen}
        selectedRound={selectedRound}
        onClose={() => setIsInterestModalOpen(false)}
        onNavigate={onNavigate}
        member={member}
        onRequireMembership={onRequireMembership}
      />
    </div>
  );
}
