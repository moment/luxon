/* global test expect */

import { Instant } from '../../dist/cjs/luxon';
import { FakePT } from '../helpers/fakePT';
import { FakeET } from '../helpers/fakeET';

const millis = 391147200000; // 1982-05-25T04:00:00.000Z
const instant = () => Instant.fromMillis(millis);

//------
// defaults
//------

test('timezone defaults to local', () => {
  const inst = instant();
  expect(inst.isOffsetFixed()).toBe(false);
});

//------
// #utc()
//------

test("Instant#utc() puts the instant in UTC 'mode'", () => {
  const zoned = instant().utc();

  expect(zoned.valueOf()).toBe(millis);
  expect(zoned.hour().valueOf()).toBe(4);
  expect(zoned.timezoneName()).toBe('UTC');
  expect(zoned.isOffsetFixed()).toBe(true);
  expect(zoned.isInDST()).toBe(false);
});

//------
// #useUTCOffset()
//------

test("Instant#useUTCOffset() sets instant in UTC+offset 'mode'", () => {
  const zoned = instant().useUTCOffset(5 * 60);

  expect(zoned.valueOf()).toBe(millis);
  expect(zoned.hour().valueOf()).toBe(9);
  expect(zoned.timezoneName()).toBe('UTC+5');
  expect(zoned.isOffsetFixed()).toBe(true);
  expect(zoned.isInDST()).toBe(false);
});

//------
// #local()
//------

test('Instant#local() sets the calendar back to local', () => {
  const relocaled = instant().utc().local();
  const expected = new Date(millis).getHours();

  expect(relocaled.isOffsetFixed()).toBe(false);
  expect(relocaled.valueOf()).toBe(millis);
  expect(relocaled.hour()).toBe(expected);
});

//------
// #rezone()
//------


test('rezone sets the TZ to the specified zone', () => {
  const zoned = instant().rezone(new FakePT());

  expect(zoned.timezoneName()).toBe('Fake Pacific Time');
  expect(zoned.isOffsetFixed()).toBe(false);
  expect(zoned.valueOf()).toBe(millis);
  expect(zoned.hour()).toBe(21); // pacific daylight time
  expect(zoned.isInDST()).toBe(true);
});

test('rezone accepts a keepCalendarTime option', () => {
  const zoned = instant().utc().rezone(new FakePT(), { keepCalendarTime: true });
  expect(zoned.timezoneName()).toBe('Fake Pacific Time');
  expect(zoned.year()).toBe(1982);
  expect(zoned.month()).toBe(5);
  expect(zoned.day()).toBe(25);
  expect(zoned.hour()).toBe(4);
  expect(zoned.isOffsetFixed()).toBe(false);

  const zonedMore = zoned.rezone(new FakeET(), { keepCalendarTime: true });
  expect(zonedMore.timezoneName()).toBe('Fake Eastern Time');
  expect(zonedMore.year()).toBe(1982);
  expect(zonedMore.month()).toBe(5);
  expect(zonedMore.day()).toBe(25);
  expect(zonedMore.hour()).toBe(4);
  expect(zonedMore.isOffsetFixed()).toBe(false);
});

//------
// #isInDST()
//------

test('Instant#isInDST() returns false for pre-DST times', () => {
  const zoned = instant().rezone(new FakePT());
  expect(zoned.month(1).isInDST()).toBe(false);
});

test('Instant#isInDST() returns true for during-DST times', () => {
  const zoned = instant().rezone(new FakePT());
  expect(zoned.month(4).isInDST()).toBe(true);
});

test('Instant#isInDST() returns false for post-DST times', () => {
  const zoned = instant().rezone(new FakePT());
  expect(zoned.month(12).isInDST()).toBe(false);
});

//------
// timezone
//------

test('magic zones are magic', () => {
  // this will only work in Chrome/V8 for now
  const zoned = instant().timezone('Europe/Paris');

  expect(zoned.timezoneName()).toBe('Europe/Paris');
  expect(zoned.offsetNameShort()).toBe('GMT+2'); // not convinced this is universal. Could also be 'CEDT'
  expect(zoned.offsetNameLong()).toBe('Central European Summer Time');
  expect(zoned.valueOf()).toBe(millis);
  expect(zoned.hour()).toBe(6); // cedt is +2
});
