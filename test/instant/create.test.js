/* global test expect */

import { Instant } from '../../dist/cjs/luxon';
import { FakePT } from '../helpers/fakePT';

//------
// .now()
//-------
test("Instant.now has today's date", () => {
  const now = Instant.now();
  expect(now.toJSDate().getDate()).toBe(new Date().getDate());
});

//------
// .fromJSDate()
//-------
test('Instant.fromJSDate(date) reflects the date', () => {
  const date = new Date(1982, 4, 25), instant = Instant.fromJSDate(date);
  expect(instant.toJSDate().valueOf()).toBe(date.valueOf());
});

test('Instant.fromJSDate(date) clones the date', () => {
  const date = new Date(1982, 4, 25),
    instant = Instant.fromJSDate(date),
    oldValue = instant.valueOf();

  date.setDate(14);
  expect(instant.toJSDate().valueOf()).toBe(oldValue);

  date.setDate(12);
  expect(instant.toJSDate().valueOf()).toBe(oldValue);
});

//------
// .fromMillis()
//-------
test('Instant.fromMillis(ms) has a value of ms', () => {
  const value = 391147200000, instant = Instant.fromMillis(value);

  expect(instant.valueOf()).toBe(value);
});

//------
// .fromUnix()
//-------
test('Instant.fromUnix(secs) has a value of 1000 * secs', () => {
  const value = 391147200, instant = Instant.fromUnix(value);

  expect(instant.valueOf()).toBe(value * 1000);
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

test('Instant.fromObject() sets all the fields', () => {
  const instant = Instant.fromObject(baseObject);

  expect(instant.isOffsetFixed()).toBe(false);
  expect(instant.year()).toBe(1982);
  expect(instant.month()).toBe(5);
  expect(instant.day()).toBe(25);
  expect(instant.hour()).toBe(9);
  expect(instant.minute()).toBe(23);
  expect(instant.second()).toBe(54);
  expect(instant.millisecond()).toBe(123);
});

test('Instant.fromObject() takes a UTC option', () => {
  const instant = Instant.fromObject(baseObject, { utc: true });

  expect(instant.isOffsetFixed()).toBe(true);
  expect(instant.year()).toBe(1982);
  expect(instant.month()).toBe(5);
  expect(instant.day()).toBe(25);
  expect(instant.hour()).toBe(9);
  expect(instant.minute()).toBe(23);
  expect(instant.second()).toBe(54);
  expect(instant.millisecond()).toBe(123);
});

test('Instant.fromObject() takes a zone option', () => {
  const daylight = Instant.fromObject(Object.assign({}, baseObject, { month: 5 }), {
    zone: new FakePT()
  }),
    standard = Instant.fromObject(Object.assign({}, baseObject, { month: 12 }), {
      zone: new FakePT()
    });

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

test('Instant.fromObject() defaults high-order values to the current date', () => {
  const instant = Instant.fromObject({}), now = Instant.now();

  expect(instant.year()).toBe(now.year());
  expect(instant.month()).toBe(now.month());
  expect(instant.day()).toBe(now.day());
});

test('Instant.fromObject() defaults lower-order values to 0', () => {
  const instant = Instant.fromObject({});
  expect(instant.hour()).toBe(0);
  expect(instant.minute()).toBe(0);
  expect(instant.second()).toBe(0);
  expect(instant.millisecond()).toBe(0);
});
