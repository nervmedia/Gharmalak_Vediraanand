import { isValidIndianPhone, normalizeIndianPhone } from './clubData';

export type VendorPartnerCity =
  | 'Nagpur'
  | 'Wardha'
  | 'Amravati'
  | 'Pune'
  | 'Chhatrapati Sambhajinagar'
  | 'Nashik'
  | 'Chandrapur';

export type BusinessEntityType =
  | 'Individual Contractor'
  | 'Proprietorship'
  | 'Partnership Firm'
  | 'Private Limited Company'
  | 'LLP'
  | 'Other';

export type VendorFormCategoryOption =
  | 'Rooftop Solar'
  | 'Waterproofing'
  | 'Home Painting'
  | 'Modular Kitchens'
  | 'Air Conditioning'
  | 'CCTV and Smart Home'
  | 'Electrical Services'
  | 'Plumbing Services'
  | 'Water Purifiers'
  | 'Interior Design'
  | 'Home Renovation'
  | 'Pest Control'
  | 'Other';

export type ExperienceRangeOption =
  | 'Less than 1 year'
  | '1–3 years'
  | '3–5 years'
  | '5–10 years'
  | 'More than 10 years';

export type WarrantyPolicyOption = 'Yes' | 'No' | 'Depends on the service';

export type InstallationTeamOption = 'Yes' | 'No' | 'Work with subcontractors';

export type VendorApplicationStatus =
  | 'New Application'
  | 'Under Review'
  | 'Shortlisted'
  | 'Verification Pending'
  | 'Approved'
  | 'Rejected';

export const VENDOR_APPLICATION_STATUSES: VendorApplicationStatus[] = [
  'New Application',
  'Under Review',
  'Shortlisted',
  'Verification Pending',
  'Approved',
  'Rejected',
];

export const VENDOR_PROGRAMME_CONFIG = {
  maxVendorsPerCity: 5,
  totalCities: 7,
  totalTargetVendors: 35,
} as const;

export interface VendorCityTargetCard {
  city: VendorPartnerCity;
  cityCode: string;
  regionLabel: string;
  targetLabel: string;
  sampleLocalities: string[];
}

export const VENDOR_PARTNER_CITIES: VendorCityTargetCard[] = [
  {
    city: 'Nagpur',
    cityCode: 'NAG',
    regionLabel: 'Vidarbha · Flagship Hub',
    targetLabel: 'Up to 5 vendors',
    sampleLocalities: ['Dharampeth', 'Pratap Nagar', 'Manish Nagar', 'Civil Lines', 'Wardha Road'],
  },
  {
    city: 'Wardha',
    cityCode: 'WRD',
    regionLabel: 'Vidarbha Region',
    targetLabel: 'Up to 5 vendors',
    sampleLocalities: ['Civil Lines', 'Ramdaspeth', 'Sindi Meghe', 'Nalwadi', 'Sawangi'],
  },
  {
    city: 'Amravati',
    cityCode: 'AMR',
    regionLabel: 'Vidarbha Region',
    targetLabel: 'Up to 5 vendors',
    sampleLocalities: ['Camp', 'Rajapeth', 'Rukhmini Nagar', 'Dastur Nagar', 'Badnera Road'],
  },
  {
    city: 'Pune',
    cityCode: 'PUN',
    regionLabel: 'Western Maharashtra',
    targetLabel: 'Up to 5 vendors',
    sampleLocalities: ['Kothrud', 'Baner', 'Wakad', 'Viman Nagar', 'Hadapsar'],
  },
  {
    city: 'Chhatrapati Sambhajinagar',
    cityCode: 'CSN',
    regionLabel: 'Marathwada Region',
    targetLabel: 'Up to 5 vendors',
    sampleLocalities: ['CIDCO', 'Garkheda', 'Nirala Bazar', 'Ulkanagari', 'Waluj'],
  },
  {
    city: 'Nashik',
    cityCode: 'NSK',
    regionLabel: 'North Maharashtra',
    targetLabel: 'Up to 5 vendors',
    sampleLocalities: ['Gangapur Road', 'College Road', 'Indira Nagar', 'Panchavati', 'Cidco'],
  },
  {
    city: 'Chandrapur',
    cityCode: 'CHP',
    regionLabel: 'Vidarbha Region',
    targetLabel: 'Up to 5 vendors',
    sampleLocalities: ['Civil Lines', 'Ramnagar', 'Tukum', 'Jatpura Gate', 'Padoli'],
  },
];

export const BUSINESS_ENTITY_TYPES: BusinessEntityType[] = [
  'Individual Contractor',
  'Proprietorship',
  'Partnership Firm',
  'Private Limited Company',
  'LLP',
  'Other',
];

export const EXPERIENCE_RANGE_OPTIONS: ExperienceRangeOption[] = [
  'Less than 1 year',
  '1–3 years',
  '3–5 years',
  '5–10 years',
  'More than 10 years',
];

export const WARRANTY_POLICY_OPTIONS: WarrantyPolicyOption[] = [
  'Yes',
  'No',
  'Depends on the service',
];

export const INSTALLATION_TEAM_OPTIONS: InstallationTeamOption[] = [
  'Yes',
  'No',
  'Work with subcontractors',
];

export const VENDOR_FORM_CATEGORIES: VendorFormCategoryOption[] = [
  'Rooftop Solar',
  'Waterproofing',
  'Home Painting',
  'Modular Kitchens',
  'Air Conditioning',
  'CCTV and Smart Home',
  'Electrical Services',
  'Plumbing Services',
  'Water Purifiers',
  'Interior Design',
  'Home Renovation',
  'Pest Control',
  'Other',
];

export interface VendorDisplayServiceCategory {
  id: string;
  title: string;
  description: string;
  image: string;
  formCategory: VendorFormCategoryOption;
  iconKey:
    | 'solar'
    | 'waterproofing'
    | 'painting'
    | 'kitchen'
    | 'ac'
    | 'security'
    | 'electrical'
    | 'plumbing'
    | 'purifier'
    | 'interior'
    | 'pest'
    | 'other';
}

export const VENDOR_DISPLAY_SERVICE_CATEGORIES: VendorDisplayServiceCategory[] = [
  {
    id: 'rooftop-solar-installation',
    title: 'Rooftop Solar Installation',
    description:
      'On-grid and hybrid residential solar systems, net-metering, and MNRE-compliant installations.',
    image: '/images/rooftop-solar.jpg',
    formCategory: 'Rooftop Solar',
    iconKey: 'solar',
  },
  {
    id: 'waterproofing-leakage-solutions',
    title: 'Waterproofing and Leakage Solutions',
    description:
      'Terrace waterproofing, exterior wall damp-proofing, bathroom leakage treatment, and cool-roof coatings.',
    image: '/images/waterproofing.jpg',
    formCategory: 'Waterproofing',
    iconKey: 'waterproofing',
  },
  {
    id: 'home-painting',
    title: 'Home Painting',
    description:
      'Interior and exterior residential painting, putty preparation, texture finishes, and wood polishing.',
    image: '/images/festive-painting.jpg',
    formCategory: 'Home Painting',
    iconKey: 'painting',
  },
  {
    id: 'modular-kitchens-wardrobes',
    title: 'Modular Kitchens and Wardrobes',
    description:
      'Factory-finished modular kitchens, marine-ply cabinetry, wardrobes, and precision hardware fittings.',
    image: '/images/modular-kitchen.jpg',
    formCategory: 'Modular Kitchens',
    iconKey: 'kitchen',
  },
  {
    id: 'air-conditioning-appliances',
    title: 'Air Conditioning and Appliances',
    description:
      'Split and inverter AC supply, copper piping installation, seasonal servicing, and home appliances.',
    image: '/images/air-conditioners.jpg',
    formCategory: 'Air Conditioning',
    iconKey: 'ac',
  },
  {
    id: 'cctv-smart-home-security',
    title: 'CCTV and Smart Home Security',
    description:
      'Multi-camera residential CCTV systems, smart video doorbells, digital locks, and perimeter security.',
    image: '/images/cctv-security.jpg',
    formCategory: 'CCTV and Smart Home',
    iconKey: 'security',
  },
  {
    id: 'electrical-services',
    title: 'Electrical Services',
    description:
      'Home inverter and battery backup setups, distribution board upgrades, earthing, and BLDC/LED retrofits.',
    image: '/images/inverters-batteries.jpg',
    formCategory: 'Electrical Services',
    iconKey: 'electrical',
  },
  {
    id: 'plumbing-services',
    title: 'Plumbing Services',
    description:
      'Bathroom pipe replacements, pressure pumps, solar/storage water heaters, and rainwater harvesting.',
    image: '/images/bathroom-improvements.jpg',
    formCategory: 'Plumbing Services',
    iconKey: 'plumbing',
  },
  {
    id: 'water-purifiers-solutions',
    title: 'Water Purifiers and Water Solutions',
    description:
      'RO/UV water purifiers, whole-house water softeners, overhead tank cleaning, and filtration maintenance.',
    image: '/images/water-purifiers.jpg',
    formCategory: 'Water Purifiers',
    iconKey: 'purifier',
  },
  {
    id: 'interior-design-renovation',
    title: 'Interior Design and Home Renovation',
    description:
      'Turnkey home interiors, false ceilings, civil modifications, flooring, and full-room renovations.',
    image: '/images/interior-painting.jpg',
    formCategory: 'Interior Design',
    iconKey: 'interior',
  },
  {
    id: 'pest-control-anti-termite',
    title: 'Pest Control and Anti-Termite Services',
    description:
      'Pre- and post-construction anti-termite treatment, odourless residential pest control, and wood preservation.',
    image: '/images/pest-control.jpg',
    formCategory: 'Pest Control',
    iconKey: 'pest',
  },
  {
    id: 'other-home-improvement',
    title: 'Other Home Improvement Services',
    description:
      'uPVC windows, mosquito mesh doors, blinds and curtains, furniture, and specialised residential crafts.',
    image: '/images/upvc-windows.jpg',
    formCategory: 'Other',
    iconKey: 'other',
  },
];

export interface VendorBenefitCard {
  id: string;
  number: string;
  title: string;
  description: string;
  image: string;
}

export const VENDOR_BENEFIT_CARDS: VendorBenefitCard[] = [
  {
    id: 'group-demand',
    number: '01',
    title: 'Access to Group Demand',
    description:
      'Connect with multiple homeowners through organised group-service opportunities.',
    image: '/images/independent-house.jpg',
  },
  {
    id: 'local-opportunities',
    number: '02',
    title: 'Local Business Opportunities',
    description:
      'Receive relevant opportunities in your registered city and service categories.',
    image: '/images/apartment-building.jpg',
  },
  {
    id: 'competitive-network',
    number: '03',
    title: 'Competitive Vendor Network',
    description:
      'Participate in a transparent vendor quotation and selection process.',
    image: '/images/rooftop-solar.jpg',
  },
  {
    id: 'business-reputation',
    number: '04',
    title: 'Build Your Business Reputation',
    description:
      'Showcase your business, experience, completed projects, and service capabilities.',
    image: '/images/interior-painting.jpg',
  },
];

export interface VendorProcessStep {
  stepNumber: string;
  title: string;
  description: string;
}

export const VENDOR_PROCESS_STEPS: VendorProcessStep[] = [
  {
    stepNumber: '01',
    title: 'Register Your Business',
    description:
      'Submit your company information, location, service categories, and experience.',
  },
  {
    stepNumber: '02',
    title: 'Application Review',
    description:
      'Our team reviews your business details, documents, experience, and service capabilities.',
  },
  {
    stepNumber: '03',
    title: 'Verification and Discussion',
    description:
      'Shortlisted businesses may be contacted for additional information, document verification, and partnership discussions.',
  },
  {
    stepNumber: '04',
    title: 'Partnership Onboarding',
    description:
      'Selected businesses complete the onboarding process and may receive relevant group-service opportunities.',
  },
];

export interface VendorFaqItem {
  id: number;
  question: string;
  answer: string;
}

export const VENDOR_FAQ_ITEMS: VendorFaqItem[] = [
  {
    id: 1,
    question: 'Who can register as a Gharmalak vendor?',
    answer:
      'Established contractors, proprietorships, partnership firms, LLPs, private limited companies, and authorised dealers delivering residential home services across Nagpur, Wardha, Amravati, Pune, Chhatrapati Sambhajinagar, Nashik, or Chandrapur may submit an application.',
  },
  {
    id: 2,
    question: 'Is vendor registration free?',
    answer:
      'Submitting your vendor partnership application on Gharmalak is completely free. There is no fee to submit your business profile for review by our team.',
  },
  {
    id: 3,
    question: 'Does registration guarantee projects?',
    answer:
      'No. Gharmalak operates a selection-based partnership programme. Submitting an application does not guarantee approval, onboarding, or a fixed volume of homeowner projects or revenue.',
  },
  {
    id: 4,
    question: 'How many vendors will be selected per city?',
    answer:
      'Our initial onboarding target is up to 5 selected vendors per city across 7 cities (up to 35 vendor partnerships in total) so that participating partners can engage in well-organised group-service rounds.',
  },
  {
    id: 5,
    question: 'Can I register in multiple service categories?',
    answer:
      'Yes. In Section C of the registration form, you can select all home-service categories that your business is qualified and equipped to execute.',
  },
  {
    id: 6,
    question: 'What documents are required?',
    answer:
      'You may upload your Business Registration Certificate, GST Certificate, business PAN/identity document, previous work photographs, and company profile (PDF, JPG, JPEG, or PNG up to 5 MB each) if applicable. Uploading documents in the initial form is optional, though shortlisted vendors may be asked for verification documents during Step 3.',
  },
  {
    id: 7,
    question: 'How does Gharmalak select vendors?',
    answer:
      'Our team evaluates each applicant based on local track record, years of experience, material and workmanship standards, service warranty support, installation crew capability, and transparent benchmarking during discussions.',
  },
  {
    id: 8,
    question: 'How will vendors receive project opportunities?',
    answer:
      'Onboarded partners are invited to participate in relevant city-specific collective homeowner rounds and service enquiries matching their registered categories and service areas.',
  },
  {
    id: 9,
    question: 'Can I apply if my business is newly established?',
    answer:
      'Yes. You can select "Less than 1 year" under Years of Experience and share your team background, brand authorisations, or completed residential work for our review team to evaluate.',
  },
  {
    id: 10,
    question: 'How can I contact the Gharmalak team?',
    answer:
      'You can reach the Gharmalak partnership desk via WhatsApp at +91 77678 77675 or submit the Vendor Registration Form on this page with your contact details.',
  },
];

export type VendorDocumentSlotKey =
  | 'registrationCertificate'
  | 'gstCertificate'
  | 'panDocument'
  | 'workPhotographs'
  | 'companyProfile';

export interface VendorUploadedDocumentPayload {
  slot: VendorDocumentSlotKey;
  label: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  base64Content?: string;
}

export const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB per file
export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
] as const;

export interface VendorRegistrationFormInput {
  // Section A — Business Information
  businessName: string;
  contactPersonName: string;
  businessType: BusinessEntityType | '';
  yearOfEstablishment: string;
  businessEmail: string;
  primaryMobile: string;
  whatsappNumber: string;
  businessWebsite: string;
  socialProfile: string;

  // Section B — Location Details
  city: VendorPartnerCity | '';
  businessAddress: string;
  pinCode: string;
  areasServed: string;

  // Section C — Service Categories
  serviceCategories: VendorFormCategoryOption[];
  otherServiceDescription: string;

  // Section D — Business Experience
  yearsOfExperience: ExperienceRangeOption | '';
  completedProjectsCount: string;
  teamSizeCount: string;
  businessDescription: string;
  brandsWorkedWith: string;
  providesWarranty: WarrantyPolicyOption | '';
  installationTeamType: InstallationTeamOption | '';

  // Section E — Documents and Project Portfolio
  documents: VendorUploadedDocumentPayload[];

  // Section F — Final Declaration
  confirmAccurate: boolean;
  agreeContact: boolean;
  agreeTerms: boolean;
}

export type VendorFormErrorKey =
  | 'businessName'
  | 'contactPersonName'
  | 'businessType'
  | 'yearOfEstablishment'
  | 'businessEmail'
  | 'primaryMobile'
  | 'whatsappNumber'
  | 'city'
  | 'businessAddress'
  | 'pinCode'
  | 'areasServed'
  | 'serviceCategories'
  | 'otherServiceDescription'
  | 'yearsOfExperience'
  | 'businessDescription'
  | 'documents'
  | 'declarations'
  | 'server';

export type VendorRegistrationFormErrors = Partial<Record<VendorFormErrorKey, string>>;

export function createInitialVendorFormState(
  initialCity?: string | null
): VendorRegistrationFormInput {
  const matchedCity = VENDOR_PARTNER_CITIES.find((c) => c.city === initialCity)?.city ?? '';
  return {
    businessName: '',
    contactPersonName: '',
    businessType: '',
    yearOfEstablishment: '',
    businessEmail: '',
    primaryMobile: '',
    whatsappNumber: '',
    businessWebsite: '',
    socialProfile: '',
    city: matchedCity,
    businessAddress: '',
    pinCode: '',
    areasServed: '',
    serviceCategories: [],
    otherServiceDescription: '',
    yearsOfExperience: '',
    completedProjectsCount: '',
    teamSizeCount: '',
    businessDescription: '',
    brandsWorkedWith: '',
    providesWarranty: '',
    installationTeamType: '',
    documents: [],
    confirmAccurate: false,
    agreeContact: false,
    agreeTerms: false,
  };
}

export function isValidBusinessEmail(email: string): boolean {
  const trimmed = String(email || '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

export function isValidIndianPinCode(pin: string): boolean {
  const cleaned = String(pin || '').trim();
  return /^[1-9]\d{5}$/.test(cleaned);
}

export function isValidVendorCity(city: string): city is VendorPartnerCity {
  return VENDOR_PARTNER_CITIES.some((c) => c.city === city);
}

export function validateDocumentFile(file: {
  name: string;
  type: string;
  size: number;
}): { valid: boolean; error?: string } {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const validExt = ['pdf', 'jpg', 'jpeg', 'png'].includes(ext);
  const validMime =
    ALLOWED_DOCUMENT_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number]
    ) || file.type === '';

  if (!validExt || !validMime) {
    return {
      valid: false,
      error: `"${file.name}" must be a PDF, JPG, JPEG, or PNG file.`,
    };
  }

  if (file.size <= 0) {
    return {
      valid: false,
      error: `"${file.name}" appears to be empty.`,
    };
  }

  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return {
      valid: false,
      error: `"${file.name}" exceeds the 5 MB file-size limit.`,
    };
  }

  return { valid: true };
}

export function validateVendorApplicationForm(
  form: VendorRegistrationFormInput
): VendorRegistrationFormErrors {
  const errors: VendorRegistrationFormErrors = {};

  if (!form.businessName || form.businessName.trim().length < 2) {
    errors.businessName = 'Please enter your registered business or company name.';
  }

  if (!form.contactPersonName || form.contactPersonName.trim().length < 2) {
    errors.contactPersonName = 'Please enter the business owner or contact person name.';
  }

  if (!form.businessType || !BUSINESS_ENTITY_TYPES.includes(form.businessType)) {
    errors.businessType = 'Please select your business type.';
  }

  if (form.yearOfEstablishment.trim()) {
    const yr = Number(form.yearOfEstablishment.trim());
    const currentYear = new Date().getFullYear();
    if (!Number.isInteger(yr) || yr < 1950 || yr > currentYear) {
      errors.yearOfEstablishment = `Please enter a valid year between 1950 and ${currentYear}.`;
    }
  }

  if (!isValidBusinessEmail(form.businessEmail)) {
    errors.businessEmail = 'Please enter a valid business email address.';
  }

  if (!isValidIndianPhone(form.primaryMobile)) {
    errors.primaryMobile = 'Please enter a valid 10-digit Indian mobile number.';
  }

  if (!isValidIndianPhone(form.whatsappNumber)) {
    errors.whatsappNumber = 'Please enter a valid 10-digit WhatsApp number.';
  }

  if (!form.city || !isValidVendorCity(form.city)) {
    errors.city = 'Please select your primary operating city.';
  }

  if (!form.businessAddress || form.businessAddress.trim().length < 5) {
    errors.businessAddress = 'Please enter your complete business address.';
  }

  if (!isValidIndianPinCode(form.pinCode)) {
    errors.pinCode = 'Please enter a valid 6-digit PIN code.';
  }

  if (!form.areasServed || form.areasServed.trim().length < 2) {
    errors.areasServed = 'Please list the areas or localities your business serves.';
  }

  if (!Array.isArray(form.serviceCategories) || form.serviceCategories.length === 0) {
    errors.serviceCategories = 'Please select at least one service category.';
  } else if (
    form.serviceCategories.includes('Other') &&
    (!form.otherServiceDescription || form.otherServiceDescription.trim().length < 2)
  ) {
    errors.otherServiceDescription = 'Please specify the other home service you provide.';
  }

  if (
    !form.yearsOfExperience ||
    !EXPERIENCE_RANGE_OPTIONS.includes(form.yearsOfExperience)
  ) {
    errors.yearsOfExperience = 'Please select your years of business experience.';
  }

  if (!form.businessDescription || form.businessDescription.trim().length < 10) {
    errors.businessDescription =
      'Please provide a brief description of your business and capabilities (at least 10 characters).';
  }

  if (Array.isArray(form.documents)) {
    for (const doc of form.documents) {
      const check = validateDocumentFile({
        name: doc.fileName,
        type: doc.mimeType,
        size: doc.sizeBytes,
      });
      if (!check.valid) {
        errors.documents = check.error;
        break;
      }
    }
  }

  if (!form.confirmAccurate || !form.agreeContact || !form.agreeTerms) {
    errors.declarations =
      'Please confirm all three declaration checkboxes before submitting your application.';
  }

  return errors;
}

export function formatVendorApplicationId(city: VendorPartnerCity, sequenceNumber: number): string {
  const cityMeta = VENDOR_PARTNER_CITIES.find((c) => c.city === city);
  const code = cityMeta ? cityMeta.cityCode : 'IND';
  const seq = String(Math.max(1, sequenceNumber)).padStart(4, '0');
  return `GM-VND-${code}-${seq}`;
}

export interface VendorApplicationRecord {
  applicationId: string;
  businessName: string;
  contactPerson: string;
  businessType: BusinessEntityType;
  yearOfEstablishment: string;
  businessEmail: string;
  mobileNumber: string;
  whatsappNumber: string;
  businessWebsite: string;
  socialProfile: string;
  city: VendorPartnerCity;
  businessAddress: string;
  pinCode: string;
  areasServed: string;
  serviceCategories: VendorFormCategoryOption[];
  otherServiceDescription: string;
  experience: ExperienceRangeOption;
  completedProjectsCount: string;
  teamSizeCount: string;
  businessDescription: string;
  brandsWorkedWith: string;
  providesWarranty: string;
  installationTeamType: string;
  documents: {
    slot: VendorDocumentSlotKey;
    label: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    storedPrivateFile?: string;
  }[];
  submissionDate: string;
  applicationStatus: VendorApplicationStatus;
}

export function normalizeVendorFormForSubmission(
  form: VendorRegistrationFormInput
): VendorRegistrationFormInput {
  return {
    ...form,
    businessName: form.businessName.trim(),
    contactPersonName: form.contactPersonName.trim(),
    yearOfEstablishment: form.yearOfEstablishment.trim(),
    businessEmail: form.businessEmail.trim().toLowerCase(),
    primaryMobile: normalizeIndianPhone(form.primaryMobile),
    whatsappNumber: normalizeIndianPhone(form.whatsappNumber),
    businessWebsite: form.businessWebsite.trim(),
    socialProfile: form.socialProfile.trim(),
    businessAddress: form.businessAddress.trim(),
    pinCode: form.pinCode.trim(),
    areasServed: form.areasServed.trim(),
    otherServiceDescription: form.serviceCategories.includes('Other')
      ? form.otherServiceDescription.trim()
      : '',
    completedProjectsCount: form.completedProjectsCount.trim(),
    teamSizeCount: form.teamSizeCount.trim(),
    businessDescription: form.businessDescription.trim(),
    brandsWorkedWith: form.brandsWorkedWith.trim(),
  };
}
