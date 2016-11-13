import test from 'tape';
import {Instant} from 'luxon';

export let getters = () => {

  let instant = Instant.fromJSDate(new Date(1982, 4, 25, 9, 23, 54, 123)),
      utc = Instant.fromMillis(Date.UTC(1982, 4, 25, 9, 23, 54, 123)).utc();

  //------
  // year/month/day/hour/minute/second/millisecond
  //-------

  test('instant#year() returns the year', t => {
    t.is(instant.year(), 1982);
    t.is(utc.year(), 1982);
    t.end();
  });

  test('instant#month() returns the (1-indexed) month', t => {
    t.is(instant.month(), 5);
    t.is(utc.month(), 5);
    t.end();
  });

  test('instant#day() returns the day', t => {
    t.is(instant.day(), 25);
    t.is(utc.day(), 25);
    t.end();
  });

  test('instant#hour() returns the hour', t => {
    t.is(instant.hour(), 9);
    t.is(utc.hour(), 9);
    t.end();
  });

  test('instant#minute() returns the minute', t => {
    t.is(instant.minute(), 23);
    t.is(utc.minute(), 23);
    t.end();
  });

  test('instant#second() returns the second', t => {
    t.is(instant.second(), 54);
    t.is(utc.second(), 54);
    t.end();
  });

  test('instant#millisecond() returns the millisecond', t => {
    t.is(instant.millisecond(), 123);
    t.is(utc.millisecond(), 123);
    t.end();
  });

  //------
  // locale
  //-------
  test('instant#locale() returns the locale', t => {
    let i = Instant.now().locale('be');
    t.is(i.locale(), 'be');
    t.end();
  });
};
