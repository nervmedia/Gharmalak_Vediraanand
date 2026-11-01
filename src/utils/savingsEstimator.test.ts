import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COMPARISON_ROWS,
  ESTIMATOR_CONFIG,
  calculateSavingsEstimate,
  formatIndianRupees,
} from './savingsEstimator';

test('formatIndianRupees formats amounts in standard Indian numbering format', () => {
  assert.equal(formatIndianRupees(25000), '₹25,000');
  assert.equal(formatIndianRupees(180000), '₹1,80,000');
  assert.equal(formatIndianRupees(158400), '₹1,58,400');
  assert.equal(formatIndianRupees(500000), '₹5,00,000');
});

test('calculateSavingsEstimate matches default ₹1,80,000 reference values exactly', () => {
  const result = calculateSavingsEstimate(ESTIMATOR_CONFIG.defaultSpend);
  assert.equal(result.spend, 180000);
  assert.equal(result.estimatedSaving, 21600);
  assert.equal(result.targetBenchmark, 158400);
  assert.equal(result.formattedSpend, '₹1,80,000');
  assert.equal(result.formattedSaving, '₹21,600');
  assert.equal(result.formattedBenchmark, '₹1,58,400');
});

test('calculateSavingsEstimate computes min and max bounds and clamps out-of-range inputs', () => {
  const minResult = calculateSavingsEstimate(10000);
  assert.equal(minResult.spend, 25000);
  assert.equal(minResult.estimatedSaving, 3000);
  assert.equal(minResult.targetBenchmark, 22000);
  assert.equal(minResult.sliderFillPercent, 0);

  const maxResult = calculateSavingsEstimate(600000);
  assert.equal(maxResult.spend, 500000);
  assert.equal(maxResult.estimatedSaving, 60000);
  assert.equal(maxResult.targetBenchmark, 440000);
  assert.equal(maxResult.sliderFillPercent, 100);
});

test('COMPARISON_ROWS contains all 5 required comparison rows verbatim', () => {
  assert.equal(COMPARISON_ROWS.length, 5);
  assert.equal(COMPARISON_ROWS[0].whatMatters, 'Pricing & Negotiation');
  assert.equal(COMPARISON_ROWS[1].whatMatters, 'Vendor Vetting & Material Check');
  assert.equal(COMPARISON_ROWS[2].whatMatters, 'Sales Calls & Data Privacy');
  assert.equal(COMPARISON_ROWS[3].whatMatters, 'Deposit & Cancellation Safety');
  assert.equal(COMPARISON_ROWS[4].whatMatters, 'Warranties & Property Records');
});
