import test from 'tape';
import {Instant} from 'luxon';

export let format = () => {

  //------
  // #toISO()
  //-------

  let inst = () => Instant.fromObject({year: 1982, month: 5, day: 25, hour: 9, minute: 23, second: 54, millisecond: 123}, {utc: true});

  test("Instant#toISO() shows 'Z' for UTC", t => {
    t.is(inst().toISO(), '1982-05-25T09:23:54.123Z');
    t.end();
  });

  test('Instant#toISO() shows the offset', t => {
    let offsetted = inst().useUTCOffset(-6 * 60);
    t.is(offsetted.toISO(), '1982-05-25T03:23:54.123-06:00');
    t.end();
  });

  //------
  // #toString()
  //-------

  //------
  // #toLocaleString()
  //-------

  //------
  // #toFormatString()
  //-------

  test('S', t => {
    let i = inst();
    t.is(i.toFormatString('S'), '123');
    t.is(i.locale('bn').toFormatString('S'), '১২৩');
    t.is(i.toFormatString('S'), '123');
    t.is(i.millisecond(82).toFormatString('S'), '82');
    t.end();
  });

  test('SSS', t => {
    let i = inst();
    t.is(i.toFormatString('SSS'), '123');
    t.is(i.locale('bn').toFormatString('SSS'), '১২৩');
    t.is(i.millisecond(82).toFormatString('SSS'), '082');
    t.end();
  });

  test('s', t => {
    let i = inst();
    t.is(i.toFormatString('s'), '54');
    t.is(i.locale('bn').toFormatString('s'), '৫৪');
    t.is(i.second(6).toFormatString('s'), '6');
    t.end();
  });

  test('ss', t => {
    let i = inst();
    t.is(i.toFormatString('ss'), '54');
    t.is(i.locale('bn').toFormatString('ss'), '৫৪');
    t.is(i.second(6).toFormatString('ss'), '06');
    t.end();
  });

  test('m', t => {
    let i = inst();
    t.is(i.toFormatString('m'), '23');
    t.is(i.locale('bn').toFormatString('m'), '২৩');
    t.is(i.minute(6).toFormatString('m'), '6');
    t.end();
  });

  test('mm', t => {
    let i = inst();
    t.is(i.toFormatString('mm'), '23');
    t.is(i.locale('bn').toFormatString('mm'), '২৩');
    t.is(i.minute(6).toFormatString('mm'), '06');
    t.end();
  });

  test('h', t => {
    let i = inst();
    t.is(i.toFormatString('h'), '9');
    t.is(i.locale('bn').toFormatString('h'), '৯');
    t.is(i.hour(12).toFormatString('h'), '12');
    t.is(i.hour(13).toFormatString('h'), '1');
    t.end();
  });

  test('hh', t => {
    let i = inst();
    t.is(i.toFormatString('hh'), '09');
    t.is(i.locale('bn').toFormatString('hh'), '০৯');
    t.is(i.hour(12).toFormatString('hh'), '12');
    t.is(i.hour(13).toFormatString('hh'), '01');
    t.end();
  });

  test('H', t => {
    let i = inst();
    t.is(i.toFormatString('H'), '9');
    t.is(i.locale('bn').toFormatString('H'), '৯');
    t.is(i.hour(12).toFormatString('H'), '12');
    t.is(i.hour(13).toFormatString('H'), '13');
    t.end();
  });

  test('HH', t => {
    let i = inst();
    t.is(i.toFormatString('HH'), '09');
    t.is(i.locale('bn').toFormatString('HH'), '০৯');
    t.is(i.hour(12).toFormatString('HH'), '12');
    t.is(i.hour(13).toFormatString('HH'), '13');
    t.end();
  });

  test('Z', t => {
    let i = inst();
    t.is(i.useUTCOffset(360).toFormatString('Z'), '+6');
    t.is(i.useUTCOffset(390).toFormatString('Z'), '+6:30');
    t.is(i.useUTCOffset(-360).toFormatString('Z'), '-6');
    t.is(i.useUTCOffset(-390).toFormatString('Z'), '-6:30');
    t.end();
  });

  test('ZZ', t => {
    let i = inst();
    t.is(i.useUTCOffset(360).toFormatString('ZZ'), '+06:00');
    t.is(i.useUTCOffset(390).toFormatString('ZZ'), '+06:30');
    t.is(i.useUTCOffset(-360).toFormatString('ZZ'), '-06:00');
    t.is(i.useUTCOffset(-390).toFormatString('ZZ'), '-06:30');
    t.end();
  });

  test('a', t => {
    let i = inst();
    t.is(i.toFormatString('a'), 'AM');;
    t.is(i.locale('de').toFormatString('a'), 'vorm.');;
    t.is(i.hour(13).toFormatString('a'), 'PM');
    t.is(i.hour(13).locale('de').toFormatString('a'), 'nachm.');
    t.end();
  });

  test('d', t => {
    let i = inst();
    t.is(i.toFormatString('d'), '25');
    t.is(i.day(1).toFormatString('d'), '1');
    t.end();
  });

  test('dd', t => {
    let i = inst();
    t.is(i.toFormatString('dd'), '25');
    t.is(i.day(1).toFormatString('dd'), '01');
    t.end();
  });

  test('E', t => {
    let i = inst();
    t.is(i.toFormatString('E'), '2');
    t.end();
  });

  //all these commented-out tests are bc https://github.com/andyearnshaw/Intl.js/issues/190

  //test('EEE', t => {
  //  let i = inst();
  //  t.is(i.toFormatString('EEE'), 'T');
  //  t.end();
  //});

  test('EEEE', t => {
    let i = inst();
    t.is(i.toFormatString('EEEE'), 'Tue');
    t.is(i.locale('de').toFormatString('EEE'), 'Di.');;
    t.end();
  });

  //test('EEEEE', t => {
  //  let i = inst();
  //  t.is(i.toFormatString('EEEE'), 'Tuesday');
  //  t.end();
  //});

  //test('M', t => {
  //  let i = inst();
  //  t.is(i.toFormatString('M'), '5');
  //  t.end();
  //});

  //test('MM', t => {
  //  let i = inst();
  //  t.is(i.toFormatString('MM'), '05');
  //  t.end();
  //});

  //test('MMM', t => {
  //  let i = inst();
  //  t.is(i.toFormatString('MMM'), 'M');
  //  t.end();
  //});

  test('MMMM', t => {
    let i = inst();
    t.is(i.toFormatString('MMMM'), 'May');
    t.is(i.locale('de').toFormatString('MMMM'), 'Mai');
    t.is(i.month(8).toFormatString('MMMM'), 'Aug');
    t.end();
  });

  //test('MMMMM', t => {
  //  let i = inst();
  //  t.is(i.toFormatString('MMMM'), 'May');
  //  t.is(i.month(8).toFormatString('MMMM'), 'August');
  //  t.end();
  //});

  test('y', t => {
    let i = inst();
    t.is(i.toFormatString('y'), '1982');
    t.is(i.locale('bn').toFormatString('y'), '১৯৮২');
    t.is(i.year(3).toFormatString('y'), '3');
    t.end();
  });

  test('yy', t => {
    let i = inst();
    t.is(i.toFormatString('yy'), '82');
    t.is(i.locale('bn').toFormatString('yy'), '৮২');
    t.is(i.year(3).toFormatString('yy'), '03');
    t.end();
  });

  test('yyyy', t => {
    let i = inst();
    t.is(i.toFormatString('yyyy'), '1982');
    t.is(i.locale('bn').toFormatString('yyyy'), '১৯৮২');
    t.is(i.year(3).toFormatString('yyyy'), '0003');
    t.is(i.year(3).locale('bn').toFormatString('yyyy'), '০০০৩');
    t.end();
  });

  //test('G', t => {
  //  let i = inst();
  //  t.is(i.toFormatString('G'), 'A');
  //  t.is(i.year(-21).toFormatString('G'), 'B');
  //  t.end();
  //});

  test('GG', t => {
    let i = inst();
    t.is(i.toFormatString('G'), 'AD');
    t.is(i.locale('de').toFormatString('G'), 'n. Chr.');
    t.is(i.year(-21).toFormatString('G'), 'BC');
    t.is(i.year(-21).locale('de').toFormatString('G'), 'v. Chr.');
    t.end();
  });

  //test('GGG', t => {
  //  let i = inst();
  //  t.is(i.toFormatString('G'), 'Anno Domini');
  //  t.is(i.year(-21).toFormatString('G'), 'Before Christ');
  //  t.end();
  //});
};
