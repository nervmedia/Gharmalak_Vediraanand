import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowRight,
  BatteryCharging,
  Building,
  Calendar,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Coffee,
  Compass,
  Download,
  Eye,
  FileText,
  Fingerprint,
  Home,
  Info,
  Layers,
  MapPin,
  Maximize2,
  MessageCircle,
  Phone,
  PhoneCall,
  RotateCcw,
  Ruler,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Sun,
  Trees,
  Video,
  Zap,
  ZoomIn,
} from 'lucide-react';
import {
  VEDIRA_ANAND_DATA,
  ApartmentConfig,
  GalleryItem,
} from '../../data/vediraAnandData';
import { MemberProfile } from '../../data/membershipData';
import { RoutePath } from '../Header';
import { ResilientImage } from '../ResilientImage';
import { VediraGalleryModal } from './VediraGalleryModal';
import { submitPropertyEnquiry } from '../../utils/api';
import { buildWhatsAppUrl } from '../../data/clubData';

interface VediraAnandViewProps {
  onNavigate: (path: RoutePath, hash?: string) => void;
  member?: MemberProfile | null;
}

export function VediraAnandView({ onNavigate, member = null }: VediraAnandViewProps) {
  // Gallery state
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState<string>('All');
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [galleryModalIndex, setGalleryModalIndex] = useState(0);

  // Configuration Tabs
  const [activeConfigTab, setActiveConfigTab] = useState<'2bhk' | '3bhk'>('2bhk');
  const [viewMode2Bhk, setViewMode2Bhk] = useState<'floorplan' | 'isometric'>('floorplan');

  // Enquiry Form State
  const [fullName, setFullName] = useState(member?.name || '');
  const [mobileNumber, setMobileNumber] = useState(member?.mobileNumber || '');
  const [whatsappNumber, setWhatsappNumber] = useState(member?.whatsappNumber || '');
  const [sameAsMobile, setSameAsMobile] = useState(true);
  const [email, setEmail] = useState(member?.email || '');
  const [preferredApartment, setPreferredApartment] = useState<'2 BHK' | '3 BHK' | 'Either'>('2 BHK');
  const [budget, setBudget] = useState('Price on Request');
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    ok: boolean;
    enquiryId: string;
    message: string;
  } | null>(null);

  const enquiryFormRef = useRef<HTMLDivElement>(null);
  const floorPlansRef = useRef<HTMLDivElement>(null);

  // Sync WhatsApp number if sameAsMobile is checked
  useEffect(() => {
    if (sameAsMobile) {
      setWhatsappNumber(mobileNumber);
    }
  }, [mobileNumber, sameAsMobile]);

  // Pre-fill member details if available
  useEffect(() => {
    if (member) {
      if (member.name && !fullName) setFullName(member.name);
      if (member.mobileNumber && !mobileNumber) setMobileNumber(member.mobileNumber);
      if (member.email && !email) setEmail(member.email);
    }
  }, [member]);

  const scrollToEnquiry = (prefillApartment?: '2 BHK' | '3 BHK' | 'Either') => {
    if (prefillApartment) {
      setPreferredApartment(prefillApartment);
    }
    if (enquiryFormRef.current) {
      enquiryFormRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToFloorPlans = (tab?: '2bhk' | '3bhk') => {
    if (tab) {
      setActiveConfigTab(tab);
    }
    if (floorPlansRef.current) {
      floorPlansRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredGallery = VEDIRA_ANAND_DATA.gallery.filter((item) =>
    selectedGalleryCategory === 'All' ? true : item.category === selectedGalleryCategory
  );

  const openLightbox = (item: GalleryItem) => {
    const idx = VEDIRA_ANAND_DATA.gallery.findIndex((g) => g.id === item.id);
    setGalleryModalIndex(idx !== -1 ? idx : 0);
    setGalleryModalOpen(true);
  };

  const openFloorPlanModal = (target: '2bhk-plan' | '2bhk-isometric' | '3bhk-plan') => {
    let targetId = 'floor-plan-2bhk';
    if (target === '2bhk-isometric') targetId = 'isometric-2bhk';
    if (target === '3bhk-plan') targetId = 'floor-plan-3bhk';
    const idx = VEDIRA_ANAND_DATA.gallery.findIndex((g) => g.id === targetId);
    setGalleryModalIndex(idx !== -1 ? idx : 0);
    setGalleryModalOpen(true);
  };

  // Form Validation & Submission
  const validateForm = () => {
    const errors: Record<string, string> = {};
    const cleanPhone = mobileNumber.replace(/\D/g, '').slice(-10);

    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = 'Please enter your full name (at least 2 letters).';
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.mobileNumber = 'Please enter a valid 10-digit Indian mobile number.';
    }

    if (!sameAsMobile && whatsappNumber) {
      const cleanWa = whatsappNumber.replace(/\D/g, '').slice(-10);
      if (!/^[6-9]\d{9}$/.test(cleanWa)) {
        errors.whatsappNumber = 'Please enter a valid 10-digit WhatsApp number or leave empty.';
      }
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setFormErrors({});

    try {
      const cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10);
      const cleanWa = sameAsMobile
        ? cleanMobile
        : whatsappNumber.replace(/\D/g, '').slice(-10) || cleanMobile;

      const res = await submitPropertyEnquiry({
        projectName: VEDIRA_ANAND_DATA.projectName,
        developerName: VEDIRA_ANAND_DATA.developerName,
        fullName: fullName.trim(),
        mobileNumber: cleanMobile,
        whatsappNumber: cleanWa,
        email: email.trim() || undefined,
        preferredApartment,
        budget,
        additionalRequirements: additionalRequirements.trim() || undefined,
        city: 'Nagpur',
      });

      setSubmissionResult({
        ok: true,
        enquiryId: res.enquiryId,
        message: res.message,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not submit enquiry. Please try again.';
      setFormErrors({ submit: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const activeConfig = VEDIRA_ANAND_DATA.configurations.find((c) => c.id === activeConfigTab)!;

  // Icon mapping for amenities
  const renderAmenityIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass':
        return <Compass className="w-6 h-6 text-[#064E3B]" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-[#064E3B]" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-[#064E3B]" />;
      case 'Fingerprint':
        return <Fingerprint className="w-6 h-6 text-[#064E3B]" />;
      case 'Trees':
        return <Trees className="w-6 h-6 text-[#064E3B]" />;
      case 'Car':
        return <Car className="w-6 h-6 text-[#064E3B]" />;
      case 'Sun':
        return <Sun className="w-6 h-6 text-[#064E3B]" />;
      case 'Video':
        return <Video className="w-6 h-6 text-[#064E3B]" />;
      case 'BatteryCharging':
        return <BatteryCharging className="w-6 h-6 text-[#064E3B]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-[#064E3B]" />;
      case 'Coffee':
        return <Coffee className="w-6 h-6 text-[#064E3B]" />;
      default:
        return <CheckCircle2 className="w-6 h-6 text-[#064E3B]" />;
    }
  };

  return (
    <div className="bg-[#F8F8F3] text-[#073B30] min-h-screen">
      {/* 1. ARCHITECTURAL HERO SECTION */}
      <section className="relative bg-gradient-to-b from-[#042B23] via-[#064E3B] to-[#085C46] text-white pt-10 pb-16 sm:pb-20 overflow-hidden">
        {/* Subtle architectural background texture */}
        <div
          className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFC928_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Breadcrumb / Deal badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('/deals')}
                className="text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                Deals
              </button>
              <span className="text-white/40">/</span>
              <span className="text-white/70">Nagpur Properties</span>
              <span className="text-white/40">/</span>
              <span className="text-[#FFC928] font-bold">Vedira Anand</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFC928]/20 border border-[#FFC928]/40 px-3 py-1 text-xs font-semibold text-[#FFC928]">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Property Deal
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
                <MapPin className="w-3.5 h-3.5 text-[#FFC928]" />
                Gopal Nagar, Nagpur
              </span>
            </div>
          </div>

          {/* Hero Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#FFC928]">
                  WallStone Realty Pvt. Ltd. Presents
                </p>
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.08]">
                  Vedira Anand
                </h1>
                <p className="text-xl sm:text-2xl font-light text-white/90">
                  A Scheme of 2 & 3 BHK Luxurious Flats
                </p>
              </div>

              {/* Verified Location & Structure Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/95 border border-white/15">
                  Ground + 6 Floors
                </span>
                <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/95 border border-white/15">
                  2 BHK · 1,292 sq. ft. (S-B/UP)
                </span>
                <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/95 border border-white/15">
                  3 BHK · 2,190 sq. ft. (S-B/UP)
                </span>
                <span className="rounded-lg bg-[#FFC928] px-3 py-1.5 text-xs font-bold text-[#073B30]">
                  Price on Request
                </span>
              </div>

              <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-2xl">
                Experience refined living in the prime residential enclave of Dr. Padhan Layout, Gopal Nagar.
                Crafted with earthquake-resistant RCC construction, hydraulic multi-tier car parking, 5 kW common solar power,
                and premium Jaquar/Kohler specifications.
              </p>

              {/* Address callout */}
              <div className="flex items-start gap-3 rounded-xl bg-black/25 border border-white/10 p-3.5 max-w-xl text-xs sm:text-sm text-white/80">
                <MapPin className="w-5 h-5 text-[#FFC928] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">Official Project Address:</strong>
                  <span>{VEDIRA_ANAND_DATA.address}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => scrollToEnquiry()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFC928] px-6 py-3.5 text-base font-bold text-[#073B30] hover:bg-[#f3bc18] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Enquire Now</span>
                </button>

                <a
                  href="/downloads/Vedira_Anand_Project_Brochure.pdf"
                  download="Vedira_Anand_Project_Brochure.pdf"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#064E3B] border border-[#FFC928]/40 hover:border-[#FFC928] px-5 py-3.5 text-base font-bold text-white hover:bg-[#073B30] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#FFC928]" />
                  <span>Download Project Brochure</span>
                </a>

                <button
                  type="button"
                  onClick={() => scrollToFloorPlans()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3.5 text-base font-semibold text-white hover:bg-white/20 transition-all cursor-pointer"
                >
                  <Ruler className="w-4 h-4 text-[#FFC928]" />
                  <span>Explore Floor Plans</span>
                </button>

                <button
                  type="button"
                  onClick={() => openLightbox(VEDIRA_ANAND_DATA.gallery[0])}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-black/20 px-4 py-3.5 text-sm font-medium text-white/90 hover:bg-white/10 transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Photos (9)</span>
                </button>
              </div>
            </div>

            {/* Right Visual Column: Elevation Preview Card */}
            <div className="lg:col-span-5 relative">
              <div className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/20 shadow-2xl">
                <div className="aspect-[4/3] w-full relative overflow-hidden bg-[#072B23]">
                  <ResilientImage
                    src="/assets/aistudio/image_dc17df3b.png"
                    alt="Vedira Anand Full Front Elevation Gopal Nagar Nagpur"
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  {/* Badges on image */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className="rounded-md bg-[#064E3B]/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white border border-white/20">
                      G+6 Luxury Architecture
                    </span>
                    <span className="rounded-md bg-[#FFC928] px-2.5 py-1 text-[11px] font-bold text-[#073B30]">
                      WallStone Realty
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openLightbox(VEDIRA_ANAND_DATA.gallery[0])}
                    className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-black/70 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#064E3B] transition-colors border border-white/20 cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Expand Elevation</span>
                  </button>

                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="text-xs text-white/70 font-medium">Verified Elevation Model</p>
                    <p className="text-sm font-bold">Vedira Anand · Gopal Nagar</p>
                  </div>
                </div>

                {/* Quick stats strip below image */}
                <div className="grid grid-cols-3 divide-x divide-white/10 bg-[#052820] text-center p-3 text-xs">
                  <div>
                    <span className="text-white/60 block text-[10px] uppercase tracking-wider">Super Built-Up</span>
                    <strong className="text-white font-bold">1,292 – 2,190 sq. ft.</strong>
                  </div>
                  <div>
                    <span className="text-white/60 block text-[10px] uppercase tracking-wider">Pricing</span>
                    <strong className="text-[#FFC928] font-bold">On Request</strong>
                  </div>
                  <div>
                    <span className="text-white/60 block text-[10px] uppercase tracking-wider">Total Floors</span>
                    <strong className="text-white font-bold">Ground + 6</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FREE BROWSING GUARANTEE BANNER */}
      <section className="bg-[#EAF2E9] border-y border-[#CFE0CF] py-3.5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-[#064E3B]">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-5 h-5 text-[#064E3B] shrink-0" />
            <span>
              <strong>Gharmalak Free Browsing:</strong> Explore full photos, floor plans, specifications, and submit property enquiries for free. No membership required to browse or enquire.
            </span>
          </div>
          <button
            type="button"
            onClick={() => scrollToEnquiry()}
            className="font-bold underline hover:text-[#073B30] whitespace-nowrap cursor-pointer"
          >
            Direct Developer Enquiry →
          </button>
        </div>
      </section>

      {/* 3. DISCOVER VEDIRA ANAND OVERVIEW */}
      <section className="py-12 sm:py-16 bg-white border-b border-[#E4E9E3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#064E3B]">
              Project Highlights
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#073B30]">
              Discover Vedira Anand
            </h2>
            <p className="text-base text-[#073B30]/80 max-w-3xl leading-relaxed">
              Designed and developed by WallStone Realty Pvt. Ltd., Vedira Anand pairs boutique residential privacy with
              high-specification luxury apartments in the heart of Gopal Nagar, Nagpur.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {VEDIRA_ANAND_DATA.quickStats.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-[#F8F8F3] border border-[#E4E9E3] p-4 space-y-1 transition-all hover:border-[#064E3B]/40 hover:bg-[#EAF2E9]/40"
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#064E3B]/80 block">
                  {item.label}
                </span>
                <p className="text-sm sm:text-base font-bold text-[#073B30]">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Prominent Download Project Brochure Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-[#064E3B] via-[#073B30] to-[#064E3B] text-white p-6 sm:p-8 shadow-xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#FFC928]">
                <FileText className="w-3.5 h-3.5" />
                <span>Official Developer Document · Free Download</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Download Official Vedira Anand Project Brochure
              </h3>
              <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                Download the authentic 6-page WallStone Realty brochure PDF containing full architectural drawings, 2 &amp; 3 BHK floor plans, 3D isometric interior cutaways, parking layouts, complete room dimension schedules, and technical specifications.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-white/70">
                <span>✓ High-Resolution 6 Pages</span>
                <span>•</span>
                <span>✓ Verified Dimensions (1,292 &amp; 2,190 sq. ft.)</span>
                <span>•</span>
                <span>✓ No Membership Required</span>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <a
                href="/downloads/Vedira_Anand_Project_Brochure.pdf"
                download="Vedira_Anand_Project_Brochure.pdf"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#064E3B] border-2 border-[#FFC928] px-7 py-4 text-base font-bold text-white hover:bg-[#073B30] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer group"
              >
                <Download className="w-5 h-5 text-[#FFC928] group-hover:translate-y-0.5 transition-transform" />
                <span>Download Project Brochure</span>
              </a>
            </div>
          </div>

          {/* Key Advantages 3-Card Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="rounded-2xl border border-[#E4E9E3] bg-[#FAFBF9] p-6 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF2E9] text-[#064E3B]">
                <Building className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#073B30]">Boutique 6-Storey Privacy</h3>
              <p className="text-sm text-[#073B30]/75 leading-relaxed">
                Only two apartments per floor on the 1st to 5th level, and an exclusive single penthouse suite on the 6th floor. Quiet, private, and community-centric.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E4E9E3] bg-[#FAFBF9] p-6 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF2E9] text-[#064E3B]">
                <Sun className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#073B30]">Green Energy & 5 kW Solar</h3>
              <p className="text-sm text-[#073B30]/75 leading-relaxed">
                Common rooftop solar photovoltaic system slashing building electricity costs, paired with dedicated EV charging bays and automated water systems.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E4E9E3] bg-[#FAFBF9] p-6 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF2E9] text-[#064E3B]">
                <Fingerprint className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#073B30]">Smart Security Suite</h3>
              <p className="text-sm text-[#073B30]/75 leading-relaxed">
                Biometric thumbprint door locks on main entrances, high-definition smart video doorbell screening, and 24x7 CCTV coverage throughout the premises.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. EXPLORE YOUR APARTMENT LAYOUT (INTERACTIVE FLOOR PLANS) */}
      <section ref={floorPlansRef} className="py-14 sm:py-20 bg-[#F8F8F3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#064E3B]">
                Architectural Floor Plans
              </p>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#073B30]">
                Explore Your Apartment Layout
              </h2>
              <p className="text-sm sm:text-base text-[#073B30]/80 max-w-2xl">
                Choose your preferred apartment configuration to explore the detailed floor plan of Vedira Anand.
              </p>
            </div>

            {/* TAB SELECTOR BUTTONS */}
            <div className="inline-flex rounded-2xl bg-[#EAF2E9] border border-[#CFE0CF] p-1.5 shadow-sm">
              <button
                type="button"
                onClick={() => setActiveConfigTab('2bhk')}
                className={`rounded-xl px-6 py-3 text-sm sm:text-base font-bold transition-all cursor-pointer ${
                  activeConfigTab === '2bhk'
                    ? 'bg-[#064E3B] text-white shadow-md'
                    : 'bg-white text-[#064E3B] hover:bg-[#FAFDFB]'
                }`}
              >
                2 BHK (1,292 sq. ft.)
              </button>
              <button
                type="button"
                onClick={() => setActiveConfigTab('3bhk')}
                className={`rounded-xl px-6 py-3 text-sm sm:text-base font-bold transition-all cursor-pointer ${
                  activeConfigTab === '3bhk'
                    ? 'bg-[#064E3B] text-white shadow-md'
                    : 'bg-white text-[#064E3B] hover:bg-[#FAFDFB]'
                }`}
              >
                3 BHK (2,190 sq. ft.)
              </button>
            </div>
          </div>

          {/* Active Configuration Card */}
          <div className="rounded-3xl bg-white border border-[#E4E9E3] shadow-md p-6 sm:p-10 space-y-8">
            {/* 4 Clear Configuration Details Required by Prompt */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAFDFB] border border-[#CFE0CF] rounded-2xl p-4 sm:p-5">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#064E3B]/80 block">
                  Configuration
                </span>
                <span className="text-base sm:text-lg font-black text-[#073B30]">
                  {activeConfigTab === '2bhk' ? '2 BHK' : '3 BHK'}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#064E3B]/80 block">
                  Floor Info
                </span>
                <span className="text-base sm:text-lg font-bold text-[#073B30]">
                  {activeConfigTab === '2bhk' ? 'Typical 1st to 5th floors' : 'Typical 6th floor'}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#064E3B]/80 block">
                  Flat Numbers
                </span>
                <span className="text-base sm:text-lg font-bold text-[#073B30]">
                  {activeConfigTab === '2bhk' ? '101–501 and 102–502' : '601'}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#064E3B]/80 block">
                  S-B/UP Area
                </span>
                <span className="text-base sm:text-lg font-black text-[#064E3B]">
                  {activeConfigTab === '2bhk' ? '1,292 sq. ft.' : '2,190 sq. ft.'}
                </span>
              </div>
            </div>

            {/* Header of Configuration Card */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E4E9E3]">
              <div>
                <span className="inline-block rounded-full bg-[#EAF2E9] border border-[#CFE0CF] px-3.5 py-1 text-xs font-bold text-[#064E3B]">
                  {activeConfigTab === '2bhk' ? '1st to 5th Floor · Flats 101–501 & 102–502' : '6th Floor · Flat 601 Exclusive'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#073B30] mt-2">
                  {activeConfigTab === '2bhk' ? '2 BHK Luxury Apartment' : '3 BHK Penthouse Suite'}
                </h3>
                <p className="text-sm sm:text-base text-[#073B30]/80 mt-1 max-w-2xl">
                  {activeConfigTab === '2bhk'
                    ? 'Thoughtfully planned 2 BHK homes with excellent cross-ventilation, zero space wastage, and two units per floor.'
                    : 'A regal top-floor 3 BHK residence boasting an immense 2,190 sq. ft. footprint with an expansive private terrace.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="/downloads/Vedira_Anand_Project_Brochure.pdf"
                  download="Vedira_Anand_Project_Brochure.pdf"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#064E3B] px-5 py-3 text-sm font-bold text-white hover:bg-[#073B30] transition-colors shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#FFC928]" />
                  <span>Download Project Brochure</span>
                </a>

                <button
                  type="button"
                  onClick={() => scrollToEnquiry(activeConfigTab === '2bhk' ? '2 BHK' : '3 BHK')}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FFC928] px-5 py-3 text-sm font-bold text-[#073B30] hover:bg-[#f3bc18] transition-colors shadow-sm cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Enquire for {activeConfigTab === '2bhk' ? '2 BHK' : '3 BHK'}</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT: 2 BHK vs 3 BHK */}
            {activeConfigTab === '2bhk' ? (
              /* TAB 1: 2 BHK (Page 2 Floor Plan & Page 3 Isometric) */
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#064E3B]">
                      Official Brochure Drawing Preview
                    </span>
                    <span className="text-xs text-[#073B30]/60">· Page 2 &amp; Page 3 of WallStone Realty Brochure</span>
                  </div>

                  {/* 2 BHK View Selector: Floor Plan (Page 2) vs Isometric (Page 3) */}
                  <div className="inline-flex rounded-xl bg-[#F8F8F3] border border-[#CFE0CF] p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setViewMode2Bhk('floorplan')}
                      className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                        viewMode2Bhk === 'floorplan'
                          ? 'bg-[#064E3B] text-white shadow-xs'
                          : 'text-[#073B30] hover:bg-[#EAF2E9]'
                      }`}
                    >
                      Page 2: 2D Floor Plan Drawing
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode2Bhk('isometric')}
                      className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                        viewMode2Bhk === 'isometric'
                          ? 'bg-[#064E3B] text-white shadow-xs'
                          : 'text-[#073B30] hover:bg-[#EAF2E9]'
                      }`}
                    >
                      Page 3: 3D Isometric View
                    </button>
                  </div>
                </div>

                {/* Display Frame for 2 BHK */}
                <div className="relative rounded-2xl border-2 border-[#DCEFE3] bg-[#FAFDFB] p-4 sm:p-6 overflow-hidden shadow-inner group">
                  <button
                    type="button"
                    onClick={() =>
                      openFloorPlanModal(viewMode2Bhk === 'floorplan' ? '2bhk-plan' : '2bhk-isometric')
                    }
                    className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 rounded-lg bg-[#064E3B] text-white px-3.5 py-2 text-xs font-bold shadow-lg hover:bg-[#073B30] transition-colors cursor-pointer"
                    title="Open full screen zoom viewer"
                  >
                    <ZoomIn className="w-4 h-4 text-[#FFC928]" />
                    <span>Click to Zoom &amp; Inspect</span>
                  </button>

                  <div
                    onClick={() =>
                      openFloorPlanModal(viewMode2Bhk === 'floorplan' ? '2bhk-plan' : '2bhk-isometric')
                    }
                    className="max-w-4xl mx-auto flex items-center justify-center min-h-[380px] max-h-[620px] cursor-zoom-in"
                  >
                    {viewMode2Bhk === 'floorplan' ? (
                      <ResilientImage
                        src="/images/vedira-anand/page_2.png"
                        alt="Vedira Anand 2 BHK Floor Plan Page 2 - 1292 sq ft"
                        className="max-h-[580px] w-auto object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.01]"
                      />
                    ) : (
                      <ResilientImage
                        src="/images/vedira-anand/page_3.png"
                        alt="Vedira Anand 2 BHK 3D Isometric View Page 3"
                        className="max-h-[580px] w-auto object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.01]"
                      />
                    )}
                  </div>

                  <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-[#E4E9E3] text-xs text-[#073B30]/70">
                    <span>
                      {viewMode2Bhk === 'floorplan'
                        ? 'Original Page 2 Drawing: 2 BHK typical 1st to 5th floor layout with detailed room dimensions.'
                        : 'Original Page 3 Drawing: 2 BHK 3D isometric cutaway showing furnished spatial flow and parking.'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        openFloorPlanModal(viewMode2Bhk === 'floorplan' ? '2bhk-plan' : '2bhk-isometric')
                      }
                      className="text-[#064E3B] font-bold underline hover:text-[#073B30] cursor-pointer"
                    >
                      Launch Lightbox Modal with Zoom Controls →
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* TAB 2: 3 BHK (Page 4 Floor Plan ONLY — Strictly no 2 BHK info) */
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#064E3B]">
                      Official 3 BHK Penthouse Floor Plan Drawing
                    </span>
                    <span className="text-xs text-[#073B30]/60">· Page 4 of WallStone Realty Brochure</span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#EAF2E9] px-3 py-1 text-xs font-semibold text-[#064E3B]">
                    <span>Exclusive 6th Floor Penthouse Layout (Flat 601)</span>
                  </span>
                </div>

                {/* Display Frame for 3 BHK */}
                <div className="relative rounded-2xl border-2 border-[#DCEFE3] bg-[#FAFDFB] p-4 sm:p-6 overflow-hidden shadow-inner group">
                  <button
                    type="button"
                    onClick={() => openFloorPlanModal('3bhk-plan')}
                    className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 rounded-lg bg-[#064E3B] text-white px-3.5 py-2 text-xs font-bold shadow-lg hover:bg-[#073B30] transition-colors cursor-pointer"
                    title="Open full screen zoom viewer"
                  >
                    <ZoomIn className="w-4 h-4 text-[#FFC928]" />
                    <span>Click to Zoom &amp; Inspect</span>
                  </button>

                  <div
                    onClick={() => openFloorPlanModal('3bhk-plan')}
                    className="max-w-4xl mx-auto flex items-center justify-center min-h-[380px] max-h-[620px] cursor-zoom-in"
                  >
                    <ResilientImage
                      src="/images/vedira-anand/page_4.png"
                      alt="Vedira Anand 3 BHK Penthouse Floor Plan Page 4 - 2190 sq ft"
                      className="max-h-[580px] w-auto object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.01]"
                    />
                  </div>

                  <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-[#E4E9E3] text-xs text-[#073B30]/70">
                    <span>
                      Original Page 4 Drawing: 3 BHK Penthouse Suite on 6th floor with 7&apos;10&quot; wide sit-out terrace and three en-suite bedrooms.
                    </span>
                    <button
                      type="button"
                      onClick={() => openFloorPlanModal('3bhk-plan')}
                      className="text-[#064E3B] font-bold underline hover:text-[#073B30] cursor-pointer"
                    >
                      Launch Lightbox Modal with Zoom Controls →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Room Dimensions & Schedule Table */}
            <div className="space-y-4 pt-2">
              <h4 className="text-lg font-bold text-[#073B30] flex items-center gap-2">
                <Ruler className="w-5 h-5 text-[#064E3B]" />
                <span>Room Dimensions & Specifications Schedule</span>
              </h4>

              <div className="overflow-x-auto rounded-xl border border-[#E4E9E3]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#EAF2E9] text-[#064E3B] text-xs uppercase font-bold tracking-wider">
                    <tr>
                      <th scope="col" className="px-4 py-3">Room / Space</th>
                      <th scope="col" className="px-4 py-3">Dimensions</th>
                      <th scope="col" className="px-4 py-3">Key Features</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E9E3]">
                    {activeConfig.roomDimensions.map((room, idx) => (
                      <tr key={idx} className="hover:bg-[#F8F8F3] transition-colors">
                        <td className="px-4 py-3 font-semibold text-[#073B30]">{room.room}</td>
                        <td className="px-4 py-3 font-mono font-bold text-[#064E3B]">{room.dimension}</td>
                        <td className="px-4 py-3 text-xs text-[#073B30]/75">{room.features || 'Standard luxury finish'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Highlights Grid */}
            <div className="rounded-2xl bg-[#FAFBF9] border border-[#E4E9E3] p-6 space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#064E3B]">
                Key Highlights of this Configuration
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#073B30]">
                {activeConfig.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#064E3B] shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE IMAGE GALLERY WITH LIGHTBOX MODAL */}
      <section className="py-14 sm:py-20 bg-white border-b border-[#E4E9E3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#064E3B]">
                Visual Showcase
              </p>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#073B30]">
                Project Gallery & Plans
              </h2>
              <p className="text-sm sm:text-base text-[#073B30]/80 max-w-2xl">
                Browse elevation renders, vector floor plans, isometric views, parking infrastructure, and specifications.
                Click any image to launch the full-screen zoomable lightbox viewer.
              </p>
            </div>

            <button
              type="button"
              onClick={() => openLightbox(VEDIRA_ANAND_DATA.gallery[0])}
              className="inline-flex items-center gap-2 rounded-xl bg-[#EAF2E9] border border-[#CFE0CF] px-4 py-2.5 text-xs font-bold text-[#064E3B] hover:bg-[#dce8da] transition-colors cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Launch Fullscreen Viewer</span>
            </button>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              'All',
              'Project Elevation',
              '2 BHK Floor Plan',
              '2 BHK Isometric View',
              '3 BHK Floor Plan',
              'Parking and Entrance',
              'Specifications and Amenities',
              'Location',
            ].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedGalleryCategory(cat)}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  selectedGalleryCategory === cat
                    ? 'bg-[#064E3B] text-white shadow-xs'
                    : 'bg-[#F8F8F3] text-[#073B30] border border-[#E4E9E3] hover:bg-[#EAF2E9]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGallery.map((item) => (
              <article
                key={item.id}
                onClick={() => openLightbox(item)}
                className="group relative rounded-2xl overflow-hidden bg-[#FAFBF9] border border-[#E4E9E3] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col"
              >
                <div className="aspect-[16/10] w-full overflow-hidden relative bg-[#EAF2E9]">
                  <ResilientImage
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="rounded-full bg-white/90 text-[#073B30] p-2.5 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      <ZoomIn className="w-5 h-5" />
                    </span>
                  </div>

                  <span className="absolute top-3 left-3 rounded-md bg-[#064E3B]/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white border border-white/20">
                    {item.category}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#073B30] group-hover:text-[#064E3B] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#073B30]/75 line-clamp-2 mt-1">
                      {item.caption}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#064E3B] pt-2 inline-flex items-center gap-1">
                    Click to expand & zoom →
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6. VERIFIED SPECIFICATIONS (16 ITEMS FROM PAGE 5) */}
      <section className="py-14 sm:py-20 bg-[#F8F8F3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#064E3B]">
              Standard of Excellence
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#073B30]">
              Project Specifications
            </h2>
            <p className="text-sm sm:text-base text-[#073B30]/80 max-w-3xl leading-relaxed">
              Every home in Vedira Anand is constructed with materials from leading manufacturers.
              Below are the 16 verified specifications from Page 5 of the official WallStone Realty brochure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {VEDIRA_ANAND_DATA.specifications.map((spec) => (
              <div
                key={spec.id}
                className="rounded-2xl bg-white border border-[#E4E9E3] p-5 space-y-2.5 shadow-xs hover:border-[#064E3B]/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#064E3B] bg-[#EAF2E9] px-2 py-0.5 rounded">
                      {String(spec.number).padStart(2, '0')}
                    </span>
                    <span className="text-[11px] font-semibold text-[#064E3B] uppercase tracking-wider">
                      Verified Spec
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#073B30]">{spec.title}</h3>
                  <p className="text-xs font-semibold text-[#064E3B] leading-snug">
                    {spec.highlight}
                  </p>
                </div>
                <p className="text-xs text-[#073B30]/75 leading-relaxed pt-2 border-t border-[#E4E9E3]">
                  {spec.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. SPECIAL FEATURES & AMENITIES (11 ITEMS) */}
      <section className="py-14 sm:py-20 bg-white border-y border-[#E4E9E3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#064E3B]">
              Luxury Lifestyle
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#073B30]">
              Special Features & Amenities
            </h2>
            <p className="text-sm sm:text-base text-[#073B30]/80 max-w-3xl leading-relaxed">
              Curated comforts designed for urban peace of mind. From private keyless digital access to common rooftop solar and hydraulic stacker parking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VEDIRA_ANAND_DATA.specialFeatures.map((amenity) => (
              <div
                key={amenity.id}
                className="rounded-2xl border border-[#E4E9E3] bg-[#FAFBF9] p-6 space-y-3 hover:border-[#064E3B]/40 transition-all hover:shadow-xs"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF2E9]">
                  {renderAmenityIcon(amenity.iconName)}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#073B30]">
                    {amenity.title}
                  </h3>
                  <span className="text-xs font-semibold text-[#064E3B] block mt-0.5">
                    {amenity.subtitle}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#073B30]/75 leading-relaxed">
                  {amenity.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. LOCATION & CONNECTIVITY SECTION */}
      <section className="py-14 sm:py-20 bg-[#F8F8F3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#064E3B]">
              Prime Neighborhood
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#073B30]">
              An Address That Connects You
            </h2>
            <p className="text-sm sm:text-base text-[#073B30]/80 max-w-3xl leading-relaxed">
              Nestled inside Dr. Padhan Layout at the 3rd Bus Stop in Gopal Nagar, Nagpur. Enjoy seamless proximity to IT Park, VNIT campus, Pratap Nagar Ring Road, and Metro connectivity.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Address details & Landmarks Table */}
            <div className="lg:col-span-7 space-y-6">
              {/* Address Box */}
              <div className="rounded-2xl bg-white border border-[#E4E9E3] p-6 space-y-4 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF2E9] text-[#064E3B] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#073B30]">Official Project Address</h3>
                    <p className="text-sm text-[#073B30]/85 mt-1 font-medium">
                      {VEDIRA_ANAND_DATA.address}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      VEDIRA_ANAND_DATA.googleMapsQuery
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#064E3B] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#073B30] transition-colors"
                  >
                    <Compass className="w-4 h-4 text-[#FFC928]" />
                    <span>Get Directions on Google Maps</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => scrollToEnquiry()}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#CFE0CF] bg-[#EAF2E9] px-4 py-2.5 text-xs font-bold text-[#064E3B] hover:bg-[#dce8da] transition-colors cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Schedule Site Visit</span>
                  </button>
                </div>
              </div>

              {/* Landmarks Distances List */}
              <div className="rounded-2xl bg-white border border-[#E4E9E3] p-6 space-y-4 shadow-xs">
                <h3 className="text-base font-bold text-[#073B30]">Key Landmarks & Approximate Travel Times</h3>
                <div className="divide-y divide-[#E4E9E3]">
                  {VEDIRA_ANAND_DATA.landmarks.map((landmark, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#064E3B]" />
                        <span className="font-semibold text-[#073B30]">{landmark.name}</span>
                        <span className="rounded bg-[#F8F8F3] px-2 py-0.5 text-[10px] text-[#064E3B] font-medium hidden sm:inline">
                          {landmark.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <span className="font-mono font-bold text-[#064E3B]">{landmark.distance}</span>
                        <span className="text-[#073B30]/60 text-xs">({landmark.time})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Map Graphic / Route Visual */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl overflow-hidden border border-[#E4E9E3] bg-white shadow-xs">
                <div className="p-4 bg-[#064E3B] text-white">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#FFC928]">
                    Gopal Nagar, Nagpur
                  </p>
                  <h3 className="text-base font-bold">Strategic City Connectivity</h3>
                </div>

                <div className="p-6 space-y-4 bg-[#FAFBF9]">
                  <div className="rounded-xl bg-[#EAF2E9] border border-[#CFE0CF] p-4 text-xs space-y-2">
                    <p className="font-bold text-[#064E3B] flex items-center gap-1.5">
                      <Info className="w-4 h-4" />
                      <span>Neighborhood Advantage</span>
                    </p>
                    <p className="text-[#073B30]/80 leading-relaxed">
                      Gopal Nagar is among South-West Nagpur&apos;s most mature and coveted residential pockets, offering quiet tree-lined avenues with rapid arterial access to Hingna Road, Ring Road, and Wardha Road.
                    </p>
                  </div>

                  <ul className="space-y-2.5 text-xs text-[#073B30]/85">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#064E3B] shrink-0" />
                      <span>Walking distance to 3rd Bus Stop (Gopal Nagar)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#064E3B] shrink-0" />
                      <span>Quick 6-minute commute to IT Park technology offices</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#064E3B] shrink-0" />
                      <span>Close to top educational institutions (VNIT, BVM, Somalwar)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#064E3B] shrink-0" />
                      <span>Convenient daily groceries, banks, and pharmacies within 500m</span>
                    </li>
                  </ul>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      VEDIRA_ANAND_DATA.googleMapsQuery
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFC928] px-4 py-3 text-xs font-bold text-[#073B30] hover:bg-[#f3bc18] transition-colors"
                  >
                    <span>Open in Google Maps Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. PRICE & ENQUIRY SECTION */}
      <section ref={enquiryFormRef} className="py-14 sm:py-20 bg-white border-t border-[#E4E9E3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: Pricing & Developer Details */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#064E3B]">
                  Official Pricing & Terms
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#073B30]">
                  Price on Request
                </h2>
                <p className="text-sm text-[#073B30]/80 leading-relaxed">
                  WallStone Realty provides individualized pricing schedules for 2 BHK and 3 BHK units based on floor selection, payment milestones, and customization requests.
                </p>
              </div>

              {/* Price Cards */}
              <div className="space-y-3">
                <div className="rounded-xl border border-[#CFE0CF] bg-[#FAFBF9] p-4 flex items-center justify-between">
                  <div>
                    <strong className="text-base font-bold text-[#073B30] block">2 BHK Luxury Apartment</strong>
                    <span className="text-xs text-[#064E3B] font-semibold">1,292 sq. ft. S-B/UP Area · Floors 1 to 5</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreferredApartment('2 BHK')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                      preferredApartment === '2 BHK'
                        ? 'bg-[#064E3B] text-white'
                        : 'bg-[#EAF2E9] text-[#064E3B] hover:bg-[#dce8da]'
                    }`}
                  >
                    Select 2 BHK
                  </button>
                </div>

                <div className="rounded-xl border border-[#CFE0CF] bg-[#FAFBF9] p-4 flex items-center justify-between">
                  <div>
                    <strong className="text-base font-bold text-[#073B30] block">3 BHK Penthouse Suite</strong>
                    <span className="text-xs text-[#064E3B] font-semibold">2,190 sq. ft. S-B/UP Area · 6th Floor Exclusive</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreferredApartment('3 BHK')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                      preferredApartment === '3 BHK'
                        ? 'bg-[#064E3B] text-white'
                        : 'bg-[#EAF2E9] text-[#064E3B] hover:bg-[#dce8da]'
                    }`}
                  >
                    Select 3 BHK
                  </button>
                </div>
              </div>

              {/* Developer credentials card */}
              <div className="rounded-2xl bg-[#064E3B] text-white p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[#FFC928]">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#FFC928] font-bold">Developer</p>
                    <h3 className="text-lg font-bold">{VEDIRA_ANAND_DATA.developerName}</h3>
                  </div>
                </div>

                <p className="text-xs text-white/80 leading-relaxed">
                  WallStone Realty is dedicated to transparent specifications, punctual handover commitments, and premium structural engineering standards across Nagpur.
                </p>

                <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs">
                  <span className="text-white/70">Need instant clarification?</span>
                  <a
                    href={buildWhatsAppUrl(
                      `Hi Gharmalak, I would like to enquire about Vedira Anand property deal in Gopal Nagar, Nagpur.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FFC928] font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Inquiry</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Property Enquiry Form */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-[#CFE0CF] bg-[#FAFBF9] p-6 sm:p-10 shadow-md space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-[#073B30]">
                    Register Your Interest for Vedira Anand
                  </h3>
                  <p className="text-xs sm:text-sm text-[#073B30]/80 mt-1">
                    Fill out your contact details below to receive the complete price breakdown, floor plan booklet, and site-visit availability.
                  </p>
                </div>

                {submissionResult ? (
                  <div className="rounded-2xl bg-[#EAF2E9] border-2 border-[#064E3B] p-6 sm:p-8 space-y-4 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#064E3B] text-white">
                      <Check className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xl font-bold text-[#073B30]">Enquiry Successfully Registered!</h4>
                      <p className="text-sm text-[#064E3B] font-semibold">
                        Reference Number: <span className="font-mono font-bold">{submissionResult.enquiryId}</span>
                      </p>
                      <p className="text-xs sm:text-sm text-[#073B30]/80 max-w-md mx-auto pt-1">
                        Thank you, {fullName}. Our real estate representative for Vedira Anand will contact you at {mobileNumber} to assist with floor plans, pricing, and site visits.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <a
                        href={buildWhatsAppUrl(
                          `Hi Gharmalak, I just submitted an enquiry for Vedira Anand (${submissionResult.enquiryId}) for ${preferredApartment}.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#20ba5a] transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Follow up on WhatsApp</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          setSubmissionResult(null);
                          setAdditionalRequirements('');
                        }}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#CFE0CF] bg-white px-4 py-2.5 text-xs font-semibold text-[#073B30] hover:bg-[#EAF2E9] transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Submit Another Enquiry</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitEnquiry} className="space-y-4">
                    {/* Preferred Apartment Selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#064E3B]">
                        Preferred Apartment Configuration *
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['2 BHK', '3 BHK', 'Either'] as const).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setPreferredApartment(opt)}
                            className={`rounded-xl py-2.5 px-3 text-xs font-bold transition-all border cursor-pointer ${
                              preferredApartment === opt
                                ? 'bg-[#064E3B] text-white border-[#064E3B] shadow-xs'
                                : 'bg-white text-[#073B30] border-[#E4E9E3] hover:bg-[#EAF2E9]'
                            }`}
                          >
                            {opt === 'Either' ? 'Either 2 or 3 BHK' : `${opt}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="va-fullname" className="text-xs font-semibold text-[#073B30]">
                          Full Name *
                        </label>
                        <input
                          id="va-fullname"
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-[#073B30] placeholder-[#073B30]/40 focus:outline-none focus:ring-2 focus:ring-[#064E3B] ${
                            formErrors.fullName ? 'border-red-500' : 'border-[#CFE0CF]'
                          }`}
                        />
                        {formErrors.fullName && (
                          <p className="text-[11px] text-red-600 font-medium">{formErrors.fullName}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="va-mobile" className="text-xs font-semibold text-[#073B30]">
                          Mobile Number *
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-[#064E3B]">
                            +91
                          </span>
                          <input
                            id="va-mobile"
                            type="tel"
                            required
                            maxLength={10}
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            placeholder="9823000000"
                            className={`w-full rounded-xl border bg-white pl-12 pr-4 py-2.5 text-sm text-[#073B30] placeholder-[#073B30]/40 focus:outline-none focus:ring-2 focus:ring-[#064E3B] ${
                              formErrors.mobileNumber ? 'border-red-500' : 'border-[#CFE0CF]'
                            }`}
                          />
                        </div>
                        {formErrors.mobileNumber && (
                          <p className="text-[11px] text-red-600 font-medium">{formErrors.mobileNumber}</p>
                        )}
                      </div>
                    </div>

                    {/* WhatsApp Checkbox & Input */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          id="va-same-wa"
                          type="checkbox"
                          checked={sameAsMobile}
                          onChange={(e) => setSameAsMobile(e.target.checked)}
                          className="h-4 w-4 rounded border-[#CFE0CF] text-[#064E3B] focus:ring-[#064E3B]"
                        />
                        <label htmlFor="va-same-wa" className="text-xs text-[#073B30] cursor-pointer">
                          WhatsApp number is the same as mobile number
                        </label>
                      </div>

                      {!sameAsMobile && (
                        <div className="space-y-1">
                          <label htmlFor="va-wa" className="text-xs font-semibold text-[#073B30]">
                            WhatsApp Number (Optional)
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-[#064E3B]">
                              +91
                            </span>
                            <input
                              id="va-wa"
                              type="tel"
                              maxLength={10}
                              value={whatsappNumber}
                              onChange={(e) => setWhatsappNumber(e.target.value)}
                              placeholder="9823000000"
                              className="w-full rounded-xl border border-[#CFE0CF] bg-white pl-12 pr-4 py-2.5 text-sm text-[#073B30] placeholder-[#073B30]/40 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Email & Budget */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="va-email" className="text-xs font-semibold text-[#073B30]">
                          Email Address (Optional)
                        </label>
                        <input
                          id="va-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="rahul@example.com"
                          className="w-full rounded-xl border border-[#CFE0CF] bg-white px-4 py-2.5 text-sm text-[#073B30] placeholder-[#073B30]/40 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                        />
                        {formErrors.email && (
                          <p className="text-[11px] text-red-600 font-medium">{formErrors.email}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="va-budget" className="text-xs font-semibold text-[#073B30]">
                          Estimated Budget (Optional)
                        </label>
                        <select
                          id="va-budget"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className="w-full rounded-xl border border-[#CFE0CF] bg-white px-3.5 py-2.5 text-sm text-[#073B30] focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                        >
                          <option value="Price on Request">Price on Request</option>
                          <option value="Under ₹60 Lakhs">Under ₹60 Lakhs</option>
                          <option value="₹60 Lakhs - ₹80 Lakhs">₹60 Lakhs - ₹80 Lakhs</option>
                          <option value="₹80 Lakhs - ₹1.2 Crore">₹80 Lakhs - ₹1.2 Crore</option>
                          <option value="Above ₹1.2 Crore">Above ₹1.2 Crore</option>
                        </select>
                      </div>
                    </div>

                    {/* Additional Requirements */}
                    <div className="space-y-1">
                      <label htmlFor="va-reqs" className="text-xs font-semibold text-[#073B30]">
                        Additional Requirements / Preferred Site Visit Date (Optional)
                      </label>
                      <textarea
                        id="va-reqs"
                        rows={3}
                        value={additionalRequirements}
                        onChange={(e) => setAdditionalRequirements(e.target.value)}
                        placeholder="e.g. Interested in 4th floor east-facing unit, would like to visit this Saturday afternoon."
                        className="w-full rounded-xl border border-[#CFE0CF] bg-white px-4 py-2.5 text-sm text-[#073B30] placeholder-[#073B30]/40 focus:outline-none focus:ring-2 focus:ring-[#064E3B] resize-none"
                      />
                    </div>

                    {formErrors.submit && (
                      <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                        {formErrors.submit}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#064E3B] px-6 py-3.5 text-base font-bold text-white hover:bg-[#073B30] transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
                    >
                      {submitting ? (
                        <span>Submitting Your Enquiry…</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-[#FFC928]" />
                          <span>Submit Enquiry for Vedira Anand</span>
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-[#073B30]/60 text-center">
                      Your information is protected under Gharmalak Privacy Policy. By clicking submit, you authorize WallStone Realty and Gharmalak representatives to contact you regarding Vedira Anand.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FINAL CALL TO ACTION BANNER */}
      <section className="py-14 sm:py-20 bg-[#F8F8F3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#064E3B] text-white shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Left Image */}
            <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full overflow-hidden">
              <ResilientImage
                src="/assets/aistudio/image_dc17df3b.png"
                alt="Find Your New Home at Vedira Anand"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#064E3B]/20 to-[#064E3B] hidden lg:block" />
            </div>

            {/* Right Text & CTA */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFC928]">
                  WallStone Realty Pvt. Ltd.
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Find Your New Home at Vedira Anand
                </h2>
                <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-xl">
                  Limited inventory across 6 residential floors. S-B/UP area of 1,292 sq. ft. for 2 BHK and 2,190 sq. ft. for 3 BHK penthouse suites in Gopal Nagar, Nagpur.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => scrollToEnquiry()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFC928] px-6 py-3.5 text-base font-bold text-[#073B30] hover:bg-[#f3bc18] transition-all shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Enquire Now</span>
                </button>

                <a
                  href="/downloads/Vedira_Anand_Project_Brochure.pdf"
                  download="Vedira_Anand_Project_Brochure.pdf"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#064E3B] border border-[#FFC928]/50 hover:border-[#FFC928] px-6 py-3.5 text-base font-bold text-white hover:bg-[#073B30] transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#FFC928]" />
                  <span>Download Project Brochure</span>
                </a>

                <button
                  type="button"
                  onClick={() => scrollToFloorPlans()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-base font-semibold text-white hover:bg-white/20 transition-all cursor-pointer"
                >
                  <Ruler className="w-4 h-4 text-[#FFC928]" />
                  <span>Explore Apartments</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. OFFICIAL BROCHURE DISCLAIMER */}
      <footer className="bg-[#EAF2E9] border-t border-[#CFE0CF] py-8 text-xs text-[#064E3B]/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-2 text-center sm:text-left">
          <p className="font-semibold text-[#064E3B]">
            {VEDIRA_ANAND_DATA.brochureDisclaimer}
          </p>
          <p className="text-[11px] text-[#073B30]/60">
            Plot No. 8, Dr. Padhan Layout, 3rd Bus Stop, Gopal Nagar, Nagpur – 440001 · Developer: WallStone Realty Pvt. Ltd. · Curated on Gharmalak.com
          </p>
        </div>
      </footer>

      {/* Interactive Lightbox Modal */}
      <VediraGalleryModal
        isOpen={galleryModalOpen}
        items={VEDIRA_ANAND_DATA.gallery}
        initialIndex={galleryModalIndex}
        onClose={() => setGalleryModalOpen(false)}
      />
    </div>
  );
}
