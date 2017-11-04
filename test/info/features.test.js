/* global test expect */
import { Info } from '../../src/luxon';
import { Helpers } from '../helpers';

test('Info.features shows this environment supports all the features', () => {
  expect(Info.features().intl).toBe(true);
  expect(Info.features().intlTokens).toBe(true);
  expect(Info.features().zones).toBe(true);
});

Helpers.withoutIntl('Info.features shows no support', () => {
  expect(Info.features().intl).toBe(false);
  expect(Info.features().intlTokens).toBe(false);
  expect(Info.features().zones).toBe(false);
});

Helpers.withoutFTP('Info.features shows no support', () => {
  expect(Info.features().intl).toBe(true);
  expect(Info.features().intlTokens).toBe(false);
  expect(Info.features().zones).toBe(true);
});

Helpers.withoutZones('Info.features shows no support', () => {
  expect(Info.features().intl).toBe(true);
  expect(Info.features().intlTokens).toBe(true);
  expect(Info.features().zones).toBe(false);
});
