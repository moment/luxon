/* global test expect */

import { DateTime } from '../../dist/cjs/luxon';

const dt = () => DateTime.fromJSDate(new Date(1982, 4, 25, 9, 23, 54, 123));

//------
// year/month/day/hour/minute/second/millisecond
//-------
test('DateTime#year() sets the year', () => {
  expect(dt().year(2012).year()).toBe(2012);
});

test('DateTime#month() sets the (1-indexed) month', () => {
  expect(dt().month(2).month()).toBe(2);
  expect(dt().month(2).hour()).toBe(9); // this will cross a DST for many people
});

test('DateTime#day() sets the day', () => {
  expect(dt().day(5).day()).toBe(5);
});

test('DateTime#hour() sets the hour', () => {
  expect(dt().hour(4).hour()).toBe(4);
});

test('DateTime#minute() sets the minute', () => {
  expect(dt().minute(16).minute()).toBe(16);
});

test('DateTime#second() sets the second', () => {
  expect(dt().second(45).second()).toBe(45);
});

test('DateTime#millisecond() sets the millisecond', () => {
  expect(dt().millisecond(86).millisecond()).toBe(86);
});
