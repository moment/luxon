import test from 'tape';
import {Instant} from 'luxon';

export let setters = () => {

  let instant = () => Instant.fromJSDate(new Date(1982, 4, 25, 9, 23, 54, 123));

  //------
  // year/month/day/hour/minute/second/millisecond
  //-------

  test('Instant#year() sets the year', t => {
    t.is(instant().year(2012).year(), 2012);
    t.end();
  });

  test('Instant#month() sets the (1-indexed) month', t => {
    t.is(instant().month(2).month(), 2);
    t.is(instant().month(2).hour(), 9); //this will cross a DST for many people
    t.end();
  });

  test('Instant#day() sets the day', t => {
    t.is(instant().day(5).day(), 5);
    t.end();
  });

  test('Instant#hour() sets the hour', t => {
    t.is(instant().hour(4).hour(), 4);
    t.end();
  });

  test('Instant#minute() sets the minute', t => {
    t.is(instant().minute(16).minute(), 16);
    t.end();
  });

  test('Instant#second() sets the second', t => {
    t.is(instant().second(45).second(), 45);
    t.end();
  });

  test('Instant#millisecond() sets the millisecond', t => {
    t.is(instant().millisecond(86).millisecond(), 86);
    t.end();
  });
};
