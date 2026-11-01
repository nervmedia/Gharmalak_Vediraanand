import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LOCATION_POPUP_DELAY_MS,
  SUPPORTED_CITIES,
  getSavedCity,
  isPopupDismissed,
  isSupportedCity,
  markPopupDismissed,
  matchSupportedCityByCoordinates,
  matchSupportedCityFromText,
  reverseGeocodeCoordinates,
  saveSelectedCity,
  shouldAutoScheduleLocationPopup,
} from './location';

function createMemoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
}

test('SUPPORTED_CITIES contains the exact 7 cities in order', () => {
  assert.deepEqual(SUPPORTED_CITIES, [
    'Amravati',
    'Wardha',
    'Nagpur',
    'Pune',
    'Chhatrapati Sambhajinagar',
    'Nashik',
    'Chandrapur',
  ]);
  assert.equal(LOCATION_POPUP_DELAY_MS, 18000);
});

test('isSupportedCity validates only the 7 supported cities', () => {
  for (const city of SUPPORTED_CITIES) {
    assert.equal(isSupportedCity(city), true);
  }
  assert.equal(isSupportedCity('Mumbai'), false);
  assert.equal(isSupportedCity(''), false);
  assert.equal(isSupportedCity(null), false);
});

test('matchSupportedCityFromText matches supported cities and official aliases', () => {
  assert.equal(matchSupportedCityFromText(['Nagpur, Maharashtra']), 'Nagpur');
  assert.equal(matchSupportedCityFromText(['Pimpri-Chinchwad', 'Pune District']), 'Pune');
  assert.equal(
    matchSupportedCityFromText(['Aurangabad, Maharashtra']),
    'Chhatrapati Sambhajinagar'
  );
  assert.equal(
    matchSupportedCityFromText(['Chhatrapati Sambhajinagar']),
    'Chhatrapati Sambhajinagar'
  );
  assert.equal(matchSupportedCityFromText(['Amravati Division']), 'Amravati');
  assert.equal(matchSupportedCityFromText(['Wardha']), 'Wardha');
  assert.equal(matchSupportedCityFromText(['Nashik']), 'Nashik');
  assert.equal(matchSupportedCityFromText(['Chandrapur']), 'Chandrapur');
  assert.equal(matchSupportedCityFromText(['Mumbai', 'Maharashtra']), null);
});

test('matchSupportedCityByCoordinates matches coordinates near supported cities and rejects far cities', () => {
  // Nagpur center
  assert.equal(matchSupportedCityByCoordinates(21.1458, 79.0882), 'Nagpur');
  // Pune center
  assert.equal(matchSupportedCityByCoordinates(18.5204, 73.8567), 'Pune');
  // Mumbai (outside supported cities)
  assert.equal(matchSupportedCityByCoordinates(19.076, 72.8777), null);
});

test('reverseGeocodeCoordinates identifies supported and unsupported cities cleanly', async () => {
  const mockNagpurFetch = (async () => ({
    ok: true,
    json: async () => ({
      city: 'Nagpur',
      locality: 'Dharampeth',
    }),
  })) as unknown as typeof fetch;

  const nagpurRes = await reverseGeocodeCoordinates(21.1458, 79.0882, mockNagpurFetch);
  assert.equal(nagpurRes.detectedCityName, 'Nagpur');
  assert.equal(nagpurRes.matchedCity, 'Nagpur');

  const mockMumbaiFetch = (async () => ({
    ok: true,
    json: async () => ({
      city: 'Mumbai',
      locality: 'Bandra',
    }),
  })) as unknown as typeof fetch;

  const mumbaiRes = await reverseGeocodeCoordinates(19.076, 72.8777, mockMumbaiFetch);
  assert.equal(mumbaiRes.detectedCityName, 'Mumbai');
  assert.equal(mumbaiRes.matchedCity, null);
});

test('storage helpers persist city selection and dismissal properly', () => {
  const local = createMemoryStorage();
  const session = createMemoryStorage();

  assert.equal(shouldAutoScheduleLocationPopup(session, local), true);
  assert.equal(getSavedCity(local), null);

  // Dismissing popup prevents auto scheduling
  markPopupDismissed(session, local);
  assert.equal(isPopupDismissed(session, local), true);
  assert.equal(shouldAutoScheduleLocationPopup(session, local), false);

  // Saving city persists in local storage
  const local2 = createMemoryStorage();
  const session2 = createMemoryStorage();
  saveSelectedCity('Pune', local2, session2);
  assert.equal(getSavedCity(local2), 'Pune');
  assert.equal(shouldAutoScheduleLocationPopup(session2, local2), false);
});
