/* global test expect */

import { DateTime } from '../../src/luxon';

const dt = DateTime.fromObject({
    year: 1982,
    month: 5,
    day: 25,
    hour: 9,
    minute: 23,
    second: 54,
    millisecond: 123,
    zone: 'utc'
  }),
  ny = dt.setZone('America/New_York', { keepCalendarTime: true });

//------
// #toFormat()
//------
test("DateTime#toFormat('S') returns the millisecond", () => {
  expect(dt.toFormat('S')).toBe('123');
  expect(dt.reconfigure({ locale: 'bn' }).toFormat('S')).toBe('১২৩');
  expect(dt.toFormat('S')).toBe('123');
  expect(dt.set({ millisecond: 82 }).toFormat('S')).toBe('82');
});

test("DateTime#toFormat('SSS') returns padded the millisecond", () => {
  expect(dt.toFormat('SSS')).toBe('123');
  expect(dt.reconfigure({ locale: 'bn' }).toFormat('SSS')).toBe('১২৩');
  expect(dt.set({ millisecond: 82 }).toFormat('SSS')).toBe('082');
});

test("DateTime#toFormat('s') returns the second", () => {
  expect(dt.toFormat('s')).toBe('54');
  expect(dt.reconfigure({ locale: 'bn' }).toFormat('s')).toBe('৫৪');
  expect(dt.set({ second: 6 }).toFormat('s')).toBe('6');
});

test("DateTime#toFormat('ss') returns the padded second", () => {
  expect(dt.toFormat('ss')).toBe('54');
  expect(dt.reconfigure({ locale: 'bn' }).toFormat('ss')).toBe('৫৪');
  expect(dt.set({ second: 6 }).toFormat('ss')).toBe('06');
});

test("DateTime#toFormat('m') returns the minute", () => {
  expect(dt.toFormat('m')).toBe('23');
  expect(dt.reconfigure({ locale: 'bn' }).toFormat('m')).toBe('২৩');
  expect(dt.set({ minute: 6 }).toFormat('m')).toBe('6');
});

test("DateTime#toFormat('mm') returns the padded minute", () => {
  expect(dt.toFormat('mm')).toBe('23');
  expect(dt.reconfigure({ locale: 'bn' }).toFormat('mm')).toBe('২৩');
  expect(dt.set({ minute: 6 }).toFormat('mm')).toBe('06');
});

test("DateTime#toFormat('h') returns the hours", () => {
  expect(dt.toFormat('h')).toBe('9');
  expect(dt.reconfigure({ locale: 'bn' }).toFormat('h')).toBe('৯');
  expect(dt.set({ hour: 12 }).toFormat('h')).toBe('12');
  expect(dt.set({ hour: 13 }).toFormat('h')).toBe('1');
});

test("DateTime#toFormat('hh') returns the padded hour (12-hour time)", () => {
  expect(dt.toFormat('hh')).toBe('09');
  expect(dt.reconfigure({ locale: 'bn' }).toFormat('hh')).toBe('০৯');
  expect(dt.set({ hour: 12 }).toFormat('hh')).toBe('12');
  expect(dt.set({ hour: 13 }).toFormat('hh')).toBe('01');
});

test("DateTime#toFormat('H') returns the hour (24-hour time)", () => {
  expect(dt.toFormat('H')).toBe('9');
  expect(dt.reconfigure({ locale: 'bn' }).toFormat('H')).toBe('৯');
  expect(dt.set({ hour: 12 }).toFormat('H')).toBe('12');
  expect(dt.set({ hour: 13 }).toFormat('H')).toBe('13');
});

test("DateTime#toFormat('HH') returns the padded hour (24-hour time)", () => {
  expect(dt.toFormat('HH')).toBe('09');
  expect(dt.reconfigure({ locale: 'bn' }).toFormat('HH')).toBe('০৯');
  expect(dt.set({ hour: 12 }).toFormat('HH')).toBe('12');
  expect(dt.set({ hour: 13 }).toFormat('HH')).toBe('13');
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
  const zoned = dt.setZone('America/Los_Angeles');
  expect(zoned.toFormat('ZZZZ')).toBe('PDT');
});

test("DateTime#toFormat('ZZZZZ') returns the full offset name", () => {
  const zoned = dt.setZone('America/Los_Angeles');
  expect(zoned.toFormat('ZZZZZ')).toBe('Pacific Daylight Time');
});

test("DateTime#toFormat('z') returns the zone name", () => {
  const zoned = dt.setZone('America/Los_Angeles');
  expect(zoned.toFormat('z')).toBe('America/Los_Angeles');
});

test("DateTime#toFormat('a') returns the meridiem", () => {
  expect(dt.toFormat('a')).toBe('AM');
  expect(dt.reconfigure({ locale: 'de' }).toFormat('a')).toBe('vorm.');
  expect(dt.set({ hour: 13 }).toFormat('a')).toBe('PM');
  expect(
    dt
      .set({ hour: 13 })
      .reconfigure({ locale: 'de' })
      .toFormat('a')
  ).toBe('nachm.');
});

test("DateTime#toFormat('d') returns the day", () => {
  expect(dt.toFormat('d')).toBe('25');
  expect(dt.set({ day: 1 }).toFormat('d')).toBe('1');
});

test("DateTime#toFormat('dd') returns the padded day", () => {
  expect(dt.toFormat('dd')).toBe('25');
  expect(dt.set({ day: 1 }).toFormat('dd')).toBe('01');
});

test("DateTime#toFormat('E' || 'c') returns weekday number", () => {
  expect(dt.toFormat('E')).toBe('2');
  expect(dt.toFormat('c')).toBe('2');
});

test("DateTime#toFormat('EEE') returns short format weekday name", () => {
  expect(dt.toFormat('EEE')).toBe('Tue');
  expect(dt.reconfigure({ locale: 'de' }).toFormat('EEE')).toBe('Di.');
});

test("DateTime#toFormat('ccc') returns short standalone weekday name", () => {
  expect(dt.toFormat('ccc')).toBe('Tue');
  expect(dt.reconfigure({ locale: 'de' }).toFormat('ccc')).toBe('Di');
});

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
  expect(dt.reconfigure({ locale: 'de' }).toFormat('MMM')).toBe('Mai');
  expect(dt.set({ month: 8 }).toFormat('MMM')).toBe('Aug');
});

test("DateTime#toFormat('LLL') returns the short standalone month name", () => {
  expect(dt.toFormat('LLL')).toBe('May');
  expect(dt.reconfigure({ locale: 'de' }).toFormat('LLL')).toBe('Mai');
  expect(dt.set({ month: 8 }).toFormat('LLL')).toBe('Aug');
});

test("DateTime#toFormat('MMMM') returns the full format month name", () => {
  expect(dt.toFormat('MMMM')).toBe('May');
  expect(dt.set({ month: 8 }).toFormat('MMMM')).toBe('August');
  expect(
    dt
      .set({ month: 8 })
      .reconfigure({ locale: 'ru' })
      .toFormat('MMMM')
  ).toBe('августа');
});

test("DateTime#toFormat('LLLL') returns the full standalone month name", () => {
  expect(dt.toFormat('LLLL')).toBe('May');
  expect(dt.set({ month: 8 }).toFormat('LLLL')).toBe('August');
});

test("DateTime#toFormat('MMMMM' || 'LLLLL') returns the narrow month name", () => {
  expect(dt.toFormat('MMMMM')).toBe('M');
  expect(dt.toFormat('LLLLL')).toBe('M');
});

test("DateTime#toFormat('y') returns the full year", () => {
  expect(dt.toFormat('y')).toBe('1982');
  expect(dt.reconfigure({ locale: 'bn' }).toFormat('y')).toBe('১৯৮২');
  expect(dt.set({ year: 3 }).toFormat('y')).toBe('3');
});

test("DateTime#toFormat('yy') returns the two-digit year", () => {
  expect(dt.toFormat('yy')).toBe('82');
  expect(dt.reconfigure({ locale: 'bn' }).toFormat('yy')).toBe('৮২');
  expect(dt.set({ year: 3 }).toFormat('yy')).toBe('03');
});

test("DateTime#toFormat('yyyy') returns the padded full year", () => {
  expect(dt.toFormat('yyyy')).toBe('1982');
  expect(dt.reconfigure({ locale: 'bn' }).toFormat('yyyy')).toBe('১৯৮২');
  expect(dt.set({ year: 3 }).toFormat('yyyy')).toBe('0003');
  expect(
    dt
      .set({ year: 3 })
      .reconfigure({ locale: 'bn' })
      .toFormat('yyyy')
  ).toBe('০০০৩');
});

test("DateTime#toFormat('G') returns the short era", () => {
  expect(dt.toFormat('G')).toBe('AD');
  expect(dt.reconfigure({ locale: 'de' }).toFormat('G')).toBe('n. Chr.');
  expect(dt.set({ year: -21 }).toFormat('G')).toBe('BC');
  expect(
    dt
      .set({ year: -21 })
      .reconfigure({ locale: 'de' })
      .toFormat('G')
  ).toBe('v. Chr.');
});

test("DateTime#toFormat('GG') returns the full era", () => {
  expect(dt.toFormat('GG')).toBe('Anno Domini');
  expect(dt.set({ year: -21 }).toFormat('GG')).toBe('Before Christ');
});

test("DateTime#toFormat('GGGGG') returns the narrow era", () => {
  expect(dt.toFormat('GGGGG')).toBe('A');
  expect(dt.set({ year: -21 }).toFormat('GGGGG')).toBe('B');
});

test("DateTime#toFormat('W') returns the week number", () => {
  expect(dt.toFormat('W')).toBe('21');
  expect(dt.set({ weekNumber: 5 }).toFormat('W')).toBe('5');
});

test("DateTime#toFormat('WW') returns the padded week number", () => {
  expect(dt.toFormat('WW')).toBe('21');
  expect(dt.set({ weekNumber: 5 }).toFormat('WW')).toBe('05');
});

test("DateTime#toFormat('kk') returns the abbreviated week year", () => {
  expect(dt.toFormat('kk')).toBe('82');
});

test("DateTime#toFormat('kkkk') returns the full week year", () => {
  expect(dt.toFormat('kkkk')).toBe('1982');
});

test("DateTime#toFormat('o') returns an unpadded ordinal", () => {
  expect(dt.toFormat('o')).toBe('145');
  expect(dt.set({ month: 1, day: 13 }).toFormat('o')).toBe('13');
  expect(dt.set({ month: 1, day: 8 }).toFormat('o')).toBe('8');
});

test("DateTime#toFormat('ooo') returns an unpadded ordinal", () => {
  expect(dt.toFormat('ooo')).toBe('145');
  expect(dt.set({ month: 1, day: 13 }).toFormat('ooo')).toBe('013');
  expect(dt.set({ month: 1, day: 8 }).toFormat('ooo')).toBe('008');
});

test("DateTime#toFormat('D') returns a short date representation", () => {
  expect(dt.toFormat('D')).toBe('5/25/1982');
  expect(dt.reconfigure({ locale: 'fr' }).toFormat('D')).toBe('25/05/1982');
});

test("DateTime#toFormat('DD') returns a medium date representation", () => {
  expect(dt.toFormat('DD')).toBe('May 25, 1982');
  expect(dt.set({ month: 8 }).toFormat('DD')).toBe('Aug 25, 1982');
  expect(dt.reconfigure({ locale: 'fr' }).toFormat('DD')).toBe('25 mai 1982');
  expect(
    dt
      .set({ month: 2 })
      .reconfigure({ locale: 'fr' })
      .toFormat('DD')
  ).toBe('25 févr. 1982');
});

test("DateTime#toFormat('DDD') returns a long date representation", () => {
  expect(dt.toFormat('DDD')).toBe('May 25, 1982');
  expect(dt.set({ month: 8 }).toFormat('DDD')).toBe('August 25, 1982');
  expect(dt.reconfigure({ locale: 'fr' }).toFormat('DDD')).toBe('25 mai 1982');
  expect(
    dt
      .set({ month: 2 })
      .reconfigure({ locale: 'fr' })
      .toFormat('DDD')
  ).toBe('25 février 1982');
});

test("DateTime#toFormat('DDDD') returns a long date representation", () => {
  expect(dt.toFormat('DDDD')).toBe('Tuesday, May 25, 1982');
  expect(dt.set({ month: 8 }).toFormat('DDDD')).toBe('Wednesday, August 25, 1982');
  expect(dt.reconfigure({ locale: 'fr' }).toFormat('DDDD')).toBe('mardi 25 mai 1982');
  expect(
    dt
      .set({ month: 2 })
      .reconfigure({ locale: 'fr' })
      .toFormat('DDDD')
  ).toBe('jeudi 25 février 1982');
});

test("DateTime#toFormat('t') returns a short time representation", () => {
  expect(dt.toFormat('t')).toBe('9:23 AM');
  expect(dt.set({ hour: 13 }).toFormat('t')).toBe('1:23 PM');
  expect(dt.reconfigure({ locale: 'fr' }).toFormat('t')).toBe('09:23');
  expect(
    dt
      .set({ hour: 13 })
      .reconfigure({ locale: 'fr' })
      .toFormat('t')
  ).toBe('13:23');
});

test("DateTime#toFormat('T') returns a short 24-hour time representation", () => {
  expect(dt.toFormat('T')).toBe('09:23');
  expect(dt.set({ hour: 13 }).toFormat('T')).toBe('13:23');
  expect(dt.reconfigure({ locale: 'fr' }).toFormat('T')).toBe('09:23');
  expect(
    dt
      .set({ hour: 13 })
      .reconfigure({ locale: 'fr' })
      .toFormat('T')
  ).toBe('13:23');
});

test("DateTime#toFormat('tt') returns a medium time representation", () => {
  expect(dt.toFormat('tt')).toBe('9:23:54 AM');
  expect(dt.set({ hour: 13 }).toFormat('tt')).toBe('1:23:54 PM');
  expect(dt.reconfigure({ locale: 'fr' }).toFormat('tt')).toBe('09:23:54');
  expect(
    dt
      .set({ hour: 13 })
      .reconfigure({ locale: 'fr' })
      .toFormat('tt')
  ).toBe('13:23:54');
});

test("DateTime#toFormat('TT') returns a medium 24-hour time representation", () => {
  expect(dt.toFormat('TT')).toBe('09:23:54');
  expect(dt.set({ hour: 13 }).toFormat('TT')).toBe('13:23:54');
  expect(dt.reconfigure({ locale: 'fr' }).toFormat('TT')).toBe('09:23:54');
  expect(
    dt
      .set({ hour: 13 })
      .reconfigure({ locale: 'fr' })
      .toFormat('TT')
  ).toBe('13:23:54');
});

test("DateTime#toFormat('ttt') returns a medium time representation", () => {
  // these seem to fail on Travis
  // expect(dt.toFormat('ttt')).toBe('9:23:54 AM GMT');
  // expect(dt.set({ hour: 13 }).toFormat('ttt')).toBe('1:23:54 PM GMT');
  // expect(dt.reconfigure({ locale: 'fr' }).toFormat('ttt')).toBe('09:23:54 UTC');
  // expect(dt.set({ hour: 13 }).reconfigure({ locale: 'fr' }).toFormat('ttt')).toBe('13:23:54 UTC');
});

test("DateTime#toFormat('TTT') returns a medium time representation", () => {
  // these seem to fail on Travis
  // expect(dt.toFormat('TTT')).toBe('09:23:54 GMT');
  // expect(dt.set({ hour: 13 }).toFormat('TTT')).toBe('13:23:54 GMT');
  // expect(dt.reconfigure({locale: 'fr' }).toFormat('TTT')).toBe('09:23:54 UTC');
  // expect(dt.set({hour: 13 }).reconfigure({ locale: 'fr' }).toFormat('TTT')).toBe('13:23:54 UTC');
});

test("DateTime#toFormat('f') returns a short date/time representation without seconds", () => {
  expect(dt.toFormat('f')).toBe('5/25/1982, 9:23 AM');
  expect(dt.set({ hour: 13 }).toFormat('f')).toBe('5/25/1982, 1:23 PM');
  expect(dt.reconfigure({ locale: 'fr' }).toFormat('f')).toBe('25/05/1982 à 09:23');
  expect(
    dt
      .set({ hour: 13 })
      .reconfigure({ locale: 'fr' })
      .toFormat('f')
  ).toBe('25/05/1982 à 13:23');
});

test("DateTime#toFormat('ff') returns a medium date/time representation without seconds", () => {
  expect(dt.toFormat('ff')).toBe('May 25, 1982, 9:23 AM');
  expect(dt.set({ hour: 13 }).toFormat('ff')).toBe('May 25, 1982, 1:23 PM');
  expect(dt.set({ month: 8 }).toFormat('ff')).toBe('Aug 25, 1982, 9:23 AM');
  expect(dt.reconfigure({ locale: 'fr' }).toFormat('ff')).toBe('25 mai 1982 à 09:23');
  expect(
    dt
      .set({ month: 2 })
      .reconfigure({ locale: 'fr' })
      .toFormat('ff')
  ).toBe('25 févr. 1982 à 09:23');
  expect(
    dt
      .set({ hour: 13 })
      .reconfigure({ locale: 'fr' })
      .toFormat('ff')
  ).toBe('25 mai 1982 à 13:23');
});

test("DateTime#toFormat('fff') returns a medium date/time representation without seconds", () => {
  expect(ny.toFormat('fff')).toBe('May 25, 1982, 9:23 AM EDT');
  expect(ny.set({ hour: 13 }).toFormat('fff')).toBe('May 25, 1982, 1:23 PM EDT');
  expect(ny.set({ month: 8 }).toFormat('fff')).toBe('August 25, 1982, 9:23 AM EDT');
  expect(ny.reconfigure({ locale: 'fr' }).toFormat('fff')).toBe('25 mai 1982 à 09:23 UTC−4');
  expect(
    ny
      .set({ month: 2 })
      .reconfigure({ locale: 'fr' })
      .toFormat('fff')
  ).toBe('25 février 1982 à 09:23 UTC−5');
  expect(
    ny
      .set({ hour: 13 })
      .reconfigure({ locale: 'fr' })
      .toFormat('fff')
  ).toBe('25 mai 1982 à 13:23 UTC−4');
});

test("DateTime#toFormat('ffff') returns a long date/time representation without seconds", () => {
  expect(ny.toFormat('ffff')).toBe('Tuesday, May 25, 1982, 9:23 AM Eastern Daylight Time');
  expect(ny.set({ hour: 13 }).toFormat('ffff')).toBe(
    'Tuesday, May 25, 1982, 1:23 PM Eastern Daylight Time'
  );
  expect(ny.set({ month: 2 }).toFormat('ffff')).toBe(
    'Thursday, February 25, 1982, 9:23 AM Eastern Standard Time'
  );
  expect(ny.reconfigure({ locale: 'fr' }).toFormat('ffff')).toBe(
    'mardi 25 mai 1982 à 09:23 heure d’été de l’Est'
  );
  expect(
    ny
      .set({ month: 2 })
      .reconfigure({ locale: 'fr' })
      .toFormat('ffff')
  ).toBe('jeudi 25 février 1982 à 09:23 heure normale de l’Est nord-américain');
  expect(
    ny
      .set({ hour: 13 })
      .reconfigure({ locale: 'fr' })
      .toFormat('ffff')
  ).toBe('mardi 25 mai 1982 à 13:23 heure d’été de l’Est');
});

test("DateTime#toFormat('F') returns a short date/time representation with seconds", () => {
  expect(dt.toFormat('F')).toBe('5/25/1982, 9:23:54 AM');
  expect(dt.set({ hour: 13 }).toFormat('F')).toBe('5/25/1982, 1:23:54 PM');
  expect(dt.reconfigure({ locale: 'fr' }).toFormat('F')).toBe('25/05/1982 à 09:23:54');
  expect(
    dt
      .set({ hour: 13 })
      .reconfigure({ locale: 'fr' })
      .toFormat('F')
  ).toBe('25/05/1982 à 13:23:54');
});

test("DateTime#toFormat('FF') returns a medium date/time representation with seconds", () => {
  expect(dt.toFormat('FF')).toBe('May 25, 1982, 9:23:54 AM');
  expect(dt.set({ hour: 13 }).toFormat('FF')).toBe('May 25, 1982, 1:23:54 PM');
  expect(dt.set({ month: 8 }).toFormat('FF')).toBe('Aug 25, 1982, 9:23:54 AM');
  expect(dt.reconfigure({ locale: 'fr' }).toFormat('FF')).toBe('25 mai 1982 à 09:23:54');
  expect(
    dt
      .set({ month: 2 })
      .reconfigure({ locale: 'fr' })
      .toFormat('FF')
  ).toBe('25 févr. 1982 à 09:23:54');
  expect(
    dt
      .set({ hour: 13 })
      .reconfigure({ locale: 'fr' })
      .toFormat('FF')
  ).toBe('25 mai 1982 à 13:23:54');
});

test("DateTime#toFormat('FFF') returns a medium date/time representation without seconds", () => {
  expect(ny.toFormat('FFF')).toBe('May 25, 1982, 9:23:54 AM EDT');
  expect(ny.set({ hour: 13 }).toFormat('FFF')).toBe('May 25, 1982, 1:23:54 PM EDT');
  expect(ny.set({ month: 8 }).toFormat('FFF')).toBe('August 25, 1982, 9:23:54 AM EDT');
  expect(ny.reconfigure({ locale: 'fr' }).toFormat('FFF')).toBe('25 mai 1982 à 09:23:54 UTC−4');
  expect(
    ny
      .set({ month: 2 })
      .reconfigure({ locale: 'fr' })
      .toFormat('FFF')
  ).toBe('25 février 1982 à 09:23:54 UTC−5');
  expect(
    ny
      .set({ hour: 13 })
      .reconfigure({ locale: 'fr' })
      .toFormat('FFF')
  ).toBe('25 mai 1982 à 13:23:54 UTC−4');
});

test("DateTime#toFormat('FFFF') returns a long date/time representation without seconds", () => {
  expect(ny.toFormat('FFFF')).toBe('Tuesday, May 25, 1982, 9:23:54 AM Eastern Daylight Time');
  expect(ny.set({ hour: 13 }).toFormat('FFFF')).toBe(
    'Tuesday, May 25, 1982, 1:23:54 PM Eastern Daylight Time'
  );
  expect(ny.set({ month: 2 }).toFormat('FFFF')).toBe(
    'Thursday, February 25, 1982, 9:23:54 AM Eastern Standard Time'
  );
  expect(ny.reconfigure({ locale: 'fr' }).toFormat('FFFF')).toBe(
    'mardi 25 mai 1982 à 09:23:54 heure d’été de l’Est'
  );
  expect(
    ny
      .set({ month: 2 })
      .reconfigure({ locale: 'fr' })
      .toFormat('FFFF')
  ).toBe('jeudi 25 février 1982 à 09:23:54 heure normale de l’Est nord-américain');
  expect(
    ny
      .set({ hour: 13 })
      .reconfigure({ locale: 'fr' })
      .toFormat('FFFF')
  ).toBe('mardi 25 mai 1982 à 13:23:54 heure d’été de l’Est');
});

test('DateTime#toFormat returns a full formatted string', () => {
  expect(dt.toFormat('MM/yyyy GG')).toBe('05/1982 Anno Domini');
});

test('DateTime#toFormat() accepts literals in single quotes', () => {
  expect(dt.toFormat("dd/MM/yyyy 'at' hh:mm")).toBe('25/05/1982 at 09:23');
  expect(dt.toFormat("MMdd'T'hh")).toBe('0525T09');
});

test('DateTime#toFormat() uses the numbering system', () => {
  expect(dt.reconfigure({ numberingSystem: 'beng' }).toFormat('S')).toBe('১২৩');
});

test('DateTime#toFormat() uses the output calendar', () => {
  expect(dt.reconfigure({ outputCalendar: 'islamic' }).toFormat('MMMM yyyy')).toBe('Shaʻban 1402');
});

test('DateTime#toFormat() returns something different for invalid DateTimes', () => {
  expect(DateTime.invalid('because').toFormat('dd MM yyyy')).toBe('Invalid DateTime');
});
