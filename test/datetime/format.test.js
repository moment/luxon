/* global test expect */

import { DateTime } from '../../src/luxon';

const dtMaker = () =>
    DateTime.fromObject({
      year: 1982,
      month: 5,
      day: 25,
      hour: 9,
      minute: 23,
      second: 54,
      millisecond: 123,
      zone: 'utc'
    }),
  dt = dtMaker(),
  invalid = DateTime.invalid('because');

//------
// #toJSON()
//------
test('DateTime#toJSON() just does toISO', () => {
  expect(dt.toJSON()).toBe('1982-05-25T09:23:54.123Z');
});

//------
// #toISO()
//------
test("DateTime#toISO() shows 'Z' for UTC", () => {
  expect(dt.toISO()).toBe('1982-05-25T09:23:54.123Z');
});

test('DateTime#toISO() shows the offset', () => {
  const offsetted = dt.toUTC(-6 * 60);
  expect(offsetted.toISO()).toBe('1982-05-25T03:23:54.123-06:00');
});

test('DateTime#toISO() returns null for invalid DateTimes', () => {
  expect(invalid.toISO()).toBe(null);
});

//------
// #toISODate()
//------
test('DateTime#toISODate() returns ISO 8601 date', () => {
  expect(dt.toISODate()).toBe('1982-05-25');
});

test('DateTime#toISODate() is local to the zone', () => {
  expect(dt.toUTC(-10 * 60).toISODate()).toBe('1982-05-24');
});

test('DateTime#toISODate() returns null for invalid DateTimes', () => {
  expect(invalid.toISODate()).toBe(null);
});

//------
// #toISOWeekDate()
//------
test('DateTime#toISOWeekDate() returns ISO 8601 date', () => {
  expect(dt.toISOWeekDate()).toBe('1982-W21-2');
});

test('DateTime#toISOWeekDate() returns null for invalid DateTimes', () => {
  expect(invalid.toISOWeekDate()).toBe(null);
});

//------
// #toISOTime()
//------
test('DateTime#toISOTime() returns an ISO 8601 date', () => {
  expect(dt.toISOTime()).toBe('09:23:54.123Z');
});

test("DateTime#toISOTime({suppressMilliseconds: true}) won't suppress milliseconds if they're nonzero", () => {
  expect(dt.toISOTime({ suppressMilliseconds: true })).toBe('09:23:54.123Z');
});

test("DateTime#toISOTime({suppressMilliseconds: true}) will suppress milliseconds if they're zero", () => {
  expect(dt.set({ millisecond: 0 }).toISOTime({ suppressMilliseconds: true })).toBe('09:23:54Z');
});

test("DateTime#toISOTime({suppressSeconds: true}) won't suppress milliseconds if they're nonzero", () => {
  expect(dt.toISOTime({ suppressSeconds: true })).toBe('09:23:54.123Z');
});

test("DateTime#toISOTime({suppressSeconds: true}) will suppress milliseconds if they're zero", () => {
  expect(dt.set({ second: 0, millisecond: 0 }).toISOTime({ suppressSeconds: true })).toBe('09:23Z');
});

test("DateTime#toISOTime({suppressSeconds: true}) will suppress milliseconds if they're zero", () => {
  expect(dt.set({ second: 0, millisecond: 0 }).toISOTime({ suppressSeconds: true })).toBe('09:23Z');
});

test('DateTime#toISOTime() handles other offsets', () => {
  expect(dt.setZone('America/New_York').toISOTime()).toBe('05:23:54.123-04:00');
});

test('DateTime#toISOTime() returns null for invalid DateTimes', () => {
  expect(invalid.toISOTime()).toBe(null);
});

//------
// #toRFC2822()
//------

test('DateTime#toRFC2822() returns an RFC 2822 date', () => {
  expect(dt.toUTC().toRFC2822()).toBe('Tue, 25 May 1982 09:23:54 +0000');
  expect(dt.setZone('America/New_York').toRFC2822()).toBe('Tue, 25 May 1982 05:23:54 -0400');
});

test('DateTime#toRFC2822() returns null for invalid DateTimes', () => {
  expect(invalid.toRFC2822()).toBe(null);
});

//------
// #toHTTP()
//------

test('DateTime#toHTTP() returns an RFC 1123 date', () => {
  expect(dt.toUTC().toHTTP()).toBe('Tue, 25 May 1982 09:23:54 GMT');
  expect(dt.setZone('America/New_York').toHTTP()).toBe('Tue, 25 May 1982 09:23:54 GMT');
});

test('DateTime#toHTTP() returns null for invalid DateTimes', () => {
  expect(invalid.toHTTP()).toBe(null);
});

//------
// #toString()
//-------
test('DateTime#toString() returns the ISO time', () => {
  expect(dt.toUTC(-6 * 60).toString()).toBe('1982-05-25T03:23:54.123-06:00');
});

test('DateTime#toString() returns something different for invalid DateTimes', () => {
  expect(invalid.toString()).toBe('Invalid DateTime');
});

//------
// #toLocaleString()
//-------
test('DateTime#toLocaleString returns a sensible string by default', () => {
  expect(dt.reconfigure({ locale: 'en-US' }).toLocaleString()).toBe('5/25/1982');
});

test('DateTime#toLocaleString accepts locale settings from the dateTime', () => {
  expect(dt.reconfigure({ locale: 'be' }).toLocaleString()).toBe('25.5.1982');
});

test('DateTime#toLocaleString accepts numbering system settings from the dateTime', () => {
  expect(dt.reconfigure({ numberingSystem: 'beng' }).toLocaleString()).toBe('৫/২৫/১৯৮২');
});

test('DateTime#toLocaleString accepts output calendar settings from the dateTime', () => {
  expect(dt.reconfigure({ outputCalendar: 'islamic' }).toLocaleString()).toBe('8/2/1402 AH');
});

test('DateTime#toLocaleString accepts options to the formatter', () => {
  expect(dt.toLocaleString({ weekday: 'short' }).indexOf('Tue') >= 0).toBeTruthy();
});

test("DateTime#toLocaleString can override the dateTime's locale", () => {
  expect(dt.reconfigure({ locale: 'be' }).toLocaleString({ locale: 'fr' })).toBe('25/05/1982');
});

test("DateTime#toLocaleString can override the dateTime's numbering system", () => {
  expect(
    dt.reconfigure({ numberingSystem: 'beng' }).toLocaleString({ numberingSystem: 'mong' })
  ).toBe('᠕/᠒᠕/᠑᠙᠘᠒');
});

test("DateTime#toLocaleString can override the dateTime's output calendar", () => {
  expect(
    dt.reconfigure({ outputCalendar: 'islamic' }).toLocaleString({ outputCalendar: 'coptic' })
  ).toBe('9/17/1698 ERA1');
});

test('DateTime#toLocaleString() returns something different for invalid DateTimes', () => {
  expect(invalid.toLocaleString()).toBe('Invalid DateTime');
});

//------
// #resolvedLocaleOpts()
//------

test('DateTime#resolvedLocaleOpts returns a thing', () => {
  const res = DateTime.local().resolvedLocaleOpts();

  expect(res.outputCalendar).toBeDefined();
  expect(res.locale).toBeDefined();
  expect(res.numberingSystem).toBeDefined();
});

test('DateTime#resolvedLocaleOpts reflects changes to the locale', () => {
  const res = DateTime.local()
    .reconfigure({
      locale: 'be',
      numberingSystem: 'mong',
      outputCalendar: 'coptic'
    })
    .resolvedLocaleOpts();

  expect(res.locale).toBe('be-u-ca-coptic-nu-mong');
  expect(res.outputCalendar).toBe('coptic');
  expect(res.numberingSystem).toBe('mong');
});

test('DateTime#resolvedLocaleOpts can override with options', () => {
  const res = DateTime.local().resolvedLocaleOpts({
    locale: 'be',
    numberingSystem: 'mong',
    outputCalendar: 'coptic'
  });

  expect(res.locale).toBe('be-u-ca-coptic-nu-mong');
  expect(res.outputCalendar).toBe('coptic');
  expect(res.numberingSystem).toBe('mong');
});

//------
// #toLocaleParts()
//------

test('DateTime#toLocaleParts returns a en-US by default', () => {
  expect(dt.reconfigure({ locale: 'en-US' }).toLocaleParts()).toEqual([
    { type: 'month', value: '5' },
    { type: 'literal', value: '/' },
    { type: 'day', value: '25' },
    { type: 'literal', value: '/' },
    { type: 'year', value: '1982' }
  ]);
});

test('DateTime#toLocaleParts accepts locale settings from the dateTime', () => {
  expect(dt.reconfigure({ locale: 'be' }).toLocaleParts()).toEqual([
    { type: 'day', value: '25' },
    { type: 'literal', value: '.' },
    { type: 'month', value: '5' },
    { type: 'literal', value: '.' },
    { type: 'year', value: '1982' }
  ]);
});

test("DateTime#toLocaleParts can override the dateTime's locale", () => {
  expect(dt.reconfigure({ locale: 'be' }).toLocaleParts({ locale: 'fr' })).toEqual([
    { type: 'day', value: '25' },
    { type: 'literal', value: '/' },
    { type: 'month', value: '05' },
    { type: 'literal', value: '/' },
    { type: 'year', value: '1982' }
  ]);
});

test('DateTime#toLocaleParts accepts date formatting options', () => {
  expect(dt.toLocaleParts(DateTime.TIME_SIMPLE)).toEqual([
    { type: 'hour', value: '9' },
    { type: 'literal', value: ':' },
    { type: 'minute', value: '23' },
    { type: 'literal', value: ' ' },
    { type: 'dayperiod', value: 'AM' }
  ]);
});

test('DateTime#toLocaleParts returns empty for invalid DateTimes', () => {
  expect(invalid.toLocaleParts()).toEqual([]);
});
