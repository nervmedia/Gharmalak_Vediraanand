import React, { useState } from 'react';
import { Calculator, ShieldCheck } from 'lucide-react';
import {
  COMPARISON_ROWS,
  ESTIMATOR_CONFIG,
  calculateSavingsEstimate,
} from '../utils/savingsEstimator';
import { ANIMATION_TIMINGS, calculateStaggerDelay } from '../utils/animationHelpers';
import { AnimatedRupee, Reveal, RevealTableRow, useValueHighlight } from './MotionPrimitives';

export function GroupComparisonSection() {
  const [spend, setSpend] = useState<number>(ESTIMATOR_CONFIG.defaultSpend);
  const estimate = calculateSavingsEstimate(spend);
  const isValueChanging = useValueHighlight(spend, 320);

  return (
    <section
      aria-labelledby="group-comparison-heading"
      className="bg-[#F8F8F3] py-14 sm:py-20 border-b border-[#E4E9E3]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT SIDE (~60% width on desktop): COMPARISON TABLE */}
          <div className="lg:col-span-7 rounded-2xl bg-white border border-[#DCE3DC] shadow-xs overflow-hidden">
            {/* Table Heading: Reveal from the left */}
            <Reveal
              variant="slide-left"
              x={-32}
              delay={0.04}
              duration={0.56}
              className="px-5 sm:px-7 pt-6 sm:pt-7 pb-5"
            >
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] text-[#073B30]">
                WHY BUYING AS A GROUP WINS
              </p>
              <h2
                id="group-comparison-heading"
                className="mt-1.5 text-xl sm:text-2xl lg:text-[26px] font-extrabold tracking-tight text-[#073B30] leading-tight"
              >
                Solo Homeowner vs. Gharmalak Club Round
              </h2>
            </Reveal>

            {/* Table: Reveal through a horizontal clipping animation */}
            <Reveal
              variant="clip-horizontal"
              delay={0.1}
              duration={0.72}
              className="overflow-x-auto"
            >
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-y border-[#E4E9E3]">
                    <th
                      scope="col"
                      className="w-[26%] bg-[#EEF3EE] py-3 sm:py-3.5 pl-4 sm:pl-7 pr-2 sm:pr-3 text-[11.5px] sm:text-[13px] font-bold text-[#073B30]"
                    >
                      What Matters
                    </th>
                    <th
                      scope="col"
                      className="w-[35%] bg-[#EEF3EE] py-3 sm:py-3.5 px-2.5 sm:px-4 text-[11.5px] sm:text-[13px] font-semibold text-[#3B5249]"
                    >
                      Solo Retail Buying
                    </th>
                    <th
                      scope="col"
                      className="w-[39%] bg-[#F4F1DC] py-3 sm:py-3.5 pl-2.5 sm:pl-4 pr-4 sm:pr-7 text-[11.5px] sm:text-[13px] font-bold text-[#073B30] transition-colors duration-300"
                    >
                      Gharmalak Group Round
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E9E3]">
                  {COMPARISON_ROWS.map((row, index) => (
                    <RevealTableRow
                      key={row.id}
                      index={index}
                      direction="alternate"
                      duration={ANIMATION_TIMINGS.cardSeconds}
                      delay={calculateStaggerDelay(index, 0.08, 0.07, 0.42)}
                      className="gm-comparison-row"
                    >
                      <th
                        scope="row"
                        className="py-3.5 sm:py-5 pl-4 sm:pl-7 pr-2 sm:pr-3 align-top text-[11.5px] sm:text-[13px] font-bold text-[#073B30] leading-[1.45] bg-white"
                      >
                        {row.whatMatters}
                      </th>
                      <td className="py-3.5 sm:py-5 px-2.5 sm:px-4 align-top text-[11.5px] sm:text-[13px] font-normal text-[#4B5E55] leading-[1.5] sm:leading-[1.55] bg-white">
                        {row.soloRetailBuying}
                      </td>
                      <td className="gm-comparison-group-cell py-3.5 sm:py-5 pl-2.5 sm:pl-4 pr-4 sm:pr-7 align-top text-[11.5px] sm:text-[13px] font-medium text-[#073B30] leading-[1.5] sm:leading-[1.55] bg-[#FCF9EE]">
                        {row.gharmalakGroupRound}
                      </td>
                    </RevealTableRow>
                  ))}
                </tbody>
              </table>
            </Reveal>
          </div>

          {/* RIGHT SIDE (~40% width on desktop): INTERACTIVE SAVINGS ESTIMATOR */}
          <Reveal
            variant="perspective-3d"
            rotate={8}
            scale={0.95}
            delay={0.14}
            duration={ANIMATION_TIMINGS.sectionSeconds}
            className="lg:col-span-5 rounded-2xl bg-[#10372B] border border-[#1B4638] p-6 sm:p-7 lg:p-8 text-white shadow-md"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="gm-yellow-accent-highlight text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] text-[#F5B82E]">
                INTERACTIVE SAVINGS ESTIMATOR
              </p>
              <Reveal variant="rotate-in" rotate={-18} scale={0.82} delay={0.24} duration={0.42}>
                <Calculator
                  className="w-4 h-4 text-[#F5B82E] shrink-0 transition-transform duration-300 hover:scale-110 hover:rotate-6"
                  aria-hidden="true"
                />
              </Reveal>
            </div>

            <h3 className="mt-3.5 text-xl sm:text-2xl lg:text-[26px] font-extrabold tracking-tight text-white leading-[1.22]">
              See how your ₹499 membership pays for itself on Deal #1.
            </h3>

            {/* Slider Control */}
            <div className="mt-6">
              <div className="flex items-baseline justify-between gap-3">
                <label
                  htmlFor="planned-spend-slider"
                  className="text-xs sm:text-[13px] font-normal text-white/85"
                >
                  Your planned home project spend:
                </label>
                <output
                  htmlFor="planned-spend-slider"
                  data-testid="estimator-spend-value"
                  className="gm-yellow-accent-highlight text-base sm:text-lg font-bold text-[#F5B82E] tabular-nums tracking-tight transition-transform duration-200"
                >
                  <AnimatedRupee value={estimate.spend} />
                </output>
              </div>

              <div className="mt-3 flex items-center">
                <input
                  id="planned-spend-slider"
                  type="range"
                  min={ESTIMATOR_CONFIG.minSpend}
                  max={ESTIMATOR_CONFIG.maxSpend}
                  step={ESTIMATOR_CONFIG.step}
                  value={spend}
                  onChange={(e) => setSpend(Number(e.target.value))}
                  aria-label="Your planned home project spend"
                  className="gharmalak-range-slider w-full h-2 rounded-full appearance-none cursor-pointer focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #F5A623 0%, #F5A623 ${estimate.sliderFillPercent}%, #1A4336 ${estimate.sliderFillPercent}%, #1A4336 100%)`,
                  }}
                />
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[10px] sm:text-[11px] text-white/65 font-mono">
                <span>₹25,000 (Appliances)</span>
                <span>₹1.8L (3kW Solar)</span>
                <span>₹3.0L (Kitchen)</span>
              </div>
            </div>

            {/* Dynamic Calculation Boxes: Staggered scale-in */}
            <div className="mt-6 grid grid-cols-2 gap-3.5">
              <Reveal
                variant="scale-up"
                scale={0.9}
                delay={0.22}
                duration={ANIMATION_TIMINGS.cardSeconds}
                className={`gm-estimator-panel rounded-xl bg-[#1A4336] border border-[#2C594B] p-4 ${
                  isValueChanging ? 'gm-estimator-panel-highlight' : ''
                }`}
              >
                <span className="block text-[11px] sm:text-xs text-white/75">
                  Est. Group Saving (10–14%)
                </span>
                <strong
                  data-testid="estimator-saving-value"
                  className="gm-yellow-accent-highlight mt-1.5 block text-xl sm:text-2xl font-bold text-[#F5B82E] tabular-nums tracking-tight"
                >
                  <AnimatedRupee value={estimate.estimatedSaving} />
                </strong>
              </Reveal>

              <Reveal
                variant="scale-up"
                scale={0.9}
                delay={0.3}
                duration={ANIMATION_TIMINGS.cardSeconds}
                className={`gm-estimator-panel rounded-xl bg-[#1A4336] border border-[#2C594B] p-4 ${
                  isValueChanging ? 'gm-estimator-panel-highlight' : ''
                }`}
              >
                <span className="block text-[11px] sm:text-xs text-white/75">
                  Target Club Benchmark
                </span>
                <strong
                  data-testid="estimator-benchmark-value"
                  className="mt-1.5 block text-xl sm:text-2xl font-bold text-white tabular-nums tracking-tight"
                >
                  <AnimatedRupee value={estimate.targetBenchmark} />
                </strong>
              </Reveal>
            </div>

            {/* Membership Benefit Box */}
            <Reveal
              variant="scale-up"
              scale={0.94}
              delay={0.36}
              duration={ANIMATION_TIMINGS.cardSeconds}
              className="gm-estimator-panel mt-4 rounded-xl bg-[#1A4336]/75 border border-[#2C594B] p-4 flex items-start gap-3"
            >
              <ShieldCheck
                className="w-4 h-4 text-[#F5B82E] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <p className="text-xs leading-[1.5] text-white/90">
                First 1,000 Nagpur Founding Members also get their{' '}
                <strong className="gm-yellow-accent-highlight font-semibold text-[#F5B82E]">
                  ₹499 membership fee deducted
                </strong>{' '}
                from their first deal invoice.
              </p>
            </Reveal>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
