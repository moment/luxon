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

  //------
  // .weekdays()
  //-------

  test('Info.weekdays lists all the weekdays', t => {

    t.deepEqual(
      Info.weekdays('long', 'en'),
      ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);

    t.deepEqual(
      Info.weekdays('short', 'en'),
      ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);

    t.deepEqual(
      Info.weekdays('narrow', 'en'),
      ['S', 'M', 'T', 'W', 'T', 'F', 'S']);

    t.deepEqual(
      Info.weekdays('long', 'ru'),
      ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']);

    t.end();
  });

  //------
  // .weekdaysFormat()
  //-------

  test('Info.weekdaysFormat lists all the weekdays', t => {

    t.deepEqual(
      Info.weekdaysFormat('long', 'en'),
      ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);

    t.deepEqual(
      Info.weekdaysFormat('short', 'en'),
      ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);

    //this passes, but is wrong. These are the same as the standalone values
    //t.deepEqual(
    //  Info.weekdaysFormat('long', 'ru'),
    //  ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']);

    t.end();
  });

  //------
  // .meridiems()
  //-------

  test('Info.weekdaysFormat lists all the weekdays', t => {
    t.deepEqual(Info.meridiems('en'), ['AM', 'PM']);
    t.deepEqual(Info.meridiems('de'), ['vorm.', 'nachm.']);
    t.end();
  });
};
