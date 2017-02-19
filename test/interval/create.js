import {Instant, Interval, Duration} from 'luxon';

export let create = () => {

  //------
  // .fromObject()
  //-------

  it('Interval.fromObject creates an interval', () => {
    let start = Instant.fromObject({year: 2016, month: 5, day: 25}),
        end = Instant.fromObject({year: 2016, month: 5, day: 27}),
        int = Interval.fromInstants(start, end);

    expect(int.start()).toBe(start);
    expect(int.end()).toBe(end);
  });

  //------
  // .after()
  //-------

  it('Interval.after takes a duration', () => {
    let start = Instant.fromObject({year: 2016, month: 5, day: 25}),
        int = Interval.after(start, Duration.fromObject({days: 3}));

    expect(int.start()).toBe(start);
    expect(int.end().day()).toBe(28);
  });

  it('Interval.after takes a number and unit', () => {
    let start = Instant.fromObject({year: 2016, month: 5, day: 25}),
        int = Interval.after(start, 3, 'days');

    expect(int.start()).toBe(start);
    expect(int.end().day()).toBe(28);
  });

  //------
  // .before()
  //-------

  it('Interval.before takes a duration', () => {
    let end = Instant.fromObject({year: 2016, month: 5, day: 25}),
        int = Interval.before(end, Duration.fromObject({days: 3}));

    expect(int.start().day()).toBe(22);
    expect(int.end()).toBe(end);
  });

  it('Interval.before takes a number and unit', () => {
    let end = Instant.fromObject({year: 2016, month: 5, day: 25}),
        int = Interval.before(end, 3, 'days');

    expect(int.start().day()).toBe(22);
    expect(int.end()).toBe(end);
  });
};
