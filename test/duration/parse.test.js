/* global test expect */

import { Duration } from '../../dist/cjs/luxon';

//------
// #fromISO()
//------

test('Duration.fromISO can parse a variety of ISO formats', () => {
  const check = (s, ob) => {
    expect(Duration.fromISO(s).toObject()).toEqual(ob);
  };

  check('P5Y3M', { year: 5, month: 3 });
  check('PT54M32S', { minute: 54, second: 32 });
  check('P3DT54M32S', { day: 3, minute: 54, second: 32 });
  check('P1YT34000S', { year: 1, second: 34000 });
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
