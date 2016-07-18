import test from 'tape';
import {Duration} from 'luxon';

export let math = () => {

  //------
  // #plus()
  //------

  test("Duration#plus add straightforward durations", t => {
    let first = Duration.fromObject({hours: 4, minutes: 12, seconds: 2}),
        second = Duration.fromObject({hours: 1, seconds: 6, milliseconds: 14}),
        result = first.plus(second);

    t.is(result.hours(), 5);
    t.is(result.minutes(), 12);
    t.is(result.seconds(), 8);
    t.is(result.milliseconds(), 14);
    t.end();
  });

  test("Duration#plus adds negatives", t => {
    let first = Duration.fromObject({hours: 4, minutes: -12, seconds: -2}),
        second = Duration.fromObject({hours: -5, seconds: 6, milliseconds: 14}),
        result = first.plus(second);

    t.is(result.hours(), -1);
    t.is(result.minutes(), -12);
    t.is(result.seconds(), 4);
    t.is(result.milliseconds(), 14);
    t.end();
  });

  test("Duration#plus adds single values", t => {
    let first = Duration.fromObject({hours: 4, minutes: 12, seconds: 2}),
        result = first.plus(5, 'minutes');

    t.is(result.hours(), 4);
    t.is(result.minutes(), 17);
    t.is(result.seconds(), 2);
    t.end();
  });

  //------
  // #minus()
  //------

  test("Duration#minus subtracts durations", t => {

    let first = Duration.fromObject({hours: 4, minutes: 12, seconds: 2}),
        second = Duration.fromObject({hours: 1, seconds: 6, milliseconds: 14}),
        result = first.minus(second);

    t.is(result.hours(), 3);
    t.is(result.minutes(), 12);
    t.is(result.seconds(), -4);
    t.is(result.milliseconds(), -14);
    t.end();
  });

  test("Duration#minus subtracts single values", t => {
    let first = Duration.fromObject({hours: 4, minutes: 12, seconds: 2}),
        result = first.minus(5, 'minutes');

    t.is(result.hours(), 4);
    t.is(result.minutes(), 7);
    t.is(result.seconds(), 2);
    t.end();
  });
};
