/* global test expect */

import { DateTime } from '../../dist/cjs/luxon';
import { FakePT } from '../helpers/fakePT';

const dt = DateTime.fromObject(
  { year: 1982, month: 5, day: 25, hour: 9, minute: 23, second: 54, millisecond: 123 },
  'utc'
);

//------
// #toISO()
//-------
test("DateTime#toISO() shows 'Z' for UTC", () => {
  expect(dt.toISO()).toBe('1982-05-25T09:23:54.123Z');
});

test('DateTime#toISO() shows the offset', () => {
  const offsetted = dt.toUTC(-6 * 60);
  expect(offsetted.toISO()).toBe('1982-05-25T03:23:54.123-06:00');
});

//------
// #toISODate()
//-------
test('DateTime#toISODate() returns ISO 8601 date', () => {
  expect(dt.toISODate()).toBe('1982-05-25');
});

test('DateTime#toISODate() is local to the zone', () => {
  expect(dt.toUTC(-10 * 60).toISODate()).toBe('1982-05-24');
});

//------
// #toISOTime()
//-------
test('DateTime#toISOTime() returns an ISO 8601 date', () => {
  expect(dt.toISOTime()).toBe('09:23:54.123');
});

test("DateTime#toISOTime({suppressMilliseconds: true}) won't suppress milliseconds if they're nonzero", () => {
  expect(dt.toISOTime({ suppressMilliseconds: true })).toBe('09:23:54.123');
});

test("DateTime#toISOTime({suppressMilliseconds: true}) will suppress milliseconds if they're zero", () => {
  expect(dt.millisecond(0).toISOTime({ suppressMilliseconds: true })).toBe('09:23:54');
});

test("DateTime#toISOTime({suppressSeconds: true}) won't suppress milliseconds if they're nonzero", () => {
  expect(dt.toISOTime({ suppressSeconds: true })).toBe('09:23:54.123');
});

test("DateTime#toISOTime({suppressSeconds: true}) will suppress milliseconds if they're zero", () => {
  expect(dt.second(0).millisecond(0).toISOTime({ suppressSeconds: true })).toBe('09:23');
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
// #toFormatString()
//-------
test("DateTime#toFormatString('S') returns the millisecond", () => {
  expect(dt.toFormatString('S')).toBe('123');
  expect(dt.locale('bn').toFormatString('S')).toBe('১২৩');
  expect(dt.toFormatString('S')).toBe('123');
  expect(dt.millisecond(82).toFormatString('S')).toBe('82');
});

test("DateTime#toFormatString('SSS') returns padded the millisecond", () => {
  expect(dt.toFormatString('SSS')).toBe('123');
  expect(dt.locale('bn').toFormatString('SSS')).toBe('১২৩');
  expect(dt.millisecond(82).toFormatString('SSS')).toBe('082');
});

test("DateTime#toFormatString('s') returns the second", () => {
  expect(dt.toFormatString('s')).toBe('54');
  expect(dt.locale('bn').toFormatString('s')).toBe('৫৪');
  expect(dt.second(6).toFormatString('s')).toBe('6');
});

test("DateTime#toFormatString('ss') returns the padded second", () => {
  expect(dt.toFormatString('ss')).toBe('54');
  expect(dt.locale('bn').toFormatString('ss')).toBe('৫৪');
  expect(dt.second(6).toFormatString('ss')).toBe('06');
});

test("DateTime#toFormatString('m') returns the minute", () => {
  expect(dt.toFormatString('m')).toBe('23');
  expect(dt.locale('bn').toFormatString('m')).toBe('২৩');
  expect(dt.minute(6).toFormatString('m')).toBe('6');
});

test("DateTime#toFormatString('mm') returns the padded minute", () => {
  expect(dt.toFormatString('mm')).toBe('23');
  expect(dt.locale('bn').toFormatString('mm')).toBe('২৩');
  expect(dt.minute(6).toFormatString('mm')).toBe('06');
});

test("DateTime#toFormatString('h') returns the hours", () => {
  expect(dt.toFormatString('h')).toBe('9');
  expect(dt.locale('bn').toFormatString('h')).toBe('৯');
  expect(dt.hour(12).toFormatString('h')).toBe('12');
  expect(dt.hour(13).toFormatString('h')).toBe('1');
});

test("DateTime#toFormatString('hh') returns the padded hour (12-hour time)", () => {
  expect(dt.toFormatString('hh')).toBe('09');
  expect(dt.locale('bn').toFormatString('hh')).toBe('০৯');
  expect(dt.hour(12).toFormatString('hh')).toBe('12');
  expect(dt.hour(13).toFormatString('hh')).toBe('01');
});

test("DateTime#toFormatString('H') returns the hour (24-hour time)", () => {
  expect(dt.toFormatString('H')).toBe('9');
  expect(dt.locale('bn').toFormatString('H')).toBe('৯');
  expect(dt.hour(12).toFormatString('H')).toBe('12');
  expect(dt.hour(13).toFormatString('H')).toBe('13');
});

test("DateTime#toFormatString('HH') returns the padded hour (24-hour time)", () => {
  expect(dt.toFormatString('HH')).toBe('09');
  expect(dt.locale('bn').toFormatString('HH')).toBe('০৯');
  expect(dt.hour(12).toFormatString('HH')).toBe('12');
  expect(dt.hour(13).toFormatString('HH')).toBe('13');
});

test("DateTime#toFormatString('Z') returns the narrow offset", () => {
  expect(dt.toUTC(360).toFormatString('Z')).toBe('+6');
  expect(dt.toUTC(390).toFormatString('Z')).toBe('+6:30');
  expect(dt.toUTC(-360).toFormatString('Z')).toBe('-6');
  expect(dt.toUTC(-390).toFormatString('Z')).toBe('-6:30');
});

test("DateTime#toFormatString('ZZ') returns the padded offset", () => {
  expect(dt.toUTC(360).toFormatString('ZZ')).toBe('+06:00');
  expect(dt.toUTC(390).toFormatString('ZZ')).toBe('+06:30');
  expect(dt.toUTC(-360).toFormatString('ZZ')).toBe('-06:00');
  expect(dt.toUTC(-390).toFormatString('ZZ')).toBe('-06:30');
});

test("DateTime#toFormatString('ZZZ') returns a numerical offset", () => {
  expect(dt.toUTC(360).toFormatString('ZZZ')).toBe('+0600');
  expect(dt.toUTC(390).toFormatString('ZZZ')).toBe('+0630');
  expect(dt.toUTC(-360).toFormatString('ZZZ')).toBe('-0600');
  expect(dt.toUTC(-390).toFormatString('ZZZ')).toBe('-0630');
});

test("DateTime#toFormatString('ZZZZ') returns the short offset name", () => {
  const zoned = dt.timezone(new FakePT());
  expect(zoned.toFormatString('ZZZZ')).toBe('PDT');
});

test("DateTime#toFormatString('ZZZZZ') returns the full offset name", () => {
  const zoned = dt.timezone(new FakePT());
  expect(zoned.toFormatString('ZZZZZ')).toBe('Pacific Daylight Time');
});

test("DateTime#toFormatString('z') returns the zone name", () => {
  const zoned = dt.timezone(new FakePT());
  expect(zoned.toFormatString('z')).toBe('Fake Pacific Time');
});

test("DateTime#toFormatString('a') returns the meridiem", () => {
  expect(dt.toFormatString('a')).toBe('AM');
  expect(dt.locale('de').toFormatString('a')).toBe('vorm.');
  expect(dt.hour(13).toFormatString('a')).toBe('PM');
  expect(dt.hour(13).locale('de').toFormatString('a')).toBe('nachm.');
});

test("DateTime#toFormatString('d') returns the day", () => {
  expect(dt.toFormatString('d')).toBe('25');
  expect(dt.day(1).toFormatString('d')).toBe('1');
});

test("DateTime#toFormatString('dd') returns the padded day", () => {
  expect(dt.toFormatString('dd')).toBe('25');
  expect(dt.day(1).toFormatString('dd')).toBe('01');
});

test("DateTime#toFormatString('E' || 'c') returns weekday number", () => {
  expect(dt.toFormatString('E')).toBe('2');
  expect(dt.toFormatString('c')).toBe('2');
});

test("DateTime#toFormatString('EEE') returns short format weekday name", () => {
  expect(dt.toFormatString('EEE')).toBe('Tue');
  expect(dt.locale('de').toFormatString('EEE')).toBe('Di.');
});

test("DateTime#toFormatString('ccc') returns short standalone weekday name", () => {
  expect(dt.toFormatString('ccc')).toBe('Tue');
  expect(dt.locale('de').toFormatString('ccc')).toBe('Di.');
});

// all these commented-out tests are bc https://github.com/andyearnshaw/Intl.js/issues/190
test("DateTime#toFormatString('EEEE') returns the full format weekday name", () => {
  expect(dt.toFormatString('EEEE')).toBe('Tuesday');
});

test("DateTime#toFormatString('cccc') returns the full standalone weekday name", () => {
  expect(dt.toFormatString('cccc')).toBe('Tuesday');
});

test("DateTime#toFormatString('EEEEE' || 'ccccc') returns narrow weekday name", () => {
  expect(dt.toFormatString('EEEEE')).toBe('T');
  expect(dt.toFormatString('ccccc')).toBe('T');
});

test("DateTime#toFormatString('M' || 'L') return the month number", () => {
  expect(dt.toFormatString('M')).toBe('5');
  expect(dt.toFormatString('L')).toBe('5');
});

test("DateTime#toFormatString('MM' || 'LL') return the padded month number", () => {
  expect(dt.toFormatString('MM')).toBe('05');
});

test("DateTime#toFormatString('MMM') returns the short format month name", () => {
  expect(dt.toFormatString('MMM')).toBe('May');
  expect(dt.locale('de').toFormatString('MMM')).toBe('Mai');
  expect(dt.month(8).toFormatString('MMM')).toBe('Aug');
});

test("DateTime#toFormatString('LLL') returns the short standalone month name", () => {
  expect(dt.toFormatString('LLL')).toBe('May');
  expect(dt.locale('de').toFormatString('LLL')).toBe('Mai');
  expect(dt.month(8).toFormatString('LLL')).toBe('Aug');
});

test("DateTime#toFormatString('MMMM') returns the full format month name", () => {
  expect(dt.toFormatString('MMMM')).toBe('May');
  expect(dt.month(8).toFormatString('MMMM')).toBe('August');
  expect(dt.month(8).locale('ru').toFormatString('MMMM')).toBe('августа');
});

test("DateTime#toFormatString('LLLL') returns the full standalone month name", () => {
  expect(dt.toFormatString('LLLL')).toBe('May');
  expect(dt.month(8).toFormatString('LLLL')).toBe('August');
});

test("DateTime#toFormatString('MMMMM' || 'LLLLL') returns the narrow month name", () => {
  expect(dt.toFormatString('MMMMM')).toBe('M');
  expect(dt.toFormatString('LLLLL')).toBe('M');
});

test("DateTime#toFormatString('y') returns the full year", () => {
  expect(dt.toFormatString('y')).toBe('1982');
  expect(dt.locale('bn').toFormatString('y')).toBe('১৯৮২');
  expect(dt.year(3).toFormatString('y')).toBe('3');
});

test("DateTime#toFormatString('yy') returns the two-digit year", () => {
  expect(dt.toFormatString('yy')).toBe('82');
  expect(dt.locale('bn').toFormatString('yy')).toBe('৮২');
  expect(dt.year(3).toFormatString('yy')).toBe('03');
});

test("DateTime#toFormatString('yyyy') returns the padded full year", () => {
  expect(dt.toFormatString('yyyy')).toBe('1982');
  expect(dt.locale('bn').toFormatString('yyyy')).toBe('১৯৮২');
  expect(dt.year(3).toFormatString('yyyy')).toBe('0003');
  expect(dt.year(3).locale('bn').toFormatString('yyyy')).toBe('০০০৩');
});

test("DateTime#toFormatString('G') returns the short era", () => {
  expect(dt.toFormatString('G')).toBe('AD');
  expect(dt.locale('de').toFormatString('G')).toBe('n. Chr.');
  expect(dt.year(-21).toFormatString('G')).toBe('BC');
  expect(dt.year(-21).locale('de').toFormatString('G')).toBe('v. Chr.');
});

// test("DateTime#toFormatString('GG') returns the full era", t => {
//  let i = dt;
//  t.is(dt.toFormatString('GG'), 'Anno Domini');
//  t.is(dt.year(-21).toFormatString('GG'), 'Before Christ');
//  t.end();
// });

// test("DateTime#toFormatString('GGGGG') returns the narrow era", t => {
//  let i = dt;
//  t.is(dt.toFormatString('GGGG'), 'A');
//  t.is(dt.year(-21).toFormatString('GGGGG'), 'B');
//  t.end();
// });

test("DateTime#toFormatString('W') returns the week number", () => {
  expect(dt.toFormatString('W')).toBe('21');
  expect(dt.weekNumber(5).toFormatString('W')).toBe('5');
});

test("DateTime#toFormatString('WW') returns the padded week number", () => {
  expect(dt.toFormatString('WW')).toBe('21');
  expect(dt.weekNumber(5).toFormatString('WW')).toBe('05');
});

test("DateTime#toFormatString('kk') returns the abbreviated week year", () => {
  expect(dt.toFormatString('kk')).toBe('82');
});

test("DateTime#toFormatString('kkkk') returns the full week year", () => {
  expect(dt.toFormatString('kkkk')).toBe('1982');
});

test("DateTime#toFormatString('o') returns an unpadded ordinal", () => {
  expect(dt.toFormatString('o')).toBe('145');
  expect(dt.month(1).day(13).toFormatString('o')).toBe('13');
  expect(dt.month(1).day(8).toFormatString('o')).toBe('8');
});

test("DateTime#toFormatString('ooo') returns an unpadded ordinal", () => {
  expect(dt.toFormatString('ooo')).toBe('145');
  expect(dt.month(1).day(13).toFormatString('ooo')).toBe('013');
  expect(dt.month(1).day(8).toFormatString('ooo')).toBe('008');
});

test('DateTime#toFormatString returns a full formatted string', () => {
  expect(dt.toFormatString('MM/yyyy GG')).toBe('05/1982 AD');
});

test('DateTime#toFormatString() accepts literals in single quotes', () => {
  expect(dt.toFormatString("dd/MM/yyyy 'at' hh:mm")).toBe('25/05/1982 at 09:23');
  expect(dt.toFormatString("MMdd'T'hh")).toBe('0525T09');
});

// numbering is disabled while we're still using the polyfill for number formatting
// test('DateTime#numbering() overides the numbering system from the locale', t => {
//  let i = dt;
//  t.is(dt.numbering('beng').toFormatString('S'), '১২৩');
//  t.end();
// });

test("DateTime#toFormatString('D') returns a short date representation", () => {
  expect(dt.toFormatString('D')).toBe('5/25/1982');
  expect(dt.locale('fr').toFormatString('D')).toBe('25/05/1982');
});

test("DateTime#toFormatString('DD') returns a medium date representation", () => {
  expect(dt.toFormatString('DD')).toBe('May 25, 1982');
  expect(dt.month(8).toFormatString('DD')).toBe('Aug 25, 1982');
  expect(dt.locale('fr').toFormatString('DD')).toBe('25 mai 1982');
  expect(dt.locale('fr').month(2).toFormatString('DD')).toBe('25 févr. 1982');
});

test("DateTime#toFormatString('DDD') returns a long date representation", () => {
  expect(dt.toFormatString('DDD')).toBe('May 25, 1982');
  expect(dt.month(8).toFormatString('DDD')).toBe('August 25, 1982');
  expect(dt.locale('fr').toFormatString('DDD')).toBe('25 mai 1982');
  expect(dt.locale('fr').month(2).toFormatString('DDD')).toBe('25 février 1982');
});

test("DateTime#toFormatString('DDDD') returns a long date representation", () => {
  expect(dt.toFormatString('DDDD')).toBe('Tuesday, May 25, 1982');
  expect(dt.month(8).toFormatString('DDDD')).toBe('Wednesday, August 25, 1982');
  expect(dt.locale('fr').toFormatString('DDDD')).toBe('mardi 25 mai 1982');
  expect(dt.locale('fr').month(2).toFormatString('DDDD')).toBe('jeudi 25 février 1982');
});

test("DateTime#toFormatString('t') returns a short time representation", () => {
  expect(dt.toFormatString('t')).toBe('9:23 AM');
  expect(dt.hour(13).toFormatString('t')).toBe('1:23 PM');
  expect(dt.locale('fr').toFormatString('t')).toBe('9:23');
  expect(dt.locale('fr').hour(13).toFormatString('t')).toBe('13:23');
});

test("DateTime#toFormatString('T') returns a short 24-hour time representation", () => {
  expect(dt.toFormatString('T')).toBe('9:23');
  expect(dt.hour(13).toFormatString('T')).toBe('13:23');
  expect(dt.locale('fr').toFormatString('T')).toBe('9:23');
  expect(dt.locale('fr').hour(13).toFormatString('T')).toBe('13:23');
});

test("DateTime#toFormatString('tt') returns a medium time representation", () => {
  expect(dt.toFormatString('tt')).toBe('9:23:54 AM');
  expect(dt.hour(13).toFormatString('tt')).toBe('1:23:54 PM');
  expect(dt.locale('fr').toFormatString('tt')).toBe('9:23:54');
  expect(dt.locale('fr').hour(13).toFormatString('tt')).toBe('13:23:54');
});

test("DateTime#toFormatString('TT') returns a medium 24-hour time representation", () => {
  expect(dt.toFormatString('TT')).toBe('9:23:54');
  expect(dt.hour(13).toFormatString('TT')).toBe('13:23:54');
  expect(dt.locale('fr').toFormatString('TT')).toBe('9:23:54');
  expect(dt.locale('fr').hour(13).toFormatString('TT')).toBe('13:23:54');
});

test("DateTime#toFormatString('f') returns a short date/time representation without seconds", () => {
  expect(dt.toFormatString('f')).toBe('5/25/1982, 9:23 AM');
  expect(dt.hour(13).toFormatString('f')).toBe('5/25/1982, 1:23 PM');
  expect(dt.locale('fr').toFormatString('f')).toBe('25/05/1982 9:23');
  expect(dt.locale('fr').hour(13).toFormatString('f')).toBe('25/05/1982 13:23');
});

test("DateTime#toFormatString('ff') returns a medium date/time representation without seconds", () => {
  expect(dt.toFormatString('ff')).toBe('May 25, 1982, 9:23 AM');
  expect(dt.hour(13).toFormatString('ff')).toBe('May 25, 1982, 1:23 PM');
  expect(dt.month(8).toFormatString('ff')).toBe('Aug 25, 1982, 9:23 AM');
  expect(dt.locale('fr').toFormatString('ff')).toBe('25 mai 1982 à 9:23');
  expect(dt.locale('fr').month(2).toFormatString('ff')).toBe('25 févr. 1982 à 9:23');
  expect(dt.locale('fr').hour(13).toFormatString('ff')).toBe('25 mai 1982 à 13:23');
});

test("DateTime#toFormatString('fff') returns a medium date/time representation without seconds", () => {
  expect(dt.toFormatString('fff')).toBe('May 25, 1982 at 9:23 AM');
  expect(dt.hour(13).toFormatString('fff')).toBe('May 25, 1982 at 1:23 PM');
  expect(dt.month(8).toFormatString('fff')).toBe('August 25, 1982 at 9:23 AM');
  expect(dt.locale('fr').toFormatString('fff')).toBe('25 mai 1982 à 9:23');
  expect(dt.locale('fr').month(2).toFormatString('fff')).toBe('25 février 1982 à 9:23');
  expect(dt.locale('fr').hour(13).toFormatString('fff')).toBe('25 mai 1982 à 13:23');
});

test("DateTime#toFormatString('ffff') returns a long date/time representation without seconds", () => {
  expect(dt.toFormatString('ffff')).toBe('Tuesday, May 25, 1982 at 9:23 AM');
  expect(dt.hour(13).toFormatString('ffff')).toBe('Tuesday, May 25, 1982 at 1:23 PM');
  expect(dt.month(8).toFormatString('ffff')).toBe('Wednesday, August 25, 1982 at 9:23 AM');
  expect(dt.locale('fr').toFormatString('ffff')).toBe('mardi 25 mai 1982 à 9:23');
  expect(dt.locale('fr').month(2).toFormatString('ffff')).toBe('jeudi 25 février 1982 à 9:23');
  expect(dt.locale('fr').hour(13).toFormatString('ffff')).toBe('mardi 25 mai 1982 à 13:23');
});

test("DateTime#toFormatString('F') returns a short date/time representation with seconds", () => {
  expect(dt.toFormatString('F')).toBe('5/25/1982, 9:23:54 AM');
  expect(dt.hour(13).toFormatString('F')).toBe('5/25/1982, 1:23:54 PM');
  expect(dt.locale('fr').toFormatString('F')).toBe('25/05/1982 9:23:54');
  expect(dt.locale('fr').hour(13).toFormatString('F')).toBe('25/05/1982 13:23:54');
});

test("DateTime#toFormatString('FF') returns a medium date/time representation with seconds", () => {
  expect(dt.toFormatString('FF')).toBe('May 25, 1982, 9:23:54 AM');
  expect(dt.hour(13).toFormatString('FF')).toBe('May 25, 1982, 1:23:54 PM');
  expect(dt.month(8).toFormatString('FF')).toBe('Aug 25, 1982, 9:23:54 AM');
  expect(dt.locale('fr').toFormatString('FF')).toBe('25 mai 1982 à 9:23:54');
  expect(dt.locale('fr').month(2).toFormatString('FF')).toBe('25 févr. 1982 à 9:23:54');
  expect(dt.locale('fr').hour(13).toFormatString('FF')).toBe('25 mai 1982 à 13:23:54');
});

test("DateTime#toFormatString('fff') returns a medium date/time representation without seconds", () => {
  expect(dt.toFormatString('fff')).toBe('May 25, 1982 at 9:23 AM');
  expect(dt.hour(13).toFormatString('fff')).toBe('May 25, 1982 at 1:23 PM');
  expect(dt.month(8).toFormatString('fff')).toBe('August 25, 1982 at 9:23 AM');
  expect(dt.locale('fr').toFormatString('fff')).toBe('25 mai 1982 à 9:23');
  expect(dt.locale('fr').month(2).toFormatString('fff')).toBe('25 février 1982 à 9:23');
  expect(dt.locale('fr').hour(13).toFormatString('fff')).toBe('25 mai 1982 à 13:23');
});

test("DateTime#toFormatString('FFFF') returns a long date/time representation without seconds", () => {
  expect(dt.toFormatString('FFFF')).toBe('Tuesday, May 25, 1982 at 9:23:54 AM');
  expect(dt.hour(13).toFormatString('FFFF')).toBe('Tuesday, May 25, 1982 at 1:23:54 PM');
  expect(dt.month(8).toFormatString('FFFF')).toBe('Wednesday, August 25, 1982 at 9:23:54 AM');
  expect(dt.locale('fr').toFormatString('FFFF')).toBe('mardi 25 mai 1982 à 9:23:54');
  expect(dt.locale('fr').month(2).toFormatString('FFFF')).toBe('jeudi 25 février 1982 à 9:23:54');
  expect(dt.locale('fr').hour(13).toFormatString('FFFF')).toBe('mardi 25 mai 1982 à 13:23:54');
});
