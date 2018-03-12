/* global test expect */

import { Duration } from '../../src/luxon';

//------
// #fromISO()
//------

test('Duration.fromISO can parse a variety of ISO formats', () => {
  const check = (s, ob) => {
    expect(Duration.fromISO(s).toObject()).toEqual(ob);
  };

  check('P5Y3M', { years: 5, months: 3 });
  check('PT54M32S', { minutes: 54, seconds: 32 });
  check('P3DT54M32S', { days: 3, minutes: 54, seconds: 32 });
  check('P1YT34000S', { years: 1, seconds: 34000 });
  check('P2W', { weeks: 2 });
});

test('Duration.fromISO can parse fractions of seconds', () => {

  expect(Duration.fromISO('PT54M32.5S').toObject()).toEqual({ minutes: 54, seconds: 32, milliseconds: 500 });
  expect(Duration.fromISO('PT54M32.53S').toObject()).toEqual({ minutes: 54, seconds: 32, milliseconds: 530 });
  expect(Duration.fromISO('PT54M32.534S').toObject()).toEqual({ minutes: 54, seconds: 32, milliseconds: 534 });
  expect(Duration.fromISO('PT54M32.5348S').toObject()).toEqual({ minutes: 54, seconds: 32, milliseconds: 534 });
  expect(Duration.fromISO('PT54M32.034S').toObject()).toEqual({ minutes: 54, seconds: 32, milliseconds: 34 });
});

test('Duration.fromISO rejects junk', () => {
  const rejects = s => {
    expect(Duration.fromISO(s).isValid).toBe(false);
  };

  rejects('poop');
  rejects('PTglorb');
  rejects('P5Y34S');
  rejects('5Y');
  rejects('P34S');
  rejects('P34K');
  rejects('P5D2W');
});
