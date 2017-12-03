/* global test expect */
import { Duration } from '../../src/luxon';

//------
// #shiftTo()
//-------
test('Duration#shiftTo rolls milliseconds up hours and minutes', () => {
  const dur = Duration.fromMillis(5760000);
  expect(dur.shiftTo('hours').hours).toBe(1.6);

  const mod = dur.shiftTo('hours', 'minutes');
  expect(mod.hours).toBe(1);
  expect(mod.minutes).toBe(36);
  expect(mod.seconds).toBe(0);
});

test('Duration#shiftTo boils hours down milliseconds', () => {
  const dur = Duration.fromObject({ hours: 1 }).shiftTo('milliseconds');
  expect(dur.milliseconds).toBe(3600000);
});

test('Duration boils hours down shiftTo minutes and milliseconds', () => {
  const dur = Duration.fromObject({ hours: 1, seconds: 30 }).shiftTo('minutes', 'milliseconds');
  expect(dur.minutes).toBe(60);
  expect(dur.milliseconds).toBe(30000);
});

test('Duration#shiftTo boils down and then rolls up', () => {
  const dur = Duration.fromObject({ years: 2, hours: 5000 }).shiftTo('months', 'days', 'minutes');

  expect(dur.months).toBe(30);
  expect(dur.days).toBe(28);
  expect(dur.minutes).toBe(8 * 60);
});

test('Duration#shiftTo throws on invalid units', () => {
  expect(() => {
    Duration.fromObject({ years: 2, hours: 5000 }).shiftTo('months', 'glorp');
  }).toThrow();
});

test('Duration#shiftTo tacks decimals onto the end', () => {
  const dur = Duration.fromObject({ minutes: 73 }).shiftTo('hours');
  expect(dur.isValid).toBe(true);
  expect(dur.hours).toBeCloseTo(1.2167, 4);
});

test('Duration#shiftTo deconstructs decimal inputs', () => {
  const dur = Duration.fromObject({ hours: 2.3 }).shiftTo('hours', 'minutes');
  expect(dur.isValid).toBe(true);
  expect(dur.hours).toBe(2);
  expect(dur.minutes).toBeCloseTo(18, 8);
});

test('Duration#shiftTo maintains invalidity', () => {
  const dur = Duration.invalid('because').shiftTo('years');
  expect(dur.isValid).toBe(false);
  expect(dur.invalidReason).toBe('because');
});

test('Duration#shiftTo without any units no-ops', () => {
  const dur = Duration.fromObject({ years: 3 }).shiftTo();
  expect(dur.isValid).toBe(true);
  expect(dur.toObject()).toEqual({ years: 3 });
});

//------
// #normalize()
//-------
test('Duration#normalize rebalances negative units', () => {
  const dur = Duration.fromObject({ years: 2, days: -2 }).normalize();
  expect(dur.years).toBe(1);
  expect(dur.days).toBe(363);
});

test('Duration#normalize de-overflows', () => {
  const dur = Duration.fromObject({ years: 2, days: 5000 }).normalize();
  expect(dur.years).toBe(15);
  expect(dur.days).toBe(255);
});

test('Duration#normalize handles fully negative durations', () => {
  const dur = Duration.fromObject({ years: -2, days: -5000 }).normalize();
  expect(dur.years).toBe(-15);
  expect(dur.days).toBe(-255);
});

test('Duration#normalize maintains invalidity', () => {
  const dur = Duration.invalid('because').normalize();
  expect(dur.isValid).toBe(false);
  expect(dur.invalidReason).toBe('because');
});

//------
// #as()
//-------

test('Duration#as shifts to one unit and returns it', () => {
  const dur = Duration.fromMillis(5760000);
  expect(dur.as('hours')).toBe(1.6);
});

test('Duration#as returns null for invalid durations', () => {
  expect(Duration.invalid('because').as('hours')).toBeFalsy();
});
