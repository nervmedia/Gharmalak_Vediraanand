import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BUSINESS_ENTITY_TYPES,
  EXPERIENCE_RANGE_OPTIONS,
  MAX_DOCUMENT_SIZE_BYTES,
  VENDOR_APPLICATION_STATUSES,
  VENDOR_BENEFIT_CARDS,
  VENDOR_DISPLAY_SERVICE_CATEGORIES,
  VENDOR_FAQ_ITEMS,
  VENDOR_FORM_CATEGORIES,
  VENDOR_PARTNER_CITIES,
  VENDOR_PROCESS_STEPS,
  VENDOR_PROGRAMME_CONFIG,
  createInitialVendorFormState,
  formatVendorApplicationId,
  isValidBusinessEmail,
  isValidIndianPinCode,
  isValidVendorCity,
  normalizeVendorFormForSubmission,
  validateDocumentFile,
  validateVendorApplicationForm,
} from './forBusinessData';

test('VENDOR_PARTNER_CITIES defines all 7 initial cities with up to 5 vendors per city (35 total)', () => {
  assert.equal(VENDOR_PARTNER_CITIES.length, 7);
  assert.equal(VENDOR_PROGRAMME_CONFIG.maxVendorsPerCity, 5);
  assert.equal(VENDOR_PROGRAMME_CONFIG.totalCities, 7);
  assert.equal(VENDOR_PROGRAMME_CONFIG.totalTargetVendors, 35);

  const expectedCities = [
    'Nagpur',
    'Wardha',
    'Amravati',
    'Pune',
    'Chhatrapati Sambhajinagar',
    'Nashik',
    'Chandrapur',
  ];
  assert.deepEqual(
    VENDOR_PARTNER_CITIES.map((c) => c.city),
    expectedCities
  );
  for (const cityCard of VENDOR_PARTNER_CITIES) {
    assert.equal(cityCard.targetLabel, 'Up to 5 vendors');
    assert.equal(isValidVendorCity(cityCard.city), true);
  }
  assert.equal(isValidVendorCity('Mumbai'), false);
});

test('service categories, benefits, process steps, and FAQs match exact specifications', () => {
  assert.equal(VENDOR_BENEFIT_CARDS.length, 4);
  assert.equal(VENDOR_DISPLAY_SERVICE_CATEGORIES.length, 12);
  assert.equal(VENDOR_FORM_CATEGORIES.length, 13);
  assert.equal(VENDOR_PROCESS_STEPS.length, 4);
  assert.equal(VENDOR_FAQ_ITEMS.length, 10);
  assert.equal(BUSINESS_ENTITY_TYPES.length, 6);
  assert.equal(EXPERIENCE_RANGE_OPTIONS.length, 5);
  assert.deepEqual(VENDOR_APPLICATION_STATUSES, [
    'New Application',
    'Under Review',
    'Shortlisted',
    'Verification Pending',
    'Approved',
    'Rejected',
  ]);
});

test('validateVendorApplicationForm enforces all required fields and Other category specification', () => {
  const emptyForm = createInitialVendorFormState();
  const emptyErrors = validateVendorApplicationForm(emptyForm);

  assert.ok(emptyErrors.businessName);
  assert.ok(emptyErrors.contactPersonName);
  assert.ok(emptyErrors.businessType);
  assert.ok(emptyErrors.businessEmail);
  assert.ok(emptyErrors.primaryMobile);
  assert.ok(emptyErrors.whatsappNumber);
  assert.ok(emptyErrors.city);
  assert.ok(emptyErrors.businessAddress);
  assert.ok(emptyErrors.pinCode);
  assert.ok(emptyErrors.areasServed);
  assert.ok(emptyErrors.serviceCategories);
  assert.ok(emptyErrors.yearsOfExperience);
  assert.ok(emptyErrors.businessDescription);
  assert.ok(emptyErrors.declarations);

  // Valid form with "Other" selected but missing otherServiceDescription
  const formWithOtherMissing = {
    ...createInitialVendorFormState('Nagpur'),
    businessName: 'SuryaKiran Solar & Electricals Pvt Ltd',
    contactPersonName: 'Rajesh Deshmukh',
    businessType: 'Private Limited Company' as const,
    yearOfEstablishment: '2018',
    businessEmail: 'contact@suryakiransolar.in',
    primaryMobile: '+91 98230 12345',
    whatsappNumber: '9823012345',
    businessAddress: 'Plot 42, Ring Road, Pratap Nagar, Nagpur',
    pinCode: '440022',
    areasServed: 'Pratap Nagar, Dharampeth, Manish Nagar',
    serviceCategories: ['Rooftop Solar' as const, 'Other' as const],
    otherServiceDescription: '',
    yearsOfExperience: '5–10 years' as const,
    businessDescription:
      'MNRE-registered residential solar EPC contractor serving Vidarbha homeowners.',
    confirmAccurate: true,
    agreeContact: true,
    agreeTerms: true,
  };

  const otherMissingErrors = validateVendorApplicationForm(formWithOtherMissing);
  assert.equal(Object.keys(otherMissingErrors).length, 1);
  assert.ok(otherMissingErrors.otherServiceDescription);

  // Provide otherServiceDescription -> 0 validation errors
  const validForm = {
    ...formWithOtherMissing,
    otherServiceDescription: 'Solar water heating systems',
  };
  const validErrors = validateVendorApplicationForm(validForm);
  assert.equal(Object.keys(validErrors).length, 0);

  const normalized = normalizeVendorFormForSubmission(validForm);
  assert.equal(normalized.primaryMobile, '9823012345');
  assert.equal(normalized.whatsappNumber, '9823012345');
  assert.equal(normalized.businessEmail, 'contact@suryakiransolar.in');
});

test('email, PIN code, document file validation, and application ID formatting work accurately', () => {
  assert.equal(isValidBusinessEmail('vendor@gharmalak.com'), true);
  assert.equal(isValidBusinessEmail('invalid-email'), false);
  assert.equal(isValidIndianPinCode('440001'), true);
  assert.equal(isValidIndianPinCode('040001'), false);
  assert.equal(isValidIndianPinCode('4400'), false);

  assert.equal(
    validateDocumentFile({ name: 'gst-cert.pdf', type: 'application/pdf', size: 250_000 }).valid,
    true
  );
  assert.equal(
    validateDocumentFile({ name: 'site-photo.jpg', type: 'image/jpeg', size: 800_000 }).valid,
    true
  );
  assert.equal(
    validateDocumentFile({ name: 'script.exe', type: 'application/octet-stream', size: 1000 })
      .valid,
    false
  );
  assert.equal(
    validateDocumentFile({
      name: 'huge.pdf',
      type: 'application/pdf',
      size: MAX_DOCUMENT_SIZE_BYTES + 100,
    }).valid,
    false
  );

  assert.equal(formatVendorApplicationId('Nagpur', 1), 'GM-VND-NAG-0001');
  assert.equal(
    formatVendorApplicationId('Chhatrapati Sambhajinagar', 14),
    'GM-VND-CSN-0014'
  );
});
