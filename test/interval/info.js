import test from 'tape';
import {Instant, Interval, Duration} from 'luxon';

export let info = () => {

  let fromISOs = (s, e, opts = {}) => Instant.fromISO(s).until(Instant.fromISO(e), opts),
      todayAt = (h) => Instant.now().startOf('day').hour(h),
      todayFrom = (h1, h2, opts) => Interval.fromInstants(todayAt(h1), todayAt(h2), opts);

  //------
  // #length()
  //-------

  test('Interval#length defaults to milliseconds', t => {
    let n = Instant.now(),
        d = n.until(n.plus(1, 'minute'));

    t.is(d.length(), 60 * 1000);
    t.end();
  });

  test("Interval#length('days') returns 1 for yesterday", t => {
    t.is(todayAt(13).minus(1, 'day').until(todayAt(13)).length('days'), 1);
    t.end();
  });

  test("Interval#length('months') returns the right number of months", t => {
    t.is(Math.floor(fromISOs('1996-02-17', '2012-08-14').length('months')), 197);
    t.end();
  });

  test("Interval#length('years') returns the right number of years", t => {
    t.is(Math.floor(fromISOs('1996-02-17', '2012-08-14').length('years')), 16);
    t.end();
  });

  //------
  // #count()
  //-------

  test("Interval#count('days') returns 1 inside a day", t => {
    let i = Instant.fromISO('2016-05-25T03:00').until(Instant.fromISO('2016-05-25T14:00'));
    t.is(i.count('days'), 1);
    t.end();
  });

  test("Interval#count('days') returns 2 if the interval crosses midnight", t => {
    let i = Instant.fromISO('2016-05-25T03:00').until(Instant.fromISO('2016-05-26T14:00'));
    t.is(i.count('days'), 2);
    t.end();
  });

  test("Interval#count('years') returns 1 inside a year", t => {
    let i = Instant.fromISO('2016-05-25').until(Instant.fromISO('2016-05-26'));
    t.is(i.count('years'), 1);
    t.end();
  });

  test("Interval#count('days') returns 2 if the interval crosses the new year", t => {
    let i = Instant.fromISO('2016-05-25').until(Instant.fromISO('2017-05-26'));
    t.is(i.count('years'), 2);
    t.end();
  });

  //------
  // #toDuration()
  //-------

  test('Interval#toDuration(units) creates a duration in those units', t => {

    let int = Interval.fromInstants(todayAt(9), todayAt(13));

    t.ok(int.toDuration().equals(Duration.fromLength(4 * 3600 * 1000)), 'none');
    t.ok(int.toDuration('milliseconds').equals(Duration.fromLength(4 * 3600 * 1000)), 'milliseconds');
    t.ok(int.toDuration('seconds').equals(Duration.fromLength(4 * 3600, 'seconds')), 'seconds');
    t.ok(int.toDuration('minutes').equals(Duration.fromLength(4 * 60, 'minutes')), 'minutes');
    t.ok(int.toDuration('hours').equals(Duration.fromLength(4, 'hours')), 'hours');
    t.ok(int.toDuration('days').equals(Duration.fromLength(1.0 / 6, 'days')), 'days');
    t.end();
  });

  //------
  // #contains()
  //-------

  test('Interval#contains returns true for instants in the interval', t => {
    let i = fromISOs('1982-05-25T06:00', '1982-05-25T07:00');
    t.ok(i.contains(Instant.fromISO('1982-05-25T06:30')));
    t.end();
  });

  test('Interval#contains returns false for instants after the interval', t => {
    let i = fromISOs('1982-05-25T06:00', '1982-05-25T07:00');
    t.notOk(i.contains(Instant.fromISO('1982-05-25T08:30')));
    t.end();
  });

  test('Interval#contains returns false for instants before the interval', t => {
    let i = fromISOs('1982-05-25T06:00', '1982-05-25T07:00');
    t.notOk(i.contains(Instant.fromISO('1982-05-25T05:30')));
    t.end();
  });

  test('Interval#contains returns true for the start endpoint', t => {
    let i = fromISOs('1982-05-25T06:00', '1982-05-25T07:00');
    t.ok(i.contains(Instant.fromISO('1982-05-25T06:00')));
    t.end();
  });

  test('Interval#contains returns false for the end endpoint', t => {
    let i = fromISOs('1982-05-25T06:00', '1982-05-25T07:00');
    t.notOk(i.contains(Instant.fromISO('1982-05-25T07:00')));
    t.end();
  });

  //------
  // #isEmpty()
  //-------

  test('Interval#isEmpty returns true for empty intervals', t => {
    let i = fromISOs('1982-05-25T06:00', '1982-05-25T06:00');
    t.ok(i.isEmpty());
    t.end();
  });

  test('Interval#isEmpty returns false for non-empty intervals', t => {
    let i = fromISOs('1982-05-25T06:00', '1982-05-25T08:00');
    t.notOk(i.isEmpty());
    t.end();
  });

  //------
  // #isBefore()
  //-------

  test('Interval#isBefore returns true for intervals fully before the input', t => {
    let n = Instant.fromISO('1982-05-25T06:00'),
        i = Interval.fromInstants(n.minus(2, 'day'), n.minus(1, 'day'));
    t.ok(i.isBefore(n));
    t.end();
  });

  test('Interval#isBefore returns false for intervals containing the input', t => {
    let n = Instant.fromISO('1982-05-25T06:00'),
        i = Interval.fromInstants(n.minus(2, 'day'), n.plus(2, 'day'));
    t.notOk(i.isBefore(n));
    t.end();
  });

  test('Interval#isBefore returns false for intervals fully after the input ', t => {
    let n = Instant.fromISO('1982-05-25T06:00'),
        i = Interval.fromInstants(n.plus(2, 'day'), n.plus(3, 'day'));
    t.notOk(i.isBefore(n));
    t.end();
  });

  test('Interval#isBefore returns true for intervals starting at the input', t => {
    let n = Instant.fromISO('1982-05-25T06:00'),
        i = Interval.fromInstants(n, n.minus(1, 'day'));
    t.ok(i.isBefore(n));
    t.end();
  });

  //------
  // #isAfter()
  //-------

  test('Interval#isAfter returns true for intervals fully after the input', t => {
    let n = Instant.fromISO('1982-05-25T06:00'),
        i = Interval.fromInstants(n.plus(1, 'day'), n.plus(2, 'day'));
    t.ok(i.isAfter(n));
    t.end();
  });

  test('Interval#isAfter returns false for intervals containing the input', t => {
    let n = Instant.fromISO('1982-05-25T06:00'),
        i = Interval.fromInstants(n.minus(2, 'day'), n.plus(2, 'day'));
    t.notOk(i.isAfter(n));
    t.end();
  });

  test('Interval#isAfter returns false for fully before the input ', t => {
    let n = Instant.fromISO('1982-05-25T06:00'),
        i = Interval.fromInstants(n.minus(2, 'day'), n.minus(1, 'day'));
    t.notOk(i.isAfter(n));
    t.end();
  });

  test('Interval#isAfter returns false for intervals beginning at the input', t => {
    let n = Instant.fromISO('1982-05-25T06:00'),
        i = Interval.fromInstants(n, n.plus(1, 'day'));
    t.notOk(i.isAfter(n));
    t.end();
  });

  //------
  // #hasSame()
  //-------

  test("Interval#hasSame('day') returns true for durations on the same day", t => {
    let n = Instant.fromISO('1982-05-25T06:00'),
        i = Interval.fromInstants(n, n.plus(5, 'hours'));
    t.ok(i.hasSame('day'));
    t.end();
  });

  test("Interval#hasSame('day') returns true for durations that last until the next day", t => {
    let n = Instant.fromISO('1982-05-25T06:00'),
        i = Interval.fromInstants(n, n.plus(20, 'hours'));
    t.notOk(i.hasSame('day'));
    t.end();
  });

  test("Interval#hasSame('day') returns true for durations durations ending at midnight", t => {
    let n = Instant.fromISO('1982-05-25T06:00'),
        i = Interval.fromInstants(n, n.plus(1, 'day').startOf('day'));
    t.ok(i.hasSame('day'));
    t.end();
  });
};
