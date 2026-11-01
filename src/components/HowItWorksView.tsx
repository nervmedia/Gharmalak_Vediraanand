import React, { useState } from 'react';
import {
  ArrowRight,
  ClipboardList,
  Coins,
  IndianRupee,
  MessageCircle,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { useLang } from '../data/translations';
import { LAUNCH_CITIES, buildWhatsAppUrl } from '../data/clubData';
import { ClubStats } from '../utils/api';
import {
  ANIMATION_TIMINGS,
  calculateStaggerDelay,
  getHowStepVariant,
  getWhoCardVariant,
} from '../utils/animationHelpers';
import { RoutePath } from './Header';
import {
  CountUpNumber,
  FaqAccordionItem,
  MagneticWrap,
  ParallaxWrap,
  Reveal,
} from './MotionPrimitives';
import { ResilientImage } from './ResilientImage';

interface HowItWorksViewProps {
  stats: ClubStats;
  onNavigate: (path: RoutePath, hash?: string, query?: string) => void;
}

export function HowItWorksView({ stats, onNavigate }: HowItWorksViewProps) {
  const { t } = useLang();
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({
    5: true,
    1: false,
    2: false,
    3: false,
    4: false,
  });
  const [showVideoModal, setShowVideoModal] = useState(false);

  const toggleFaq = (id: number) => {
    setOpenFaqs((prev) => ({ ...prev, [id]: !prev[id] }));
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

  const whoCards = [
    {
      id: 1,
      title: t.who1_t,
      body: t.who1_b,
      detail:
        '3 kW rooftop solar with PM Surya Ghar paperwork, terrace waterproofing before the monsoon, exterior and interior painting, and solar water heaters.',
      image: '/images/independent-house.jpg',
      alt: 'Modern Indian independent house with landscaped garden and driveway',
    },
    {
      id: 2,
      title: t.who2_t,
      body: t.who2_b,
      detail:
        'Split air conditioners with installation, RO water purifiers, modular kitchens and wardrobes, energy-saving BLDC fans, and bathroom leak-proofing.',
      image: '/images/apartment-building.jpg',
      alt: 'Modern Indian residential apartment building with balconies and greenery',
    },
    {
      id: 3,
      title: t.who3_t,
      body: t.who3_b,
      detail:
        'Arrange dependable home upgrades and repairs for your parents in Nagpur from anywhere, with licence-checked vendors and our 5-year workmanship cover.',
      image: '/images/homeowners.jpg',
      alt: 'Older Indian homeowners in a comfortable residential setting',
    },
  ];

  const faqIds = [5, 1, 2, 3, 4] as const;

  return (
    <div>
      {/* 1. HOW A ROUND WORKS SECTION */}
      <section id="how" className="bg-white py-16 sm:py-24 border-b border-[#E4E9E3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <Reveal variant="slide-left" x={-32} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#064E3B]">
                {t.how_over}
              </p>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#073B30]">
                {t.how_title}
              </h1>
            </Reveal>

            {/* Explainer Video Trigger */}
            <Reveal variant="slide-right" x={28} delay={0.08} className="self-start md:self-auto">
              <button
                type="button"
                onClick={() => setShowVideoModal(true)}
                className="gm-btn-secondary inline-flex flex-wrap items-center gap-2 rounded-xl bg-[#EAF2E9] hover:bg-[#dce8da] border border-[#CFE0CF] px-4 py-2.5 text-sm font-semibold text-[#064E3B] cursor-pointer text-left"
              >
                <PlayCircle className="w-5 h-5 text-[#064E3B] shrink-0" />
                <span>{t.vid_label}</span>
                <span className="hidden sm:inline text-xs font-normal text-[#073B30]/75">
                  · {t.vid_note}
                </span>
              </button>
            </Reveal>
          </div>

          {/* 4 Step Cards: Step 1 left, Step 2 bottom, Step 3 right, Step 4 scale + Sequential Connectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howSteps.map((step, index) => {
              const Icon = step.Icon;
              const stepDelay = calculateStaggerDelay(index, 0.06, 0.11, 0.45);
              const { cardVariant, iconRotate, iconScale } = getHowStepVariant(index);
              return (
                <Reveal
                  key={step.num}
                  variant={cardVariant}
                  delay={stepDelay}
                  duration={0.5}
                  className="relative flex"
                >
                  <article className="gm-step-card relative flex flex-1 flex-col justify-between rounded-2xl bg-[#F8F8F3] border border-[#E4E9E3] p-6 sm:p-7 hover:border-[#064E3B]/40">
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-5">
                        <Reveal
                          variant="rotate-in"
                          rotate={iconRotate}
                          scale={iconScale}
                          delay={stepDelay + 0.08}
                          duration={0.42}
                          className="gm-icon-badge flex h-12 w-12 items-center justify-center rounded-xl bg-[#064E3B] text-[#FFC928]"
                        >
                          <Icon className="h-6 w-6" />
                        </Reveal>
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#EAF2E9] text-xs font-bold text-[#064E3B] tabular-nums">
                          {step.num}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-[#073B30] mb-2">{step.title}</h3>
                      <p className="text-sm text-[#073B30]/80 leading-relaxed">{step.body}</p>
                    </div>

                    {/* Connector draws sequentially between steps */}
                    {index < 3 && (
                      <Reveal
                        variant="clip-horizontal"
                        delay={stepDelay + 0.16}
                        duration={0.44}
                        className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-7 w-7 items-center justify-center rounded-full bg-white border border-[#E4E9E3] text-[#064E3B] shadow-2xs"
                      >
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Reveal>
                    )}
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. WHY GHARMALAK SECTION */}
      <section className="bg-[#F8F8F3] py-16 sm:py-20 border-b border-[#E4E9E3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Heading slides in from left, Description reveals from right */}
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

            {/* Right Column: Savings Highlight Panel & Verified Counters */}
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

      {/* 3. TRUST AND PROMISE SECTION */}
      <section className="bg-[#064E3B] text-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="slide-left" x={-36} className="max-w-4xl space-y-4 mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FFC928]">
              {t.not_over}
            </p>
            <h2 className="text-2xl sm:text-4xl lg:text-[40px] font-bold tracking-tight leading-tight text-white">
              {t.not_title}
            </h2>
          </Reveal>

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

      {/* 4. WHO IT IS FOR */}
      <section className="bg-[#F8F8F3] py-16 sm:py-24 border-b border-[#E4E9E3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="slide-left" x={-28} className="space-y-2 mb-12 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#064E3B]">
              {t.who_over}
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#073B30]">
              {t.who_title}
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whoCards.map((card, index) => {
              const cardVariant = getWhoCardVariant(index);
              const cardDelay = calculateStaggerDelay(index, 0.06, 0.1);
              return (
                <Reveal
                  key={card.id}
                  variant={cardVariant}
                  delay={cardDelay}
                  duration={0.54}
                  className="group gm-who-card-hover overflow-hidden rounded-2xl bg-white border border-[#E4E9E3] shadow-xs flex flex-col justify-between"
                >
                  <article className="flex flex-col flex-1 justify-between">
                    <Reveal
                      variant="zoom-out-cinematic"
                      scale={1.08}
                      delay={cardDelay + 0.05}
                      duration={0.68}
                      className="aspect-[4/3] w-full overflow-hidden bg-[#EAF2E9]"
                    >
                      <ResilientImage
                        src={card.image}
                        alt={card.alt}
                        className="gm-img-zoom h-full w-full object-cover object-center"
                        containerClassName="h-full w-full"
                      />
                    </Reveal>
                    <Reveal
                      variant="fade-up"
                      y={12}
                      delay={cardDelay + 0.12}
                      duration={0.42}
                      className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <h3 className="text-xl font-bold text-[#073B30]">{card.title}</h3>
                        <p className="text-base font-medium text-[#064E3B] mt-1">{card.body}</p>
                        <p className="text-sm text-[#073B30]/75 leading-relaxed mt-2">{card.detail}</p>
                      </div>
                    </Reveal>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
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
                  id={`how-${id}`}
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

      {/* 6. FINAL CALL TO ACTION */}
      <section className="bg-[#F8F8F3] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="group overflow-hidden rounded-3xl bg-[#064E3B] text-white shadow-md grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Left: Slow cinematic zoom + subtle parallax */}
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

            {/* Right: Heading reveals from right, Buttons staggered scale-in */}
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
