/* global test expect */
import {DateTime,  Interval} from '../../dist/cjs/luxon';

const fromISOs = (s, e) => DateTime.fromISO(s, {setZone: true}).until(DateTime.fromISO(e, {setZone: true})),
      interval = fromISOs('1982-05-25T09:00Z', '1983-10-14T13:30Z');

//------
// .toString()
//------

test('Interval#toString returns a simple range format', () =>
     expect(interval.toString()).toBe('[1982-05-25T09:00:00.000Z – 1983-10-14T13:30:00.000Z)'));

//------
// .toISO()
//------

test('Interval#toISO returns a simple ISO format', () =>
     expect(interval.toISO()).toBe('1982-05-25T09:00:00.000Z/1983-10-14T13:30:00.000Z'));

test('Interval#toISO accepts ISO options', () =>
     expect(interval.toISO({ suppressSeconds: true })).toBe('1982-05-25T09:00Z/1983-10-14T13:30Z'));

//------
// .toFormat()
//------

test('Interval#toFormat accepts date formats', () => {
  expect(interval.toFormat('EEE, LLL dd, yyyy')).toBe('Tue, May 25, 1982 – Fri, Oct 14, 1983');
  expect(interval.toFormat('HH:mm')).toBe('09:00 – 13:30');
});

test('Interval#toFormat accepts date formats', () => {
  expect(interval.toFormat('EEE, LLL dd, yyyy', { separator: ' until ' })).toBe('Tue, May 25, 1982 until Fri, Oct 14, 1983');
});
