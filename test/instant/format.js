import test from 'tape';
import {Instant} from 'luxon';

export let format = () => {

  //------
  // #toISO()
  //-------

  let inst = Instant.fromObject({year: 1982, month: 5, day: 25, hour: 9, minute: 23, second: 54, millisecond: 123}, {utc: true});

  test("Instant#toISO() shows 'Z' for UTC", t => {
    t.is(inst.toISO(), '1982-05-25T09:23:54.123Z');
    t.end();
  });

  test("Instant#toISO() shows the offset", t => {
    let offsetted = inst.useUTCOffset(-6 * 60);
    t.is(offsetted.toISO(), '1982-05-25T03:23:54.123-06:00');
    t.end();
  });
};
