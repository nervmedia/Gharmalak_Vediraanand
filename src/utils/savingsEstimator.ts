export interface ComparisonRow {
  id: string;
  whatMatters: string;
  soloRetailBuying: string;
  gharmalakGroupRound: string;
}

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    id: 'pricing-negotiation',
    whatMatters: 'Pricing & Negotiation',
    soloRetailBuying:
      'You pay single-home retail rates; every contractor quotes a different margin.',
    gharmalakGroupRound:
      'We benchmark 10 local quotes first. Winning vendor bid must beat the median by at least 10%.',
  },
  {
    id: 'vendor-vetting',
    whatMatters: 'Vendor Vetting & Material Check',
    soloRetailBuying:
      'Hard to verify sub-contractors, cable gauges, or whether paint/chemical drums were diluted.',
    gharmalakGroupRound:
      'Only brand-certified crews, factory-sealed barrels & exact BOM specs audited before work starts.',
  },
  {
    id: 'sales-calls-privacy',
    whatMatters: 'Sales Calls & Data Privacy',
    soloRetailBuying:
      'Phone number shared across lead-gen portals resulting in dozens of spam calls.',
    gharmalakGroupRound:
      'Zero spam calls. Opt in via WhatsApp (max 4 messages/month). We never sell your data.',
  },
  {
    id: 'deposit-cancellation',
    whatMatters: 'Deposit & Cancellation Safety',
    soloRetailBuying:
      'Large advance paid directly to contractor with little recourse if delayed.',
    gharmalakGroupRound:
      'If no vendor beats the benchmark price by ≥10%, the round is cancelled and any deposit is 100% refunded.',
  },
  {
    id: 'warranties-records',
    whatMatters: 'Warranties & Property Records',
    soloRetailBuying:
      'Paper bills and warranty cards get misplaced before you need a claim.',
    gharmalakGroupRound:
      '5-year club workmanship cover + all invoices, 7/12 extracts & Index-II stored in your Paper Vault.',
  },
];

export const ESTIMATOR_CONFIG = {
  minSpend: 25000,
  maxSpend: 500000,
  defaultSpend: 180000,
  step: 5000,
  midpointSavingRate: 0.12, // 12% midpoint of the 10–14% group saving range
  minSavingRate: 0.1,
  maxSavingRate: 0.14,
} as const;

export function formatIndianRupees(amount: number): string {
  const rounded = Math.round(amount);
  return `₹${rounded.toLocaleString('en-IN')}`;
}

export interface SavingsEstimate {
  spend: number;
  estimatedSaving: number;
  targetBenchmark: number;
  minSaving: number;
  maxSaving: number;
  formattedSpend: string;
  formattedSaving: string;
  formattedBenchmark: string;
  sliderFillPercent: number;
}

export function calculateSavingsEstimate(rawSpend: number): SavingsEstimate {
  const clampedSpend = Math.min(
    ESTIMATOR_CONFIG.maxSpend,
    Math.max(ESTIMATOR_CONFIG.minSpend, Math.round(rawSpend))
  );

  const estimatedSaving = Math.round(clampedSpend * ESTIMATOR_CONFIG.midpointSavingRate);
  const targetBenchmark = clampedSpend - estimatedSaving;
  const minSaving = Math.round(clampedSpend * ESTIMATOR_CONFIG.minSavingRate);
  const maxSaving = Math.round(clampedSpend * ESTIMATOR_CONFIG.maxSavingRate);

  const sliderFillPercent =
    ((clampedSpend - ESTIMATOR_CONFIG.minSpend) /
      (ESTIMATOR_CONFIG.maxSpend - ESTIMATOR_CONFIG.minSpend)) *
    100;

  return {
    spend: clampedSpend,
    estimatedSaving,
    targetBenchmark,
    minSaving,
    maxSaving,
    formattedSpend: formatIndianRupees(clampedSpend),
    formattedSaving: formatIndianRupees(estimatedSaving),
    formattedBenchmark: formatIndianRupees(targetBenchmark),
    sliderFillPercent: Math.max(0, Math.min(100, sliderFillPercent)),
  };
}
