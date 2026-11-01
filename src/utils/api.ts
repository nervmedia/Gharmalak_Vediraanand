import { JoinFormInput, normalizeIndianPhone } from '../data/clubData';
import {
  MemberProfile,
  MembershipLoginInput,
  MembershipRegistrationInput,
  MembershipStatus,
  PaymentStatus,
  PendingDealIntent,
  normalizeRegistrationPayload,
} from '../data/membershipData';
import { SolarRoundInterestSubmissionPayload } from '../data/solarRoundsData';
import { isSupportedCity, saveSelectedCity } from './location';

export interface ClubStats {
  members: number;
  optins: number;
}

export interface PaymentOrderInfo {
  orderId: string;
  memberId: string;
  amountInr: number;
  purpose: 'new-membership' | 'renewal';
  status: PaymentStatus;
  paymentMethod?: string;
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
}

export class MembershipRequiredError extends Error {
  membershipStatus: MembershipStatus;
  constructor(message: string, membershipStatus: MembershipStatus = 'Not Registered') {
    super(message);
    this.name = 'MembershipRequiredError';
    this.membershipStatus = membershipStatus;
  }
}

const LOCAL_STATS_KEY = 'gm_club_stats_v1';
const LOCAL_MEMBERS_KEY = 'gm_club_members_v1';
const LOCAL_OPTINS_KEY = 'gm_club_optins_v1';
const MEMBER_SESSION_TOKEN_KEY = 'gm_member_session_token_v1';
const PENDING_DEAL_INTENT_KEY = 'gm_pending_deal_intent_v1';

export function getMemberSessionToken(): string | null {
  try {
    return localStorage.getItem(MEMBER_SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveMemberSessionToken(token: string) {
  try {
    localStorage.setItem(MEMBER_SESSION_TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function clearMemberSessionToken() {
  try {
    localStorage.removeItem(MEMBER_SESSION_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function getPendingDealIntent(): PendingDealIntent | null {
  try {
    const raw = localStorage.getItem(PENDING_DEAL_INTENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.type === 'string' && typeof parsed.label === 'string') {
      return parsed as PendingDealIntent;
    }
  } catch {
    // ignore
  }
  return null;
}

export function savePendingDealIntent(intent: PendingDealIntent) {
  try {
    localStorage.setItem(PENDING_DEAL_INTENT_KEY, JSON.stringify(intent));
  } catch {
    // ignore
  }
}

export function clearPendingDealIntent() {
  try {
    localStorage.removeItem(PENDING_DEAL_INTENT_KEY);
  } catch {
    // ignore
  }
}

function getAuthHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getMemberSessionToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function getLocalState(): {
  stats: ClubStats;
  members: string[];
  optins: string[];
} {
  try {
    const rawStats = localStorage.getItem(LOCAL_STATS_KEY);
    const rawMembers = localStorage.getItem(LOCAL_MEMBERS_KEY);
    const rawOptins = localStorage.getItem(LOCAL_OPTINS_KEY);
    const members: string[] = rawMembers ? JSON.parse(rawMembers) : ['9823000001'];
    const optins: string[] = rawOptins ? JSON.parse(rawOptins) : ['9823000001'];
    const stats: ClubStats = rawStats
      ? JSON.parse(rawStats)
      : { members: Math.max(1, members.length), optins: Math.max(1, optins.length) };
    return { stats, members, optins };
  } catch {
    return { stats: { members: 1, optins: 1 }, members: ['9823000001'], optins: ['9823000001'] };
  }
}

function saveLocalState(state: { stats: ClubStats; members: string[]; optins: string[] }) {
  try {
    localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(state.stats));
    localStorage.setItem(LOCAL_MEMBERS_KEY, JSON.stringify(state.members));
    localStorage.setItem(LOCAL_OPTINS_KEY, JSON.stringify(state.optins));
  } catch {
    // ignore storage errors
  }
}

export async function fetchClubStats(): Promise<ClubStats> {
  try {
    const res = await fetch('/api/stats');
    if (res.ok) {
      const data = await res.json();
      if (typeof data?.members === 'number' && typeof data?.optins === 'number') {
        const local = getLocalState();
        const merged = {
          members: Math.max(data.members, local.stats.members),
          optins: Math.max(data.optins, local.stats.optins),
        };
        return merged;
      }
    }
  } catch {
    // fallback to local
  }
  return getLocalState().stats;
}

export async function fetchCurrentMember(): Promise<{
  authenticated: boolean;
  member: MemberProfile | null;
  pendingOrder: PaymentOrderInfo | null;
}> {
  const token = getMemberSessionToken();
  if (!token) {
    return { authenticated: false, member: null, pendingOrder: null };
  }

  try {
    const res = await fetch('/api/membership/me', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        authenticated: Boolean(data.authenticated),
        member: data.member || null,
        pendingOrder: data.pendingOrder || null,
      };
    }
  } catch {
    // ignore network errors
  }
  return { authenticated: false, member: null, pendingOrder: null };
}

export async function registerMembershipAccount(
  input: MembershipRegistrationInput
): Promise<{
  sessionToken: string;
  member: MemberProfile;
  paymentOrder: PaymentOrderInfo;
}> {
  const payload = normalizeRegistrationPayload(input);
  const res = await fetch('/api/membership/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok || !data?.sessionToken) {
    throw new Error(
      data?.error || 'Could not create your membership account. Please verify your details.'
    );
  }

  saveMemberSessionToken(data.sessionToken);
  try {
    localStorage.setItem('gm_phone', payload.mobileNumber);
    localStorage.setItem('gm_name', payload.name);
    if (payload.city) {
      localStorage.setItem('gm_city', payload.city);
      if (isSupportedCity(payload.city)) {
        saveSelectedCity(payload.city);
      }
    }
  } catch {
    // ignore
  }

  return {
    sessionToken: data.sessionToken,
    member: data.member,
    paymentOrder: data.paymentOrder,
  };
}

export async function loginMembershipAccount(
  input: MembershipLoginInput
): Promise<{
  sessionToken: string;
  member: MemberProfile;
  paymentOrder: PaymentOrderInfo | null;
}> {
  const res = await fetch('/api/membership/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok || !data?.sessionToken) {
    throw new Error(
      data?.error || 'Invalid mobile number/email or password. Please try again.'
    );
  }

  saveMemberSessionToken(data.sessionToken);
  try {
    if (data.member?.mobileNumber) {
      localStorage.setItem('gm_phone', data.member.mobileNumber);
    }
    if (data.member?.name) {
      localStorage.setItem('gm_name', data.member.name);
    }
    if (data.member?.city) {
      localStorage.setItem('gm_city', data.member.city);
      if (isSupportedCity(data.member.city)) {
        saveSelectedCity(data.member.city);
      }
    }
  } catch {
    // ignore
  }

  return {
    sessionToken: data.sessionToken,
    member: data.member,
    paymentOrder: data.paymentOrder || null,
  };
}

export async function createRenewalOrder(): Promise<{
  paymentOrder: PaymentOrderInfo;
  member: MemberProfile;
}> {
  const res = await fetch('/api/membership/renew-order', {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok || !data?.paymentOrder) {
    throw new Error(data?.error || 'Could not start membership renewal.');
  }
  return {
    paymentOrder: data.paymentOrder,
    member: data.member,
  };
}

export async function processMembershipPayment(payload: {
  orderId: string;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking';
  outcome: 'success' | 'failed' | 'pending' | 'cancelled';
}): Promise<{
  ok: boolean;
  activated: boolean;
  member: MemberProfile;
  paymentOrder: PaymentOrderInfo;
  error?: string;
}> {
  const res = await fetch('/api/membership/payment/process', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  if (!data || !data.member) {
    throw new Error('Could not verify payment status with server. Please try again.');
  }

  if (data.activated && data.member.mobileNumber) {
    const local = getLocalState();
    if (!local.members.includes(data.member.mobileNumber)) {
      local.members.push(data.member.mobileNumber);
      local.stats.members = Math.max(local.stats.members + 1, local.members.length);
      saveLocalState(local);
    }
  }

  return {
    ok: Boolean(data.ok),
    activated: Boolean(data.activated),
    member: data.member,
    paymentOrder: data.paymentOrder,
    error: data.error,
  };
}

export async function unlockMemberDeal(dealId: string): Promise<{
  ok: boolean;
  dealId: string;
  alreadyUnlocked: boolean;
  member: MemberProfile;
}> {
  const res = await fetch('/api/membership/unlock-deal', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ dealId }),
  });
  const data = await res.json().catch(() => null);
  if (res.status === 401 || res.status === 403 || data?.code === 'MEMBERSHIP_REQUIRED') {
    throw new MembershipRequiredError(
      data?.error || 'Active Gharmalak Club membership is required to unlock deals.',
      data?.membershipStatus || 'Not Registered'
    );
  }
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || 'Could not unlock deal right now.');
  }
  return {
    ok: true,
    dealId: data.dealId,
    alreadyUnlocked: Boolean(data.alreadyUnlocked),
    member: data.member,
  };
}

export async function submitMemberRegistration(
  form: JoinFormInput & { lang: string; source: string }
): Promise<{ status: 'pending' | 'paid'; memberNumber: string }> {
  const cleanPhone = normalizeIndianPhone(form.phone);
  const local = getLocalState();

  try {
    localStorage.setItem('gm_phone', cleanPhone);
    localStorage.setItem('gm_name', form.name.trim());
  } catch {
    // ignore
  }

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...form, phone: cleanPhone }),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        status: data.status === 'paid' ? 'paid' : 'pending',
        memberNumber: data.memberNumber || `GM · ${String(local.stats.members).padStart(4, '0')} · NGP`,
      };
    }
  } catch {
    // fallback
  }

  return {
    status: 'pending',
    memberNumber: `GM · ${String(local.stats.members).padStart(4, '0')} · NGP`,
  };
}

export async function submitRoundOptIn(
  phone: string,
  roundNumber: number = 1
): Promise<{
  status: 'done' | 'already' | 'notmember' | 'error';
  created?: boolean;
  membershipStatus?: MembershipStatus;
}> {
  const cleanPhone = normalizeIndianPhone(phone);
  try {
    const res = await fetch('/api/optin', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ phone: cleanPhone, roundNumber }),
    });
    const data = await res.json().catch(() => null);
    if (
      res.status === 401 ||
      res.status === 403 ||
      res.status === 404 ||
      data?.code === 'MEMBERSHIP_REQUIRED'
    ) {
      return {
        status: 'notmember',
        membershipStatus: data?.membershipStatus || 'Not Registered',
      };
    }
    if (res.ok && data) {
      const local = getLocalState();
      if (!local.optins.includes(cleanPhone)) {
        local.optins.push(cleanPhone);
        local.stats.optins += 1;
        saveLocalState(local);
      }
      return {
        status: data.created ? 'done' : 'already',
        created: !!data.created,
      };
    }
  } catch {
    // network error
  }

  return { status: 'notmember', membershipStatus: 'Not Registered' };
}

export async function submitDealsInterest(payload: {
  deals: string[];
  name: string;
  phone: string;
  city: string;
  consent: boolean;
  source: string;
}): Promise<{ count: number; member: boolean }> {
  const cleanPhone = normalizeIndianPhone(payload.phone);
  try {
    localStorage.setItem('gm_phone', cleanPhone);
  } catch {
    // ignore
  }

  const res = await fetch('/api/deals/interest', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ ...payload, phone: cleanPhone }),
  });

  const data = await res.json().catch(() => null);
  if (res.status === 401 || res.status === 403 || data?.code === 'MEMBERSHIP_REQUIRED') {
    throw new MembershipRequiredError(
      data?.error || 'Active Gharmalak Club membership is required to unlock deals.',
      data?.membershipStatus || 'Not Registered'
    );
  }

  if (!res.ok) {
    throw new Error(data?.error || 'Could not register deal interest.');
  }

  return { count: payload.deals.length, member: !!data?.member };
}

const LOCAL_SOLAR_INTERESTS_KEY = 'gm_solar_round_interests_v1';

export function resolveInitialSolarInterestCity(): string {
  try {
    const savedLocationPopupCity = localStorage.getItem('gharmalak_selected_city');
    if (savedLocationPopupCity && savedLocationPopupCity.trim()) {
      return savedLocationPopupCity.trim();
    }
    const savedDealsCity = localStorage.getItem('gm_city');
    if (savedDealsCity && savedDealsCity.trim()) {
      return savedDealsCity.trim();
    }
  } catch {
    // ignore storage errors
  }
  return 'Nagpur';
}

export async function submitSolarRoundInterest(
  payload: SolarRoundInterestSubmissionPayload
): Promise<{
  ok: boolean;
  member: boolean;
  roundNumber: 1 | 2 | 3 | 4 | 5;
  interestLabel: string;
}> {
  const cleanPhone = normalizeIndianPhone(payload.phone);

  const res = await fetch('/api/solar-interest', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ ...payload, phone: cleanPhone }),
  });

  const data = await res.json().catch(() => null);
  if (res.status === 401 || res.status === 403 || data?.code === 'MEMBERSHIP_REQUIRED') {
    throw new MembershipRequiredError(
      data?.error || 'Active Gharmalak Club membership is required to register interest in a Solar Round.',
      data?.membershipStatus || 'Not Registered'
    );
  }

  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || 'Could not submit solar round interest.');
  }

  try {
    localStorage.setItem('gm_phone', cleanPhone);
    localStorage.setItem('gm_name', payload.name.trim());
    localStorage.setItem('gm_city', payload.city.trim());
    if (isSupportedCity(payload.city.trim())) {
      saveSelectedCity(payload.city.trim() as Parameters<typeof saveSelectedCity>[0]);
    }
    const existingRaw = localStorage.getItem(LOCAL_SOLAR_INTERESTS_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    const nextList = Array.isArray(existing) ? existing : [];
    nextList.push({
      ...payload,
      phone: cleanPhone,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(LOCAL_SOLAR_INTERESTS_KEY, JSON.stringify(nextList));
  } catch {
    // ignore storage errors
  }

  return {
    ok: true,
    member: Boolean(data.member),
    roundNumber: payload.roundNumber,
    interestLabel: payload.interestLabel,
  };
}

export interface VendorApplicationSubmissionResponse {
  ok: boolean;
  duplicate: boolean;
  applicationId: string;
  submissionDate: string;
  applicationStatus: string;
  city: string;
  businessName: string;
}

export async function submitVendorApplication(
  payload: unknown
): Promise<VendorApplicationSubmissionResponse> {
  const res = await fetch('/api/vendor-applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.ok || !data?.applicationId) {
    throw new Error(
      data?.error ||
        'We could not save your vendor application right now. Please verify your details and try again.'
    );
  }

  return {
    ok: true,
    duplicate: Boolean(data.duplicate),
    applicationId: String(data.applicationId),
    submissionDate: String(data.submissionDate || new Date().toISOString()),
    applicationStatus: String(data.applicationStatus || 'New Application'),
    city: String(data.city || ''),
    businessName: String(data.businessName || ''),
  };
}

export interface PropertyEnquiryPayload {
  projectName?: string;
  developerName?: string;
  fullName: string;
  mobileNumber: string;
  whatsappNumber?: string;
  email?: string;
  preferredApartment: '2 BHK' | '3 BHK' | 'Either';
  budget?: string;
  additionalRequirements?: string;
  city?: string;
}

export interface PropertyEnquiryResponse {
  ok: boolean;
  enquiryId: string;
  projectName: string;
  developerName: string;
  fullName: string;
  preferredApartment: string;
  message: string;
}

export async function submitPropertyEnquiry(
  payload: PropertyEnquiryPayload
): Promise<PropertyEnquiryResponse> {
  const res = await fetch('/api/property-enquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok || !data?.enquiryId) {
    throw new Error(data?.error || 'Could not submit property enquiry. Please try again.');
  }

  return data as PropertyEnquiryResponse;
}
