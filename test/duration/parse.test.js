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
});

test('Duration.fromISO rejects junk', () => {
  // todo : reevaluate whether this is the right fail condition
  // maybe return null instead
  const rejects = s => {
    expect(Duration.fromISO(s).as('milliseconds')).toBe(0);
  };

  rejects('poop');
  rejects('P5Y34S');
  rejects('5Y');
  rejects('P34S');
  rejects('P34K');
});
