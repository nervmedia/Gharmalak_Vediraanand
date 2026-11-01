import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Lock,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import { CLUB_CONFIG, formatDateIN, formatRupees } from '../data/clubData';
import {
  MEMBER_CITIES,
  MEMBERSHIP_POPUP_CONTENT,
  MemberProfile,
  MembershipLoginErrors,
  MembershipRegistrationErrors,
  MembershipRegistrationInput,
  PendingDealIntent,
  SupportedMemberCity,
  canAccessMemberDeals,
  computeEffectiveMembershipStatus,
  validateMembershipLogin,
  validateMembershipRegistration,
} from '../data/membershipData';
import {
  PaymentOrderInfo,
  createRenewalOrder,
  loginMembershipAccount,
  processMembershipPayment,
  registerMembershipAccount,
} from '../utils/api';
import { RoutePath } from './Header';
import { MalakCard } from './MalakCard';

export type MembershipModalMode = 'gate' | 'register' | 'payment' | 'login' | 'account';

interface MembershipGateModalProps {
  isOpen: boolean;
  initialMode?: MembershipModalMode;
  member: MemberProfile | null;
  pendingOrder: PaymentOrderInfo | null;
  pendingIntent: PendingDealIntent | null;
  defaultCity?: string | null;
  onClose: () => void;
  onMemberUpdated: (member: MemberProfile | null, order?: PaymentOrderInfo | null) => void;
  onResumeIntent: (intent: PendingDealIntent, activeMember: MemberProfile) => void;
  onLogout: () => void;
  onNavigate: (path: RoutePath, hash?: string, query?: string) => void;
}

export function MembershipGateModal({
  isOpen,
  initialMode = 'gate',
  member,
  pendingOrder,
  pendingIntent,
  defaultCity,
  onClose,
  onMemberUpdated,
  onResumeIntent,
  onLogout,
  onNavigate,
}: MembershipGateModalProps) {
  const [mode, setMode] = useState<MembershipModalMode>(initialMode);
  const [activeOrder, setActiveOrder] = useState<PaymentOrderInfo | null>(pendingOrder);

  // Registration state
  const [regForm, setRegForm] = useState<MembershipRegistrationInput>({
    name: '',
    mobileNumber: '',
    whatsappNumber: '',
    email: '',
    city:
      defaultCity && (MEMBER_CITIES as readonly string[]).includes(defaultCity)
        ? (defaultCity as SupportedMemberCity)
        : 'Nagpur',
    pinCode: '',
    password: '',
    consent: true,
  });
  const [sameWhatsApp, setSameWhatsApp] = useState(true);
  const [regErrors, setRegErrors] = useState<MembershipRegistrationErrors>({});
  const [regSubmitting, setRegSubmitting] = useState(false);

  // Login state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState<MembershipLoginErrors>({});
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentFeedback, setPaymentFeedback] = useState<{
    type: 'error' | 'warning' | 'success';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setPaymentFeedback(null);
      setRegErrors({});
      setLoginErrors({});
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (pendingOrder) {
      setActiveOrder(pendingOrder);
    }
  }, [pendingOrder]);

  useEffect(() => {
    if (defaultCity && (MEMBER_CITIES as readonly string[]).includes(defaultCity)) {
      setRegForm((prev) => ({
        ...prev,
        city: prev.city || (defaultCity as SupportedMemberCity),
      }));
    }
  }, [defaultCity]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const effectiveStatus = computeEffectiveMembershipStatus(member);
  const isMemberActive = canAccessMemberDeals(member);

  const updateRegField = <K extends keyof MembershipRegistrationInput>(
    field: K,
    value: MembershipRegistrationInput[K]
  ) => {
    setRegForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'mobileNumber' && sameWhatsApp) {
        next.whatsappNumber = String(value);
      }
      return next;
    });
    setRegErrors((prev) => ({ ...prev, [field]: undefined, server: undefined }));
  };

  const handleStartBecomeOrRenew = async () => {
    setPaymentFeedback(null);
    if (member && (effectiveStatus === 'Expired' || effectiveStatus === 'Payment Pending')) {
      try {
        setPaymentBusy(true);
        const res = await createRenewalOrder();
        setActiveOrder(res.paymentOrder);
        onMemberUpdated(res.member, res.paymentOrder);
        setMode('payment');
      } catch {
        setMode('register');
      } finally {
        setPaymentBusy(false);
      }
      return;
    }
    setMode('register');
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: MembershipRegistrationInput = {
      ...regForm,
      whatsappNumber: sameWhatsApp ? regForm.mobileNumber : regForm.whatsappNumber,
    };
    const errors = validateMembershipRegistration(payload);
    setRegErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setRegSubmitting(true);
    try {
      const res = await registerMembershipAccount(payload);
      setActiveOrder(res.paymentOrder);
      onMemberUpdated(res.member, res.paymentOrder);
      setPaymentFeedback(null);
      setMode('payment');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not register account. Please try again.';
      setRegErrors({ server: message });
    } finally {
      setRegSubmitting(false);
    }
  };

  const handleProcessPayment = async (
    outcome: 'success' | 'failed' | 'pending' | 'cancelled'
  ) => {
    setPaymentBusy(true);
    setPaymentFeedback(null);
    try {
      const orderId = activeOrder?.orderId || `GM-ORD-${Date.now()}`;
      const res = await processMembershipPayment({
        orderId,
        paymentMethod,
        outcome,
      });

      setActiveOrder(res.paymentOrder);
      onMemberUpdated(res.member, res.paymentOrder);

      if (res.activated && canAccessMemberDeals(res.member)) {
        setPaymentFeedback({
          type: 'success',
          message:
            'Payment verified! Your Gharmalak Club membership is now Active for 12 months.',
        });
        setMode('account');
      } else {
        setPaymentFeedback({
          type: outcome === 'pending' ? 'warning' : 'error',
          message:
            res.error ||
            'Payment was not completed. Your membership remains inactive and deal access is still locked.',
        });
      }
    } catch (err) {
      setPaymentFeedback({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'Could not verify payment right now. Membership has not been activated.',
      });
    } finally {
      setPaymentBusy(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateMembershipLogin({
      identifier: loginIdentifier,
      password: loginPassword,
    });
    setLoginErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoginSubmitting(true);
    try {
      const res = await loginMembershipAccount({
        identifier: loginIdentifier,
        password: loginPassword,
      });
      setActiveOrder(res.paymentOrder);
      onMemberUpdated(res.member, res.paymentOrder);

      const statusAfterLogin = computeEffectiveMembershipStatus(res.member);
      if (statusAfterLogin === 'Active') {
        if (pendingIntent) {
          onResumeIntent(pendingIntent, res.member);
          return;
        }
        setMode('account');
      } else {
        // Expired or Payment Pending account
        setMode('gate');
      }
    } catch (err) {
      setLoginErrors({
        server:
          err instanceof Error
            ? err.message
            : 'Invalid mobile number/email or password.',
      });
    } finally {
      setLoginSubmitting(false);
    }
  };

  const primaryGateButtonLabel =
    effectiveStatus === 'Expired'
      ? MEMBERSHIP_POPUP_CONTENT.renewCta
      : effectiveStatus === 'Payment Pending'
      ? MEMBERSHIP_POPUP_CONTENT.completePaymentCta
      : MEMBERSHIP_POPUP_CONTENT.primaryCta;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gm-membership-modal-heading"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white border border-[#E4E9E3] shadow-2xl transition-all duration-300 ease-out max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Header Bar */}
        <div className="bg-[#064E3B] px-5 py-4 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#FFC928]">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>
              {mode === 'gate' && 'Gharmalak Club · Member Access'}
              {mode === 'register' && 'Step 1 of 2 · Member Registration'}
              {mode === 'payment' && 'Step 2 of 2 · Verified Payment'}
              {mode === 'login' && 'Member Login'}
              {mode === 'account' && 'Gharmalak Club Membership'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close membership popup and continue browsing"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Remembered Deal / Round Intent Banner */}
          {pendingIntent && (
            <div
              data-testid="pending-intent-banner"
              className="rounded-xl bg-[#EAF2E9] border border-[#CFE0CF] px-4 py-3 flex items-start gap-3"
            >
              <Sparkles className="h-4 w-4 text-[#064E3B] shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-[#073B30]">
                <span className="font-semibold text-[#064E3B]">Saved action: </span>
                <strong className="font-bold text-[#073B30]">{pendingIntent.label}</strong>
                <p className="text-[11px] sm:text-xs text-[#073B30]/75 mt-0.5">
                  We&apos;ll return you directly to this deal as soon as your membership is active.
                </p>
              </div>
            </div>
          )}

          {/* ================================================================
              MODE 1: MEMBERSHIP GATE POPUP
             ================================================================ */}
          {mode === 'gate' && (
            <div className="space-y-5">
              {effectiveStatus === 'Expired' && member && (
                <div
                  role="alert"
                  data-testid="expired-membership-alert"
                  className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs sm:text-sm text-amber-950 space-y-1"
                >
                  <p className="font-bold flex items-center gap-1.5 text-amber-900">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>Your Gharmalak Club membership has expired</span>
                  </p>
                  <p className="text-amber-900/85">
                    Member ID <strong>{member.memberId}</strong> expired on{' '}
                    <strong>
                      {member.membershipExpiryDate
                        ? formatDateIN(member.membershipExpiryDate.slice(0, 10))
                        : 'recently'}
                    </strong>
                    . Renew your annual membership to unlock deals and join group rounds again.
                  </p>
                </div>
              )}

              {effectiveStatus === 'Payment Pending' && member && (
                <div
                  role="alert"
                  data-testid="pending-membership-alert"
                  className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs sm:text-sm text-amber-950 space-y-1"
                >
                  <p className="font-bold flex items-center gap-1.5 text-amber-900">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Membership Payment Pending ({member.paymentStatus})</span>
                  </p>
                  <p className="text-amber-900/85">
                    Your account (<strong>{member.memberId}</strong>) is registered, but deal
                    access is locked until your {formatRupees(CLUB_CONFIG.fee)} annual membership
                    payment is verified.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <h2
                  id="gm-membership-modal-heading"
                  className="text-2xl sm:text-3xl font-bold tracking-tight text-[#073B30] leading-snug"
                >
                  {MEMBERSHIP_POPUP_CONTENT.heading}
                </h2>
                <p className="text-sm sm:text-base text-[#073B30]/80 leading-relaxed">
                  {MEMBERSHIP_POPUP_CONTENT.supportingText}
                </p>
              </div>

              {/* 3 Short Membership Benefits */}
              <ul className="space-y-2.5 rounded-xl bg-[#F8F8F3] border border-[#E4E9E3] p-4">
                {MEMBERSHIP_POPUP_CONTENT.benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-2.5 text-sm font-medium text-[#073B30]"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EAF2E9] text-[#064E3B]">
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    </span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* Actual Project Membership Fee Card */}
              <div className="rounded-xl bg-[#EAF2E9]/70 border border-[#CFE0CF] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#064E3B]">
                    Founding Member Annual Fee
                  </span>
                  <div className="flex items-baseline gap-2.5 mt-0.5 tabular-nums">
                    <s className="text-sm text-[#073B30]/50 font-medium">
                      {formatRupees(CLUB_CONFIG.regularFee)}
                    </s>
                    <span className="text-2xl font-extrabold text-[#073B30]">
                      {formatRupees(CLUB_CONFIG.fee)}
                    </span>
                    <span className="text-xs font-semibold text-[#064E3B]">/ 12 months</span>
                  </div>
                </div>
                <div className="text-xs text-[#073B30]/80 sm:text-right max-w-[220px]">
                  Deducted in full from your first vendor bill for the first 1,000 Nagpur homes.
                </div>
              </div>

              {/* Primary and Secondary Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  data-testid="modal-become-member-btn"
                  disabled={paymentBusy}
                  onClick={handleStartBecomeOrRenew}
                  className="gm-btn-primary w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFC928] px-5 py-3.5 text-sm sm:text-base font-bold text-[#073B30] hover:bg-[#f3bc18] transition-colors cursor-pointer"
                >
                  <span>{paymentBusy ? 'Preparing…' : primaryGateButtonLabel}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  data-testid="modal-login-switch-btn"
                  onClick={() => setMode('login')}
                  className="gm-btn-secondary w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#064E3B] bg-white px-5 py-3 text-sm font-semibold text-[#064E3B] hover:bg-[#EAF2E9] transition-colors cursor-pointer"
                >
                  <UserCheck className="h-4 w-4" />
                  <span>{MEMBERSHIP_POPUP_CONTENT.secondaryCta}</span>
                </button>
              </div>

              <p className="text-center text-xs text-[#073B30]/65">
                Browsing the website is always free. Close this window anytime to continue
                exploring deals.
              </p>
            </div>
          )}

          {/* ================================================================
              MODE 2: MEMBERSHIP REGISTRATION FORM
             ================================================================ */}
          {mode === 'register' && (
            <form onSubmit={handleRegistrationSubmit} noValidate className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode('gate')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#064E3B] hover:underline cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
                <span className="text-xs font-semibold text-[#073B30]/70">
                  {formatRupees(CLUB_CONFIG.fee)} · 1-year validity
                </span>
              </div>

              <div>
                <h2
                  id="gm-membership-modal-heading"
                  className="text-xl sm:text-2xl font-bold text-[#073B30]"
                >
                  Create your Gharmalak Club account
                </h2>
                <p className="text-xs sm:text-sm text-[#073B30]/75 mt-0.5">
                  Enter your homeowner details below, then complete the{' '}
                  {formatRupees(CLUB_CONFIG.fee)} annual membership payment to activate deal
                  access.
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label
                  htmlFor="gm-reg-name"
                  className="block text-xs font-semibold text-[#073B30] mb-1"
                >
                  Full Name *
                </label>
                <input
                  id="gm-reg-name"
                  type="text"
                  value={regForm.name}
                  onChange={(e) => updateRegField('name', e.target.value)}
                  placeholder="e.g. Rohan Kulkarni"
                  className="w-full rounded-xl border border-[#E4E9E3] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                />
                {regErrors.name && (
                  <p className="mt-1 text-xs font-semibold text-red-700">{regErrors.name}</p>
                )}
              </div>

              {/* Mobile & WhatsApp Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="gm-reg-mobile"
                    className="block text-xs font-semibold text-[#073B30] mb-1"
                  >
                    Mobile Number *
                  </label>
                  <div className="flex rounded-xl border border-[#E4E9E3] bg-[#F8F8F3] overflow-hidden focus-within:border-[#064E3B] focus-within:bg-white">
                    <span className="inline-flex items-center px-2.5 text-xs font-semibold text-[#073B30]/70 border-r border-[#E4E9E3]">
                      +91
                    </span>
                    <input
                      id="gm-reg-mobile"
                      type="tel"
                      inputMode="numeric"
                      value={regForm.mobileNumber}
                      onChange={(e) =>
                        updateRegField(
                          'mobileNumber',
                          e.target.value.replace(/[^\d]/g, '').slice(0, 10)
                        )
                      }
                      placeholder="9823012345"
                      className="w-full px-3 py-2.5 text-sm text-[#073B30] bg-transparent focus:outline-none"
                    />
                  </div>
                  {regErrors.mobileNumber && (
                    <p className="mt-1 text-xs font-semibold text-red-700">
                      {regErrors.mobileNumber}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="gm-reg-whatsapp"
                      className="block text-xs font-semibold text-[#073B30]"
                    >
                      WhatsApp Number *
                    </label>
                    <label className="inline-flex items-center gap-1 text-[11px] text-[#064E3B] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sameWhatsApp}
                        onChange={(e) => {
                          setSameWhatsApp(e.target.checked);
                          if (e.target.checked) {
                            updateRegField('whatsappNumber', regForm.mobileNumber);
                          }
                        }}
                        className="h-3 w-3 rounded border-[#E4E9E3] text-[#064E3B]"
                      />
                      <span>Same</span>
                    </label>
                  </div>
                  <div className="flex rounded-xl border border-[#E4E9E3] bg-[#F8F8F3] overflow-hidden focus-within:border-[#064E3B] focus-within:bg-white">
                    <span className="inline-flex items-center px-2.5 text-xs font-semibold text-[#073B30]/70 border-r border-[#E4E9E3]">
                      +91
                    </span>
                    <input
                      id="gm-reg-whatsapp"
                      type="tel"
                      inputMode="numeric"
                      disabled={sameWhatsApp}
                      value={sameWhatsApp ? regForm.mobileNumber : regForm.whatsappNumber}
                      onChange={(e) =>
                        updateRegField(
                          'whatsappNumber',
                          e.target.value.replace(/[^\d]/g, '').slice(0, 10)
                        )
                      }
                      placeholder="9823012345"
                      className="w-full px-3 py-2.5 text-sm text-[#073B30] bg-transparent focus:outline-none disabled:opacity-65"
                    />
                  </div>
                  {regErrors.whatsappNumber && (
                    <p className="mt-1 text-xs font-semibold text-red-700">
                      {regErrors.whatsappNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="gm-reg-email"
                  className="block text-xs font-semibold text-[#073B30] mb-1"
                >
                  Email Address *
                </label>
                <input
                  id="gm-reg-email"
                  type="email"
                  value={regForm.email}
                  onChange={(e) => updateRegField('email', e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[#E4E9E3] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                />
                {regErrors.email && (
                  <p className="mt-1 text-xs font-semibold text-red-700">{regErrors.email}</p>
                )}
              </div>

              {/* City & PIN Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="gm-reg-city"
                    className="block text-xs font-semibold text-[#073B30] mb-1"
                  >
                    City *
                  </label>
                  <select
                    id="gm-reg-city"
                    value={regForm.city}
                    onChange={(e) =>
                      updateRegField('city', e.target.value as SupportedMemberCity)
                    }
                    className="w-full rounded-xl border border-[#E4E9E3] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                  >
                    {MEMBER_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {regErrors.city && (
                    <p className="mt-1 text-xs font-semibold text-red-700">{regErrors.city}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="gm-reg-pincode"
                    className="block text-xs font-semibold text-[#073B30] mb-1"
                  >
                    PIN Code *
                  </label>
                  <input
                    id="gm-reg-pincode"
                    type="text"
                    inputMode="numeric"
                    value={regForm.pinCode}
                    onChange={(e) =>
                      updateRegField('pinCode', e.target.value.replace(/[^\d]/g, '').slice(0, 6))
                    }
                    placeholder="440010"
                    className="w-full rounded-xl border border-[#E4E9E3] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                  />
                  {regErrors.pinCode && (
                    <p className="mt-1 text-xs font-semibold text-red-700">
                      {regErrors.pinCode}
                    </p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="gm-reg-password"
                  className="block text-xs font-semibold text-[#073B30] mb-1"
                >
                  Create Password *
                </label>
                <input
                  id="gm-reg-password"
                  type="password"
                  value={regForm.password}
                  onChange={(e) => updateRegField('password', e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-[#E4E9E3] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                />
                {regErrors.password && (
                  <p className="mt-1 text-xs font-semibold text-red-700">
                    {regErrors.password}
                  </p>
                )}
              </div>

              {/* Consent */}
              <div>
                <label className="flex items-start gap-2 text-xs text-[#073B30]/85 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={regForm.consent}
                    onChange={(e) => updateRegField('consent', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#E4E9E3] text-[#064E3B]"
                  />
                  <span>
                    I agree to receive homeowner group-buying updates on WhatsApp and accept the{' '}
                    <a
                      href="/privacy"
                      onClick={(e) => {
                        e.preventDefault();
                        onClose();
                        onNavigate('/privacy');
                      }}
                      className="underline font-semibold text-[#064E3B]"
                    >
                      privacy policy
                    </a>
                    .
                  </span>
                </label>
                {regErrors.consent && (
                  <p className="mt-1 text-xs font-semibold text-red-700">
                    {regErrors.consent}
                  </p>
                )}
              </div>

              {regErrors.server && (
                <div
                  role="alert"
                  className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700"
                >
                  {regErrors.server}
                </div>
              )}

              <button
                type="submit"
                data-testid="modal-register-submit-btn"
                disabled={regSubmitting}
                className="gm-btn-primary w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFC928] px-5 py-3.5 text-sm font-bold text-[#073B30] hover:bg-[#f3bc18] transition-colors cursor-pointer"
              >
                <span>
                  {regSubmitting
                    ? 'Creating Account…'
                    : `Continue to ${formatRupees(CLUB_CONFIG.fee)} Membership Payment`}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* ================================================================
              MODE 3: VERIFIED PAYMENT CHECKOUT
             ================================================================ */}
          {mode === 'payment' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode('gate')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#064E3B] hover:underline cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
                {activeOrder && (
                  <span className="text-[11px] font-mono text-[#073B30]/65">
                    Order: {activeOrder.orderId}
                  </span>
                )}
              </div>

              <div>
                <h2
                  id="gm-membership-modal-heading"
                  className="text-xl sm:text-2xl font-bold text-[#073B30]"
                >
                  Complete Your Membership Payment
                </h2>
                <p className="text-xs sm:text-sm text-[#073B30]/75 mt-0.5">
                  Membership becomes <strong>Active</strong> only after verified payment
                  confirmation.
                </p>
              </div>

              {/* Member & Plan Summary */}
              <div className="rounded-xl bg-[#F8F8F3] border border-[#E4E9E3] p-4 space-y-2 text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#073B30]/70">Member Account</span>
                  <strong className="text-[#073B30]">
                    {member?.name} ({member?.memberId})
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#073B30]/70">Current Status</span>
                  <span
                    data-testid="payment-step-member-status"
                    className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900"
                  >
                    <Lock className="h-3 w-3" />
                    <span>{effectiveStatus}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#E4E9E3]">
                  <span className="font-semibold text-[#073B30]">
                    1-Year Gharmalak Club Membership
                  </span>
                  <strong className="text-lg font-extrabold text-[#064E3B] tabular-nums">
                    {formatRupees(CLUB_CONFIG.fee)}
                  </strong>
                </div>
              </div>

              {/* Payment Method Selector */}
              <fieldset className="space-y-2">
                <legend className="text-xs font-semibold text-[#073B30]">
                  Select Payment Method
                </legend>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'Card', 'NetBanking'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                        paymentMethod === method
                          ? 'border-[#064E3B] bg-[#064E3B] text-white'
                          : 'border-[#E4E9E3] bg-[#F8F8F3] text-[#073B30] hover:bg-[#EAF2E9]'
                      }`}
                    >
                      {method === 'UPI' ? 'UPI / QR' : method}
                    </button>
                  ))}
                </div>
              </fieldset>

              {paymentFeedback && (
                <div
                  role="alert"
                  data-testid="payment-feedback-alert"
                  className={`rounded-xl border p-3.5 text-xs sm:text-sm font-medium ${
                    paymentFeedback.type === 'error'
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : paymentFeedback.type === 'warning'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-[#EAF2E9] border-[#CFE0CF] text-[#064E3B]'
                  }`}
                >
                  {paymentFeedback.message}
                </div>
              )}

              {/* Primary Verified Payment Button */}
              <button
                type="button"
                data-testid="verify-payment-success-btn"
                disabled={paymentBusy}
                onClick={() => handleProcessPayment('success')}
                className="gm-btn-primary w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFC928] px-5 py-3.5 text-sm sm:text-base font-bold text-[#073B30] hover:bg-[#f3bc18] transition-colors cursor-pointer"
              >
                <CreditCard className="h-4 w-4" />
                <span>
                  {paymentBusy
                    ? 'Verifying Payment…'
                    : `Pay ${formatRupees(CLUB_CONFIG.fee)} & Activate Membership`}
                </span>
              </button>

              {/* Non-Activation Payment Verification Safeguard Controls (Failed / Cancelled / Pending) */}
              <div className="rounded-xl bg-[#F8F8F3] border border-[#E4E9E3] p-3 space-y-2">
                <p className="text-[11px] font-semibold text-[#073B30]/70">
                  Payment verification outcomes (membership activates only on confirmed payment):
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    data-testid="verify-payment-failed-btn"
                    disabled={paymentBusy}
                    onClick={() => handleProcessPayment('failed')}
                    className="rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-red-700 hover:bg-red-50 cursor-pointer"
                  >
                    Simulate Failed Payment
                  </button>
                  <button
                    type="button"
                    data-testid="verify-payment-cancelled-btn"
                    disabled={paymentBusy}
                    onClick={() => handleProcessPayment('cancelled')}
                    className="rounded-lg border border-[#E4E9E3] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#073B30]/80 hover:bg-[#EAF2E9] cursor-pointer"
                  >
                    Cancel Payment
                  </button>
                  <button
                    type="button"
                    data-testid="verify-payment-pending-btn"
                    disabled={paymentBusy}
                    onClick={() => handleProcessPayment('pending')}
                    className="rounded-lg border border-amber-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-amber-800 hover:bg-amber-50 cursor-pointer"
                  >
                    Keep Payment Pending
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              MODE 4: MEMBER LOGIN
             ================================================================ */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode('gate')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#064E3B] hover:underline cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-xs font-semibold text-[#064E3B] hover:underline cursor-pointer"
                >
                  New homeowner? Become a Member
                </button>
              </div>

              <div>
                <h2
                  id="gm-membership-modal-heading"
                  className="text-xl sm:text-2xl font-bold text-[#073B30]"
                >
                  Member Log In
                </h2>
                <p className="text-xs sm:text-sm text-[#073B30]/75 mt-0.5">
                  Log in with your registered mobile number or email to unlock deals and join
                  group rounds.
                </p>
              </div>

              <div>
                <label
                  htmlFor="gm-login-id"
                  className="block text-xs font-semibold text-[#073B30] mb-1"
                >
                  Mobile Number or Email Address
                </label>
                <input
                  id="gm-login-id"
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => {
                    setLoginIdentifier(e.target.value);
                    setLoginErrors((prev) => ({ ...prev, identifier: undefined, server: undefined }));
                  }}
                  placeholder="9823000001 or email@example.com"
                  className="w-full rounded-xl border border-[#E4E9E3] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                />
                {loginErrors.identifier && (
                  <p className="mt-1 text-xs font-semibold text-red-700">
                    {loginErrors.identifier}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="gm-login-password"
                  className="block text-xs font-semibold text-[#073B30] mb-1"
                >
                  Password
                </label>
                <input
                  id="gm-login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginErrors((prev) => ({ ...prev, password: undefined, server: undefined }));
                  }}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[#E4E9E3] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                />
                {loginErrors.password && (
                  <p className="mt-1 text-xs font-semibold text-red-700">
                    {loginErrors.password}
                  </p>
                )}
              </div>

              {loginErrors.server && (
                <div
                  role="alert"
                  className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700"
                >
                  {loginErrors.server}
                </div>
              )}

              <button
                type="submit"
                data-testid="modal-login-submit-btn"
                disabled={loginSubmitting}
                className="gm-btn-dark w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#064E3B] px-5 py-3.5 text-sm font-bold text-white hover:bg-[#073B30] transition-colors cursor-pointer"
              >
                <span>{loginSubmitting ? 'Verifying…' : 'Log In & Continue'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* ================================================================
              MODE 5: ACTIVE / ACCOUNT SUMMARY VIEW
             ================================================================ */}
          {mode === 'account' && member && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span
                    data-testid="account-status-badge"
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                      isMemberActive
                        ? 'bg-[#EAF2E9] text-[#064E3B]'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    <BadgeCheck className="h-3.5 w-3.5" />
                    <span>Membership {effectiveStatus}</span>
                  </span>
                  <h2
                    id="gm-membership-modal-heading"
                    className="text-xl sm:text-2xl font-bold text-[#073B30] mt-2"
                  >
                    Welcome, {member.name}
                  </h2>
                </div>
              </div>

              <div className="flex justify-center">
                <MalakCard
                  name={member.name}
                  number={member.memberId}
                  label="FOUNDING MEMBER"
                  over="GHARMALAK CLUB"
                  variant="emerald"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#F8F8F3] border border-[#E4E9E3] p-4 text-xs">
                <div>
                  <span className="text-[#073B30]/65 block">City &amp; PIN</span>
                  <strong className="text-[#073B30] font-semibold">
                    {member.city} · {member.pinCode}
                  </strong>
                </div>
                <div>
                  <span className="text-[#073B30]/65 block">Payment Status</span>
                  <strong className="text-[#064E3B] font-semibold">{member.paymentStatus}</strong>
                </div>
                <div>
                  <span className="text-[#073B30]/65 block">Valid From</span>
                  <strong className="text-[#073B30] font-semibold">
                    {member.membershipStartDate
                      ? formatDateIN(member.membershipStartDate.slice(0, 10))
                      : '—'}
                  </strong>
                </div>
                <div>
                  <span className="text-[#073B30]/65 block">Valid Until</span>
                  <strong className="text-[#073B30] font-semibold">
                    {member.membershipExpiryDate
                      ? formatDateIN(member.membershipExpiryDate.slice(0, 10))
                      : '—'}
                  </strong>
                </div>
              </div>

              {isMemberActive && pendingIntent && (
                <button
                  type="button"
                  data-testid="continue-to-intended-deal-btn"
                  onClick={() => onResumeIntent(pendingIntent, member)}
                  className="gm-btn-primary w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFC928] px-5 py-3.5 text-sm sm:text-base font-bold text-[#073B30] hover:bg-[#f3bc18] transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#064E3B]" />
                  <span>Continue to {pendingIntent.label}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}

              {!isMemberActive && (
                <button
                  type="button"
                  onClick={handleStartBecomeOrRenew}
                  className="gm-btn-primary w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFC928] px-5 py-3.5 text-sm font-bold text-[#073B30] hover:bg-[#f3bc18] transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>
                    {effectiveStatus === 'Expired'
                      ? 'Renew Membership (₹499)'
                      : 'Complete Membership Payment (₹499)'}
                  </span>
                </button>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-[#E4E9E3]">
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:underline cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log Out</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg bg-[#EAF2E9] px-4 py-2 text-xs font-semibold text-[#064E3B] hover:bg-[#dce8da] cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
