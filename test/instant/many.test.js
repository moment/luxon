/* global test expect */

import { Instant } from '../../dist/cjs/luxon';

//------
// min
//-------

test('instant#min returns the only instant if solo', () => {
  const m = Instant.min(Instant.fromJSDate(new Date(1982, 5, 25)));
  expect(m).toBeTruthy();
  expect(m.valueOf()).toBe(Instant.fromJSDate(new Date(1982, 5, 25)).valueOf());
});

test('instant#min returns the min instant', () => {
  const m = Instant.min(
    Instant.fromJSDate(new Date(1982, 5, 25)),
    Instant.fromJSDate(new Date(1982, 3, 25)),
    Instant.fromJSDate(new Date(1982, 3, 26)),
  );
  expect(m.valueOf()).toBe(Instant.fromJSDate(new Date(1982, 3, 25)).valueOf());
});

test('instant#min is stable', () => {
  const m = Instant.min(
    Instant.fromJSDate(new Date(1982, 5, 25)),
    Instant.fromJSDate(new Date(1982, 3, 25)).locale('en-uk'),
    Instant.fromJSDate(new Date(1982, 3, 25)).locale('en-us'));
  expect(m.locale()).toBe('en-uk');
});

//------
// max
//-------

test('instant#max returns the only instant if solo', () => {
  const m = Instant.max(Instant.fromJSDate(new Date(1982, 5, 25)));
  expect(m).toBeTruthy();
  expect(m.valueOf()).toBe(Instant.fromJSDate(new Date(1982, 5, 25)).valueOf());
});

test('instant#max returns the max instant', () => {
  const m = Instant.max(
    Instant.fromJSDate(new Date(1982, 5, 25)),
    Instant.fromJSDate(new Date(1982, 3, 25)),
    Instant.fromJSDate(new Date(1982, 3, 26)),
  );
  expect(m.valueOf()).toBe(Instant.fromJSDate(new Date(1982, 5, 25)).valueOf());
});

test('instant#max is stable', () => {
  const m = Instant.max(
    Instant.fromJSDate(new Date(1982, 2, 25)),
    Instant.fromJSDate(new Date(1982, 3, 25)).locale('en-uk'),
    Instant.fromJSDate(new Date(1982, 3, 25)).locale('en-us'),
  );
  expect(m.locale()).toBe('en-uk');
});
