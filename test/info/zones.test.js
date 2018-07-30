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

test('Info.hasDST returns true for Europe/Andora', () => {
  expect(Info.hasDST('Europe/Andora')).toBe(true);
});

test('Info.hasDST defaults to the global zone', () => {
  Helpers.withDefaultZone('America/Cancun', () => {
    expect(Info.hasDST()).toBe(false);
  });
});

//------
// .hasDST()
//------

test('Info.isValidIANAZone returns true for valid zones', () => {
  expect(Info.isValidIANAZone('America/Cancun')).toBe(true);
});

test('Info.isValidIANAZone returns false for junk', () => {
  expect(Info.isValidIANAZone('blorp')).toBe(false);
});

test('Info.isValidIANAZone returns false for well-specified but invalid zones', () => {
  expect(Info.isValidIANAZone('America/Blork')).toBe(false);
});

test('Info.isValidIANAZone returns true for valid zones like America/Indiana/Indianapolis', () => {
  expect(Info.isValidIANAZone('America/Indiana/Indianapolis')).toBe(true);
});

test('Info.isValidIANAZone returns false for well-specified but invalid zones like America/Indiana/Blork', () => {
  expect(Info.isValidIANAZone('America/Indiana/Blork')).toBe(false);
});
