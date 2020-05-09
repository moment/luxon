import { DateTime } from "../../src";
import Settings from "../../src/settings";

const dateTime = DateTime.fromJSDate(new Date(1982, 4, 25, 9, 23, 54, 123)),
  utc = DateTime.fromMillis(Date.UTC(1982, 4, 25, 9, 23, 54, 123)).toUTC();

//------
// year/month/day/hour/minute/second/millisecond
//------
test("DateTime#year returns the year", () => {
  expect(dateTime.year).toBe(1982);
  expect(utc.year).toBe(1982);
});

test("DateTime#month returns the (1-indexed) month", () => {
  expect(dateTime.month).toBe(5);
  expect(utc.month).toBe(5);
});

test("DateTime#day returns the day", () => {
  expect(dateTime.day).toBe(25);
  expect(utc.day).toBe(25);
});

test("DateTime#hour returns the hour", () => {
  expect(dateTime.hour).toBe(9);
  expect(utc.hour).toBe(9);
});

test("DateTime#minute returns the minute", () => {
  expect(dateTime.minute).toBe(23);
  expect(utc.minute).toBe(23);
});

test("DateTime#second returns the second", () => {
  expect(dateTime.second).toBe(54);
  expect(utc.second).toBe(54);
});

test("DateTime#millisecond returns the millisecond", () => {
  expect(dateTime.millisecond).toBe(123);
  expect(utc.millisecond).toBe(123);
});

//------
// weekYear/weekNumber/weekday
//------
test("DateTime#weekYear returns the weekYear", () => {
  expect(dateTime.weekYear).toBe(1982);
  // test again bc caching
  expect(dateTime.weekYear).toBe(1982);
});

test("DateTime#weekNumber returns the weekNumber", () => {
  expect(dateTime.weekNumber).toBe(21);
  // test again bc caching
  expect(dateTime.weekNumber).toBe(21);
});

test("DateTime#weekday returns the weekday", () => {
  expect(dateTime.weekday).toBe(2);
  // test again bc caching
  expect(dateTime.weekday).toBe(2);
});

//------
// weekdayShort/weekdayLong
//------
test("DateTime#weekdayShort returns the short human readable weekday for en-US locale", () => {
  expect(dateTime.setLocale("en-US").weekdayShort).toBe("Tue");
});

test("DateTime#weekdayLong returns the human readable weekday for en-US locale", () => {
  expect(dateTime.setLocale("en-US").weekdayLong).toBe("Tuesday");
});

test("DateTime#weekdayShort returns the short human readable weekday for fr locale", () => {
  expect(dateTime.setLocale("fr").weekdayShort).toBe("mar.");
});

test("DateTime#weekdayLong returns the human readable weekday for fr locale", () => {
  expect(dateTime.setLocale("fr").weekdayLong).toBe("mardi");
});

//------
// monthShort/monthLong
//------
test("DateTime#monthShort returns the short human readable month", () => {
  expect(dateTime.setLocale("en-US").monthShort).toBe("May");
});

test("DateTime#monthLong returns the human readable month", () => {
  expect(dateTime.setLocale("en-US").monthLong).toBe("May");
});

test("DateTime#monthShort returns the short human readable month", () => {
  expect(dateTime.minus({ months: 1 }).setLocale("en-US").monthShort).toBe("Apr");
});

test("DateTime#monthLong returns the human readable month", () => {
  expect(dateTime.minus({ months: 1 }).setLocale("en-US").monthLong).toBe("April");
});

test("DateTime#monthShort returns the short human readable month for fr locale", () => {
  expect(dateTime.minus({ months: 1 }).setLocale("fr").monthShort).toBe("avr.");
});

test("DateTime#monthLong returns the human readable month for fr locale", () => {
  expect(dateTime.minus({ months: 1 }).setLocale("fr").monthLong).toBe("avril");
});

//------
// ordinal
//------

test("DateTime#ordinal returns the ordinal", () => {
  expect(dateTime.ordinal).toBe(145);
});

//------
// get
//------
test("DateTime#get can retrieve any unit", () => {
  expect(dateTime.get("ordinal")).toBe(145);
  expect(dateTime.get("year")).toBe(1982);
  expect(dateTime.get("weekNumber")).toBe(21);
});

//------
// locale
//------
test("DateTime#locale returns the locale", () => {
  const dt = DateTime.local().reconfigure({ locale: "be" });
  expect(dt.locale).toBe("be");
});

//------
// zone/zoneName
//------
test("DateTime#zone returns the time zone", () => {
  expect(dateTime.zone).toBe(Settings.defaultZone);
});

test("DateTime#zoneName returns the name of the time zone", () => {
  expect(dateTime.zoneName).toBe(Settings.defaultZone.name);
});
