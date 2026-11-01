export const ANIMATION_TIMINGS = {
  hoverSeconds: 0.22, // 180–250ms
  cardSeconds: 0.42, // 300–450ms
  sectionSeconds: 0.66, // 500–750ms
  heroSeconds: 0.88, // 700–1000ms
  easeOutCurve: [0.22, 1, 0.36, 1] as const,
} as const;

export const EASING_PRESETS = {
  smoothOut: 'cubic-bezier(0.22, 1, 0.36, 1)',
  snappyOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
  cinematic: 'cubic-bezier(0.25, 0.85, 0.35, 1)',
  springOut: 'cubic-bezier(0.34, 1.28, 0.64, 1)',
  perspectiveOut: 'cubic-bezier(0.19, 1, 0.22, 1)',
} as const;

export type RevealVariant =
  | 'fade-up'
  | 'fade-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale-up'
  | 'zoom-out-cinematic'
  | 'clip-horizontal'
  | 'clip-diagonal'
  | 'mask-zoom'
  | 'perspective-3d'
  | 'rotate-in';

export interface RevealVariantOptions {
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  easing?: string;
  isMobile?: boolean;
}

/**
 * Smooth cubic ease-out curve for natural deceleration.
 */
export function easeOutCubic(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - clamped, 3);
}

/**
 * Smoothly interpolates between two integer numbers using cubic ease-out.
 * Guarantees exact target value at progress >= 1 or when reducedMotion is active.
 */
export function interpolateNumber(
  from: number,
  to: number,
  progress: number,
  reducedMotion = false
): number {
  if (reducedMotion || progress >= 1 || from === to) {
    return Math.round(to);
  }
  if (progress <= 0) {
    return Math.round(from);
  }
  const eased = easeOutCubic(progress);
  return Math.round(from + (to - from) * eased);
}

/**
 * Calculates a bounded stagger delay in seconds for sequential card/row/step reveals.
 */
export function calculateStaggerDelay(
  index: number,
  baseDelaySeconds = 0.05,
  stepSeconds = 0.08,
  maxDelaySeconds = 0.45
): number {
  const safeIndex = Math.max(0, Math.floor(index));
  const raw = baseDelaySeconds + safeIndex * stepSeconds;
  return Number(Math.min(maxDelaySeconds, Math.max(0, raw)).toFixed(3));
}

/**
 * Calculates subtle 3D perspective tilt angles from normalized pointer coordinates [0..1].
 */
export function calculateCardTilt(
  normX: number,
  normY: number,
  maxRotateX = 8,
  maxRotateY = 12,
  baseRotateX = 0,
  baseRotateY = 0
): { rotateX: number; rotateY: number } {
  const clampedX = Math.max(0, Math.min(1, normX));
  const clampedY = Math.max(0, Math.min(1, normY));
  const deltaX = (0.5 - clampedY) * maxRotateX;
  const deltaY = (clampedX - 0.5) * maxRotateY;
  return {
    rotateX: Number((baseRotateX + deltaX).toFixed(2)),
    rotateY: Number((baseRotateY + deltaY).toFixed(2)),
  };
}

/**
 * Calculates subtle magnetic button offset in pixels from normalized pointer coordinates [0..1].
 */
export function calculateMagneticOffset(
  normX: number,
  normY: number,
  maxOffset = 4.5
): { x: number; y: number } {
  const clampedX = Math.max(0, Math.min(1, normX));
  const clampedY = Math.max(0, Math.min(1, normY));
  return {
    x: Number(((clampedX - 0.5) * 2 * maxOffset).toFixed(2)),
    y: Number(((clampedY - 0.5) * 2 * maxOffset).toFixed(2)),
  };
}

/**
 * Splits text into word groups of `wordsPerGroup` words for sequential left-to-right headline reveals.
 */
export function splitIntoWordGroups(text: string, wordsPerGroup = 2): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const words = trimmed.split(/\s+/);
  const size = Math.max(1, Math.floor(wordsPerGroup));
  const groups: string[] = [];
  for (let i = 0; i < words.length; i += size) {
    groups.push(words.slice(i, i + size).join(' '));
  }
  return groups;
}

/**
 * Returns alternating horizontal reveal variants ('slide-left' vs 'slide-right') by index.
 */
export function getAlternatingDirection(index: number): 'slide-left' | 'slide-right' {
  return Math.abs(Math.floor(index)) % 2 === 0 ? 'slide-left' : 'slide-right';
}

/**
 * Returns the distinct entrance variant for each of the 4 steps in "How a Round Works":
 * - Step 0 (Step 1): slide in from the left
 * - Step 1 (Step 2): slide in from the bottom
 * - Step 2 (Step 3): slide in from the right
 * - Step 3 (Step 4): scale into position
 */
export function getHowStepVariant(stepIndex: number): {
  cardVariant: RevealVariant;
  iconRotate: number;
  iconScale: number;
} {
  const normalized = ((Math.floor(stepIndex) % 4) + 4) % 4;
  switch (normalized) {
    case 0:
      return { cardVariant: 'slide-left', iconRotate: -16, iconScale: 0.84 };
    case 1:
      return { cardVariant: 'fade-up', iconRotate: 12, iconScale: 0.8 };
    case 2:
      return { cardVariant: 'slide-right', iconRotate: -14, iconScale: 0.84 };
    default:
      return { cardVariant: 'scale-up', iconRotate: 18, iconScale: 0.76 };
  }
}

/**
 * Returns the distinct entrance variant for the 3 cards in "Who it's for":
 * - First card (0): slide in from the left
 * - Second card (1): scale into position
 * - Third card (2): slide in from the right
 */
export function getWhoCardVariant(cardIndex: number): RevealVariant {
  const normalized = ((Math.floor(cardIndex) % 3) + 3) % 3;
  if (normalized === 0) return 'slide-left';
  if (normalized === 1) return 'scale-up';
  return 'slide-right';
}

/**
 * Resolves CSS style properties for a given RevealVariant and visibility state.
 */
export function getRevealVariantStyles(
  variant: RevealVariant,
  visible: boolean,
  options: RevealVariantOptions = {}
): {
  opacity: number;
  transform: string;
  clipPath?: string;
  transformOrigin?: string;
  transition: string;
} {
  const delay = options.delay ?? 0;
  const duration = options.duration ?? ANIMATION_TIMINGS.sectionSeconds;
  const isMobile = options.isMobile ?? false;
  const distanceFactor = isMobile ? 0.65 : 1;

  let easing: string = options.easing ?? EASING_PRESETS.smoothOut;
  let initialTransform = 'translate3d(0px, 20px, 0px) scale(1)';
  let visibleTransform = 'translate3d(0px, 0px, 0px) scale(1)';
  let initialClipPath: string | undefined;
  let visibleClipPath: string | undefined;
  let transformOrigin: string | undefined;

  switch (variant) {
    case 'slide-left': {
      const dx = (options.x ?? -34) * distanceFactor;
      const dy = (options.y ?? 0) * distanceFactor;
      easing = options.easing ?? EASING_PRESETS.snappyOut;
      initialTransform = `translate3d(${dx}px, ${dy}px, 0px) scale(${options.scale ?? 0.99})`;
      break;
    }
    case 'slide-right': {
      const dx = (options.x ?? 34) * distanceFactor;
      const dy = (options.y ?? 0) * distanceFactor;
      easing = options.easing ?? EASING_PRESETS.snappyOut;
      initialTransform = `translate3d(${dx}px, ${dy}px, 0px) scale(${options.scale ?? 0.99})`;
      break;
    }
    case 'fade-down': {
      const dy = (options.y ?? -22) * distanceFactor;
      easing = options.easing ?? EASING_PRESETS.smoothOut;
      initialTransform = `translate3d(0px, ${dy}px, 0px) scale(${options.scale ?? 0.99})`;
      break;
    }
    case 'scale-up': {
      const startScale = options.scale ?? 0.91;
      const dy = (options.y ?? 10) * distanceFactor;
      easing = options.easing ?? EASING_PRESETS.springOut;
      initialTransform = `translate3d(0px, ${dy}px, 0px) scale(${startScale})`;
      break;
    }
    case 'zoom-out-cinematic': {
      const startScale = options.scale ?? 1.1;
      easing = options.easing ?? EASING_PRESETS.cinematic;
      initialTransform = `translate3d(0px, 0px, 0px) scale(${startScale})`;
      break;
    }
    case 'clip-horizontal': {
      easing = options.easing ?? EASING_PRESETS.cinematic;
      initialTransform = `translate3d(${-12 * distanceFactor}px, 0px, 0px) scale(1)`;
      initialClipPath = 'inset(0% 88% 0% 0%)';
      visibleClipPath = 'inset(0% 0% 0% 0%)';
      break;
    }
    case 'clip-diagonal': {
      easing = options.easing ?? EASING_PRESETS.cinematic;
      initialTransform = `translate3d(0px, 0px, 0px) scale(${options.scale ?? 1.07})`;
      initialClipPath = 'polygon(0% 0%, 18% 0%, 6% 100%, 0% 100%)';
      visibleClipPath = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
      break;
    }
    case 'mask-zoom': {
      easing = options.easing ?? EASING_PRESETS.cinematic;
      initialTransform = `translate3d(0px, 0px, 0px) scale(${options.scale ?? 1.08})`;
      initialClipPath = 'inset(6% 6% 6% 6% round 12px)';
      visibleClipPath = 'inset(0% 0% 0% 0% round 0px)';
      break;
    }
    case 'perspective-3d': {
      easing = options.easing ?? EASING_PRESETS.perspectiveOut;
      const rotX = isMobile ? 4 : options.rotate ?? 9;
      const startScale = options.scale ?? 0.95;
      const dy = (options.y ?? 18) * distanceFactor;
      transformOrigin = 'center top';
      initialTransform = `perspective(1000px) translate3d(0px, ${dy}px, 0px) rotateX(${rotX}deg) scale(${startScale})`;
      visibleTransform = 'perspective(1000px) translate3d(0px, 0px, 0px) rotateX(0deg) scale(1)';
      break;
    }
    case 'rotate-in': {
      easing = options.easing ?? EASING_PRESETS.springOut;
      const rot = options.rotate ?? -15;
      const startScale = options.scale ?? 0.82;
      initialTransform = `translate3d(0px, 4px, 0px) rotate(${rot}deg) scale(${startScale})`;
      visibleTransform = 'translate3d(0px, 0px, 0px) rotate(0deg) scale(1)';
      break;
    }
    case 'fade-up':
    default: {
      const dx = (options.x ?? 0) * distanceFactor;
      const dy = (options.y ?? 18) * distanceFactor;
      const startScale = options.scale ?? 1;
      initialTransform = `translate3d(${dx}px, ${dy}px, 0px) scale(${startScale})`;
      break;
    }
  }

  const transitionParts = [
    `opacity ${duration}s ${easing} ${delay}s`,
    `transform ${duration}s ${easing} ${delay}s`,
  ];
  if (initialClipPath && visibleClipPath) {
    transitionParts.push(`clip-path ${duration}s ${easing} ${delay}s`);
  }

  return {
    opacity: visible ? 1 : 0,
    transform: visible ? visibleTransform : initialTransform,
    ...(initialClipPath && visibleClipPath
      ? { clipPath: visible ? visibleClipPath : initialClipPath }
      : {}),
    ...(transformOrigin ? { transformOrigin } : {}),
    transition: transitionParts.join(', '),
  };
}
