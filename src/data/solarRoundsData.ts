import { LangCode } from './translations';
import {
  ROUND_1_SOLAR,
  buildWhatsAppUrl,
  isValidIndianPhone,
  normalizeIndianPhone,
} from './clubData';

export type SolarRoundId =
  | 'solar-round-1'
  | 'solar-round-2'
  | 'solar-round-3'
  | 'solar-round-4'
  | 'solar-round-5';

export type SolarRoundStatusType = 'active' | 'upcoming' | 'coming_soon';

export interface SolarRoundStep {
  stepNumber: number;
  title: string;
  description: string;
}

export interface SolarRoundOptInConfig {
  title: string;
  body: string;
  ctaLabel: string;
  whatsappButtonLabel: string;
  whatsappPrefillText: string;
  statusBannerText?: string;
}

export interface SolarRoundData {
  id: SolarRoundId;
  roundNumber: 1 | 2 | 3 | 4 | 5;
  tabLabel: string;
  eyebrow: string;
  title: string;
  statusType: SolarRoundStatusType;
  status: string;
  isAcceptingOptIns: boolean;
  openingDate: string;
  closingDate: string;
  optInWindowLabel: string;
  installationTimeline: string;
  description: string;
  image: string;
  imageAlt: string;
  systemCapacity: string;
  priceInformation: {
    label: string;
    value: string;
  };
  benchmarkInformation: {
    label: string;
    value: string;
  };
  typicalSpendNote: string;
  subsidyInformation: {
    badgeLabel: string;
    title: string;
    details: string;
  };
  minimumHomes: number;
  participatingHomes: number;
  benefitsHeading: string;
  benefits: string[];
  eligibilityHeading: string;
  eligibility: string[];
  howHeading: string;
  howSteps: SolarRoundStep[];
  optInInformation: SolarRoundOptInConfig;
}

export const SOLAR_ROUND_IDS: readonly SolarRoundId[] = [
  'solar-round-1',
  'solar-round-2',
  'solar-round-3',
  'solar-round-4',
  'solar-round-5',
] as const;

export const DEFAULT_SOLAR_ROUND_ID: SolarRoundId = 'solar-round-1';

/**
 * Central editable configuration for all five Gharmalak Solar Rounds.
 *
 * IMPORTANT:
 * - Solar Round 1 contains the verified active launch round details.
 * - Solar Rounds 2–5 contain clearly labelled editable placeholder data
 *   with 'Upcoming' / 'Details Coming Soon' status so placeholder values
 *   are never misrepresented as an active commercial offer until official
 *   round dates and vendor benchmark quotes are published.
 */
export function getSolarRoundsData(
  lang: LangCode = 'en',
  liveRound1OptIns: number = 1,
  todayISO: string = new Date().toISOString().slice(0, 10)
): SolarRoundData[] {
  const round1ActiveStatus =
    lang === 'mr'
      ? 'जानेवारी–फेब्रुवारी नोंदणी'
      : lang === 'hi'
      ? 'जनवरी–फरवरी ऑप्ट-इन'
      : 'Opt-in Jan–Feb';

  const safeRound1OptIns = Math.max(0, liveRound1OptIns);

  // Common 4-step club process localised per language
  const getStandardSteps = (roundNum: number, isUpcoming: boolean): SolarRoundStep[] => {
    if (lang === 'mr') {
      return [
        {
          stepNumber: 1,
          title: 'आम्ही १० स्थानिक कोटेशन घेतो',
          description: isUpcoming
            ? `सोलर राउंड ${roundNum} सुरू होण्यापूर्वी स्थानिक कोटेशनवरून बीट करायची किंमत ठरवली जाईल.`
            : 'मधले कोटेशन म्हणजे बीट करायची किंमत. निर्णयाआधीच ती तुम्हाला दिसते.',
        },
        {
          stepNumber: 2,
          title: 'तुम्ही WhatsApp वर होकार देता',
          description: 'YES लिहा. फोन कॉल नाहीत. महिन्याला जास्तीत जास्त ४ मेसेज.',
        },
        {
          stepNumber: 3,
          title: 'पडताळलेले विक्रेते बोली लावतात',
          description: 'जिंकणारी बोली किमान १०% कमी असलीच पाहिजे.',
        },
        {
          stepNumber: 4,
          title: 'नाहीतर राउंड रद्द',
          description: 'कोणीही किंमत बीट केली नाही तर कोणीही पैसे देत नाही, डिपॉझिट पूर्ण परत.',
        },
      ];
    }
    if (lang === 'hi') {
      return [
        {
          stepNumber: 1,
          title: 'हम 10 स्थानीय कोटेशन लेते हैं',
          description: isUpcoming
            ? `सोलर राउंड ${roundNum} शुरू होने से पहले स्थानीय कोटेशन से मात देने वाला दाम तय किया जाएगा।`
            : 'बीच वाला कोटेशन मात देने वाला दाम बनता है। फैसले से पहले आप उसे देखते हैं।',
        },
        {
          stepNumber: 2,
          title: 'आप WhatsApp पर हाँ कहते हैं',
          description: 'YES भेजें। कोई कॉल नहीं। महीने में ज़्यादा से ज़्यादा 4 मैसेज।',
        },
        {
          stepNumber: 3,
          title: 'सत्यापित विक्रेता बोली लगाते हैं',
          description: 'जीतने वाली बोली कम से कम 10% कम होनी चाहिए।',
        },
        {
          stepNumber: 4,
          title: 'वरना राउंड रद्द',
          description: 'कोई दाम न हराए तो कोई भुगतान नहीं, डिपॉज़िट पूरा वापस।',
        },
      ];
    }
    return [
      {
        stepNumber: 1,
        title: 'We collect 10 local quotes',
        description: isUpcoming
          ? `Before Solar Round ${roundNum} opens, 10 local quotes will set the official price to beat.`
          : 'The middle quote becomes the price to beat. You see it before you decide.',
      },
      {
        stepNumber: 2,
        title: 'You opt in on WhatsApp',
        description: 'Reply YES. No calls, no follow-ups. At most 4 messages a month.',
      },
      {
        stepNumber: 3,
        title: 'Verified vendors bid',
        description: 'The winning bid must be at least 10% below the price to beat.',
      },
      {
        stepNumber: 4,
        title: 'Or the round is cancelled',
        description: 'If no vendor beats it, nobody pays and your deposit comes back in full.',
      },
    ];
  };

  // ============================================================================
  // SOLAR ROUND 1 — VERIFIED ACTIVE LAUNCH ROUND
  // ============================================================================
  const round1: SolarRoundData = {
    id: 'solar-round-1',
    roundNumber: 1,
    tabLabel: 'Solar Round 1',
    eyebrow:
      lang === 'mr'
        ? 'राउंड १ · जानेवारी–फेब्रुवारी नोंदणी'
        : lang === 'hi'
        ? 'राउंड 1 · जनवरी–फरवरी ऑप्ट-इन'
        : 'ROUND 1 · OPT-IN JAN–FEB',
    title:
      lang === 'mr'
        ? 'रूफटॉप सोलर, जानेवारीत बसवणी'
        : lang === 'hi'
        ? 'रूफटॉप सोलर, जनवरी में इंस्टॉलेशन'
        : 'Rooftop solar, installed in January',
    statusType: 'active',
    status: round1ActiveStatus,
    isAcceptingOptIns: true,
    openingDate:
      lang === 'mr' ? 'जानेवारी' : lang === 'hi' ? 'जनवरी' : 'January',
    closingDate:
      lang === 'mr' ? 'फेब्रुवारी' : lang === 'hi' ? 'फरवरी' : 'February',
    optInWindowLabel:
      lang === 'mr'
        ? 'जानेवारी – फेब्रुवारी'
        : lang === 'hi'
        ? 'जनवरी – फरवरी'
        : 'January – February',
    installationTimeline:
      lang === 'mr'
        ? '३१ डिसेंबरपर्यंत नोंदणी. बसवणी जानेवारी-फेब्रुवारीत, उन्हाळ्याआधी.'
        : lang === 'hi'
        ? '31 दिसंबर तक ऑप्ट-इन। इंस्टॉलेशन जनवरी-फरवरी में, गर्मी से पहले।'
        : 'Opt in by 31 December. Installed in January–February, before summer.',
    description:
      lang === 'mr'
        ? 'नागपूर, नाशिक, पुणे आणि MSEDCL वरील महाराष्ट्रातील इतर शहरांतील स्वतंत्र घरासाठी ३ kW सिस्टम, पीएम सूर्य घर अनुदानाच्या कागदपत्रांसाठी मदतीसह. १ नोव्हेंबर ते ३१ डिसेंबर नोंदणी; बसवणी जानेवारी-फेब्रुवारीत, उन्हाळ्याआधी.'
        : lang === 'hi'
        ? 'नागपुर, नासिक, पुणे और MSEDCL वाले महाराष्ट्र के दूसरे शहरों में स्वतंत्र घर के लिए 3 kW सिस्टम, पीएम सूर्य घर सब्सिडी के कागज़ों में मदद के साथ। 1 नवंबर से 31 दिसंबर तक ऑप्ट-इन; इंस्टॉलेशन जनवरी-फरवरी में, गर्मी से पहले।'
        : 'A 3 kW system for an independent house in Nagpur, Nashik, Pune and other Maharashtra cities on MSEDCL, with help on the PM Surya Ghar subsidy paperwork. Opt in from 1 November to 31 December; installation in January and February, before summer.',
    image: '/images/rooftop-solar.jpg',
    imageAlt: 'Solar Round 1: 3 kW on-grid rooftop solar installation on an Indian bungalow',
    systemCapacity: '3 kW On-Grid Rooftop Solar · MSEDCL Cities',
    priceInformation: {
      label:
        lang === 'mr'
          ? 'बीट करायची किंमत'
          : lang === 'hi'
          ? 'मात देने वाला दाम'
          : 'Price to beat',
      value:
        lang === 'mr'
          ? 'डिसेंबरमध्ये जाहीर'
          : lang === 'hi'
          ? 'दिसंबर में घोषित'
          : 'Published in December',
    },
    benchmarkInformation: {
      label:
        lang === 'mr' ? 'जिंकणारी बोली' : lang === 'hi' ? 'जीतने वाली बोली' : 'Winning bid',
      value:
        lang === 'mr'
          ? 'किमान १०% कमी'
          : lang === 'hi'
          ? 'कम से कम 10% कम'
          : 'At least 10% lower',
    },
    typicalSpendNote: 'Typical spend: ₹1.5–2.2 lakh before subsidy',
    subsidyInformation: {
      badgeLabel: 'PM Surya Ghar Subsidy',
      title: 'PM Surya Ghar Muft Bijli Yojana Assistance',
      details:
        'Full paperwork support for residential on-grid rooftop systems on MSEDCL connections, subject to official MNRE / PM Surya Ghar portal eligibility.',
    },
    minimumHomes: ROUND_1_SOLAR.target,
    participatingHomes: safeRound1OptIns,
    benefitsHeading:
      lang === 'mr'
        ? 'तुम्हाला काय मिळते'
        : lang === 'hi'
        ? 'आपको क्या मिलता है'
        : 'What you get',
    benefits:
      lang === 'mr'
        ? [
            '३ kW ऑन-ग्रिड रूफटॉप सिस्टम, बसवून सुरू करून',
            'पीएम सूर्य घर अनुदान अर्जासाठी मदत',
            'MSEDCL कडे नेट मीटरिंगची कागदपत्रे',
            'क्लबमार्फत ५ वर्षांची कामाची हमी',
          ]
        : lang === 'hi'
        ? [
            '3 kW ऑन-ग्रिड रूफटॉप सिस्टम, लगाकर चालू करके',
            'पीएम सूर्य घर सब्सिडी आवेदन में मदद',
            'MSEDCL के साथ नेट मीटरिंग के कागज़',
            'क्लब के ज़रिए 5 साल की काम की गारंटी',
          ]
        : [
            '3 kW on-grid rooftop system, installed and commissioned',
            'Help with the PM Surya Ghar subsidy application',
            'Net metering paperwork with MSEDCL',
            '5-year workmanship cover through the club',
          ],
    eligibilityHeading: 'Eligibility & Installation Conditions',
    eligibility: [
      'Independent house or bungalow with clear, shadow-free concrete terrace access',
      'Active residential electricity connection in Nagpur, Nashik, Pune or MSEDCL launch cities',
      'PM Surya Ghar subsidy eligibility applies to residential consumers with valid sanctioned load',
      'Minimum group size of 50 homes required for vendor bid lock-in',
    ],
    howHeading:
      lang === 'mr'
        ? 'कसे सहभागी व्हायचे'
        : lang === 'hi'
        ? 'कैसे हिस्सा लें'
        : 'How to take part',
    howSteps: getStandardSteps(1, false),
    optInInformation: {
      title:
        lang === 'mr'
          ? 'राउंड १ साठी होकार द्या'
          : lang === 'hi'
          ? 'राउंड 1 के लिए हाँ कहें'
          : 'Opt in to Round 1',
      body:
        lang === 'mr'
          ? 'सामील होताना दिलेला WhatsApp क्रमांक लिहा. होकार देणे मोफत आहे, डिपॉझिट भरण्याआधी कधीही बाहेर पडू शकता.'
          : lang === 'hi'
          ? 'जुड़ते समय दिया WhatsApp नंबर लिखें। हाँ कहना मुफ्त है, डिपॉज़िट से पहले कभी भी हट सकते हैं।'
          : 'Enter the WhatsApp number you joined with. Opting in is free and you can drop out any time before you pay a deposit.',
      ctaLabel:
        lang === 'mr'
          ? 'माझा होकार नोंदवा'
          : lang === 'hi'
          ? 'मेरी हाँ दर्ज करें'
          : 'Opt me in',
      whatsappButtonLabel: 'WhatsApp: YES (Solar Round 1)',
      whatsappPrefillText:
        'YES, opt me in to Solar Round 1: rooftop solar, installed in January.',
    },
  };

  // ============================================================================
  // SOLAR ROUNDS 2 TO 5 — CLEARLY LABELLED EDITABLE PLACEHOLDER ROUNDS
  // (No invented dates, prices, savings, schedules, participant counts, or claims)
  // ============================================================================
  const roundScheduleByNumber: Record<
    2 | 3 | 4 | 5,
    {
      eyebrow: Record<LangCode, string>;
      openingDate: Record<LangCode, string>;
      closingDate: Record<LangCode, string>;
      optInWindowLabel: Record<LangCode, string>;
    }
  > = {
    2: {
      eyebrow: {
        en: 'ROUND 2 · OPT-IN MAR–APR',
        mr: 'राउंड २ · मार्च–एप्रिल नोंदणी',
        hi: 'राउंड 2 · मार्च–अप्रैल ऑप्ट-इन',
      },
      openingDate: { en: 'March', mr: 'मार्च', hi: 'मार्च' },
      closingDate: { en: 'April', mr: 'एप्रिल', hi: 'अप्रैल' },
      optInWindowLabel: {
        en: 'March – April',
        mr: 'मार्च – एप्रिल',
        hi: 'मार्च – अप्रैल',
      },
    },
    3: {
      eyebrow: {
        en: 'ROUND 3 · OPT-IN MAY–JUN',
        mr: 'राउंड ३ · मे–जून नोंदणी',
        hi: 'राउंड 3 · मई–जून ऑप्ट-इन',
      },
      openingDate: { en: 'May', mr: 'मे', hi: 'मई' },
      closingDate: { en: 'June', mr: 'जून', hi: 'जून' },
      optInWindowLabel: {
        en: 'May – June',
        mr: 'मे – जून',
        hi: 'मई – जून',
      },
    },
    4: {
      eyebrow: {
        en: 'ROUND 4 · OPT-IN SEP–OCT',
        mr: 'राउंड ४ · सप्टेंबर–ऑक्टोबर नोंदणी',
        hi: 'राउंड 4 · सितंबर–अक्टूबर ऑप्ट-इन',
      },
      openingDate: { en: 'September', mr: 'सप्टेंबर', hi: 'सितंबर' },
      closingDate: { en: 'October', mr: 'ऑक्टोबर', hi: 'अक्टूबर' },
      optInWindowLabel: {
        en: 'September – October',
        mr: 'सप्टेंबर – ऑक्टोबर',
        hi: 'सितंबर – अक्टूबर',
      },
    },
    5: {
      eyebrow: {
        en: 'ROUND 5 · OPT-IN NOV–DEC',
        mr: 'राउंड ५ · नोव्हेंबर–डिसेंबर नोंदणी',
        hi: 'राउंड 5 · नवंबर–दिसंबर ऑप्ट-इन',
      },
      openingDate: { en: 'November', mr: 'नोव्हेंबर', hi: 'नवंबर' },
      closingDate: { en: 'December', mr: 'डिसेंबर', hi: 'दिसंबर' },
      optInWindowLabel: {
        en: 'November – December',
        mr: 'नोव्हेंबर – डिसेंबर',
        hi: 'नवंबर – दिसंबर',
      },
    },
  };

  const createUpcomingPlaceholderRound = (
    roundNumber: 2 | 3 | 4 | 5,
    imagePath: string,
    imageAlt: string,
    statusBadge: string
  ): SolarRoundData => {
    const schedule = roundScheduleByNumber[roundNumber];
    return {
      id: `solar-round-${roundNumber}` as SolarRoundId,
      roundNumber,
      tabLabel: `Solar Round ${roundNumber}`,
      eyebrow: schedule.eyebrow[lang],
      title: `Solar Round ${roundNumber} — Details Coming Soon`,
      statusType: roundNumber <= 3 ? 'upcoming' : 'coming_soon',
      status: statusBadge,
      isAcceptingOptIns: false,
      openingDate: schedule.openingDate[lang],
      closingDate: schedule.closingDate[lang],
      optInWindowLabel: schedule.optInWindowLabel[lang],
      installationTimeline: `Installation schedule for Solar Round ${roundNumber} will be published when the round is announced.`,
      description: `Solar Round ${roundNumber} is an upcoming collective rooftop solar group round for Gharmalak members. Official opening and closing dates, system capacity options, local vendor benchmark quotes, and installation timelines will be updated here once finalised.`,
      image: imagePath,
      imageAlt,
      systemCapacity: `Residential On-Grid Rooftop Solar · Round ${roundNumber} (Specs Coming Soon)`,
      priceInformation: {
        label: 'Price to beat',
        value: 'Details Coming Soon',
      },
      benchmarkInformation: {
        label: 'Winning bid benchmark',
        value: 'To be announced',
      },
      typicalSpendNote: `Solar Round ${roundNumber}: Official price benchmark will be published before opt-ins open`,
      subsidyInformation: {
        badgeLabel: 'Subsidy Details Pending',
        title: 'PM Surya Ghar Subsidy & Eligibility (Upcoming Round)',
        details: `Applicable government rooftop solar subsidy guidelines and MSEDCL net-metering documentation requirements for Solar Round ${roundNumber} will be confirmed when the round opens.`,
      },
      minimumHomes: ROUND_1_SOLAR.target,
      participatingHomes: 0,
      benefitsHeading: `What will be included in Solar Round ${roundNumber}`,
      benefits: [
        `Editable placeholder: On-grid rooftop solar system specifications for Solar Round ${roundNumber} (Details Coming Soon)`,
        `Editable placeholder: PM Surya Ghar portal & MSEDCL net-metering paperwork guidance for Solar Round ${roundNumber}`,
        `Editable placeholder: Pre-vetted, brand-certified solar installation crew benchmarked across local quotes`,
        `Editable placeholder: Club workmanship cover and post-installation audit terms for Solar Round ${roundNumber}`,
      ],
      eligibilityHeading: `Eligibility & Installation Conditions (Solar Round ${roundNumber})`,
      eligibility: [
        `Active Gharmalak membership required before locking in Solar Round ${roundNumber} group pricing`,
        `Shadow-free residential terrace / rooftop assessment to be scheduled once Solar Round ${roundNumber} opens`,
        `Final MSEDCL sanction load, subsidy eligibility, and city coverage will be published with the round announcement`,
        `No advance or deposit is collected while Solar Round ${roundNumber} is in Upcoming status`,
      ],
      howHeading: `How Solar Round ${roundNumber} will work`,
      howSteps: getStandardSteps(roundNumber, true),
      optInInformation: {
        title: `Solar Round ${roundNumber} — ${statusBadge}`,
        body: `Solar Round ${roundNumber} is not yet open for active opt-in registrations. Official dates, local benchmark pricing, and installation slots will be announced after earlier rounds conclude.`,
        ctaLabel: `Opt-in Opens Soon (Solar Round ${roundNumber})`,
        whatsappButtonLabel: `Enquire on WhatsApp about Solar Round ${roundNumber}`,
        whatsappPrefillText: `Hi Gharmalak, please share an update when Solar Round ${roundNumber} rooftop solar details are announced.`,
        statusBannerText: `Solar Round ${roundNumber} is currently marked as "${statusBadge}". Placeholder fields are shown for preview only and is not an active offer yet.`,
      },
    };
  };

  const round2 = createUpcomingPlaceholderRound(
    2,
    '/images/rooftop-solar-round-2.jpg',
    'Solar Round 2: Residential rooftop solar panel array on a flat concrete house terrace',
    'Upcoming'
  );

  const round3 = createUpcomingPlaceholderRound(
    3,
    '/images/rooftop-solar-round-3.jpg',
    'Solar Round 3: Rooftop solar panels installed on a residential independent bungalow roof',
    'Upcoming'
  );

  const round4 = createUpcomingPlaceholderRound(
    4,
    '/images/rooftop-solar-round-4.jpg',
    'Solar Round 4: Residential neighbourhood homes fitted with rooftop solar systems',
    'Details Coming Soon'
  );

  const round5 = createUpcomingPlaceholderRound(
    5,
    '/images/rooftop-solar-round-5.jpg',
    'Solar Round 5: Row of residential homes with high-efficiency rooftop solar installations',
    'Details Coming Soon'
  );

  return [round1, round2, round3, round4, round5];
}

export function getSolarRoundById(
  rounds: readonly SolarRoundData[],
  id: SolarRoundId | string | null | undefined
): SolarRoundData {
  const found = rounds.find((r) => r.id === id);
  return found || rounds[0];
}

export function getSolarRoundByNumber(
  rounds: readonly SolarRoundData[],
  roundNumber: number
): SolarRoundData {
  const found = rounds.find((r) => r.roundNumber === roundNumber);
  return found || rounds[0];
}

export function calculateSolarRoundProgress(round: Pick<SolarRoundData, 'participatingHomes' | 'minimumHomes'>): {
  participatingHomes: number;
  minimumHomes: number;
  percent: number;
  barWidthPercent: number;
} {
  const minimumHomes = Math.max(1, round.minimumHomes);
  const participatingHomes = Math.max(0, round.participatingHomes);
  const percent = Math.min(100, Math.round((participatingHomes / minimumHomes) * 100));
  const barWidthPercent = participatingHomes > 0 ? Math.max(percent, 4) : 0;
  return {
    participatingHomes,
    minimumHomes,
    percent,
    barWidthPercent,
  };
}

export function getSolarRoundWhatsAppUrl(round: Pick<SolarRoundData, 'optInInformation'>): string {
  return buildWhatsAppUrl(round.optInInformation.whatsappPrefillText);
}

export const SOLAR_INTEREST_CONFIRMATION_MESSAGE =
  'Thank you for your interest! Our Gharmalak team will contact you with updates about your selected Solar Round.';

export interface SolarRoundInterestInput {
  name: string;
  phone: string;
  city: string;
  consent: boolean;
}

export interface SolarRoundInterestErrors {
  name?: string;
  phone?: string;
  city?: string;
  consent?: string;
  server?: string;
}

export interface SolarRoundInterestSubmissionPayload {
  roundId: SolarRoundId;
  roundNumber: 1 | 2 | 3 | 4 | 5;
  roundLabel: string;
  interestLabel: string;
  optInSchedule: string;
  name: string;
  phone: string;
  city: string;
  consent: boolean;
  source: string;
}

export function getSolarRoundInterestLabel(roundNumber: 1 | 2 | 3 | 4 | 5): string {
  return `Interest in Solar Round ${roundNumber}`;
}

export function validateSolarRoundInterestForm(
  input: SolarRoundInterestInput
): SolarRoundInterestErrors {
  const errors: SolarRoundInterestErrors = {};
  if (!input.name || input.name.trim().length < 2) {
    errors.name = 'Please enter your name.';
  }
  if (!isValidIndianPhone(input.phone)) {
    errors.phone = 'Please enter a valid 10-digit WhatsApp/mobile number.';
  }
  if (!input.city || !input.city.trim()) {
    errors.city = 'Please select your city.';
  }
  if (!input.consent) {
    errors.consent = 'Please agree to the privacy and WhatsApp update notice to continue.';
  }
  return errors;
}

export function buildSolarRoundInterestPayload(
  round: Pick<SolarRoundData, 'id' | 'roundNumber' | 'tabLabel' | 'optInWindowLabel'>,
  input: SolarRoundInterestInput,
  source: string = 'solar-round-interest-modal'
): SolarRoundInterestSubmissionPayload {
  return {
    roundId: round.id,
    roundNumber: round.roundNumber,
    roundLabel: round.tabLabel,
    interestLabel: getSolarRoundInterestLabel(round.roundNumber),
    optInSchedule: round.optInWindowLabel,
    name: input.name.trim(),
    phone: normalizeIndianPhone(input.phone),
    city: input.city.trim(),
    consent: Boolean(input.consent),
    source,
  };
}
