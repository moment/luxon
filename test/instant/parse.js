import test from 'tape';
import {Instant} from 'luxon';

export let parse = () => {

  //------
  // .fromISO
  //-------

  test('Instant.fromISO() parses as local by default', t => {
    let inst = Instant.fromISO("2016-05-25T09:08:34.123");
    t.is(inst.zone.name(), null, "Still in the local zone");
    t.deepEqual(inst.toObject(), {year: 2016, month: 5, day: 25, hour: 9, minute: 8, second: 34, millisecond: 123});
    t.end();
  });

  test('Instant.fromISO() uses the offset provided, but keeps the instant as local', t => {
    let inst = Instant.fromISO("2016-05-25T09:08:34.123+06:00");
    t.is(inst.zone.name(), null, "Still in the local zone");
    t.deepEqual(inst.utc().toObject(), {year: 2016, month: 5, day: 25, hour: 3, minute: 8, second: 34, millisecond: 123});
    t.end();
  });

  test('Instant.fromISO() uses the Z if provided, but keeps the instant as local', t => {
    let inst = Instant.fromISO("2016-05-25T09:08:34.123Z");
    t.is(inst.zone.name(), null, "Still in the local zone");
    t.deepEqual(inst.utc().toObject(), {year: 2016, month: 5, day: 25, hour: 9, minute: 8, second: 34, millisecond: 123});
    t.end();
  });

  test('Instant.fromISO() optionally adopts the UTC offset provided', t => {
    let inst = Instant.fromISO("2016-05-25T09:08:34.123+06:00", {acceptOffset: true});
    t.is(inst.zone.name(), 'UTC+6');
    t.deepEqual(inst.toObject(), {year: 2016, month: 5, day: 25, hour: 9, minute: 8, second: 34, millisecond: 123});
    t.end();
  });

  test('Instant.fromISO() optionally considers the date UTC if not otherwise specified', t => {
    let inst = Instant.fromISO("2016-05-25T09:08:34.123", {assumeUTC: true});
    t.is(inst.zone.name(), null, "It's still a locale instant");
    t.deepEqual(inst.utc().toObject(), {year: 2016, month: 5, day: 25, hour: 9, minute: 8, second: 34, millisecond: 123});


    inst = Instant.fromISO("2016-05-25T09:08:34.123+06:00", {assumeUTC: true});
    t.is(inst.zone.name(), null, "It's still a locale instant");
    t.deepEqual(inst.utc().toObject(), {year: 2016, month: 5, day: 25, hour: 3, minute: 8, second: 34, millisecond: 123});
    t.end();
  });

  test('Instant.fromISO() accepts a variety of ISO formats', t => {

    let isSame = (s, expected) => t.deepEqual(Instant.fromISO(s, {assumeUTC: true}).utc().toObject(), expected);

    isSame("2016-05-25", {year: 2016, month: 5, day: 25, hour: 0, minute: 0, second: 0, millisecond: 0});
    isSame("20160525", {year: 2016, month: 5, day: 25, hour: 0, minute: 0, second: 0, millisecond: 0});
    isSame("2016-05-25T09", {year: 2016, month: 5, day: 25, hour: 9, minute: 0, second: 0, millisecond: 0});
    isSame("2016-05-25T09:24", {year: 2016, month: 5, day: 25, hour: 9, minute: 24, second: 0, millisecond: 0});
    isSame("2016-05-25T09:24:15", {year: 2016, month: 5, day: 25, hour: 9, minute: 24, second: 15, millisecond: 0});
    isSame("2016-05-25T09:24:15.123", {year: 2016, month: 5, day: 25, hour: 9, minute: 24, second: 15, millisecond: 123});
    isSame("2016-05-25T0924", {year: 2016, month: 5, day: 25, hour: 9, minute: 24, second: 0, millisecond: 0});
    isSame("2016-05-25T092415", {year: 2016, month: 5, day: 25, hour: 9, minute: 24, second: 15, millisecond: 0});
    isSame("2016-05-25T092415.123", {year: 2016, month: 5, day: 25, hour: 9, minute: 24, second: 15, millisecond: 123});
    isSame("2016-05-25T09:24:15,123", {year: 2016, month: 5, day: 25, hour: 9, minute: 24, second: 15, millisecond: 123});

    //these are formats that aren't technically valid but we parse anyway. Testing them more to document them
    isSame("2016-05-25T0924:15.123", {year: 2016, month: 5, day: 25, hour: 9, minute: 24, second: 15, millisecond: 123});
    isSame("2016-05-25T09:2415.123", {year: 2016, month: 5, day: 25, hour: 9, minute: 24, second: 15, millisecond: 123});

    t.end();
  });

  test('Instant.fromISO() rejects poop', t => {

    let rejects = (s) => t.notOk(Instant.fromISO(s));

    rejects(null);
    rejects('');
    rejects(' ');
    rejects('2016');
    rejects('2016-1');
    rejects('2016-1-15');
    rejects('2016-01-5');
    rejects('2016-05-25 08:34:34');
    rejects('2016-05-25Q08:34:34');
    rejects('2016-05-25T8:04:34');
    rejects('2016-05-25T08:4:34');
    rejects('2016-05-25T08:04:4');
    rejects('2016-05-25T:03:4');
    rejects('2016-05-25T08::4');

    //some of these are actually valid iso we don't take (yet)
    rejects('2016-08');
    rejects('2016-082');
    rejects('2016-W32');
    rejects('2016-W32-02');

    t.end();
  });
};
