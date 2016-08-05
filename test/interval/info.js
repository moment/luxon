import test from 'tape';
import {Instant, Interval, Duration} from 'luxon';

export let info = () => {

  let yesterday = () => Instant.now().minus(1, 'day').startOf('day'),
      tomorrow = () => moment().plus(1, 'day').startOf('day'),
      fromISOs = (s, e) => Instant.fromISO(s).until(Instant.fromISO(e)),
      now = () => Instant.now(),
      today = () => now().startOf('day');

  //------
  // .length()
  //-------

  test('Interval.length defaults to milliseconds', t => {
    let n = now();
    t.is(n.until(n.plus(1, 'minute')).length(), 60 * 1000);
    t.end();
  });

  test("Interval.length('days') returns 1 for yesterday", t => {
    t.is(yesterday().until(today()).length('days'), 1);
    t.end();
  });

  test("Interval.length('months') returns the right number of months", t => {
    t.is(Math.floor(fromISOs('1996-02-17', '2012-08-14').length('months')), 197);
    t.end();
  });

  test("Interval.length('years') returns the right number of years", t => {
    t.is(Math.floor(fromISOs('1996-02-17', '2012-08-14').length('years')), 16);
    t.end();
  });

  //------
  // .count()
  //-------

  test("Interval.count('days') returns 1 inside a day", t => {
    let i = Instant.fromISO('2016-05-25T03:00').until(Instant.fromISO('2016-05-25T14:00'));
    t.is(i.count('days'), 1);
    t.end();
  });

  test("Interval.count('days') returns 2 if the interval crosses midnight", t => {
    let i = Instant.fromISO('2016-05-25T03:00').until(Instant.fromISO('2016-05-26T14:00'));
    t.is(i.count('days'), 2);
    t.end();
  });

  test("Interval.count('years') returns 1 inside a year", t => {
    let i = Instant.fromISO('2016-05-25').until(Instant.fromISO('2016-05-26'));
    t.is(i.count('years'), 1);
    t.end();
  });

  test("Interval.count('days') returns 2 if the interval crosses the new year", t => {
    let i = Instant.fromISO('2016-05-25').until(Instant.fromISO('2017-05-26'));
    t.is(i.count('years'), 2);
    t.end();
  });

  //------
  // .toDuration()
  //-------

  test('Interval.toDuration(units) creates a duration in those units', t => {
    t.end();
  });

  //------
  // .contains()
  //-------

  //------
  // .isEmpty()
  //-------

  //------
  // .isPast()
  //-------

  //------
  // .isFuture()
  //-------

  //------
  // .isCurrent()
  //-------

  //------
  // .isStartOpen()
  //-------

  //------
  // .isEndOpen()
  //-------

  //------
  // .hasSame()
  //-------
};
