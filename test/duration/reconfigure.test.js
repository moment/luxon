/* global test expect */

import { Duration } from '../../src/luxon';

const dur = Duration.fromObject({
  years: 1,
  months: 2,
  days: 3,
  locale: 'fr',
  numberingSystem: 'beng',
  conversionAccuracy: 'longterm'
});

//------
// #reconfigure()
//------

test('Duration#reconfigure() sets the locale', () => {
  const recon = dur.reconfigure({ locale: 'it' });
  expect(recon.locale).toBe('it');
  expect(recon.numberingSystem).toBe('beng');
  expect(recon.conversionAccuracy).toBe('longterm');
});

test('Duration#reconfigure() sets the numberingSystem', () => {
  const recon = dur.reconfigure({ numberingSystem: 'thai' });
  expect(recon.locale).toBe('fr');
  expect(recon.numberingSystem).toBe('thai');
  expect(recon.conversionAccuracy).toBe('longterm');
});

test('Duration#reconfigure() sets the conversion accuracy', () => {
  const recon = dur.reconfigure({ conversionAccuracy: 'longterm' });
  expect(recon.locale).toBe('fr');
  expect(recon.numberingSystem).toBe('beng');
  expect(recon.conversionAccuracy).toBe('longterm');
});
