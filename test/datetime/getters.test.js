/* global test expect */

import { DateTime } from '../../src/luxon';

const dateTime = DateTime.fromJSDate(new Date(1982, 4, 25, 9, 23, 54, 123)),
  utc = DateTime.fromMillis(Date.UTC(1982, 4, 25, 9, 23, 54, 123)).toUTC(),
  inv = DateTime.invalid();

//------
// year/month/day/hour/minute/second/millisecond
//------
test('DateTime#year returns the year', () => {
  expect(dateTime.year).toBe(1982);
  expect(utc.year).toBe(1982);
  expect(inv.year).toBeFalsy();
});

test('DateTime#month returns the (1-indexed) month', () => {
  expect(dateTime.month).toBe(5);
  expect(utc.month).toBe(5);
  expect(inv.month).toBeFalsy();
});

test('DateTime#day returns the day', () => {
  expect(dateTime.day).toBe(25);
  expect(utc.day).toBe(25);
  expect(inv.day).toBeFalsy();
});

test('DateTime#hour returns the hour', () => {
  expect(dateTime.hour).toBe(9);
  expect(utc.hour).toBe(9);
  expect(inv.hour).toBeFalsy();
});

test('DateTime#minute returns the minute', () => {
  expect(dateTime.minute).toBe(23);
  expect(utc.minute).toBe(23);
  expect(inv.minute).toBeFalsy();
});

test('DateTime#second returns the second', () => {
  expect(dateTime.second).toBe(54);
  expect(utc.second).toBe(54);
  expect(inv.second).toBeFalsy();
});

test('DateTime#millisecond returns the millisecond', () => {
  expect(dateTime.millisecond).toBe(123);
  expect(utc.millisecond).toBe(123);
  expect(inv.millisecond).toBeFalsy();
});

//------
// weekYear/weekNumber/weekday
//------
test('DateTime#weekYear returns the weekYear', () => {
  expect(dateTime.weekYear).toBe(1982);
});

test('DateTime#weekNumber returns the weekNumber', () => {
  expect(dateTime.weekNumber).toBe(21);
});

test('DateTime#weekday returns the weekday', () => {
  expect(dateTime.weekday).toBe(2);
});

//------
// year/ordinal
//------

test('DateTime#ordinal returns the ordinal', () => {
  expect(dateTime.ordinal).toBe(145);
});

//------
// locale
//------
test('DateTime#locale returns the locale', () => {
  const dt = DateTime.local().set({ locale: 'be' });
  expect(dt.locale).toBe('be');
});
