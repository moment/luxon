/* global test expect */

import { DateTime } from '../../dist/cjs/luxon';

//------
// .fromISO
//-------
test('DateTime.fromISO() parses as local by default', () => {
  const dt = DateTime.fromISO('2016-05-25T09:08:34.123');
  expect(dt.toObject()).toEqual({
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 8,
    second: 34,
    millisecond: 123
  });
});

test('DateTime.fromISO() uses the offset provided, but keeps the dateTime as local', () => {
  const dt = DateTime.fromISO('2016-05-25T09:08:34.123+06:00');
  expect(dt.utc().toObject()).toEqual({
    year: 2016,
    month: 5,
    day: 25,
    hour: 3,
    minute: 8,
    second: 34,
    millisecond: 123
  });
});

test('DateTime.fromISO() uses the Z if provided, but keeps the dateTime as local', () => {
  const dt = DateTime.fromISO('2016-05-25T09:08:34.123Z');
  expect(dt.utc().toObject()).toEqual({
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 8,
    second: 34,
    millisecond: 123
  });
});

test('DateTime.fromISO() optionally adopts the UTC offset provided', () => {
  const dt = DateTime.fromISO('2016-05-25T09:08:34.123+06:00', { setZone: true });
  expect(dt.zone.name).toBe('UTC+6');
  expect(dt.toObject()).toEqual({
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 8,
    second: 34,
    millisecond: 123
  });
});

test('DateTime.fromISO() can optionally specify a zone', () => {
  let dt = DateTime.fromISO('2016-05-25T09:08:34.123', { zone: 'utc' });
  expect(dt.offset()).toEqual(0);
  expect(dt.toObject()).toEqual({
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 8,
    second: 34,
    millisecond: 123
  });

  dt = DateTime.fromISO('2016-05-25T09:08:34.123+06:00', { zone: 'utc' });
  expect(dt.offset()).toEqual(0);
  expect(dt.toObject()).toEqual({
    year: 2016,
    month: 5,
    day: 25,
    hour: 3,
    minute: 8,
    second: 34,
    millisecond: 123
  });
});

test('DateTime.fromISO() accepts a variety of ISO formats', () => {
  const isSame = (s, expected) => expect(DateTime.fromISO(s).toObject()).toEqual(expected);

  isSame('2016-05-25', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  });
  isSame('20160525', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  });
  isSame('2016-05-25T09', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 0,
    second: 0,
    millisecond: 0
  });
  isSame('2016-05-25T09:24', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 0,
    millisecond: 0
  });
  isSame('2016-05-25T09:24:15', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 0
  });
  isSame('2016-05-25T09:24:15.123', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123
  });
  isSame('2016-05-25T0924', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 0,
    millisecond: 0
  });
  isSame('2016-05-25T092415', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 0
  });
  isSame('2016-05-25T092415.123', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123
  });
  isSame('2016-05-25T09:24:15,123', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123
  });

  // these are formats that aren't technically valid but we parse anyway.
  // Testing them more to document them than anything else
  isSame('2016-05-25T0924:15.123', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123
  });
  isSame('2016-05-25T09:2415.123', {
    year: 2016,
    month: 5,
    day: 25,
    hour: 9,
    minute: 24,
    second: 15,
    millisecond: 123
  });
});

test('DateTime.fromISO() rejects poop', () => {
  const rejects = s => expect(DateTime.fromISO(s).isValid()).toBeFalsy();

  rejects(null);
  rejects('');
  rejects(' ');
  rejects('2016');
  rejects('2016-1');
  rejects('2016-1-15');
  rejects('2016-01-5');
  rejects('2016-05-25 08:34:34');
  rejects('2016-05-25Q08:34:34');
  rejects('2016-05-25T8:04:34');
  rejects('2016-05-25T08:4:34');
  rejects('2016-05-25T08:04:4');
  rejects('2016-05-25T:03:4');
  rejects('2016-05-25T08::4');

  // some of these are actually valid iso we don't take (yet)
  rejects('2016-08');
  rejects('2016-082');
  rejects('2016-W32');
  rejects('2016-W32-02');
});

//------
// .fromString
//-------
test('DateTime.fromString() parses basic times', () => {
  const i = DateTime.fromString('1982/05/25 09:10:11.445', 'yyyy/MM/dd HH:mm:ss.SSS');
  expect(i.year()).toBe(1982);
  expect(i.month()).toBe(5);
  expect(i.day()).toBe(25);
  expect(i.hour()).toBe(9);
  expect(i.minute()).toBe(10);
  expect(i.second()).toBe(11);
  expect(i.millisecond()).toBe(445);
});

test('DateTime.fromString() parses meridiems', () => {
  let i = DateTime.fromString('1982/05/25 9 PM', 'yyyy/MM/dd h a');
  expect(i.year()).toBe(1982);
  expect(i.month()).toBe(5);
  expect(i.day()).toBe(25);
  expect(i.hour()).toBe(21);

  i = DateTime.fromString('1982/05/25 9 AM', 'yyyy/MM/dd h a');
  expect(i.year()).toBe(1982);
  expect(i.month()).toBe(5);
  expect(i.day()).toBe(25);
  expect(i.hour()).toBe(9);
});

test('DateTime.fromString() parses eras', () => {});

test('DateTime.fromString() parses month names', () => {
  let i = DateTime.fromString('May 25 1982', 'LLLL dd yyyy');
  expect(i.year()).toBe(1982);
  expect(i.month()).toBe(5);
  expect(i.day()).toBe(25);

  i = DateTime.fromString('Sep 25 1982', 'LLL dd yyyy');
  expect(i.year()).toBe(1982);
  expect(i.month()).toBe(9);
  expect(i.day()).toBe(25);

  i = DateTime.fromString('mai 25 1982', 'LLLL dd yyyy', { localeCode: 'fr' });
  expect(i.year()).toBe(1982);
  expect(i.month()).toBe(5);
  expect(i.day()).toBe(25);
});

test('DateTime.fromString() defaults yy to the right century', () => {});

test('DateTime.fromString() parses offsets', () => {});

test('DateTime.fromString() validates weekday names', () => {
  let d = DateTime.fromString('Tuesday, 05/25/1982', 'EEEE, LL/dd/yyyy');
  expect(d.year()).toBe(1982);
  expect(d.month()).toBe(5);
  expect(d.day()).toBe(25);

  d = DateTime.fromString('Monday, 05/25/1982', 'EEEE, LL/dd/yyyy');
  expect(d.isValid()).toBeFalsy();

  d = DateTime.fromString('mardi, 05/25/1982', 'EEEE, LL/dd/yyyy', { localeCode: 'fr' });
  expect(d.year()).toBe(1982);
  expect(d.month()).toBe(5);
  expect(d.day()).toBe(25);
});

test('DateTime.fromString() allows regex content', () => {});

test('DateTime.fromString() allows literals', () => {});

test('DateTime.fromString() returns invalid when unparsed', () => {});

test('DateTime.fromString() returns invalid for out-of-range values', () => {
  const rejects = (s, fmt, opts = {}) =>
    expect(DateTime.fromString(s, fmt, opts).isValid()).toBeFalsy();

  rejects('Tuesday, 05/25/1982', 'EEEE, MM/dd/yyyy', { localeCode: 'fr' });
  rejects('Giberish, 05/25/1982', 'EEEE, MM/dd/yyyy');
  rejects('14/25/1982', 'MM/dd/yyyy');
  rejects('05/46/1982', 'MM/dd/yyyy');
});

test('DateTime.fromString() accepts a zone argument', () => {
  const d = DateTime.fromString('1982/05/25 09:10:11.445', 'yyyy/MM/dd HH:mm:ss.SSS', {
    zone: 'Asia/Tokyo'
  });
  expect(d.offset()).toBe(9 * 60);
  expect(d.year()).toBe(1982);
  expect(d.month()).toBe(5);
  expect(d.day()).toBe(25);
  expect(d.hour()).toBe(9);
  expect(d.minute()).toBe(10);
  expect(d.second()).toBe(11);
  expect(d.millisecond()).toBe(445);
});
