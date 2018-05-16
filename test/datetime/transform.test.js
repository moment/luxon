/* global test expect */

import { DateTime } from '../../src/luxon';

const dtMaker = () =>
    DateTime.fromObject({
      year: 1982,
      month: 5,
      day: 25,
      hour: 9,
      minute: 23,
      second: 54,
      millisecond: 123,
      zone: 'utc'
    }),
  dt = dtMaker();

//------
// #toMillis()
//------
test('DateTime#toMillis() just does valueOf()', () => {
  expect(dt.toMillis()).toBe(dt.valueOf());
});
