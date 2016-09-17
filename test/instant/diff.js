import test from 'tape';
import {Instant, Info} from 'luxon';

export let diff = () => {

  //------
  // diff
  //-------

  let diffFromObjs = (o1, o2, ...units) => Instant.fromObject(o1).diff(Instant.fromObject(o2), ...units),
      diffObjs = (o1, o2, ...units) => diffFromObjs(o1, o2, ...units).toObject();

  test('Instant#diff defaults to milliseconds', t => {
    t.deepEqual(diffObjs({year: 2017, millisecond: 12}, {year: 2017}), {milliseconds: 12});
    t.is(diffFromObjs({year: 2017}, {year: 2017}).milliseconds(), 0);
    t.end();
  });

  test('Instant#diff makes simple diffs', t => {
    t.deepEqual(diffObjs({year: 2017}, {year: 2017}, 'years'), {});
    t.deepEqual(diffObjs({year: 2017}, {year: 2016}, 'years'), {years: 1});
    t.deepEqual(diffObjs({year: 2016, month: 3, day: 28}, {year: 2016, month: 2, day: 28}, 'months'), {months: 1});
    t.deepEqual(diffObjs({year: 2016, month: 3, day: 28}, {year: 2016, month: 3, day: 25}, 'days'), {days: 3});
    t.deepEqual(diffObjs({year: 2016, month: 3, day: 28, hour: 13}, {year: 2016, month: 3, day: 28, hour: 5}, 'hours'), {hours: 8});
    t.deepEqual(diffObjs({year: 2016, month: 3, day: 28, hour: 13}, {year: 2016, month: 3, day: 25, hour: 5}, 'hours'), {hours: 24 * 3 + 8});
    t.end();
  });

  test('Instant#diff accepts multiple units', t => {
    t.deepEqual(diffObjs({year: 2016, month: 3, day: 28, hour: 13, minute: 46},
                         {year: 2016, month: 3, day: 16, hour: 5, second: 18}, 'days', 'hours', 'minutes', 'seconds'),
                {days: 12, hours: 8, minutes: 45, seconds: 42});

    t.deepEqual(diffObjs({year: 2016, month: 3, day: 28},
                         {year: 2010, month: 3, day: 16}, 'years', 'days'),
                {years: 6, days: 12});

    t.deepEqual(diffObjs({year: 2016, month: 3, day: 14},
                         {year: 2010, month: 3, day: 16}, 'years', 'days'),
                {years: 5, days: 364});

    t.deepEqual(diffObjs({year: 2015, month: 3, day: 14},
                         {year: 2009, month: 3, day: 16}, 'years', 'days'),
                {years: 5, days: 363});

    t.deepEqual(diffObjs({year: 2015, month: 3, day: 14},
                         {year: 2009, month: 3, day: 16}, 'years', 'days', 'hours'),
                {years: 5, days: 363});
    t.end();
  });

  test('Instant#diff puts fractional parts in the lowest order unit', t => {

    t.deepEqual(diffObjs({year: 2017, month: 5, day: 14},
                         {year: 2016, month: 3, day: 16}, 'years', 'months'),
                {years: 1, months: 2 - 2.0/30});
    t.end();
  });

  test('Instant#diff is calendary for years, months, day', t => {

    //respecting the leap year
    t.deepEqual(diffObjs({year: 2016, month: 3, day: 14},
                         {year: 2010, month: 3, day: 14}, 'years', 'days'),
                {years: 6});

    t.deepEqual(diffObjs({year: 2016, month: 3, day: 14},
                         {year: 2010, month: 3, day: 16}, 'years', 'days'),
                {years: 5, days: 364});

    //ignores the DST, works in calendar days, not bubbled months
    t.deepEqual(diffObjs({year: 2016, month: 5, day: 14},
                         {year: 2016, month: 2, day: 14}, 'days'),
                {days: 89});
    t.end();
  });

  test('Instant#diff is precise for lower order units', t => {

    let expected = Info.hasDST() ? 2999 : 3000; //spring forward skips one hour

    t.deepEqual(diffObjs({year: 2016, month: 5, day: 5},
                         {year: 2016, month: 1, day: 1}, 'hours'),
                {hours: expected});

    t.end();
  });

}
