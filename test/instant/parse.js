import test from 'tape';
import {Instant} from 'luxon';

export let parse = () => {

  //------
  // .fromISO
  //-------

  test('Instant.fromISO() parses as local by default', t => {
    let inst = Instant.fromISO("2016-05-25T09:08:34.123");
    t.deepEqual(inst.toObject(), {year: 2016, month: 5, day: 25, hour: 9, minute: 8, second: 34, millisecond: 123});
    t.end();
  });

  test('Instant.fromISO() uses the offset provided, but keeps the instant as local', t => {
    let inst = Instant.fromISO("2016-05-25T09:08:34.123+06:00");
    t.deepEqual(inst.utc().toObject(), {year: 2016, month: 5, day: 25, hour: 3, minute: 8, second: 34, millisecond: 123});
    t.end();
  });

  test('Instant.fromISO() uses the Z if provided, but keeps the instant as local', t => {
    let inst = Instant.fromISO("2016-05-25T09:08:34.123Z");
    t.deepEqual(inst.utc().toObject(), {year: 2016, month: 5, day: 25, hour: 9, minute: 8, second: 34, millisecond: 123});
    t.end();
  });

  test('Instant.fromISO() optionally adopts the UTC offset provided', t => {
    let inst = Instant.fromISO("2016-05-25T09:08:34.123+06:00", {acceptOffset: true});
    t.is(inst.zone.name, 'UTC+6');
    t.deepEqual(inst.toObject(), {year: 2016, month: 5, day: 25, hour: 9, minute: 8, second: 34, millisecond: 123});
    t.end();
  });

  test('Instant.fromISO() optionally considers the date UTC if not otherwise specified', t => {
    let inst = Instant.fromISO("2016-05-25T09:08:34.123", {assumeUTC: true});
    t.deepEqual(inst.utc().toObject(), {year: 2016, month: 5, day: 25, hour: 9, minute: 8, second: 34, millisecond: 123});

    inst = Instant.fromISO("2016-05-25T09:08:34.123+06:00", {assumeUTC: true});
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

    //these are formats that aren't technically valid but we parse anyway. Testing them more to document them than anything else
    isSame("2016-05-25T0924:15.123", {year: 2016, month: 5, day: 25, hour: 9, minute: 24, second: 15, millisecond: 123});
    isSame("2016-05-25T09:2415.123", {year: 2016, month: 5, day: 25, hour: 9, minute: 24, second: 15, millisecond: 123});

    t.end();
  });

  test('Instant.fromISO() rejects poop', t => {

    let rejects = (s) => t.notOk(Instant.fromISO(s).isValid());

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

  //------
  // .fromString
  //-------

  test('Instant.fromString() parses basic times', t => {
    let i = Instant.fromString('1982/05/25 09:10:11.445', 'yyyy/MM/dd HH:mm:ss.SSS');
    t.is(i.year(), 1982);
    t.is(i.month(), 5);
    t.is(i.day(), 25);
    t.is(i.hour(), 9);
    t.is(i.minute(), 10);
    t.is(i.second(), 11);
    t.is(i.millisecond(), 445);
    t.end();
  });

  test('Instant.fromString() parses meridiems', t => {

    let i = Instant.fromString('1982/05/25 9 PM', 'yyyy/MM/dd h a');
    t.is(i.year(), 1982);
    t.is(i.month(), 5);
    t.is(i.day(), 25);
    t.is(i.hour(), 21);

    i = Instant.fromString('1982/05/25 9 AM', 'yyyy/MM/dd h a');
    t.is(i.year(), 1982);
    t.is(i.month(), 5);
    t.is(i.day(), 25);
    t.is(i.hour(), 9);

    t.end();
  });

  test('Instant.fromString() parses eras', t => {
    t.end();
  });

  test('Instant.fromString() parses month names', t => {
    let i = Instant.fromString('May 25 1982', 'LLLL dd yyyy');
    t.is(i.year(), 1982);
    t.is(i.month(), 5);
    t.is(i.day(), 25);

    i = Instant.fromString('Sep 25 1982', 'LLL dd yyyy');
    t.is(i.year(), 1982);
    t.is(i.month(), 9);
    t.is(i.day(), 25);

    i = Instant.fromString('mai 25 1982', 'LLLL dd yyyy', {localeCode: 'fr'});
    t.is(i.year(), 1982);
    t.is(i.month(), 5);
    t.is(i.day(), 25);

    t.end();
  });

  test('Instant.fromString() defaults yy to the right century', t => {
    t.end();
  });

  test('Instant.fromString() parses offsets', t => {
    t.end();
  });

  test('Instant.fromString() validates weekday names', t => {
    let i = Instant.fromString('Tuesday, 05/25/1982', 'EEEE, LL/dd/yyyy');
    t.is(i.year(), 1982);
    t.is(i.month(), 5);
    t.is(i.day(), 25);

    i = Instant.fromString('Monday, 05/25/1982', 'EEEE, LL/dd/yyyy');
    t.notOk(i.isValid());

    i = Instant.fromString('mardi, 05/25/1982', 'EEEE, LL/dd/yyyy', {localeCode: 'fr'});
    t.is(i.year(), 1982);
    t.is(i.month(), 5);
    t.is(i.day(), 25);

    t.end();
  });

  test('Instant.fromString() allows regex content', t => {
    t.end();
  });

  test('Instant.fromString() allows literals', t => {
    t.end();
  });

  test('Instant.fromString() returns invalid when unparsed', t => {
    t.end();
  });

  test('Instant.fromString() returns invalid for out-of-range values', t => {

    let rejects = (s, fmt, opts = {}) => t.notOk(Instant.fromString(s, fmt, opts).isValid(), opts);

    rejects('Tuesday, 05/25/1982', 'EEEE, MM/dd/yyyy', {localeCode: 'fr'});
    rejects('Giberish, 05/25/1982', 'EEEE, MM/dd/yyyy');
    rejects('14/25/1982', 'MM/dd/yyyy');
    rejects('05/46/1982', 'MM/dd/yyyy');

    t.end();
  });

};
