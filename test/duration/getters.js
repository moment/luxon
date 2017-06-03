/* global test expect */

import { Duration } from '../../src/luxon';

const dur = Duration.fromObject({
  years: 1,
  months: 2,
  days: 3,
  hours: 4,
  minutes: 5,
  seconds: 6,
  milliseconds: 7
}),
  inv = Duration.invalid();

//------
// years/months/days/hours/minutes/seconds/milliseconds
//------

test('Duration#years() returns the years', () => {
  expect(dur.year()).toBe(1);
  expect(inv.year()).toBeFalsy();
});

test('Duration#months() returns the (1-indexed) months', () => {
  expect(dur.months()).toBe(2);
  expect(inv.months()).toBeFalsy();
});

test('Duration#days() returns the days', () => {
  expect(dur.days()).toBe(3);
  expect(inv.days()).toBeFalsy();
});

test('Duration#hours() returns the hours', () => {
  expect(dur.hours()).toBe(4);
  expect(inv.hours()).toBeFalsy();
});

test('Duration#minutes() returns the minutes', () => {
  expect(dur.minutes()).toBe(5);
  expect(inv.minutes()).toBeFalsy();
});

test('Duration#seconds() returns the seconds', () => {
  expect(dur.seconds()).toBe(6);
  expect(inv.seconds()).toBeFalsy();
});

test('Duration#milliseconds() returns the milliseconds', () => {
  expect(dur.milliseconds()).toBe(7);
  expect(inv.milliseconds()).toBeFalsy();
});
