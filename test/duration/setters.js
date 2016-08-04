import test from 'tape';
import {Instant, Duration} from 'luxon';

export let setters = () => {

  //------
  // years/months/days/hours/minutes/seconds/milliseconds
  //-------

  let dur = () => Duration.fromObject({years: 1, months: 1, days: 1, hours: 1, minutes: 1, seconds: 1, milliseconds: 1});

  test('Duration#years() sets the years', t => {
    t.is(dur().years(2).years(), 2);
    t.end();
  });

  test('Duration#months() sets the months', t => {
    t.is(dur().months(2).months(), 2);
    t.end();
  });

  test('Duration#days() sets the days', t => {
    t.is(dur().days(2).days(), 2);
    t.end();
  });

  test('Duration#hours() sets the hours', t => {
    t.is(dur().hours(4).hours(), 4);
    t.end();
  });

  test('Duration#minutes() sets the minutes', t => {
    t.is(dur().minutes(16).minutes(), 16);
    t.end();
  });

  test('Duration#seconds() sets the seconds', t => {
    t.is(dur().seconds(45).seconds(), 45);
    t.end();
  });

  test('Duration#milliseconds() sets the milliseconds', t => {
    t.is(dur().milliseconds(86).milliseconds(), 86);
    t.end();
  });
};
