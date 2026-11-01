import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  ANIMATION_TIMINGS,
  EASING_PRESETS,
  RevealVariant,
  calculateMagneticOffset,
  getAlternatingDirection,
  getRevealVariantStyles,
  interpolateNumber,
  splitIntoWordGroups,
} from '../utils/animationHelpers';
import { formatIndianRupees } from '../utils/savingsEstimator';

/**
 * React hook that tracks prefers-reduced-motion media query.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/**
 * Hook that detects compact/mobile viewport (< 768px) to simplify heavy 3D/parallax effects.
 */
export function useIsMobileViewport(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return isMobile;
}

interface HeroEntranceProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
  scale?: number;
  variant?: RevealVariant;
  as?: 'div' | 'p' | 'h1' | 'h2' | 'span';
}

/**
 * Page-load entrance animation for Hero elements supporting directional, scale, and zoom-out reveals.
 */
export function HeroEntrance({
  children,
  className = '',
  delay = 0,
  duration = ANIMATION_TIMINGS.heroSeconds,
  y = 18,
  x = 0,
  scale = 1,
  variant = 'fade-up',
  as: Tag = 'div',
}: HeroEntranceProps) {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobileViewport();
  const [entered, setEntered] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setEntered(true);
      return;
    }
    const raf = requestAnimationFrame(() => {
      setEntered(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  const variantStyle = getRevealVariantStyles(variant, entered, {
    delay,
    duration,
    x,
    y,
    scale,
    isMobile,
  });

  const style: React.CSSProperties = reducedMotion
    ? {}
    : {
        ...variantStyle,
        willChange: entered ? 'auto' : 'opacity, transform',
      };

  return (
    <Tag className={className} style={style}>
      {children}
    </Tag>
  );
}

interface WordGroupHeadlineProps {
  text: string;
  className?: string;
  baseDelay?: number;
  stepDelay?: number;
  wordsPerGroup?: number;
}

/**
 * Reveals headline word groups sequentially from left to right on page load.
 */
export function WordGroupHeadline({
  text,
  className = '',
  baseDelay = 0.08,
  stepDelay = 0.065,
  wordsPerGroup = 2,
}: WordGroupHeadlineProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [entered, setEntered] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setEntered(true);
      return;
    }
    const raf = requestAnimationFrame(() => {
      setEntered(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  const groups = splitIntoWordGroups(text, wordsPerGroup);

  if (reducedMotion) {
    return <h1 className={className}>{text}</h1>;
  }

  return (
    <h1 className={className} aria-label={text}>
      {groups.map((chunk, idx) => {
        const delay = Number((baseDelay + idx * stepDelay).toFixed(3));
        return (
          <React.Fragment key={`${chunk}-${idx}`}>
            <span
              aria-hidden="true"
              className="inline-block"
              style={{
                opacity: entered ? 1 : 0,
                transform: entered
                  ? 'translate3d(0px, 0px, 0px)'
                  : 'translate3d(-18px, 6px, 0px)',
                transition: `opacity 0.62s ${EASING_PRESETS.snappyOut} ${delay}s, transform 0.62s ${EASING_PRESETS.snappyOut} ${delay}s`,
              }}
            >
              {chunk}
            </span>
            {idx < groups.length - 1 ? ' ' : ''}
          </React.Fragment>
        );
      })}
    </h1>
  );
}

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
  scale?: number;
  rotate?: number;
  variant?: RevealVariant;
  easing?: string;
  once?: boolean;
  amount?: number;
}

/**
 * Scroll-based reveal container supporting directional slides, scale/zoom, clip-paths,
 * 3D perspective, and rotating icon entrances.
 */
export function Reveal({
  children,
  className = '',
  delay = 0,
  duration = ANIMATION_TIMINGS.sectionSeconds,
  y,
  x,
  scale,
  rotate,
  variant = 'fade-up',
  easing,
  once = true,
  amount = 0.02,
}: RevealProps) {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobileViewport();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const checkInView = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 180) {
        setVisible(true);
        return true;
      }
      return false;
    };

    if (checkInView() && once) return;

    const onScroll = () => {
      if (checkInView() && once) {
        window.removeEventListener('scroll', onScroll);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight + 180) {
            setVisible(true);
            if (once) {
              observer.unobserve(entry.target);
              window.removeEventListener('scroll', onScroll);
            }
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      {
        threshold: 0.01,
        rootMargin: '0px 0px 180px 0px',
      }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [reducedMotion, once, amount]);

  const variantStyle = getRevealVariantStyles(variant, visible, {
    delay,
    duration,
    x,
    y,
    scale,
    rotate,
    easing,
    isMobile,
  });

  const style: React.CSSProperties = reducedMotion
    ? {}
    : {
        ...variantStyle,
        willChange: visible ? 'auto' : 'opacity, transform',
      };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

interface RevealTableRowProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  index?: number;
  direction?: 'left' | 'right' | 'alternate' | 'up';
}

/**
 * Scroll-triggered staggered reveal for table rows (`<tr>`), supporting alternating
 * left-to-right and right-to-left directional entrances.
 */
export function RevealTableRow({
  children,
  className = '',
  delay = 0,
  duration = ANIMATION_TIMINGS.cardSeconds,
  index = 0,
  direction = 'alternate',
}: RevealTableRowProps) {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobileViewport();
  const ref = useRef<HTMLTableRowElement>(null);
  const [visible, setVisible] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const checkInView = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 180) {
        setVisible(true);
        return true;
      }
      return false;
    };

    if (checkInView()) return;

    const onScroll = () => {
      if (checkInView()) {
        window.removeEventListener('scroll', onScroll);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight + 180) {
            setVisible(true);
            observer.unobserve(entry.target);
            window.removeEventListener('scroll', onScroll);
          }
        }
      },
      {
        threshold: 0.01,
        rootMargin: '0px 0px 180px 0px',
      }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [reducedMotion]);

  const offsetPx = isMobile ? 14 : 22;
  let initialTransform = 'translate3d(0px, 10px, 0px)';
  if (direction === 'left') {
    initialTransform = `translate3d(-${offsetPx}px, 0px, 0px)`;
  } else if (direction === 'right') {
    initialTransform = `translate3d(${offsetPx}px, 0px, 0px)`;
  } else if (direction === 'alternate') {
    const sign = index % 2 === 0 ? -1 : 1;
    initialTransform = `translate3d(${sign * offsetPx}px, 0px, 0px)`;
  }

  const style: React.CSSProperties = reducedMotion
    ? {}
    : {
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate3d(0px, 0px, 0px)' : initialTransform,
        transition: `opacity ${duration}s ${EASING_PRESETS.snappyOut} ${delay}s, transform ${duration}s ${EASING_PRESETS.snappyOut} ${delay}s`,
      };

  return (
    <tr ref={ref} className={className} style={style}>
      {children}
    </tr>
  );
}

interface AnimatedRupeeProps {
  value: number;
  durationMs?: number;
}

/**
 * Smoothly interpolates and formats an Indian Rupee integer when `value` changes.
 */
export function AnimatedRupee({ value, durationMs = 220 }: AnimatedRupeeProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [displayValue, setDisplayValue] = useState<number>(value);
  const prevValueRef = useRef<number>(value);

  useEffect(() => {
    const startVal = prevValueRef.current;
    const endVal = value;
    prevValueRef.current = endVal;

    if (prefersReducedMotion || startVal === endVal || durationMs <= 0) {
      setDisplayValue(endVal);
      return;
    }

    let rafId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const nextVal = interpolateNumber(startVal, endVal, progress, false);
      setDisplayValue(nextVal);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setDisplayValue(endVal);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value, durationMs, prefersReducedMotion]);

  return <>{formatIndianRupees(displayValue)}</>;
}

interface CountUpNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  formatLocale?: boolean;
}

/**
 * Animates a number from 0 to `value` when it enters the viewport, and smoothly
 * updates if `value` changes later.
 */
export function CountUpNumber({
  value,
  prefix = '',
  suffix = '',
  durationMs = 680,
  formatLocale = true,
}: CountUpNumberProps) {
  const reducedMotion = usePrefersReducedMotion();
  const spanRef = useRef<HTMLSpanElement>(null);
  const [hasEntered, setHasEntered] = useState(reducedMotion);
  const [displayValue, setDisplayValue] = useState<number>(value);
  const animatedOnceRef = useRef(false);

  useEffect(() => {
    if (reducedMotion) {
      setHasEntered(true);
      setDisplayValue(value);
      return;
    }
    const el = spanRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setHasEntered(true);
      return;
    }

    const checkInView = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 180) {
        setHasEntered(true);
        return true;
      }
      return false;
    };

    if (checkInView()) return;

    const onScroll = () => {
      if (checkInView()) {
        window.removeEventListener('scroll', onScroll);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight + 180) {
            setHasEntered(true);
            observer.unobserve(entry.target);
            window.removeEventListener('scroll', onScroll);
          }
        }
      },
      { threshold: 0.01, rootMargin: '0px 0px 180px 0px' }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [reducedMotion, value]);

  useEffect(() => {
    if (reducedMotion || !hasEntered) {
      setDisplayValue(value);
      return;
    }

    const fromVal = animatedOnceRef.current ? displayValue : 0;
    animatedOnceRef.current = true;
    if (fromVal === value) {
      setDisplayValue(value);
      return;
    }

    let rafId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      setDisplayValue(interpolateNumber(fromVal, value, progress, false));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setDisplayValue(value);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasEntered, value, durationMs, reducedMotion]);

  const formatted = formatLocale ? displayValue.toLocaleString('en-IN') : String(displayValue);

  return (
    <span ref={spanRef} className="tabular-nums">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

interface MagneticWrapProps {
  children: React.ReactNode;
  className?: string;
  maxOffset?: number;
}

/**
 * Subtle desktop-only magnetic hover wrapper for primary CTA buttons.
 */
export function MagneticWrap({
  children,
  className = 'inline-flex',
  maxOffset = 4,
}: MagneticWrapProps) {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobileViewport();
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || isMobile || e.pointerType === 'touch') return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width;
    const normY = (e.clientY - rect.top) / rect.height;
    setOffset(calculateMagneticOffset(normX, normY, maxOffset));
  };

  const handlePointerLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={className}
      style={
        reducedMotion || isMobile
          ? undefined
          : {
              transform: `translate3d(${offset.x}px, ${offset.y}px, 0px)`,
              transition:
                offset.x === 0 && offset.y === 0
                  ? `transform 0.32s ${EASING_PRESETS.springOut}`
                  : 'transform 0.09s linear',
            }
      }
    >
      {children}
    </div>
  );
}

interface ParallaxWrapProps {
  children: React.ReactNode;
  className?: string;
  maxShiftPx?: number;
}

/**
 * Subtle desktop scroll parallax wrapper for cinematic imagery.
 */
export function ParallaxWrap({
  children,
  className = '',
  maxShiftPx = 16,
}: ParallaxWrapProps) {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobileViewport();
  const ref = useRef<HTMLDivElement>(null);
  const [shiftY, setShiftY] = useState(0);

  useEffect(() => {
    if (reducedMotion || isMobile) {
      setShiftY(0);
      return;
    }

    let rafId = 0;
    const updateParallax = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      if (rect.bottom < 0 || rect.top > vh) return;
      const centerRatio = (rect.top + rect.height / 2 - vh / 2) / (vh / 2);
      const clamped = Math.max(-1, Math.min(1, centerRatio));
      setShiftY(Number((-clamped * maxShiftPx).toFixed(1)));
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
    };
  }, [reducedMotion, isMobile, maxShiftPx]);

  return (
    <div
      ref={ref}
      className={className}
      style={
        reducedMotion || isMobile
          ? undefined
          : {
              transform: `translate3d(0px, ${shiftY}px, 0px) scale(1.05)`,
              transition: 'transform 0.15s ease-out',
            }
      }
    >
      {children}
    </div>
  );
}

/**
 * Hook that returns `true` briefly whenever `value` changes (after initial mount),
 * used for subtle highlight feedback on dynamic calculation cards.
 */
export function useValueHighlight(value: number, pulseMs = 340): boolean {
  const [highlighted, setHighlighted] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    setHighlighted(true);
    const timer = window.setTimeout(() => setHighlighted(false), pulseMs);
    return () => window.clearTimeout(timer);
  }, [value, pulseMs]);

  return highlighted;
}

interface FaqAccordionItemProps {
  id: number | string;
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  delay?: number;
  index?: number;
}

/**
 * Accessible FAQ accordion item with alternating left/right directional reveal,
 * smooth height/opacity transition, and icon rotation.
 */
export function FaqAccordionItem({
  id,
  question,
  answer,
  isOpen,
  onToggle,
  delay = 0,
  index = 0,
}: FaqAccordionItemProps) {
  const panelId = `faq-panel-${id}`;
  const buttonId = `faq-btn-${id}`;
  const directionVariant = getAlternatingDirection(index);

  return (
    <Reveal
      variant={directionVariant}
      x={index % 2 === 0 ? -24 : 24}
      delay={delay}
      duration={ANIMATION_TIMINGS.cardSeconds}
      className={`rounded-2xl bg-[#F8F8F3] border transition-colors duration-250 overflow-hidden ${
        isOpen
          ? 'border-[#064E3B]/35 shadow-xs'
          : 'border-[#E4E9E3] hover:border-[#064E3B]/30'
      }`}
    >
      <button
        id={buttonId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 p-6 text-left font-semibold text-base sm:text-lg text-[#073B30] hover:bg-[#EAF2E9]/50 transition-colors duration-200 cursor-pointer"
      >
        <span>{question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-[#064E3B] transition-transform duration-300 ease-out ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        aria-hidden={!isOpen}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-[#073B30]/85 leading-relaxed border-t border-[#E4E9E3]/60">
            {answer}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
