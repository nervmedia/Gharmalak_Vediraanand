import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MEMBER_CITIES,
  MEMBERSHIP_POPUP_CONTENT,
  MEMBERSHIP_TRANSPARENCY_NOTICE,
  MemberProfile,
  canAccessMemberDeals,
  computeEffectiveMembershipStatus,
  formatMemberId,
  getHeaderMembershipIndicator,
  normalizeRegistrationPayload,
  validateMembershipLogin,
  validateMembershipRegistration,
} from './membershipData';

test('MEMBER_CITIES and constants match the 7 Gharmalak cities and popup copy', () => {
  assert.deepEqual(MEMBER_CITIES, [
    'Nagpur',
    'Wardha',
    'Amravati',
    'Pune',
    'Chhatrapati Sambhajinagar',
    'Nashik',
    'Chandrapur',
  ]);
  assert.equal(MEMBERSHIP_POPUP_CONTENT.heading, 'Good things happen when we buy together!');
  assert.equal(
    MEMBERSHIP_POPUP_CONTENT.supportingText,
    'Become a Gharmalak Club member to unlock exclusive group deals and participate in homeowner savings rounds.'
  );
  assert.deepEqual(MEMBERSHIP_POPUP_CONTENT.benefits, [
    'Access and unlock eligible group deals.',
    'Participate in available group-buying rounds.',
    'Receive relevant homeowner deal updates.',
  ]);
  assert.equal(
    MEMBERSHIP_TRANSPARENCY_NOTICE,
    'Browsing is free. Membership is required to unlock deals and participate in group rounds.'
  );
});

test('validateMembershipRegistration enforces required fields and accepts valid Indian inputs', () => {
  const invalidErrors = validateMembershipRegistration({
    name: 'A',
    mobileNumber: '12345',
    whatsappNumber: '999',
    email: 'not-an-email',
    city: '',
    pinCode: '00123',
    password: '123',
    consent: false,
  });

  assert.ok(invalidErrors.name);
  assert.ok(invalidErrors.mobileNumber);
  assert.ok(invalidErrors.whatsappNumber);
  assert.ok(invalidErrors.email);
  assert.ok(invalidErrors.city);
  assert.ok(invalidErrors.pinCode);
  assert.ok(invalidErrors.password);
  assert.ok(invalidErrors.consent);

  const validErrors = validateMembershipRegistration({
    name: 'Rohan Kulkarni',
    mobileNumber: '+91 98234 56789',
    whatsappNumber: '9823456789',
    email: 'rohan@example.com',
    city: 'Nagpur',
    pinCode: '440010',
    password: 'SecretPassword123',
    consent: true,
  });

  assert.deepEqual(validErrors, {});
});

test('validateMembershipLogin validates phone or email identifier and password', () => {
  const emptyErrors = validateMembershipLogin({ identifier: '', password: '' });
  assert.ok(emptyErrors.identifier);
  assert.ok(emptyErrors.password);

  const validPhoneLogin = validateMembershipLogin({
    identifier: '9823456789',
    password: 'mypassword',
  });
  assert.deepEqual(validPhoneLogin, {});

  const validEmailLogin = validateMembershipLogin({
    identifier: 'member@gharmalak.com',
    password: 'mypassword',
  });
  assert.deepEqual(validEmailLogin, {});
});

test('computeEffectiveMembershipStatus and canAccessMemberDeals enforce payment and expiry rules', () => {
  const refDate = new Date('2026-11-01T00:00:00Z');

  // 1. Null visitor -> Not Registered, cannot access deals
  assert.equal(computeEffectiveMembershipStatus(null, refDate), 'Not Registered');
  assert.equal(canAccessMemberDeals(null, refDate), false);

  // 2. Payment Pending -> cannot access deals
  const pendingMember: Pick<
    MemberProfile,
    'membershipStatus' | 'paymentStatus' | 'membershipExpiryDate'
  > = {
    membershipStatus: 'Payment Pending',
    paymentStatus: 'Pending',
    membershipExpiryDate: null,
  };
  assert.equal(computeEffectiveMembershipStatus(pendingMember, refDate), 'Payment Pending');
  assert.equal(canAccessMemberDeals(pendingMember, refDate), false);

  // 3. Failed payment -> cannot access deals even if status was tampered
  const failedMember: Pick<
    MemberProfile,
    'membershipStatus' | 'paymentStatus' | 'membershipExpiryDate'
  > = {
    membershipStatus: 'Active',
    paymentStatus: 'Failed',
    membershipExpiryDate: '2027-11-01T00:00:00Z',
  };
  assert.equal(computeEffectiveMembershipStatus(failedMember, refDate), 'Payment Pending');
  assert.equal(canAccessMemberDeals(failedMember, refDate), false);

  // 4. Paid & Active & Future expiry -> Active, can access deals
  const activeMember: Pick<
    MemberProfile,
    'membershipStatus' | 'paymentStatus' | 'membershipExpiryDate'
  > = {
    membershipStatus: 'Active',
    paymentStatus: 'Paid',
    membershipExpiryDate: '2027-11-01T00:00:00Z',
  };
  assert.equal(computeEffectiveMembershipStatus(activeMember, refDate), 'Active');
  assert.equal(canAccessMemberDeals(activeMember, refDate), true);

  // 5. Paid & Past expiry -> Expired, cannot access deals
  const expiredMember: Pick<
    MemberProfile,
    'membershipStatus' | 'paymentStatus' | 'membershipExpiryDate'
  > = {
    membershipStatus: 'Active',
    paymentStatus: 'Paid',
    membershipExpiryDate: '2026-10-15T00:00:00Z',
  };
  assert.equal(computeEffectiveMembershipStatus(expiredMember, refDate), 'Expired');
  assert.equal(canAccessMemberDeals(expiredMember, refDate), false);

  // 6. Cancelled -> Cancelled, cannot access deals
  const cancelledMember: Pick<
    MemberProfile,
    'membershipStatus' | 'paymentStatus' | 'membershipExpiryDate'
  > = {
    membershipStatus: 'Cancelled',
    paymentStatus: 'Paid',
    membershipExpiryDate: '2027-11-01T00:00:00Z',
  };
  assert.equal(computeEffectiveMembershipStatus(cancelledMember, refDate), 'Cancelled');
  assert.equal(canAccessMemberDeals(cancelledMember, refDate), false);
});

test('getHeaderMembershipIndicator returns correct header state for visitor, active, expired, and pending', () => {
  const refDate = new Date('2026-11-01T00:00:00Z');

  assert.deepEqual(getHeaderMembershipIndicator(null, refDate), {
    state: 'visitor',
    label: 'Join the club',
  });

  assert.deepEqual(
    getHeaderMembershipIndicator(
      {
        memberId: 'GM · 0002 · NGP',
        membershipStatus: 'Active',
        paymentStatus: 'Paid',
        membershipExpiryDate: '2027-11-01T00:00:00Z',
      },
      refDate
    ),
    {
      state: 'active',
      label: 'My Membership',
      badgeText: 'Active',
    }
  );

  assert.deepEqual(
    getHeaderMembershipIndicator(
      {
        memberId: 'GM · 0002 · NGP',
        membershipStatus: 'Active',
        paymentStatus: 'Paid',
        membershipExpiryDate: '2026-01-01T00:00:00Z',
      },
      refDate
    ),
    {
      state: 'expired',
      label: 'Renew Membership',
      badgeText: 'Expired',
    }
  );

  assert.deepEqual(
    getHeaderMembershipIndicator(
      {
        memberId: 'GM · 0002 · NGP',
        membershipStatus: 'Payment Pending',
        paymentStatus: 'Pending',
        membershipExpiryDate: null,
      },
      refDate
    ),
    {
      state: 'pending',
      label: 'Complete Membership',
      badgeText: 'Pending',
    }
  );
});

test('formatMemberId and normalizeRegistrationPayload format data cleanly', () => {
  assert.equal(formatMemberId('Nagpur', 1), 'GM · 0001 · NGP');
  assert.equal(formatMemberId('Pune', 24), 'GM · 0024 · PUN');

  const normalized = normalizeRegistrationPayload({
    name: '  Aarti Joshi ',
    mobileNumber: '+91 98230 11223',
    whatsappNumber: '09823011223',
    email: '  Aarti.Joshi@Example.COM ',
    city: 'Pune',
    pinCode: ' 411001 ',
    password: 'securePassword',
    consent: true,
  });

  assert.equal(normalized.name, 'Aarti Joshi');
  assert.equal(normalized.mobileNumber, '9823011223');
  assert.equal(normalized.whatsappNumber, '9823011223');
  assert.equal(normalized.email, 'aarti.joshi@example.com');
  assert.equal(normalized.pinCode, '411001');
});
