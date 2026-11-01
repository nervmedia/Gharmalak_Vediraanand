import { CLUB_CONFIG, isValidIndianPhone, normalizeIndianPhone } from './clubData';

export type MembershipStatus =
  | 'Not Registered'
  | 'Payment Pending'
  | 'Active'
  | 'Expired'
  | 'Cancelled';

export type PaymentStatus =
  | 'Not Initiated'
  | 'Pending'
  | 'Paid'
  | 'Failed'
  | 'Cancelled';

export type SupportedMemberCity =
  | 'Nagpur'
  | 'Wardha'
  | 'Amravati'
  | 'Pune'
  | 'Chhatrapati Sambhajinagar'
  | 'Nashik'
  | 'Chandrapur';

export const MEMBER_CITIES: SupportedMemberCity[] = [
  'Nagpur',
  'Wardha',
  'Amravati',
  'Pune',
  'Chhatrapati Sambhajinagar',
  'Nashik',
  'Chandrapur',
];

export const MEMBER_CITY_CODES: Record<SupportedMemberCity, string> = {
  Nagpur: 'NGP',
  Wardha: 'WRD',
  Amravati: 'AMR',
  Pune: 'PUN',
  'Chhatrapati Sambhajinagar': 'CSN',
  Nashik: 'NSK',
  Chandrapur: 'CHP',
};

export const MEMBERSHIP_TRANSPARENCY_NOTICE =
  'Browsing is free. Membership is required to unlock deals and participate in group rounds.';

export const MEMBERSHIP_POPUP_CONTENT = {
  heading: 'Good things happen when we buy together!',
  supportingText:
    'Become a Gharmalak Club member to unlock exclusive group deals and participate in homeowner savings rounds.',
  benefits: [
    'Access and unlock eligible group deals.',
    'Participate in available group-buying rounds.',
    'Receive relevant homeowner deal updates.',
  ],
  primaryCta: 'Become a Member',
  secondaryCta: 'Already a Member? Log In',
  renewCta: 'Renew Membership',
  completePaymentCta: 'Complete Membership Payment',
} as const;

export interface MemberProfile {
  memberId: string;
  name: string;
  mobileNumber: string;
  whatsappNumber: string;
  email: string;
  city: SupportedMemberCity;
  pinCode: string;
  area?: string;
  homeType?: string;
  interests?: string[];
  membershipStartDate: string | null;
  membershipExpiryDate: string | null;
  paymentStatus: PaymentStatus;
  membershipStatus: MembershipStatus;
  unlockedDeals?: string[];
  solarOptInRounds?: number[];
}

export interface PendingDealIntent {
  type: 'unlock-deal' | 'deal-interest' | 'solar-optin' | 'solar-interest';
  label: string;
  returnPath: '/' | '/how-it-works' | '/deals' | '/round/solar-nagpur' | '/join' | '/privacy' | '/for-business';
  returnHash?: string;
  returnQuery?: string;
  dealId?: string;
  dealTitle?: string;
  roundId?: string;
  roundNumber?: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
}

export interface MembershipRegistrationInput {
  name: string;
  mobileNumber: string;
  whatsappNumber: string;
  email: string;
  city: SupportedMemberCity | '';
  pinCode: string;
  password: string;
  area?: string;
  homeType?: 'house' | 'flat' | '';
  interests?: string[];
  consent: boolean;
}

export type MembershipRegistrationErrors = Partial<
  Record<
    | 'name'
    | 'mobileNumber'
    | 'whatsappNumber'
    | 'email'
    | 'city'
    | 'pinCode'
    | 'password'
    | 'consent'
    | 'server',
    string
  >
>;

export interface MembershipLoginInput {
  identifier: string; // mobile number or email
  password: string;
}

export type MembershipLoginErrors = Partial<
  Record<'identifier' | 'password' | 'server', string>
>;

export function isValidEmailAddress(email: string): boolean {
  const trimmed = String(email || '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

export function isValidPinCode(pinCode: string): boolean {
  const trimmed = String(pinCode || '').trim();
  return /^[1-9]\d{5}$/.test(trimmed);
}

export function isSupportedMemberCity(city: string): city is SupportedMemberCity {
  return (MEMBER_CITIES as readonly string[]).includes(city);
}

export function validateMembershipRegistration(
  input: MembershipRegistrationInput
): MembershipRegistrationErrors {
  const errors: MembershipRegistrationErrors = {};

  if (!input.name || input.name.trim().length < 2) {
    errors.name = 'Please enter your full name.';
  }

  if (!isValidIndianPhone(input.mobileNumber)) {
    errors.mobileNumber = 'Please enter a valid 10-digit Indian mobile number.';
  }

  if (!isValidIndianPhone(input.whatsappNumber)) {
    errors.whatsappNumber = 'Please enter a valid 10-digit WhatsApp number.';
  }

  if (!isValidEmailAddress(input.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!input.city || !isSupportedMemberCity(input.city)) {
    errors.city = 'Please select your city.';
  }

  if (!isValidPinCode(input.pinCode)) {
    errors.pinCode = 'Please enter a valid 6-digit PIN code.';
  }

  if (!input.password || input.password.length < 6) {
    errors.password = 'Please create a password of at least 6 characters.';
  }

  if (!input.consent) {
    errors.consent = 'Please agree to the membership terms and privacy policy to continue.';
  }

  return errors;
}

export function validateMembershipLogin(
  input: MembershipLoginInput
): MembershipLoginErrors {
  const errors: MembershipLoginErrors = {};
  const trimmedId = String(input.identifier || '').trim();

  if (!trimmedId) {
    errors.identifier = 'Please enter your registered mobile number or email address.';
  } else {
    const looksLikeEmail = trimmedId.includes('@');
    if (looksLikeEmail && !isValidEmailAddress(trimmedId)) {
      errors.identifier = 'Please enter a valid email address.';
    } else if (!looksLikeEmail && !isValidIndianPhone(trimmedId)) {
      errors.identifier = 'Please enter a valid 10-digit mobile number or email address.';
    }
  }

  if (!input.password || input.password.length < 4) {
    errors.password = 'Please enter your password.';
  }

  return errors;
}

export function computeEffectiveMembershipStatus(
  member: Pick<
    MemberProfile,
    'membershipStatus' | 'paymentStatus' | 'membershipExpiryDate'
  > | null,
  referenceDate: Date = new Date()
): MembershipStatus {
  if (!member) {
    return 'Not Registered';
  }
  if (member.membershipStatus === 'Cancelled') {
    return 'Cancelled';
  }
  if (member.paymentStatus !== 'Paid') {
    return member.membershipStatus === 'Not Registered'
      ? 'Not Registered'
      : 'Payment Pending';
  }
  if (member.membershipExpiryDate) {
    const expiryTime = new Date(member.membershipExpiryDate).getTime();
    if (!Number.isNaN(expiryTime) && expiryTime <= referenceDate.getTime()) {
      return 'Expired';
    }
  }
  return member.membershipStatus === 'Active' ? 'Active' : 'Payment Pending';
}

export function canAccessMemberDeals(
  member: Pick<
    MemberProfile,
    'membershipStatus' | 'paymentStatus' | 'membershipExpiryDate'
  > | null,
  referenceDate: Date = new Date()
): boolean {
  return computeEffectiveMembershipStatus(member, referenceDate) === 'Active';
}

export function getHeaderMembershipIndicator(
  member: Pick<
    MemberProfile,
    'membershipStatus' | 'paymentStatus' | 'membershipExpiryDate' | 'memberId'
  > | null,
  referenceDate: Date = new Date()
): {
  state: 'visitor' | 'active' | 'expired' | 'pending';
  label: string;
  badgeText?: string;
} {
  const status = computeEffectiveMembershipStatus(member, referenceDate);
  if (status === 'Active') {
    return {
      state: 'active',
      label: 'My Membership',
      badgeText: 'Active',
    };
  }
  if (status === 'Expired') {
    return {
      state: 'expired',
      label: 'Renew Membership',
      badgeText: 'Expired',
    };
  }
  if (status === 'Payment Pending') {
    return {
      state: 'pending',
      label: 'Complete Membership',
      badgeText: 'Pending',
    };
  }
  return {
    state: 'visitor',
    label: 'Join the club',
  };
}

export function formatMemberId(city: SupportedMemberCity, sequenceNumber: number): string {
  const code = MEMBER_CITY_CODES[city] || 'NGP';
  const padded = String(Math.max(1, sequenceNumber)).padStart(4, '0');
  return `GM · ${padded} · ${code}`;
}

export function getMembershipPlanSummary() {
  return {
    fee: CLUB_CONFIG.fee,
    regularFee: CLUB_CONFIG.regularFee,
    validityMonths: 12,
    foundingSeats: CLUB_CONFIG.foundingSeats,
  };
}

export function normalizeRegistrationPayload(input: MembershipRegistrationInput) {
  return {
    ...input,
    name: input.name.trim(),
    mobileNumber: normalizeIndianPhone(input.mobileNumber),
    whatsappNumber: normalizeIndianPhone(input.whatsappNumber),
    email: input.email.trim().toLowerCase(),
    pinCode: input.pinCode.trim(),
  };
}
