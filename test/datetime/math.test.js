/* global test expect */

import { DateTime, Duration } from '../../src/luxon';

function createDateTime() {
  return DateTime.fromObject({
    year: 2010,
    month: 2,
    day: 3,
    hour: 4,
    minute: 5,
    second: 6,
    millisecond: 7
  });
}

//------
// #plus()
//------
test("DateTime#plus(1, 'year') adds a year", () => {
  const i = createDateTime().plus(1, 'years');
  expect(i.year()).toBe(2011);
});

test("DateTime#plus(1, 'day') keeps the same time across a DST", () => {
  const i = DateTime.fromISO('2016-03-12T10:00', { zone: 'America/Los_Angeles' }),
    later = i.plus(1, 'day');
  expect(later.day()).toBe(13);
  expect(later.hour()).toBe(10);
});

test("DateTime#plus(24, 'hours') gains an hour to spring forward", () => {
  const i = DateTime.fromISO('2016-03-12T10:00', { zone: 'America/Los_Angeles' }),
    later = i.plus(24, 'hours');
  expect(later.day()).toBe(13);
  expect(later.hour()).toBe(11);
});

test('DateTime#plus(Duration) adds the right amount of time', () => {
  const i = DateTime.fromISO('2016-03-12T10:13'),
    later = i.plus(Duration.fromObject({ day: 1, hour: 3, minute: 28 }));
  expect(later.day()).toBe(13);
  expect(later.hour()).toBe(13);
  expect(later.minute()).toBe(41);
});

test('DateTime#plus(object) adds the right amount of time', () => {
  const i = DateTime.fromISO('2016-03-12T10:13'), later = i.plus({ day: 1, hour: 3, minute: 28 });
  expect(later.day()).toBe(13);
  expect(later.hour()).toBe(13);
  expect(later.minute()).toBe(41);
});

//------
// #minus()
//------
test("DateTime#minus(1, 'year') subtracts a year", () => {
  const dt = createDateTime().minus(1, 'year');
  expect(dt.year()).toBe(2009);
});

//------
// #startOf()
//------
test("DateTime#startOf('year') goes to the start of the year", () => {
  const dt = createDateTime().startOf('year');

  expect(dt.year()).toBe(2010);

  expect(dt.month()).toBe(1);
  expect(dt.day()).toBe(1);
  expect(dt.hour()).toBe(0);
  expect(dt.minute()).toBe(0);
  expect(dt.second()).toBe(0);
  expect(dt.millisecond()).toBe(0);
});

test("DateTime#startOf('month') goes to the start of the month", () => {
  const dt = createDateTime().startOf('month');

  expect(dt.year()).toBe(2010);
  expect(dt.month()).toBe(2);

  expect(dt.day()).toBe(1);
  expect(dt.hour()).toBe(0);
  expect(dt.minute()).toBe(0);
  expect(dt.second()).toBe(0);
  expect(dt.millisecond()).toBe(0);
});

test("DateTime#startOf('day') goes to the start of the day", () => {
  const dt = createDateTime().startOf('day');

  expect(dt.year()).toBe(2010);
  expect(dt.month()).toBe(2);
  expect(dt.day()).toBe(3);

  expect(dt.hour()).toBe(0);
  expect(dt.minute()).toBe(0);
  expect(dt.second()).toBe(0);
  expect(dt.millisecond()).toBe(0);
});

test("DateTime#startOf('hour') goes to the start of the hour", () => {
  const dt = createDateTime().startOf('hour');

  expect(dt.year()).toBe(2010);
  expect(dt.month()).toBe(2);
  expect(dt.day()).toBe(3);
  expect(dt.hour()).toBe(4);

  expect(dt.minute()).toBe(0);
  expect(dt.second()).toBe(0);
  expect(dt.millisecond()).toBe(0);
});

test("DateTime#startOf('minute') goes to the start of the minute", () => {
  const dt = createDateTime().startOf('minute');

  expect(dt.year()).toBe(2010);
  expect(dt.month()).toBe(2);
  expect(dt.day()).toBe(3);
  expect(dt.hour()).toBe(4);
  expect(dt.minute()).toBe(5);

  expect(dt.second()).toBe(0);
  expect(dt.millisecond()).toBe(0);
});

test("DateTime#startOf('second') goes to the start of the second", () => {
  const dt = createDateTime().startOf('second');

  expect(dt.year()).toBe(2010);
  expect(dt.month()).toBe(2);
  expect(dt.day()).toBe(3);
  expect(dt.hour()).toBe(4);
  expect(dt.minute()).toBe(5);
  expect(dt.second()).toBe(6);

  expect(dt.millisecond()).toBe(0);
});

//------
// #endOf()
//------
test("DateTime#endOf('year') goes to the start of the year", () => {
  const dt = createDateTime().endOf('year');

  expect(dt.year()).toBe(2010);

  expect(dt.month()).toBe(12);
  expect(dt.day()).toBe(31);
  expect(dt.hour()).toBe(23);
  expect(dt.minute()).toBe(59);
  expect(dt.second()).toBe(59);
  expect(dt.millisecond()).toBe(999);
});

test("DateTime#endOf('month') goes to the start of the month", () => {
  const dt = createDateTime().endOf('month');

  expect(dt.year()).toBe(2010);
  expect(dt.month()).toBe(2);

  expect(dt.day()).toBe(28);
  expect(dt.hour()).toBe(23);
  expect(dt.minute()).toBe(59);
  expect(dt.second()).toBe(59);
  expect(dt.millisecond()).toBe(999);
});

test("DateTime#endOf('day') goes to the start of the day", () => {
  const dt = createDateTime().endOf('day');

  expect(dt.year()).toBe(2010);
  expect(dt.month()).toBe(2);
  expect(dt.day()).toBe(3);

  expect(dt.hour()).toBe(23);
  expect(dt.minute()).toBe(59);
  expect(dt.second()).toBe(59);
  expect(dt.millisecond()).toBe(999);
});

test("DateTime#endOf('hour') goes to the start of the hour", () => {
  const dt = createDateTime().endOf('hour');

  expect(dt.year()).toBe(2010);
  expect(dt.month()).toBe(2);
  expect(dt.day()).toBe(3);
  expect(dt.hour()).toBe(4);

  expect(dt.minute()).toBe(59);
  expect(dt.second()).toBe(59);
  expect(dt.millisecond()).toBe(999);
});

test("DateTime#endOf('minute') goes to the start of the minute", () => {
  const dt = createDateTime().endOf('minute');

  expect(dt.year()).toBe(2010);
  expect(dt.month()).toBe(2);
  expect(dt.day()).toBe(3);
  expect(dt.hour()).toBe(4);
  expect(dt.minute()).toBe(5);

  expect(dt.second()).toBe(59);
  expect(dt.millisecond()).toBe(999);
});

test("DateTime#endOf('second') goes to the start of the second", () => {
  const dt = createDateTime().endOf('second');

  expect(dt.year()).toBe(2010);
  expect(dt.month()).toBe(2);
  expect(dt.day()).toBe(3);
  expect(dt.hour()).toBe(4);
  expect(dt.minute()).toBe(5);
  expect(dt.second()).toBe(6);

  expect(dt.millisecond()).toBe(999);
});
