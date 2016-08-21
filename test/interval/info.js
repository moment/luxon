import test from 'tape';
import {Instant, Interval, Duration} from 'luxon';

export let info = () => {

  let yesterday = () => Instant.now().minus(1, 'day').startOf('day'),
      tomorrow = () => moment().plus(1, 'day').startOf('day'),
      fromISOs = (s, e, opts = {}) => Instant.fromISO(s).until(Instant.fromISO(e), opts),
      now = () => Instant.now(),
      today = () => now().startOf('day');

  //------
  // #length()
  //-------

  test('Interval#length defaults to milliseconds', t => {
    let n = now();
    t.is(n.until(n.plus(1, 'minute')).length(), 60 * 1000);
    t.end();
  });

  test("Interval#length('days') returns 1 for yesterday", t => {
    t.is(yesterday().until(today()).length('days'), 1);
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

  test('Interval#contains returns false for the ends of closed interval', t => {
    let i = fromISOs('1982-05-25T06:00', '1982-05-25T07:00');
    t.notOk(i.contains(Instant.fromISO('1982-05-25T06:00')), 'closed start');
    t.notOk(i.contains(Instant.fromISO('1982-05-25T07:00')), 'closed end');
    t.end();
  });

  test('Interval#contains returns true for the ends of open interval', t => {
    let i = fromISOs('1982-05-25T06:00', '1982-05-25T07:00', {openStart: true, openEnd: true});
    t.ok(i.contains(Instant.fromISO('1982-05-25T07:00')));
    t.ok(i.contains(Instant.fromISO('1982-05-25T06:00')));
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

  test('Interval#isEmpty returns false for partially open intervals', t => {
    let i = fromISOs('1982-05-25T06:00', '1982-05-25T06:00', {openStart: true});
    t.notOk(i.isEmpty());
    t.end();
  });

  test('Interval#isEmpty returns false for fully open intervals', t => {
    let i = fromISOs('1982-05-25T06:00', '1982-05-25T06:00', {openStart: true, openEnd: true});
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

  test('Interval#isBefore returns false for fully after the input ', t => {
    let n = Instant.fromISO('1982-05-25T06:00'),
        i = Interval.fromInstants(n.plus(2, 'day'), n.plus(3, 'day'));
    t.notOk(i.isBefore(n));
    t.end();
  });

  test('Interval#isBefore returns true for closed intervals ending at the input', t => {
    let n = Instant.fromISO('1982-05-25T06:00'),
        i = Interval.fromInstants(n.minus(1, 'day'), n);
    t.ok(i.isBefore(n));
    t.end();
  });

  test('Interval#isBefore returns false for open intervals ending at the input', t => {
    let n = Instant.fromISO('1982-05-25T06:00'),
        i = Interval.fromInstants(n.minus(1, 'day'), n, {openEnd: true});
    t.notOk(i.isBefore(n));
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

  test('Interval#isAfter returns true for closed intervals beginning at the input', t => {
    let n = Instant.fromISO('1982-05-25T06:00'),
        i = Interval.fromInstants(n, n.plus(1, 'day'));
    t.ok(i.isAfter(n));
    t.end();
  });

  test('Interval#isAfter returns false for open intervals beginning at the input', t => {
    let n = Instant.fromISO('1982-05-25T06:00'),
        i = Interval.fromInstants(n, n.plus(1, 'day'), {openStart: true});
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

  test("Interval#hasSame('day') returns true for durations closed durations ending at midnight", t => {
    let n = Instant.fromISO('1982-05-25T06:00'),
        i = Interval.fromInstants(n, n.plus(1, 'day').startOf('day'));
    t.ok(i.hasSame('day'));
    t.end();
  });

  test("Interval#hasSame('day') returns false for durations open durations ending at midnight", t => {
    let n = Instant.fromISO('1982-05-25T06:00'),
        i = Interval.fromInstants(n, n.plus(1, 'day').startOf('day'), {openEnd: true});
    t.notOk(i.hasSame('day'));
    t.end();
  });
};
