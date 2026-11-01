import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Lock,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { useLang } from '../data/translations';
import {
  CLUB_CONFIG,
  NAGPUR_AREAS,
  buildWhatsAppUrl,
  formatRupees,
  normalizeIndianPhone,
} from '../data/clubData';
import {
  MEMBER_CITIES,
  MemberProfile,
  MembershipRegistrationErrors,
  MembershipRegistrationInput,
  PendingDealIntent,
  SupportedMemberCity,
  canAccessMemberDeals,
  computeEffectiveMembershipStatus,
  validateMembershipRegistration,
} from '../data/membershipData';
import {
  PaymentOrderInfo,
  processMembershipPayment,
  registerMembershipAccount,
} from '../utils/api';
import { RoutePath } from './Header';
import { MalakCard } from './MalakCard';
import { Reveal } from './MotionPrimitives';

interface JoinViewProps {
  onMemberJoined: () => void;
  onNavigate: (path: RoutePath, hash?: string, query?: string) => void;
  member?: MemberProfile | null;
  pendingIntent?: PendingDealIntent | null;
  onMemberUpdated?: (member: MemberProfile | null, order?: PaymentOrderInfo | null) => void;
  onResumeIntent?: (intent: PendingDealIntent, activeMember: MemberProfile) => void;
  onOpenLoginModal?: () => void;
}

const INTEREST_KEYS = ['solar', 'painting', 'waterproofing', 'other'] as const;

export function JoinView({
  onMemberJoined,
  onNavigate,
  member = null,
  pendingIntent = null,
  onMemberUpdated,
  onResumeIntent,
  onOpenLoginModal,
}: JoinViewProps) {
  const { t } = useLang();
  const [step, setStep] = useState<1 | 2 | 3>(() =>
    canAccessMemberDeals(member) ? 3 : member ? 2 : 1
  );
  const [form, setForm] = useState<MembershipRegistrationInput>({
    name: member?.name || '',
    mobileNumber: member?.mobileNumber || '',
    whatsappNumber: member?.whatsappNumber || '',
    email: member?.email || '',
    city: (member?.city as SupportedMemberCity) || 'Nagpur',
    pinCode: member?.pinCode || '440010',
    password: '',
    area: member?.area || 'Dharampeth',
    homeType: (member?.homeType as 'house' | 'flat') || 'house',
    interests: member?.interests || ['solar'],
    consent: false,
  });
  const [sameWhatsApp, setSameWhatsApp] = useState(true);
  const [errors, setErrors] = useState<MembershipRegistrationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [currentMember, setCurrentMember] = useState<MemberProfile | null>(member);
  const [activeOrder, setActiveOrder] = useState<PaymentOrderInfo | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const updateField = <K extends keyof MembershipRegistrationInput>(
    key: K,
    value: MembershipRegistrationInput[K]
  ) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'mobileNumber' && sameWhatsApp) {
        next.whatsappNumber = String(value);
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: undefined, server: undefined }));
  };

  const toggleInterest = (id: string) => {
    const list = form.interests || [];
    updateField(
      'interests',
      list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: MembershipRegistrationInput = {
      ...form,
      whatsappNumber: sameWhatsApp ? form.mobileNumber : form.whatsappNumber,
    };
    const validation = validateMembershipRegistration(payload);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    try {
      const res = await registerMembershipAccount(payload);
      setCurrentMember(res.member);
      setActiveOrder(res.paymentOrder);
      onMemberUpdated?.(res.member, res.paymentOrder);
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrors({
        server: err instanceof Error ? err.message : t.f_err_server,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcessPayment = async (
    outcome: 'success' | 'failed' | 'pending' | 'cancelled'
  ) => {
    setPaymentBusy(true);
    setPaymentError(null);
    try {
      const orderId = activeOrder?.orderId || `GM-ORD-${Date.now()}`;
      const res = await processMembershipPayment({
        orderId,
        paymentMethod,
        outcome,
      });
      setCurrentMember(res.member);
      setActiveOrder(res.paymentOrder);
      onMemberUpdated?.(res.member, res.paymentOrder);

      if (res.activated && canAccessMemberDeals(res.member)) {
        onMemberJoined();
        setStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setPaymentError(
          res.error ||
            'Payment was not verified. Membership remains Payment Pending and deal access is locked.'
        );
      }
    } catch (err) {
      setPaymentError(
        err instanceof Error
          ? err.message
          : 'Could not verify payment. Membership has not been activated.'
      );
    } finally {
      setPaymentBusy(false);
    }
  };

  const cleanPhone = normalizeIndianPhone(
    currentMember?.mobileNumber || form.mobileNumber
  );
  const effectiveStatus = computeEffectiveMembershipStatus(currentMember);

  return (
    <div className="bg-[#F8F8F3] py-12 sm:py-20">
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        {/* Progress Indicator */}
        <div aria-hidden="true" className="grid grid-cols-3 gap-2 mb-8">
          <span
            className={`h-1.5 rounded-full transition-colors duration-300 ${
              step >= 1 ? 'bg-[#064E3B]' : 'bg-[#E4E9E3]'
            }`}
          />
          <span
            className={`h-1.5 rounded-full transition-colors duration-300 ${
              step >= 2 ? 'bg-[#064E3B]' : 'bg-[#E4E9E3]'
            }`}
          />
          <span
            className={`h-1.5 rounded-full transition-colors duration-300 ${
              step >= 3 ? 'bg-[#064E3B]' : 'bg-[#E4E9E3]'
            }`}
          />
        </div>

        {pendingIntent && (
          <div className="mb-6 rounded-xl bg-[#EAF2E9] border border-[#CFE0CF] p-4 flex items-start gap-3">
            <Sparkles className="h-4 w-4 text-[#064E3B] shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-[#073B30]">
              <span className="font-semibold text-[#064E3B]">Saved deal action: </span>
              <strong>{pendingIntent.label}</strong>
              <p className="text-xs text-[#073B30]/75 mt-0.5">
                Complete your membership below and we&apos;ll take you straight back to your
                selected deal.
              </p>
            </div>
          </div>
        )}

        {step === 1 && (
          <Reveal y={18} className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#064E3B]">
                  {t.join_over}
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#073B30]">
                  {t.join_title}
                </h1>
                <p className="text-base text-[#073B30]/80">{t.join_body}</p>
              </div>

              {onOpenLoginModal && (
                <button
                  type="button"
                  onClick={onOpenLoginModal}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#064E3B] bg-white px-3.5 py-2 text-xs font-semibold text-[#064E3B] hover:bg-[#EAF2E9] cursor-pointer"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Already a Member? Log In</span>
                </button>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-2xl bg-white border border-[#E4E9E3] p-6 sm:p-8 shadow-xs space-y-5"
            >
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-[#073B30] mb-1.5">
                  {t.f_name}
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  maxLength={120}
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  aria-invalid={!!errors.name}
                  className="w-full rounded-xl border border-[#E4E9E3] bg-[#F8F8F3] px-4 py-3 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                />
                {errors.name && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              {/* Mobile & WhatsApp Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-[#073B30] mb-1.5"
                  >
                    Mobile number
                  </label>
                  <div className="flex rounded-xl border border-[#E4E9E3] bg-[#F8F8F3] overflow-hidden focus-within:border-[#064E3B] focus-within:bg-white">
                    <span className="inline-flex items-center px-3 text-sm font-semibold text-[#073B30]/70 border-r border-[#E4E9E3]">
                      +91
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      value={form.mobileNumber}
                      onChange={(e) =>
                        updateField(
                          'mobileNumber',
                          e.target.value.replace(/[^\d]/g, '').slice(0, 10)
                        )
                      }
                      aria-invalid={!!errors.mobileNumber}
                      className="w-full px-3.5 py-3 text-sm text-[#073B30] bg-transparent focus:outline-none"
                    />
                  </div>
                  {errors.mobileNumber && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errors.mobileNumber}</span>
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="whatsapp"
                      className="block text-sm font-semibold text-[#073B30]"
                    >
                      {t.f_phone}
                    </label>
                    <label className="inline-flex items-center gap-1 text-xs text-[#064E3B] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sameWhatsApp}
                        onChange={(e) => {
                          setSameWhatsApp(e.target.checked);
                          if (e.target.checked) {
                            updateField('whatsappNumber', form.mobileNumber);
                          }
                        }}
                        className="h-3.5 w-3.5 rounded border-[#E4E9E3] text-[#064E3B]"
                      />
                      <span>Same</span>
                    </label>
                  </div>
                  <div className="flex rounded-xl border border-[#E4E9E3] bg-[#F8F8F3] overflow-hidden focus-within:border-[#064E3B] focus-within:bg-white">
                    <span className="inline-flex items-center px-3 text-sm font-semibold text-[#073B30]/70 border-r border-[#E4E9E3]">
                      +91
                    </span>
                    <input
                      id="whatsapp"
                      type="tel"
                      inputMode="numeric"
                      disabled={sameWhatsApp}
                      value={sameWhatsApp ? form.mobileNumber : form.whatsappNumber}
                      onChange={(e) =>
                        updateField(
                          'whatsappNumber',
                          e.target.value.replace(/[^\d]/g, '').slice(0, 10)
                        )
                      }
                      aria-invalid={!!errors.whatsappNumber}
                      className="w-full px-3.5 py-3 text-sm text-[#073B30] bg-transparent focus:outline-none disabled:opacity-65"
                    />
                  </div>
                  {errors.whatsappNumber && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errors.whatsappNumber}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[#073B30] mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  aria-invalid={!!errors.email}
                  className="w-full rounded-xl border border-[#E4E9E3] bg-[#F8F8F3] px-4 py-3 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                />
                {errors.email && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* City & PIN Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-semibold text-[#073B30] mb-1.5"
                  >
                    City
                  </label>
                  <div className="relative">
                    <select
                      id="city"
                      value={form.city}
                      onChange={(e) =>
                        updateField('city', e.target.value as SupportedMemberCity)
                      }
                      aria-invalid={!!errors.city}
                      className="w-full appearance-none rounded-xl border border-[#E4E9E3] bg-[#F8F8F3] px-4 py-3 pr-10 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                    >
                      {MEMBER_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#073B30]/70" />
                  </div>
                  {errors.city && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errors.city}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="pinCode"
                    className="block text-sm font-semibold text-[#073B30] mb-1.5"
                  >
                    PIN Code
                  </label>
                  <input
                    id="pinCode"
                    type="text"
                    inputMode="numeric"
                    value={form.pinCode}
                    onChange={(e) =>
                      updateField('pinCode', e.target.value.replace(/[^\d]/g, '').slice(0, 6))
                    }
                    aria-invalid={!!errors.pinCode}
                    className="w-full rounded-xl border border-[#E4E9E3] bg-[#F8F8F3] px-4 py-3 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                  />
                  {errors.pinCode && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errors.pinCode}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Area */}
              <div>
                <label htmlFor="area" className="block text-sm font-semibold text-[#073B30] mb-1.5">
                  {t.f_area}
                </label>
                <div className="relative">
                  <select
                    id="area"
                    value={form.area}
                    onChange={(e) => updateField('area', e.target.value)}
                    className="w-full appearance-none rounded-xl border border-[#E4E9E3] bg-[#F8F8F3] px-4 py-3 pr-10 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                  >
                    <option value="" disabled>
                      {t.f_area_pick}
                    </option>
                    {NAGPUR_AREAS.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#073B30]/70" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-[#073B30] mb-1.5"
                >
                  Create Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder="At least 6 characters"
                  aria-invalid={!!errors.password}
                  className="w-full rounded-xl border border-[#E4E9E3] bg-[#F8F8F3] px-4 py-3 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                />
                {errors.password && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Home Type */}
              <fieldset className="space-y-2">
                <legend className="text-sm font-semibold text-[#073B30]">{t.f_home}</legend>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    aria-pressed={form.homeType === 'house'}
                    onClick={() => updateField('homeType', 'house')}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                      form.homeType === 'house'
                        ? 'bg-[#064E3B] text-white'
                        : 'bg-[#F8F8F3] text-[#073B30] border border-[#E4E9E3] hover:bg-[#EAF2E9]'
                    }`}
                  >
                    {t.f_house}
                  </button>
                  <button
                    type="button"
                    aria-pressed={form.homeType === 'flat'}
                    onClick={() => updateField('homeType', 'flat')}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                      form.homeType === 'flat'
                        ? 'bg-[#064E3B] text-white'
                        : 'bg-[#F8F8F3] text-[#073B30] border border-[#E4E9E3] hover:bg-[#EAF2E9]'
                    }`}
                  >
                    {t.f_flat}
                  </button>
                </div>
              </fieldset>

              {/* What would you like first? */}
              <fieldset className="space-y-2">
                <legend className="text-sm font-semibold text-[#073B30]">{t.f_interest}</legend>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_KEYS.map((key) => {
                    const selected = (form.interests || []).includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleInterest(key)}
                        className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                          selected
                            ? 'bg-[#064E3B] text-white'
                            : 'bg-[#F8F8F3] text-[#073B30] border border-[#E4E9E3] hover:bg-[#EAF2E9]'
                        }`}
                      >
                        {t[`i_${key}` as keyof typeof t]}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Consent */}
              <div>
                <label className="flex items-start gap-2.5 text-xs sm:text-sm text-[#073B30]/85 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => updateField('consent', e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-[#E4E9E3] text-[#064E3B]"
                  />
                  <span>
                    {t.f_consent}{' '}
                    <a
                      href="/privacy"
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate('/privacy');
                      }}
                      className="underline font-semibold text-[#064E3B]"
                    >
                      {t.privacy}
                    </a>
                  </span>
                </label>
                {errors.consent && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.consent}</span>
                  </p>
                )}
              </div>

              {errors.server && (
                <div
                  role="alert"
                  className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700"
                >
                  {errors.server}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="gm-btn-primary flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFC928] px-6 py-4 text-base font-bold text-[#073B30] hover:bg-[#f3bc18] cursor-pointer"
              >
                <span>{submitting ? '…' : t.f_submit}</span>
                <ArrowRight className="gm-arrow-icon w-5 h-5" />
              </button>

              <p className="flex items-center gap-2 text-xs text-[#073B30]/70">
                <ShieldCheck className="w-4 h-4 text-[#064E3B] shrink-0" />
                <span>{t.faq4_a}</span>
              </p>
            </form>
          </Reveal>
        )}

        {step === 2 && (
          <Reveal y={18} className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#064E3B]">
                {t.pay_over}
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#073B30]">
                {t.pay_title}
              </h1>
              <p className="text-base text-[#073B30]/80">{t.pay_body}</p>
            </div>

            <div className="rounded-2xl bg-white border border-[#E4E9E3] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-3 tabular-nums">
                  <s className="text-xl text-[#073B30]/45 font-medium">
                    {formatRupees(CLUB_CONFIG.regularFee)}
                  </s>
                  <span className="text-4xl font-bold text-[#073B30]">
                    {formatRupees(CLUB_CONFIG.fee)}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#064E3B]">
                    {t.plan_badge}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                  <Lock className="h-3.5 w-3.5" />
                  <span>{effectiveStatus}</span>
                </span>
              </div>

              <p className="flex items-center gap-2 text-sm font-medium text-[#064E3B]">
                <BadgeCheck className="w-5 h-5 shrink-0" />
                <span>{t.pay_credit}</span>
              </p>

              <div className="rounded-xl bg-[#F8F8F3] border border-[#E4E9E3] p-4 text-sm font-semibold text-[#073B30] flex items-center justify-between">
                <span>+91 {cleanPhone}</span>
                {currentMember?.memberId && (
                  <span className="text-xs text-[#064E3B]">{currentMember.memberId}</span>
                )}
              </div>

              <fieldset className="space-y-2">
                <legend className="text-xs font-semibold text-[#073B30]">
                  Payment Method
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

              {paymentError && (
                <div
                  role="alert"
                  className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs sm:text-sm font-semibold text-red-700"
                >
                  {paymentError}
                </div>
              )}

              <button
                type="button"
                disabled={paymentBusy}
                onClick={() => handleProcessPayment('success')}
                className="gm-btn-primary flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFC928] px-6 py-4 text-base font-bold text-[#073B30] hover:bg-[#f3bc18] cursor-pointer"
              >
                <CreditCard className="w-5 h-5 text-[#073B30]" />
                <span>
                  {paymentBusy
                    ? 'Verifying Payment…'
                    : `Pay ${formatRupees(CLUB_CONFIG.fee)} & Activate Membership`}
                </span>
              </button>

              <a
                href={buildWhatsAppUrl(
                  `Hi Gharmalak, I just registered (${cleanPhone}). Please send me the ₹499 payment link.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="gm-btn-dark flex w-full items-center justify-center gap-2 rounded-xl bg-[#064E3B] px-6 py-4 text-base font-semibold text-white hover:bg-[#073B30]"
              >
                <MessageCircle className="w-5 h-5 text-[#FFC928]" />
                <span>WhatsApp</span>
              </a>
            </div>
          </Reveal>
        )}

        {step === 3 && (
          <Reveal y={18} className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#064E3B]">
                {t.card_member}
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#073B30]">
                {t.done_title}
              </h1>
            </div>

            <div className="flex justify-center py-2">
              <MalakCard
                name={currentMember?.name || form.name.trim() || 'Gharmalak member'}
                number={currentMember?.memberId || 'GM · NAGPUR'}
                label={t.card_member}
                over={t.card_over}
                variant="emerald"
              />
            </div>

            <div className="rounded-2xl bg-white border border-[#E4E9E3] p-6 sm:p-8 shadow-xs space-y-4">
              <p className="text-base text-[#073B30]/85">{t.done_body}</p>

              {pendingIntent && currentMember && canAccessMemberDeals(currentMember) && (
                <button
                  type="button"
                  onClick={() => onResumeIntent?.(pendingIntent, currentMember)}
                  className="gm-btn-primary flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFC928] px-6 py-4 text-base font-bold text-[#073B30] hover:bg-[#f3bc18] cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#064E3B]" />
                  <span>Continue to {pendingIntent.label}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}

              <a
                href={buildWhatsAppUrl(
                  'Hi Gharmalak, I have joined the club. Please add me to Round 1 updates.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="gm-btn-dark flex w-full items-center justify-center gap-2 rounded-xl bg-[#064E3B] px-6 py-4 text-base font-semibold text-white hover:bg-[#073B30]"
              >
                <MessageCircle className="w-5 h-5 text-[#FFC928]" />
                <span>{t.done_wa}</span>
              </a>

              <a
                href="/round/solar-nagpur"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/round/solar-nagpur');
                }}
                className="gm-btn-primary flex w-full items-center justify-center rounded-xl bg-[#FFC928] px-6 py-3.5 text-sm font-bold text-[#073B30] hover:bg-[#f3bc18]"
              >
                {t.round_cta}
              </a>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
