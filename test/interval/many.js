import test from 'tape';
import {Instant, Interval, Duration} from 'luxon';

export let many = () => {

  let fromISOs = (s, e, opts = {}) => Instant.fromISO(s).until(Instant.fromISO(e), opts),
      todayAt = (h) => Instant.now().startOf('day').hour(h),
      todayFrom = (h1, h2, opts) => Interval.fromInstants(todayAt(h1), todayAt(h2), opts);

  //-------
  // #equals()
  //-------

  test('Interval#equals returns true iff the times are the same', t => {
    let s = '2016-10-14',
        e = '2016-10-15',
        s2 = '2016-10-13',
        e2 = '2016-10-16',
        first = fromISOs(s, e);

    t.ok(first.equals(fromISOs(s, e)));
    t.notOk(first.equals(fromISOs(s2, e)));
    t.notOk(first.equals(fromISOs(s, e2)));
    t.notOk(first.equals(fromISOs(s2, e2)));
    t.end();
  });

  //-------
  // #union()
  //-------

  test('Interval#union returns an interval spanning an later interval', t => {
    t.ok(todayFrom(5, 8).union(todayFrom(9, 11)).equals(todayFrom(5, 11)));
    t.end();
  });

  test('Interval#union returns an interval spanning a earlier interval', t => {
    t.ok(todayFrom(5, 8).union(todayFrom(3, 4)).equals(todayFrom(3, 8)));
    t.end();
  });

  test('Interval#union returns an interval spanning a partially later interval', t => {
    t.ok(todayFrom(5, 8).union(todayFrom(7, 10)).equals(todayFrom(5, 10)));
    t.end();
  });

  test('Interval#union returns an interval spanning a partially earlier interval', t => {
    t.ok(todayFrom(5, 8).union(todayFrom(4, 6)).equals(todayFrom(4, 8)));
    t.end();
  });

  test('Interval#union returns an interval no-ops when applied to an engulfed interval', t => {
    t.ok(todayFrom(5, 8).union(todayFrom(6, 7)).equals(todayFrom(5, 8)));
    t.end();
  });

  test('Interval#union expands to an engulfing interval', t => {
    t.ok(todayFrom(5, 8).union(todayFrom(4, 10)).equals(todayFrom(4, 10)));
    t.end();
  });

  test('Interval#union spans adjacent intervals', t => {
    t.ok(todayFrom(5, 8).union(todayFrom(8, 10)).equals(todayFrom(5, 10)));
    t.end();
  });

  //-------
  // #intersection()
  //-------

  //todo - is this what should happen here? Seems annoying.
  test("Interval#intersection returns null if there's no intersection", t => {
    t.is(todayFrom(5, 8).intersection(todayFrom(3, 4)), null);
    t.end();
  });

  test('Interval#intersection returns the intersection for overlapping intervals', t => {
    t.ok(todayFrom(5, 8).intersection(todayFrom(3, 7)).equals(todayFrom(5, 7)));
    t.end();
  });

  test('Interval#intersection returns empty for adjacent intervals', t => {
    t.ok(todayFrom(5, 8).intersection(todayFrom(8, 10)).isEmpty());
    t.end();
  });

  //-------
  // .merge()
  //-------

  test('Interval.merge returns the minimal set of intervals', t => {
    let list = [
      todayFrom(5, 8),
      todayFrom(4, 7),
      todayFrom(10, 11),
      todayFrom(11, 12),
      todayFrom(13, 15)],

        results = Interval.merge(list);

    t.is(results.length, 3);
    t.ok(results[0] && results[0].equals(todayFrom(4, 8)));
    t.ok(results[1] && results[1].equals(todayFrom(10, 12)));
    t.ok(results[2] && results[2].equals(todayFrom(13, 15)));
    t.end();
  });

  test('Interval.merge returns empty for an empty input', t => {
    t.deepEqual(Interval.merge([]), []);
    t.end();
  });

  //-------
  // .xor()
  //-------

  let xor = (t, items, expected) => {
    let r = Interval.xor(items);
    t.is(r.length, expected.length);
    for (let i in expected){
      t.ok(r[i] && r[i].equals(expected[i]));
    }
    return r;
  };

  test('Interval.xor returns non-overlapping intervals as-is', t => {
    let ix = [todayFrom(6, 7), todayFrom(8, 9)];
    xor(t, ix, ix);
    t.end();
  });

  test('Interval.xor returns empty for an empty input', t => {
    xor(t, [], []);
    t.end();
  });

  test('Interval.xor returns empty for a fully overlapping set of intervals', t => {
    xor(t, [todayFrom(5, 8), todayFrom(5, 8)], []);
    xor(t, [todayFrom(5, 8), todayFrom(5, 6), todayFrom(6, 8)], []);
    t.end();
  });

  test('Interval.xor returns the non-overlapping parts of intervals', t => {

    //overlapping
    xor(t,
        [todayFrom(5, 8), todayFrom(7, 11)],
        [todayFrom(5, 7), todayFrom(8, 11)]);

    //engulfing
    xor(t,
        [todayFrom(5, 12), todayFrom(9, 10)],
        [todayFrom(5, 9), todayFrom(10, 12)]);

    //adjacent
    xor(t,
        [todayFrom(5, 6), todayFrom(6, 8)],
        [todayFrom(5, 8)]);

    //three intervals
    xor(t,
        [todayFrom(10, 13), todayFrom(8, 11), todayFrom(12, 14)],
        [todayFrom(8, 10), todayFrom(11, 12), todayFrom(13, 14)]);

    t.end();
  });

  test('Interval.xor handles funny adjacency cases', t => {

    xor(t,
        [todayFrom(5, 14), todayFrom(7, 11), todayFrom(11, 12)],
        [todayFrom(5, 7), todayFrom(12, 14)]);

    xor(t,
        [todayFrom(5, 10), todayFrom(9, 11), todayFrom(9, 12)],
        [todayFrom(5, 9), todayFrom(11, 12)]);

    xor(t,
        [todayFrom(5, 9), todayFrom(9, 11), todayFrom(9, 12), todayFrom(5, 9)],
        [todayFrom(11, 12)]);

    t.end();
  });

  //-------
  // #difference()
  //-------

  let diff = (t, interval, items, expected) => {
    let r = interval.difference.apply(interval, items);
    t.is(r.length, expected.length);
    for (let i in expected){
      t.ok(r[i] && r[i].equals(expected[i]));
    }
    return r;
  };

  test('Interval#difference returns self for non-overlapping intervals', t => {
    diff(t, todayFrom(8, 9), [todayFrom,(10, 11)], [todayFrom(8, 9)]);
    diff(t, todayFrom(8, 9), [todayFrom,(6,7)], [todayFrom(8, 9)]);
    t.end();
  });

  test('Interval#difference returns the non-overlapping parts of intervals', t => {
    diff(t, todayFrom(8, 10), [todayFrom(9, 11)], [todayFrom(8, 9)]);
    diff(t, todayFrom(9, 11), [todayFrom(8, 10)], [todayFrom(10, 11)]);
    diff(t, todayFrom(9, 11), [todayFrom(8, 9), todayFrom(9, 10)], [todayFrom(10, 11)]);
    t.end();
  });

  test('Interval#difference returns the empty for fully subtracted intervals', t => {
    diff(t, todayFrom(8, 10), [todayFrom(7, 11)], []);
    diff(t, todayFrom(8, 10), [todayFrom(8, 9), todayFrom(9, 10)], []);
    diff(t, todayFrom(8, 12), [todayFrom(8, 10), todayFrom(9, 11), todayFrom(10, 13)], []);
    t.end();
  });

  test('Interval#difference returns the outside parts when engulfing another interval', t => {
    diff(t, todayFrom(8, 12), [todayFrom(9, 11)], [todayFrom(8, 9), todayFrom(11, 12)]);
    diff(t, todayFrom(8, 12), [todayFrom(9, 10), todayFrom(10, 11)], [todayFrom(8, 9), todayFrom(11, 12)]);
    t.end();
  });

  test('Interval#difference allows holes', t => {
    diff(t, todayFrom(8, 13),
         [todayFrom(9, 10), todayFrom(11, 12)],
         [todayFrom(8, 9), todayFrom(10, 11), todayFrom(12, 13)]);
    t.end();
  });

  //-------
  // #engulfs()
  //-------

  //-------
  // #abutsStart()
  //-------

  //-------
  // #abutsEnd()
  //-------

  //-------
  // #splitAt()
  //-------

  test('Interval#splitAt breaks up the interval', t => {
    let split = todayFrom(8, 13).splitAt(todayAt(9), todayAt(11));
    t.is(split.length, 3);
    t.ok(split[0].equals(todayFrom(8, 9)));
    t.ok(split[1].equals(todayFrom(9, 11)));
    t.ok(split[2].equals(todayFrom(11, 13)));
    t.end();
  });

  //-------
  // #splitBy()
  //-------

  test('Interval#splitBy accepts a count and unit', t => {
    let split = todayFrom(8, 13).splitBy(2, 'hours');
    t.is(split.length, 3);
    t.ok(split[0].equals(todayFrom(8, 10)));
    t.ok(split[1].equals(todayFrom(10, 12)));
    t.ok(split[2].equals(todayFrom(12, 13)));
    t.end();
  });

  test('Interval#splitBy accepts a duration', t => {
    let split = todayFrom(8, 13).splitBy(Duration.fromObject({hours: 2}));
    t.is(split.length, 3);
    t.ok(split[0].equals(todayFrom(8, 10)));
    t.ok(split[1].equals(todayFrom(10, 12)));
    t.ok(split[2].equals(todayFrom(12, 13)));
    t.end();
  });

  //-------
  // #divideEqually()
  //-------
  test('Interval#divideEqually should split a 4 hour period into 4 contiguous 1-hour parts', t => {
    let split = todayFrom(5, 9).divideEqually(4);
    t.is(split.length, 4);
    t.ok(split[0].equals(todayFrom(5, 6)));
    t.ok(split[3].equals(todayFrom(8, 9)));
    t.end();
  });

  test('Interval#divideEqually should split a 1m30s into 3 30-second parts', t => {

    let after = (i, m, s) => Interval.after(i, Duration.fromObject({minutes: m, seconds: s})),
        split = after(todayAt(9), 1, 30).divideEqually(3);
    t.is(split.length, 3);
    t.ok(split[0].equals(after(todayAt(9), 0, 30)));
    t.ok(split[2].equals(after(todayAt(9).plus(1, 'minute'), 0, 30)));
    t.end();
  });

  test('Interval#divideEqually always gives you the right number of parts', t => {
    let int = Interval.after(todayAt(9), 7, 'minutes'),
        split = int.divideEqually(17);
    t.is(split.length, 17);
    t.end();
  });
};
