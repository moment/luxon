/* global expect Intl */
import { DateTime } from '../../src/luxon';
import { Helpers } from '../helpers';

//------
// No Intl support
//-------
Helpers.withoutIntl('DateTime#toFormat returns English', () => {
  expect(DateTime.local(2014, 8, 6).toFormat('ccc')).toBe('Wed');
  expect(
    DateTime.local(2014, 8, 6)
      .setLocale('fr')
      .toFormat('ccc')
  ).toBe('Wed');
});

Helpers.withoutIntl('DateTime.fromString can still parse English', () => {
  expect(DateTime.fromString('May 15, 2017', 'LLLL dd, yyyy').isValid).toBe(true);
});

Helpers.withoutIntl('DateTime#toLocaleString produces English short date by default', () => {
  expect(DateTime.local(2014, 8, 6, 9, 15).toLocaleString()).toBe('8/6/2014');
});

Helpers.withoutIntl('DateTime#toLocaleString supports known configurations', () => {
  expect(DateTime.local(2014, 8, 6, 9, 15).toLocaleString(DateTime.DATE_FULL)).toBe(
    'August 6, 2014'
  );
});

Helpers.withoutIntl(
  "DateTime#toLocaleString falls back on DATETIME_HUGE if it doesn't understand the input",
  () => {
    expect(DateTime.local(2014, 8, 6, 9, 15).toLocaleString({})).toBe(
      'Wednesday, August 6, 2014, 9:15 AM'
    );
  }
);

Helpers.withoutIntl('DateTime#toLocaleString uses English', () => {
  expect(
    DateTime.local(2014, 8, 6)
      .setLocale('fr')
      .toLocaleString()
  ).toBe('8/6/2014');

  expect(
    DateTime.local(2014, 8, 6, 9, 15)
      .setLocale('fr')
      .toLocaleString(DateTime.DATE_FULL)
  ).toBe('August 6, 2014');
});

Helpers.withoutIntl('DateTime#toLocaleParts returns an empty array', () => {
  expect(DateTime.local().toLocaleParts()).toEqual([]);
});

Helpers.withoutIntl('DateTime.fromString can parse numbers in other locales', () => {
  expect(DateTime.fromString('05/15/2017', 'LL/dd/yyyy', { locale: 'fr' }).isValid).toBe(true);
});

Helpers.withoutIntl("DateTime.fromString can't parse strings from other locales", () => {
  expect(DateTime.fromString('mai 15, 2017', 'LLLL dd, yyyy', { locale: 'fr' }).isValid).toBe(
    false
  );
});

Helpers.withoutIntl('using time zones results in invalid DateTimes', () => {
  expect(DateTime.local().setZone('America/New_York').isValid).toBe(false);
});

Helpers.withoutIntl("DateTime#zoneName falls back to 'local'", () => {
  expect(DateTime.local().zoneName).toBe('local');
});

Helpers.withoutIntl('DateTime#offsetNameLong returns null', () => {
  expect(
    DateTime.fromObject({
      year: 2014,
      month: 8,
      day: 6,
      zone: 'America/New_York'
    }).offsetNameLong
  ).toBe(null);
});

//------
// No FTP support
//-------

Helpers.withoutFTP('DateTime#toLocaleString is unaffected', () => {
  expect(
    DateTime.local(2014, 8, 6)
      .setLocale('fr')
      .toLocaleString()
  ).toBe('06/08/2014');
});

Helpers.withoutFTP('DateTime#toFormat works in English', () => {
  expect(DateTime.local(2014, 8, 6).toFormat('ccc')).toBe('Wed');
});

Helpers.withoutFTP('DateTime#toFormat falls back to English', () => {
  expect(
    DateTime.local(2014, 8, 6)
      .setLocale('fr')
      .toFormat('ccc')
  ).toBe('Wed');
});

Helpers.withoutFTP('DateTime.fromString works in English', () => {
  expect(DateTime.fromString('May 15, 2017', 'LLLL dd, yyyy').isValid).toBe(true);
});

Helpers.withoutFTP('DateTime.fromString can parse numbers in other locales', () => {
  expect(DateTime.fromString('05/15/2017', 'LL/dd/yyyy', { locale: 'fr' }).isValid).toBe(true);
});

Helpers.withoutFTP("DateTime.fromString can't parse strings from other locales", () => {
  expect(DateTime.fromString('mai 15, 2017', 'LLLL dd, yyyy', { locale: 'fr' }).isValid).toBe(
    false
  );
});

Helpers.withoutFTP('setting the time zone still works', () => {
  expect(DateTime.local().setZone('America/New_York').isValid).toBe(true);
});

Helpers.withoutFTP('DateTime#offsetNameLong still works', () => {
  // can still generate offset name
  expect(
    DateTime.fromObject({
      year: 2014,
      month: 8,
      day: 6,
      zone: 'America/New_York'
    }).offsetNameLong
  ).toBe('Eastern Daylight Time');
});

Helpers.withoutFTP('DateTime#toLocaleParts returns an empty array', () => {
  expect(DateTime.local().toLocaleParts()).toEqual([]);
});

//------
// No Zone support
//-------

Helpers.withoutZones('DateTime#toLocaleString is unaffected', () => {
  expect(
    DateTime.local(2014, 8, 6)
      .setLocale('fr')
      .toLocaleString()
  ).toBe('06/08/2014');
});

Helpers.withoutZones('DateTime#toLocaleParts is unaffected', () => {
  expect(
    DateTime.local(2014, 8, 6)
      .setLocale('fr')
      .toLocaleParts()
  ).toEqual([
    { type: 'day', value: '06' },
    { type: 'literal', value: '/' },
    { type: 'month', value: '08' },
    { type: 'literal', value: '/' },
    { type: 'year', value: '2014' }
  ]);
});

Helpers.withoutZones('using time zones results in invalid DateTimes', () => {
  expect(DateTime.local().setZone('America/New_York').isValid).toBe(false);
});
