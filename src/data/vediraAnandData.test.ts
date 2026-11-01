import test from 'node:test';
import assert from 'node:assert/strict';
import { VEDIRA_ANAND_DATA } from './vediraAnandData.js';

test('Vedira Anand project identity matches official brochure', () => {
  assert.equal(VEDIRA_ANAND_DATA.projectName, 'Vedira Anand');
  assert.equal(VEDIRA_ANAND_DATA.developerName, 'WallStone Realty Pvt. Ltd.');
  assert.match(VEDIRA_ANAND_DATA.address, /Plot No\. 8, Dr\. Padhan Layout/i);
  assert.match(VEDIRA_ANAND_DATA.address, /Gopal Nagar/i);
  assert.match(VEDIRA_ANAND_DATA.address, /Nagpur/i);
});

test('Super built-up areas are strictly 1,292 sq. ft. for 2 BHK and 2,190 sq. ft. for 3 BHK', () => {
  const twoBhk = VEDIRA_ANAND_DATA.configurations.find((c) => c.id === '2bhk');
  const threeBhk = VEDIRA_ANAND_DATA.configurations.find((c) => c.id === '3bhk');

  assert.ok(twoBhk, '2 BHK configuration must exist');
  assert.ok(threeBhk, '3 BHK configuration must exist');

  assert.equal(twoBhk.superBuiltUpAreaSqFt, 1292);
  assert.match(twoBhk.areaLabel, /1,292 sq\. ft\./);
  assert.match(twoBhk.areaLabel, /S-B\/UP Area/i);

  assert.equal(threeBhk.superBuiltUpAreaSqFt, 2190);
  assert.match(threeBhk.areaLabel, /2,190 sq\. ft\./);
  assert.match(threeBhk.areaLabel, /S-B\/UP Area/i);
});

test('Price is strictly Price on Request and not arbitrary numbers', () => {
  assert.equal(VEDIRA_ANAND_DATA.priceLabel, 'Price on Request');
  for (const config of VEDIRA_ANAND_DATA.configurations) {
    assert.equal(config.pricingLabel, 'Price on Request');
  }
});

test('Contains all 16 verified specifications from brochure Page 5', () => {
  assert.equal(VEDIRA_ANAND_DATA.specifications.length, 16);
  const titles = VEDIRA_ANAND_DATA.specifications.map((s) => s.title.toLowerCase());
  assert.ok(titles.some((t) => t.includes('structure')));
  assert.ok(titles.some((t) => t.includes('wall')));
  assert.ok(titles.some((t) => t.includes('plaster')));
  assert.ok(titles.some((t) => t.includes('paint')));
  assert.ok(titles.some((t) => t.includes('windows')));
  assert.ok(titles.some((t) => t.includes('doors')));
  assert.ok(titles.some((t) => t.includes('kitchen')));
  assert.ok(titles.some((t) => t.includes('electrification')));
  assert.ok(titles.some((t) => t.includes('toilets')));
  assert.ok(titles.some((t) => t.includes('bathroom fixtures')));
  assert.ok(titles.some((t) => t.includes('sanitary ware')));
  assert.ok(titles.some((t) => t.includes('water supply')));
  assert.ok(titles.some((t) => t.includes('railings')));
  assert.ok(titles.some((t) => t.includes('lift')));
  assert.ok(titles.some((t) => t.includes('parking')));
  assert.ok(titles.some((t) => t.includes('waterproofing')));
});

test('Contains all 11 special features & amenities', () => {
  assert.equal(VEDIRA_ANAND_DATA.specialFeatures.length, 11);
  const titles = VEDIRA_ANAND_DATA.specialFeatures.map((a) => a.title.toLowerCase());
  assert.ok(titles.some((t) => t.includes('vastu')));
  assert.ok(titles.some((t) => t.includes('gypsum') || t.includes('ceiling')));
  assert.ok(titles.some((t) => t.includes('inverter') || t.includes('backup')));
  assert.ok(titles.some((t) => t.includes('thumbprint') || t.includes('lock')));
  assert.ok(titles.some((t) => t.includes('terrace garden')));
  assert.ok(titles.some((t) => t.includes('hydraulic')));
  assert.ok(titles.some((t) => t.includes('solar')));
  assert.ok(titles.some((t) => t.includes('doorbell')));
  assert.ok(titles.some((t) => t.includes('ev')));
  assert.ok(titles.some((t) => t.includes('cctv')));
  assert.ok(titles.some((t) => t.includes('gazebo')));
});

test('Brochure disclaimer is included', () => {
  assert.match(VEDIRA_ANAND_DATA.brochureDisclaimer, /Disclaimer:/i);
  assert.match(VEDIRA_ANAND_DATA.brochureDisclaimer, /WallStone Realty/i);
});
