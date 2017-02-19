import {Duration} from '../../dist/cjs/luxon';

//------
// years/months/days/hours/minutes/seconds/milliseconds
//-------

let dur = () => Duration.fromObject({years: 1, months: 1, days: 1, hours: 1, minutes: 1, seconds: 1, milliseconds: 1});

test('Duration#years() sets the years', () => {
  expect(dur().years(2).years()).toBe(2);
});

test('Duration#months() sets the months', () => {
  expect(dur().months(2).months()).toBe(2);
});

test('Duration#days() sets the days', () => {
  expect(dur().days(2).days()).toBe(2);
});

test('Duration#hours() sets the hours', () => {
  expect(dur().hours(4).hours()).toBe(4);
});

test('Duration#minutes() sets the minutes', () => {
  expect(dur().minutes(16).minutes()).toBe(16);
});

test('Duration#seconds() sets the seconds', () => {
  expect(dur().seconds(45).seconds()).toBe(45);
});

test('Duration#milliseconds() sets the milliseconds', () => {
  expect(dur().milliseconds(86).milliseconds()).toBe(86);
});
