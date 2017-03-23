/* global test expect */

import { DateTime } from '../../dist/cjs/luxon';
import { FakePT } from '../helpers/fakePT';

//------
// .now()
//-------
test("DateTime.now has today's date", () => {
  const now = DateTime.now();
  expect(now.toJSDate().getDate()).toBe(new Date().getDate());
});

//------
// .fromJSDate()
//-------
test('DateTime.fromJSDate(date) reflects the date', () => {
  const date = new Date(1982, 4, 25), dateTime = DateTime.fromJSDate(date);
  expect(dateTime.toJSDate().valueOf()).toBe(date.valueOf());
});

test('DateTime.fromJSDate(date) clones the date', () => {
  const date = new Date(1982, 4, 25),
    dateTime = DateTime.fromJSDate(date),
    oldValue = dateTime.valueOf();

  date.setDate(14);
  expect(dateTime.toJSDate().valueOf()).toBe(oldValue);

  date.setDate(12);
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

test('DateTime.fromObject() takes a UTC option', () => {
  const dateTime = DateTime.fromObject(baseObject, { utc: true });

  expect(dateTime.isOffsetFixed()).toBe(true);
  expect(dateTime.year()).toBe(1982);
  expect(dateTime.month()).toBe(5);
  expect(dateTime.day()).toBe(25);
  expect(dateTime.hour()).toBe(9);
  expect(dateTime.minute()).toBe(23);
  expect(dateTime.second()).toBe(54);
  expect(dateTime.millisecond()).toBe(123);
});

test('DateTime.fromObject() takes a zone option', () => {
  const daylight = DateTime.fromObject(Object.assign({}, baseObject, { month: 5 }), {
    zone: new FakePT()
  }),
    standard = DateTime.fromObject(Object.assign({}, baseObject, { month: 12 }), {
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

test('DateTime.fromObject() defaults high-order values to the current date', () => {
  const dateTime = DateTime.fromObject({}), now = DateTime.now();

  expect(dateTime.year()).toBe(now.year());
  expect(dateTime.month()).toBe(now.month());
  expect(dateTime.day()).toBe(now.day());
});

test('DateTime.fromObject() defaults lower-order values to 0', () => {
  const dateTime = DateTime.fromObject({});
  expect(dateTime.hour()).toBe(0);
  expect(dateTime.minute()).toBe(0);
  expect(dateTime.second()).toBe(0);
  expect(dateTime.millisecond()).toBe(0);
});
