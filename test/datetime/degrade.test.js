/* global test expect Intl */
/* eslint no-global-assign: "off" */

import { DateTime, Info } from '../../src/luxon';

test('No Intl support at all', () => {
  const intl = Intl;

  try {
    Intl = undefined;

    // Info.features returns the right thing
    expect(Info.features().intl).toBe(false);
    expect(Info.features().intlTokens).toBe(false);

    // formatting in English works
    expect(DateTime.local(2014, 8, 6).toFormat('ccc')).toBe('Wed');

    // formatting in French defaults to English
    expect(
      DateTime.local(2014, 8, 6)
        .setLocale('fr')
        .toFormat('ccc')
    ).toBe('Wed');

    // parsing in English works
    expect(DateTime.fromString('May 15, 2017', 'LLLL dd, yyyy').isValid).toBe(true);

    // toLocaleString in English errors
    expect(() => DateTime.local(2014, 8, 6).toLocaleString()).toThrow();

    // toLocaleString in French errors
    expect(() =>
      DateTime.local(2014, 8, 6)
        .setLocale('fr')
        .toLocaleString()
    ).toThrow();

    // parsing numbers in French works
    expect(DateTime.fromString('05/15/2017', 'LL/dd/yyyy', { locale: 'fr' }).isValid).toBe(true);

    // parsing names in French errors
    expect(() => DateTime.fromString('mai 15, 2017', 'LLLL dd, yyyy', { locale: 'fr' })).toThrow();

    // setting the time zone results in an invalid DateTime
    expect(DateTime.local().setZone('America/New_York').isValid).toBe(false);
  } finally {
    Intl = intl;
  }
});

test('No formatToParts support', () => {
  const { formatToParts } = Intl.DateTimeFormat.prototype;

  try {
    Intl.DateTimeFormat.prototype.formatToParts = undefined;

    // Info.features returns the right thing
    expect(Info.features().intl).toBe(true);
    expect(Info.features().intlTokens).toBe(false);

    // toLocaleString works fine
    expect(
      DateTime.local(2014, 8, 6)
        .setLocale('fr')
        .toLocaleString()
    ).toBe('06/08/2014');

    // formatting in English works
    expect(DateTime.local(2014, 8, 6).toFormat('ccc')).toBe('Wed');

    // formatting in French defaults to English
    expect(
      DateTime.local(2014, 8, 6)
        .setLocale('fr')
        .toFormat('ccc')
    ).toBe('Wed');

    // parsing in English works
    expect(DateTime.fromString('May 15, 2017', 'LLLL dd, yyyy').isValid).toBe(true);

    // parsing numbers in French works
    expect(DateTime.fromString('05/15/2017', 'LL/dd/yyyy', { locale: 'fr' }).isValid).toBe(true);

    // parsing names in French errors
    expect(() => DateTime.fromString('mai 15, 2017', 'LLLL dd, yyyy', { locale: 'fr' })).toThrow();

    // setting the time zone works fine
    expect(DateTime.local().setZone('America/New_York').isValid).toBe(true);
  } finally {
    Intl.DateTimeFormat.prototype.formatToParts = formatToParts;
  }
});

test('No zone support', () => {
  const { DateTimeFormat } = Intl;

  try {
    Intl.DateTimeFormat = (locale, opts) => {
      if (opts.timeZone) {
        // eslint-disable-next-line no-throw-literal
        throw `Unsupported time zone specified ${opts.timeZone}`;
      }
      return DateTimeFormat(locale, opts);
    };

    // Info.features returns the right thing
    expect(Info.features().zones).toBe(false);

    // regular Intl works fine
    expect(
      DateTime.local(2014, 8, 6)
        .setLocale('fr')
        .toLocaleString()
    ).toBe('06/08/2014');

    // using zones returns an invalid DateTime
    expect(DateTime.local().setZone('America/New_York').isValid).toBe(false);
  } finally {
    Intl.DateTimeFormat = DateTimeFormat;
  }
});
