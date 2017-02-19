import {Duration} from '../../dist/cjs/luxon';

let dur = () => Duration.fromObject({years: 1, months: 2, days: 3, hours: 4, minutes: 5, seconds: 6, milliseconds: 7});

//------
// #toISO()
//------

test('Duration#toISO fills out every field', () => {
  expect(dur().toISO()).toBe('P1Y2M3DT4H5M6S');
});

test('Duration#toISO creates a minimal string', () => {
  expect(Duration.fromObject({years: 3, seconds: 45}).toISO()).toBe('P3YT45S');
  expect(Duration.fromObject({months: 4, seconds: 45}).toISO()).toBe('P4MT45S');
  expect(Duration.fromObject({months: 5}).toISO()).toBe('P5M');
  expect(Duration.fromObject({minutes: 5}).toISO()).toBe('PT5M');
});

//------
// #toFormatString()
//------


test("Duration#toFormatString('S') returns milliseconds", () => {
  expect(dur().toFormatString('S')).toBe('36993906007');

  let lil = Duration.fromLength(5, 'milliseconds');
  expect(lil.toFormatString('S')).toBe('5');
  expect(lil.toFormatString('SS')).toBe('05');
  expect(lil.toFormatString('SSSSS')).toBe('00005');
});

test("Duration#toFormatString('s') returns seconds", () => {
  expect(dur().toFormatString('s')).toBe('36993906');
  expect(dur().toFormatString('s', {round: false})).toBe('36993906.007');
  expect(dur().toFormatString('s.SSS')).toBe('36993906.007');
});

test("Duration#toFormatString('m') returns minutes", () => {
  expect(dur().toFormatString('m')).toBe('616565');
  expect(dur().toFormatString('m', {round: false})).toBe('616565.1');
  expect(dur().toFormatString('m:ss')).toBe('616565:06');
  expect(dur().toFormatString('m:ss.SSS')).toBe('616565:06.007');
});

test("Duration#toFormatString('h') returns hours", () => {
  expect(dur().toFormatString('h')).toBe('10276');
  expect(dur().toFormatString('h', {round: false})).toBe('10276.085');
  expect(dur().toFormatString('h:ss')).toBe('10276:306');
  expect(dur().toFormatString('h:mm:ss.SSS')).toBe('10276:05:06.007');
});

test("Duration#toFormatString('d') returns days", () => {
  expect(dur().toFormatString('d')).toBe('428');
  expect(dur().toFormatString('d', {round: false})).toBe('428.17');
  expect(dur().toFormatString('d:h:ss')).toBe('428:4:306');
  expect(dur().toFormatString('d:h:mm:ss.SSS')).toBe('428:4:05:06.007');
});

test("Duration#toFormatString('M') returns months", () => {
  expect(dur().toFormatString('M')).toBe('14');
  expect(dur().toFormatString('M', {round: false})).toBe('14.106');
  expect(dur().toFormatString('M:s')).toBe('14:273906');
  expect(dur().toFormatString('M:dd:h:mm:ss.SSS')).toBe('14:03:4:05:06.007');
});

test("Duration#toFormatString('y') returns years", () => {
  expect(dur().toFormatString('y')).toBe('1');
  expect(dur().toFormatString('y', {round: false})).toBe('1.175');
  expect(dur().toFormatString('y:m')).toBe('1:90965');
  expect(dur().toFormatString('y:M:dd:h:mm:ss.SSS')).toBe('1:2:03:4:05:06.007');

  let lil = Duration.fromLength(5, 'years');
  expect(lil.toFormatString('y')).toBe('5');
  expect(lil.toFormatString('yy')).toBe('05');
  expect(lil.toFormatString('yyyyy')).toBe('00005');
});

test('Duration#toFormatString leaves in zeros', () => {
  let tiny = Duration.fromLength(5, 'seconds');
  expect(tiny.toFormatString('hh:mm:ss')).toBe('00:00:05');
  expect(tiny.toFormatString('hh:mm:ss.SSS')).toBe('00:00:05.000');
});

test('Duration#toFormatString localizes the numbers', () => {
  expect(dur().locale('bn').toFormatString('yy:MM:dd:h:mm:ss.SSS')).toBe('০১:০২:০৩:৪:০৫:০৬.০০৭');
});
