/* global test expect */

import { Duration } from '../../src/luxon';

const accurately = (amt, from, to) =>
  Duration.fromObject({ [from]: amt, longTermAccurate: true }).as(to);

const casually = (amt, from, to) => Duration.fromObject({ [from]: amt }).as(to);

test('There are slightly more than 365 days in a year', () => {
  expect(casually(1, 'years', 'days')).toBeCloseTo(365, 4);
  expect(accurately(1, 'years', 'days')).toBeCloseTo(365.2425, 4);

  expect(casually(365, 'days', 'years')).toBeCloseTo(1, 4);
  expect(accurately(365.2425, 'days', 'years')).toBeCloseTo(1, 4);
});

test('There are slightly more than 30 days in a month', () => {
  expect(casually(1, 'month', 'days')).toBeCloseTo(30, 4);
  expect(accurately(1, 'month', 'days')).toBeCloseTo(30.4369, 4);
});
