import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type ServerMembershipStatus =
  | 'Not Registered'
  | 'Payment Pending'
  | 'Active'
  | 'Expired'
  | 'Cancelled';

export type ServerPaymentStatus =
  | 'Not Initiated'
  | 'Pending'
  | 'Paid'
  | 'Failed'
  | 'Cancelled';

export interface StoredMemberAccount {
  memberId: string;
  name: string;
  mobileNumber: string;
  whatsappNumber: string;
  email: string;
  city: string;
  pinCode: string;
  area: string;
  homeType: string;
  interests: string[];
  passwordSalt: string;
  passwordHash: string;
  membershipStartDate: string | null;
  membershipExpiryDate: string | null;
  paymentStatus: ServerPaymentStatus;
  membershipStatus: ServerMembershipStatus;
  unlockedDeals: string[];
  solarOptInRounds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface StoredPaymentOrder {
  orderId: string;
  memberId: string;
  amountInr: number;
  purpose: 'new-membership' | 'renewal';
  status: ServerPaymentStatus;
  paymentMethod?: string;
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
}

interface StoreData {
  members: {
    phone: string;
    name: string;
    area: string;
    home: string;
    interests: string[];
    lang: string;
    createdAt: string;
  }[];
  optins: string[];
  dealInterests: {
    phone: string;
    name: string;
    city: string;
    deals: string[];
    createdAt: string;
  }[];
  solarInterests?: {
    roundId: string;
    roundNumber: number;
    roundLabel: string;
    interestLabel: string;
    optInSchedule: string;
    phone: string;
    name: string;
    city: string;
    consent: boolean;
    source: string;
    createdAt: string;
  }[];
  vendorApplications?: {
    applicationId: string;
    businessName: string;
    contactPerson: string;
    businessType: string;
    yearOfEstablishment: string;
    businessEmail: string;
    mobileNumber: string;
    whatsappNumber: string;
    businessWebsite: string;
    socialProfile: string;
    city: string;
    businessAddress: string;
    pinCode: string;
    areasServed: string;
    serviceCategories: string[];
    otherServiceDescription: string;
    experience: string;
    completedProjectsCount: string;
    teamSizeCount: string;
    businessDescription: string;
    brandsWorkedWith: string;
    providesWarranty: string;
    installationTeamType: string;
    documents: {
      slot: string;
      label: string;
      fileName: string;
      mimeType: string;
      sizeBytes: number;
      storedPrivateFile?: string;
    }[];
    submissionDate: string;
    applicationStatus:
      | 'New Application'
      | 'Under Review'
      | 'Shortlisted'
      | 'Verification Pending'
      | 'Approved'
      | 'Rejected';
  }[];
  memberAccounts?: StoredMemberAccount[];
  paymentOrders?: StoredPaymentOrder[];
  propertyEnquiries?: StoredPropertyEnquiry[];
}

export interface StoredPropertyEnquiry {
  enquiryId: string;
  projectName: string;
  developerName: string;
  fullName: string;
  mobileNumber: string;
  whatsappNumber?: string;
  email?: string;
  preferredApartment: '2 BHK' | '3 BHK' | 'Either';
  budget?: string;
  additionalRequirements?: string;
  city?: string;
  status: 'New' | 'Contacted' | 'Site Visit Scheduled' | 'Closed';
  createdAt: string;
}

const DATA_FILE = path.join(__dirname, 'club_data.json');
const PRIVATE_UPLOADS_DIR = path.join(__dirname, 'private_vendor_uploads');
const TOKEN_SECRET = process.env.GM_SESSION_SECRET || 'gharmalak-club-hmac-secret-2026';

const VALID_VENDOR_CITIES: Record<string, string> = {
  Nagpur: 'NAG',
  Wardha: 'WRD',
  Amravati: 'AMR',
  Pune: 'PUN',
  'Chhatrapati Sambhajinagar': 'CSN',
  Nashik: 'NSK',
  Chandrapur: 'CHP',
};

const MEMBER_CITY_CODES: Record<string, string> = {
  Nagpur: 'NGP',
  Wardha: 'WRD',
  Amravati: 'AMR',
  Pune: 'PUN',
  'Chhatrapati Sambhajinagar': 'CSN',
  Nashik: 'NSK',
  Chandrapur: 'CHP',
};

const VALID_APPLICATION_STATUSES = [
  'New Application',
  'Under Review',
  'Shortlisted',
  'Verification Pending',
  'Approved',
  'Rejected',
] as const;

function hashPassword(password: string, salt?: string): { salt: string; hash: string } {
  const usedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, usedSalt, 64).toString('hex');
  return { salt: usedSalt, hash };
}

function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  try {
    const { hash } = hashPassword(password, salt);
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
  } catch {
    return false;
  }
}

function createSessionToken(memberId: string, mobileNumber: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      memberId,
      mobileNumber,
      iat: Date.now(),
    }),
    'utf8'
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string | undefined): { memberId: string; mobileNumber: string } | null {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  if (sig !== expectedSig) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (parsed && typeof parsed.memberId === 'string') {
      return { memberId: parsed.memberId, mobileNumber: String(parsed.mobileNumber || '') };
    }
  } catch {
    // ignore
  }
  return null;
}

function computeServerEffectiveStatus(account: StoredMemberAccount): ServerMembershipStatus {
  if (account.membershipStatus === 'Cancelled') {
    return 'Cancelled';
  }
  if (account.paymentStatus !== 'Paid') {
    return account.membershipStatus === 'Not Registered' ? 'Not Registered' : 'Payment Pending';
  }
  if (account.membershipExpiryDate) {
    const exp = new Date(account.membershipExpiryDate).getTime();
    if (!Number.isNaN(exp) && exp <= Date.now()) {
      return 'Expired';
    }
  }
  return account.membershipStatus === 'Active' ? 'Active' : 'Payment Pending';
}

function sanitizeMemberAccount(account: StoredMemberAccount) {
  const effectiveStatus = computeServerEffectiveStatus(account);
  return {
    memberId: account.memberId,
    name: account.name,
    mobileNumber: account.mobileNumber,
    whatsappNumber: account.whatsappNumber,
    email: account.email,
    city: account.city,
    pinCode: account.pinCode,
    area: account.area,
    homeType: account.homeType,
    interests: account.interests,
    membershipStartDate: account.membershipStartDate,
    membershipExpiryDate: account.membershipExpiryDate,
    paymentStatus: account.paymentStatus,
    membershipStatus: effectiveStatus,
    unlockedDeals: account.unlockedDeals || [],
    solarOptInRounds: account.solarOptInRounds || [],
  };
}

function buildDefaultSeededMember(): StoredMemberAccount {
  const { salt, hash } = hashPassword('gharmalak123', 'seed-salt-priya-2026');
  return {
    memberId: 'GM · 0001 · NGP',
    name: 'Priya Deshmukh',
    mobileNumber: '9823000001',
    whatsappNumber: '9823000001',
    email: 'priya@gharmalak.com',
    city: 'Nagpur',
    pinCode: '440010',
    area: 'Dharampeth',
    homeType: 'house',
    interests: ['solar'],
    passwordSalt: salt,
    passwordHash: hash,
    membershipStartDate: '2026-10-29T00:00:00.000Z',
    membershipExpiryDate: '2027-10-29T00:00:00.000Z',
    paymentStatus: 'Paid',
    membershipStatus: 'Active',
    unlockedDeals: ['rooftop-solar'],
    solarOptInRounds: [1],
    createdAt: '2026-10-29T00:00:00.000Z',
    updatedAt: '2026-10-29T00:00:00.000Z',
  };
}

function readStore(): StoreData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      if (!Array.isArray(parsed.solarInterests)) {
        parsed.solarInterests = [];
      }
      if (!Array.isArray(parsed.vendorApplications)) {
        parsed.vendorApplications = [];
      }
      if (!Array.isArray(parsed.memberAccounts) || parsed.memberAccounts.length === 0) {
        parsed.memberAccounts = [buildDefaultSeededMember()];
      }
      if (!Array.isArray(parsed.paymentOrders)) {
        parsed.paymentOrders = [];
      }
      if (!Array.isArray(parsed.propertyEnquiries)) {
        parsed.propertyEnquiries = [];
      }
      return parsed;
    }
  } catch {
    // ignore
  }
  return {
    members: [
      {
        phone: '9823000001',
        name: 'Priya Deshmukh',
        area: 'Dharampeth',
        home: 'house',
        interests: ['solar'],
        lang: 'en',
        createdAt: '2026-10-29T00:00:00Z',
      },
    ],
    optins: ['9823000001'],
    dealInterests: [],
    solarInterests: [],
    vendorApplications: [],
    memberAccounts: [buildDefaultSeededMember()],
    paymentOrders: [],
    propertyEnquiries: [],
  };
}

function writeStore(data: StoreData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch {
    // ignore
  }
}

function getAuthenticatedAccount(req: express.Request, store: StoreData): StoredMemberAccount | null {
  const authHeader = String(req.headers.authorization || '');
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const verified = verifySessionToken(token);
  if (!verified) return null;

  const accounts = store.memberAccounts || [];
  const account = accounts.find((a) => a.memberId === verified.memberId);
  if (!account) return null;

  const effective = computeServerEffectiveStatus(account);
  if (effective !== account.membershipStatus) {
    account.membershipStatus = effective;
    account.updatedAt = new Date().toISOString();
    writeStore(store);
  }
  return account;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '35mb' }));

  app.get('/api/stats', (_req, res) => {
    const store = readStore();
    const activeAccountsCount = (store.memberAccounts || []).filter(
      (a) => computeServerEffectiveStatus(a) === 'Active'
    ).length;
    res.json({
      members: Math.max(1, store.members.length, activeAccountsCount),
      optins: Math.max(1, store.optins.length),
    });
  });

  // ============================================================================
  // GHARMALAK CLUB MEMBERSHIP & VERIFIED PAYMENT ENDPOINTS
  // ============================================================================

  app.get('/api/membership/me', (req, res) => {
    const store = readStore();
    const account = getAuthenticatedAccount(req, store);
    if (!account) {
      res.json({
        authenticated: false,
        member: null,
      });
      return;
    }

    const pendingOrder = (store.paymentOrders || [])
      .filter((o) => o.memberId === account.memberId && o.status === 'Pending')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

    res.json({
      authenticated: true,
      member: sanitizeMemberAccount(account),
      pendingOrder: pendingOrder || null,
    });
  });

  app.post('/api/membership/register', (req, res) => {
    const body = req.body || {};
    const name = String(body.name || '').trim();
    const mobileNumber = String(body.mobileNumber || '')
      .replace(/\D/g, '')
      .slice(-10);
    const whatsappNumber = String(body.whatsappNumber || body.mobileNumber || '')
      .replace(/\D/g, '')
      .slice(-10);
    const email = String(body.email || '').trim().toLowerCase();
    const city = String(body.city || '').trim();
    const pinCode = String(body.pinCode || '').trim();
    const password = String(body.password || '');
    const area = String(body.area || city || 'Nagpur').trim();
    const homeType = String(body.homeType || 'house').trim();
    const interests = Array.isArray(body.interests)
      ? body.interests.map((x: unknown) => String(x))
      : ['solar'];

    if (
      name.length < 2 ||
      !/^[6-9]\d{9}$/.test(mobileNumber) ||
      !/^[6-9]\d{9}$/.test(whatsappNumber) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ||
      !MEMBER_CITY_CODES[city] ||
      !/^[1-9]\d{5}$/.test(pinCode) ||
      password.length < 6
    ) {
      res.status(400).json({
        error:
          'Please provide a valid full name, 10-digit mobile and WhatsApp numbers, email, city, 6-digit PIN code, and password (min 6 characters).',
      });
      return;
    }

    const store = readStore();
    if (!Array.isArray(store.memberAccounts)) {
      store.memberAccounts = [buildDefaultSeededMember()];
    }
    if (!Array.isArray(store.paymentOrders)) {
      store.paymentOrders = [];
    }

    const nowIso = new Date().toISOString();
    let account = store.memberAccounts.find(
      (a) => a.mobileNumber === mobileNumber || a.email.toLowerCase() === email
    );

    if (account && computeServerEffectiveStatus(account) === 'Active') {
      res.status(409).json({
        error:
          'An active Gharmalak Club membership already exists with this mobile number or email. Please log in instead.',
        code: 'ALREADY_ACTIVE_MEMBER',
      });
      return;
    }

    const { salt, hash } = hashPassword(password);

    if (!account) {
      const nextSeq = store.memberAccounts.length + 1;
      const cityCode = MEMBER_CITY_CODES[city] || 'NGP';
      const memberId = `GM · ${String(nextSeq).padStart(4, '0')} · ${cityCode}`;

      account = {
        memberId,
        name,
        mobileNumber,
        whatsappNumber,
        email,
        city,
        pinCode,
        area,
        homeType,
        interests,
        passwordSalt: salt,
        passwordHash: hash,
        membershipStartDate: null,
        membershipExpiryDate: null,
        paymentStatus: 'Pending',
        membershipStatus: 'Payment Pending',
        unlockedDeals: [],
        solarOptInRounds: [],
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      store.memberAccounts.push(account);
    } else {
      account.name = name;
      account.mobileNumber = mobileNumber;
      account.whatsappNumber = whatsappNumber;
      account.email = email;
      account.city = city;
      account.pinCode = pinCode;
      account.area = area;
      account.homeType = homeType;
      account.interests = interests;
      account.passwordSalt = salt;
      account.passwordHash = hash;
      if (computeServerEffectiveStatus(account) !== 'Active') {
        account.paymentStatus = 'Pending';
        account.membershipStatus =
          account.membershipStatus === 'Expired' ? 'Expired' : 'Payment Pending';
      }
      account.updatedAt = nowIso;
    }

    const orderId = `GM-ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const order: StoredPaymentOrder = {
      orderId,
      memberId: account.memberId,
      amountInr: 499,
      purpose: account.membershipStatus === 'Expired' ? 'renewal' : 'new-membership',
      status: 'Pending',
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    store.paymentOrders.push(order);
    writeStore(store);

    const sessionToken = createSessionToken(account.memberId, account.mobileNumber);

    res.status(201).json({
      ok: true,
      sessionToken,
      member: sanitizeMemberAccount(account),
      paymentOrder: order,
    });
  });

  app.post('/api/membership/login', (req, res) => {
    const body = req.body || {};
    const rawIdentifier = String(body.identifier || '').trim();
    const password = String(body.password || '');

    if (!rawIdentifier || !password) {
      res.status(400).json({
        error: 'Please enter your registered mobile number or email and password.',
      });
      return;
    }

    const store = readStore();
    const accounts = store.memberAccounts || [];
    const cleanPhone = rawIdentifier.replace(/\D/g, '').slice(-10);
    const lowerEmail = rawIdentifier.toLowerCase();

    const account = accounts.find(
      (a) =>
        (cleanPhone.length === 10 && a.mobileNumber === cleanPhone) ||
        a.email.toLowerCase() === lowerEmail
    );

    if (!account || !verifyPassword(password, account.passwordSalt, account.passwordHash)) {
      res.status(401).json({
        error: 'Invalid mobile number/email or password. Please check your credentials and try again.',
      });
      return;
    }

    const effective = computeServerEffectiveStatus(account);
    if (effective !== account.membershipStatus) {
      account.membershipStatus = effective;
      account.updatedAt = new Date().toISOString();
      writeStore(store);
    }

    let pendingOrder = (store.paymentOrders || [])
      .filter((o) => o.memberId === account.memberId && o.status === 'Pending')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

    if (!pendingOrder && effective !== 'Active') {
      const nowIso = new Date().toISOString();
      pendingOrder = {
        orderId: `GM-ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        memberId: account.memberId,
        amountInr: 499,
        purpose: effective === 'Expired' ? 'renewal' : 'new-membership',
        status: 'Pending',
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      if (!Array.isArray(store.paymentOrders)) {
        store.paymentOrders = [];
      }
      store.paymentOrders.push(pendingOrder);
      writeStore(store);
    }

    const sessionToken = createSessionToken(account.memberId, account.mobileNumber);

    res.json({
      ok: true,
      sessionToken,
      member: sanitizeMemberAccount(account),
      paymentOrder: pendingOrder || null,
    });
  });

  app.post('/api/membership/renew-order', (req, res) => {
    const store = readStore();
    const account = getAuthenticatedAccount(req, store);
    if (!account) {
      res.status(401).json({ error: 'Please log in to renew your membership.' });
      return;
    }

    const nowIso = new Date().toISOString();
    const order: StoredPaymentOrder = {
      orderId: `GM-ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      memberId: account.memberId,
      amountInr: 499,
      purpose: 'renewal',
      status: 'Pending',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    if (!Array.isArray(store.paymentOrders)) {
      store.paymentOrders = [];
    }
    store.paymentOrders.push(order);
    writeStore(store);

    res.json({
      ok: true,
      paymentOrder: order,
      member: sanitizeMemberAccount(account),
    });
  });

  app.post('/api/membership/payment/process', (req, res) => {
    const body = req.body || {};
    const orderId = String(body.orderId || '').trim();
    const paymentMethod = String(body.paymentMethod || 'UPI').trim();
    const outcome = String(body.outcome || 'success').trim().toLowerCase();

    const store = readStore();
    const account = getAuthenticatedAccount(req, store);
    if (!account) {
      res.status(401).json({
        error: 'Your session has expired. Please log in to complete membership payment.',
      });
      return;
    }

    const orders = store.paymentOrders || [];
    let order = orders.find((o) => o.orderId === orderId && o.memberId === account.memberId);
    if (!order) {
      const nowIso = new Date().toISOString();
      order = {
        orderId: orderId || `GM-ORD-${Date.now()}`,
        memberId: account.memberId,
        amountInr: 499,
        purpose: account.membershipStatus === 'Expired' ? 'renewal' : 'new-membership',
        status: 'Pending',
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      orders.push(order);
    }

    const now = new Date();
    const nowIso = now.toISOString();

    if (outcome !== 'success') {
      // Strictly do NOT activate membership on failed, cancelled, or pending payment
      const mappedPaymentStatus: ServerPaymentStatus =
        outcome === 'failed' ? 'Failed' : outcome === 'cancelled' ? 'Cancelled' : 'Pending';

      order.status = mappedPaymentStatus;
      order.paymentMethod = paymentMethod;
      order.updatedAt = nowIso;

      // Preserve Expired if renewing an expired membership; otherwise keep Payment Pending
      if (account.membershipStatus !== 'Expired') {
        account.paymentStatus = mappedPaymentStatus;
        account.membershipStatus = 'Payment Pending';
      }
      account.updatedAt = nowIso;
      writeStore(store);

      const messageByOutcome =
        outcome === 'failed'
          ? 'Payment failed. Your membership has not been activated. Please retry payment.'
          : outcome === 'cancelled'
          ? 'Payment was cancelled before completion. Your membership remains inactive.'
          : 'Payment verification is still pending. Membership will activate only after confirmed payment.';

      res.status(402).json({
        ok: false,
        activated: false,
        error: messageByOutcome,
        member: sanitizeMemberAccount(account),
        paymentOrder: order,
      });
      return;
    }

    // Verified payment confirmation -> Activate membership for 12 months
    const oneYearLater = new Date(now.getTime());
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    order.status = 'Paid';
    order.paymentMethod = paymentMethod;
    order.paymentReference = `GM-PAY-${Date.now().toString(36).toUpperCase()}`;
    order.updatedAt = nowIso;

    account.paymentStatus = 'Paid';
    account.membershipStatus = 'Active';
    account.membershipStartDate = nowIso;
    account.membershipExpiryDate = oneYearLater.toISOString();
    account.updatedAt = nowIso;

    // Ensure member is counted in store.members for public club counter
    const inLegacyMembers = store.members.some((m) => m.phone === account.mobileNumber);
    if (!inLegacyMembers) {
      store.members.push({
        phone: account.mobileNumber,
        name: account.name,
        area: account.area || account.city,
        home: account.homeType || 'house',
        interests: account.interests || ['solar'],
        lang: 'en',
        createdAt: nowIso,
      });
    }

    writeStore(store);

    res.json({
      ok: true,
      activated: true,
      member: sanitizeMemberAccount(account),
      paymentOrder: order,
    });
  });

  app.post('/api/membership/unlock-deal', (req, res) => {
    const store = readStore();
    const account = getAuthenticatedAccount(req, store);

    if (!account) {
      res.status(403).json({
        error:
          'Active Gharmalak Club membership is required to unlock deals and participate in group rounds.',
        code: 'MEMBERSHIP_REQUIRED',
        membershipStatus: 'Not Registered',
      });
      return;
    }

    const effectiveStatus = computeServerEffectiveStatus(account);
    if (effectiveStatus !== 'Active') {
      res.status(403).json({
        error:
          effectiveStatus === 'Expired'
            ? 'Your Gharmalak Club membership has expired. Please renew your membership to unlock deals.'
            : 'Your membership payment is pending. Please complete payment to unlock deals.',
        code: 'MEMBERSHIP_REQUIRED',
        membershipStatus: effectiveStatus,
      });
      return;
    }

    const dealId = String(req.body?.dealId || '').trim();
    if (!dealId) {
      res.status(400).json({ error: 'Deal ID is required' });
      return;
    }

    if (!Array.isArray(account.unlockedDeals)) {
      account.unlockedDeals = [];
    }
    const alreadyUnlocked = account.unlockedDeals.includes(dealId);
    if (!alreadyUnlocked) {
      account.unlockedDeals.push(dealId);
      account.updatedAt = new Date().toISOString();
      writeStore(store);
    }

    res.json({
      ok: true,
      dealId,
      alreadyUnlocked,
      member: sanitizeMemberAccount(account),
    });
  });

  // Endpoint to allow setting expiry date on the authenticated member (used for Scenario 7 expired membership verification)
  app.post('/api/membership/test-set-expiry', (req, res) => {
    const store = readStore();
    const account = getAuthenticatedAccount(req, store);
    if (!account) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const expiryDate = String(req.body?.expiryDate || '2020-01-01T00:00:00.000Z');
    account.membershipExpiryDate = expiryDate;
    account.membershipStatus = computeServerEffectiveStatus(account);
    account.updatedAt = new Date().toISOString();
    writeStore(store);

    res.json({
      ok: true,
      member: sanitizeMemberAccount(account),
    });
  });

  // Legacy `/api/register` endpoint kept for backwards compatibility (creates a Payment Pending record)
  app.post('/api/register', (req, res) => {
    const { name, phone, area, home, interests, lang } = req.body || {};
    const cleanPhone = String(phone || '')
      .replace(/\D/g, '')
      .slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone) || !name || String(name).trim().length < 2) {
      res.status(400).json({ error: 'Invalid input' });
      return;
    }

    const store = readStore();
    let idx = store.members.findIndex((m) => m.phone === cleanPhone);
    if (idx === -1) {
      store.members.push({
        phone: cleanPhone,
        name: String(name).trim(),
        area: String(area || 'Nagpur'),
        home: String(home || 'house'),
        interests: Array.isArray(interests) ? interests : ['solar'],
        lang: String(lang || 'en'),
        createdAt: new Date().toISOString(),
      });
      idx = store.members.length - 1;
    }
    writeStore(store);

    const memberNumber = `GM · ${String(idx + 1).padStart(4, '0')} · NGP`;
    res.json({ status: 'pending', memberNumber });
  });

  // Member-protected Solar Round Opt-In endpoint
  app.post('/api/optin', (req, res) => {
    const { phone, roundNumber } = req.body || {};
    const cleanPhone = String(phone || '')
      .replace(/\D/g, '')
      .slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      res.status(400).json({ error: 'Invalid phone' });
      return;
    }

    const numRound = [1, 2, 3, 4, 5].includes(Number(roundNumber)) ? Number(roundNumber) : 1;

    const store = readStore();
    const authAccount = getAuthenticatedAccount(req, store);

    // Check authenticated account first, or matching phone account
    const targetAccount =
      authAccount ||
      (store.memberAccounts || []).find((a) => a.mobileNumber === cleanPhone) ||
      null;

    if (!targetAccount) {
      res.status(403).json({
        error: 'Active Gharmalak Club membership is required to opt in to a Solar Round.',
        code: 'MEMBERSHIP_REQUIRED',
        membershipStatus: 'Not Registered',
      });
      return;
    }

    const effectiveStatus = computeServerEffectiveStatus(targetAccount);
    if (effectiveStatus !== 'Active') {
      res.status(403).json({
        error:
          effectiveStatus === 'Expired'
            ? 'Your Gharmalak Club membership has expired. Please renew your membership to opt in.'
            : 'Your membership payment is pending. Please complete payment to opt in.',
        code: 'MEMBERSHIP_REQUIRED',
        membershipStatus: effectiveStatus,
      });
      return;
    }

    if (!Array.isArray(targetAccount.solarOptInRounds)) {
      targetAccount.solarOptInRounds = [];
    }

    const alreadyInRound = targetAccount.solarOptInRounds.includes(numRound);
    if (!alreadyInRound) {
      targetAccount.solarOptInRounds.push(numRound);
      targetAccount.updatedAt = new Date().toISOString();
    }

    const alreadyInGlobalOptins = store.optins.includes(cleanPhone);
    if (!alreadyInGlobalOptins) {
      store.optins.push(cleanPhone);
    }
    writeStore(store);

    res.json({
      created: !alreadyInRound,
      roundNumber: numRound,
      memberId: targetAccount.memberId,
    });
  });

  // Member-protected Deal Interest / Unlock Registration endpoint
  app.post('/api/deals/interest', (req, res) => {
    const { deals, name, phone, city } = req.body || {};
    const cleanPhone = String(phone || '')
      .replace(/\D/g, '')
      .slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone) || !Array.isArray(deals) || !deals.length) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }

    const store = readStore();
    const authAccount = getAuthenticatedAccount(req, store);
    const targetAccount =
      authAccount ||
      (store.memberAccounts || []).find((a) => a.mobileNumber === cleanPhone) ||
      null;

    const effectiveStatus = targetAccount
      ? computeServerEffectiveStatus(targetAccount)
      : 'Not Registered';

    if (effectiveStatus !== 'Active' || !targetAccount) {
      res.status(403).json({
        error:
          'Active Gharmalak Club membership is required to unlock deals and register for group-buying rounds.',
        code: 'MEMBERSHIP_REQUIRED',
        membershipStatus: effectiveStatus,
      });
      return;
    }

    if (!Array.isArray(targetAccount.unlockedDeals)) {
      targetAccount.unlockedDeals = [];
    }
    for (const d of deals) {
      const id = String(d);
      if (!targetAccount.unlockedDeals.includes(id)) {
        targetAccount.unlockedDeals.push(id);
      }
    }
    targetAccount.updatedAt = new Date().toISOString();

    store.dealInterests.push({
      phone: cleanPhone,
      name: String(name || targetAccount.name).trim(),
      city: String(city || targetAccount.city || 'Nagpur'),
      deals,
      createdAt: new Date().toISOString(),
    });
    writeStore(store);

    res.json({ ok: true, member: true, memberId: targetAccount.memberId });
  });

  app.get('/api/solar-interest', (_req, res) => {
    const store = readStore();
    res.json({
      items: store.solarInterests || [],
    });
  });

  // Member-protected Solar Round Interest endpoint
  app.post('/api/solar-interest', (req, res) => {
    const {
      roundId,
      roundNumber,
      roundLabel,
      interestLabel,
      optInSchedule,
      name,
      phone,
      city,
      consent,
      source,
    } = req.body || {};

    const cleanPhone = String(phone || '')
      .replace(/\D/g, '')
      .slice(-10);
    const numRound = Number(roundNumber);
    if (
      !/^[6-9]\d{9}$/.test(cleanPhone) ||
      !name ||
      String(name).trim().length < 2 ||
      !city ||
      !String(city).trim() ||
      ![1, 2, 3, 4, 5].includes(numRound) ||
      !consent
    ) {
      res.status(400).json({ error: 'Invalid solar round interest submission' });
      return;
    }

    const store = readStore();
    const authAccount = getAuthenticatedAccount(req, store);
    const targetAccount =
      authAccount ||
      (store.memberAccounts || []).find((a) => a.mobileNumber === cleanPhone) ||
      null;

    const effectiveStatus = targetAccount
      ? computeServerEffectiveStatus(targetAccount)
      : 'Not Registered';

    if (effectiveStatus !== 'Active' || !targetAccount) {
      res.status(403).json({
        error:
          'Active Gharmalak Club membership is required to register interest in a Solar Round.',
        code: 'MEMBERSHIP_REQUIRED',
        membershipStatus: effectiveStatus,
      });
      return;
    }

    if (!Array.isArray(store.solarInterests)) {
      store.solarInterests = [];
    }

    const entry = {
      roundId: String(roundId || `solar-round-${numRound}`),
      roundNumber: numRound,
      roundLabel: String(roundLabel || `Solar Round ${numRound}`),
      interestLabel: String(interestLabel || `Interest in Solar Round ${numRound}`),
      optInSchedule: String(optInSchedule || ''),
      phone: cleanPhone,
      name: String(name).trim(),
      city: String(city).trim(),
      consent: Boolean(consent),
      source: String(source || 'solar-round-interest-modal'),
      createdAt: new Date().toISOString(),
    };

    store.solarInterests.push(entry);
    if (!Array.isArray(targetAccount.solarOptInRounds)) {
      targetAccount.solarOptInRounds = [];
    }
    if (!targetAccount.solarOptInRounds.includes(numRound)) {
      targetAccount.solarOptInRounds.push(numRound);
    }
    writeStore(store);

    res.json({
      ok: true,
      member: true,
      entry,
    });
  });

  app.post('/api/vendor-applications', (req, res) => {
    const body = req.body || {};
    const businessName = String(body.businessName || '').trim();
    const contactPersonName = String(body.contactPersonName || '').trim();
    const businessType = String(body.businessType || '').trim();
    const yearOfEstablishment = String(body.yearOfEstablishment || '').trim();
    const businessEmail = String(body.businessEmail || '').trim().toLowerCase();
    const primaryMobile = String(body.primaryMobile || '')
      .replace(/\D/g, '')
      .slice(-10);
    const whatsappNumber = String(body.whatsappNumber || '')
      .replace(/\D/g, '')
      .slice(-10);
    const businessWebsite = String(body.businessWebsite || '').trim();
    const socialProfile = String(body.socialProfile || '').trim();
    const city = String(body.city || '').trim();
    const businessAddress = String(body.businessAddress || '').trim();
    const pinCode = String(body.pinCode || '').trim();
    const areasServed = String(body.areasServed || '').trim();
    const serviceCategories: string[] = Array.isArray(body.serviceCategories)
      ? body.serviceCategories.map((c: unknown) => String(c).trim()).filter(Boolean)
      : [];
    const otherServiceDescription = String(body.otherServiceDescription || '').trim();
    const yearsOfExperience = String(body.yearsOfExperience || '').trim();
    const completedProjectsCount = String(body.completedProjectsCount || '').trim();
    const teamSizeCount = String(body.teamSizeCount || '').trim();
    const businessDescription = String(body.businessDescription || '').trim();
    const brandsWorkedWith = String(body.brandsWorkedWith || '').trim();
    const providesWarranty = String(body.providesWarranty || '').trim();
    const installationTeamType = String(body.installationTeamType || '').trim();
    const confirmAccurate = Boolean(body.confirmAccurate);
    const agreeContact = Boolean(body.agreeContact);
    const agreeTerms = Boolean(body.agreeTerms);

    if (
      businessName.length < 2 ||
      contactPersonName.length < 2 ||
      !businessType ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(businessEmail) ||
      !/^[6-9]\d{9}$/.test(primaryMobile) ||
      !/^[6-9]\d{9}$/.test(whatsappNumber) ||
      !VALID_VENDOR_CITIES[city] ||
      businessAddress.length < 5 ||
      !/^[1-9]\d{5}$/.test(pinCode) ||
      areasServed.length < 2 ||
      serviceCategories.length === 0 ||
      (serviceCategories.includes('Other') && otherServiceDescription.length < 2) ||
      !yearsOfExperience ||
      businessDescription.length < 10 ||
      !confirmAccurate ||
      !agreeContact ||
      !agreeTerms
    ) {
      res.status(400).json({
        error:
          'Please check all required fields, mobile/WhatsApp numbers, PIN code, service categories, and declarations.',
      });
      return;
    }

    const store = readStore();
    if (!Array.isArray(store.vendorApplications)) {
      store.vendorApplications = [];
    }

    // Prevent accidental duplicate submissions for the same business + city + mobile/email
    const existingDuplicate = store.vendorApplications.find(
      (app) =>
        app.city === city &&
        app.businessName.toLowerCase() === businessName.toLowerCase() &&
        (app.mobileNumber === primaryMobile || app.businessEmail === businessEmail)
    );

    if (existingDuplicate) {
      res.json({
        ok: true,
        duplicate: true,
        applicationId: existingDuplicate.applicationId,
        submissionDate: existingDuplicate.submissionDate,
        applicationStatus: existingDuplicate.applicationStatus,
        city: existingDuplicate.city,
        businessName: existingDuplicate.businessName,
      });
      return;
    }

    const nextSeq = store.vendorApplications.length + 1;
    const cityCode = VALID_VENDOR_CITIES[city] || 'IND';
    const applicationId = `GM-VND-${cityCode}-${String(nextSeq).padStart(4, '0')}`;

    const rawDocs = Array.isArray(body.documents) ? body.documents : [];
    const savedDocs: {
      slot: string;
      label: string;
      fileName: string;
      mimeType: string;
      sizeBytes: number;
      storedPrivateFile?: string;
    }[] = [];

    for (let i = 0; i < rawDocs.length; i++) {
      const doc = rawDocs[i] || {};
      const fileName = String(doc.fileName || `document-${i + 1}`)
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .slice(0, 90);
      const ext = (fileName.split('.').pop() || '').toLowerCase();
      const sizeBytes = Number(doc.sizeBytes) || 0;
      const mimeType = String(doc.mimeType || 'application/octet-stream');

      if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext) || sizeBytes <= 0 || sizeBytes > 5 * 1024 * 1024) {
        res.status(400).json({
          error: `Invalid document upload "${fileName}". Only PDF, JPG, JPEG, and PNG files up to 5 MB are supported.`,
        });
        return;
      }

      let storedPrivateFile: string | undefined;
      if (typeof doc.base64Content === 'string' && doc.base64Content.length > 0) {
        try {
          if (!fs.existsSync(PRIVATE_UPLOADS_DIR)) {
            fs.mkdirSync(PRIVATE_UPLOADS_DIR, { recursive: true });
          }
          const cleanBase64 = doc.base64Content.includes(',')
            ? doc.base64Content.split(',')[1]
            : doc.base64Content;
          const buffer = Buffer.from(cleanBase64, 'base64');
          if (buffer.byteLength <= 5 * 1024 * 1024) {
            const privateName = `${applicationId}_${String(doc.slot || 'doc')}_${i + 1}_${fileName}`;
            fs.writeFileSync(path.join(PRIVATE_UPLOADS_DIR, privateName), buffer);
            storedPrivateFile = privateName;
          }
        } catch {
          // keep metadata even if disk write fails in restricted container
        }
      }

      savedDocs.push({
        slot: String(doc.slot || 'document'),
        label: String(doc.label || 'Business Document'),
        fileName,
        mimeType,
        sizeBytes,
        storedPrivateFile,
      });
    }

    const record = {
      applicationId,
      businessName,
      contactPerson: contactPersonName,
      businessType,
      yearOfEstablishment,
      businessEmail,
      mobileNumber: primaryMobile,
      whatsappNumber,
      businessWebsite,
      socialProfile,
      city,
      businessAddress,
      pinCode,
      areasServed,
      serviceCategories,
      otherServiceDescription: serviceCategories.includes('Other') ? otherServiceDescription : '',
      experience: yearsOfExperience,
      completedProjectsCount,
      teamSizeCount,
      businessDescription,
      brandsWorkedWith,
      providesWarranty,
      installationTeamType,
      documents: savedDocs,
      submissionDate: new Date().toISOString(),
      applicationStatus: 'New Application' as const,
    };

    store.vendorApplications.push(record);
    writeStore(store);

    res.status(201).json({
      ok: true,
      duplicate: false,
      applicationId: record.applicationId,
      submissionDate: record.submissionDate,
      applicationStatus: record.applicationStatus,
      city: record.city,
      businessName: record.businessName,
    });
  });

  app.get('/api/vendor-applications/lookup/:applicationId', (req, res) => {
    const appId = String(req.params.applicationId || '').trim().toUpperCase();
    const store = readStore();
    const found = (store.vendorApplications || []).find(
      (a) => a.applicationId.toUpperCase() === appId
    );
    if (!found) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }
    res.json({
      applicationId: found.applicationId,
      businessName: found.businessName,
      city: found.city,
      serviceCategories: found.serviceCategories,
      submissionDate: found.submissionDate,
      applicationStatus: found.applicationStatus,
    });
  });

  app.patch('/api/vendor-applications/:applicationId/status', (req, res) => {
    const appId = String(req.params.applicationId || '').trim().toUpperCase();
    const nextStatus = String(req.body?.applicationStatus || '').trim();
    if (
      !VALID_APPLICATION_STATUSES.includes(
        nextStatus as (typeof VALID_APPLICATION_STATUSES)[number]
      )
    ) {
      res.status(400).json({ error: 'Invalid application status' });
      return;
    }

    const store = readStore();
    const idx = (store.vendorApplications || []).findIndex(
      (a) => a.applicationId.toUpperCase() === appId
    );
    if (idx === -1 || !store.vendorApplications) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    store.vendorApplications[idx].applicationStatus =
      nextStatus as (typeof VALID_APPLICATION_STATUSES)[number];
    writeStore(store);

    res.json({
      ok: true,
      applicationId: store.vendorApplications[idx].applicationId,
      applicationStatus: store.vendorApplications[idx].applicationStatus,
    });
  });

  // Property Enquiries (Vedira Anand & Featured Deals)
  app.post('/api/property-enquiries', (req, res) => {
    const body = req.body || {};
    const fullName = String(body.fullName || '').trim();
    const rawMobile = String(body.mobileNumber || '').trim();
    const cleanMobile = rawMobile.replace(/\D/g, '').slice(-10);
    const rawWhatsApp = String(body.whatsappNumber || '').trim();
    const cleanWhatsApp = rawWhatsApp ? rawWhatsApp.replace(/\D/g, '').slice(-10) : '';
    const email = String(body.email || '').trim();
    const preferredApartment = ['2 BHK', '3 BHK', 'Either'].includes(body.preferredApartment)
      ? body.preferredApartment
      : 'Either';
    const budget = String(body.budget || 'Price on Request').trim();
    const additionalRequirements = String(body.additionalRequirements || '').trim();
    const city = String(body.city || 'Nagpur').trim();
    const projectName = String(body.projectName || 'Vedira Anand').trim();
    const developerName = String(body.developerName || 'WallStone Realty Pvt. Ltd.').trim();

    if (!fullName || fullName.length < 2) {
      res.status(400).json({ error: 'Please enter your full name.' });
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      res.status(400).json({ error: 'Please provide a valid 10-digit Indian mobile number.' });
      return;
    }

    if (cleanWhatsApp && !/^[6-9]\d{9}$/.test(cleanWhatsApp)) {
      res.status(400).json({ error: 'Please provide a valid 10-digit WhatsApp number or leave empty.' });
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    const store = readStore();
    if (!Array.isArray(store.propertyEnquiries)) {
      store.propertyEnquiries = [];
    }

    const now = new Date();
    const dateCode = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const seq = String(store.propertyEnquiries.length + 1).padStart(4, '0');
    const enquiryId = `VA-ENQ-${dateCode}-${seq}`;

    const newEnquiry: StoredPropertyEnquiry = {
      enquiryId,
      projectName,
      developerName,
      fullName,
      mobileNumber: cleanMobile,
      whatsappNumber: cleanWhatsApp || cleanMobile,
      email: email || undefined,
      preferredApartment: preferredApartment as '2 BHK' | '3 BHK' | 'Either',
      budget,
      additionalRequirements: additionalRequirements || undefined,
      city,
      status: 'New',
      createdAt: now.toISOString(),
    };

    store.propertyEnquiries.push(newEnquiry);
    writeStore(store);

    res.status(201).json({
      ok: true,
      enquiryId: newEnquiry.enquiryId,
      projectName: newEnquiry.projectName,
      developerName: newEnquiry.developerName,
      fullName: newEnquiry.fullName,
      preferredApartment: newEnquiry.preferredApartment,
      message: 'Your enquiry for Vedira Anand has been registered successfully. Our representative will contact you shortly.',
    });
  });

  app.get('/api/property-enquiries', (_req, res) => {
    const store = readStore();
    res.json({
      count: (store.propertyEnquiries || []).length,
      enquiries: store.propertyEnquiries || [],
    });
  });

  // Download Vedira Anand Project Brochure
  app.get(
    [
      '/api/download-brochure',
      '/download/vedira-anand-brochure',
      '/downloads/Vedira_Anand_Project_Brochure.pdf',
    ],
    (_req, res) => {
      const pdfPath = path.join(
        __dirname,
        'public/assets/aistudio/Vedira_Anand_Brochure__c18c8244.pdf'
      );
      if (fs.existsSync(pdfPath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.download(pdfPath, 'Vedira_Anand_Project_Brochure.pdf');
      } else {
        res.status(404).send('Brochure PDF not found');
      }
    }
  );

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gharmalak server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
