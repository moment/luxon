/* global test expect */

import { DateTime } from '../../dist/cjs/luxon';

const dateTime = DateTime.fromJSDate(new Date(1982, 4, 25, 9, 23, 54, 123)),
  utc = DateTime.fromMillis(Date.UTC(1982, 4, 25, 9, 23, 54, 123)).toUTC();

//------
// year/month/day/hour/minute/second/millisecond
//------
test('DateTime#year() returns the year', () => {
  expect(dateTime.year()).toBe(1982);
  expect(utc.year()).toBe(1982);
});

test('DateTime#month() returns the (1-indexed) month', () => {
  expect(dateTime.month()).toBe(5);
  expect(utc.month()).toBe(5);
});

test('DateTime#day() returns the day', () => {
  expect(dateTime.day()).toBe(25);
  expect(utc.day()).toBe(25);
});

test('DateTime#hour() returns the hour', () => {
  expect(dateTime.hour()).toBe(9);
  expect(utc.hour()).toBe(9);
});

test('DateTime#minute() returns the minute', () => {
  expect(dateTime.minute()).toBe(23);
  expect(utc.minute()).toBe(23);
});

test('DateTime#second() returns the second', () => {
  expect(dateTime.second()).toBe(54);
  expect(utc.second()).toBe(54);
});

test('DateTime#millisecond() returns the millisecond', () => {
  expect(dateTime.millisecond()).toBe(123);
  expect(utc.millisecond()).toBe(123);
});

//------
// weekYear/weekNumber/weekday
//------
test('DateTime#weekYear() returns the weekYear', () => {
  expect(dateTime.weekYear()).toBe(1982);
});

test('DateTime#weekNumber() returns the weekNumber', () => {
  expect(dateTime.weekNumber()).toBe(21);
});

test('DateTime#weekday() returns the weekday', () => {
  expect(dateTime.weekday()).toBe(2);
});

//------
// locale
//------
test('DateTime#locale() returns the locale', () => {
  const dt = DateTime.local().locale('be');
  expect(dt.locale()).toBe('be');
});
