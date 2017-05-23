/* global test expect */

import { Info, DateTime } from '../../dist/cjs/luxon';

//------
// diff
//-------
const diffFromObjs = (o1, o2, ...units) =>
  DateTime.fromObject(o1).diff(DateTime.fromObject(o2), ...units);
const diffObjs = (o1, o2, ...units) => diffFromObjs(o1, o2, ...units).toObject();

test('DateTime#diff defaults to milliseconds', () => {
  expect(diffObjs({ year: 2017, millisecond: 12 }, { year: 2017 })).toEqual({ milliseconds: 12 });
  expect(diffFromObjs({ year: 2017 }, { year: 2017 }).milliseconds()).toBe(0);
});

test('DateTime#diff makes simple diffs', () => {
  expect(diffObjs({ year: 2017 }, { year: 2017 }, 'years')).toEqual({});

  expect(diffObjs({ year: 2017 }, { year: 2016 }, 'years')).toEqual({ years: 1 });

  expect(
    diffObjs({ year: 2016, month: 3, day: 28 }, { year: 2016, month: 2, day: 28 }, 'months')
  ).toEqual({ months: 1 });

  expect(
    diffObjs({ year: 2016, month: 3, day: 28 }, { year: 2016, month: 3, day: 25 }, 'days')
  ).toEqual({ days: 3 });

  expect(
    diffObjs({ year: 2016, month: 3, day: 1 }, { year: 2016, month: 2, day: 28 }, 'days')
  ).toEqual({ days: 2 });

  expect(
    diffObjs({ year: 2016, month: 3, day: 29 }, { year: 2016, month: 3, day: 1 }, 'weeks')
  ).toEqual({ weeks: 4 });

  expect(
    diffObjs({ year: 2016, month: 3, day: 3 }, { year: 2016, month: 2, day: 18 }, 'weeks')
  ).toEqual({ weeks: 2 });

  expect(
    diffObjs(
      { year: 2016, month: 3, day: 28, hour: 13 },
      { year: 2016, month: 3, day: 28, hour: 5 },
      'hours'
    )
  ).toEqual({ hours: 8 });

  expect(
    diffObjs(
      { year: 2016, month: 3, day: 28, hour: 13 },
      { year: 2016, month: 3, day: 25, hour: 5 },
      'hours'
    )
  ).toEqual({ hours: 24 * 3 + 8 });
});

test('DateTime#diff accepts multiple units', () => {
  expect(
    diffObjs(
      { year: 2016, month: 3, day: 28, hour: 13, minute: 46 },
      { year: 2016, month: 3, day: 16, hour: 5, second: 18 },
      'days',
      'hours',
      'minutes',
      'seconds'
    )
  ).toEqual({ days: 12, hours: 8, minutes: 45, seconds: 42 });

  expect(
    diffObjs({ year: 2016, month: 3, day: 25 }, { year: 2016, month: 3, day: 1 }, 'weeks', 'days')
  ).toEqual({ weeks: 3, days: 3 });

  expect(
    diffObjs({ year: 2016, month: 3, day: 28 }, { year: 2010, month: 3, day: 16 }, 'years', 'days')
  ).toEqual({ years: 6, days: 12 });

  expect(
    diffObjs({ year: 2016, month: 3, day: 14 }, { year: 2010, month: 3, day: 16 }, 'years', 'days')
  ).toEqual({ years: 5, days: 364 });

  expect(
    diffObjs({ year: 2015, month: 3, day: 14 }, { year: 2009, month: 3, day: 16 }, 'years', 'days')
  ).toEqual({ years: 5, days: 363 });

  expect(
    diffObjs(
      { year: 2015, month: 3, day: 14 },
      { year: 2009, month: 3, day: 16 },
      'years',
      'days',
      'hours'
    )
  ).toEqual({ years: 5, days: 363 });
});

test('DateTime#diff puts fractional parts in the lowest order unit', () => {
  expect(
    diffObjs(
      { year: 2017, month: 5, day: 14 },
      { year: 2016, month: 3, day: 16 },
      'years',
      'months'
    )
  ).toEqual({ years: 1, months: 2 - 2 / 30 });
});

test('DateTime#diff is calendary for years, months, day', () => {
  // respecting the leap year
  expect(
    diffObjs({ year: 2016, month: 3, day: 14 }, { year: 2010, month: 3, day: 14 }, 'years', 'days')
  ).toEqual({ years: 6 });

  expect(
    diffObjs({ year: 2016, month: 3, day: 14 }, { year: 2010, month: 3, day: 16 }, 'years', 'days')
  ).toEqual({ years: 5, days: 364 });

  // ignores the DST, works in calendar days, not bubbled months
  expect(
    diffObjs({ year: 2016, month: 5, day: 14 }, { year: 2016, month: 2, day: 14 }, 'days')
  ).toEqual({ days: 90 });
});

test('DateTime#diff is precise for lower order units', () => {
  const expected = Info.hasDST() ? 2999 : 3000;
  // spring forward skips one hour
  expect(
    diffObjs({ year: 2016, month: 5, day: 5 }, { year: 2016, month: 1, day: 1 }, 'hours')
  ).toEqual({ hours: expected });
});
