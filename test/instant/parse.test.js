import {Instant} from '../../dist/cjs/luxon';

//------
// .fromISO
//-------

test('Instant.fromISO() parses as local by default', () => {
  let inst = Instant.fromISO("2016-05-25T09:08:34.123");
  expect(inst.toObject()).toEqual(
    {year: 2016, month: 5, day: 25, hour: 9, minute: 8, second: 34, millisecond: 123}
  );
});

test('Instant.fromISO() uses the offset provided, but keeps the instant as local', () => {
  let inst = Instant.fromISO("2016-05-25T09:08:34.123+06:00");
  expect(inst.utc().toObject()).toEqual(
    {year: 2016, month: 5, day: 25, hour: 3, minute: 8, second: 34, millisecond: 123}
  );
});

test('Instant.fromISO() uses the Z if provided, but keeps the instant as local', () => {
  let inst = Instant.fromISO("2016-05-25T09:08:34.123Z");
  expect(inst.utc().toObject()).toEqual(
    {year: 2016, month: 5, day: 25, hour: 9, minute: 8, second: 34, millisecond: 123}
  );
});

test('Instant.fromISO() optionally adopts the UTC offset provided', () => {
  let inst = Instant.fromISO("2016-05-25T09:08:34.123+06:00", {acceptOffset: true});
  expect(inst.zone.name).toBe('UTC+6');
  expect(inst.toObject()).toEqual(
    {year: 2016, month: 5, day: 25, hour: 9, minute: 8, second: 34, millisecond: 123}
  );
});

test('Instant.fromISO() optionally considers the date UTC if not otherwise specified', () => {
  let inst = Instant.fromISO("2016-05-25T09:08:34.123", {assumeUTC: true});
  expect(inst.utc().toObject()).toEqual(
    {year: 2016, month: 5, day: 25, hour: 9, minute: 8, second: 34, millisecond: 123}
  );

  inst = Instant.fromISO("2016-05-25T09:08:34.123+06:00", {assumeUTC: true});
  expect(inst.utc().toObject()).toEqual(
    {year: 2016, month: 5, day: 25, hour: 3, minute: 8, second: 34, millisecond: 123}
  );
});

test('Instant.fromISO() accepts a variety of ISO formats', () => {
  let isSame = (s, expected) => expect(Instant.fromISO(s, {assumeUTC: true}).utc().toObject()).toEqual(expected);

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
});

test('Instant.fromISO() rejects poop', () => {
  let rejects = (s) => expect(Instant.fromISO(s).isValid()).toBeFalsy();

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
});

//------
// .fromString
//-------

test('Instant.fromString() parses basic times', () => {
  let i = Instant.fromString('1982/05/25 09:10:11.445', 'yyyy/MM/dd HH:mm:ss.SSS');
  expect(i.year()).toBe(1982);
  expect(i.month()).toBe(5);
  expect(i.day()).toBe(25);
  expect(i.hour()).toBe(9);
  expect(i.minute()).toBe(10);
  expect(i.second()).toBe(11);
  expect(i.millisecond()).toBe(445);
});

test('Instant.fromString() parses meridiems', () => {
  let i = Instant.fromString('1982/05/25 9 PM', 'yyyy/MM/dd h a');
  expect(i.year()).toBe(1982);
  expect(i.month()).toBe(5);
  expect(i.day()).toBe(25);
  expect(i.hour()).toBe(21);

  i = Instant.fromString('1982/05/25 9 AM', 'yyyy/MM/dd h a');
  expect(i.year()).toBe(1982);
  expect(i.month()).toBe(5);
  expect(i.day()).toBe(25);
  expect(i.hour()).toBe(9);
});

test('Instant.fromString() parses eras', () => {});

test('Instant.fromString() parses month names', () => {
  let i = Instant.fromString('May 25 1982', 'LLLL dd yyyy');
  expect(i.year()).toBe(1982);
  expect(i.month()).toBe(5);
  expect(i.day()).toBe(25);

  i = Instant.fromString('Sep 25 1982', 'LLL dd yyyy');
  expect(i.year()).toBe(1982);
  expect(i.month()).toBe(9);
  expect(i.day()).toBe(25);

  i = Instant.fromString('mai 25 1982', 'LLLL dd yyyy', {localeCode: 'fr'});
  expect(i.year()).toBe(1982);
  expect(i.month()).toBe(5);
  expect(i.day()).toBe(25);
});

test('Instant.fromString() defaults yy to the right century', () => {});

test('Instant.fromString() parses offsets', () => {});

test('Instant.fromString() validates weekday names', () => {
  let i = Instant.fromString('Tuesday, 05/25/1982', 'EEEE, LL/dd/yyyy');
  expect(i.year()).toBe(1982);
  expect(i.month()).toBe(5);
  expect(i.day()).toBe(25);

  i = Instant.fromString('Monday, 05/25/1982', 'EEEE, LL/dd/yyyy');
  expect(i.isValid()).toBeFalsy();

  i = Instant.fromString('mardi, 05/25/1982', 'EEEE, LL/dd/yyyy', {localeCode: 'fr'});
  expect(i.year()).toBe(1982);
  expect(i.month()).toBe(5);
  expect(i.day()).toBe(25);
});

test('Instant.fromString() allows regex content', () => {});

test('Instant.fromString() allows literals', () => {});

test('Instant.fromString() returns invalid when unparsed', () => {});

test('Instant.fromString() returns invalid for out-of-range values', () => {
  let rejects = (s, fmt, opts = {}) => expect(Instant.fromString(s, fmt, opts).isValid()).toBeFalsy();

  rejects('Tuesday, 05/25/1982', 'EEEE, MM/dd/yyyy', {localeCode: 'fr'});
  rejects('Giberish, 05/25/1982', 'EEEE, MM/dd/yyyy');
  rejects('14/25/1982', 'MM/dd/yyyy');
  rejects('05/46/1982', 'MM/dd/yyyy');
});
