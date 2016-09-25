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

  test('Instant#toString() returns the ISO time', t => {
    let i = inst();
    t.is(i.useUTCOffset(-6 * 60).toString(), '1982-05-25T03:23:54.123-06:00');
    t.end();
  });

  //------
  // #toLocaleString()
  //-------

  test('Instant#toLocaleString returns a sensible string by default', t => {
    t.is(inst().locale('en-us').toLocaleString(), '5/25/1982');
    t.end();
  });

  test('Instant#toLocaleString accepts locale settings from the instant', t => {
    t.is(inst().locale('be').toLocaleString(), '25.5.1982');
    t.end();
  });

  test('Instant#toLocaleString accepts options to the formatter', t => {
    t.ok(inst().toLocaleString({weekday: 'short'}).indexOf('Tue') >= 0);
    t.end();
  });

  test("Instant#toLocaleString can override the instant's locale", t => {
    t.is(inst().locale('be').toLocaleString({loc: 'fr'}), '25/05/1982');
    t.end();
  });

  //------
  // #toFormatString()
  //-------

  test("Instant#toFormatString('S') returns the millisecond", t => {
    let i = inst();
    t.is(i.toFormatString('S'), '123');
    t.is(i.locale('bn').toFormatString('S'), '১২৩');
    t.is(i.toFormatString('S'), '123');
    t.is(i.millisecond(82).toFormatString('S'), '82');
    t.end();
  });

  test("Instant#toFormatString('SSS') returns padded the millisecond", t => {
    let i = inst();
    t.is(i.toFormatString('SSS'), '123');
    t.is(i.locale('bn').toFormatString('SSS'), '১২৩');
    t.is(i.millisecond(82).toFormatString('SSS'), '082');
    t.end();
  });

  test("Instant#toFormatString('s') returns the second", t => {
    let i = inst();
    t.is(i.toFormatString('s'), '54');
    t.is(i.locale('bn').toFormatString('s'), '৫৪');
    t.is(i.second(6).toFormatString('s'), '6');
    t.end();
  });

  test("Instant#toFormatString('ss') returns the padded second", t => {
    let i = inst();
    t.is(i.toFormatString('ss'), '54');
    t.is(i.locale('bn').toFormatString('ss'), '৫৪');
    t.is(i.second(6).toFormatString('ss'), '06');
    t.end();
  });

  test("Instant#toFormatString('m') returns the minute", t => {
    let i = inst();
    t.is(i.toFormatString('m'), '23');
    t.is(i.locale('bn').toFormatString('m'), '২৩');
    t.is(i.minute(6).toFormatString('m'), '6');
    t.end();
  });

  test("Instant#toFormatString('mm') returns the padded minute", t => {
    let i = inst();
    t.is(i.toFormatString('mm'), '23');
    t.is(i.locale('bn').toFormatString('mm'), '২৩');
    t.is(i.minute(6).toFormatString('mm'), '06');
    t.end();
  });

  test("Instant#toFormatString('h') returns the hours", t => {
    let i = inst();
    t.is(i.toFormatString('h'), '9');
    t.is(i.locale('bn').toFormatString('h'), '৯');
    t.is(i.hour(12).toFormatString('h'), '12');
    t.is(i.hour(13).toFormatString('h'), '1');
    t.end();
  });

  test("Instant#toFormatString('hh') returns the padded hour (12-hour time)", t => {
    let i = inst();
    t.is(i.toFormatString('hh'), '09');
    t.is(i.locale('bn').toFormatString('hh'), '০৯');
    t.is(i.hour(12).toFormatString('hh'), '12');
    t.is(i.hour(13).toFormatString('hh'), '01');
    t.end();
  });

  test("Instant#toFormatString('H') returns the hour (24-hour time)", t => {
    let i = inst();
    t.is(i.toFormatString('H'), '9');
    t.is(i.locale('bn').toFormatString('H'), '৯');
    t.is(i.hour(12).toFormatString('H'), '12');
    t.is(i.hour(13).toFormatString('H'), '13');
    t.end();
  });

  test("Instant#toFormatString('HH') returns the padded hour (24-hour time)", t => {
    let i = inst();
    t.is(i.toFormatString('HH'), '09');
    t.is(i.locale('bn').toFormatString('HH'), '০৯');
    t.is(i.hour(12).toFormatString('HH'), '12');
    t.is(i.hour(13).toFormatString('HH'), '13');
    t.end();
  });

  test("Instant#toFormatString('Z') returns the narrow offset", t => {
    let i = inst();
    t.is(i.useUTCOffset(360).toFormatString('Z'), '+6');
    t.is(i.useUTCOffset(390).toFormatString('Z'), '+6:30');
    t.is(i.useUTCOffset(-360).toFormatString('Z'), '-6');
    t.is(i.useUTCOffset(-390).toFormatString('Z'), '-6:30');
    t.end();
  });

  test("Instant#toFormatString('ZZ') returns the padded offset", t => {
    let i = inst();
    t.is(i.useUTCOffset(360).toFormatString('ZZ'), '+06:00');
    t.is(i.useUTCOffset(390).toFormatString('ZZ'), '+06:30');
    t.is(i.useUTCOffset(-360).toFormatString('ZZ'), '-06:00');
    t.is(i.useUTCOffset(-390).toFormatString('ZZ'), '-06:30');
    t.end();
  });

  test("Instant#toFormatString('a') returns the meridiem", t => {
    let i = inst();
    t.is(i.toFormatString('a'), 'AM');;
    t.is(i.locale('de').toFormatString('a'), 'vorm.');;
    t.is(i.hour(13).toFormatString('a'), 'PM');
    t.is(i.hour(13).locale('de').toFormatString('a'), 'nachm.');
    t.end();
  });

  test("Instant#toFormatString('d') returns the day", t => {
    let i = inst();
    t.is(i.toFormatString('d'), '25');
    t.is(i.day(1).toFormatString('d'), '1');
    t.end();
  });

  test("Instant#toFormatString('dd') returns the padded day", t => {
    let i = inst();
    t.is(i.toFormatString('dd'), '25');
    t.is(i.day(1).toFormatString('dd'), '01');
    t.end();
  });

  test("Instant#toFormatString('E' || 'c') returns weekday number", t => {
    let i = inst();
    t.is(i.toFormatString('E'), '2');
    t.is(i.toFormatString('c'), '2');
    t.end();
  });

  test("Instant#toFormatString('EEE) returns short format weekday name", t => {
    let i = inst();
    t.is(i.toFormatString('EEE'), 'Tue');
    t.is(i.locale('de').toFormatString('EEE'), 'Di.');;

    //anyone know a language where the *abbreviated* genitive is different than the standalone?
    //if so, test that here

    t.end();
  });

  test("Instant#toFormatString('ccc) returns short standalone weekday name", t => {
    let i = inst();
    t.is(i.toFormatString('ccc'), 'Tue');
    t.is(i.locale('de').toFormatString('ccc'), 'Di.');;
    t.end();
  });

  //all these commented-out tests are bc https://github.com/andyearnshaw/Intl.js/issues/190

  test("Instant#toFormatString('EEEE') returns the full format weekday name", t => {
    let i = inst();
    t.is(i.toFormatString('EEEE'), 'Tuesday');
    t.end();
  });

  test("Instant#toFormatString('cccc') returns the full standalone weekday name", t => {
    let i = inst();
    t.is(i.toFormatString('cccc'), 'Tuesday');

    //I can't find anything I can generate different standalones for. 'ga' has a different genitive
    //case, but at least according to Intl, it's *always* used in dates.
    //todo - find one and test it here

    t.end();
  });

  test("Instant#toFormatString('EEEEE' || 'ccccc') returns narrow weekday name", t => {
    let i = inst();
    t.is(i.toFormatString('EEEEE'), 'T');
    t.is(i.toFormatString('ccccc'), 'T');
    t.end();
  });

  test("Instant#toFormatString('M' || 'L') return the month number", t => {
    let i = inst();
    t.is(i.toFormatString('M'), '5');
    t.is(i.toFormatString('L'), '5');
    t.end();
  });

  test("Instant#toFormatString('MM' || 'LL') return the padded month number", t => {
    let i = inst();
    t.is(i.toFormatString('MM'), '05');
    //t.is(i.toFormatString('LL'), '05');
    t.end();
  });

  test("Instant#toFormatString('MMM') returns the short format month name", t => {
    let i = inst();
    t.is(i.toFormatString('MMM'), 'May');
    t.is(i.locale('de').toFormatString('MMM'), 'Mai');
    t.is(i.month(8).toFormatString('MMM'), 'Aug');

    //anyone know a language where the *abbreviated* genitive is different than the standalone?
    //if so, test that here

    t.end();
  });

  test("Instant#toFormatString('LLL') returns the short standalone month name", t => {
    let i = inst();
    t.is(i.toFormatString('LLL'), 'May');
    t.is(i.locale('de').toFormatString('LLL'), 'Mai');
    t.is(i.month(8).toFormatString('LLL'), 'Aug');

    t.end();
  });

  test("Instant#toFormatString('MMMM') returns the full format month name", t => {
    let i = inst();
    t.is(i.toFormatString('MMMM'), 'May');
    t.is(i.month(8).toFormatString('MMMM'), 'August');
    t.is(i.month(8).locale('ru').toFormatString('MMMM'), 'августа');
    t.end();
  });

  test("Instant#toFormatString('LLLL') returns the full standalone month name", t => {
    let i = inst();
    t.is(i.toFormatString('LLLL'), 'May');
    t.is(i.month(8).toFormatString('LLLL'), 'August');

    //this doesn't work yet, instead returning  'августа'
    //t.is(i.month(8).locale('ru').toFormatString('LLLL'), 'август');
    t.end();
  });

  test("Instant#toFormatString('MMMMM' || 'LLLLL') returns the narrow month name", t => {
    let i = inst();
    t.is(i.toFormatString('MMMMM'), 'M');
    t.is(i.toFormatString('LLLLL'), 'M');
    t.end();
  });

  test("Instant#toFormatString('y') returns the full year", t => {
    let i = inst();
    t.is(i.toFormatString('y'), '1982');
    t.is(i.locale('bn').toFormatString('y'), '১৯৮২');
    t.is(i.year(3).toFormatString('y'), '3');
    t.end();
  });

  test("Instant#toFormatString('yy') returns the two-digit year", t => {
    let i = inst();
    t.is(i.toFormatString('yy'), '82');
    t.is(i.locale('bn').toFormatString('yy'), '৮২');
    t.is(i.year(3).toFormatString('yy'), '03');
    t.end();
  });

  test("Instant#toFormatString('yyyy') returns the padded full year", t => {
    let i = inst();
    t.is(i.toFormatString('yyyy'), '1982');
    t.is(i.locale('bn').toFormatString('yyyy'), '১৯৮২');
    t.is(i.year(3).toFormatString('yyyy'), '0003');
    t.is(i.year(3).locale('bn').toFormatString('yyyy'), '০০০৩');
    t.end();
  });

  test("Instant#toFormatString('G') returns the short era", t => {
    let i = inst();
    t.is(i.toFormatString('G'), 'AD');
    t.is(i.locale('de').toFormatString('G'), 'n. Chr.');
    t.is(i.year(-21).toFormatString('G'), 'BC');
    t.is(i.year(-21).locale('de').toFormatString('G'), 'v. Chr.');
    t.end();
  });

  //test("Instant#toFormatString('GG') returns the full era", t => {
  //  let i = inst();
  //  t.is(i.toFormatString('GG'), 'Anno Domini');
  //  t.is(i.year(-21).toFormatString('GG'), 'Before Christ');
  //  t.end();
  //});

  //test("Instant#toFormatString('GGGGG') returns the narrow era", t => {
  //  let i = inst();
  //  t.is(i.toFormatString('GGGG'), 'A');
  //  t.is(i.year(-21).toFormatString('GGGGG'), 'B');
  //  t.end();
  //});

  test("Instant#toFormatString returns a full formatted string", t => {
    let i = inst();
    t.is(i.toFormatString('MM/yyyy GG'), '05/1982 AD');
    t.end();
  });

  test("Instant#toFormatString() accepts literals in single quotes", t => {
    let i = inst();
    t.is(i.toFormatString("dd/MM/yyyy 'at' hh:mm"), '25/05/1982 at 09:23');
    t.is(i.toFormatString("MMdd'T'hh"), '0525T09');
    t.end();
  });

  //numbering is disabled while we're still using the polyfill for number formatting
  //test('Instant#numbering() overides the numbering system from the locale', t => {
  //  let i = inst();
  //  t.is(i.numbering('beng').toFormatString('S'), '১২৩');
  //  t.end();
  //});

  test("Instant#toFormatString('D') returns a short date representation", t => {
    let i = inst();
    t.is(i.toFormatString('D'), '5/25/1982');
    t.is(i.locale('fr').toFormatString('D'), '25/05/1982');
    t.end();
  });

  test("Instant#toFormatString('DD') returns a medium date representation", t => {
    let i = inst();
    t.is(i.toFormatString('DD'), 'May 25, 1982');
    t.is(i.month(8).toFormatString('DD'), 'Aug 25, 1982');
    t.is(i.locale('fr').toFormatString('DD'), '25 mai 1982');
    t.is(i.locale('fr').month(2).toFormatString('DD'), '25 févr. 1982');
    t.end();
  });

  test("Instant#toFormatString('DDD') returns a long date representation", t => {
    let i = inst();
    t.is(i.toFormatString('DDD'), 'May 25, 1982');
    t.is(i.month(8).toFormatString('DDD'), 'August 25, 1982');
    t.is(i.locale('fr').toFormatString('DDD'), '25 mai 1982');
    t.is(i.locale('fr').month(2).toFormatString('DDD'), '25 février 1982');
    t.end();
  });

  test("Instant#toFormatString('DDDD') returns a long date representation", t => {
    let i = inst();
    t.is(i.toFormatString('DDDD'), 'Tuesday, May 25, 1982');
    t.is(i.month(8).toFormatString('DDDD'), 'Wednesday, August 25, 1982');
    t.is(i.locale('fr').toFormatString('DDDD'), 'mardi 25 mai 1982');
    t.is(i.locale('fr').month(2).toFormatString('DDDD'), 'jeudi 25 février 1982');
    t.end();
  });

  test("Instant#toFormatString('t') returns a short time representation", t => {
    let i = inst();
    t.is(i.toFormatString('t'), '9:23 AM');
    t.is(i.hour(13).toFormatString('t'), '1:23 PM');
    t.is(i.locale('fr').toFormatString('t'), '9:23');
    t.is(i.locale('fr').hour(13).toFormatString('t'), '13:23');
    t.end();
  });

  test("Instant#toFormatString('T') returns a short 24-hour time representation", t => {
    let i = inst();
    t.is(i.toFormatString('T'), '9:23');
    t.is(i.hour(13).toFormatString('T'), '13:23');
    t.is(i.locale('fr').toFormatString('T'), '9:23');
    t.is(i.locale('fr').hour(13).toFormatString('T'), '13:23');
    t.end();
  });

  test("Instant#toFormatString('tt') returns a medium time representation", t => {
    let i = inst();
    t.is(i.toFormatString('tt'), '9:23:54 AM');
    t.is(i.hour(13).toFormatString('tt'), '1:23:54 PM');
    t.is(i.locale('fr').toFormatString('tt'), '9:23:54');
    t.is(i.locale('fr').hour(13).toFormatString('tt'), '13:23:54');
    t.end();
  });

  test("Instant#toFormatString('TT') returns a medium 24-hour time representation", t => {
    let i = inst();
    t.is(i.toFormatString('TT'), '9:23:54');
    t.is(i.hour(13).toFormatString('TT'), '13:23:54');
    t.is(i.locale('fr').toFormatString('TT'), '9:23:54');
    t.is(i.locale('fr').hour(13).toFormatString('TT'), '13:23:54');
    t.end();
  });

  test("Instant#toFormatString('f') returns a short date/time representation without seconds", t => {
    let i = inst();
    t.is(i.toFormatString('f'), '5/25/1982, 9:23 AM');
    t.is(i.hour(13).toFormatString('f'), '5/25/1982, 1:23 PM');
    t.is(i.locale('fr').toFormatString('f'), '25/05/1982 9:23');
    t.is(i.locale('fr').hour(13).toFormatString('f'), '25/05/1982 13:23');
    t.end();
  });

  test("Instant#toFormatString('ff') returns a medium date/time representation without seconds", t => {
    let i = inst();
    t.is(i.toFormatString('ff'), 'May 25, 1982, 9:23 AM');
    t.is(i.hour(13).toFormatString('ff'), 'May 25, 1982, 1:23 PM');
    t.is(i.month(8).toFormatString('ff'), 'Aug 25, 1982, 9:23 AM');
    t.is(i.locale('fr').toFormatString('ff'), '25 mai 1982 à 9:23');
    t.is(i.locale('fr').month(2).toFormatString('ff'), '25 févr. 1982 à 9:23');
    t.is(i.locale('fr').hour(13).toFormatString('ff'), '25 mai 1982 à 13:23');
    t.end();
  });

  test("Instant#toFormatString('fff') returns a medium date/time representation without seconds", t => {
    let i = inst();
    t.is(i.toFormatString('fff'), 'May 25, 1982 at 9:23 AM');
    t.is(i.hour(13).toFormatString('fff'), 'May 25, 1982 at 1:23 PM');
    t.is(i.month(8).toFormatString('fff'), 'August 25, 1982 at 9:23 AM');
    t.is(i.locale('fr').toFormatString('fff'), '25 mai 1982 à 9:23');
    t.is(i.locale('fr').month(2).toFormatString('fff'), '25 février 1982 à 9:23');
    t.is(i.locale('fr').hour(13).toFormatString('fff'), '25 mai 1982 à 13:23');
    t.end();
  });

  test("Instant#toFormatString('ffff') returns a long date/time representation without seconds", t => {
    let i = inst();
    t.is(i.toFormatString('ffff'), 'Tuesday, May 25, 1982 at 9:23 AM');
    t.is(i.hour(13).toFormatString('ffff'), 'Tuesday, May 25, 1982 at 1:23 PM');
    t.is(i.month(8).toFormatString('ffff'), 'Wednesday, August 25, 1982 at 9:23 AM');
    t.is(i.locale('fr').toFormatString('ffff'), 'mardi 25 mai 1982 à 9:23');
    t.is(i.locale('fr').month(2).toFormatString('ffff'), 'jeudi 25 février 1982 à 9:23');
    t.is(i.locale('fr').hour(13).toFormatString('ffff'), 'mardi 25 mai 1982 à 13:23');
    t.end();
  });

  test("Instant#toFormatString('F') returns a short date/time representation with seconds", t => {
    let i = inst();
    t.is(i.toFormatString('F'), '5/25/1982, 9:23:54 AM');
    t.is(i.hour(13).toFormatString('F'), '5/25/1982, 1:23:54 PM');
    t.is(i.locale('fr').toFormatString('F'), '25/05/1982 9:23:54');
    t.is(i.locale('fr').hour(13).toFormatString('F'), '25/05/1982 13:23:54');
    t.end();
  });

  test("Instant#toFormatString('FF') returns a medium date/time representation with seconds", t => {
    let i = inst();
    t.is(i.toFormatString('FF'), 'May 25, 1982, 9:23:54 AM');
    t.is(i.hour(13).toFormatString('FF'), 'May 25, 1982, 1:23:54 PM');
    t.is(i.month(8).toFormatString('FF'), 'Aug 25, 1982, 9:23:54 AM');
    t.is(i.locale('fr').toFormatString('FF'), '25 mai 1982 à 9:23:54');
    t.is(i.locale('fr').month(2).toFormatString('FF'), '25 févr. 1982 à 9:23:54');
    t.is(i.locale('fr').hour(13).toFormatString('FF'), '25 mai 1982 à 13:23:54');
    t.end();
  });

  test("Instant#toFormatString('fff') returns a medium date/time representation without seconds", t => {
    let i = inst();
    t.is(i.toFormatString('fff'), 'May 25, 1982 at 9:23 AM');
    t.is(i.hour(13).toFormatString('fff'), 'May 25, 1982 at 1:23 PM');
    t.is(i.month(8).toFormatString('fff'), 'August 25, 1982 at 9:23 AM');
    t.is(i.locale('fr').toFormatString('fff'), '25 mai 1982 à 9:23');
    t.is(i.locale('fr').month(2).toFormatString('fff'), '25 février 1982 à 9:23');
    t.is(i.locale('fr').hour(13).toFormatString('fff'), '25 mai 1982 à 13:23');
    t.end();
  });

  test("Instant#toFormatString('FFFF') returns a long date/time representation without seconds", t => {
    let i = inst();
    t.is(i.toFormatString('FFFF'), 'Tuesday, May 25, 1982 at 9:23:54 AM');
    t.is(i.hour(13).toFormatString('FFFF'), 'Tuesday, May 25, 1982 at 1:23:54 PM');
    t.is(i.month(8).toFormatString('FFFF'), 'Wednesday, August 25, 1982 at 9:23:54 AM');
    t.is(i.locale('fr').toFormatString('FFFF'), 'mardi 25 mai 1982 à 9:23:54');
    t.is(i.locale('fr').month(2).toFormatString('FFFF'), 'jeudi 25 février 1982 à 9:23:54');
    t.is(i.locale('fr').hour(13).toFormatString('FFFF'), 'mardi 25 mai 1982 à 13:23:54');
    t.end();
  });
};
