import test from 'tape';
import {Duration} from 'luxon';

export let units = () => {

  //------
  // #shiftTo()
  //-------

  test('Duration#shiftTo rolls milliseconds up shiftTo hours and minutes', t => {

    let dur = Duration.fromLength(5760000, 'milliseconds');

    t.is(dur.shiftTo('hours').hours(), 1.6);

    let mod = dur.shiftTo('hours', 'minutes');
    t.is(mod.hours(), 1);
    t.is(mod.minutes(), 36);
    t.is(mod.seconds(), 0);
    t.end();
  });

  test('Duration#shiftTo boils hours down shiftTo milliseconds', t => {
    let dur = Duration .fromLength(1, 'hour').shiftTo('milliseconds');
    t.is(dur.milliseconds(), 3600000);
    t.end();
  });

  test('Duration boils hours down shiftTo minutes and milliseconds', t => {
    let dur = Duration .fromObject({hours: 1, seconds: 30}).shiftTo('minutes', 'milliseconds');
    t.is(dur.minutes(), 60);
    t.is(dur.milliseconds(), 30000);
    t.end();
  });

  test('Duration#shiftTo boils down and then rolls up', t => {
    let dur = Duration.fromObject({years: 2, hours: 5000}).shiftTo('months', 'days', 'minutes');

    t.is(dur.months(), 30);
    t.is(dur.days(), 28);
    t.is(dur.minutes(), 8 * 60);
    t.end();
  });
};
