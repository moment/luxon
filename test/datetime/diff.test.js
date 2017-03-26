/* global test expect */

import { Info, DateTime } from '../../dist/cjs/luxon';

//------
// diff
//-------
const diffFromObjs = (o1, o2, ...units) =>
  DateTime.fromObject(o1).diff(DateTime.fromObject(o2), ...units);
const diffObjs = (o1, o2, ...units) => diffFromObjs(o1, o2, ...units).toObject();

test('DateTime#diff defaults to milliseconds', () => {
  expect(diffObjs({ year: 2017, millisecond: 12 }, { year: 2017 })).toEqual({ millisecond: 12 });
  expect(diffFromObjs({ year: 2017 }, { year: 2017 }).milliseconds()).toBe(0);
});

test('DateTime#diff makes simple diffs', () => {
  expect(diffObjs({ year: 2017 }, { year: 2017 }, 'years')).toEqual({});
  expect(diffObjs({ year: 2017 }, { year: 2016 }, 'years')).toEqual({ year: 1 });
  expect(
    diffObjs({ year: 2016, month: 3, day: 28 }, { year: 2016, month: 2, day: 28 }, 'months')
  ).toEqual({ month: 1 });
  expect(
    diffObjs({ year: 2016, month: 3, day: 28 }, { year: 2016, month: 3, day: 25 }, 'days')
  ).toEqual({ day: 3 });
  expect(
    diffObjs(
      { year: 2016, month: 3, day: 28, hour: 13 },
      { year: 2016, month: 3, day: 28, hour: 5 },
      'hours'
    )
  ).toEqual({ hour: 8 });
  expect(
    diffObjs(
      { year: 2016, month: 3, day: 28, hour: 13 },
      { year: 2016, month: 3, day: 25, hour: 5 },
      'hours'
    )
  ).toEqual({ hour: 24 * 3 + 8 });
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
  ).toEqual({ day: 12, hour: 8, minute: 45, second: 42 });

  expect(
    diffObjs({ year: 2016, month: 3, day: 28 }, { year: 2010, month: 3, day: 16 }, 'years', 'days')
  ).toEqual({ year: 6, day: 12 });

  expect(
    diffObjs({ year: 2016, month: 3, day: 14 }, { year: 2010, month: 3, day: 16 }, 'years', 'days')
  ).toEqual({ year: 5, day: 364 });

  expect(
    diffObjs({ year: 2015, month: 3, day: 14 }, { year: 2009, month: 3, day: 16 }, 'years', 'days')
  ).toEqual({ year: 5, day: 363 });

  expect(
    diffObjs(
      { year: 2015, month: 3, day: 14 },
      { year: 2009, month: 3, day: 16 },
      'years',
      'days',
      'hours'
    )
  ).toEqual({ year: 5, day: 363 });
});

test('DateTime#diff puts fractional parts in the lowest order unit', () => {
  expect(
    diffObjs(
      { year: 2017, month: 5, day: 14 },
      { year: 2016, month: 3, day: 16 },
      'years',
      'months'
    )
  ).toEqual({ year: 1, month: 2 - 2 / 30 });
});

test('DateTime#diff is calendary for years, months, day', () => {
  // respecting the leap year
  expect(
    diffObjs({ year: 2016, month: 3, day: 14 }, { year: 2010, month: 3, day: 14 }, 'years', 'days')
  ).toEqual({ year: 6 });

  expect(
    diffObjs({ year: 2016, month: 3, day: 14 }, { year: 2010, month: 3, day: 16 }, 'years', 'days')
  ).toEqual({ year: 5, day: 364 });

  // ignores the DST, works in calendar days, not bubbled months
  expect(
    diffObjs({ year: 2016, month: 5, day: 14 }, { year: 2016, month: 2, day: 14 }, 'days')
  ).toEqual({ day: 89 });
});

test('DateTime#diff is precise for lower order units', () => {
  const expected = Info.hasDST() ? 2999 : 3000;
  // spring forward skips one hour
  expect(
    diffObjs({ year: 2016, month: 5, day: 5 }, { year: 2016, month: 1, day: 1 }, 'hours')
  ).toEqual({ hour: expected });
});
