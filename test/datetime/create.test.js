/* global test expect */

import { DateTime } from '../../src/luxon';

//------
// .local()
//-------
test("DateTime.local() has today's date", () => {
  const now = DateTime.local();
  expect(now.toJSDate().getDate()).toBe(new Date().getDate());
});

test('DateTime.local(2017) is the beginning of the year', () => {
  const dt = DateTime.local(2017);
  expect(dt.year()).toBe(2017);
  expect(dt.month()).toBe(1);
  expect(dt.day()).toBe(1);
  expect(dt.hour()).toBe(0);
  expect(dt.minute()).toBe(0);
  expect(dt.second()).toBe(0);
  expect(dt.millisecond()).toBe(0);
});

test('DateTime.local(2017, 3) is the beginning of the month', () => {
  const dt = DateTime.local(2017, 3);
  expect(dt.year()).toBe(2017);
  expect(dt.month()).toBe(3);
  expect(dt.day()).toBe(1);
  expect(dt.hour()).toBe(0);
  expect(dt.minute()).toBe(0);
  expect(dt.second()).toBe(0);
  expect(dt.millisecond()).toBe(0);
});

test('DateTime.local(2017, 3, 12) is the beginning of 3/12', () => {
  const dt = DateTime.local(2017, 3, 12);
  expect(dt.year()).toBe(2017);
  expect(dt.month()).toBe(3);
  expect(dt.day()).toBe(12);
  expect(dt.hour()).toBe(0);
  expect(dt.minute()).toBe(0);
  expect(dt.second()).toBe(0);
  expect(dt.millisecond()).toBe(0);
});

test('DateTime.local(2017, 3, 12, 5) is the beginning of the hour', () => {
  const dt = DateTime.local(2017, 3, 12, 5);
  expect(dt.year()).toBe(2017);
  expect(dt.month()).toBe(3);
  expect(dt.day()).toBe(12);
  expect(dt.hour()).toBe(5);
  expect(dt.minute()).toBe(0);
  expect(dt.second()).toBe(0);
  expect(dt.millisecond()).toBe(0);
});

test('DateTime.local(2017, 3, 12, 5, 25) is the beginning of the minute', () => {
  const dt = DateTime.local(2017, 3, 12, 5, 25);
  expect(dt.year()).toBe(2017);
  expect(dt.month()).toBe(3);
  expect(dt.day()).toBe(12);
  expect(dt.hour()).toBe(5);
  expect(dt.minute()).toBe(25);
  expect(dt.second()).toBe(0);
  expect(dt.millisecond()).toBe(0);
});

test('DateTime.local(2017, 3, 12, 5, 25, 16) is the beginning of the second', () => {
  const dt = DateTime.local(2017, 3, 12, 5, 25, 16);
  expect(dt.year()).toBe(2017);
  expect(dt.month()).toBe(3);
  expect(dt.day()).toBe(12);
  expect(dt.hour()).toBe(5);
  expect(dt.minute()).toBe(25);
  expect(dt.second()).toBe(16);
  expect(dt.millisecond()).toBe(0);
});

test('DateTime.local(2017, 3, 12, 5, 25, 16, 255) is right down to the millisecond', () => {
  const dt = DateTime.local(2017, 3, 12, 5, 25, 16, 255);
  expect(dt.year()).toBe(2017);
  expect(dt.month()).toBe(3);
  expect(dt.day()).toBe(12);
  expect(dt.hour()).toBe(5);
  expect(dt.minute()).toBe(25);
  expect(dt.second()).toBe(16);
  expect(dt.millisecond()).toBe(255);
});

//------
// .utc()
//-------
test('DateTime.utc() is in utc', () => {
  const now = DateTime.utc();
  expect(now.offset()).toBe(0);
});

test('DateTime.utc(2017) is the beginning of the year', () => {
  const dt = DateTime.utc(2017);
  expect(dt.year()).toBe(2017);
  expect(dt.month()).toBe(1);
  expect(dt.day()).toBe(1);
  expect(dt.hour()).toBe(0);
  expect(dt.minute()).toBe(0);
  expect(dt.second()).toBe(0);
  expect(dt.millisecond()).toBe(0);
});

test('DateTime.utc(2017, 3) is the beginning of the month', () => {
  const dt = DateTime.utc(2017, 3);
  expect(dt.year()).toBe(2017);
  expect(dt.month()).toBe(3);
  expect(dt.day()).toBe(1);
  expect(dt.hour()).toBe(0);
  expect(dt.minute()).toBe(0);
  expect(dt.second()).toBe(0);
  expect(dt.millisecond()).toBe(0);
});

test('DateTime.utc(2017, 3, 12) is the beginning of 3/12', () => {
  const dt = DateTime.utc(2017, 3, 12);
  expect(dt.year()).toBe(2017);
  expect(dt.month()).toBe(3);
  expect(dt.day()).toBe(12);
  expect(dt.hour()).toBe(0);
  expect(dt.minute()).toBe(0);
  expect(dt.second()).toBe(0);
  expect(dt.millisecond()).toBe(0);
});

test('DateTime.utc(2017, 3, 12, 5) is the beginning of the hour', () => {
  const dt = DateTime.utc(2017, 3, 12, 5);
  expect(dt.year()).toBe(2017);
  expect(dt.month()).toBe(3);
  expect(dt.day()).toBe(12);
  expect(dt.hour()).toBe(5);
  expect(dt.minute()).toBe(0);
  expect(dt.second()).toBe(0);
  expect(dt.millisecond()).toBe(0);
});

test('DateTime.utc(2017, 3, 12, 5, 25) is the beginning of the minute', () => {
  const dt = DateTime.utc(2017, 3, 12, 5, 25);
  expect(dt.year()).toBe(2017);
  expect(dt.month()).toBe(3);
  expect(dt.day()).toBe(12);
  expect(dt.hour()).toBe(5);
  expect(dt.minute()).toBe(25);
  expect(dt.second()).toBe(0);
  expect(dt.millisecond()).toBe(0);
});

test('DateTime.utc(2017, 3, 12, 5, 25, 16) is the beginning of the second', () => {
  const dt = DateTime.utc(2017, 3, 12, 5, 25, 16);
  expect(dt.year()).toBe(2017);
  expect(dt.month()).toBe(3);
  expect(dt.day()).toBe(12);
  expect(dt.hour()).toBe(5);
  expect(dt.minute()).toBe(25);
  expect(dt.second()).toBe(16);
  expect(dt.millisecond()).toBe(0);
});

test('DateTime.utc(2017, 3, 12, 5, 25, 16, 255) is right down to the millisecond', () => {
  const dt = DateTime.utc(2017, 3, 12, 5, 25, 16, 255);
  expect(dt.year()).toBe(2017);
  expect(dt.month()).toBe(3);
  expect(dt.day()).toBe(12);
  expect(dt.hour()).toBe(5);
  expect(dt.minute()).toBe(25);
  expect(dt.second()).toBe(16);
  expect(dt.millisecond()).toBe(255);
});

//------
// .fromJSDate()
//-------
test('DateTime.fromJSDate(date) clones the date', () => {
  const date = new Date(1982, 4, 25),
    dateTime = DateTime.fromJSDate(date),
    oldValue = dateTime.valueOf();

  date.setDate(14);
  expect(dateTime.toJSDate().valueOf()).toBe(oldValue);
});

//------
// .fromMillis()
//-------
test('DateTime.fromMillis(ms) has a value of ms', () => {
  const value = 391147200000, dateTime = DateTime.fromMillis(value);

  expect(dateTime.valueOf()).toBe(value);
});

//------
// .fromObject()
//-------
const baseObject = {
  year: 1982,
  month: 5,
  day: 25,
  hour: 9,
  minute: 23,
  second: 54,
  millisecond: 123
};

test('DateTime.fromObject() sets all the fields', () => {
  const dateTime = DateTime.fromObject(baseObject);

  expect(dateTime.isOffsetFixed()).toBe(false);
  expect(dateTime.year()).toBe(1982);
  expect(dateTime.month()).toBe(5);
  expect(dateTime.day()).toBe(25);
  expect(dateTime.hour()).toBe(9);
  expect(dateTime.minute()).toBe(23);
  expect(dateTime.second()).toBe(54);
  expect(dateTime.millisecond()).toBe(123);
});

test('DateTime.fromObject() accepts "utc" as the second argument', () => {
  const dateTime = DateTime.fromObject(baseObject, 'utc');

  expect(dateTime.isOffsetFixed()).toBe(true);
  expect(dateTime.year()).toBe(1982);
  expect(dateTime.month()).toBe(5);
  expect(dateTime.day()).toBe(25);
  expect(dateTime.hour()).toBe(9);
  expect(dateTime.minute()).toBe(23);
  expect(dateTime.second()).toBe(54);
  expect(dateTime.millisecond()).toBe(123);
});

test('DateTime.fromObject() accepts "utc-8" as the second argument', () => {
  const dateTime = DateTime.fromObject(baseObject, 'utc-8');

  expect(dateTime.isOffsetFixed()).toBe(true);
  expect(dateTime.offset()).toBe(-8 * 60);
  expect(dateTime.year()).toBe(1982);
  expect(dateTime.month()).toBe(5);
  expect(dateTime.day()).toBe(25);
  expect(dateTime.hour()).toBe(9);
  expect(dateTime.minute()).toBe(23);
  expect(dateTime.second()).toBe(54);
  expect(dateTime.millisecond()).toBe(123);
});

test('DateTime.fromObject() accepts "America/Los_Angeles" as the second argument', () => {
  const dateTime = DateTime.fromObject(baseObject, 'America/Los_Angeles');

  expect(dateTime.isOffsetFixed()).toBe(false);
  expect(dateTime.offset()).toBe(-7 * 60);
  expect(dateTime.year()).toBe(1982);
  expect(dateTime.month()).toBe(5);
  expect(dateTime.day()).toBe(25);
  expect(dateTime.hour()).toBe(9);
  expect(dateTime.minute()).toBe(23);
  expect(dateTime.second()).toBe(54);
  expect(dateTime.millisecond()).toBe(123);
});

test('DateTime.fromObject() accepts a Zone as the second argument', () => {
  const daylight = DateTime.fromObject(
    Object.assign({}, baseObject, { month: 5 }),
    'America/Los_Angeles'
  ),
    standard = DateTime.fromObject(
      Object.assign({}, baseObject, { month: 12 }),
      'America/Los_Angeles'
    );

  expect(daylight.isOffsetFixed()).toBe(false);
  expect(daylight.offset()).toBe(-7 * 60);
  expect(daylight.year()).toBe(1982);
  expect(daylight.month()).toBe(5);
  expect(daylight.day()).toBe(25);
  expect(daylight.hour()).toBe(9);
  expect(daylight.minute()).toBe(23);
  expect(daylight.second()).toBe(54);
  expect(daylight.millisecond()).toBe(123);

  expect(standard.isOffsetFixed()).toBe(false);
  expect(standard.offset()).toBe(-8 * 60);
  expect(standard.year()).toBe(1982);
  expect(standard.month()).toBe(12);
  expect(standard.day()).toBe(25);
  expect(standard.hour()).toBe(9);
  expect(standard.minute()).toBe(23);
  expect(standard.second()).toBe(54);
  expect(standard.millisecond()).toBe(123);
});

test('DateTime.fromObject() defaults high-order values to the current date', () => {
  const dateTime = DateTime.fromObject({}), now = DateTime.local();

  expect(dateTime.year()).toBe(now.year());
  expect(dateTime.month()).toBe(now.month());
  expect(dateTime.day()).toBe(now.day());
});

test('DateTime.fromObject() defaults lower-order values to their minimums if a high-order value is set', () => {
  const dateTime = DateTime.fromObject({ year: 2017 });
  expect(dateTime.year()).toBe(2017);
  expect(dateTime.month()).toBe(1);
  expect(dateTime.day()).toBe(1);
  expect(dateTime.hour()).toBe(0);
  expect(dateTime.minute()).toBe(0);
  expect(dateTime.second()).toBe(0);
  expect(dateTime.millisecond()).toBe(0);
});

test('DateTime.fromObject() w/weeks handles fully specified dates', () => {
  const dt = DateTime.fromObject({
    weekYear: 2016,
    weekNumber: 2,
    weekday: 3,
    hour: 9,
    minute: 23,
    second: 54,
    millisecond: 123
  });
  expect(dt.weekYear()).toBe(2016);
  expect(dt.weekNumber()).toBe(2);
  expect(dt.weekday()).toBe(3);
  expect(dt.year()).toBe(2016);
  expect(dt.month()).toBe(1);
  expect(dt.day()).toBe(13);
});

test('DateTime.fromObject() w/weekYears handles skew with Gregorian years', () => {
  let dt = DateTime.fromObject({ weekYear: 2015, weekNumber: 1, weekday: 3 });
  expect(dt.weekYear()).toBe(2015);
  expect(dt.weekNumber()).toBe(1);
  expect(dt.weekday()).toBe(3);
  expect(dt.year()).toBe(2014);
  expect(dt.month()).toBe(12);
  expect(dt.day()).toBe(31);

  dt = DateTime.fromObject({ weekYear: 2009, weekNumber: 53, weekday: 5 });
  expect(dt.weekYear()).toBe(2009);
  expect(dt.weekNumber()).toBe(53);
  expect(dt.weekday()).toBe(5);
  expect(dt.year()).toBe(2010);
  expect(dt.month()).toBe(1);
  expect(dt.day()).toBe(1);
});

test('DateTime.fromObject() w/weeks defaults high-order values to the current date', () => {
  const dt = DateTime.fromObject({ weekday: 2 }), now = DateTime.local();

  expect(dt.weekYear()).toBe(now.weekYear());
  expect(dt.weekNumber()).toBe(now.weekNumber());
  expect(dt.weekday()).toBe(2);
});

test('DateTime.fromObject() w/weeks defaults low-order values to their minimums', () => {
  const dt = DateTime.fromObject({ weekYear: 2016 });

  expect(dt.weekYear()).toBe(2016);
  expect(dt.weekNumber()).toBe(1);
  expect(dt.weekday()).toBe(1);
  expect(dt.hour()).toBe(0);
  expect(dt.minute()).toBe(0);
  expect(dt.second()).toBe(0);
  expect(dt.millisecond()).toBe(0);
});

test('DateTime.fromObject() w/ordinals handles fully specified dates', () => {
  const dt = DateTime.fromObject({
    year: 2016,
    ordinal: 200,
    hour: 9,
    minute: 23,
    second: 54,
    millisecond: 123
  });
  expect(dt.year()).toBe(2016);
  expect(dt.ordinal()).toBe(200);
  expect(dt.month()).toBe(7);
  expect(dt.day()).toBe(18);
});

test('DateTime.fromObject() w/ordinal defaults to the current year', () => {
  const dt = DateTime.fromObject({ ordinal: 200 }), now = DateTime.local();
  expect(dt.year()).toBe(now.year());
  expect(dt.ordinal()).toBe(200);
});

test('DateTime.fromObject() returns invalid for invalid values', () => {
  expect(DateTime.fromObject({ weekYear: 2017, weekNumber: 54 }).isValid()).toBe(false);
  expect(DateTime.fromObject({ weekYear: 2017, weekNumber: 15, weekday: 0 }).isValid()).toBe(false);
});
