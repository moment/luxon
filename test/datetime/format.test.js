/* global test expect */

import { DateTime } from '../../dist/cjs/luxon';
import { FakePT } from '../helpers/fakePT';

//------
// #toISO()
//-------
const dt = () =>
  DateTime.fromObject(
    { year: 1982, month: 5, day: 25, hour: 9, minute: 23, second: 54, millisecond: 123 },
    { utc: true }
  );

test("DateTime#toISO() shows 'Z' for UTC", () => {
  expect(dt().toISO()).toBe('1982-05-25T09:23:54.123Z');
});

test('DateTime#toISO() shows the offset', () => {
  const offsetted = dt().useUTCOffset(-6 * 60);
  expect(offsetted.toISO()).toBe('1982-05-25T03:23:54.123-06:00');
});

//------
// #toString()
//-------
test('DateTime#toString() returns the ISO time', () => {
  const i = dt();
  expect(i.useUTCOffset(-6 * 60).toString()).toBe('1982-05-25T03:23:54.123-06:00');
});

//------
// #toLocaleString()
//-------
test('DateTime#toLocaleString returns a sensible string by default', () => {
  expect(dt().locale('en-us').toLocaleString()).toBe('5/25/1982');
});

test('DateTime#toLocaleString accepts locale settings from the dateTime', () => {
  expect(dt().locale('be').toLocaleString()).toBe('25.5.1982');
});

test('DateTime#toLocaleString accepts options to the formatter', () => {
  expect(dt().toLocaleString({ weekday: 'short' }).indexOf('Tue') >= 0).toBeTruthy();
});

test("DateTime#toLocaleString can override the dateTime's locale", () => {
  expect(dt().locale('be').toLocaleString({ localeCode: 'fr' })).toBe('25/05/1982');
});

//------
// #toFormatString()
//-------
test("DateTime#toFormatString('S') returns the millisecond", () => {
  const i = dt();
  expect(i.toFormatString('S')).toBe('123');
  expect(i.locale('bn').toFormatString('S')).toBe('১২৩');
  expect(i.toFormatString('S')).toBe('123');
  expect(i.millisecond(82).toFormatString('S')).toBe('82');
});
test("DateTime#toFormatString('SSS') returns padded the millisecond", () => {
  const i = dt();
  expect(i.toFormatString('SSS')).toBe('123');
  expect(i.locale('bn').toFormatString('SSS')).toBe('১২৩');
  expect(i.millisecond(82).toFormatString('SSS')).toBe('082');
});
test("DateTime#toFormatString('s') returns the second", () => {
  const i = dt();
  expect(i.toFormatString('s')).toBe('54');
  expect(i.locale('bn').toFormatString('s')).toBe('৫৪');
  expect(i.second(6).toFormatString('s')).toBe('6');
});
test("DateTime#toFormatString('ss') returns the padded second", () => {
  const i = dt();
  expect(i.toFormatString('ss')).toBe('54');
  expect(i.locale('bn').toFormatString('ss')).toBe('৫৪');
  expect(i.second(6).toFormatString('ss')).toBe('06');
});
test("DateTime#toFormatString('m') returns the minute", () => {
  const i = dt();
  expect(i.toFormatString('m')).toBe('23');
  expect(i.locale('bn').toFormatString('m')).toBe('২৩');
  expect(i.minute(6).toFormatString('m')).toBe('6');
});
test("DateTime#toFormatString('mm') returns the padded minute", () => {
  const i = dt();
  expect(i.toFormatString('mm')).toBe('23');
  expect(i.locale('bn').toFormatString('mm')).toBe('২৩');
  expect(i.minute(6).toFormatString('mm')).toBe('06');
});
test("DateTime#toFormatString('h') returns the hours", () => {
  const i = dt();
  expect(i.toFormatString('h')).toBe('9');
  expect(i.locale('bn').toFormatString('h')).toBe('৯');
  expect(i.hour(12).toFormatString('h')).toBe('12');
  expect(i.hour(13).toFormatString('h')).toBe('1');
});
test("DateTime#toFormatString('hh') returns the padded hour (12-hour time)", () => {
  const i = dt();
  expect(i.toFormatString('hh')).toBe('09');
  expect(i.locale('bn').toFormatString('hh')).toBe('০৯');
  expect(i.hour(12).toFormatString('hh')).toBe('12');
  expect(i.hour(13).toFormatString('hh')).toBe('01');
});
test("DateTime#toFormatString('H') returns the hour (24-hour time)", () => {
  const i = dt();
  expect(i.toFormatString('H')).toBe('9');
  expect(i.locale('bn').toFormatString('H')).toBe('৯');
  expect(i.hour(12).toFormatString('H')).toBe('12');
  expect(i.hour(13).toFormatString('H')).toBe('13');
});
test("DateTime#toFormatString('HH') returns the padded hour (24-hour time)", () => {
  const i = dt();
  expect(i.toFormatString('HH')).toBe('09');
  expect(i.locale('bn').toFormatString('HH')).toBe('০৯');
  expect(i.hour(12).toFormatString('HH')).toBe('12');
  expect(i.hour(13).toFormatString('HH')).toBe('13');
});
test("DateTime#toFormatString('Z') returns the narrow offset", () => {
  const i = dt();
  expect(i.useUTCOffset(360).toFormatString('Z')).toBe('+6');
  expect(i.useUTCOffset(390).toFormatString('Z')).toBe('+6:30');
  expect(i.useUTCOffset(-360).toFormatString('Z')).toBe('-6');
  expect(i.useUTCOffset(-390).toFormatString('Z')).toBe('-6:30');
});
test("DateTime#toFormatString('ZZ') returns the padded offset", () => {
  const i = dt();
  expect(i.useUTCOffset(360).toFormatString('ZZ')).toBe('+06:00');
  expect(i.useUTCOffset(390).toFormatString('ZZ')).toBe('+06:30');
  expect(i.useUTCOffset(-360).toFormatString('ZZ')).toBe('-06:00');
  expect(i.useUTCOffset(-390).toFormatString('ZZ')).toBe('-06:30');
});
test("DateTime#toFormatString('ZZZ') returns the short offset name", () => {
  const i = dt().rezone(new FakePT());
  expect(i.toFormatString('ZZZ')).toBe('PDT');
});
test("DateTime#toFormatString('ZZZZ') returns the full offset name", () => {
  const i = dt().rezone(new FakePT());
  expect(i.toFormatString('ZZZZ')).toBe('Pacific Daylight Time');
});
test("DateTime#toFormatString('z') returns the zone name", () => {
  const i = dt().rezone(new FakePT());
  expect(i.toFormatString('z')).toBe('Fake Pacific Time');
});
test("DateTime#toFormatString('a') returns the meridiem", () => {
  const i = dt();
  expect(i.toFormatString('a')).toBe('AM');
  expect(i.locale('de').toFormatString('a')).toBe('vorm.');
  expect(i.hour(13).toFormatString('a')).toBe('PM');
  expect(i.hour(13).locale('de').toFormatString('a')).toBe('nachm.');
});
test("DateTime#toFormatString('d') returns the day", () => {
  const i = dt();
  expect(i.toFormatString('d')).toBe('25');
  expect(i.day(1).toFormatString('d')).toBe('1');
});
test("DateTime#toFormatString('dd') returns the padded day", () => {
  const i = dt();
  expect(i.toFormatString('dd')).toBe('25');
  expect(i.day(1).toFormatString('dd')).toBe('01');
});
test("DateTime#toFormatString('E' || 'c') returns weekday number", () => {
  const i = dt();
  expect(i.toFormatString('E')).toBe('2');
  expect(i.toFormatString('c')).toBe('2');
});
test("DateTime#toFormatString('EEE) returns short format weekday name", () => {
  const i = dt();
  expect(i.toFormatString('EEE')).toBe('Tue');
  expect(i.locale('de').toFormatString('EEE')).toBe('Di.');
});
test("DateTime#toFormatString('ccc) returns short standalone weekday name", () => {
  const i = dt();
  expect(i.toFormatString('ccc')).toBe('Tue');
  expect(i.locale('de').toFormatString('ccc')).toBe('Di.');
}); // all these commented-out tests are bc https://github.com/andyearnshaw/Intl.js/issues/190
test("DateTime#toFormatString('EEEE') returns the full format weekday name", () => {
  const i = dt();
  expect(i.toFormatString('EEEE')).toBe('Tuesday');
});
test("DateTime#toFormatString('cccc') returns the full standalone weekday name", () => {
  const i = dt();
  expect(i.toFormatString('cccc')).toBe('Tuesday');
});
test("DateTime#toFormatString('EEEEE' || 'ccccc') returns narrow weekday name", () => {
  const i = dt();
  expect(i.toFormatString('EEEEE')).toBe('T');
  expect(i.toFormatString('ccccc')).toBe('T');
});
test("DateTime#toFormatString('M' || 'L') return the month number", () => {
  const i = dt();
  expect(i.toFormatString('M')).toBe('5');
  expect(i.toFormatString('L')).toBe('5');
});
test("DateTime#toFormatString('MM' || 'LL') return the padded month number", () => {
  const i = dt();
  expect(i.toFormatString('MM')).toBe('05');
});
test("DateTime#toFormatString('MMM') returns the short format month name", () => {
  const i = dt();
  expect(i.toFormatString('MMM')).toBe('May');
  expect(i.locale('de').toFormatString('MMM')).toBe('Mai');
  expect(i.month(8).toFormatString('MMM')).toBe('Aug');
});
test("DateTime#toFormatString('LLL') returns the short standalone month name", () => {
  const i = dt();
  expect(i.toFormatString('LLL')).toBe('May');
  expect(i.locale('de').toFormatString('LLL')).toBe('Mai');
  expect(i.month(8).toFormatString('LLL')).toBe('Aug');
});
test("DateTime#toFormatString('MMMM') returns the full format month name", () => {
  const i = dt();
  expect(i.toFormatString('MMMM')).toBe('May');
  expect(i.month(8).toFormatString('MMMM')).toBe('August');
  expect(i.month(8).locale('ru').toFormatString('MMMM')).toBe('августа');
});
test("DateTime#toFormatString('LLLL') returns the full standalone month name", () => {
  const i = dt();
  expect(i.toFormatString('LLLL')).toBe('May');
  expect(i.month(8).toFormatString('LLLL')).toBe('August');
});
test("DateTime#toFormatString('MMMMM' || 'LLLLL') returns the narrow month name", () => {
  const i = dt();
  expect(i.toFormatString('MMMMM')).toBe('M');
  expect(i.toFormatString('LLLLL')).toBe('M');
});
test("DateTime#toFormatString('y') returns the full year", () => {
  const i = dt();
  expect(i.toFormatString('y')).toBe('1982');
  expect(i.locale('bn').toFormatString('y')).toBe('১৯৮২');
  expect(i.year(3).toFormatString('y')).toBe('3');
});
test("DateTime#toFormatString('yy') returns the two-digit year", () => {
  const i = dt();
  expect(i.toFormatString('yy')).toBe('82');
  expect(i.locale('bn').toFormatString('yy')).toBe('৮২');
  expect(i.year(3).toFormatString('yy')).toBe('03');
});
test("DateTime#toFormatString('yyyy') returns the padded full year", () => {
  const i = dt();
  expect(i.toFormatString('yyyy')).toBe('1982');
  expect(i.locale('bn').toFormatString('yyyy')).toBe('১৯৮২');
  expect(i.year(3).toFormatString('yyyy')).toBe('0003');
  expect(i.year(3).locale('bn').toFormatString('yyyy')).toBe('০০০৩');
});
test("DateTime#toFormatString('G') returns the short era", () => {
  const i = dt();
  expect(i.toFormatString('G')).toBe('AD');
  expect(i.locale('de').toFormatString('G')).toBe('n. Chr.');
  expect(i.year(-21).toFormatString('G')).toBe('BC');
  expect(i.year(-21).locale('de').toFormatString('G')).toBe('v. Chr.');
}); // test("DateTime#toFormatString('GG') returns the full era", t => { //  let i = dt(); //  t.is(i.toFormatString('GG'), 'Anno Domini'); //  t.is(i.year(-21).toFormatString('GG'), 'Before Christ'); //  t.end(); // }); // test("DateTime#toFormatString('GGGGG') returns the narrow era", t => { //  let i = dt(); //  t.is(i.toFormatString('GGGG'), 'A'); //  t.is(i.year(-21).toFormatString('GGGGG'), 'B'); //  t.end(); // });
test('DateTime#toFormatString returns a full formatted string', () => {
  const i = dt();
  expect(i.toFormatString('MM/yyyy GG')).toBe('05/1982 AD');
});
test('DateTime#toFormatString() accepts literals in single quotes', () => {
  const i = dt();
  expect(i.toFormatString("dd/MM/yyyy 'at' hh:mm")).toBe('25/05/1982 at 09:23');
  expect(i.toFormatString("MMdd'T'hh")).toBe('0525T09');
}); // numbering is disabled while we're still using the polyfill for number formatting // test('DateTime#numbering() overides the numbering system from the locale', t => { //  let i = dt(); //  t.is(i.numbering('beng').toFormatString('S'), '১২৩'); //  t.end();
// });
test("DateTime#toFormatString('D') returns a short date representation", () => {
  const i = dt();
  expect(i.toFormatString('D')).toBe('5/25/1982');
  expect(i.locale('fr').toFormatString('D')).toBe('25/05/1982');
});
test("DateTime#toFormatString('DD') returns a medium date representation", () => {
  const i = dt();
  expect(i.toFormatString('DD')).toBe('May 25, 1982');
  expect(i.month(8).toFormatString('DD')).toBe('Aug 25, 1982');
  expect(i.locale('fr').toFormatString('DD')).toBe('25 mai 1982');
  expect(i.locale('fr').month(2).toFormatString('DD')).toBe('25 févr. 1982');
});
test("DateTime#toFormatString('DDD') returns a long date representation", () => {
  const i = dt();
  expect(i.toFormatString('DDD')).toBe('May 25, 1982');
  expect(i.month(8).toFormatString('DDD')).toBe('August 25, 1982');
  expect(i.locale('fr').toFormatString('DDD')).toBe('25 mai 1982');
  expect(i.locale('fr').month(2).toFormatString('DDD')).toBe('25 février 1982');
});
test("DateTime#toFormatString('DDDD') returns a long date representation", () => {
  const i = dt();
  expect(i.toFormatString('DDDD')).toBe('Tuesday, May 25, 1982');
  expect(i.month(8).toFormatString('DDDD')).toBe('Wednesday, August 25, 1982');
  expect(i.locale('fr').toFormatString('DDDD')).toBe('mardi 25 mai 1982');
  expect(i.locale('fr').month(2).toFormatString('DDDD')).toBe('jeudi 25 février 1982');
});
test("DateTime#toFormatString('t') returns a short time representation", () => {
  const i = dt();
  expect(i.toFormatString('t')).toBe('9:23 AM');
  expect(i.hour(13).toFormatString('t')).toBe('1:23 PM');
  expect(i.locale('fr').toFormatString('t')).toBe('9:23');
  expect(i.locale('fr').hour(13).toFormatString('t')).toBe('13:23');
});
test("DateTime#toFormatString('T') returns a short 24-hour time representation", () => {
  const i = dt();
  expect(i.toFormatString('T')).toBe('9:23');
  expect(i.hour(13).toFormatString('T')).toBe('13:23');
  expect(i.locale('fr').toFormatString('T')).toBe('9:23');
  expect(i.locale('fr').hour(13).toFormatString('T')).toBe('13:23');
});
test("DateTime#toFormatString('tt') returns a medium time representation", () => {
  const i = dt();
  expect(i.toFormatString('tt')).toBe('9:23:54 AM');
  expect(i.hour(13).toFormatString('tt')).toBe('1:23:54 PM');
  expect(i.locale('fr').toFormatString('tt')).toBe('9:23:54');
  expect(i.locale('fr').hour(13).toFormatString('tt')).toBe('13:23:54');
});
test("DateTime#toFormatString('TT') returns a medium 24-hour time representation", () => {
  const i = dt();
  expect(i.toFormatString('TT')).toBe('9:23:54');
  expect(i.hour(13).toFormatString('TT')).toBe('13:23:54');
  expect(i.locale('fr').toFormatString('TT')).toBe('9:23:54');
  expect(i.locale('fr').hour(13).toFormatString('TT')).toBe('13:23:54');
});
test("DateTime#toFormatString('f') returns a short date/time representation without seconds", () => {
  const i = dt();
  expect(i.toFormatString('f')).toBe('5/25/1982, 9:23 AM');
  expect(i.hour(13).toFormatString('f')).toBe('5/25/1982, 1:23 PM');
  expect(i.locale('fr').toFormatString('f')).toBe('25/05/1982 9:23');
  expect(i.locale('fr').hour(13).toFormatString('f')).toBe('25/05/1982 13:23');
});
test("DateTime#toFormatString('ff') returns a medium date/time representation without seconds", () => {
  const i = dt();
  expect(i.toFormatString('ff')).toBe('May 25, 1982, 9:23 AM');
  expect(i.hour(13).toFormatString('ff')).toBe('May 25, 1982, 1:23 PM');
  expect(i.month(8).toFormatString('ff')).toBe('Aug 25, 1982, 9:23 AM');
  expect(i.locale('fr').toFormatString('ff')).toBe('25 mai 1982 à 9:23');
  expect(i.locale('fr').month(2).toFormatString('ff')).toBe('25 févr. 1982 à 9:23');
  expect(i.locale('fr').hour(13).toFormatString('ff')).toBe('25 mai 1982 à 13:23');
});
test("DateTime#toFormatString('fff') returns a medium date/time representation without seconds", () => {
  const i = dt();
  expect(i.toFormatString('fff')).toBe('May 25, 1982 at 9:23 AM');
  expect(i.hour(13).toFormatString('fff')).toBe('May 25, 1982 at 1:23 PM');
  expect(i.month(8).toFormatString('fff')).toBe('August 25, 1982 at 9:23 AM');
  expect(i.locale('fr').toFormatString('fff')).toBe('25 mai 1982 à 9:23');
  expect(i.locale('fr').month(2).toFormatString('fff')).toBe('25 février 1982 à 9:23');
  expect(i.locale('fr').hour(13).toFormatString('fff')).toBe('25 mai 1982 à 13:23');
});
test("DateTime#toFormatString('ffff') returns a long date/time representation without seconds", () => {
  const i = dt();
  expect(i.toFormatString('ffff')).toBe('Tuesday, May 25, 1982 at 9:23 AM');
  expect(i.hour(13).toFormatString('ffff')).toBe('Tuesday, May 25, 1982 at 1:23 PM');
  expect(i.month(8).toFormatString('ffff')).toBe('Wednesday, August 25, 1982 at 9:23 AM');
  expect(i.locale('fr').toFormatString('ffff')).toBe('mardi 25 mai 1982 à 9:23');
  expect(i.locale('fr').month(2).toFormatString('ffff')).toBe('jeudi 25 février 1982 à 9:23');
  expect(i.locale('fr').hour(13).toFormatString('ffff')).toBe('mardi 25 mai 1982 à 13:23');
});
test("DateTime#toFormatString('F') returns a short date/time representation with seconds", () => {
  const i = dt();
  expect(i.toFormatString('F')).toBe('5/25/1982, 9:23:54 AM');
  expect(i.hour(13).toFormatString('F')).toBe('5/25/1982, 1:23:54 PM');
  expect(i.locale('fr').toFormatString('F')).toBe('25/05/1982 9:23:54');
  expect(i.locale('fr').hour(13).toFormatString('F')).toBe('25/05/1982 13:23:54');
});
test("DateTime#toFormatString('FF') returns a medium date/time representation with seconds", () => {
  const i = dt();
  expect(i.toFormatString('FF')).toBe('May 25, 1982, 9:23:54 AM');
  expect(i.hour(13).toFormatString('FF')).toBe('May 25, 1982, 1:23:54 PM');
  expect(i.month(8).toFormatString('FF')).toBe('Aug 25, 1982, 9:23:54 AM');
  expect(i.locale('fr').toFormatString('FF')).toBe('25 mai 1982 à 9:23:54');
  expect(i.locale('fr').month(2).toFormatString('FF')).toBe('25 févr. 1982 à 9:23:54');
  expect(i.locale('fr').hour(13).toFormatString('FF')).toBe('25 mai 1982 à 13:23:54');
});
test("DateTime#toFormatString('fff') returns a medium date/time representation without seconds", () => {
  const i = dt();
  expect(i.toFormatString('fff')).toBe('May 25, 1982 at 9:23 AM');
  expect(i.hour(13).toFormatString('fff')).toBe('May 25, 1982 at 1:23 PM');
  expect(i.month(8).toFormatString('fff')).toBe('August 25, 1982 at 9:23 AM');
  expect(i.locale('fr').toFormatString('fff')).toBe('25 mai 1982 à 9:23');
  expect(i.locale('fr').month(2).toFormatString('fff')).toBe('25 février 1982 à 9:23');
  expect(i.locale('fr').hour(13).toFormatString('fff')).toBe('25 mai 1982 à 13:23');
});
test("DateTime#toFormatString('FFFF') returns a long date/time representation without seconds", () => {
  const i = dt();
  expect(i.toFormatString('FFFF')).toBe('Tuesday, May 25, 1982 at 9:23:54 AM');
  expect(i.hour(13).toFormatString('FFFF')).toBe('Tuesday, May 25, 1982 at 1:23:54 PM');
  expect(i.month(8).toFormatString('FFFF')).toBe('Wednesday, August 25, 1982 at 9:23:54 AM');
  expect(i.locale('fr').toFormatString('FFFF')).toBe('mardi 25 mai 1982 à 9:23:54');
  expect(i.locale('fr').month(2).toFormatString('FFFF')).toBe('jeudi 25 février 1982 à 9:23:54');
  expect(i.locale('fr').hour(13).toFormatString('FFFF')).toBe('mardi 25 mai 1982 à 13:23:54');
});
