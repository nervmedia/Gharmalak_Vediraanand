import React from 'react';
import { Sun } from 'lucide-react';
import { SolarRoundData, SolarRoundId } from '../data/solarRoundsData';

interface SolarRoundTabsProps {
  rounds: readonly SolarRoundData[];
  selectedRoundId: SolarRoundId;
  onSelectRound: (roundId: SolarRoundId) => void;
  idPrefix?: string;
}

export function SolarRoundTabs({
  rounds,
  selectedRoundId,
  onSelectRound,
  idPrefix = 'solar',
}: SolarRoundTabsProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % rounds.length;
      onSelectRound(rounds[nextIndex].id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + rounds.length) % rounds.length;
      onSelectRound(rounds[prevIndex].id);
    }
  };

  return (
    <div className="gm-no-scrollbar w-full overflow-x-auto pb-1">
      <div
        role="tablist"
        aria-label="Solar Rounds"
        className="inline-flex min-w-full sm:min-w-0 items-center gap-2 rounded-2xl bg-white border border-[#E4E9E3] p-2 shadow-2xs"
      >
        {rounds.map((round, index) => {
          const isActive = round.id === selectedRoundId;
          return (
            <button
              key={round.id}
              id={`${idPrefix}-tab-${round.roundNumber}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${idPrefix}-tabpanel-${round.roundNumber}`}
              onClick={() => onSelectRound(round.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`group relative inline-flex items-center justify-center gap-2 rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition-all duration-250 ease-out whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#064E3B] ${
                isActive
                  ? 'bg-[#064E3B] text-white shadow-xs'
                  : 'bg-[#EAF2E9]/75 text-[#073B30] hover:bg-[#dce8da] hover:text-[#064E3B]'
              }`}
            >
              <Sun
                className={`h-4 w-4 shrink-0 transition-transform duration-250 ${
                  isActive
                    ? 'text-[#FFC928] scale-105'
                    : 'text-[#064E3B]/75 group-hover:text-[#064E3B]'
                }`}
              />
              <span>{round.tabLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
