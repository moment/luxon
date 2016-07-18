import test from 'tape';
import {Instant} from 'luxon';
import {FakePT} from '../helpers/fakePT';

export let create = () => {

  //------
  // .now()
  //-------

  test("Instant.now has today's date", t => {
    let now = Instant.now();
    t.is(now.toJSDate().getDate(), new Date().getDate());
    t.end();
  });

  //------
  // .fromJSDate()
  //-------

  test('Instant.fromJSDate(date) reflects the date', t => {
    let date = new Date(1982, 4, 25),
        instant = Instant.fromJSDate(date);
    t.is(instant.toJSDate().valueOf(), date.valueOf());
    t.end();
  });

  test('Instant.fromJSDate(date) clones the date', t => {
    let date = new Date(1982, 4, 25),
        instant = Instant.fromJSDate(date),
        oldValue = instant.valueOf();

    date.setDate(14);
    t.is(instant.toJSDate().valueOf(), oldValue);

    date.setDate(12);
    t.is(instant.toJSDate().valueOf(), oldValue);
    t.end();
  });

  //------
  // .fromMillis()
  //-------

  test('Instant.fromMillis(ms) has a value of ms', t => {
    let value = 391147200000,
        instant = Instant.fromMillis(value);

    t.is(instant.valueOf(), value);
    t.end();
  });

  //------
  // .fromUnix()
  //-------

  test('Instant.fromUnix(secs) has a value of 1000 * secs', t => {
    let value = 391147200,
        instant = Instant.fromUnix(value);

    t.is(instant.valueOf(), value * 1000);
    t.end();
  });

  //------
  // .fromObject()
  //-------

  let baseObject = {
    year: 1982,
    month: 5,
    day: 25,
    hour: 9,
    minute: 23,
    second: 54,
    millisecond: 123
  };

  test('Instant.fromObject() sets all the fields', t => {

    let instant = Instant.fromObject(baseObject);

    t.is(instant.isOffsetFixed(), false);
    t.is(instant.year(), 1982);
    t.is(instant.month(), 5);
    t.is(instant.day(), 25);
    t.is(instant.hour(), 9);
    t.is(instant.minute(), 23);
    t.is(instant.second(), 54);
    t.is(instant.millisecond(), 123);
    t.end();
  });

  test('Instant.fromObject() takes a UTC option', t => {

    let instant = Instant.fromObject(baseObject, {utc: true});

    t.is(instant.isOffsetFixed(), true);
    t.is(instant.year(), 1982);
    t.is(instant.month(), 5);
    t.is(instant.day(), 25);
    t.is(instant.hour(), 9);
    t.is(instant.minute(), 23);
    t.is(instant.second(), 54);
    t.is(instant.millisecond(), 123);
    t.end();
  });

  test('Instant.fromObject() takes a zone option', t => {

    let daylight = Instant.fromObject(Object.assign({}, baseObject, {month: 5}), {zone: new FakePT()}),
        standard = Instant.fromObject(Object.assign({}, baseObject, {month: 12}), {zone: new FakePT()});

    t.is(daylight.isOffsetFixed(), false);
    t.is(daylight.offset(), -7 * 60);
    t.is(daylight.year(), 1982);
    t.is(daylight.month(), 5);
    t.is(daylight.day(), 25);
    t.is(daylight.hour(), 9);
    t.is(daylight.minute(), 23);
    t.is(daylight.second(), 54);
    t.is(daylight.millisecond(), 123);

    t.is(standard.isOffsetFixed(), false);
    t.is(standard.offset(), -8 * 60);
    t.is(standard.year(), 1982);
    t.is(standard.month(), 12);
    t.is(standard.day(), 25);
    t.is(standard.hour(), 9);
    t.is(standard.minute(), 23);
    t.is(standard.second(), 54);
    t.is(standard.millisecond(), 123);
    t.end();
  });

  test('Instant.fromObject() defaults high-order values to the current date', t => {

    let instant = Instant.fromObject({}),
        now = Instant.now();

    t.is(instant.year(), now.year());
    t.is(instant.month(), now.month());
    t.is(instant.day(), now.day());
    t.end();
  });

  test('Instant.fromObject() defaults lower-order values to 0', t => {

    let instant = Instant.fromObject({});

    t.is(instant.hour(), 0),
    t.is(instant.minute(), 0),
    t.is(instant.second(), 0),
    t.is(instant.millisecond(), 0);
    t.end();
  });
};
