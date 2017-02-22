/* global test expect */

import { Info } from '../../dist/cjs/luxon';


  //------
  // .months()
  //-------

test('Info.months lists all the months', () => {
  expect(Info.months('long', 'en')).toEqual(
    ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']);

  expect(Info.months('short', 'en')).toEqual(
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);

  expect(Info.months('narrow', 'en')).toEqual(['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']);

  expect(Info.months('numeric', 'en')).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']);
});

test('Info.months respects the numbering system', () => {});

test('Info.months respects the locale', () => {
  expect(Info.months('numeric', 'bn')).toEqual(['১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '১০', '১১', '১২']);

  expect(Info.monthsFormat('long', 'ru')).toEqual(
    ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']);
});

//------
// .monthsFormat()
//-------

test('Info.monthsFormat lists all the months', () => {
  expect(Info.monthsFormat('long', 'en')).toEqual(
    ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']);

  // this passes, but is wrong. These are the same as the standalone values
  expect(Info.monthsFormat('long', 'ru')).toEqual(
    ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']);

  expect(Info.monthsFormat('short', 'en')).toEqual(
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);

  expect(Info.monthsFormat('numeric', 'en')).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']);
});

//------
// .weekdays()
//-------

test('Info.weekdays lists all the weekdays', () => {
  expect(Info.weekdays('long', 'en')).toEqual(
    ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);

  expect(Info.weekdays('short', 'en')).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);

  expect(Info.weekdays('narrow', 'en')).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);

  expect(Info.weekdays('long', 'ru')).toEqual(
    ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']);
});

//------
// .weekdaysFormat()
//-------

test('Info.weekdaysFormat lists all the weekdays', () => {
  expect(Info.weekdaysFormat('long', 'en')).toEqual(
    ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);

  expect(Info.weekdaysFormat('short', 'en')).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
});

//------
// .meridiems()
//-------

test('Info.weekdaysFormat lists all the weekdays', () => {
  expect(Info.meridiems('en')).toEqual(['AM', 'PM']);
  expect(Info.meridiems('de')).toEqual(['vorm.', 'nachm.']);
});
