import React from 'react';

interface FloorPlanSvgProps {
  type: '2bhk' | '3bhk' | 'isometric';
  className?: string;
}

export function FloorPlanSvg({ type, className = '' }: FloorPlanSvgProps) {
  if (type === 'isometric') {
    return (
      <svg
        viewBox="0 0 900 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-auto select-none ${className}`}
        aria-label="Vedira Anand 2 BHK Isometric 3D Architectural Cutaway"
      >
        <defs>
          <linearGradient id="isoFloor" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F4F8F5" />
            <stop offset="100%" stopColor="#E2EBE5" />
          </linearGradient>
          <linearGradient id="isoWall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0B4D3C" />
            <stop offset="100%" stopColor="#063529" />
          </linearGradient>
          <linearGradient id="isoBalcony" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#E9F2ED" />
            <stop offset="100%" stopColor="#D4E4DB" />
          </linearGradient>
          <filter id="shadow3d" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#04261F" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Base Background Grid */}
        <rect width="900" height="600" fill="#0A2A22" rx="16" />
        <pattern id="isoGrid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        </pattern>
        <rect width="900" height="600" fill="url(#isoGrid)" rx="16" />

        {/* 3D Isometric Isometric Apartment Platform */}
        <g filter="url(#shadow3d)">
          {/* Base Floor Slab */}
          <polygon
            points="450,110 810,290 450,470 90,290"
            fill="url(#isoFloor)"
            stroke="#C0D5C7"
            strokeWidth="3"
          />

          {/* Living & Dining Area Zone */}
          <polygon
            points="450,110 630,200 450,290 270,200"
            fill="#FFFFFF"
            stroke="#A3C3AF"
            strokeWidth="1.5"
          />

          {/* Master Bedroom Zone */}
          <polygon
            points="630,200 810,290 630,380 450,290"
            fill="#F7FAF8"
            stroke="#A3C3AF"
            strokeWidth="1.5"
          />

          {/* Second Bedroom Zone */}
          <polygon
            points="270,200 450,290 270,380 90,290"
            fill="#F7FAF8"
            stroke="#A3C3AF"
            strokeWidth="1.5"
          />

          {/* Kitchen & Balcony Zone */}
          <polygon
            points="450,290 630,380 450,470 270,380"
            fill="url(#isoBalcony)"
            stroke="#A3C3AF"
            strokeWidth="1.5"
          />

          {/* Perimeter Outer 3D Extruded Walls */}
          {/* North-West Wall */}
          <polygon points="90,290 90,240 450,60 450,110" fill="url(#isoWall)" opacity="0.95" />
          {/* North-East Wall */}
          <polygon points="450,110 450,60 810,240 810,290" fill="url(#isoWall)" opacity="0.85" />

          {/* Internal Partition Walls (low cutaway) */}
          <line x1="450" y1="110" x2="450" y2="470" stroke="#064E3B" strokeWidth="4" strokeLinecap="round" />
          <line x1="270" y1="200" x2="630" y2="380" stroke="#064E3B" strokeWidth="4" strokeLinecap="round" />

          {/* Balcony Glass Railing */}
          <polygon
            points="450,470 270,380 270,350 450,440"
            fill="rgba(164, 212, 255, 0.4)"
            stroke="#5EA8E4"
            strokeWidth="2"
          />
        </g>

        {/* 3D Isometric Labels */}
        <g className="font-sans">
          {/* Living Room */}
          <circle cx="450" cy="200" r="14" fill="#064E3B" />
          <text x="450" y="205" textAnchor="middle" fill="#FFC928" fontSize="13" fontWeight="bold">1</text>
          <text x="450" y="175" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold">
            LIVING & DINING
          </text>
          <text x="450" y="235" textAnchor="middle" fill="#B0D5C3" fontSize="12">
            19&apos;6&quot; × 11&apos;0&quot;
          </text>

          {/* Master Bedroom */}
          <circle cx="630" cy="290" r="14" fill="#064E3B" />
          <text x="630" y="295" textAnchor="middle" fill="#FFC928" fontSize="13" fontWeight="bold">2</text>
          <text x="630" y="265" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold">
            MASTER BEDROOM
          </text>
          <text x="630" y="325" textAnchor="middle" fill="#B0D5C3" fontSize="12">
            11&apos;0&quot; × 13&apos;6&quot; (Attached Toilet)
          </text>

          {/* Second Bedroom */}
          <circle cx="270" cy="290" r="14" fill="#064E3B" />
          <text x="270" y="295" textAnchor="middle" fill="#FFC928" fontSize="13" fontWeight="bold">3</text>
          <text x="270" y="265" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold">
            BEDROOM 2
          </text>
          <text x="270" y="325" textAnchor="middle" fill="#B0D5C3" fontSize="12">
            10&apos;0&quot; × 12&apos;0&quot;
          </text>

          {/* Kitchen & Balcony */}
          <circle cx="450" cy="380" r="14" fill="#064E3B" />
          <text x="450" y="385" textAnchor="middle" fill="#FFC928" fontSize="13" fontWeight="bold">4</text>
          <text x="450" y="415" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold">
            KITCHEN & BALCONY
          </text>
          <text x="450" y="435" textAnchor="middle" fill="#B0D5C3" fontSize="12">
            Granite Platform & SS Railing
          </text>
        </g>

        {/* Legend Badge Header */}
        <rect x="30" y="24" width="310" height="54" rx="8" fill="rgba(6,78,59,0.85)" stroke="#177359" strokeWidth="1" />
        <text x="45" y="46" fill="#FFC928" fontSize="11" fontWeight="bold" letterSpacing="1.2">
          VEDIRA ANAND · 2 BHK ISOMETRIC VIEW
        </text>
        <text x="45" y="66" fill="#FFFFFF" fontSize="13" fontWeight="600">
          Super Built-Up Area: 1,292 sq. ft.
        </text>

        {/* Orientation Compass */}
        <g transform="translate(820, 60)">
          <circle cx="0" cy="0" r="26" fill="#064E3B" stroke="#177359" strokeWidth="2" />
          <polygon points="0,-20 6,0 0,-4 -6,0" fill="#FFC928" />
          <polygon points="0,20 6,0 0,4 -6,0" fill="#A7C9B8" />
          <text x="0" y="-8" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">N</text>
        </g>
      </svg>
    );
  }

  if (type === '3bhk') {
    return (
      <svg
        viewBox="0 0 1000 680"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-auto select-none ${className}`}
        aria-label="Vedira Anand 3 BHK Architectural Floor Plan Flat 601 2190 sq ft S-B/UP"
      >
        <defs>
          <pattern id="grid3bhk" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E6EFEA" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Blueprint Canvas Background */}
        <rect width="1000" height="680" fill="#F8FBF9" rx="14" />
        <rect width="1000" height="680" fill="url(#grid3bhk)" rx="14" />
        <rect x="20" y="20" width="960" height="640" fill="none" stroke="#064E3B" strokeWidth="2" strokeDasharray="6 4" rx="10" />

        {/* Outer Heavy Structural Walls (RCC Frame) */}
        <rect x="50" y="80" width="900" height="520" fill="#FFFFFF" stroke="#073B30" strokeWidth="6" rx="4" />

        {/* Room 1: Grand Living & Dining Lounge (Left Center) */}
        <rect x="50" y="80" width="420" height="280" fill="#FAFDFB" stroke="#073B30" strokeWidth="4" />
        <rect x="54" y="84" width="412" height="272" fill="#EAF4EE" opacity="0.4" />
        {/* Balcony Sitout off Living */}
        <rect x="50" y="360" width="420" height="80" fill="#DCEFE3" stroke="#073B30" strokeWidth="3" />
        <line x1="50" y1="440" x2="470" y2="440" stroke="#0A6C53" strokeWidth="3" strokeDasharray="8 4" />
        <text x="260" y="405" textAnchor="middle" fill="#064E3B" fontSize="12" fontWeight="bold">
          TERRACE SIT-OUT · 7&apos;0&quot; × 16&apos;0&quot; (SS & Toughened Glass)
        </text>

        {/* Room 2: Gourmet Kitchen & Store / Utility (Bottom Left) */}
        <rect x="50" y="440" width="270" height="160" fill="#FAFDFB" stroke="#073B30" strokeWidth="4" />
        {/* Kitchen L-Counter */}
        <path d="M 54 444 L 200 444 L 200 470 L 80 470 L 80 596 L 54 596 Z" fill="#D3E6DC" stroke="#064E3B" strokeWidth="1.5" />
        <rect x="320" y="440" width="150" height="160" fill="#FAFDFB" stroke="#073B30" strokeWidth="3" />
        <text x="395" y="525" textAnchor="middle" fill="#064E3B" fontSize="11" fontWeight="bold">
          STORE & UTILITY
        </text>
        <text x="395" y="545" textAnchor="middle" fill="#52796F" fontSize="10">
          5&apos;0&quot; × 8&apos;0&quot;
        </text>

        {/* Room 3: Master Suite 1 with Private Bath & Terrace Access (Top Right) */}
        <rect x="470" y="80" width="480" height="240" fill="#FAFDFB" stroke="#073B30" strokeWidth="4" />
        {/* Master Bath 1 */}
        <rect x="800" y="80" width="150" height="120" fill="#E7F1EB" stroke="#073B30" strokeWidth="3" />
        <text x="875" y="145" textAnchor="middle" fill="#064E3B" fontSize="11" fontWeight="bold">
          TOILET 1
        </text>
        <text x="875" y="165" textAnchor="middle" fill="#52796F" fontSize="10">
          8&apos;0&quot; × 5&apos;6&quot;
        </text>

        {/* Room 4: Bedroom 2 with En-Suite Bath (Middle Right) */}
        <rect x="470" y="320" width="280" height="200" fill="#FAFDFB" stroke="#073B30" strokeWidth="4" />
        {/* Attached Toilet 2 */}
        <rect x="470" y="450" width="130" height="70" fill="#E7F1EB" stroke="#073B30" strokeWidth="2.5" />
        <text x="535" y="490" textAnchor="middle" fill="#064E3B" fontSize="10" fontWeight="bold">
          TOILET 2 · 7&apos;6&quot; × 4&apos;6&quot;
        </text>

        {/* Room 5: Bedroom 3 / Guest Room & Common Toilet (Bottom Right) */}
        <rect x="750" y="320" width="200" height="280" fill="#FAFDFB" stroke="#073B30" strokeWidth="4" />
        {/* Common Toilet 3 */}
        <rect x="470" y="520" width="140" height="80" fill="#E7F1EB" stroke="#073B30" strokeWidth="2.5" />
        <text x="540" y="565" textAnchor="middle" fill="#064E3B" fontSize="10" fontWeight="bold">
          COMMON TOILET · 6&apos;6&quot; × 4&apos;6&quot;
        </text>

        {/* Main Entry Door with Digital Thumbprint Lock */}
        <g transform="translate(50, 200)">
          <path d="M 0 -24 A 24 24 0 0 1 24 0" fill="none" stroke="#FFC928" strokeWidth="2.5" strokeDasharray="3 3" />
          <line x1="0" y1="0" x2="24" y2="0" stroke="#064E3B" strokeWidth="4" />
          <polygon points="-12,0 -4,-5 -4,5" fill="#064E3B" />
          <text x="-16" y="4" textAnchor="end" fill="#064E3B" fontSize="11" fontWeight="bold">MAIN ENTRY</text>
        </g>

        {/* Room Labels and Dimensions */}
        <g className="font-sans">
          {/* Living Lounge */}
          <text x="240" y="200" textAnchor="middle" fill="#073B30" fontSize="18" fontWeight="bold">
            GRAND LIVING & DINING
          </text>
          <text x="240" y="225" textAnchor="middle" fill="#064E3B" fontSize="14" fontWeight="600">
            24&apos;0&quot; × 14&apos;6&quot;
          </text>
          <text x="240" y="246" textAnchor="middle" fill="#52796F" fontSize="11">
            (Gypsum Ceiling · Terrace Deck Access · Cross Breezes)
          </text>

          {/* Kitchen */}
          <text x="175" y="520" textAnchor="middle" fill="#073B30" fontSize="15" fontWeight="bold">
            GOURMET KITCHEN
          </text>
          <text x="175" y="542" textAnchor="middle" fill="#064E3B" fontSize="13" fontWeight="600">
            12&apos;0&quot; × 9&apos;6&quot;
          </text>

          {/* Master Suite 1 */}
          <text x="640" y="180" textAnchor="middle" fill="#073B30" fontSize="16" fontWeight="bold">
            MASTER SUITE 1
          </text>
          <text x="640" y="205" textAnchor="middle" fill="#064E3B" fontSize="13" fontWeight="600">
            14&apos;0&quot; × 14&apos;0&quot;
          </text>
          <text x="640" y="224" textAnchor="middle" fill="#52796F" fontSize="11">
            (Attached Bath 8&apos;0&quot; × 5&apos;6&quot; · Walk-in Closet Space)
          </text>

          {/* Bedroom 2 */}
          <text x="630" y="400" textAnchor="middle" fill="#073B30" fontSize="15" fontWeight="bold">
            BEDROOM 2
          </text>
          <text x="630" y="422" textAnchor="middle" fill="#064E3B" fontSize="13" fontWeight="600">
            12&apos;0&quot; × 13&apos;6&quot;
          </text>

          {/* Bedroom 3 */}
          <text x="850" y="460" textAnchor="middle" fill="#073B30" fontSize="15" fontWeight="bold">
            BEDROOM 3
          </text>
          <text x="850" y="482" textAnchor="middle" fill="#064E3B" fontSize="13" fontWeight="600">
            11&apos;6&quot; × 12&apos;0&quot;
          </text>
        </g>

        {/* Blueprint Title Block Header */}
        <rect x="50" y="32" width="620" height="40" rx="6" fill="#064E3B" />
        <text x="70" y="57" fill="#FFFFFF" fontSize="14" fontWeight="bold">
          VEDIRA ANAND · 3 BHK PENTHOUSE PLAN (6TH FLOOR · FLAT 601)
        </text>
        <rect x="680" y="32" width="270" height="40" rx="6" fill="#FFC928" />
        <text x="815" y="57" textAnchor="middle" fill="#073B30" fontSize="13" fontWeight="bold">
          S-B/UP AREA: 2,190 SQ. FT.
        </text>

        {/* Compass */}
        <g transform="translate(920, 110)">
          <circle cx="0" cy="0" r="22" fill="#FFFFFF" stroke="#064E3B" strokeWidth="2" />
          <polygon points="0,-16 5,0 0,-3 -5,0" fill="#064E3B" />
          <polygon points="0,16 5,0 0,3 -5,0" fill="#C2D8CE" />
          <text x="0" y="-6" textAnchor="middle" fill="#064E3B" fontSize="10" fontWeight="bold">N</text>
        </g>
      </svg>
    );
  }

  // Default: 2 BHK Floor Plan (Flats 101-501 & 102-502, 1,292 sq. ft. S-B/UP area)
  return (
    <svg
      viewBox="0 0 920 640"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-auto select-none ${className}`}
      aria-label="Vedira Anand 2 BHK Architectural Floor Plan 1292 sq ft S-B/UP"
    >
      <defs>
        <pattern id="grid2bhk" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E6EFEA" strokeWidth="1" />
        </pattern>
      </defs>

      {/* Blueprint Background */}
      <rect width="920" height="640" fill="#F8FBF9" rx="14" />
      <rect width="920" height="640" fill="url(#grid2bhk)" rx="14" />
      <rect x="20" y="20" width="880" height="600" fill="none" stroke="#064E3B" strokeWidth="2" strokeDasharray="6 4" rx="10" />

      {/* Outer Structural Perimeter Walls */}
      <rect x="50" y="80" width="820" height="480" fill="#FFFFFF" stroke="#073B30" strokeWidth="6" rx="4" />

      {/* Room 1: Living & Dining Hall (Top Left) */}
      <rect x="50" y="80" width="460" height="260" fill="#FAFDFB" stroke="#073B30" strokeWidth="4" />
      <rect x="54" y="84" width="452" height="252" fill="#EAF4EE" opacity="0.35" />

      {/* Sit-Out Balcony (Off Living) */}
      <rect x="50" y="340" width="220" height="90" fill="#DCEFE3" stroke="#073B30" strokeWidth="3" />
      <line x1="50" y1="430" x2="270" y2="430" stroke="#0A6C53" strokeWidth="3" strokeDasharray="6 3" />
      <text x="160" y="390" textAnchor="middle" fill="#064E3B" fontSize="11" fontWeight="bold">
        SIT-OUT BALCONY
      </text>
      <text x="160" y="408" textAnchor="middle" fill="#064E3B" fontSize="10">
        5&apos;0&quot; × 10&apos;6&quot; (Glass Railing)
      </text>

      {/* Room 2: Kitchen & Utility (Bottom Left) */}
      <rect x="270" y="340" width="240" height="220" fill="#FAFDFB" stroke="#073B30" strokeWidth="4" />
      {/* L-Shaped Kitchen Platform */}
      <path d="M 274 344 L 410 344 L 410 370 L 300 370 L 300 556 L 274 556 Z" fill="#D3E6DC" stroke="#064E3B" strokeWidth="1.5" />
      {/* Utility Area */}
      <rect x="420" y="440" width="90" height="120" fill="#E5EEE8" stroke="#073B30" strokeWidth="2.5" />
      <text x="465" y="495" textAnchor="middle" fill="#064E3B" fontSize="10" fontWeight="bold">
        UTILITY
      </text>
      <text x="465" y="512" textAnchor="middle" fill="#52796F" fontSize="9">
        4&apos;0&quot; × 7&apos;0&quot;
      </text>

      {/* Room 3: Master Bedroom (Top Right) */}
      <rect x="510" y="80" width="360" height="240" fill="#FAFDFB" stroke="#073B30" strokeWidth="4" />
      {/* Attached Toilet */}
      <rect x="730" y="80" width="140" height="110" fill="#E7F1EB" stroke="#073B30" strokeWidth="3" />
      <text x="800" y="135" textAnchor="middle" fill="#064E3B" fontSize="11" fontWeight="bold">
        ATTACHED TOILET
      </text>
      <text x="800" y="152" textAnchor="middle" fill="#52796F" fontSize="10">
        7&apos;0&quot; × 4&apos;6&quot;
      </text>

      {/* Room 4: Second Bedroom (Bottom Right) */}
      <rect x="510" y="320" width="360" height="240" fill="#FAFDFB" stroke="#073B30" strokeWidth="4" />
      {/* Common Toilet */}
      <rect x="510" y="320" width="130" height="100" fill="#E7F1EB" stroke="#073B30" strokeWidth="3" />
      <text x="575" y="370" textAnchor="middle" fill="#064E3B" fontSize="11" fontWeight="bold">
        COMMON BATH
      </text>
      <text x="575" y="388" textAnchor="middle" fill="#52796F" fontSize="10">
        6&apos;6&quot; × 4&apos;6&quot;
      </text>

      {/* Main Entrance Door Swing */}
      <g transform="translate(50, 190)">
        <path d="M 0 -24 A 24 24 0 0 1 24 0" fill="none" stroke="#FFC928" strokeWidth="2.5" strokeDasharray="3 3" />
        <line x1="0" y1="0" x2="24" y2="0" stroke="#064E3B" strokeWidth="4" />
        <polygon points="-12,0 -4,-5 -4,5" fill="#064E3B" />
        <text x="-16" y="4" textAnchor="end" fill="#064E3B" fontSize="11" fontWeight="bold">MAIN ENTRY</text>
      </g>

      {/* Internal Room Labels */}
      <g className="font-sans">
        {/* Living & Dining */}
        <text x="260" y="195" textAnchor="middle" fill="#073B30" fontSize="17" fontWeight="bold">
          LIVING & DINING HALL
        </text>
        <text x="260" y="220" textAnchor="middle" fill="#064E3B" fontSize="14" fontWeight="600">
          19&apos;6&quot; × 11&apos;0&quot;
        </text>
        <text x="260" y="240" textAnchor="middle" fill="#52796F" fontSize="11">
          (Attached Sit-out Balcony · Gypsum False Ceiling)
        </text>

        {/* Kitchen */}
        <text x="350" y="450" textAnchor="middle" fill="#073B30" fontSize="15" fontWeight="bold">
          KITCHEN
        </text>
        <text x="350" y="472" textAnchor="middle" fill="#064E3B" fontSize="13" fontWeight="600">
          9&apos;6&quot; × 8&apos;0&quot;
        </text>

        {/* Master Bedroom */}
        <text x="640" y="190" textAnchor="middle" fill="#073B30" fontSize="16" fontWeight="bold">
          MASTER BEDROOM
        </text>
        <text x="640" y="215" textAnchor="middle" fill="#064E3B" fontSize="13" fontWeight="600">
          11&apos;0&quot; × 13&apos;6&quot;
        </text>
        <text x="640" y="233" textAnchor="middle" fill="#52796F" fontSize="11">
          (Attached Bath 7&apos;0&quot; × 4&apos;6&quot; · Wardrobe Space)
        </text>

        {/* Second Bedroom */}
        <text x="730" y="440" textAnchor="middle" fill="#073B30" fontSize="16" fontWeight="bold">
          BEDROOM 2
        </text>
        <text x="730" y="465" textAnchor="middle" fill="#064E3B" fontSize="13" fontWeight="600">
          10&apos;0&quot; × 12&apos;0&quot;
        </text>
      </g>

      {/* Blueprint Title Header */}
      <rect x="50" y="32" width="550" height="40" rx="6" fill="#064E3B" />
      <text x="70" y="57" fill="#FFFFFF" fontSize="14" fontWeight="bold">
        VEDIRA ANAND · 2 BHK TYPICAL FLOOR PLAN (1ST TO 5TH FLOOR)
      </text>
      <rect x="610" y="32" width="260" height="40" rx="6" fill="#FFC928" />
      <text x="740" y="57" textAnchor="middle" fill="#073B30" fontSize="13" fontWeight="bold">
        S-B/UP AREA: 1,292 SQ. FT.
      </text>

      {/* Compass */}
      <g transform="translate(840, 110)">
        <circle cx="0" cy="0" r="20" fill="#FFFFFF" stroke="#064E3B" strokeWidth="2" />
        <polygon points="0,-15 5,0 0,-3 -5,0" fill="#064E3B" />
        <polygon points="0,15 5,0 0,3 -5,0" fill="#C2D8CE" />
        <text x="0" y="-5" textAnchor="middle" fill="#064E3B" fontSize="9" fontWeight="bold">N</text>
      </g>
    </svg>
  );
}
