import test from 'tape';
import {Instant} from 'luxon';
import {FakePT} from '../helpers/fakePT';
import {FakeET} from '../helpers/fakeET';

export let zone = () => {

  let millis = 391147200000, //1982-05-25T04:00:00.000Z
      instant = () => Instant.fromMillis(millis);

  //------
  // defaults
  //------

  test('timezone defaults to local', t => {
    let inst = instant();
    t.is(inst.isOffsetFixed(), false);
    t.end();
  });

  //------
  // #utc()
  //------

  test("Instant#utc() puts the instant in UTC 'mode'", t => {

    let zoned = instant().utc();

    t.is(zoned.valueOf(), millis);
    t.is(zoned.hour().valueOf(), 4);
    t.is(zoned.timezoneName(), 'UTC');
    t.is(zoned.isOffsetFixed(), true);
    t.is(zoned.isInDST(), false);
    t.end();
  });

  //------
  // #useUTCOffset()
  //------

  test("Instant#useUTCOffset() sets instant in UTC+offset 'mode'", t => {

    let zoned = instant().useUTCOffset(5 * 60);

    t.is(zoned.valueOf(), millis);
    t.is(zoned.hour().valueOf(), 9);
    t.is(zoned.timezoneName(), 'UTC+5');
    t.is(zoned.isOffsetFixed(), true);
    t.is(zoned.isInDST(), false);
    t.end();
  });

  //------
  // #local()
  //------

  test('Instant#local() sets the calendar back to local', t => {

    let relocaled = instant().utc().local(),
        expected = new Date(millis).getHours();

    t.is(relocaled.isOffsetFixed(), false);
    t.is(relocaled.valueOf(), millis);
    t.is(relocaled.hour(), expected);
    t.end();
  });

  //------
  // #rezone()
  //------


  test('rezone sets the TZ to the specified zone', t => {

    let zoned = instant().rezone(new FakePT());

    t.is(zoned.timezoneName(), 'Fake Pacific Time');
    t.is(zoned.isOffsetFixed(), false);
    t.is(zoned.valueOf(), millis);
    t.is(zoned.hour(), 21); //pacific daylight time
    t.is(zoned.isInDST(), true);
    t.end();
  });

  test('rezone accepts a keepCalendarTime option', t => {
    let zoned = instant().utc().rezone(new FakePT(), {keepCalendarTime: true});
    t.is(zoned.timezoneName(), 'Fake Pacific Time');
    t.is(zoned.year(), 1982);
    t.is(zoned.month(), 5);
    t.is(zoned.day(), 25);
    t.is(zoned.hour(), 4);
    t.is(zoned.isOffsetFixed(), false);

    let zonedMore = zoned.rezone(new FakeET(), {keepCalendarTime: true});
    t.is(zonedMore.timezoneName(), 'Fake Eastern Time');
    t.is(zonedMore.year(), 1982);
    t.is(zonedMore.month(), 5);
    t.is(zonedMore.day(), 25);
    t.is(zonedMore.hour(), 4);
    t.is(zonedMore.isOffsetFixed(), false);
    t.end();
  });

  //------
  // #isInDST()
  //------

  test('Instant#isInDST() returns false for pre-DST times', t => {
    let zoned = instant().rezone(new FakePT());
    t.is(zoned.month(1).isInDST(), false);
    t.end();
  });

  test('Instant#isInDST() returns true for during-DST times', t => {
    let zoned = instant().rezone(new FakePT());
    t.is(zoned.month(4).isInDST(), true);
    t.end();
  });

  test('Instant#isInDST() returns false for post-DST times', t => {
    let zoned = instant().rezone(new FakePT());
    t.is(zoned.month(12).isInDST(), false);
    t.end();
  });

  //------
  // timezone
  //------

  test('magic zones are magic', t => {

    //this will only work in Chrome/V8 for now
    let zoned = instant().timezone('Europe/Paris');

    t.is(zoned.timezoneName(), 'Europe/Paris');
    t.is(zoned.offsetNameShort(), 'GMT+2'); //not convinced this is universal. Could also be 'CEDT'
    t.is(zoned.offsetNameLong(), 'Central European Summer Time');
    t.is(zoned.valueOf(), millis);
    t.is(zoned.hour(), 6); //cedt is +2
    t.end();
  });
};
