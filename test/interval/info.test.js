import { Instant, Interval, Duration } from '../../dist/cjs/luxon';

let fromISOs = (s, e, opts = {}) => Instant.fromISO(s).until(Instant.fromISO(e), opts),
    todayAt = (h) => Instant.now().startOf('day').hour(h),
    todayFrom = (h1, h2, opts) => Interval.fromInstants(todayAt(h1), todayAt(h2), opts);

//------
// #length()
//-------

test('Interval#length defaults to milliseconds', () => {
  let n = Instant.now(),
      d = n.until(n.plus(1, 'minute'));

  expect(d.length()).toBe(60 * 1000);
});

test("Interval#length('days') returns 1 for yesterday", () => {
  expect(todayAt(13).minus(1, 'day').until(todayAt(13)).length('days')).toBe(1);
});

test("Interval#length('months') returns the right number of months", () => {
  expect(Math.floor(fromISOs('1996-02-17', '2012-08-14').length('months'))).toBe(197);
});

test("Interval#length('years') returns the right number of years", () => {
  expect(Math.floor(fromISOs('1996-02-17', '2012-08-14').length('years'))).toBe(16);
});

//------
// #count()
//-------

test("Interval#count('days') returns 1 inside a day", () => {
  let i = Instant.fromISO('2016-05-25T03:00').until(Instant.fromISO('2016-05-25T14:00'));
  expect(i.count('days')).toBe(1);
});

test("Interval#count('days') returns 2 if the interval crosses midnight", () => {
  let i = Instant.fromISO('2016-05-25T03:00').until(Instant.fromISO('2016-05-26T14:00'));
  expect(i.count('days')).toBe(2);
});

test("Interval#count('years') returns 1 inside a year", () => {
  let i = Instant.fromISO('2016-05-25').until(Instant.fromISO('2016-05-26'));
  expect(i.count('years')).toBe(1);
});

test("Interval#count('days') returns 2 if the interval crosses the new year", () => {
  let i = Instant.fromISO('2016-05-25').until(Instant.fromISO('2017-05-26'));
  expect(i.count('years')).toBe(2);
});

//------
// #toDuration()
//-------

test('Interval#toDuration(units) creates a duration in those units', () => {
  let int = Interval.fromInstants(todayAt(9), todayAt(13));

  expect(int.toDuration().equals(Duration.fromLength(4 * 3600 * 1000))).toBeTruthy();
  expect(
    int.toDuration('milliseconds').equals(Duration.fromLength(4 * 3600 * 1000))
  ).toBeTruthy();
  expect(int.toDuration('seconds').equals(Duration.fromLength(4 * 3600, 'seconds'))).toBeTruthy();
  expect(int.toDuration('minutes').equals(Duration.fromLength(4 * 60, 'minutes'))).toBeTruthy();
  expect(int.toDuration('hours').equals(Duration.fromLength(4, 'hours'))).toBeTruthy();
  expect(int.toDuration('days').equals(Duration.fromLength(1.0 / 6, 'days'))).toBeTruthy();
});

//------
// #contains()
//-------

test('Interval#contains returns true for instants in the interval', () => {
  let i = fromISOs('1982-05-25T06:00', '1982-05-25T07:00');
  expect(i.contains(Instant.fromISO('1982-05-25T06:30'))).toBeTruthy();
});

test('Interval#contains returns false for instants after the interval', () => {
  let i = fromISOs('1982-05-25T06:00', '1982-05-25T07:00');
  expect(i.contains(Instant.fromISO('1982-05-25T08:30'))).toBeFalsy();
});

test('Interval#contains returns false for instants before the interval', () => {
  let i = fromISOs('1982-05-25T06:00', '1982-05-25T07:00');
  expect(i.contains(Instant.fromISO('1982-05-25T05:30'))).toBeFalsy();
});

test('Interval#contains returns true for the start endpoint', () => {
  let i = fromISOs('1982-05-25T06:00', '1982-05-25T07:00');
  expect(i.contains(Instant.fromISO('1982-05-25T06:00'))).toBeTruthy();
});

test('Interval#contains returns false for the end endpoint', () => {
  let i = fromISOs('1982-05-25T06:00', '1982-05-25T07:00');
  expect(i.contains(Instant.fromISO('1982-05-25T07:00'))).toBeFalsy();
});

//------
// #isEmpty()
//-------

test('Interval#isEmpty returns true for empty intervals', () => {
  let i = fromISOs('1982-05-25T06:00', '1982-05-25T06:00');
  expect(i.isEmpty()).toBeTruthy();
});

test('Interval#isEmpty returns false for non-empty intervals', () => {
  let i = fromISOs('1982-05-25T06:00', '1982-05-25T08:00');
  expect(i.isEmpty()).toBeFalsy();
});

//------
// #isBefore()
//-------

test('Interval#isBefore returns true for intervals fully before the input', () => {
  let n = Instant.fromISO('1982-05-25T06:00'),
      i = Interval.fromInstants(n.minus(2, 'day'), n.minus(1, 'day'));
  expect(i.isBefore(n)).toBeTruthy();
});

test('Interval#isBefore returns false for intervals containing the input', () => {
  let n = Instant.fromISO('1982-05-25T06:00'),
  i = Interval.fromInstants(n.minus(2, 'day'), n.plus(2, 'day'));
  expect(i.isBefore(n)).toBeFalsy();
});

test('Interval#isBefore returns false for intervals fully after the input ', () => {
  let n = Instant.fromISO('1982-05-25T06:00'),
  i = Interval.fromInstants(n.plus(2, 'day'), n.plus(3, 'day'));
  expect(i.isBefore(n)).toBeFalsy();
});

test('Interval#isBefore returns true for intervals starting at the input', () => {
  let n = Instant.fromISO('1982-05-25T06:00'),
  i = Interval.fromInstants(n, n.minus(1, 'day'));
  expect(i.isBefore(n)).toBeTruthy();
});

//------
// #isAfter()
//-------

test('Interval#isAfter returns true for intervals fully after the input', () => {
  let n = Instant.fromISO('1982-05-25T06:00'),
  i = Interval.fromInstants(n.plus(1, 'day'), n.plus(2, 'day'));
  expect(i.isAfter(n)).toBeTruthy();
});

test('Interval#isAfter returns false for intervals containing the input', () => {
  let n = Instant.fromISO('1982-05-25T06:00'),
  i = Interval.fromInstants(n.minus(2, 'day'), n.plus(2, 'day'));
  expect(i.isAfter(n)).toBeFalsy();
});

test('Interval#isAfter returns false for fully before the input ', () => {
  let n = Instant.fromISO('1982-05-25T06:00'),
  i = Interval.fromInstants(n.minus(2, 'day'), n.minus(1, 'day'));
  expect(i.isAfter(n)).toBeFalsy();
});

test('Interval#isAfter returns false for intervals beginning at the input', () => {
  let n = Instant.fromISO('1982-05-25T06:00'),
  i = Interval.fromInstants(n, n.plus(1, 'day'));
  expect(i.isAfter(n)).toBeFalsy();
});

//------
// #hasSame()
//-------

test("Interval#hasSame('day') returns true for durations on the same day", () => {
  let n = Instant.fromISO('1982-05-25T06:00'),
  i = Interval.fromInstants(n, n.plus(5, 'hours'));
  expect(i.hasSame('day')).toBeTruthy();
});

test("Interval#hasSame('day') returns true for durations that last until the next day", () => {
  let n = Instant.fromISO('1982-05-25T06:00'),
  i = Interval.fromInstants(n, n.plus(20, 'hours'));
  expect(i.hasSame('day')).toBeFalsy();
});

test("Interval#hasSame('day') returns true for durations durations ending at midnight", () => {
  let n = Instant.fromISO('1982-05-25T06:00'),
      i = Interval.fromInstants(n, n.plus(1, 'day').startOf('day'));
  expect(i.hasSame('day')).toBeTruthy();
});
