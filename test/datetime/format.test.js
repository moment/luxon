/* global test expect */

import { DateTime } from '../../dist/cjs/luxon';
import { FakePT } from '../helpers/fakePT';

const dt = DateTime.fromObject(
  { year: 1982, month: 5, day: 25, hour: 9, minute: 23, second: 54, millisecond: 123 },
  'utc'
);

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

//------
// #toISODate()
//------
test('DateTime#toISODate() returns ISO 8601 date', () => {
  expect(dt.toISODate()).toBe('1982-05-25');
});

test('DateTime#toISODate() is local to the zone', () => {
  expect(dt.toUTC(-10 * 60).toISODate()).toBe('1982-05-24');
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
  expect(dt.millisecond(0).toISOTime({ suppressMilliseconds: true })).toBe('09:23:54Z');
});

test("DateTime#toISOTime({suppressSeconds: true}) won't suppress milliseconds if they're nonzero", () => {
  expect(dt.toISOTime({ suppressSeconds: true })).toBe('09:23:54.123Z');
});

test("DateTime#toISOTime({suppressSeconds: true}) will suppress milliseconds if they're zero", () => {
  expect(dt.second(0).millisecond(0).toISOTime({ suppressSeconds: true })).toBe('09:23Z');
});

test("DateTime#toISOTime({suppressSeconds: true}) will suppress milliseconds if they're zero", () => {
  expect(dt.second(0).millisecond(0).toISOTime({ suppressSeconds: true })).toBe('09:23Z');
});

test('DateTime#toISOTime() handles other offsets', () => {
  expect(dt.timezone('America/New_York').toISOTime()).toBe('05:23:54.123-04:00');
});

//------
// #toRFC2822()
//------

test('DateTime#toRFC2822() returns an RFC 2822 date', () => {
  expect(dt.toUTC().toRFC2822()).toBe('Tue, 25 May 1982 09:23:54 +0000');
  // this won't work until we rip out the Intl poly
  // expect(dt.timezone('America/New_York').toRFC2822()).toBe('Tue, 25 May 1982 05:23:54 -0400');
});

//------
// #toHTTP()
//------

test('DateTime#toHTTP() returns an RFC 1123 date', () => {
  expect(dt.toUTC().toHTTP()).toBe('Tue, 25 May 1982 09:23:54 GMT');
  expect(dt.timezone('America/New_York').toHTTP()).toBe('Tue, 25 May 1982 09:23:54 GMT');
});

//------
// #toString()
//-------
test('DateTime#toString() returns the ISO time', () => {
  expect(dt.toUTC(-6 * 60).toString()).toBe('1982-05-25T03:23:54.123-06:00');
});

//------
// #toLocaleString()
//-------
test('DateTime#toLocaleString returns a sensible string by default', () => {
  expect(dt.locale('en-us').toLocaleString()).toBe('5/25/1982');
});

test('DateTime#toLocaleString accepts locale settings from the dateTime', () => {
  expect(dt.locale('be').toLocaleString()).toBe('25.5.1982');
});

test('DateTime#toLocaleString accepts options to the formatter', () => {
  expect(dt.toLocaleString({ weekday: 'short' }).indexOf('Tue') >= 0).toBeTruthy();
});

test("DateTime#toLocaleString can override the dateTime's locale", () => {
  expect(dt.locale('be').toLocaleString({ localeCode: 'fr' })).toBe('25/05/1982');
});

//------
// #toFormat()
//------
test("DateTime#toFormat('S') returns the millisecond", () => {
  expect(dt.toFormat('S')).toBe('123');
  expect(dt.locale('bn').toFormat('S')).toBe('১২৩');
  expect(dt.toFormat('S')).toBe('123');
  expect(dt.millisecond(82).toFormat('S')).toBe('82');
});

test("DateTime#toFormat('SSS') returns padded the millisecond", () => {
  expect(dt.toFormat('SSS')).toBe('123');
  expect(dt.locale('bn').toFormat('SSS')).toBe('১২৩');
  expect(dt.millisecond(82).toFormat('SSS')).toBe('082');
});

test("DateTime#toFormat('s') returns the second", () => {
  expect(dt.toFormat('s')).toBe('54');
  expect(dt.locale('bn').toFormat('s')).toBe('৫৪');
  expect(dt.second(6).toFormat('s')).toBe('6');
});

test("DateTime#toFormat('ss') returns the padded second", () => {
  expect(dt.toFormat('ss')).toBe('54');
  expect(dt.locale('bn').toFormat('ss')).toBe('৫৪');
  expect(dt.second(6).toFormat('ss')).toBe('06');
});

test("DateTime#toFormat('m') returns the minute", () => {
  expect(dt.toFormat('m')).toBe('23');
  expect(dt.locale('bn').toFormat('m')).toBe('২৩');
  expect(dt.minute(6).toFormat('m')).toBe('6');
});

test("DateTime#toFormat('mm') returns the padded minute", () => {
  expect(dt.toFormat('mm')).toBe('23');
  expect(dt.locale('bn').toFormat('mm')).toBe('২৩');
  expect(dt.minute(6).toFormat('mm')).toBe('06');
});

test("DateTime#toFormat('h') returns the hours", () => {
  expect(dt.toFormat('h')).toBe('9');
  expect(dt.locale('bn').toFormat('h')).toBe('৯');
  expect(dt.hour(12).toFormat('h')).toBe('12');
  expect(dt.hour(13).toFormat('h')).toBe('1');
});

test("DateTime#toFormat('hh') returns the padded hour (12-hour time)", () => {
  expect(dt.toFormat('hh')).toBe('09');
  expect(dt.locale('bn').toFormat('hh')).toBe('০৯');
  expect(dt.hour(12).toFormat('hh')).toBe('12');
  expect(dt.hour(13).toFormat('hh')).toBe('01');
});

test("DateTime#toFormat('H') returns the hour (24-hour time)", () => {
  expect(dt.toFormat('H')).toBe('9');
  expect(dt.locale('bn').toFormat('H')).toBe('৯');
  expect(dt.hour(12).toFormat('H')).toBe('12');
  expect(dt.hour(13).toFormat('H')).toBe('13');
});

test("DateTime#toFormat('HH') returns the padded hour (24-hour time)", () => {
  expect(dt.toFormat('HH')).toBe('09');
  expect(dt.locale('bn').toFormat('HH')).toBe('০৯');
  expect(dt.hour(12).toFormat('HH')).toBe('12');
  expect(dt.hour(13).toFormat('HH')).toBe('13');
});

test("DateTime#toFormat('Z') returns the narrow offset", () => {
  expect(dt.toUTC(360).toFormat('Z')).toBe('+6');
  expect(dt.toUTC(390).toFormat('Z')).toBe('+6:30');
  expect(dt.toUTC(-360).toFormat('Z')).toBe('-6');
  expect(dt.toUTC(-390).toFormat('Z')).toBe('-6:30');
});

test("DateTime#toFormat('ZZ') returns the padded offset", () => {
  expect(dt.toUTC(360).toFormat('ZZ')).toBe('+06:00');
  expect(dt.toUTC(390).toFormat('ZZ')).toBe('+06:30');
  expect(dt.toUTC(-360).toFormat('ZZ')).toBe('-06:00');
  expect(dt.toUTC(-390).toFormat('ZZ')).toBe('-06:30');
});

test("DateTime#toFormat('ZZZ') returns a numerical offset", () => {
  expect(dt.toUTC(360).toFormat('ZZZ')).toBe('+0600');
  expect(dt.toUTC(390).toFormat('ZZZ')).toBe('+0630');
  expect(dt.toUTC(-360).toFormat('ZZZ')).toBe('-0600');
  expect(dt.toUTC(-390).toFormat('ZZZ')).toBe('-0630');
});

test("DateTime#toFormat('ZZZZ') returns the short offset name", () => {
  const zoned = dt.timezone(new FakePT());
  expect(zoned.toFormat('ZZZZ')).toBe('PDT');
});

test("DateTime#toFormat('ZZZZZ') returns the full offset name", () => {
  const zoned = dt.timezone(new FakePT());
  expect(zoned.toFormat('ZZZZZ')).toBe('Pacific Daylight Time');
});

test("DateTime#toFormat('z') returns the zone name", () => {
  const zoned = dt.timezone(new FakePT());
  expect(zoned.toFormat('z')).toBe('Fake Pacific Time');
});

test("DateTime#toFormat('a') returns the meridiem", () => {
  expect(dt.toFormat('a')).toBe('AM');
  expect(dt.locale('de').toFormat('a')).toBe('vorm.');
  expect(dt.hour(13).toFormat('a')).toBe('PM');
  expect(dt.hour(13).locale('de').toFormat('a')).toBe('nachm.');
});

test("DateTime#toFormat('d') returns the day", () => {
  expect(dt.toFormat('d')).toBe('25');
  expect(dt.day(1).toFormat('d')).toBe('1');
});

test("DateTime#toFormat('dd') returns the padded day", () => {
  expect(dt.toFormat('dd')).toBe('25');
  expect(dt.day(1).toFormat('dd')).toBe('01');
});

test("DateTime#toFormat('E' || 'c') returns weekday number", () => {
  expect(dt.toFormat('E')).toBe('2');
  expect(dt.toFormat('c')).toBe('2');
});

test("DateTime#toFormat('EEE') returns short format weekday name", () => {
  expect(dt.toFormat('EEE')).toBe('Tue');
  expect(dt.locale('de').toFormat('EEE')).toBe('Di.');
});

test("DateTime#toFormat('ccc') returns short standalone weekday name", () => {
  expect(dt.toFormat('ccc')).toBe('Tue');
  expect(dt.locale('de').toFormat('ccc')).toBe('Di.');
});

// all these commented-out tests are bc https://github.com/andyearnshaw/Intl.js/issues/190
test("DateTime#toFormat('EEEE') returns the full format weekday name", () => {
  expect(dt.toFormat('EEEE')).toBe('Tuesday');
});

test("DateTime#toFormat('cccc') returns the full standalone weekday name", () => {
  expect(dt.toFormat('cccc')).toBe('Tuesday');
});

test("DateTime#toFormat('EEEEE' || 'ccccc') returns narrow weekday name", () => {
  expect(dt.toFormat('EEEEE')).toBe('T');
  expect(dt.toFormat('ccccc')).toBe('T');
});

test("DateTime#toFormat('M' || 'L') return the month number", () => {
  expect(dt.toFormat('M')).toBe('5');
  expect(dt.toFormat('L')).toBe('5');
});

test("DateTime#toFormat('MM' || 'LL') return the padded month number", () => {
  expect(dt.toFormat('MM')).toBe('05');
});

test("DateTime#toFormat('MMM') returns the short format month name", () => {
  expect(dt.toFormat('MMM')).toBe('May');
  expect(dt.locale('de').toFormat('MMM')).toBe('Mai');
  expect(dt.month(8).toFormat('MMM')).toBe('Aug');
});

test("DateTime#toFormat('LLL') returns the short standalone month name", () => {
  expect(dt.toFormat('LLL')).toBe('May');
  expect(dt.locale('de').toFormat('LLL')).toBe('Mai');
  expect(dt.month(8).toFormat('LLL')).toBe('Aug');
});

test("DateTime#toFormat('MMMM') returns the full format month name", () => {
  expect(dt.toFormat('MMMM')).toBe('May');
  expect(dt.month(8).toFormat('MMMM')).toBe('August');
  expect(dt.month(8).locale('ru').toFormat('MMMM')).toBe('августа');
});

test("DateTime#toFormat('LLLL') returns the full standalone month name", () => {
  expect(dt.toFormat('LLLL')).toBe('May');
  expect(dt.month(8).toFormat('LLLL')).toBe('August');
});

test("DateTime#toFormat('MMMMM' || 'LLLLL') returns the narrow month name", () => {
  expect(dt.toFormat('MMMMM')).toBe('M');
  expect(dt.toFormat('LLLLL')).toBe('M');
});

test("DateTime#toFormat('y') returns the full year", () => {
  expect(dt.toFormat('y')).toBe('1982');
  expect(dt.locale('bn').toFormat('y')).toBe('১৯৮২');
  expect(dt.year(3).toFormat('y')).toBe('3');
});

test("DateTime#toFormat('yy') returns the two-digit year", () => {
  expect(dt.toFormat('yy')).toBe('82');
  expect(dt.locale('bn').toFormat('yy')).toBe('৮২');
  expect(dt.year(3).toFormat('yy')).toBe('03');
});

test("DateTime#toFormat('yyyy') returns the padded full year", () => {
  expect(dt.toFormat('yyyy')).toBe('1982');
  expect(dt.locale('bn').toFormat('yyyy')).toBe('১৯৮২');
  expect(dt.year(3).toFormat('yyyy')).toBe('0003');
  expect(dt.year(3).locale('bn').toFormat('yyyy')).toBe('০০০৩');
});

test("DateTime#toFormat('G') returns the short era", () => {
  expect(dt.toFormat('G')).toBe('AD');
  expect(dt.locale('de').toFormat('G')).toBe('n. Chr.');
  expect(dt.year(-21).toFormat('G')).toBe('BC');
  expect(dt.year(-21).locale('de').toFormat('G')).toBe('v. Chr.');
});

// test("DateTime#toFormat('GG') returns the full era", t => {
//  let i = dt;
//  t.is(dt.toFormat('GG'), 'Anno Domini');
//  t.is(dt.year(-21).toFormat('GG'), 'Before Christ');
//  t.end();
// });

// test("DateTime#toFormat('GGGGG') returns the narrow era", t => {
//  let i = dt;
//  t.is(dt.toFormat('GGGG'), 'A');
//  t.is(dt.year(-21).toFormat('GGGGG'), 'B');
//  t.end();
// });

test("DateTime#toFormat('W') returns the week number", () => {
  expect(dt.toFormat('W')).toBe('21');
  expect(dt.weekNumber(5).toFormat('W')).toBe('5');
});

test("DateTime#toFormat('WW') returns the padded week number", () => {
  expect(dt.toFormat('WW')).toBe('21');
  expect(dt.weekNumber(5).toFormat('WW')).toBe('05');
});

test("DateTime#toFormat('kk') returns the abbreviated week year", () => {
  expect(dt.toFormat('kk')).toBe('82');
});

test("DateTime#toFormat('kkkk') returns the full week year", () => {
  expect(dt.toFormat('kkkk')).toBe('1982');
});

test("DateTime#toFormat('o') returns an unpadded ordinal", () => {
  expect(dt.toFormat('o')).toBe('145');
  expect(dt.month(1).day(13).toFormat('o')).toBe('13');
  expect(dt.month(1).day(8).toFormat('o')).toBe('8');
});

test("DateTime#toFormat('ooo') returns an unpadded ordinal", () => {
  expect(dt.toFormat('ooo')).toBe('145');
  expect(dt.month(1).day(13).toFormat('ooo')).toBe('013');
  expect(dt.month(1).day(8).toFormat('ooo')).toBe('008');
});

test('DateTime#toFormat returns a full formatted string', () => {
  expect(dt.toFormat('MM/yyyy GG')).toBe('05/1982 AD');
});

test('DateTime#toFormat() accepts literals in single quotes', () => {
  expect(dt.toFormat("dd/MM/yyyy 'at' hh:mm")).toBe('25/05/1982 at 09:23');
  expect(dt.toFormat("MMdd'T'hh")).toBe('0525T09');
});

// numbering is disabled while we're still using the polyfill for number formatting
// test('DateTime#numbering() overides the numbering system from the locale', t => {
//  let i = dt;
//  t.is(dt.numbering('beng').toFormat('S'), '১২৩');
//  t.end();
// });

test("DateTime#toFormat('D') returns a short date representation", () => {
  expect(dt.toFormat('D')).toBe('5/25/1982');
  expect(dt.locale('fr').toFormat('D')).toBe('25/05/1982');
});

test("DateTime#toFormat('DD') returns a medium date representation", () => {
  expect(dt.toFormat('DD')).toBe('May 25, 1982');
  expect(dt.month(8).toFormat('DD')).toBe('Aug 25, 1982');
  expect(dt.locale('fr').toFormat('DD')).toBe('25 mai 1982');
  expect(dt.locale('fr').month(2).toFormat('DD')).toBe('25 févr. 1982');
});

test("DateTime#toFormat('DDD') returns a long date representation", () => {
  expect(dt.toFormat('DDD')).toBe('May 25, 1982');
  expect(dt.month(8).toFormat('DDD')).toBe('August 25, 1982');
  expect(dt.locale('fr').toFormat('DDD')).toBe('25 mai 1982');
  expect(dt.locale('fr').month(2).toFormat('DDD')).toBe('25 février 1982');
});

test("DateTime#toFormat('DDDD') returns a long date representation", () => {
  expect(dt.toFormat('DDDD')).toBe('Tuesday, May 25, 1982');
  expect(dt.month(8).toFormat('DDDD')).toBe('Wednesday, August 25, 1982');
  expect(dt.locale('fr').toFormat('DDDD')).toBe('mardi 25 mai 1982');
  expect(dt.locale('fr').month(2).toFormat('DDDD')).toBe('jeudi 25 février 1982');
});

test("DateTime#toFormat('t') returns a short time representation", () => {
  expect(dt.toFormat('t')).toBe('9:23 AM');
  expect(dt.hour(13).toFormat('t')).toBe('1:23 PM');
  expect(dt.locale('fr').toFormat('t')).toBe('9:23');
  expect(dt.locale('fr').hour(13).toFormat('t')).toBe('13:23');
});

test("DateTime#toFormat('T') returns a short 24-hour time representation", () => {
  expect(dt.toFormat('T')).toBe('9:23');
  expect(dt.hour(13).toFormat('T')).toBe('13:23');
  expect(dt.locale('fr').toFormat('T')).toBe('9:23');
  expect(dt.locale('fr').hour(13).toFormat('T')).toBe('13:23');
});

test("DateTime#toFormat('tt') returns a medium time representation", () => {
  expect(dt.toFormat('tt')).toBe('9:23:54 AM');
  expect(dt.hour(13).toFormat('tt')).toBe('1:23:54 PM');
  expect(dt.locale('fr').toFormat('tt')).toBe('9:23:54');
  expect(dt.locale('fr').hour(13).toFormat('tt')).toBe('13:23:54');
});

test("DateTime#toFormat('TT') returns a medium 24-hour time representation", () => {
  expect(dt.toFormat('TT')).toBe('9:23:54');
  expect(dt.hour(13).toFormat('TT')).toBe('13:23:54');
  expect(dt.locale('fr').toFormat('TT')).toBe('9:23:54');
  expect(dt.locale('fr').hour(13).toFormat('TT')).toBe('13:23:54');
});

test("DateTime#toFormat('f') returns a short date/time representation without seconds", () => {
  expect(dt.toFormat('f')).toBe('5/25/1982, 9:23 AM');
  expect(dt.hour(13).toFormat('f')).toBe('5/25/1982, 1:23 PM');
  expect(dt.locale('fr').toFormat('f')).toBe('25/05/1982 9:23');
  expect(dt.locale('fr').hour(13).toFormat('f')).toBe('25/05/1982 13:23');
});

test("DateTime#toFormat('ff') returns a medium date/time representation without seconds", () => {
  expect(dt.toFormat('ff')).toBe('May 25, 1982, 9:23 AM');
  expect(dt.hour(13).toFormat('ff')).toBe('May 25, 1982, 1:23 PM');
  expect(dt.month(8).toFormat('ff')).toBe('Aug 25, 1982, 9:23 AM');
  expect(dt.locale('fr').toFormat('ff')).toBe('25 mai 1982 à 9:23');
  expect(dt.locale('fr').month(2).toFormat('ff')).toBe('25 févr. 1982 à 9:23');
  expect(dt.locale('fr').hour(13).toFormat('ff')).toBe('25 mai 1982 à 13:23');
});

test("DateTime#toFormat('fff') returns a medium date/time representation without seconds", () => {
  expect(dt.toFormat('fff')).toBe('May 25, 1982 at 9:23 AM');
  expect(dt.hour(13).toFormat('fff')).toBe('May 25, 1982 at 1:23 PM');
  expect(dt.month(8).toFormat('fff')).toBe('August 25, 1982 at 9:23 AM');
  expect(dt.locale('fr').toFormat('fff')).toBe('25 mai 1982 à 9:23');
  expect(dt.locale('fr').month(2).toFormat('fff')).toBe('25 février 1982 à 9:23');
  expect(dt.locale('fr').hour(13).toFormat('fff')).toBe('25 mai 1982 à 13:23');
});

test("DateTime#toFormat('ffff') returns a long date/time representation without seconds", () => {
  expect(dt.toFormat('ffff')).toBe('Tuesday, May 25, 1982 at 9:23 AM');
  expect(dt.hour(13).toFormat('ffff')).toBe('Tuesday, May 25, 1982 at 1:23 PM');
  expect(dt.month(8).toFormat('ffff')).toBe('Wednesday, August 25, 1982 at 9:23 AM');
  expect(dt.locale('fr').toFormat('ffff')).toBe('mardi 25 mai 1982 à 9:23');
  expect(dt.locale('fr').month(2).toFormat('ffff')).toBe('jeudi 25 février 1982 à 9:23');
  expect(dt.locale('fr').hour(13).toFormat('ffff')).toBe('mardi 25 mai 1982 à 13:23');
});

test("DateTime#toFormat('F') returns a short date/time representation with seconds", () => {
  expect(dt.toFormat('F')).toBe('5/25/1982, 9:23:54 AM');
  expect(dt.hour(13).toFormat('F')).toBe('5/25/1982, 1:23:54 PM');
  expect(dt.locale('fr').toFormat('F')).toBe('25/05/1982 9:23:54');
  expect(dt.locale('fr').hour(13).toFormat('F')).toBe('25/05/1982 13:23:54');
});

test("DateTime#toFormat('FF') returns a medium date/time representation with seconds", () => {
  expect(dt.toFormat('FF')).toBe('May 25, 1982, 9:23:54 AM');
  expect(dt.hour(13).toFormat('FF')).toBe('May 25, 1982, 1:23:54 PM');
  expect(dt.month(8).toFormat('FF')).toBe('Aug 25, 1982, 9:23:54 AM');
  expect(dt.locale('fr').toFormat('FF')).toBe('25 mai 1982 à 9:23:54');
  expect(dt.locale('fr').month(2).toFormat('FF')).toBe('25 févr. 1982 à 9:23:54');
  expect(dt.locale('fr').hour(13).toFormat('FF')).toBe('25 mai 1982 à 13:23:54');
});

test("DateTime#toFormat('fff') returns a medium date/time representation without seconds", () => {
  expect(dt.toFormat('fff')).toBe('May 25, 1982 at 9:23 AM');
  expect(dt.hour(13).toFormat('fff')).toBe('May 25, 1982 at 1:23 PM');
  expect(dt.month(8).toFormat('fff')).toBe('August 25, 1982 at 9:23 AM');
  expect(dt.locale('fr').toFormat('fff')).toBe('25 mai 1982 à 9:23');
  expect(dt.locale('fr').month(2).toFormat('fff')).toBe('25 février 1982 à 9:23');
  expect(dt.locale('fr').hour(13).toFormat('fff')).toBe('25 mai 1982 à 13:23');
});

test("DateTime#toFormat('FFFF') returns a long date/time representation without seconds", () => {
  expect(dt.toFormat('FFFF')).toBe('Tuesday, May 25, 1982 at 9:23:54 AM');
  expect(dt.hour(13).toFormat('FFFF')).toBe('Tuesday, May 25, 1982 at 1:23:54 PM');
  expect(dt.month(8).toFormat('FFFF')).toBe('Wednesday, August 25, 1982 at 9:23:54 AM');
  expect(dt.locale('fr').toFormat('FFFF')).toBe('mardi 25 mai 1982 à 9:23:54');
  expect(dt.locale('fr').month(2).toFormat('FFFF')).toBe('jeudi 25 février 1982 à 9:23:54');
  expect(dt.locale('fr').hour(13).toFormat('FFFF')).toBe('mardi 25 mai 1982 à 13:23:54');
});
