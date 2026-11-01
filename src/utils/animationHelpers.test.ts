import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ANIMATION_TIMINGS,
  EASING_PRESETS,
  calculateCardTilt,
  calculateMagneticOffset,
  calculateStaggerDelay,
  easeOutCubic,
  getAlternatingDirection,
  getHowStepVariant,
  getRevealVariantStyles,
  getWhoCardVariant,
  interpolateNumber,
  splitIntoWordGroups,
} from './animationHelpers';

test('ANIMATION_TIMINGS stay within premium motion ranges', () => {
  assert.ok(ANIMATION_TIMINGS.hoverSeconds >= 0.18 && ANIMATION_TIMINGS.hoverSeconds <= 0.25);
  assert.ok(ANIMATION_TIMINGS.cardSeconds >= 0.3 && ANIMATION_TIMINGS.cardSeconds <= 0.45);
  assert.ok(ANIMATION_TIMINGS.sectionSeconds >= 0.5 && ANIMATION_TIMINGS.sectionSeconds <= 0.75);
  assert.ok(ANIMATION_TIMINGS.heroSeconds >= 0.7 && ANIMATION_TIMINGS.heroSeconds <= 1.0);
});

test('EASING_PRESETS provide distinct cubic-bezier curves', () => {
  const uniqueCurves = new Set(Object.values(EASING_PRESETS));
  assert.equal(uniqueCurves.size, 5);
});

test('easeOutCubic decelerates smoothly and clamps bounds', () => {
  assert.equal(easeOutCubic(0), 0);
  assert.equal(easeOutCubic(1), 1);
  assert.equal(easeOutCubic(-0.5), 0);
  assert.equal(easeOutCubic(1.5), 1);
  assert.ok(easeOutCubic(0.5) > 0.8);
});

test('interpolateNumber interpolates smoothly and resolves exact target', () => {
  assert.equal(interpolateNumber(180000, 300000, 0), 180000);
  assert.equal(interpolateNumber(180000, 300000, 1), 300000);
  assert.equal(interpolateNumber(180000, 300000, 0.4, true), 300000);

  const mid = interpolateNumber(180000, 300000, 0.5);
  assert.ok(mid > 240000 && mid < 300000);
});

test('calculateStaggerDelay scales sequentially and respects maximum cap', () => {
  assert.equal(calculateStaggerDelay(0, 0.05, 0.08, 0.45), 0.05);
  assert.equal(calculateStaggerDelay(1, 0.05, 0.08, 0.45), 0.13);
  assert.equal(calculateStaggerDelay(2, 0.05, 0.08, 0.45), 0.21);
  assert.equal(calculateStaggerDelay(10, 0.05, 0.08, 0.45), 0.45);
});

test('calculateCardTilt computes subtle perspective angles around base rotation', () => {
  const neutral = calculateCardTilt(0.5, 0.5, 8, 12, 2, -15);
  assert.deepEqual(neutral, { rotateX: 2, rotateY: -15 });

  const topLeft = calculateCardTilt(0, 0, 8, 12, 0, 0);
  assert.deepEqual(topLeft, { rotateX: 4, rotateY: -6 });
});

test('calculateMagneticOffset computes bounded magnetic shift', () => {
  assert.deepEqual(calculateMagneticOffset(0.5, 0.5, 4), { x: 0, y: 0 });
  assert.deepEqual(calculateMagneticOffset(1, 0, 4), { x: 4, y: -4 });
  assert.deepEqual(calculateMagneticOffset(0, 1, 4), { x: -4, y: 4 });
});

test('splitIntoWordGroups divides headline into sequential word chunks', () => {
  const groups = splitIntoWordGroups('Better prices for your home, because we buy together.', 2);
  assert.deepEqual(groups, [
    'Better prices',
    'for your',
    'home, because',
    'we buy',
    'together.',
  ]);
});

test('getHowStepVariant assigns distinct directional/scale variants across all 4 steps', () => {
  assert.equal(getHowStepVariant(0).cardVariant, 'slide-left');
  assert.equal(getHowStepVariant(1).cardVariant, 'fade-up');
  assert.equal(getHowStepVariant(2).cardVariant, 'slide-right');
  assert.equal(getHowStepVariant(3).cardVariant, 'scale-up');
});

test('getWhoCardVariant assigns left, scale, and right variants to the 3 homeowner cards', () => {
  assert.equal(getWhoCardVariant(0), 'slide-left');
  assert.equal(getWhoCardVariant(1), 'scale-up');
  assert.equal(getWhoCardVariant(2), 'slide-right');
});

test('getAlternatingDirection alternates between slide-left and slide-right', () => {
  assert.equal(getAlternatingDirection(0), 'slide-left');
  assert.equal(getAlternatingDirection(1), 'slide-right');
  assert.equal(getAlternatingDirection(2), 'slide-left');
  assert.equal(getAlternatingDirection(3), 'slide-right');
});

test('getRevealVariantStyles generates distinct transforms and clip-paths per variant', () => {
  const leftHidden = getRevealVariantStyles('slide-left', false);
  const rightHidden = getRevealVariantStyles('slide-right', false);
  const clipHidden = getRevealVariantStyles('clip-horizontal', false);
  const perspectiveHidden = getRevealVariantStyles('perspective-3d', false);

  assert.ok(leftHidden.transform.includes('-34px'));
  assert.ok(rightHidden.transform.includes('34px'));
  assert.equal(clipHidden.clipPath, 'inset(0% 88% 0% 0%)');
  assert.ok(perspectiveHidden.transform.includes('perspective(1000px)'));
  assert.ok(perspectiveHidden.transform.includes('rotateX('));

  const clipVisible = getRevealVariantStyles('clip-horizontal', true);
  assert.equal(clipVisible.opacity, 1);
  assert.equal(clipVisible.clipPath, 'inset(0% 0% 0% 0%)');
});
