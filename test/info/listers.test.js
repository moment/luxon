/* global test expect */

import { Info } from "../../src/luxon";

import Helpers from "../helpers";
const withDefaultLocale = Helpers.withDefaultLocale;

//------
// .months()
//------

test("Info.months lists all the months", () => {
  expect(Info.months("long")).toEqual([
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]);

  expect(Info.months("short", { locale: "en" })).toEqual([
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]);

  expect(Info.months("narrow", { locale: "en" })).toEqual([
    "J",
    "F",
    "M",
    "A",
    "M",
    "J",
    "J",
    "A",
    "S",
    "O",
    "N",
    "D",
  ]);

  expect(Info.months("numeric", { locale: "en" })).toEqual([
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
  ]);

  expect(Info.months("2-digit", { locale: "en" })).toEqual([
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ]);
});

test("Info.months respects the numbering system", () => {
  expect(Info.months("numeric", { locale: "en", numberingSystem: "beng" })).toEqual([
    "১",
    "২",
    "৩",
    "৪",
    "৫",
    "৬",
    "৭",
    "৮",
    "৯",
    "১০",
    "১১",
    "১২",
  ]);
});

test("Info.months respects the calendar", () => {
  expect(Info.months("long", { locale: "en", outputCalendar: "islamic" })).toEqual([
    "Muharram",
    "Safar",
    "Rabiʻ I",
    "Rabiʻ II",
    "Jumada I",
    "Jumada II",
    "Rajab",
    "Shaʻban",
    "Ramadan",
    "Shawwal",
    "Dhuʻl-Qiʻdah",
    "Dhuʻl-Hijjah",
  ]);
});

test("Info.months respects the locale", () => {
  expect(Info.months("numeric", { locale: "bn" })).toEqual([
    "১",
    "২",
    "৩",
    "৪",
    "৫",
    "৬",
    "৭",
    "৮",
    "৯",
    "১০",
    "১১",
    "১২",
  ]);

  // formatToParts outputs 月 as "literal" instead of "month", but it arguably is part of the name of the month.
  // this tests that we correctly work around this
  // see https://github.com/moment/luxon/issues/549
  for (const locale of ["ja", "ja-JP"]) {
    for (const length of ["long", "short", "narrow"]) {
      for (const formatter of [Info.months, Info.monthsFormat]) {
        expect(formatter(length, { locale })).toEqual([
          "1月",
          "2月",
          "3月",
          "4月",
          "5月",
          "6月",
          "7月",
          "8月",
          "9月",
          "10月",
          "11月",
          "12月",
        ]);
      }
    }
  }

  expect(Info.monthsFormat("long", { locale: "ru" })).toEqual([
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ]);
});

test("Info.months defaults to long names", () => {
  expect(Info.months()).toEqual([
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]);
});

//------
// .monthsFormat()
//------
test("Info.monthsFormat lists all the months", () => {
  expect(Info.monthsFormat("long", { locale: "en" })).toEqual([
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]);

  // this passes, but is wrong. These are the same as the standalone values
  expect(Info.monthsFormat("long", { locale: "ru" })).toEqual([
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ]);

  expect(Info.monthsFormat("short", { locale: "en" })).toEqual([
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]);

  expect(Info.monthsFormat("numeric", { locale: "en" })).toEqual([
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
  ]);
});

test("Info.monthsFormat defaults to long names", () => {
  expect(Info.monthsFormat()).toEqual([
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]);
});

//------
// .weekdays()
//------
test("Info.weekdays lists all the weekdays", () => {
  expect(Info.weekdays("long", { locale: "en" })).toEqual([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]);

  expect(Info.weekdays("short", { locale: "en" })).toEqual([
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ]);

  expect(Info.weekdays("narrow", { locale: "en" })).toEqual(["M", "T", "W", "T", "F", "S", "S"]);

  expect(Info.weekdays("long", { locale: "ru" })).toEqual([
    "понедельник",
    "вторник",
    "среда",
    "четверг",
    "пятница",
    "суббота",
    "воскресенье",
  ]);
});

test("Info.weekdays defaults to long names", () => {
  expect(Info.weekdays()).toEqual([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]);
});

//------
// .weekdaysFormat()
//------
test("Info.weekdaysFormat lists all the weekdays", () => {
  expect(Info.weekdaysFormat("long", { locale: "en" })).toEqual([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]);

  expect(Info.weekdaysFormat("short", { locale: "en" })).toEqual([
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ]);
});

test("Info.weekdaysFormat defaults to long names", () => {
  expect(Info.weekdaysFormat()).toEqual([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]);
});

//------
// .meridiems()
//------
test("Info.meridiems lists the meridiems", () => {
  expect(Info.meridiems({ locale: "en" })).toEqual(["AM", "PM"]);
  expect(Info.meridiems({ locale: "my" })).toEqual(["နံနက်", "ညနေ"]);
});

test("Info.meridiems defaults to the current locale", () => {
  expect(Info.meridiems()).toEqual(["AM", "PM"]);
});

//------
// .eras()
//------

test("Info.eras lists both eras", () => {
  expect(Info.eras()).toEqual(["BC", "AD"]);
  expect(Info.eras("short")).toEqual(["BC", "AD"]);
  expect(Info.eras("long")).toEqual(["Before Christ", "Anno Domini"]);
  expect(Info.eras("short", { locale: "fr" })).toEqual(["av. J.-C.", "ap. J.-C."]);
  expect(Info.eras("long", { locale: "fr" })).toEqual(["avant Jésus-Christ", "après Jésus-Christ"]);
});

//------
// general
//------
test("Info English lists are not mutable", () => {
  withDefaultLocale("en-US", () => {
    const cachingMethods = [
      ["weekdays", "short"],
      ["weekdays", "long"],
      ["weekdays", "narrow"],
      ["weekdays", "numeric"],
      ["months", "short"],
      ["months", "long"],
      ["months", "narrow"],
      ["months", "numeric"],
      ["months", "2-digit"],
      ["eras", "narrow"],
      ["eras", "short"],
      ["eras", "long"],
    ];

    for (const [method, arg] of cachingMethods) {
      const fn = Info[method];
      const original = [...fn(arg)];
      fn(arg).pop();
      const expected = fn(arg);
      expect(expected).toEqual(original);
    }
  });
});
