import test from 'tape';
import {Duration} from 'luxon';

export let format = () => {

  //------
  // #toFormatString()
  //------

  let dur = () => Duration.fromObject({years: 1, months: 2, days: 3, hours: 4, minutes: 5, seconds: 6, milliseconds: 7});

  test("Duration#toFormatString('S') returns milliseconds", t => {
    t.is(dur().toFormatString('S'), '36993906007');

    let lil = Duration.fromLength(5, 'milliseconds');
    t.is(lil.toFormatString('S'), '5');
    t.is(lil.toFormatString('SS'), '05');
    t.is(lil.toFormatString('SSSSS'), '00005');
    t.end();
  });

  test("Duration#toFormatString('s') returns seconds", t => {
    t.is(dur().toFormatString('s'), '36993906');
    t.is(dur().toFormatString('s', {round: false}), '36993906.007');
    t.is(dur().toFormatString('s.SSS'), '36993906.007');
    t.end();
  });

  test("Duration#toFormatString('m') returns minutes", t => {
    t.is(dur().toFormatString('m'), '616565');
    t.is(dur().toFormatString('m', {round: false}), '616565.1');
    t.is(dur().toFormatString('m:ss'), '616565:06');
    t.is(dur().toFormatString('m:ss.SSS'), '616565:06.007');
    t.end();
  });

  test("Duration#toFormatString('h') returns hours", t => {
    t.is(dur().toFormatString('h'), '10276');
    t.is(dur().toFormatString('h', {round: false}), '10276.085');
    t.is(dur().toFormatString('h:ss'), '10276:306');
    t.is(dur().toFormatString('h:mm:ss.SSS'), '10276:05:06.007');
    t.end();
  });

  test("Duration#toFormatString('d') returns days", t => {
    t.is(dur().toFormatString('d'), '428');
    t.is(dur().toFormatString('d', {round: false}), '428.17');
    t.is(dur().toFormatString('d:h:ss'), '428:4:306');
    t.is(dur().toFormatString('d:h:mm:ss.SSS'), '428:4:05:06.007');
    t.end();
  });

  test("Duration#toFormatString('M') returns months", t => {
    t.is(dur().toFormatString('M'), '14');
    t.is(dur().toFormatString('M', {round: false}), '14.106');
    t.is(dur().toFormatString('M:s'), '14:273906');
    t.is(dur().toFormatString('M:dd:h:mm:ss.SSS'), '14:03:4:05:06.007');
    t.end();
  });

  test("Duration#toFormatString('y') returns years", t => {
    t.is(dur().toFormatString('y'), '1');
    t.is(dur().toFormatString('y', {round: false}), '1.175');
    t.is(dur().toFormatString('y:m'), '1:90965');
    t.is(dur().toFormatString('y:M:dd:h:mm:ss.SSS'), '1:2:03:4:05:06.007');

    let lil = Duration.fromLength(5, 'years');
    t.is(lil.toFormatString('y'), '5');
    t.is(lil.toFormatString('yy'), '05');
    t.is(lil.toFormatString('yyyyy'), '00005');
    t.end();
  });

  test('Duration#toFormatString localizes the numbers', t => {
    t.is(dur().locale('bn').toFormatString('yy:MM:dd:h:mm:ss.SSS'), '০১:০২:০৩:৪:০৫:০৬.০০৭');
    t.end();
  });
};
