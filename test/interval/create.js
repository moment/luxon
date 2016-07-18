import test from 'tape';
import {Instant, Interval, Duration} from 'luxon';

export let create = () => {

  //------
  // .fromObject()
  //-------

  test('Interval.fromObject creates an interval', t => {

    let start = Instant.fromObject({year: 2016, month: 5, day: 25}),
        end = Instant.fromObject({year: 2016, month: 5, day: 27}),
        int = Interval.fromInstants(start, end);

    t.is(int.start(), start);
    t.is(int.end(), end);
    t.end();
  });

  //------
  // .after()
  //-------

  test('Interval.after takes a duration', t => {

    let start = Instant.fromObject({year: 2016, month: 5, day: 25}),
        int = Interval.after(start, Duration.fromObject({days: 3}));

    t.is(int.start(), start);
    t.is(int.end().day(), 28);
    t.end();
  });

  test('Interval.after takes a number and unit', t => {

    let start = Instant.fromObject({year: 2016, month: 5, day: 25}),
        int = Interval.after(start, 3, 'days');

    t.is(int.start(), start);
    t.is(int.end().day(), 28);
    t.end();
  });

  //------
  // .before()
  //-------

  test('Interval.before takes a duration', t => {

    let end = Instant.fromObject({year: 2016, month: 5, day: 25}),
        int = Interval.before(end, Duration.fromObject({days: 3}));

    t.is(int.start().day(), 22);
    t.is(int.end(), end);
    t.end();
  });

  test('Interval.before takes a number and unit', t => {

    let end = Instant.fromObject({year: 2016, month: 5, day: 25}),
        int = Interval.before(end, 3, 'days');

    t.is(int.start().day(), 22);
    t.is(int.end(), end);
    t.end();
  });
};
