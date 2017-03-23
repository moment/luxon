/* global test expect */
import { DateTime, Interval, Duration } from '../../dist/cjs/luxon';

const fromISOs = (s, e, opts = {}) => DateTime.fromISO(s).until(DateTime.fromISO(e), opts),
  todayAt = h => DateTime.now().startOf('day').hour(h),
  todayFrom = (h1, h2, opts) => Interval.fromDateTimes(todayAt(h1), todayAt(h2), opts);

//-------
// #equals()
//-------
test('Interval#equals returns true iff the times are the same', () => {
  const s = '2016-10-14',
    e = '2016-10-15',
    s2 = '2016-10-13',
    e2 = '2016-10-16',
    first = fromISOs(s, e);

  expect(first.equals(fromISOs(s, e))).toBeTruthy();
  expect(first.equals(fromISOs(s2, e))).toBeFalsy();
  expect(first.equals(fromISOs(s, e2))).toBeFalsy();
  expect(first.equals(fromISOs(s2, e2))).toBeFalsy();
});

//-------
// #union()
//-------
test('Interval#union returns an interval spanning a later interval', () => {
  expect(todayFrom(5, 8).union(todayFrom(9, 11)).equals(todayFrom(5, 11))).toBeTruthy();
});

test('Interval#union returns an interval spanning a earlier interval', () => {
  expect(todayFrom(5, 8).union(todayFrom(3, 4)).equals(todayFrom(3, 8))).toBeTruthy();
});

test('Interval#union returns an interval spanning a partially later interval', () => {
  expect(todayFrom(5, 8).union(todayFrom(7, 10)).equals(todayFrom(5, 10))).toBeTruthy();
});

test('Interval#union returns an interval spanning a partially earlier interval', () => {
  expect(todayFrom(5, 8).union(todayFrom(4, 6)).equals(todayFrom(4, 8))).toBeTruthy();
});

test('Interval#union returns an interval no-ops when applied to an engulfed interval', () => {
  expect(todayFrom(5, 8).union(todayFrom(6, 7)).equals(todayFrom(5, 8))).toBeTruthy();
});

test('Interval#union expands to an engulfing interval', () => {
  expect(todayFrom(5, 8).union(todayFrom(4, 10)).equals(todayFrom(4, 10))).toBeTruthy();
});

test('Interval#union spans adjacent intervals', () => {
  expect(todayFrom(5, 8).union(todayFrom(8, 10)).equals(todayFrom(5, 10))).toBeTruthy();
});

//-------
// #intersection()
//-------
// todo - is this what should happen here? Seems annoying.
test("Interval#intersection returns null if there's no intersection", () => {
  expect(todayFrom(5, 8).intersection(todayFrom(3, 4))).toBe(null);
});

test('Interval#intersection returns the intersection for overlapping intervals', () => {
  expect(todayFrom(5, 8).intersection(todayFrom(3, 7)).equals(todayFrom(5, 7))).toBeTruthy();
});

test('Interval#intersection returns empty for adjacent intervals', () => {
  expect(todayFrom(5, 8).intersection(todayFrom(8, 10)).isEmpty()).toBeTruthy();
});

//-------
// .merge()
//-------
test('Interval.merge returns the minimal set of intervals', () => {
  const list = [
    todayFrom(5, 8),
    todayFrom(4, 7),
    todayFrom(10, 11),
    todayFrom(11, 12),
    todayFrom(13, 15)
  ],
    results = Interval.merge(list);

  expect(results.length).toBe(3);
  expect(results[0] && results[0].equals(todayFrom(4, 8))).toBeTruthy();
  expect(results[1] && results[1].equals(todayFrom(10, 12))).toBeTruthy();
  expect(results[2] && results[2].equals(todayFrom(13, 15))).toBeTruthy();
});

test('Interval.merge returns empty for an empty input', () => {
  expect(Interval.merge([])).toEqual([]);
});

//-------
// .xor()
//-------
function xor(items, expected) {
  const r = Interval.xor(items);
  expect(r.length).toBe(expected.length);
  for (const i in expected) {
    if (expected.hasOwnProperty(i)) {
      expect(r[i] && r[i].equals(expected[i])).toBeTruthy();
    }
  }
  return r;
}

test('Interval.xor returns non-overlapping intervals as-is', () => {
  const ix = [todayFrom(6, 7), todayFrom(8, 9)];
  xor(ix, ix);
});

test('Interval.xor returns empty for an empty input', () => {
  xor([], []);
});

test('Interval.xor returns empty for a fully overlapping set of intervals', () => {
  xor([todayFrom(5, 8), todayFrom(5, 8)], []);
  xor([todayFrom(5, 8), todayFrom(5, 6), todayFrom(6, 8)], []);
});

test('Interval.xor returns the non-overlapping parts of intervals', () => {
  // overlapping
  xor([todayFrom(5, 8), todayFrom(7, 11)], [todayFrom(5, 7), todayFrom(8, 11)]);

  // engulfing
  xor([todayFrom(5, 12), todayFrom(9, 10)], [todayFrom(5, 9), todayFrom(10, 12)]);

  // adjacent
  xor([todayFrom(5, 6), todayFrom(6, 8)], [todayFrom(5, 8)]);

  // three intervals
  xor(
    [todayFrom(10, 13), todayFrom(8, 11), todayFrom(12, 14)],
    [todayFrom(8, 10), todayFrom(11, 12), todayFrom(13, 14)]
  );
});

test('Interval.xor handles funny adjacency cases', () => {
  xor(
    [todayFrom(5, 14), todayFrom(7, 11), todayFrom(11, 12)],
    [todayFrom(5, 7), todayFrom(12, 14)]
  );

  xor([todayFrom(5, 10), todayFrom(9, 11), todayFrom(9, 12)], [todayFrom(5, 9), todayFrom(11, 12)]);

  xor([todayFrom(5, 9), todayFrom(9, 11), todayFrom(9, 12), todayFrom(5, 9)], [todayFrom(11, 12)]);
});

//-------
// #difference()
//-------
function diff(interval, items, expected) {
  const r = interval.difference(...items);
  expect(r.length).toBe(expected.length);
  for (const i in expected) {
    if (expected.hasOwnProperty(i)) {
      expect(r[i] && r[i].equals(expected[i])).toBeTruthy();
    }
  }
  return r;
}

test('Interval#difference returns self for non-overlapping intervals', () => {
  diff(todayFrom(8, 9), [todayFrom, (10, 11)], [todayFrom(8, 9)]);
  diff(todayFrom(8, 9), [todayFrom, (6, 7)], [todayFrom(8, 9)]);
});

test('Interval#difference returns the non-overlapping parts of intervals', () => {
  diff(todayFrom(8, 10), [todayFrom(9, 11)], [todayFrom(8, 9)]);
  diff(todayFrom(9, 11), [todayFrom(8, 10)], [todayFrom(10, 11)]);
  diff(todayFrom(9, 11), [todayFrom(8, 9), todayFrom(9, 10)], [todayFrom(10, 11)]);
});

test('Interval#difference returns the empty for fully subtracted intervals', () => {
  diff(todayFrom(8, 10), [todayFrom(7, 11)], []);
  diff(todayFrom(8, 10), [todayFrom(8, 9), todayFrom(9, 10)], []);
  diff(todayFrom(8, 12), [todayFrom(8, 10), todayFrom(9, 11), todayFrom(10, 13)], []);
});

test('Interval#difference returns the outside parts when engulfing another interval', () => {
  diff(todayFrom(8, 12), [todayFrom(9, 11)], [todayFrom(8, 9), todayFrom(11, 12)]);
  diff(
    todayFrom(8, 12),
    [todayFrom(9, 10), todayFrom(10, 11)],
    [todayFrom(8, 9), todayFrom(11, 12)]
  );
});

test('Interval#difference allows holes', () => {
  diff(
    todayFrom(8, 13),
    [todayFrom(9, 10), todayFrom(11, 12)],
    [todayFrom(8, 9), todayFrom(10, 11), todayFrom(12, 13)]
  );
});

//-------
// #engulfs()
//-------
test('Interval#engulfs', () => {
  const i = todayFrom(9, 12);

  expect(i.engulfs(todayFrom(13, 15), 'wholly later')).toBeFalsy();
  expect(i.engulfs(todayFrom(11, 15), 'partially later')).toBeFalsy();
  expect(i.engulfs(todayFrom(6, 8), 'wholly earlier')).toBeFalsy();
  expect(i.engulfs(todayFrom(6, 10), 'partially earlier')).toBeFalsy();
  expect(i.engulfs(todayFrom(8, 13), 'engulfed')).toBeFalsy();

  expect(i.engulfs(todayFrom(10, 11), 'engulfing')).toBeTruthy();
  expect(i.engulfs(todayFrom(9, 12), 'equal')).toBeTruthy();
});

//-------
// #abutsStart()
//-------
test('Interval#abutsStart', () => {
  expect(todayFrom(9, 10).abutsStart(todayFrom(10, 11))).toBeTruthy();
  expect(todayFrom(9, 10).abutsStart(todayFrom(11, 12))).toBeFalsy();
  expect(todayFrom(9, 10).abutsStart(todayFrom(8, 11))).toBeFalsy();
  expect(todayFrom(9, 10).abutsStart(todayFrom(9, 10))).toBeFalsy();
});

//-------
// #abutsEnd()
//-------
test('Interval#abutsEnd', () => {
  expect(todayFrom(9, 11).abutsEnd(todayFrom(8, 9))).toBeTruthy();
  expect(todayFrom(9, 11).abutsEnd(todayFrom(8, 10))).toBeFalsy();
  expect(todayFrom(9, 11).abutsEnd(todayFrom(7, 8))).toBeFalsy();
  expect(todayFrom(9, 11).abutsEnd(todayFrom(9, 11))).toBeFalsy();
});

//-------
// #splitAt()
//-------
test('Interval#splitAt breaks up the interval', () => {
  const split = todayFrom(8, 13).splitAt(todayAt(9), todayAt(11));
  expect(split.length).toBe(3);
  expect(split[0].equals(todayFrom(8, 9))).toBeTruthy();
  expect(split[1].equals(todayFrom(9, 11))).toBeTruthy();
  expect(split[2].equals(todayFrom(11, 13))).toBeTruthy();
});

//-------
// #splitBy()
//-------
test('Interval#splitBy accepts a count and unit', () => {
  const split = todayFrom(8, 13).splitBy(2, 'hours');
  expect(split.length).toBe(3);
  expect(split[0].equals(todayFrom(8, 10))).toBeTruthy();
  expect(split[1].equals(todayFrom(10, 12))).toBeTruthy();
  expect(split[2].equals(todayFrom(12, 13))).toBeTruthy();
});

test('Interval#splitBy accepts a duration', () => {
  const split = todayFrom(8, 13).splitBy(Duration.fromObject({ hours: 2 }));
  expect(split.length).toBe(3);
  expect(split[0].equals(todayFrom(8, 10))).toBeTruthy();
  expect(split[1].equals(todayFrom(10, 12))).toBeTruthy();
  expect(split[2].equals(todayFrom(12, 13))).toBeTruthy();
});

//-------
// #divideEqually()
//-------
test('Interval#divideEqually should split a 4 hour period into 4 contiguous 1-hour parts', () => {
  const split = todayFrom(5, 9).divideEqually(4);
  expect(split.length).toBe(4);
  expect(split[0].equals(todayFrom(5, 6))).toBeTruthy();
  expect(split[3].equals(todayFrom(8, 9))).toBeTruthy();
});

test('Interval#divideEqually should split a 1m30s into 3 30-second parts', () => {
  const after = (i, m, s) => Interval.after(i, Duration.fromObject({ minutes: m, seconds: s })),
    split = after(todayAt(9), 1, 30).divideEqually(3);
  expect(split.length).toBe(3);
  expect(split[0].equals(after(todayAt(9), 0, 30))).toBeTruthy();
  expect(split[2].equals(after(todayAt(9).plus(1, 'minute'), 0, 30))).toBeTruthy();
});

test('Interval#divideEqually always gives you the right number of parts', () => {
  const int = Interval.after(todayAt(9), 7, 'minutes'), split = int.divideEqually(17);
  expect(split.length).toBe(17);
});
