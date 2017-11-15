/* global test expect */

import { Info } from '../../src/luxon';
import { Helpers } from '../helpers';

//------
// .hasDST()
//------

test('Info.hasDST returns true for America/New_York', () => {
  expect(Info.hasDST('America/New_York')).toBe(true);
});

test('Info.hasDST returns false for America/Aruba', () => {
  expect(Info.hasDST('America/Aruba')).toBe(false);
});

test('Info.hasDST returns false for America/Cancun', () => {
  expect(Info.hasDST('America/Cancun')).toBe(false);
});

test('Info.hasDST returns true for Africa/Windhoek', () => {
  expect(Info.hasDST('Africa/Windhoek')).toBe(true);
});

test('Info.hasDST defaults to the global zone', () => {
  Helpers.withDefaultZone('America/Cancun', () => {
    expect(Info.hasDST()).toBe(false);
  });
});
