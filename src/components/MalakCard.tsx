import React, { useRef, useState } from 'react';
import { GharmalakMark } from './Logo';
import { calculateCardTilt } from '../utils/animationHelpers';

interface MalakCardProps {
  name: string;
  number: string;
  label: string;
  over?: string;
  variant?: 'emerald' | 'brass' | 'titanium';
  className?: string;
  compact?: boolean;
  float?: boolean;
}

export function MalakCard({
  name,
  number,
  label,
  over = 'MALAK CARD',
  variant = 'emerald',
  className = '',
  compact = false,
  float = true,
}: MalakCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt(calculateCardTilt(x, y, 10, 14, 0, 0));
  };

  const handlePointerLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  const surfaceClasses =
    variant === 'brass'
      ? 'bg-gradient-to-br from-[#D9B15F] via-[#C3963E] to-[#8F681E] text-[#1F1707] border-[#E8CA82]/60'
      : variant === 'titanium'
      ? 'bg-gradient-to-br from-[#1F3A32] via-[#122620] to-[#091512] text-white border-white/15'
      : 'bg-gradient-to-br from-[#085E47] via-[#064E3B] to-[#042F23] text-white border-[#FFC928]/35';

  const markColor = variant === 'brass' ? '#2A1E08' : '#FFC928';
  const subTextColor = variant === 'brass' ? 'text-[#2A1E08]/80' : 'text-[#FFC928]';

  return (
    <div
      className={`${float ? 'gm-malak-float' : ''} w-full ${
        compact ? 'max-w-[340px]' : 'max-w-[400px]'
      } ${className}`}
    >
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{
          transform: `perspective(900px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        }}
        className={`gm-malak-sheen relative select-none rounded-2xl border shadow-xl transition-transform duration-200 ease-out overflow-hidden ${surfaceClasses} ${
          compact ? 'p-5 aspect-[1.586/1] w-full' : 'p-6 sm:p-7 aspect-[1.586/1] w-full'
        }`}
        role="img"
        aria-label={`${over}: ${name}, ${number}, ${label}`}
      >
        {/* Subtle metallic sheen */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,201,40,0.18),transparent_60%)]"
        />

        <div className="relative z-10 flex h-full flex-col justify-between">
          {/* Top Row */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <span
                className={`block text-[11px] font-semibold tracking-[0.22em] uppercase ${subTextColor}`}
              >
                {over}
              </span>
              <span className="mt-0.5 block text-xs font-medium opacity-80">
                Gharmalak Homeowners&apos; Club
              </span>
            </div>
            <GharmalakMark size={compact ? 24 : 28} color={markColor} />
          </div>

          {/* Middle Row: Chip & Contactless */}
          <div className="my-2 flex items-center justify-between">
            <div
              aria-hidden="true"
              className="h-8 w-11 rounded-md border border-[#E6C365]/70 bg-gradient-to-br from-[#F4D98C] via-[#D4A94A] to-[#A67C23] p-1.5 shadow-inner"
            >
              <div className="h-full w-full rounded-xs border border-[#5C410C]/30" />
            </div>
            <svg
              aria-hidden="true"
              className={`h-5 w-5 opacity-70 ${variant === 'brass' ? 'stroke-[#2A1E08]' : 'stroke-[#FFC928]'}`}
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M8.5 7.5a6.5 6.5 0 0 1 0 9" />
              <path d="M12 5a10 10 0 0 1 0 14" />
              <path d="M15.5 2.8a13 13 0 0 1 0 18.4" />
              <path d="M5 10a3 3 0 0 1 0 4" />
            </svg>
          </div>

          {/* Bottom Row: Cardholder Name & Member Number */}
          <div>
            <p
              className={`font-semibold tracking-tight truncate ${
                compact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'
              }`}
            >
              {name}
            </p>
            <div className="mt-1.5 flex items-center justify-between gap-2 text-xs font-medium opacity-90">
              <span className="font-mono tracking-wider tabular-nums">{number}</span>
              <span className={`uppercase tracking-wider text-[11px] font-semibold ${subTextColor}`}>
                {label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
