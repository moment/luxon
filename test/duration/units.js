import {Duration} from 'luxon';

export let units = () => {

  //------
  // #shiftTo()
  //-------

  it('Duration#shiftTo rolls milliseconds up shiftTo hours and minutes', () => {
    let dur = Duration.fromLength(5760000, 'milliseconds');

    expect(dur.shiftTo('hours').hours()).toBe(1.6);

    let mod = dur.shiftTo('hours', 'minutes');
    expect(mod.hours()).toBe(1);
    expect(mod.minutes()).toBe(36);
    expect(mod.seconds()).toBe(0);
  });

  it('Duration#shiftTo boils hours down shiftTo milliseconds', () => {
    let dur = Duration .fromLength(1, 'hour').shiftTo('milliseconds');
    expect(dur.milliseconds()).toBe(3600000);
  });

  it('Duration boils hours down shiftTo minutes and milliseconds', () => {
    let dur = Duration .fromObject({hours: 1, seconds: 30}).shiftTo('minutes', 'milliseconds');
    expect(dur.minutes()).toBe(60);
    expect(dur.milliseconds()).toBe(30000);
  });

  it('Duration#shiftTo boils down and then rolls up', () => {
    let dur = Duration.fromObject({years: 2, hours: 5000}).shiftTo('months', 'days', 'minutes');

    expect(dur.months()).toBe(30);
    expect(dur.days()).toBe(28);
    expect(dur.minutes()).toBe(8 * 60);
  });

  //------
  // #normalize()
  //-------

  it('Duration#normalize rebalances negative units', () => {
    let dur = Duration.fromObject({years: 2, days: -2}).normalize();

    expect(dur.years()).toBe(1);
    expect(dur.days()).toBe(363);
  });

  it('Duration#normalize de-overflows', () => {
    let dur = Duration.fromObject({years: 2, days: 5000}).normalize();

    expect(dur.years()).toBe(15);
    expect(dur.days()).toBe(255);
  });
};
