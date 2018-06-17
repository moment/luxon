/* global test expect */
import { Duration } from '../../src/luxon';

const dur = () =>
  Duration.fromObject({
    years: 1,
    months: 2,
    days: 3,
    hours: 4,
    minutes: 5,
    seconds: 6,
    milliseconds: 7
  });

//------
// #toISO()
//------
test('Duration#toISO fills out every field', () => {
  expect(dur().toISO()).toBe('P1Y2M3DT4H5M6S');
});

test('Duration#toISO creates a minimal string', () => {
  expect(Duration.fromObject({ years: 3, seconds: 45 }).toISO()).toBe('P3YT45S');
  expect(Duration.fromObject({ months: 4, seconds: 45 }).toISO()).toBe('P4MT45S');
  expect(Duration.fromObject({ months: 5 }).toISO()).toBe('P5M');
  expect(Duration.fromObject({ minutes: 5 }).toISO()).toBe('PT5M');
});

test('Duration#toISO handles negative durations', () => {
  expect(Duration.fromObject({ years: -3, seconds: -45 }).toISO()).toBe('P3YT45S');
});

test('Duration#toISO handles mixed negative/positive durations', () => {
  expect(Duration.fromObject({ years: 3, seconds: -45 }).toISO()).toBe('P2YT31535955S');
});

test('Duration#toISO returns null for invalid durations', () => {
  expect(Duration.invalid('because').toISO()).toBe(null);
});

//------
// #toJSON()
//------

test('Duration#toJSON returns the ISO representation', () => {
  expect(dur().toJSON()).toBe(dur().toISO());
});

//------
// #toString()
//------

test('Duration#toString returns the ISO representation', () => {
  expect(dur().toString()).toBe(dur().toISO());
});

//------
// #toFormat()
//------
test("Duration#toFormat('S') returns milliseconds", () => {
  expect(dur().toFormat('S')).toBe('36993906007');

  const lil = Duration.fromMillis(5);
  expect(lil.toFormat('S')).toBe('5');
  expect(lil.toFormat('SS')).toBe('05');
  expect(lil.toFormat('SSSSS')).toBe('00005');
});

test("Duration#toFormat('s') returns seconds", () => {
  expect(dur().toFormat('s')).toBe('36993906');
  expect(dur().toFormat('s', { floor: false })).toBe('36993906.007');
  expect(dur().toFormat('s.SSS')).toBe('36993906.007');
});

test("Duration#toFormat('m') returns minutes", () => {
  expect(dur().toFormat('m')).toBe('616565');
  expect(dur().toFormat('m', { floor: false })).toBe('616565.1');
  expect(dur().toFormat('m:ss')).toBe('616565:06');
  expect(dur().toFormat('m:ss.SSS')).toBe('616565:06.007');
});

test("Duration#toFormat('h') returns hours", () => {
  expect(dur().toFormat('h')).toBe('10276');
  expect(dur().toFormat('h', { floor: false })).toBe('10276.085');
  expect(dur().toFormat('h:ss')).toBe('10276:306');
  expect(dur().toFormat('h:mm:ss.SSS')).toBe('10276:05:06.007');
});

test("Duration#toFormat('d') returns days", () => {
  expect(dur().toFormat('d')).toBe('428');
  expect(dur().toFormat('d', { floor: false })).toBe('428.17');
  expect(dur().toFormat('d:h:ss')).toBe('428:4:306');
  expect(dur().toFormat('d:h:mm:ss.SSS')).toBe('428:4:05:06.007');
});

test("Duration#toFormat('M') returns months", () => {
  expect(dur().toFormat('M')).toBe('14');
  expect(dur().toFormat('M', { floor: false })).toBe('14.106');
  expect(dur().toFormat('M:s')).toBe('14:273906');
  expect(dur().toFormat('M:dd:h:mm:ss.SSS')).toBe('14:03:4:05:06.007');
});

test("Duration#toFormat('y') returns years", () => {
  expect(dur().toFormat('y')).toBe('1');
  expect(dur().toFormat('y', { floor: false })).toBe('1.175');
  expect(dur().toFormat('y:m')).toBe('1:90965');
  expect(dur().toFormat('y:M:dd:h:mm:ss.SSS')).toBe('1:2:03:4:05:06.007');

  const lil = Duration.fromObject({ years: 5 });
  expect(lil.toFormat('y')).toBe('5');
  expect(lil.toFormat('yy')).toBe('05');
  expect(lil.toFormat('yyyyy')).toBe('00005');
});

test("Duration#toFormat accepts the deprecated 'round' option", () => {
  expect(dur().toFormat('s', { round: false })).toBe('36993906.007');
  expect(dur().toFormat('m', { round: false })).toBe('616565.1');
  expect(dur().toFormat('h', { round: false })).toBe('10276.085');
  expect(dur().toFormat('d', { round: false })).toBe('428.17');
  expect(dur().toFormat('M', { round: false })).toBe('14.106');
  expect(dur().toFormat('y', { round: false })).toBe('1.175');
});

test('Duration#toFormat leaves in zeros', () => {
  const tiny = Duration.fromObject({ seconds: 5 });
  expect(tiny.toFormat('hh:mm:ss')).toBe('00:00:05');
  expect(tiny.toFormat('hh:mm:ss.SSS')).toBe('00:00:05.000');
});

test('Duration#toFormat rounds down', () => {
  const tiny = Duration.fromObject({ seconds: 5.7 });
  expect(tiny.toFormat('s')).toBe('5');

  const unpromoted = Duration.fromObject({ seconds: 59.7 });
  expect(unpromoted.toFormat('mm:ss')).toBe('00:59');
});

test('Duration#toFormat localizes the numbers', () => {
  expect(
    dur()
      .reconfigure({ locale: 'bn' })
      .toFormat('yy:MM:dd:h:mm:ss.SSS')
  ).toBe('০১:০২:০৩:৪:০৫:০৬.০০৭');
});

test('Duration#toFormat returns a lame string for invalid durations', () => {
  expect(Duration.invalid('because').toFormat('yy')).toBe('Invalid Duration');
});
