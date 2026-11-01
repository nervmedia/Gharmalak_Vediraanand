import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Award,
  BadgeCheck,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Droplets,
  FileText,
  Flame,
  Hammer,
  MapPin,
  MessageCircle,
  Paintbrush,
  Shield,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  Users,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react';
import { buildWhatsAppUrl } from '../data/clubData';
import {
  BUSINESS_ENTITY_TYPES,
  BusinessEntityType,
  EXPERIENCE_RANGE_OPTIONS,
  ExperienceRangeOption,
  INSTALLATION_TEAM_OPTIONS,
  InstallationTeamOption,
  VENDOR_BENEFIT_CARDS,
  VENDOR_DISPLAY_SERVICE_CATEGORIES,
  VENDOR_FAQ_ITEMS,
  VENDOR_FORM_CATEGORIES,
  VENDOR_PARTNER_CITIES,
  VENDOR_PROCESS_STEPS,
  VENDOR_PROGRAMME_CONFIG,
  VendorDisplayServiceCategory,
  VendorDocumentSlotKey,
  VendorFormCategoryOption,
  VendorPartnerCity,
  VendorRegistrationFormErrors,
  VendorRegistrationFormInput,
  VendorUploadedDocumentPayload,
  WARRANTY_POLICY_OPTIONS,
  WarrantyPolicyOption,
  createInitialVendorFormState,
  normalizeVendorFormForSubmission,
  validateDocumentFile,
  validateVendorApplicationForm,
} from '../data/forBusinessData';
import {
  VendorApplicationSubmissionResponse,
  submitVendorApplication,
} from '../utils/api';
import { calculateStaggerDelay, getAlternatingDirection } from '../utils/animationHelpers';
import { SupportedCity } from '../utils/location';
import { RoutePath } from './Header';
import {
  FaqAccordionItem,
  HeroEntrance,
  MagneticWrap,
  Reveal,
  WordGroupHeadline,
} from './MotionPrimitives';
import { ResilientImage } from './ResilientImage';

interface ForBusinessViewProps {
  onNavigate: (path: RoutePath, hash?: string) => void;
  selectedCity?: SupportedCity | null;
}

const DOCUMENT_UPLOAD_SLOTS: {
  slot: VendorDocumentSlotKey;
  number: string;
  label: string;
  requirementLabel: string;
  helperText: string;
  multiple?: boolean;
}[] = [
  {
    slot: 'registrationCertificate',
    number: '22',
    label: 'Business Registration Certificate',
    requirementLabel: 'Optional · If applicable',
    helperText: 'Shop Act, Udyam/MSME, Partnership Deed, or Certificate of Incorporation (PDF, JPG, PNG up to 5 MB).',
  },
  {
    slot: 'gstCertificate',
    number: '23',
    label: 'GST Certificate',
    requirementLabel: 'Optional · If applicable',
    helperText: 'Upload your GST registration certificate if your business is GST-registered (PDF, JPG, PNG up to 5 MB).',
  },
  {
    slot: 'panDocument',
    number: '24',
    label: 'Business PAN or Identity Documentation',
    requirementLabel: 'Optional · Handled privately',
    helperText: 'Business PAN or firm identity document. Stored privately for internal verification only (up to 5 MB).',
  },
  {
    slot: 'workPhotographs',
    number: '25',
    label: 'Previous Work Photographs',
    requirementLabel: 'Optional · Recommended',
    helperText: 'Photographs of completed residential installations or projects (JPG, PNG, PDF up to 5 MB each).',
    multiple: true,
  },
  {
    slot: 'companyProfile',
    number: '26',
    label: 'Company Profile / Portfolio',
    requirementLabel: 'Optional',
    helperText: 'Brochure, rate card, or company capability deck (PDF, JPG, PNG up to 5 MB).',
  },
];

function renderCategoryIcon(iconKey: VendorDisplayServiceCategory['iconKey']) {
  const cls = 'h-4 w-4 text-[#064E3B] shrink-0';
  switch (iconKey) {
    case 'solar':
      return <Sun className={cls} />;
    case 'waterproofing':
      return <Droplets className={cls} />;
    case 'painting':
      return <Paintbrush className={cls} />;
    case 'kitchen':
      return <Hammer className={cls} />;
    case 'ac':
      return <Wind className={cls} />;
    case 'security':
      return <Shield className={cls} />;
    case 'electrical':
      return <Zap className={cls} />;
    case 'plumbing':
      return <Wrench className={cls} />;
    case 'purifier':
      return <Sparkles className={cls} />;
    case 'interior':
      return <Building2 className={cls} />;
    case 'pest':
      return <Flame className={cls} />;
    default:
      return <Briefcase className={cls} />;
  }
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function ForBusinessView({ onNavigate, selectedCity }: ForBusinessViewProps) {
  const formSectionRef = useRef<HTMLElement>(null);
  const howSectionRef = useRef<HTMLElement>(null);

  const [form, setForm] = useState<VendorRegistrationFormInput>(() =>
    createInitialVendorFormState(selectedCity)
  );
  const [sameWhatsAppAsMobile, setSameWhatsAppAsMobile] = useState(false);
  const [errors, setErrors] = useState<VendorRegistrationFormErrors>({});
  const [docUploadError, setDocUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] =
    useState<VendorApplicationSubmissionResponse | null>(null);
  const [submittedCategoriesSnapshot, setSubmittedCategoriesSnapshot] = useState<string[]>([]);

  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({
    1: true,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false,
    10: false,
  });

  useEffect(() => {
    if (selectedCity && !form.city) {
      setForm((prev) => ({ ...prev, city: selectedCity as VendorPartnerCity }));
    }
  }, [selectedCity, form.city]);

  const scrollToForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToHowItWorks = () => {
    howSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const updateField = <K extends keyof VendorRegistrationFormInput>(
    key: K,
    value: VendorRegistrationFormInput[K]
  ) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'primaryMobile' && sameWhatsAppAsMobile) {
        next.whatsappNumber = String(value);
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: undefined, server: undefined }));
  };

  const handleToggleSameWhatsApp = (checked: boolean) => {
    setSameWhatsAppAsMobile(checked);
    if (checked) {
      setForm((prev) => ({ ...prev, whatsappNumber: prev.primaryMobile }));
      setErrors((prev) => ({ ...prev, whatsappNumber: undefined }));
    }
  };

  const handleToggleServiceCategory = (category: VendorFormCategoryOption) => {
    setForm((prev) => {
      const exists = prev.serviceCategories.includes(category);
      const nextCategories = exists
        ? prev.serviceCategories.filter((c) => c !== category)
        : [...prev.serviceCategories, category];
      return {
        ...prev,
        serviceCategories: nextCategories,
      };
    });
    setErrors((prev) => ({
      ...prev,
      serviceCategories: undefined,
      otherServiceDescription: undefined,
      server: undefined,
    }));
  };

  const handleSelectCityFromCard = (city: VendorPartnerCity) => {
    updateField('city', city);
    scrollToForm();
  };

  const handleAddSampleLocality = (locality: string) => {
    setForm((prev) => {
      const current = prev.areasServed.trim();
      const parts = current
        ? current
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean)
        : [];
      if (parts.some((p) => p.toLowerCase() === locality.toLowerCase())) {
        return prev;
      }
      const nextAreas = [...parts, locality].join(', ');
      return { ...prev, areasServed: nextAreas };
    });
    setErrors((prev) => ({ ...prev, areasServed: undefined }));
  };

  const handleFileChange = async (
    slot: VendorDocumentSlotKey,
    label: string,
    fileList: FileList | null,
    allowMultiple = false
  ) => {
    if (!fileList || fileList.length === 0) return;
    setDocUploadError(null);

    const files = Array.from(fileList);
    const newDocs: VendorUploadedDocumentPayload[] = [];

    for (const file of files) {
      const check = validateDocumentFile({
        name: file.name,
        type: file.type,
        size: file.size,
      });
      if (!check.valid) {
        setDocUploadError(check.error || 'Invalid file selected.');
        return;
      }
      try {
        const base64Content = await readFileAsBase64(file);
        newDocs.push({
          slot,
          label,
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          sizeBytes: file.size,
          base64Content,
        });
      } catch {
        setDocUploadError(`Could not read "${file.name}". Please try another file.`);
        return;
      }
    }

    setForm((prev) => {
      const filtered = allowMultiple
        ? prev.documents
        : prev.documents.filter((d) => d.slot !== slot);
      return {
        ...prev,
        documents: [...filtered, ...newDocs],
      };
    });
    setErrors((prev) => ({ ...prev, documents: undefined }));
  };

  const handleRemoveDocument = (indexToRemove: number) => {
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const validationErrors = validateVendorApplicationForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    setSubmitting(true);
    try {
      const normalizedPayload = normalizeVendorFormForSubmission(form);
      const result = await submitVendorApplication(normalizedPayload);
      setSubmittedCategoriesSnapshot([...normalizedPayload.serviceCategories]);
      setSubmissionResult(result);
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to submit your application right now. Please try again.';
      setErrors((prev) => ({ ...prev, server: msg }));
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCityMeta = VENDOR_PARTNER_CITIES.find((c) => c.city === form.city);

  return (
    <div className="bg-[#F8F8F3] text-[#073B30] overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#F8F8F3] border-b border-[#E4E9E3] py-12 sm:py-16 lg:py-22">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: B2B Value Proposition & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <HeroEntrance variant="fade-down" y={-14} duration={0.48}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#064E3B]">
                  FOR BUSINESS · VENDOR PARTNERSHIP PROGRAMME
                </p>
              </HeroEntrance>

              <WordGroupHeadline
                text="Grow Your Business with Gharmalak."
                className="text-3xl sm:text-5xl lg:text-[52px] font-bold tracking-tight text-[#073B30] leading-[1.1]"
                baseDelay={0.08}
              />

              <HeroEntrance variant="fade-up" y={18} delay={0.22} duration={0.56}>
                <p className="text-base sm:text-lg text-[#073B30]/80 leading-relaxed max-w-2xl">
                  Connect with homeowners, participate in collective service opportunities, and
                  grow your business through Gharmalak&apos;s homeowners&apos; club.
                </p>
              </HeroEntrance>

              <HeroEntrance variant="scale-up" scale={0.94} delay={0.32} duration={0.48}>
                <div className="flex flex-wrap items-center gap-3.5 pt-1">
                  <MagneticWrap>
                    <button
                      type="button"
                      id="hero-register-business-cta"
                      onClick={scrollToForm}
                      className="gm-btn-primary inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFC928] px-6 py-3.5 text-sm sm:text-base font-semibold text-[#073B30] shadow-xs hover:bg-[#f3bc18] whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>Register Your Business</span>
                      <ArrowRight className="gm-arrow-icon h-4 w-4" />
                    </button>
                  </MagneticWrap>

                  <button
                    type="button"
                    id="hero-how-it-works-cta"
                    onClick={scrollToHowItWorks}
                    className="gm-btn-secondary inline-flex items-center justify-center gap-2 rounded-xl border border-[#064E3B]/25 bg-white px-6 py-3.5 text-sm sm:text-base font-semibold text-[#073B30] hover:bg-[#EAF2E9] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>How It Works</span>
                  </button>
                </div>
              </HeroEntrance>

              {/* Key Programme Highlights (Unboxed Clean Metadata) */}
              <HeroEntrance variant="fade-up" y={14} delay={0.4} duration={0.5}>
                <div className="pt-4 border-t border-[#E4E9E3] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-[#073B30]/80">
                  <div>
                    <strong className="block text-base font-bold text-[#073B30] tabular-nums">
                      Up to {VENDOR_PROGRAMME_CONFIG.maxVendorsPerCity} Vendors / City
                    </strong>
                    <span>Curated selection-based onboarding target</span>
                  </div>
                  <div>
                    <strong className="block text-base font-bold text-[#073B30] tabular-nums">
                      {VENDOR_PROGRAMME_CONFIG.totalCities} Maharashtra Cities
                    </strong>
                    <span>Nagpur, Pune, Nashik, Wardha &amp; more</span>
                  </div>
                  <div>
                    <strong className="block text-base font-bold text-[#073B30] tabular-nums">
                      {VENDOR_PROGRAMME_CONFIG.totalTargetVendors} Partner Target
                    </strong>
                    <span>Across 12 residential service categories</span>
                  </div>
                </div>
              </HeroEntrance>
            </div>

            {/* Right Column: Genuine Photograph of Professional Home-Service Providers */}
            <div className="lg:col-span-5">
              <HeroEntrance
                variant="zoom-out-cinematic"
                scale={1.05}
                delay={0.14}
                duration={0.78}
                className="relative rounded-3xl overflow-hidden border border-[#E4E9E3] bg-white shadow-md"
              >
                <div className="aspect-4/3 w-full overflow-hidden">
                  <ResilientImage
                    src="/images/interior-painting.jpg"
                    alt="Professional home-service contractor working on a residential interior improvement project"
                    loading="eager"
                    className="gm-img-zoom h-full w-full object-cover object-center"
                    containerClassName="h-full w-full"
                  />
                </div>
                <div className="bg-[#064E3B] p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#FFC928]">
                      SELECTION-BASED VENDOR NETWORK
                    </p>
                    <p className="text-sm font-medium text-white/95">
                      Verified residential contractors, authorised dealers &amp; specialist crews
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#FFC928] whitespace-nowrap shrink-0 tabular-nums">
                    7 Cities · 12 Categories
                  </span>
                </div>
              </HeroEntrance>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY PARTNER WITH GHARMALAK? */}
      <section className="bg-white py-16 sm:py-22 border-b border-[#E4E9E3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="slide-left" x={-28} className="max-w-3xl space-y-2 mb-10 sm:mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#064E3B]">
              WHY PARTNER WITH GHARMALAK?
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#073B30]">
              More Homeowners. More Opportunities. Better Business.
            </h2>
            <p className="text-base text-[#073B30]/80">
              Gharmalak organises homeowners by city and season so qualified service partners can
              participate in structured group rounds.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VENDOR_BENEFIT_CARDS.map((card, idx) => {
              const IconComponent =
                idx === 0
                  ? Users
                  : idx === 1
                    ? MapPin
                    : idx === 2
                      ? ClipboardCheck
                      : Award;

              return (
                <Reveal
                  key={card.id}
                  variant="scale-up"
                  scale={0.94}
                  delay={calculateStaggerDelay(idx, 0.05, 0.08, 0.36)}
                  className="gm-card-hover rounded-2xl border border-[#E4E9E3] bg-[#F8F8F3] overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="h-40 w-full overflow-hidden bg-[#EAF2E9]">
                      <ResilientImage
                        src={card.image}
                        alt={card.title}
                        className="gm-img-zoom h-full w-full object-cover"
                        containerClassName="h-full w-full"
                      />
                    </div>
                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-[#064E3B]">
                        <span className="tabular-nums">{card.number}</span>
                        <IconComponent className="h-4 w-4 text-[#064E3B]" />
                      </div>
                      <h3 className="text-lg font-bold text-[#073B30] leading-snug">
                        {card.title}
                      </h3>
                      <p className="text-sm text-[#073B30]/80 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. LIMITED VENDOR PARTNERSHIP PROGRAMME (7 CITIES, UP TO 5 VENDORS PER CITY) */}
      <section className="bg-[#064E3B] text-white py-16 sm:py-22 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <Reveal variant="slide-left" x={-28} className="space-y-2.5 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FFC928]">
                LIMITED VENDOR PARTNERSHIP PROGRAMME
              </p>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
                Only 5 Selected Vendors Per City.
              </h2>
              <p className="text-base text-white/85 leading-relaxed">
                We are building a curated network of home-service professionals across seven
                cities.
              </p>
            </Reveal>

            <Reveal
              variant="slide-right"
              x={28}
              delay={0.08}
              className="rounded-2xl bg-[#04382A] border border-white/15 px-5 py-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#FFC928]">
                INITIAL NETWORK TARGET
              </p>
              <p className="text-lg sm:text-xl font-bold text-white mt-0.5 tabular-nums">
                35 Vendor Partnership Opportunities Across 7 Cities.
              </p>
            </Reveal>
          </div>

          {/* 7 City Target Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VENDOR_PARTNER_CITIES.map((item, idx) => {
              const isSelectedInForm = form.city === item.city;
              return (
                <Reveal
                  key={item.city}
                  variant="scale-up"
                  scale={0.94}
                  delay={calculateStaggerDelay(idx, 0.04, 0.06, 0.38)}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectCityFromCard(item.city)}
                    className={`w-full text-left rounded-2xl p-5 transition-all duration-200 border cursor-pointer flex flex-col justify-between min-h-[148px] ${
                      isSelectedInForm
                        ? 'bg-white text-[#073B30] border-[#FFC928] shadow-md'
                        : 'bg-[#04382A]/90 text-white border-white/15 hover:border-[#FFC928]/60 hover:bg-[#04382A]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                            isSelectedInForm ? 'text-[#064E3B]' : 'text-[#FFC928]'
                          }`}
                        >
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span>{item.regionLabel}</span>
                        </span>
                        <span
                          className={`text-[11px] font-mono font-semibold ${
                            isSelectedInForm ? 'text-[#073B30]/60' : 'text-white/60'
                          }`}
                        >
                          {item.cityCode}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold tracking-tight leading-snug">
                        {item.city}
                      </h3>
                    </div>

                    <div className="pt-4 mt-3 border-t border-current/10 flex items-center justify-between text-xs font-semibold tabular-nums">
                      <span>{item.targetLabel}</span>
                      <span
                        className={
                          isSelectedInForm ? 'text-[#064E3B] underline' : 'text-[#FFC928]'
                        }
                      >
                        {isSelectedInForm ? 'Selected in form' : 'Apply for city →'}
                      </span>
                    </div>
                  </button>
                </Reveal>
              );
            })}

            {/* 8th Grid Slot: Selection Policy Summary Card */}
            <Reveal
              variant="scale-up"
              scale={0.94}
              delay={0.38}
              className="rounded-2xl p-5 bg-[#F8F8F3] text-[#073B30] border border-[#E4E9E3] flex flex-col justify-between min-h-[148px]"
            >
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#064E3B]">
                  SELECTION-BASED ONBOARDING
                </p>
                <p className="text-xs text-[#073B30]/85 leading-relaxed">
                  These figures represent our initial maximum onboarding targets (up to 5 selected
                  vendors per city). Submitting an application does not guarantee automatic
                  partnership approval.
                </p>
              </div>
              <button
                type="button"
                onClick={scrollToForm}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#064E3B] hover:underline cursor-pointer"
              >
                <span>Start vendor application</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 4. SERVICE CATEGORIES */}
      <section className="bg-[#F8F8F3] py-16 sm:py-22 border-b border-[#E4E9E3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12">
            <Reveal variant="slide-left" x={-28} className="space-y-2 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#064E3B]">
                HOME-SERVICE CATEGORIES
              </p>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#073B30]">
                What Services Can You Register For?
              </h2>
              <p className="text-base text-[#073B30]/80">
                Click any category card below to pre-select it in your vendor application, or
                choose multiple categories directly in Section C of the form.
              </p>
            </Reveal>

            <Reveal variant="slide-right" x={24} delay={0.08}>
              <button
                type="button"
                onClick={scrollToForm}
                className="gm-btn-secondary inline-flex items-center gap-2 rounded-xl bg-[#EAF2E9] hover:bg-[#dce8da] px-4 py-2.5 text-sm font-semibold text-[#064E3B] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Go to Registration Form</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {VENDOR_DISPLAY_SERVICE_CATEGORIES.map((cat, idx) => {
              const isSelected = form.serviceCategories.includes(cat.formCategory);
              return (
                <Reveal
                  key={cat.id}
                  variant="scale-up"
                  scale={0.95}
                  delay={calculateStaggerDelay(idx, 0.03, 0.04, 0.36)}
                  className={`rounded-2xl border bg-white overflow-hidden flex flex-col justify-between transition-all duration-200 ${
                    isSelected
                      ? 'border-[#064E3B] ring-2 ring-[#064E3B]/15 shadow-sm'
                      : 'border-[#E4E9E3] hover:border-[#064E3B]/40'
                  }`}
                >
                  <div>
                    <div className="h-36 w-full overflow-hidden bg-[#EAF2E9]">
                      <ResilientImage
                        src={cat.image}
                        alt={cat.title}
                        fallbackLabel={cat.title}
                        className="gm-img-zoom h-full w-full object-cover"
                        containerClassName="h-full w-full"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-[#064E3B]">
                          {cat.formCategory}
                        </span>
                        {renderCategoryIcon(cat.iconKey)}
                      </div>
                      <h3 className="text-base font-bold text-[#073B30] leading-snug">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-[#073B30]/75 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-2">
                    <button
                      type="button"
                      onClick={() => handleToggleServiceCategory(cat.formCategory)}
                      className={`w-full rounded-xl px-3 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#064E3B] text-white'
                          : 'bg-[#F8F8F3] text-[#073B30] hover:bg-[#EAF2E9]'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Selected in Application</span>
                        </>
                      ) : (
                        <span>Select Category</span>
                      )}
                    </button>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. HOW PARTNERSHIP WORKS */}
      <section
        id="how-partnership-works"
        ref={howSectionRef}
        className="bg-white py-16 sm:py-22 border-b border-[#E4E9E3] scroll-mt-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="slide-left" x={-28} className="max-w-3xl space-y-2 mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#064E3B]">
              PARTNERSHIP PROCESS
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#073B30]">
              How to Become a Gharmalak Partner?
            </h2>
            <p className="text-base text-[#073B30]/80">
              Our four-step evaluation ensures homeowners work with reliable, accountable local
              businesses. Submitting an application is the first step and does not guarantee
              automatic approval.
            </p>
          </Reveal>

          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Desktop horizontal connector line */}
            <div
              aria-hidden="true"
              className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-[2px] bg-[#DCE8DA] z-0"
            />

            {VENDOR_PROCESS_STEPS.map((step, idx) => {
              const StepIcon =
                idx === 0
                  ? FileText
                  : idx === 1
                    ? ClipboardCheck
                    : idx === 2
                      ? ShieldCheck
                      : BadgeCheck;
              const direction = getAlternatingDirection(idx);

              return (
                <Reveal
                  key={step.stepNumber}
                  variant={direction}
                  x={idx % 2 === 0 ? -20 : 20}
                  delay={calculateStaggerDelay(idx, 0.05, 0.08, 0.36)}
                  className="relative z-10 rounded-2xl border border-[#E4E9E3] bg-[#F8F8F3] p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#064E3B] text-white font-bold text-sm tabular-nums shadow-2xs">
                        {step.stepNumber}
                      </span>
                      <StepIcon className="h-5 w-5 text-[#064E3B]" />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#064E3B]">
                        Step {idx + 1}
                      </p>
                      <h3 className="text-lg font-bold text-[#073B30]">{step.title}</h3>
                      <p className="text-sm text-[#073B30]/80 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. VENDOR REGISTRATION FORM */}
      <section
        id="vendor-registration-form"
        ref={formSectionRef}
        className="bg-[#F8F8F3] py-16 sm:py-24 border-b border-[#E4E9E3] scroll-mt-16"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="fade-up" y={18} className="space-y-2 mb-8 sm:mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#064E3B]">
              OFFICIAL PARTNER APPLICATION
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#073B30]">
              Register Your Business
            </h2>
            <p className="text-base text-[#073B30]/80">
              Tell us about your business. Our team will review your application and contact you
              regarding potential partnership opportunities.
            </p>
          </Reveal>

          {submissionResult ? (
            <Reveal
              variant="scale-up"
              scale={0.96}
              className="rounded-3xl border border-[#064E3B]/25 bg-white p-6 sm:p-10 shadow-sm"
            >
              <div id="vendor-application-confirmation" className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[#EAF2E9] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-7 w-7 text-[#064E3B]" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#064E3B]">
                    APPLICATION SAVED · {submissionResult.applicationStatus.toUpperCase()}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#073B30]">
                    Thank You for Registering with Gharmalak!
                  </h3>
                  <p className="text-sm sm:text-base text-[#073B30]/80 leading-relaxed">
                    Your business application has been submitted successfully. Our team will review
                    your details and contact you if your business is shortlisted.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl bg-[#F8F8F3] border border-[#E4E9E3] p-5">
                <div>
                  <span className="block text-xs text-[#073B30]/70">Application Reference</span>
                  <strong
                    id="vendor-application-ref"
                    className="text-base font-mono font-bold text-[#064E3B] tabular-nums"
                  >
                    {submissionResult.applicationId}
                  </strong>
                </div>
                <div>
                  <span className="block text-xs text-[#073B30]/70">Registered City</span>
                  <strong className="text-sm font-semibold text-[#073B30]">
                    {submissionResult.city}
                  </strong>
                </div>
                <div>
                  <span className="block text-xs text-[#073B30]/70">Application Status</span>
                  <strong className="text-sm font-semibold text-[#073B30]">
                    {submissionResult.applicationStatus}
                  </strong>
                </div>
              </div>

              {submittedCategoriesSnapshot.length > 0 && (
                <div className="space-y-1.5 text-xs text-[#073B30]/80">
                  <span className="font-semibold text-[#073B30]">
                    Registered Service Categories:
                  </span>{' '}
                  <span>{submittedCategoriesSnapshot.join(' · ')}</span>
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href={buildWhatsAppUrl(
                    `Hi Gharmalak Partnership Team, I have submitted my vendor application (${submissionResult.applicationId}) for ${submissionResult.businessName} in ${submissionResult.city}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gm-btn-dark inline-flex items-center gap-2 rounded-xl bg-[#064E3B] px-5 py-3 text-sm font-semibold text-white hover:bg-[#073B30]"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Share Reference on WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setSubmissionResult(null);
                    setForm(createInitialVendorFormState(selectedCity));
                    setSameWhatsAppAsMobile(false);
                    setErrors({});
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#E4E9E3] bg-[#F8F8F3] px-5 py-3 text-sm font-semibold text-[#073B30] hover:bg-[#EAF2E9] cursor-pointer"
                >
                  <span>Submit Another Business</span>
                </button>
              </div>
              </div>
            </Reveal>
          ) : (
            <form
              id="vendor-application-form"
              onSubmit={handleSubmitApplication}
              noValidate
              className="space-y-8"
            >
              {Object.keys(errors).length > 0 && (
                <div
                  role="alert"
                  className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 flex items-start gap-3"
                >
                  <AlertCircle className="h-5 w-5 text-red-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">
                      Please complete the highlighted required fields before submitting:
                    </p>
                    <p className="text-xs text-red-800">
                      {errors.server ||
                        Object.values(errors).find(Boolean) ||
                        'Check required inputs below.'}
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION A — BUSINESS INFORMATION */}
              <div className="rounded-2xl border border-[#E4E9E3] bg-white p-6 sm:p-8 space-y-6 shadow-2xs">
                <div className="border-b border-[#E4E9E3] pb-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#064E3B]">
                    SECTION A
                  </p>
                  <h3 className="text-xl font-bold text-[#073B30] mt-0.5">
                    Business Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* 1. Business / Company Name */}
                  <div>
                    <label
                      htmlFor="vendor-business-name"
                      className="block text-xs font-semibold text-[#073B30] mb-1.5"
                    >
                      1. Business / Company Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="vendor-business-name"
                      type="text"
                      required
                      value={form.businessName}
                      onChange={(e) => updateField('businessName', e.target.value)}
                      placeholder="e.g. SuryaKiran Solar & Electricals Pvt Ltd"
                      className="gm-input w-full rounded-xl border border-[#CFE0CF] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                    />
                    {errors.businessName && (
                      <p className="mt-1 text-xs text-red-600">{errors.businessName}</p>
                    )}
                  </div>

                  {/* 2. Business Owner / Contact Person Name */}
                  <div>
                    <label
                      htmlFor="vendor-contact-person"
                      className="block text-xs font-semibold text-[#073B30] mb-1.5"
                    >
                      2. Business Owner / Contact Person Name{' '}
                      <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="vendor-contact-person"
                      type="text"
                      required
                      value={form.contactPersonName}
                      onChange={(e) => updateField('contactPersonName', e.target.value)}
                      placeholder="e.g. Rajesh Deshmukh"
                      className="gm-input w-full rounded-xl border border-[#CFE0CF] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                    />
                    {errors.contactPersonName && (
                      <p className="mt-1 text-xs text-red-600">{errors.contactPersonName}</p>
                    )}
                  </div>

                  {/* 3. Business Type */}
                  <div>
                    <label
                      htmlFor="vendor-business-type"
                      className="block text-xs font-semibold text-[#073B30] mb-1.5"
                    >
                      3. Business Type <span className="text-red-600">*</span>
                    </label>
                    <select
                      id="vendor-business-type"
                      required
                      value={form.businessType}
                      onChange={(e) =>
                        updateField('businessType', e.target.value as BusinessEntityType | '')
                      }
                      className="gm-input w-full rounded-xl border border-[#CFE0CF] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                    >
                      <option value="">Select business type</option>
                      {BUSINESS_ENTITY_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {errors.businessType && (
                      <p className="mt-1 text-xs text-red-600">{errors.businessType}</p>
                    )}
                  </div>

                  {/* 4. Year of Establishment */}
                  <div>
                    <label
                      htmlFor="vendor-year-established"
                      className="block text-xs font-semibold text-[#073B30] mb-1.5"
                    >
                      4. Year of Establishment <span className="text-[#073B30]/60">(Optional)</span>
                    </label>
                    <input
                      id="vendor-year-established"
                      type="number"
                      min="1950"
                      max={new Date().getFullYear()}
                      value={form.yearOfEstablishment}
                      onChange={(e) => updateField('yearOfEstablishment', e.target.value)}
                      placeholder="e.g. 2018"
                      className="gm-input w-full rounded-xl border border-[#CFE0CF] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                    />
                    {errors.yearOfEstablishment && (
                      <p className="mt-1 text-xs text-red-600">{errors.yearOfEstablishment}</p>
                    )}
                  </div>

                  {/* 5. Business Email Address */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="vendor-email"
                      className="block text-xs font-semibold text-[#073B30] mb-1.5"
                    >
                      5. Business Email Address <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="vendor-email"
                      type="email"
                      required
                      value={form.businessEmail}
                      onChange={(e) => updateField('businessEmail', e.target.value)}
                      placeholder="e.g. projects@yourcompany.in"
                      className="gm-input w-full rounded-xl border border-[#CFE0CF] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                    />
                    {errors.businessEmail && (
                      <p className="mt-1 text-xs text-red-600">{errors.businessEmail}</p>
                    )}
                  </div>

                  {/* 6. Primary Mobile Number */}
                  <div>
                    <label
                      htmlFor="vendor-primary-mobile"
                      className="block text-xs font-semibold text-[#073B30] mb-1.5"
                    >
                      6. Primary Mobile Number <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="vendor-primary-mobile"
                      type="tel"
                      required
                      value={form.primaryMobile}
                      onChange={(e) => updateField('primaryMobile', e.target.value)}
                      placeholder="10-digit mobile number"
                      className="gm-input w-full rounded-xl border border-[#CFE0CF] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                    />
                    {errors.primaryMobile && (
                      <p className="mt-1 text-xs text-red-600">{errors.primaryMobile}</p>
                    )}
                  </div>

                  {/* 7. WhatsApp Number */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="vendor-whatsapp-number"
                        className="block text-xs font-semibold text-[#073B30]"
                      >
                        7. WhatsApp Number <span className="text-red-600">*</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 text-[11px] text-[#064E3B] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sameWhatsAppAsMobile}
                          onChange={(e) => handleToggleSameWhatsApp(e.target.checked)}
                          className="rounded border-[#CFE0CF] text-[#064E3B] focus:ring-[#064E3B]"
                        />
                        <span>Same as primary</span>
                      </label>
                    </div>
                    <input
                      id="vendor-whatsapp-number"
                      type="tel"
                      required
                      value={form.whatsappNumber}
                      onChange={(e) => updateField('whatsappNumber', e.target.value)}
                      placeholder="10-digit WhatsApp number"
                      className="gm-input w-full rounded-xl border border-[#CFE0CF] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                    />
                    {errors.whatsappNumber && (
                      <p className="mt-1 text-xs text-red-600">{errors.whatsappNumber}</p>
                    )}
                  </div>

                  {/* 8. Business Website */}
                  <div>
                    <label
                      htmlFor="vendor-website"
                      className="block text-xs font-semibold text-[#073B30] mb-1.5"
                    >
                      8. Business Website <span className="text-[#073B30]/60">(Optional)</span>
                    </label>
                    <input
                      id="vendor-website"
                      type="url"
                      value={form.businessWebsite}
                      onChange={(e) => updateField('businessWebsite', e.target.value)}
                      placeholder="https://www.yourbusiness.in"
                      className="gm-input w-full rounded-xl border border-[#CFE0CF] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* 9. Instagram / Facebook Business Profile */}
                  <div>
                    <label
                      htmlFor="vendor-social-profile"
                      className="block text-xs font-semibold text-[#073B30] mb-1.5"
                    >
                      9. Instagram / Facebook Business Profile{' '}
                      <span className="text-[#073B30]/60">(Optional)</span>
                    </label>
                    <input
                      id="vendor-social-profile"
                      type="text"
                      value={form.socialProfile}
                      onChange={(e) => updateField('socialProfile', e.target.value)}
                      placeholder="@yourbusiness or profile link"
                      className="gm-input w-full rounded-xl border border-[#CFE0CF] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B — LOCATION DETAILS */}
              <div className="rounded-2xl border border-[#E4E9E3] bg-white p-6 sm:p-8 space-y-6 shadow-2xs">
                <div className="border-b border-[#E4E9E3] pb-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#064E3B]">
                    SECTION B
                  </p>
                  <h3 className="text-xl font-bold text-[#073B30] mt-0.5">Location Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* 10. Select Your City */}
                  <div>
                    <label
                      htmlFor="vendor-city"
                      className="block text-xs font-semibold text-[#073B30] mb-1.5"
                    >
                      10. Select Your City <span className="text-red-600">*</span>
                    </label>
                    <select
                      id="vendor-city"
                      required
                      value={form.city}
                      onChange={(e) =>
                        updateField('city', e.target.value as VendorPartnerCity | '')
                      }
                      className="gm-input w-full rounded-xl border border-[#CFE0CF] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                    >
                      <option value="">Select your city</option>
                      {VENDOR_PARTNER_CITIES.map((c) => (
                        <option key={c.city} value={c.city}>
                          {c.city}
                        </option>
                      ))}
                    </select>
                    {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
                  </div>

                  {/* 12. PIN Code */}
                  <div>
                    <label
                      htmlFor="vendor-pincode"
                      className="block text-xs font-semibold text-[#073B30] mb-1.5"
                    >
                      12. PIN Code <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="vendor-pincode"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={form.pinCode}
                      onChange={(e) => updateField('pinCode', e.target.value)}
                      placeholder="6-digit PIN code (e.g. 440010)"
                      className="gm-input w-full rounded-xl border border-[#CFE0CF] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                    />
                    {errors.pinCode && (
                      <p className="mt-1 text-xs text-red-600">{errors.pinCode}</p>
                    )}
                  </div>

                  {/* 11. Business Address */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="vendor-address"
                      className="block text-xs font-semibold text-[#073B30] mb-1.5"
                    >
                      11. Business Address <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="vendor-address"
                      type="text"
                      required
                      value={form.businessAddress}
                      onChange={(e) => updateField('businessAddress', e.target.value)}
                      placeholder="Shop / Office No., Building, Street, Locality"
                      className="gm-input w-full rounded-xl border border-[#CFE0CF] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                    />
                    {errors.businessAddress && (
                      <p className="mt-1 text-xs text-red-600">{errors.businessAddress}</p>
                    )}
                  </div>

                  {/* 13. Areas or localities served */}
                  <div className="sm:col-span-2 space-y-2">
                    <label
                      htmlFor="vendor-areas-served"
                      className="block text-xs font-semibold text-[#073B30]"
                    >
                      13. Areas or Localities Served <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="vendor-areas-served"
                      type="text"
                      required
                      value={form.areasServed}
                      onChange={(e) => updateField('areasServed', e.target.value)}
                      placeholder="List multiple localities separated by commas (e.g. Dharampeth, Pratap Nagar, Manish Nagar)"
                      className="gm-input w-full rounded-xl border border-[#CFE0CF] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                    />
                    {selectedCityMeta && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[11px] text-[#073B30]/65">
                          Quick add in {selectedCityMeta.city}:
                        </span>
                        {selectedCityMeta.sampleLocalities.map((loc) => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => handleAddSampleLocality(loc)}
                            className="rounded-lg bg-[#EAF2E9] hover:bg-[#dce8da] px-2.5 py-1 text-[11px] font-medium text-[#064E3B] cursor-pointer"
                          >
                            + {loc}
                          </button>
                        ))}
                      </div>
                    )}
                    {errors.areasServed && (
                      <p className="mt-1 text-xs text-red-600">{errors.areasServed}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION C — SERVICE CATEGORIES */}
              <div className="rounded-2xl border border-[#E4E9E3] bg-white p-6 sm:p-8 space-y-5 shadow-2xs">
                <div className="border-b border-[#E4E9E3] pb-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#064E3B]">
                    SECTION C
                  </p>
                  <h3 className="text-xl font-bold text-[#073B30] mt-0.5">
                    14. Select Your Business Categories <span className="text-red-600">*</span>
                  </h3>
                  <p className="text-xs text-[#073B30]/75 mt-1">
                    Select one or more home-service categories offered by your business.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {VENDOR_FORM_CATEGORIES.map((category) => {
                    const checked = form.serviceCategories.includes(category);
                    return (
                      <label
                        key={category}
                        className={`flex items-center gap-3 rounded-xl border p-3.5 text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
                          checked
                            ? 'border-[#064E3B] bg-[#EAF2E9] text-[#073B30] font-semibold'
                            : 'border-[#E4E9E3] bg-[#F8F8F3] text-[#073B30]/85 hover:border-[#064E3B]/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleServiceCategory(category)}
                          className="h-4 w-4 rounded border-[#CFE0CF] text-[#064E3B] focus:ring-[#064E3B]"
                        />
                        <span>{category}</span>
                      </label>
                    );
                  })}
                </div>

                {errors.serviceCategories && (
                  <p className="text-xs text-red-600">{errors.serviceCategories}</p>
                )}

                {form.serviceCategories.includes('Other') && (
                  <div className="pt-2">
                    <label
                      htmlFor="vendor-other-service"
                      className="block text-xs font-semibold text-[#073B30] mb-1.5"
                    >
                      Specify Your Other Service Category <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="vendor-other-service"
                      type="text"
                      required
                      value={form.otherServiceDescription}
                      onChange={(e) => updateField('otherServiceDescription', e.target.value)}
                      placeholder="e.g. uPVC Windows, Solar Water Heaters, Rainwater Harvesting"
                      className="gm-input w-full rounded-xl border border-[#CFE0CF] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                    />
                    {errors.otherServiceDescription && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.otherServiceDescription}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION D — BUSINESS EXPERIENCE */}
              <div className="rounded-2xl border border-[#E4E9E3] bg-white p-6 sm:p-8 space-y-6 shadow-2xs">
                <div className="border-b border-[#E4E9E3] pb-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#064E3B]">
                    SECTION D
                  </p>
                  <h3 className="text-xl font-bold text-[#073B30] mt-0.5">Business Experience</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* 15. Years of Experience */}
                  <div>
                    <label
                      htmlFor="vendor-experience"
                      className="block text-xs font-semibold text-[#073B30] mb-1.5"
                    >
                      15. Years of Experience <span className="text-red-600">*</span>
                    </label>
                    <select
                      id="vendor-experience"
                      required
                      value={form.yearsOfExperience}
                      onChange={(e) =>
                        updateField(
                          'yearsOfExperience',
                          e.target.value as ExperienceRangeOption | ''
                        )
                      }
                      className="gm-input w-full rounded-xl border border-[#CFE0CF] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                    >
                      <option value="">Select experience</option>
                      {EXPERIENCE_RANGE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    {errors.yearsOfExperience && (
                      <p className="mt-1 text-xs text-red-600">{errors.yearsOfExperience}</p>
                    )}
                  </div>

                  {/* 16. Approximate Number of Projects Completed */}
                  <div>
                    <label
                      htmlFor="vendor-projects-completed"
                      className="block text-xs font-semibold text-[#073B30] mb-1.5"
                    >
                      16. Approx. Projects Completed{' '}
                      <span className="text-[#073B30]/60">(Optional)</span>
                    </label>
                    <input
                      id="vendor-projects-completed"
                      type="text"
                      value={form.completedProjectsCount}
                      onChange={(e) => updateField('completedProjectsCount', e.target.value)}
                      placeholder="e.g. 120+ residential sites"
                      className="gm-input w-full rounded-xl border border-[#CFE0CF] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* 17. Number of Employees / Installation Teams */}
                  <div>
                    <label
                      htmlFor="vendor-team-size"
                      className="block text-xs font-semibold text-[#073B30] mb-1.5"
                    >
                      17. Employees / Installation Teams{' '}
                      <span className="text-[#073B30]/60">(Optional)</span>
                    </label>
                    <input
                      id="vendor-team-size"
                      type="text"
                      value={form.teamSizeCount}
                      onChange={(e) => updateField('teamSizeCount', e.target.value)}
                      placeholder="e.g. 14 staff / 3 crews"
                      className="gm-input w-full rounded-xl border border-[#CFE0CF] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* 18. Brief Description of Your Business */}
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="vendor-description"
                      className="block text-xs font-semibold text-[#073B30] mb-1.5"
                    >
                      18. Brief Description of Your Business <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      id="vendor-description"
                      rows={3}
                      required
                      value={form.businessDescription}
                      onChange={(e) => updateField('businessDescription', e.target.value)}
                      placeholder="Describe your core services, certifications, typical residential project capacity, and quality standards..."
                      className="gm-input w-full rounded-xl border border-[#CFE0CF] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                    />
                    {errors.businessDescription && (
                      <p className="mt-1 text-xs text-red-600">{errors.businessDescription}</p>
                    )}
                  </div>

                  {/* 19. Brands You Work With */}
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="vendor-brands"
                      className="block text-xs font-semibold text-[#073B30] mb-1.5"
                    >
                      19. Brands You Work With <span className="text-[#073B30]/60">(Optional)</span>
                    </label>
                    <input
                      id="vendor-brands"
                      type="text"
                      value={form.brandsWorkedWith}
                      onChange={(e) => updateField('brandsWorkedWith', e.target.value)}
                      placeholder="e.g. Tata Power Solar, Waaree, Asian Paints, Dr. Fixit, Daikin, Hikvision"
                      className="gm-input w-full rounded-xl border border-[#CFE0CF] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* 20. Do You Provide Service Warranty? */}
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="vendor-warranty"
                      className="block text-xs font-semibold text-[#073B30] mb-1.5"
                    >
                      20. Do You Provide Service Warranty?
                    </label>
                    <select
                      id="vendor-warranty"
                      value={form.providesWarranty}
                      onChange={(e) =>
                        updateField('providesWarranty', e.target.value as WarrantyPolicyOption | '')
                      }
                      className="gm-input w-full rounded-xl border border-[#CFE0CF] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                    >
                      <option value="">Select option</option>
                      {WARRANTY_POLICY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 21. Do You Have Your Own Installation / Service Team? */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="vendor-installation-team"
                      className="block text-xs font-semibold text-[#073B30] mb-1.5"
                    >
                      21. Do You Have Your Own Installation / Service Team?
                    </label>
                    <select
                      id="vendor-installation-team"
                      value={form.installationTeamType}
                      onChange={(e) =>
                        updateField(
                          'installationTeamType',
                          e.target.value as InstallationTeamOption | ''
                        )
                      }
                      className="gm-input w-full rounded-xl border border-[#CFE0CF] bg-[#F8F8F3] px-3.5 py-2.5 text-sm text-[#073B30] focus:border-[#064E3B] focus:bg-white focus:outline-none"
                    >
                      <option value="">Select option</option>
                      {INSTALLATION_TEAM_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION E — DOCUMENTS AND PROJECT PORTFOLIO */}
              <div className="rounded-2xl border border-[#E4E9E3] bg-white p-6 sm:p-8 space-y-6 shadow-2xs">
                <div className="border-b border-[#E4E9E3] pb-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#064E3B]">
                    SECTION E
                  </p>
                  <h3 className="text-xl font-bold text-[#073B30] mt-0.5">
                    Documents and Project Portfolio
                  </h3>
                  <p className="text-xs text-[#073B30]/75 mt-1">
                    All document uploads below are optional at the initial application stage (PDF,
                    JPG, JPEG, or PNG up to 5 MB per file). Uploaded files are stored privately for
                    internal review and are never exposed publicly.
                  </p>
                </div>

                {docUploadError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
                    {docUploadError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DOCUMENT_UPLOAD_SLOTS.map((slotItem) => {
                    const attachedForSlot = form.documents.filter((d) => d.slot === slotItem.slot);
                    return (
                      <div
                        key={slotItem.slot}
                        className="rounded-xl border border-[#E4E9E3] bg-[#F8F8F3] p-4 flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[#073B30]">
                              {slotItem.number}. {slotItem.label}
                            </span>
                            <span className="text-[11px] font-medium text-[#064E3B]">
                              {slotItem.requirementLabel}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#073B30]/70 leading-relaxed">
                            {slotItem.helperText}
                          </p>
                        </div>

                        <div className="space-y-2 pt-1">
                          <label className="inline-flex items-center gap-2 rounded-lg border border-[#064E3B]/25 bg-white hover:bg-[#EAF2E9] px-3 py-2 text-xs font-semibold text-[#064E3B] cursor-pointer transition-colors">
                            <Upload className="h-3.5 w-3.5" />
                            <span>
                              {attachedForSlot.length > 0 && !slotItem.multiple
                                ? 'Replace File'
                                : 'Choose File'}
                            </span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                              multiple={Boolean(slotItem.multiple)}
                              onChange={(e) =>
                                handleFileChange(
                                  slotItem.slot,
                                  slotItem.label,
                                  e.target.files,
                                  slotItem.multiple
                                )
                              }
                              className="sr-only"
                            />
                          </label>

                          {attachedForSlot.length > 0 && (
                            <ul className="space-y-1">
                              {form.documents.map((doc, docIndex) => {
                                if (doc.slot !== slotItem.slot) return null;
                                return (
                                  <li
                                    key={`${doc.slot}-${doc.fileName}-${docIndex}`}
                                    className="flex items-center justify-between gap-2 rounded-lg bg-white border border-[#E4E9E3] px-2.5 py-1.5 text-[11px] text-[#073B30]"
                                  >
                                    <span className="truncate font-medium">
                                      {doc.fileName} ({Math.round(doc.sizeBytes / 1024)} KB)
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveDocument(docIndex)}
                                      aria-label={`Remove ${doc.fileName}`}
                                      className="text-red-600 hover:text-red-800 p-0.5 cursor-pointer shrink-0"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION F — FINAL DECLARATION */}
              <div className="rounded-2xl border border-[#E4E9E3] bg-white p-6 sm:p-8 space-y-5 shadow-2xs">
                <div className="border-b border-[#E4E9E3] pb-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#064E3B]">
                    SECTION F
                  </p>
                  <h3 className="text-xl font-bold text-[#073B30] mt-0.5">Final Declaration</h3>
                </div>

                <div className="space-y-3 text-sm text-[#073B30]">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      id="vendor-confirm-accurate"
                      type="checkbox"
                      checked={form.confirmAccurate}
                      onChange={(e) => updateField('confirmAccurate', e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-[#CFE0CF] text-[#064E3B] focus:ring-[#064E3B]"
                    />
                    <span>I confirm that the information provided is accurate.</span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      id="vendor-agree-contact"
                      type="checkbox"
                      checked={form.agreeContact}
                      onChange={(e) => updateField('agreeContact', e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-[#CFE0CF] text-[#064E3B] focus:ring-[#064E3B]"
                    />
                    <span>
                      I agree to be contacted by the Gharmalak team regarding my vendor application.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      id="vendor-agree-terms"
                      type="checkbox"
                      checked={form.agreeTerms}
                      onChange={(e) => updateField('agreeTerms', e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-[#CFE0CF] text-[#064E3B] focus:ring-[#064E3B]"
                    />
                    <span>
                      I have read and agree to the applicable{' '}
                      <a
                        href="/privacy"
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate('/privacy');
                        }}
                        className="font-semibold text-[#064E3B] underline"
                      >
                        Privacy Policy and Terms
                      </a>
                      .
                    </span>
                  </label>
                </div>

                {errors.declarations && (
                  <p className="text-xs text-red-600">{errors.declarations}</p>
                )}

                <div className="pt-2">
                  <button
                    id="submit-vendor-application-btn"
                    type="submit"
                    disabled={submitting}
                    className="gm-btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFC928] px-8 py-4 text-base font-bold text-[#073B30] shadow-xs hover:bg-[#f3bc18] disabled:opacity-60 cursor-pointer"
                  >
                    <span>
                      {submitting ? 'Submitting Vendor Application...' : 'Submit Vendor Application'}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="bg-white py-16 sm:py-22 border-b border-[#E4E9E3]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="slide-left" x={-24} className="space-y-2 mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#064E3B]">
              VENDOR PARTNERSHIP FAQS
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#073B30]">
              Frequently Asked Questions
            </h2>
          </Reveal>

          <div className="space-y-3">
            {VENDOR_FAQ_ITEMS.map((item, idx) => (
              <Reveal
                key={item.id}
                variant="fade-up"
                y={12}
                delay={calculateStaggerDelay(idx, 0.02, 0.04, 0.3)}
              >
                <FaqAccordionItem
                  id={item.id}
                  question={`${item.id}. ${item.question}`}
                  answer={item.answer}
                  isOpen={Boolean(openFaqs[item.id])}
                  onToggle={() =>
                    setOpenFaqs((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                  }
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FINAL CALL TO ACTION */}
      <section className="bg-[#064E3B] text-white py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <Reveal variant="scale-up" scale={0.95} className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FFC928]">
              PARTNER WITH GHARMALAK
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Ready to Grow Your Business with Gharmalak?
            </h2>
            <p className="text-base sm:text-lg text-white/85 max-w-2xl mx-auto">
              Register your business and explore opportunities to serve homeowners in your city.
            </p>
          </Reveal>

          <Reveal variant="fade-up" y={14} delay={0.1}>
            <MagneticWrap>
              <button
                type="button"
                id="final-apply-vendor-partnership-btn"
                onClick={scrollToForm}
                className="gm-btn-primary inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFC928] px-7 py-4 text-sm sm:text-base font-bold text-[#073B30] shadow-sm hover:bg-[#f3bc18] cursor-pointer"
              >
                <span>Apply for Vendor Partnership</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </MagneticWrap>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
