import test from 'tape';
import {Instant, Duration} from 'luxon';

export let create = () => {

  //------
  // .froObject()
  //-------

  test('Duration.fromObject sets all the values', t => {
    let dur = Duration.fromObject({years: 1, months: 2, days: 3, hours: 4, minutes: 5, seconds: 6, milliseconds: 7});
    t.is(dur.years(), 1);
    t.is(dur.months(), 2);
    t.is(dur.days(), 3);
    t.is(dur.hours(), 4);
    t.is(dur.minutes(), 5);
    t.is(dur.seconds(), 6);
    t.is(dur.milliseconds(), 7);
    t.end();
  });
};
