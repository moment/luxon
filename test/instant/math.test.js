/* global test expect */

import { Instant } from '../../dist/cjs/luxon';
import { FakePT } from '../helpers/fakePT';

function createInstant() {
  return Instant.fromObject({
    year: 2010,
    month: 2,
    day: 3,
    hour: 4,
    minute: 5,
    second: 6,
    millisecond: 7,
  });
}

//------
// #plus()
//------

test("Instant#plus(1, 'year') adds a year", () => {
  const i = createInstant().plus(1, 'years');
  expect(i.year()).toBe(2011);
});

test("Instant#plus(1, 'day') keeps the same time across a DST", () => {
  const i = Instant.fromISO('2016-03-12T10:00').rezone(new FakePT(), { keepCalendarTime: true });
  const later = i.plus(1, 'day');
  expect(later.day()).toBe(13);
  expect(later.hour()).toBe(10);
});

test("Instant#plus(24, 'hours') gains an hour to spring forward", () => {
  const i = Instant.fromISO('2016-03-12T10:00').rezone(new FakePT(), { keepCalendarTime: true });
  const later = i.plus(24, 'hours');
  expect(later.day()).toBe(13);
  expect(later.hour()).toBe(11);
});

//------
// #minus()
//------

test("Instant#minus(1, 'year') subtracts a year", () => {
  const i = createInstant().minus(1, 'year');
  expect(i.year()).toBe(2009);
});

//------
// #startOf()
//------

test("Instant#startOf('year') goes to the start of the year", () => {
  const i = createInstant().startOf('year');

  expect(i.year()).toBe(2010);

  expect(i.month()).toBe(1);
  expect(i.day()).toBe(1);
  expect(i.hour()).toBe(0);
  expect(i.minute()).toBe(0);
  expect(i.second()).toBe(0);
  expect(i.millisecond()).toBe(0);
});

test("Instant#startOf('month') goes to the start of the month", () => {
  const i = createInstant().startOf('month');

  expect(i.year()).toBe(2010);
  expect(i.month()).toBe(2);

  expect(i.day()).toBe(1);
  expect(i.hour()).toBe(0);
  expect(i.minute()).toBe(0);
  expect(i.second()).toBe(0);
  expect(i.millisecond()).toBe(0);
});

test("Instant#startOf('day') goes to the start of the day", () => {
  const i = createInstant().startOf('day');

  expect(i.year()).toBe(2010);
  expect(i.month()).toBe(2);
  expect(i.day()).toBe(3);

  expect(i.hour()).toBe(0);
  expect(i.minute()).toBe(0);
  expect(i.second()).toBe(0);
  expect(i.millisecond()).toBe(0);
});

test("Instant#startOf('hour') goes to the start of the hour", () => {
  const i = createInstant().startOf('hour');

  expect(i.year()).toBe(2010);
  expect(i.month()).toBe(2);
  expect(i.day()).toBe(3);
  expect(i.hour()).toBe(4);

  expect(i.minute()).toBe(0);
  expect(i.second()).toBe(0);
  expect(i.millisecond()).toBe(0);
});

test("Instant#startOf('minute') goes to the start of the minute", () => {
  const i = createInstant().startOf('minute');

  expect(i.year()).toBe(2010);
  expect(i.month()).toBe(2);
  expect(i.day()).toBe(3);
  expect(i.hour()).toBe(4);
  expect(i.minute()).toBe(5);

  expect(i.second()).toBe(0);
  expect(i.millisecond()).toBe(0);
});

test("Instant#startOf('second') goes to the start of the second", () => {
  const i = createInstant().startOf('second');

  expect(i.year()).toBe(2010);
  expect(i.month()).toBe(2);
  expect(i.day()).toBe(3);
  expect(i.hour()).toBe(4);
  expect(i.minute()).toBe(5);
  expect(i.second()).toBe(6);

  expect(i.millisecond()).toBe(0);
});

//------
// #endOf()
//------

test("Instant#endOf('year') goes to the start of the year", () => {
  const i = createInstant().endOf('year');

  expect(i.year()).toBe(2010);

  expect(i.month()).toBe(12);
  expect(i.day()).toBe(31);
  expect(i.hour()).toBe(23);
  expect(i.minute()).toBe(59);
  expect(i.second()).toBe(59);
  expect(i.millisecond()).toBe(999);
});

test("Instant#endOf('month') goes to the start of the month", () => {
  const i = createInstant().endOf('month');

  expect(i.year()).toBe(2010);
  expect(i.month()).toBe(2);

  expect(i.day()).toBe(28);
  expect(i.hour()).toBe(23);
  expect(i.minute()).toBe(59);
  expect(i.second()).toBe(59);
  expect(i.millisecond()).toBe(999);
});

test("Instant#endOf('day') goes to the start of the day", () => {
  const i = createInstant().endOf('day');

  expect(i.year()).toBe(2010);
  expect(i.month()).toBe(2);
  expect(i.day()).toBe(3);

  expect(i.hour()).toBe(23);
  expect(i.minute()).toBe(59);
  expect(i.second()).toBe(59);
  expect(i.millisecond()).toBe(999);
});

test("Instant#endOf('hour') goes to the start of the hour", () => {
  const i = createInstant().endOf('hour');

  expect(i.year()).toBe(2010);
  expect(i.month()).toBe(2);
  expect(i.day()).toBe(3);
  expect(i.hour()).toBe(4);

  expect(i.minute()).toBe(59);
  expect(i.second()).toBe(59);
  expect(i.millisecond()).toBe(999);
});

test("Instant#endOf('minute') goes to the start of the minute", () => {
  const i = createInstant().endOf('minute');

  expect(i.year()).toBe(2010);
  expect(i.month()).toBe(2);
  expect(i.day()).toBe(3);
  expect(i.hour()).toBe(4);
  expect(i.minute()).toBe(5);

  expect(i.second()).toBe(59);
  expect(i.millisecond()).toBe(999);
});

test("Instant#endOf('second') goes to the start of the second", () => {
  const i = createInstant().endOf('second');

  expect(i.year()).toBe(2010);
  expect(i.month()).toBe(2);
  expect(i.day()).toBe(3);
  expect(i.hour()).toBe(4);
  expect(i.minute()).toBe(5);
  expect(i.second()).toBe(6);

  expect(i.millisecond()).toBe(999);
});
