import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CLUB_CONFIG,
  DEALS,
  DEFAULT_EXPANDED_SEASON,
  DEFAULT_EXPANDED_SEASONS,
  ROUNDS,
  SEASON_CATEGORIES,
  formatRupees,
  normalizeIndianPhone,
  isValidIndianPhone,
  findNearestCity,
  getRemainingSeats,
  getRoundProgress,
  filterDealsByCity,
  isSeasonGroupExpanded,
  toggleSeasonExpanded,
  validateJoinForm,
  validateDealInterestForm,
} from './clubData';

const ERR_MSGS = {
  f_err_name: 'Please enter your name.',
  f_err_phone: 'Please enter a 10-digit mobile number.',
  f_err_area: 'Please choose your area.',
  f_err_home: 'Please choose your home type.',
  f_err_consent: 'Please tick the box to continue.',
};

test('all 23 original Phase 1 deals and 5 rounds are preserved', () => {
  assert.equal(ROUNDS.length, 5);
  assert.equal(DEALS.length, 23);
  for (const deal of DEALS) {
    assert.ok(deal.image.startsWith('/images/'), `Deal ${deal.id} must have a local image path`);
    assert.ok(deal.title.length > 3);
    assert.ok(deal.ticket.includes('₹'));
  }
});

test('formatRupees formats Indian currency properly', () => {
  assert.equal(formatRupees(499), '₹499');
  assert.equal(formatRupees(999), '₹999');
  assert.equal(formatRupees(1500), '₹1,500');
});

test('phone validation and normalization handles Indian mobile numbers', () => {
  assert.equal(isValidIndianPhone('9876543210'), true);
  assert.equal(isValidIndianPhone('+91 98765 43210'), true);
  assert.equal(normalizeIndianPhone('+91 98765 43210'), '9876543210');
  assert.equal(isValidIndianPhone('1234567890'), false);
  assert.equal(isValidIndianPhone('98765'), false);
});

test('getRemainingSeats and getRoundProgress compute accurate metrics', () => {
  const seats = getRemainingSeats(1);
  assert.equal(seats.joined, 1);
  assert.equal(seats.remaining, CLUB_CONFIG.foundingSeats - 1);
  assert.equal(seats.percentFull, 0);

  const progress = getRoundProgress(10);
  assert.equal(progress.optins, 10);
  assert.equal(progress.target, 50);
  assert.equal(progress.percent, 20);
});

test('findNearestCity resolves Nagpur coordinates within 80km', () => {
  const nearNagpur = findNearestCity(21.15, 79.09);
  assert.equal(nearNagpur.city, 'Nagpur');
  assert.ok(nearNagpur.km < 5);

  const farAway = findNearestCity(12.9716, 77.5946); // Bengaluru
  assert.equal(farAway.city, 'Other');
});

test('filterDealsByCity filters multi-city vs Nagpur local crew deals', () => {
  const nagpurDeals = filterDealsByCity('Nagpur');
  assert.equal(nagpurDeals.length, 23);

  const puneDeals = filterDealsByCity('Pune');
  assert.ok(puneDeals.length < 23);
  assert.ok(puneDeals.every((d) => d.reach === 'multi'));
});

test('validateJoinForm and validateDealInterestForm enforce all required fields', () => {
  const emptyErrs = validateJoinForm(
    { name: '', phone: '123', area: '', home: '', interests: [], consent: false },
    ERR_MSGS
  );
  assert.equal(Object.keys(emptyErrs).length, 5);

  const validErrs = validateJoinForm(
    {
      name: 'Priya Deshmukh',
      phone: '9876543210',
      area: 'Dharampeth',
      home: 'house',
      interests: ['solar'],
      consent: true,
    },
    ERR_MSGS
  );
  assert.equal(Object.keys(validErrs).length, 0);

  const interestErrs = validateDealInterestForm({
    deals: [],
    name: 'A',
    phone: '555',
    city: 'Nagpur',
    consent: false,
  });
  assert.equal(Object.keys(interestErrs).length, 4);
});

test('all 6 seasons are collapsed by default (DEFAULT_EXPANDED_SEASON = null) and only one season opens at a time', () => {
  assert.equal(SEASON_CATEGORIES.length, 6);
  assert.equal(DEFAULT_EXPANDED_SEASON, null);

  for (const season of SEASON_CATEGORIES) {
    assert.equal(DEFAULT_EXPANDED_SEASONS[season.id], false);
    assert.equal(isSeasonGroupExpanded(DEFAULT_EXPANDED_SEASON, season.id), false);
  }

  // Clicking Spring expands only Spring
  const afterSpringClick = toggleSeasonExpanded(DEFAULT_EXPANDED_SEASON, 'spring');
  assert.equal(afterSpringClick, 'spring');
  assert.equal(isSeasonGroupExpanded(afterSpringClick, 'spring'), true);
  assert.equal(isSeasonGroupExpanded(afterSpringClick, 'summer'), false);
  assert.equal(isSeasonGroupExpanded(afterSpringClick, 'monsoon'), false);
  assert.equal(isSeasonGroupExpanded(afterSpringClick, 'winter'), false);
  assert.equal(isSeasonGroupExpanded(afterSpringClick, 'festive'), false);
  assert.equal(isSeasonGroupExpanded(afterSpringClick, 'year_round'), false);

  // Clicking Summer while Spring is open automatically collapses Spring and expands Summer
  const afterSummerClick = toggleSeasonExpanded(afterSpringClick, 'summer');
  assert.equal(afterSummerClick, 'summer');
  assert.equal(isSeasonGroupExpanded(afterSummerClick, 'spring'), false);
  assert.equal(isSeasonGroupExpanded(afterSummerClick, 'summer'), true);

  // Clicking an already expanded season (Summer) collapses it back to null
  const afterSummerCollapse = toggleSeasonExpanded(afterSummerClick, 'summer');
  assert.equal(afterSummerCollapse, null);
  for (const season of SEASON_CATEGORIES) {
    assert.equal(isSeasonGroupExpanded(afterSummerCollapse, season.id), false);
  }
});
