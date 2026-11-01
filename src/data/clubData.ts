export type DealTier = 'big' | 'quick';
export type DealReach = 'multi' | 'local';
export type SeasonGroup = 'spring' | 'summer' | 'monsoon' | 'winter' | 'festive' | 'year_round';

export interface RoundInfo {
  n: number;
  optInFrom: string;
  optInTo: string;
  install: string;
}

export interface DealItem {
  id: string;
  round: number;
  tier: DealTier;
  kind: string;
  title: string;
  ticket: string;
  why: string;
  brands: string;
  reach: DealReach;
  roundHref?: string;
  seasonGroup: SeasonGroup;
  seasonLabel: string;
  image: string;
}

export const CLUB_CONFIG = {
  url: 'https://gharmalak.in',
  whatsapp: '917767877675',
  paymentLink: '',
  fee: 499,
  regularFee: 999,
  foundingSeats: 1000,
} as const;

export const ROUND_1_SOLAR = {
  id: 'r1-solar-nagpur',
  slug: 'solar-nagpur',
  category: 'solar',
  city: 'Nagpur',
  opens: '2026-11-01',
  closes: '2026-12-31',
  target: 50,
  minSaving: 10,
} as const;

export const NAGPUR_AREAS = [
  'Dharampeth',
  'Ramdaspeth',
  'Civil Lines',
  'Manish Nagar',
  'Wardha Road',
  'Pratap Nagar',
  'Trimurti Nagar',
  'Sadar',
  'Hingna Road',
  'Besa',
  'Koradi Road',
  'Kamptee Road',
  'Other',
] as const;

export const LAUNCH_CITIES = [
  'Nagpur',
  'Wardha',
  'Amravati',
  'Chandrapur',
  'Chh. Sambhajinagar',
  'Nashik',
  'Pune',
] as const;

export const OTHER_CITIES = [
  'Mumbai',
  'Ahmedabad',
  'Surat',
  'Vadodara',
  'Indore',
  'Bhopal',
  'Raipur',
  'Jaipur',
  'Lucknow',
] as const;

export const CITY_COORDS: Record<string, [number, number]> = {
  Nagpur: [21.1458, 79.0882],
  Wardha: [20.7453, 78.6022],
  Amravati: [20.9374, 77.7796],
  Chandrapur: [19.9615, 79.2961],
  'Chh. Sambhajinagar': [19.8762, 75.3433],
  Nashik: [19.9975, 73.7898],
  Pune: [18.5204, 73.8567],
  Mumbai: [19.076, 72.8777],
  Ahmedabad: [23.0225, 72.5714],
  Surat: [21.1702, 72.8311],
  Vadodara: [22.3072, 73.1812],
  Indore: [22.7196, 75.8577],
  Bhopal: [23.2599, 77.4126],
  Raipur: [21.2514, 81.6296],
  Jaipur: [26.9124, 75.7873],
  Lucknow: [26.8467, 80.9462],
};

export const ROUNDS: RoundInfo[] = [
  {
    n: 1,
    optInFrom: '2026-11-01',
    optInTo: '2026-12-31',
    install: 'January–February 2027',
  },
  {
    n: 2,
    optInFrom: '2027-01-01',
    optInTo: '2027-02-28',
    install: 'March–April 2027',
  },
  {
    n: 3,
    optInFrom: '2027-03-01',
    optInTo: '2027-04-30',
    install: 'May 2027, before the monsoon',
  },
  {
    n: 4,
    optInFrom: '2027-06-01',
    optInTo: '2027-09-15',
    install: 'October–November 2027',
  },
  {
    n: 5,
    optInFrom: '2027-10-01',
    optInTo: '2027-11-30',
    install: 'December 2027–January 2028',
  },
];

const SOLAR_BRANDS = 'PM Surya Ghar-empanelled installers (Tata Power Solar, Waaree, Adani Solar)';

export const DEALS: DealItem[] = [
  {
    id: 'd-2026-11-solar',
    round: 1,
    tier: 'big',
    kind: 'solar',
    title: 'Rooftop solar, 3 kW',
    ticket: '₹1.5–2.2 lakh before subsidy',
    why: 'Installed in January–February, so it runs before summer bills peak. PM Surya Ghar subsidy applies.',
    brands: SOLAR_BRANDS,
    reach: 'multi',
    roundHref: '/round/solar-nagpur',
    seasonGroup: 'spring',
    seasonLabel: 'January–February 2027',
    image: '/images/rooftop-solar.jpg',
  },
  {
    id: 'r1-painting',
    round: 1,
    tier: 'big',
    kind: 'painting',
    title: 'Interior painting',
    ticket: '₹40,000–1.5 lakh',
    why: 'Dry weather and quick drying; crews are free after the festive rush.',
    brands: 'Asian Paints, Berger, Nerolac certified crews',
    reach: 'local',
    seasonGroup: 'spring',
    seasonLabel: 'January–February 2027',
    image: '/images/interior-painting.jpg',
  },
  {
    id: 'r1-heater',
    round: 1,
    tier: 'quick',
    kind: 'heater',
    title: 'Solar and electric water heaters',
    ticket: '₹8,000–30,000',
    why: 'For winter mornings; a solar heater pays back in about 3 years.',
    brands: 'Racold, V-Guard, Supreme Solar',
    reach: 'multi',
    seasonGroup: 'spring',
    seasonLabel: 'January–February 2027',
    image: '/images/water-heaters.jpg',
  },
  {
    id: 'r1-security',
    round: 1,
    tier: 'quick',
    kind: 'security',
    title: 'CCTV, video doorbells and smart locks',
    ticket: '₹8,000–30,000',
    why: 'Peace of mind while you travel for holidays and weddings.',
    brands: 'CP Plus, Godrej, Qubo dealers',
    reach: 'multi',
    seasonGroup: 'summer',
    seasonLabel: 'January–February 2027',
    image: '/images/cctv-security.jpg',
  },
  {
    id: 'r2-solar',
    round: 2,
    tier: 'big',
    kind: 'solar',
    title: 'Rooftop solar, round 2',
    ticket: '₹1.5–2.2 lakh before subsidy',
    why: 'Installed by April, in time for the strongest sun and the highest bills.',
    brands: SOLAR_BRANDS,
    reach: 'multi',
    seasonGroup: 'summer',
    seasonLabel: 'March–April 2027',
    image: '/images/rooftop-solar.jpg',
  },
  {
    id: 'r2-cooling',
    round: 2,
    tier: 'big',
    kind: 'cooling',
    title: 'Air conditioners with installation',
    ticket: '₹35,000–1 lakh',
    why: 'Fitted before the 45°C weeks, when prices and waiting times go up.',
    brands: 'Voltas, Blue Star, Daikin dealers',
    reach: 'multi',
    seasonGroup: 'summer',
    seasonLabel: 'March–April 2027',
    image: '/images/air-conditioners.jpg',
  },
  {
    id: 'r2-bathroom',
    round: 2,
    tier: 'big',
    kind: 'bathroom',
    title: 'Bathroom makeover with leak-proofing',
    ticket: '₹1–3 lakh',
    why: 'Fix seepage in the dry months, well before the rains.',
    brands: 'Local crews with Jaquar, Cera and Hindware fittings',
    reach: 'local',
    seasonGroup: 'summer',
    seasonLabel: 'March–April 2027',
    image: '/images/bathroom-improvements.jpg',
  },
  {
    id: 'r2-backup',
    round: 2,
    tier: 'quick',
    kind: 'backup',
    title: 'Inverters and batteries',
    ticket: '₹15,000–45,000',
    why: 'Ready for summer load cuts; replace batteries older than 3 years.',
    brands: 'Luminous, Exide, Microtek',
    reach: 'multi',
    seasonGroup: 'monsoon',
    seasonLabel: 'March–April 2027',
    image: '/images/inverters-batteries.jpg',
  },
  {
    id: 'r2-fans',
    round: 2,
    tier: 'quick',
    kind: 'fans',
    title: 'Energy-saving BLDC fans and LED lights',
    ticket: '₹10,000–40,000 for a home',
    why: 'BLDC fans use about half the power; swap them before fan season.',
    brands: 'Atomberg, Havells, Crompton',
    reach: 'multi',
    seasonGroup: 'year_round',
    seasonLabel: 'March–April 2027',
    image: '/images/bldc-fans-lights.jpg',
  },
  {
    id: 'r2-coolroof',
    round: 2,
    tier: 'quick',
    kind: 'coolroof',
    title: 'Cool-roof coating for top floors',
    ticket: '₹15,000–40,000',
    why: 'A white heat-reflective coat makes top-floor rooms noticeably cooler.',
    brands: 'Dr. Fixit, Asian Paints SmartCare applicators',
    reach: 'local',
    seasonGroup: 'monsoon',
    seasonLabel: 'March–April 2027',
    image: '/images/cool-roof.jpg',
  },
  {
    id: 'r3-waterproofing',
    round: 3,
    tier: 'big',
    kind: 'waterproofing',
    title: 'Terrace and wall waterproofing',
    ticket: '₹30,000–1.5 lakh',
    why: 'Done in May, the last dry month, before the first rain.',
    brands: 'Dr. Fixit, Asian Paints SmartCare applicators',
    reach: 'local',
    seasonGroup: 'monsoon',
    seasonLabel: 'May 2027, before the monsoon',
    image: '/images/waterproofing.jpg',
  },
  {
    id: 'r3-windows',
    round: 3,
    tier: 'big',
    kind: 'windows',
    title: 'uPVC windows and mesh doors',
    ticket: '₹80,000–2.5 lakh',
    why: 'Fitted before the monsoon to keep out leaks, dust and mosquitoes.',
    brands: 'State-level fabricators using Fenesta and Encraft profiles',
    reach: 'multi',
    seasonGroup: 'winter',
    seasonLabel: 'May 2027, before the monsoon',
    image: '/images/upvc-windows.jpg',
  },
  {
    id: 'r3-rainwater',
    round: 3,
    tier: 'quick',
    kind: 'rainwater',
    title: 'Rainwater harvesting',
    ticket: '₹15,000–50,000',
    why: 'Ready to catch the first rain; refills borewells and cuts tanker bills.',
    brands: 'Local RWH contractors',
    reach: 'local',
    seasonGroup: 'winter',
    seasonLabel: 'May 2027, before the monsoon',
    image: '/images/rainwater-harvesting.jpg',
  },
  {
    id: 'r3-pest',
    round: 3,
    tier: 'quick',
    kind: 'pest',
    title: 'Anti-termite and pest control',
    ticket: '₹3,000–15,000',
    why: 'Treat before the monsoon, when termites and mosquitoes spread.',
    brands: 'HiCare, Rentokil PCI',
    reach: 'multi',
    seasonGroup: 'winter',
    seasonLabel: 'May 2027, before the monsoon',
    image: '/images/pest-control.jpg',
  },
  {
    id: 'r4-solar',
    round: 4,
    tier: 'big',
    kind: 'solar',
    title: 'Rooftop solar, festive round',
    ticket: '₹1.5–2.2 lakh before subsidy',
    why: 'Clear skies after the monsoon; running before winter.',
    brands: SOLAR_BRANDS,
    reach: 'multi',
    seasonGroup: 'festive',
    seasonLabel: 'October–November 2027',
    image: '/images/rooftop-solar.jpg',
  },
  {
    id: 'r4-painting',
    round: 4,
    tier: 'big',
    kind: 'painting',
    title: 'Festive painting, inside and out',
    ticket: '₹60,000–2 lakh',
    why: 'Fresh walls for Diwali, once the walls have dried after the rains.',
    brands: 'Asian Paints, Berger, Nerolac certified crews',
    reach: 'local',
    seasonGroup: 'festive',
    seasonLabel: 'October–November 2027',
    image: '/images/festive-painting.jpg',
  },
  {
    id: 'r4-kitchen',
    round: 4,
    tier: 'big',
    kind: 'kitchen',
    title: 'Modular kitchens and wardrobes',
    ticket: '₹1.5–4 lakh',
    why: 'Measured in September, fitted before Diwali.',
    brands: 'State-level modular makers using Hettich and Hafele fittings',
    reach: 'multi',
    seasonGroup: 'festive',
    seasonLabel: 'October–November 2027',
    image: '/images/modular-kitchen.jpg',
  },
  {
    id: 'r4-appliances',
    round: 4,
    tier: 'quick',
    kind: 'appliances',
    title: 'Chimneys, hobs and dishwashers',
    ticket: '₹15,000–50,000',
    why: 'Festive offers, made better by buying as a group.',
    brands: 'Elica, Faber, Bosch dealers',
    reach: 'multi',
    seasonGroup: 'festive',
    seasonLabel: 'October–November 2027',
    image: '/images/kitchen-appliances.jpg',
  },
  {
    id: 'r4-whitegoods',
    round: 4,
    tier: 'quick',
    kind: 'whitegoods',
    title: 'Fridges and washing machines',
    ticket: '₹25,000–60,000',
    why: 'Diwali prices, made better by buying as a group.',
    brands: 'LG, Samsung, Whirlpool, Godrej dealers',
    reach: 'multi',
    seasonGroup: 'year_round',
    seasonLabel: 'October–November 2027',
    image: '/images/home-appliances.jpg',
  },
  {
    id: 'r4-water',
    round: 4,
    tier: 'quick',
    kind: 'water',
    title: 'Water purifiers and tank cleaning',
    ticket: '₹8,000–25,000',
    why: 'Clean tanks and new filters after the monsoon.',
    brands: 'Kent, Aquaguard, Livpure',
    reach: 'multi',
    seasonGroup: 'year_round',
    seasonLabel: 'October–November 2027',
    image: '/images/water-purifiers.jpg',
  },
  {
    id: 'r4-decor',
    round: 4,
    tier: 'quick',
    kind: 'decor',
    title: 'Blinds, curtains and lighting',
    ticket: '₹15,000–50,000',
    why: 'Finish the festive look once the painting is done.',
    brands: 'Local furnishers and lighting dealers',
    reach: 'local',
    seasonGroup: 'year_round',
    seasonLabel: 'October–November 2027',
    image: '/images/blinds-curtains.jpg',
  },
  {
    id: 'r5-solar',
    round: 5,
    tier: 'big',
    kind: 'solar',
    title: 'Rooftop solar, winter round',
    ticket: '₹1.5–2.2 lakh before subsidy',
    why: 'Installed in the cool, dry months, ready for next summer.',
    brands: SOLAR_BRANDS,
    reach: 'multi',
    seasonGroup: 'winter',
    seasonLabel: 'December 2027–January 2028',
    image: '/images/rooftop-solar.jpg',
  },
  {
    id: 'r5-furniture',
    round: 5,
    tier: 'quick',
    kind: 'furniture',
    title: 'Mattresses, sofas and beds',
    ticket: '₹15,000–60,000',
    why: 'Year-end offers, made better by buying as a group.',
    brands: 'Sleepwell, Wakefit, Godrej Interio dealers',
    reach: 'multi',
    seasonGroup: 'year_round',
    seasonLabel: 'December 2027–January 2028',
    image: '/images/mattresses-sofas.jpg',
  },
];

export const SEASON_CATEGORIES: {
  id: SeasonGroup;
  name: string;
  subtitle: string;
  bgClass: string;
  borderClass: string;
  headerBgClass: string;
}[] = [
  {
    id: 'spring',
    name: 'SPRING',
    subtitle: 'Jan–Feb 2027 · Dry weather installations',
    bgClass: 'bg-[#EEF5EE]',
    borderClass: 'border-[#CFE0CF]',
    headerBgClass: 'bg-[#DFECDF]',
  },
  {
    id: 'summer',
    name: 'SUMMER',
    subtitle: 'Jan–Apr 2027 · Beat the 45°C peak',
    bgClass: 'bg-[#FBF6E8]',
    borderClass: 'border-[#E8DCB8]',
    headerBgClass: 'bg-[#F5E9C8]',
  },
  {
    id: 'monsoon',
    name: 'MONSOON',
    subtitle: 'Mar–May 2027 · Pre-rain protection & backup',
    bgClass: 'bg-[#EBF3F5]',
    borderClass: 'border-[#C9DEE3]',
    headerBgClass: 'bg-[#DCEBF0]',
  },
  {
    id: 'winter',
    name: 'WINTER',
    subtitle: 'May & Dec 2027 · Weatherproofing & conservation',
    bgClass: 'bg-[#F1F4EE]',
    borderClass: 'border-[#D5DFCE]',
    headerBgClass: 'bg-[#E3EAE0]',
  },
  {
    id: 'festive',
    name: 'FESTIVE',
    subtitle: 'Oct–Nov 2027 · Ready before Diwali',
    bgClass: 'bg-[#F9F2E7]',
    borderClass: 'border-[#E6D3B3]',
    headerBgClass: 'bg-[#F2E3C6]',
  },
  {
    id: 'year_round',
    name: 'YEAR ROUND',
    subtitle: 'Essential home upgrades & appliances',
    bgClass: 'bg-[#EAF2E9]',
    borderClass: 'border-[#C8DBC6]',
    headerBgClass: 'bg-[#DAE9D8]',
  },
];

export const DEFAULT_EXPANDED_SEASON: SeasonGroup | null = null;

export const DEFAULT_EXPANDED_SEASONS: Record<SeasonGroup, boolean> = {
  spring: false,
  summer: false,
  monsoon: false,
  winter: false,
  festive: false,
  year_round: false,
};

export function toggleSeasonExpanded(
  current: SeasonGroup | null,
  seasonId: SeasonGroup
): SeasonGroup | null {
  return current === seasonId ? null : seasonId;
}

export function isSeasonGroupExpanded(
  expandedSeason: SeasonGroup | null,
  seasonId: SeasonGroup
): boolean {
  return expandedSeason === seasonId;
}

export const TIER_LABELS: Record<DealTier, string> = {
  big: 'Big deal',
  quick: 'Quick win',
};

export const REACH_LABELS: Record<DealReach, string> = {
  multi: 'One vendor, many cities',
  local: 'Local crew, Nagpur first',
};

export function formatRupees(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}

export function formatDateIN(isoDate: string): string {
  return new Date(isoDate + 'T00:00:00Z').toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function buildWhatsAppUrl(message: string): string {
  const base = CLUB_CONFIG.whatsapp ? `https://wa.me/${CLUB_CONFIG.whatsapp}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function normalizeIndianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  return digits.slice(-10);
}

export function isValidIndianPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 10) return false;
  const ten = normalizeIndianPhone(raw);
  return /^[6-9]\d{9}$/.test(ten);
}

export function getRoundForDeal(deal: DealItem): RoundInfo {
  return ROUNDS.find((r) => r.n === deal.round) || ROUNDS[0];
}

export function isDealAvailableInCity(deal: DealItem, city: string): boolean {
  if (deal.reach === 'multi') {
    return (LAUNCH_CITIES as readonly string[]).includes(city);
  }
  return city === 'Nagpur';
}

export function filterDealsByCity(city: string | null): DealItem[] {
  if (!city) return DEALS;
  const isLaunch = (LAUNCH_CITIES as readonly string[]).includes(city);
  if (!isLaunch) return DEALS;
  return DEALS.filter((d) => isDealAvailableInCity(d, city));
}

export function findNearestCity(lat: number, lon: number): { city: string; km: number } {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  let best = { city: 'Other', km: Infinity };
  for (const [city, [clat, clon]] of Object.entries(CITY_COORDS)) {
    const d =
      12742 *
      Math.asin(
        Math.sqrt(
          Math.sin(toRad(clat - lat) / 2) ** 2 +
            Math.cos(toRad(lat)) * Math.cos(toRad(clat)) * Math.sin(toRad(clon - lon) / 2) ** 2
        )
      );
    if (d < best.km) {
      best = { city, km: d };
    }
  }
  return best.km <= 80 ? best : { city: 'Other', km: best.km };
}

export function getRemainingSeats(membersJoined: number): {
  joined: number;
  remaining: number;
  percentFull: number;
} {
  const joined = Math.max(0, Math.min(CLUB_CONFIG.foundingSeats, membersJoined));
  const remaining = CLUB_CONFIG.foundingSeats - joined;
  const percentFull = Math.round((joined / CLUB_CONFIG.foundingSeats) * 100);
  return { joined, remaining, percentFull };
}

export function getRoundProgress(optinsCount: number): {
  optins: number;
  target: number;
  percent: number;
} {
  const optins = Math.max(0, optinsCount);
  const percent = Math.min(100, Math.round((optins / ROUND_1_SOLAR.target) * 100));
  return { optins, target: ROUND_1_SOLAR.target, percent };
}

export interface JoinFormInput {
  name: string;
  phone: string;
  area: string;
  home: string;
  interests: string[];
  consent: boolean;
}

export interface JoinFormErrors {
  name?: string;
  phone?: string;
  area?: string;
  home?: string;
  consent?: string;
  server?: string;
}

export function validateJoinForm(
  input: JoinFormInput,
  messages: {
    f_err_name: string;
    f_err_phone: string;
    f_err_area: string;
    f_err_home: string;
    f_err_consent: string;
  }
): JoinFormErrors {
  const errors: JoinFormErrors = {};
  if (input.name.trim().length < 2) {
    errors.name = messages.f_err_name;
  }
  if (!isValidIndianPhone(input.phone)) {
    errors.phone = messages.f_err_phone;
  }
  if (!input.area) {
    errors.area = messages.f_err_area;
  }
  if (!input.home) {
    errors.home = messages.f_err_home;
  }
  if (!input.consent) {
    errors.consent = messages.f_err_consent;
  }
  return errors;
}

export interface DealInterestInput {
  deals: string[];
  name: string;
  phone: string;
  city: string;
  consent: boolean;
}

export interface DealInterestErrors {
  deals?: string;
  name?: string;
  phone?: string;
  consent?: string;
  server?: string;
}

export function validateDealInterestForm(input: DealInterestInput): DealInterestErrors {
  const errors: DealInterestErrors = {};
  if (!input.deals.length) {
    errors.deals = 'Tap at least one deal above.';
  }
  if (input.name.trim().length < 2) {
    errors.name = 'Please enter your name.';
  }
  if (!isValidIndianPhone(input.phone)) {
    errors.phone = 'Enter a 10-digit WhatsApp number.';
  }
  if (!input.consent) {
    errors.consent = 'Please agree so we can message you on WhatsApp.';
  }
  return errors;
}
