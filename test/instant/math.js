import test from 'tape';
import {Instant} from 'luxon';

function createInstant(){
  return Instant.fromObject({
    year: 2010,
    month: 2,
    day: 3,
    hour: 4,
    minute: 5,
    second: 6,
    millisecond: 7
  });
}

export let math = () => {

  //------
  // #plus()
  //------

  test("Instant#plus(1, 'year') adds a year", t => {
    let i = createInstant().plus(1, 'years');
    t.is(i.year(), 2011);
    t.end();
  });

  //------
  // #minus()
  //------

  test("Instant#minus(1, 'year') subtracts a year", t => {
    let i = createInstant().minus(1, 'year');
    t.is(i.year(), 2009);
    t.end();
  });

  //------
  // #startOf()
  //------

  test("Instant#startOf('year') goes to the start of the year", t => {
    let i = createInstant().startOf('year');

    t.is(i.year(), 2010);

    t.is(i.month(), 1);
    t.is(i.day(), 1);
    t.is(i.hour(), 0);
    t.is(i.minute(), 0);
    t.is(i.second(), 0);
    t.is(i.millisecond(), 0);
    t.end();
  });

  test("Instant#startOf('month') goes to the start of the month", t => {
    let i = createInstant().startOf('month');

    t.is(i.year(), 2010);
    t.is(i.month(), 2);

    t.is(i.day(), 1);
    t.is(i.hour(), 0);
    t.is(i.minute(), 0);
    t.is(i.second(), 0);
    t.is(i.millisecond(), 0);
    t.end();
  });

  test("Instant#startOf('day') goes to the start of the day", t => {
    let i = createInstant().startOf('day');

    t.is(i.year(), 2010);
    t.is(i.month(), 2);
    t.is(i.day(), 3);

    t.is(i.hour(), 0);
    t.is(i.minute(), 0);
    t.is(i.second(), 0);
    t.is(i.millisecond(), 0);
    t.end();
  });

  test("Instant#startOf('hour') goes to the start of the hour", t => {
    let i = createInstant().startOf('hour');

    t.is(i.year(), 2010);
    t.is(i.month(), 2);
    t.is(i.day(), 3);
    t.is(i.hour(), 4);

    t.is(i.minute(), 0);
    t.is(i.second(), 0);
    t.is(i.millisecond(), 0);
    t.end();
  });

  test("Instant#startOf('minute') goes to the start of the minute", t => {
    let i = createInstant().startOf('minute');

    t.is(i.year(), 2010);
    t.is(i.month(), 2);
    t.is(i.day(), 3);
    t.is(i.hour(), 4);
    t.is(i.minute(), 5);

    t.is(i.second(), 0);
    t.is(i.millisecond(), 0);
    t.end();
  });

  test("Instant#startOf('second') goes to the start of the second", t => {
    let i = createInstant().startOf('second');

    t.is(i.year(), 2010);
    t.is(i.month(), 2);
    t.is(i.day(), 3);
    t.is(i.hour(), 4);
    t.is(i.minute(), 5);
    t.is(i.second(), 6);

    t.is(i.millisecond(), 0);
    t.end();
  });

  //------
  // #endOf()
  //------

  test("Instant#endOf('year') goes to the start of the year", t => {
    let i = createInstant().endOf('year');

    t.is(i.year(), 2010);

    t.is(i.month(), 12);
    t.is(i.day(), 31);
    t.is(i.hour(), 23);
    t.is(i.minute(), 59);
    t.is(i.second(), 59);
    t.is(i.millisecond(), 999);
    t.end();
  });

  test("Instant#endOf('month') goes to the start of the month", t => {
    let i = createInstant().endOf('month');

    t.is(i.year(), 2010);
    t.is(i.month(), 2);

    t.is(i.day(), 28);
    t.is(i.hour(), 23);
    t.is(i.minute(), 59);
    t.is(i.second(), 59);
    t.is(i.millisecond(), 999);
    t.end();
  });

  test("Instant#endOf('day') goes to the start of the day", t => {
    let i = createInstant().endOf('day');

    t.is(i.year(), 2010);
    t.is(i.month(), 2);
    t.is(i.day(), 3);

    t.is(i.hour(), 23);
    t.is(i.minute(), 59);
    t.is(i.second(), 59);
    t.is(i.millisecond(), 999);
    t.end();
  });

  test("Instant#endOf('hour') goes to the start of the hour", t => {
    let i = createInstant().endOf('hour');

    t.is(i.year(), 2010);
    t.is(i.month(), 2);
    t.is(i.day(), 3);
    t.is(i.hour(), 4);

    t.is(i.minute(), 59);
    t.is(i.second(), 59);
    t.is(i.millisecond(), 999);
    t.end();
  });

  test("Instant#endOf('minute') goes to the start of the minute", t => {
    let i = createInstant().endOf('minute');

    t.is(i.year(), 2010);
    t.is(i.month(), 2);
    t.is(i.day(), 3);
    t.is(i.hour(), 4);
    t.is(i.minute(), 5);

    t.is(i.second(), 59);
    t.is(i.millisecond(), 999);
    t.end();
  });

  test("Instant#endOf('second') goes to the start of the second", t => {
    let i = createInstant().endOf('second');

    t.is(i.year(), 2010);
    t.is(i.month(), 2);
    t.is(i.day(), 3);
    t.is(i.hour(), 4);
    t.is(i.minute(), 5);
    t.is(i.second(), 6);

    t.is(i.millisecond(), 999);
    t.end();
  });
};
