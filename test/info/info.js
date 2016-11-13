import {Info} from 'luxon';
import test from 'tape';

export let info = () => {

  //------
  // .months()
  //-------

  test('Info.months lists all the months', t => {
    t.deepEqual(
      Info.months('long', 'en'),
      ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']);

    t.deepEqual(
      Info.months('short', 'en'),
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);

    t.deepEqual(
      Info.months('narrow', 'en'),
      ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']);

    t.deepEqual(
      Info.months('numeric', 'en'),
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']);

    t.end();
  });


  test('Info.months respects the numbering system', t => {
    //the polyfill doesn't allow num overrides, so skip this for now
    t.end();
  });

  test('Info.months respects the locale', t => {

    t.deepEqual(
      Info.months('long', 'bn'),
      ['জানুয়ারী', 'ফেব্রুয়ারী', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর' ]);

    t.deepEqual(
      Info.months('numeric', 'bn'),
      ['১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '১০', '১১', '১২']);

    t.deepEqual(
      Info.months('numeric', 'bn'),
      ['১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '১০', '১১', '১২']);

    t.deepEqual(
      Info.monthsFormat('long', 'ru'),
      ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']);

    t.end();
  });


  //------
  // .monthsFormat()
  //-------

  test('Info.monthsFormat lists all the months', t => {
    t.deepEqual(
      Info.monthsFormat('long', 'en'),
      ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']);

    //this passes, but is wrong. These are the same as the standalone values
    //t.deepEqual(
    //  Info.monthsFormat('long', 'ru'),
    //  ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']);

    t.deepEqual(
      Info.monthsFormat('short', 'en'),
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);

    t.deepEqual(
      Info.monthsFormat('numeric', 'en'),
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']);

    t.end();
  });

};
