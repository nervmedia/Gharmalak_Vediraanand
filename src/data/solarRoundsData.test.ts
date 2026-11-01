import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_SOLAR_ROUND_ID,
  SOLAR_INTEREST_CONFIRMATION_MESSAGE,
  SOLAR_ROUND_IDS,
  buildSolarRoundInterestPayload,
  calculateSolarRoundProgress,
  getSolarRoundById,
  getSolarRoundByNumber,
  getSolarRoundInterestLabel,
  getSolarRoundWhatsAppUrl,
  getSolarRoundsData,
  validateSolarRoundInterestForm,
} from './solarRoundsData';

test('getSolarRoundsData returns exactly 5 independent solar rounds with Solar Round 1 as default', () => {
  const rounds = getSolarRoundsData('en', 12, '2026-10-31');
  assert.equal(rounds.length, 5);
  assert.equal(DEFAULT_SOLAR_ROUND_ID, 'solar-round-1');
  assert.deepEqual(
    rounds.map((r) => r.tabLabel),
    ['Solar Round 1', 'Solar Round 2', 'Solar Round 3', 'Solar Round 4', 'Solar Round 5']
  );
  assert.deepEqual(
    rounds.map((r) => r.id),
    [...SOLAR_ROUND_IDS]
  );
});

test('each of the 5 solar rounds uses a unique rooftop solar installation photograph', () => {
  const rounds = getSolarRoundsData('en', 5, '2026-10-31');
  const images = rounds.map((r) => r.image);
  const uniqueImages = new Set(images);
  assert.equal(uniqueImages.size, 5, 'All 5 rounds must have distinct image paths');
  assert.equal(rounds[0].image, '/images/rooftop-solar.jpg');
});

test('Solar Round 1 preserves verified launch data, updated Jan-Feb opt-in schedule, and reflects live opt-in count', () => {
  const rounds = getSolarRoundsData('en', 18, '2026-10-31');
  const r1 = rounds[0];
  assert.equal(r1.roundNumber, 1);
  assert.equal(r1.eyebrow, 'ROUND 1 · OPT-IN JAN–FEB');
  assert.equal(r1.isAcceptingOptIns, true);
  assert.equal(r1.status, 'Opt-in Jan–Feb');
  assert.equal(r1.participatingHomes, 18);
  assert.equal(r1.minimumHomes, 50);
  assert.equal(r1.openingDate, 'January');
  assert.equal(r1.closingDate, 'February');
  assert.equal(r1.optInWindowLabel, 'January – February');
  assert.equal(r1.priceInformation.value, 'Published in December');
  assert.equal(r1.benchmarkInformation.value, 'At least 10% lower');
});

test('all 5 solar rounds display their own distinct opt-in schedules and remove old 1 Nov schedule labels', () => {
  const rounds = getSolarRoundsData('en', 18, '2026-10-31');
  assert.deepEqual(
    rounds.map((r) => r.eyebrow),
    [
      'ROUND 1 · OPT-IN JAN–FEB',
      'ROUND 2 · OPT-IN MAR–APR',
      'ROUND 3 · OPT-IN MAY–JUN',
      'ROUND 4 · OPT-IN SEP–OCT',
      'ROUND 5 · OPT-IN NOV–DEC',
    ]
  );
  assert.deepEqual(
    rounds.map((r) => r.optInWindowLabel),
    [
      'January – February',
      'March – April',
      'May – June',
      'September – October',
      'November – December',
    ]
  );
  assert.deepEqual(
    rounds.map((r) => [r.openingDate, r.closingDate]),
    [
      ['January', 'February'],
      ['March', 'April'],
      ['May', 'June'],
      ['September', 'October'],
      ['November', 'December'],
    ]
  );

  for (const r of rounds) {
    assert.ok(!r.eyebrow.toLowerCase().includes('1 nov'), `Unexpected '1 Nov' in eyebrow for Round ${r.roundNumber}`);
    assert.ok(!r.status.toLowerCase().includes('1 nov'), `Unexpected '1 Nov' in status for Round ${r.roundNumber}`);
    assert.ok(!r.optInWindowLabel.toLowerCase().includes('1 nov'), `Unexpected '1 Nov' in optInWindowLabel for Round ${r.roundNumber}`);
  }

  for (const r of rounds.slice(1)) {
    assert.equal(r.isAcceptingOptIns, false);
    assert.ok(
      r.status === 'Upcoming' || r.status === 'Details Coming Soon',
      `Expected Upcoming or Details Coming Soon for Round ${r.roundNumber}, got ${r.status}`
    );
    assert.equal(r.participatingHomes, 0);
    assert.ok(r.optInInformation.whatsappPrefillText.includes(`Solar Round ${r.roundNumber}`));
  }
});

test('calculateSolarRoundProgress computes progress accurately for active and upcoming rounds', () => {
  const rounds = getSolarRoundsData('en', 25, '2026-10-31');
  const p1 = calculateSolarRoundProgress(rounds[0]);
  assert.equal(p1.participatingHomes, 25);
  assert.equal(p1.minimumHomes, 50);
  assert.equal(p1.percent, 50);
  assert.equal(p1.barWidthPercent, 50);

  const p2 = calculateSolarRoundProgress(rounds[1]);
  assert.equal(p2.participatingHomes, 0);
  assert.equal(p2.percent, 0);
  assert.equal(p2.barWidthPercent, 0);
});

test('lookup helpers and WhatsApp URL builder reference the selected round', () => {
  const rounds = getSolarRoundsData('en', 4, '2026-10-31');
  const r3 = getSolarRoundById(rounds, 'solar-round-3');
  assert.equal(r3.roundNumber, 3);
  const r4 = getSolarRoundByNumber(rounds, 4);
  assert.equal(r4.id, 'solar-round-4');
  const fallback = getSolarRoundById(rounds, 'invalid-id');
  assert.equal(fallback.id, 'solar-round-1');

  const waUrl = getSolarRoundWhatsAppUrl(r3);
  assert.ok(waUrl.includes(encodeURIComponent('Solar Round 3')));
});

test('validateSolarRoundInterestForm validates name, Indian mobile number, city, and consent', () => {
  const invalid = validateSolarRoundInterestForm({
    name: 'A',
    phone: '12345',
    city: '',
    consent: false,
  });
  assert.equal(Object.keys(invalid).length, 4);
  assert.ok(invalid.name);
  assert.ok(invalid.phone);
  assert.ok(invalid.city);
  assert.ok(invalid.consent);

  const valid = validateSolarRoundInterestForm({
    name: 'Rohan Kulkarni',
    phone: '+91 98230 12345',
    city: 'Nagpur',
    consent: true,
  });
  assert.equal(Object.keys(valid).length, 0);
});

test('buildSolarRoundInterestPayload captures the exact selected round (1 through 5) without hardcoding Round 1', () => {
  const rounds = getSolarRoundsData('en', 10, '2026-10-31');

  for (const round of rounds) {
    const payload = buildSolarRoundInterestPayload(round, {
      name: `Member Round ${round.roundNumber}`,
      phone: '+91 98765 43210',
      city: 'Pune',
      consent: true,
    });

    assert.equal(payload.roundId, `solar-round-${round.roundNumber}`);
    assert.equal(payload.roundNumber, round.roundNumber);
    assert.equal(payload.roundLabel, `Solar Round ${round.roundNumber}`);
    assert.equal(payload.interestLabel, `Interest in Solar Round ${round.roundNumber}`);
    assert.equal(payload.interestLabel, getSolarRoundInterestLabel(round.roundNumber));
    assert.equal(payload.phone, '9876543210');
    assert.equal(payload.city, 'Pune');
    assert.equal(payload.consent, true);
  }

  assert.equal(
    SOLAR_INTEREST_CONFIRMATION_MESSAGE,
    'Thank you for your interest! Our Gharmalak team will contact you with updates about your selected Solar Round.'
  );
});
