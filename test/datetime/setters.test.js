/* global test expect */

import { DateTime } from '../../src/luxon';

const dt = DateTime.fromJSDate(new Date(1982, 4, 25, 9, 23, 54, 123));

//------
// year/month/day/hour/minute/second/millisecond
//-------
test('DateTime#year() sets the year', () => {
  expect(dt.year(2012).year()).toBe(2012);
});

test('DateTime#month() sets the (1-indexed) month', () => {
  expect(dt.month(2).month()).toBe(2);
  expect(dt.month(2).hour()).toBe(9); // this will cross a DST for many people
});

test('DateTime#day() sets the day', () => {
  expect(dt.day(5).day()).toBe(5);
});

test('DateTime#hour() sets the hour', () => {
  expect(dt.hour(4).hour()).toBe(4);
});

test('DateTime#minute() sets the minute', () => {
  expect(dt.minute(16).minute()).toBe(16);
});

test('DateTime#second() sets the second', () => {
  expect(dt.second(45).second()).toBe(45);
});

test('DateTime#millisecond() sets the millisecond', () => {
  expect(dt.millisecond(86).millisecond()).toBe(86);
});

//------
// weekYear/weekNumber/weekday
//------

test('DateTime#weekYear() sets the date to the same weekNumber/weekday of the target weekYear', () => {
  const modified = dt.weekYear(2017);
  expect(modified.weekday()).toBe(2); // still tuesday
  expect(modified.weekNumber()).toBe(21);
  expect(modified.year()).toBe(2017);
  expect(modified.month()).toBe(5);
  expect(modified.day()).toBe(23); // 2017-W21-2 is the 23
  expect(modified.hour()).toBe(9);
  expect(modified.minute()).toBe(23);
  expect(modified.second()).toBe(54);
  expect(modified.millisecond()).toBe(123);
});

test('DateTime#weekNumber() sets the date to the same weekday of the target weekNumber', () => {
  const modified = dt.weekNumber(2);
  expect(modified.weekday()).toBe(2); // still tuesday
  expect(modified.year()).toBe(1982);
  expect(modified.month()).toBe(1);
  expect(modified.day()).toBe(12);
  expect(modified.hour()).toBe(9);
  expect(modified.minute()).toBe(23);
  expect(modified.second()).toBe(54);
  expect(modified.millisecond()).toBe(123);
});

test("DateTime#weekday() sets the weekday to this week's matching day", () => {
  const modified = dt.weekday(1);
  expect(modified.weekday()).toBe(1);
  expect(modified.year()).toBe(1982);
  expect(modified.month()).toBe(5);
  expect(modified.day()).toBe(24); // monday is the previous day
  expect(modified.hour()).toBe(9);
  expect(modified.minute()).toBe(23);
  expect(modified.second()).toBe(54);
  expect(modified.millisecond()).toBe(123);
});

//------
// year/ordinal
//------
test('DateTime#ordinal() sets the date to the ordinal within the current year', () => {
  const modified = dt.ordinal(200);
  expect(modified.year()).toBe(1982);
  expect(modified.month()).toBe(7);
  expect(modified.day()).toBe(19);
  expect(modified.hour()).toBe(9);
  expect(modified.minute()).toBe(23);
  expect(modified.second()).toBe(54);
  expect(modified.millisecond()).toBe(123);
});

//------
// set multiple things
//------

//------
// set invalid things
//------
