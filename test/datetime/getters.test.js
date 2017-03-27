/* global test expect */

import { DateTime } from '../../dist/cjs/luxon';

const dateTime = DateTime.fromJSDate(new Date(1982, 4, 25, 9, 23, 54, 123)),
  utc = DateTime.fromMillis(Date.UTC(1982, 4, 25, 9, 23, 54, 123)).toUTC();

//------
// year/month/day/hour/minute/second/millisecond
//-------
test('dateTime#year() returns the year', () => {
  expect(dateTime.year()).toBe(1982);
  expect(utc.year()).toBe(1982);
});

test('dateTime#month() returns the (1-indexed) month', () => {
  expect(dateTime.month()).toBe(5);
  expect(utc.month()).toBe(5);
});

test('dateTime#day() returns the day', () => {
  expect(dateTime.day()).toBe(25);
  expect(utc.day()).toBe(25);
});

test('dateTime#hour() returns the hour', () => {
  expect(dateTime.hour()).toBe(9);
  expect(utc.hour()).toBe(9);
});

test('dateTime#minute() returns the minute', () => {
  expect(dateTime.minute()).toBe(23);
  expect(utc.minute()).toBe(23);
});

test('dateTime#second() returns the second', () => {
  expect(dateTime.second()).toBe(54);
  expect(utc.second()).toBe(54);
});

test('dateTime#millisecond() returns the millisecond', () => {
  expect(dateTime.millisecond()).toBe(123);
  expect(utc.millisecond()).toBe(123);
});

//------
// locale
//-------
test('dateTime#locale() returns the locale', () => {
  const dt = DateTime.local().locale('be');
  expect(dt.locale()).toBe('be');
});
