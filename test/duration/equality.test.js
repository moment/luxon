/* global test expect */
import { Duration } from '../../src/luxon';

test('equals self', () => {
  const l = Duration.fromObject({ years: 5, days: 6 });
  expect(l.equals(l)).toBe(true);
});

test('equals identically constructed', () => {
  const l1 = Duration.fromObject({ years: 5, days: 6 }),
    l2 = Duration.fromObject({ years: 5, days: 6 });
  expect(l1.equals(l2)).toBe(true);
});

test('does not equal an invalid duration', () => {
  const l1 = Duration.fromObject({ years: 5, days: 6 }),
    l2 = Duration.invalid('because');
  expect(l1.equals(l2)).toBe(false);
});

test('does not equal a different locale', () => {
  const l1 = Duration.fromObject({ years: 5, days: 6 }),
    l2 = Duration.fromObject({ years: 5, days: 6 }).reconfigure({ locale: 'fr' });
  expect(l1.equals(l2)).toBe(false);
});

test('does not equal a different numbering system', () => {
  const l1 = Duration.fromObject({ years: 5, days: 6 }),
    l2 = Duration.fromObject({ years: 5, days: 6 }).reconfigure({ numberingSystem: 'beng' });
  expect(l1.equals(l2)).toBe(false);
});

test('does not equal a different set of units', () => {
  const l1 = Duration.fromObject({ years: 5, days: 6 }),
    l2 = Duration.fromObject({ years: 5, months: 6 });
  expect(l1.equals(l2)).toBe(false);
});

test('does not equal a subset of units', () => {
  const l1 = Duration.fromObject({ years: 5, days: 6 }),
    l2 = Duration.fromObject({ years: 5 });
  expect(l1.equals(l2)).toBe(false);
});

test('does not equal a superset of units', () => {
  const l1 = Duration.fromObject({ years: 5 }),
    l2 = Duration.fromObject({ years: 5, days: 6 });
  expect(l1.equals(l2)).toBe(false);
});

test('does not equal a different unit values', () => {
  const l1 = Duration.fromObject({ years: 5, days: 6 }),
    l2 = Duration.fromObject({ years: 5, days: 7 });
  expect(l1.equals(l2)).toBe(false);
});
