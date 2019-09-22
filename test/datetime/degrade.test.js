/* global expect */
import { DateTime } from "../../src/luxon";

const Helpers = require("../helpers");

//------
// No Intl support
//-------
Helpers.withoutIntl("DateTime#toFormat returns English", () => {
  expect(DateTime.local(2014, 8, 6).toFormat("ccc")).toBe("Wed");
  expect(
    DateTime.local(2014, 8, 6)
      .setLocale("fr")
      .toFormat("ccc")
  ).toBe("Wed");
});

Helpers.withoutIntl("DateTime.fromFormat can still parse English", () => {
  expect(DateTime.fromFormat("May 15, 2017", "LLLL dd, yyyy").isValid).toBe(true);
});

Helpers.withoutIntl("DateTime#toLocaleString produces English short date by default", () => {
  expect(DateTime.local(2014, 8, 6, 9, 15).toLocaleString()).toBe("8/6/2014");
});

Helpers.withoutIntl("DateTime#toLocaleString supports known configurations", () => {
  const dt = DateTime.local(2014, 8, 6, 9, 15, 36),
    expected = new Map();

  expected.set(DateTime.DATE_SHORT, "8/6/2014");
  expected.set(DateTime.DATE_MED, "Aug 6, 2014");
  expected.set(DateTime.DATE_FULL, "August 6, 2014");
  expected.set(DateTime.DATE_HUGE, "Wednesday, August 6, 2014");
  expected.set(DateTime.TIME_SIMPLE, "9:15 AM");
  expected.set(DateTime.TIME_WITH_SECONDS, "9:15:36 AM");
  expected.set(DateTime.TIME_WITH_SHORT_OFFSET, "9:15 AM"); // we can't do the offset
  expected.set(DateTime.TIME_WITH_LONG_OFFSET, "9:15 AM");
  expected.set(DateTime.TIME_24_SIMPLE, "09:15");
  expected.set(DateTime.TIME_24_WITH_SECONDS, "09:15:36");
  expected.set(DateTime.TIME_24_WITH_SHORT_OFFSET, "09:15");
  expected.set(DateTime.TIME_24_WITH_LONG_OFFSET, "09:15");
  expected.set(DateTime.DATETIME_SHORT, "8/6/2014, 9:15 AM");
  expected.set(DateTime.DATETIME_MED, "Aug 6, 2014, 9:15 AM");
  expected.set(DateTime.DATETIME_FULL, "August 6, 2014, 9:15 AM");
  expected.set(DateTime.DATETIME_HUGE, "Wednesday, August 6, 2014, 9:15 AM");
  expected.set(DateTime.DATETIME_SHORT_WITH_SECONDS, "8/6/2014, 9:15:36 AM");
  expected.set(DateTime.DATETIME_MED_WITH_SECONDS, "Aug 6, 2014, 9:15:36 AM");
  expected.set(DateTime.DATETIME_MED_WITH_WEEKDAY, "Wed, 6 Aug 2014, 9:15 AM");
  expected.set(DateTime.DATETIME_FULL_WITH_SECONDS, "August 6, 2014, 9:15:36 AM");
  expected.set(DateTime.DATETIME_HUGE_WITH_SECONDS, "Wednesday, August 6, 2014, 9:15:36 AM");

  expected.forEach((exp, fmt) => {
    expect(dt.toLocaleString(fmt)).toBe(exp);
  });
});

Helpers.withoutIntl(
  "DateTime#toLocaleString falls back on DATETIME_HUGE if it doesn't understand the input",
  () => {
    expect(DateTime.local(2014, 8, 6, 9, 15).toLocaleString({})).toBe(
      "Wednesday, August 6, 2014, 9:15 AM"
    );
  }
);

Helpers.withoutIntl("DateTime#toLocaleString uses English", () => {
  expect(
    DateTime.local(2014, 8, 6)
      .setLocale("fr")
      .toLocaleString()
  ).toBe("8/6/2014");

  expect(
    DateTime.local(2014, 8, 6, 9, 15)
      .setLocale("fr")
      .toLocaleString(DateTime.DATE_FULL)
  ).toBe("August 6, 2014");
});

Helpers.withoutIntl("DateTime#toLocaleParts returns an empty array", () => {
  expect(DateTime.local().toLocaleParts()).toEqual([]);
});

Helpers.withoutIntl("DateTime.fromFormat can parse numbers in other locales", () => {
  expect(DateTime.fromFormat("05/15/2017", "LL/dd/yyyy", { locale: "fr" }).isValid).toBe(true);
});

Helpers.withoutIntl("DateTime.fromFormat can't parse strings from other locales", () => {
  expect(DateTime.fromFormat("mai 15, 2017", "LLLL dd, yyyy", { locale: "fr" }).isValid).toBe(
    false
  );
});

Helpers.withoutIntl("using time zones results in invalid DateTimes", () => {
  expect(DateTime.local().setZone("America/New_York").isValid).toBe(false);
});

Helpers.withoutIntl("DateTime#zoneName falls back to 'local'", () => {
  expect(DateTime.local().zoneName).toBe("local");
});

Helpers.withoutIntl("DateTime#toLocaleString can use fixed-offset zones", () => {
  expect(
    DateTime.utc(2017, 5, 15, 4, 30)
      .setZone("UTC+1")
      .toLocaleString(DateTime.DATETIME_MED)
  ).toBe("May 15, 2017, 5:30 AM");
});

Helpers.withoutIntl("DateTime#offsetNameLong returns null", () => {
  expect(
    DateTime.fromObject({
      year: 2014,
      month: 8,
      day: 6,
      zone: "America/New_York"
    }).offsetNameLong
  ).toBe(null);
});

//------
// No FTP support
//-------

Helpers.withoutFTP("DateTime#toLocaleString is unaffected", () => {
  expect(
    DateTime.local(2014, 8, 6)
      .setLocale("fr")
      .toLocaleString()
  ).toBe("06/08/2014");
});

Helpers.withoutFTP("DateTime#toFormat works in English", () => {
  expect(DateTime.local(2014, 8, 6).toFormat("ccc")).toBe("Wed");
  expect(DateTime.local(2014, 8, 6).toFormat("yyyyMMdd")).toBe("20140806");
});

Helpers.withoutFTP("DateTime#toFormat falls back to English", () => {
  expect(
    DateTime.local(2014, 8, 6)
      .setLocale("fr")
      .toFormat("ccc")
  ).toBe("Wed");
});

Helpers.withoutFTP("DateTime.fromFormat works in English", () => {
  expect(DateTime.fromFormat("May 15, 2017", "LLLL dd, yyyy").isValid).toBe(true);
});

Helpers.withoutFTP("DateTime.fromFormat can parse numbers in other locales", () => {
  expect(DateTime.fromFormat("05/15/2017", "LL/dd/yyyy", { locale: "fr" }).isValid).toBe(true);
});

Helpers.withoutFTP("DateTime.fromFormat can't parse strings from other locales", () => {
  expect(DateTime.fromFormat("mai 15, 2017", "LLLL dd, yyyy", { locale: "fr" }).isValid).toBe(
    false
  );
});

Helpers.withoutFTP("setting the time zone still works", () => {
  expect(DateTime.local().setZone("America/New_York").isValid).toBe(true);
});

Helpers.withoutFTP("DateTime#offsetNameLong still works", () => {
  // can still generate offset name
  expect(
    DateTime.fromObject({
      year: 2014,
      month: 8,
      day: 6,
      zone: "America/New_York"
    }).offsetNameLong
  ).toBe("Eastern Daylight Time");
});

Helpers.withoutFTP("DateTime#toLocaleParts returns an empty array", () => {
  expect(DateTime.local().toLocaleParts()).toEqual([]);
});

//------
// No Zone support
//-------

Helpers.withoutZones("DateTime#toLocaleString is unaffected", () => {
  expect(
    DateTime.local(2014, 8, 6)
      .setLocale("fr")
      .toLocaleString()
  ).toBe("06/08/2014");
});

Helpers.withoutZones("DateTime#toLocaleParts is unaffected", () => {
  expect(
    DateTime.local(2014, 8, 6)
      .setLocale("fr")
      .toLocaleParts()
  ).toEqual([
    { type: "day", value: "06" },
    { type: "literal", value: "/" },
    { type: "month", value: "08" },
    { type: "literal", value: "/" },
    { type: "year", value: "2014" }
  ]);
});

Helpers.withoutZones("using time zones results in invalid DateTimes", () => {
  expect(DateTime.local().setZone("America/New_York").isValid).toBe(false);
});
