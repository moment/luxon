import test from 'tape';
import {Instant, Interval, Duration} from 'luxon';

export let many = () => {

  let fromISOs = (s, e, opts = {}) => Instant.fromISO(s).until(Instant.fromISO(e), opts),
      todayAt = (h) => Instant.now().startOf('day').hour(h),
      todayFrom = (h1, h2, opts) => Interval.fromInstants(todayAt(h1), todayAt(h2), opts);

  //------
  // .equals()
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

  test('Interval#equals returns false if the openness is different', t => {
    let start = '2016-10-14',
        end = '2016-10-15',
        from = (s, e) => fromISOs(start, end, {openStart: s, openEnd: e}),
        quick = (s1, e1, s2, e2) => from(s1, e1).equals(from(s2, e2));

    t.ok(quick(false, false, false, false));
    t.notOk(quick(false, false, false, true));
    t.notOk(quick(false, false, true, false));
    t.notOk(quick(false, false, true, true));
    t.notOk(quick(false, true, false, false));
    t.ok(quick(false, true, false, true));
    t.notOk(quick(false, true, true, false));
    //not gonna do all 16
    t.ok(quick(true, true, true, true));
    t.end();
  });

  //------
  // .union()
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

  test('Interval#union inherits the openness of the interval', t => {
    t.notOk(todayFrom(5, 8).union(todayFrom(8, 10, {openStart: true})).openStart);
    t.notOk(todayFrom(5, 8).union(todayFrom(8, 10, {openEnd: true})).openEnd);
    t.ok(todayFrom(5, 8, {openStart: true}).union(todayFrom(8, 10)).openStart);
    t.ok(todayFrom(5, 8, {openEnd: true}).union(todayFrom(8, 10)).openEnd);
    t.end();
  });

  //------
  // .intersection()
  //-------

  //------
  // .xor()
  //-------

  //------
  // .engulfs()
  //-------

  //------
  // .abutsStart()
  //-------

  //------
  // .abutsEnd()
  //-------

  //------
  // .split()
  //-------

  //------
  // .divideEqually()
  //-------
};
