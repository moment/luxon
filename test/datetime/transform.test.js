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

//------
// #toJSDate()
//------
test('DateTime#toJSDate() returns a native Date equivalent', () => {
  const js = dt.toJSDate();
  expect(js).toBeInstanceOf(Date);
  expect(js.getTime()).toBe(dt.toMillis());
});

//------
// #toBSON()
//------
test('DateTime#toBSON() return a BSON serializable equivalent', () => {
  const js = dt.toJSDate();
  expect(js).toBeInstanceOf(Date);
  expect(js.getTime()).toBe(dt.toMillis());
});
