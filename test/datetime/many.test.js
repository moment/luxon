/* global test expect */

import { DateTime } from '../../src/luxon';

//------
// min
//-------
test('DateTime.min returns the only dateTime if solo', () => {
  const m = DateTime.min(DateTime.fromJSDate(new Date(1982, 5, 25)));
  expect(m).toBeTruthy();
  expect(m.valueOf()).toBe(DateTime.fromJSDate(new Date(1982, 5, 25)).valueOf());
});

test('DateTime.min returns the min dateTime', () => {
  const m = DateTime.min(
    DateTime.fromJSDate(new Date(1982, 5, 25)),
    DateTime.fromJSDate(new Date(1982, 3, 25)),
    DateTime.fromJSDate(new Date(1982, 3, 26))
  );
  expect(m.valueOf()).toBe(DateTime.fromJSDate(new Date(1982, 3, 25)).valueOf());
});

test('DateTime.min is stable', () => {
  const m = DateTime.min(
    DateTime.fromJSDate(new Date(1982, 5, 25)),
    DateTime.fromJSDate(new Date(1982, 3, 25)).locale('en-uk'),
    DateTime.fromJSDate(new Date(1982, 3, 25)).locale('en-us')
  );
  expect(m.locale()).toBe('en-uk');
});

//------
// max
//-------
test('DateTime.max returns the only dateTime if solo', () => {
  const m = DateTime.max(DateTime.fromJSDate(new Date(1982, 5, 25)));
  expect(m).toBeTruthy();
  expect(m.valueOf()).toBe(DateTime.fromJSDate(new Date(1982, 5, 25)).valueOf());
});

test('DateTime.max returns the max dateTime', () => {
  const m = DateTime.max(
    DateTime.fromJSDate(new Date(1982, 5, 25)),
    DateTime.fromJSDate(new Date(1982, 3, 25)),
    DateTime.fromJSDate(new Date(1982, 3, 26))
  );
  expect(m.valueOf()).toBe(DateTime.fromJSDate(new Date(1982, 5, 25)).valueOf());
});

test('DateTime.max is stable', () => {
  const m = DateTime.max(
    DateTime.fromJSDate(new Date(1982, 2, 25)),
    DateTime.fromJSDate(new Date(1982, 3, 25)).locale('en-uk'),
    DateTime.fromJSDate(new Date(1982, 3, 25)).locale('en-us')
  );
  expect(m.locale()).toBe('en-uk');
});
