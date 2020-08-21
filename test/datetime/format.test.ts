import { DateTime } from "../../src";
import Helpers from "../helpers";

const dtMaker = () =>
    DateTime.fromObject(
      {
        year: 1982,
        month: 5,
        day: 25,
        hour: 9,
        minute: 23,
        second: 54,
        millisecond: 123
      },
      {
        zone: "utc"
      }
    ),
  dt = dtMaker();

//------
// #toJSON()
//------
test("DateTime#toJSON() just does toISO", () => {
  expect(dt.toJSON()).toBe("1982-05-25T09:23:54.123Z");
});

//------
// #toISO()
//------
test("DateTime#toISO() shows 'Z' for UTC", () => {
  expect(dt.toISO()).toBe("1982-05-25T09:23:54.123Z");
});

test("DateTime#toISO() shows the offset, unless explicitely asked not to", () => {
  const offsetted = dt.toUTC(-6 * 60);
  expect(offsetted.toISO()).toBe("1982-05-25T03:23:54.123-06:00");
  expect(offsetted.toISO({ includeOffset: false })).toBe("1982-05-25T03:23:54.123");
});

test("DateTime#toISO() supports the 'basic' format", () => {
  expect(dt.toISO({ format: "basic" })).toBe("19820525T092354.123Z");
});

test("DateTime#toISO() suppresses [milli]seconds", () => {
  const noZeroMilliseconds = { suppressMilliseconds: true };
  expect(dt.toISO(noZeroMilliseconds)).toBe("1982-05-25T09:23:54.123Z");
  expect(dt.set({ millisecond: 0 }).toISO(noZeroMilliseconds)).toBe("1982-05-25T09:23:54Z");

  const noZeroSeconds = { suppressSeconds: true, suppressMilliseconds: true };
  expect(dt.set({ millisecond: 0 }).toISO(noZeroSeconds)).toBe("1982-05-25T09:23:54Z");
  expect(dt.set({ second: 0, millisecond: 0 }).toISO(noZeroSeconds)).toBe("1982-05-25T09:23Z");
});

// #724, Firefox specific issue, offset prints as '-05:50.60000000000002'
test("DateTime#toISO() rounds fractional timezone minute offsets", () => {
  expect(
    DateTime.fromMillis(-62090696591000)
      .setZone("America/Chicago")
      .toISO()
  ).toBe("0002-06-04T10:26:13.000-05:50");
});

//------
// #toISODate()
//------
test("DateTime#toISODate() returns ISO 8601 date", () => {
  expect(dt.toISODate()).toBe("1982-05-25");
});

test("DateTime#toISODate() is local to the zone", () => {
  expect(dt.toUTC(-10 * 60).toISODate()).toBe("1982-05-24");
});

test("DateTime#toISODate() can output the basic format", () => {
  expect(dt.toISODate({ format: "basic" })).toBe("19820525");
});

test("DateTime#toISODate() returns ISO 8601 date in format [±YYYYY]", () => {
  expect(
    DateTime.fromObject({ year: 118040, month: 5, day: 25 }, { zone: "utc" }).toISODate()
  ).toBe("+118040-05-25");
  expect(
    DateTime.fromObject({ year: -118040, month: 5, day: 25 }, { zone: "utc" }).toISODate()
  ).toBe("-118040-05-25");
});

//------
// #toISOWeekDate()
//------
test("DateTime#toISOWeekDate() returns ISO 8601 date", () => {
  expect(dt.toISOWeekDate()).toBe("1982-W21-2");
});

//------
// #toISOTime()
//------
test("DateTime#toISOTime() returns an ISO 8601 date", () => {
  expect(dt.toISOTime()).toBe("09:23:54.123Z");
});

test("DateTime#toISOTime() won't suppress seconds by default", () => {
  expect(dt.startOf("minute").toISOTime()).toBe("09:23:00.000Z");
});

test("DateTime#toISOTime() won't suppress milliseconds by default", () => {
  expect(dt.startOf("second").toISOTime()).toBe("09:23:54.000Z");
});

test("DateTime#toISOTime({suppressMilliseconds: true}) won't suppress milliseconds if they're nonzero", () => {
  expect(dt.toISOTime({ suppressMilliseconds: true })).toBe("09:23:54.123Z");
});

test("DateTime#toISOTime({suppressMilliseconds: true}) will suppress milliseconds if they're zero", () => {
  expect(dt.set({ millisecond: 0 }).toISOTime({ suppressMilliseconds: true })).toBe("09:23:54Z");
});

test("DateTime#toISOTime({suppressSeconds: true}) won't suppress milliseconds if they're nonzero", () => {
  expect(dt.toISOTime({ suppressSeconds: true })).toBe("09:23:54.123Z");
});

test("DateTime#toISOTime({suppressSeconds: true}) will suppress milliseconds if they're zero", () => {
  expect(dt.set({ second: 0, millisecond: 0 }).toISOTime({ suppressSeconds: true })).toBe("09:23Z");
});

test("DateTime#toISOTime({suppressSeconds: true}) will suppress milliseconds if they're zero", () => {
  expect(dt.set({ second: 0, millisecond: 0 }).toISOTime({ suppressSeconds: true })).toBe("09:23Z");
});

test("DateTime#toISOTime() handles other offsets", () => {
  expect(dt.setZone("America/New_York").toISOTime()).toBe("05:23:54.123-04:00");
});

test("DateTime#toISOTime() can omit the offset", () => {
  expect(dt.toISOTime({ includeOffset: false })).toBe("09:23:54.123");
});

test("DateTime#toISOTime() can output the basic format", () => {
  expect(dt.toISOTime({ format: "basic" })).toBe("092354.123Z");
});

//------
// #toRFC2822()
//------

test("DateTime#toRFC2822() returns an RFC 2822 date", () => {
  expect(dt.toUTC().toRFC2822()).toBe("Tue, 25 May 1982 09:23:54 +0000");
  expect(dt.setZone("America/New_York").toRFC2822()).toBe("Tue, 25 May 1982 05:23:54 -0400");
  expect(dt.set({ hour: 15 }).toRFC2822()).toBe("Tue, 25 May 1982 15:23:54 +0000");
});

//------
// #toHTTP()
//------

test("DateTime#toHTTP() returns an RFC 1123 date", () => {
  expect(dt.toUTC().toHTTP()).toBe("Tue, 25 May 1982 09:23:54 GMT");
  expect(dt.setZone("America/New_York").toHTTP()).toBe("Tue, 25 May 1982 09:23:54 GMT");
  expect(dt.plus({ hours: 10 }).toHTTP()).toBe("Tue, 25 May 1982 19:23:54 GMT");
});

//------
// #toSQLDate()
//------

test("DateTime#toSQLDate() returns SQL date", () => {
  expect(dt.toUTC().toSQLDate()).toBe("1982-05-25");
  expect(dt.setZone("America/New_York").toSQLDate()).toBe("1982-05-25");
});

//------
// #toSQLTime()
//------

test("DateTime#toSQLTime() returns SQL time", () => {
  expect(dt.toUTC().toSQLTime()).toBe("09:23:54.123 Z");
  expect(dt.setZone("America/New_York").toSQLTime()).toBe("05:23:54.123 -04:00");
});

test("DateTime#toSQLTime() accepts an includeOffset option", () => {
  expect(dt.toUTC().toSQLTime({ includeOffset: false })).toBe("09:23:54.123");
  expect(dt.setZone("America/New_York").toSQLTime({ includeOffset: false })).toBe("05:23:54.123");
});

test("DateTime#toSQLTime() accepts an includeZone option", () => {
  expect(dt.toUTC().toSQLTime({ includeZone: true })).toBe("09:23:54.123 UTC");
  expect(dt.setZone("America/New_York").toSQLTime({ includeZone: true })).toBe(
    "05:23:54.123 America/New_York"
  );
});

//------
// #toSQL()
//------

test("DateTime#toSQL() returns SQL date time", () => {
  expect(dt.toUTC().toSQL()).toBe("1982-05-25 09:23:54.123 Z");
  expect(dt.setZone("America/New_York").toSQL()).toBe("1982-05-25 05:23:54.123 -04:00");
});

test("DateTime#toSQL() accepts an includeOffset option", () => {
  expect(dt.toUTC().toSQL({ includeOffset: false })).toBe("1982-05-25 09:23:54.123");
  expect(dt.setZone("America/New_York").toSQL({ includeOffset: false })).toBe(
    "1982-05-25 05:23:54.123"
  );
});

test("DateTime#toSQL() accepts an includeZone option", () => {
  expect(dt.toUTC().toSQL({ includeZone: true })).toBe("1982-05-25 09:23:54.123 UTC");
  expect(dt.setZone("America/New_York").toSQL({ includeZone: true })).toBe(
    "1982-05-25 05:23:54.123 America/New_York"
  );
});

//------
// #toString()
//-------
test("DateTime#toString() returns the ISO time", () => {
  expect(dt.toUTC(-6 * 60).toString()).toBe("1982-05-25T03:23:54.123-06:00");
});

//------
// #toLocaleString()
//-------
test("DateTime#toLocaleString returns a sensible string by default", () => {
  expect(dt.reconfigure({ locale: "en-US" }).toLocaleString()).toBe("5/25/1982");
});

test("DateTime#toLocaleString lets the locale set the numbering system", () => {
  expect(dt.reconfigure({ locale: "ja-JP" }).toLocaleString({ hour: "numeric" })).toBe("9時");
});

test("DateTime#toLocaleString accepts locale settings from the dateTime", () => {
  expect(dt.reconfigure({ locale: "be" }).toLocaleString()).toBe("25.5.1982");
});

test("DateTime#toLocaleString accepts numbering system settings from the dateTime", () => {
  expect(dt.reconfigure({ numberingSystem: "beng" }).toLocaleString()).toBe("৫/২৫/১৯৮২");
});

test("DateTime#toLocaleString accepts output calendar settings from the dateTime", () => {
  expect(dt.reconfigure({ outputCalendar: "islamic" }).toLocaleString()).toBe("8/2/1402");
});

test("DateTime#toLocaleString accepts options to the formatter", () => {
  expect(dt.toLocaleString({ weekday: "short" }).indexOf("Tue") >= 0).toBeTruthy();
});

test("DateTime#toLocaleString() shows things in the right IANA zone", () => {
  expect(dt.setZone("America/New_York").toLocaleString(DateTime.DATETIME_SHORT)).toBe(
    "5/25/1982, 5:23 AM"
  );
});

test("DateTime#toLocaleString() shows things in the right fixed-offset zone", () => {
  expect(dt.setZone("UTC-8").toLocaleString(DateTime.DATETIME_SHORT)).toBe("5/25/1982, 1:23 AM");
});

test("DateTime#toLocaleString() does the best it can with a fixed-offset zone when showing the zone", () => {
  expect(dt.setZone("UTC-8").toLocaleString(DateTime.DATETIME_FULL)).toBe(
    "May 25, 1982, 9:23 AM UTC"
  );
});

test("DateTime#toLocaleString uses locale-appropriate time formats", () => {
  expect(dt.reconfigure({ locale: "en-US" }).toLocaleString(DateTime.TIME_SIMPLE)).toBe("9:23 AM");
  expect(dt.reconfigure({ locale: "en-US" }).toLocaleString(DateTime.TIME_24_SIMPLE)).toBe("09:23");

  // France has 24-hour time by default
  expect(dt.reconfigure({ locale: "fr" }).toLocaleString(DateTime.TIME_SIMPLE)).toBe("09:23");
  expect(dt.reconfigure({ locale: "fr" }).toLocaleString(DateTime.TIME_24_SIMPLE)).toBe("09:23");

  // For whatever reason, Spain doesn't prefix with "0"
  expect(dt.reconfigure({ locale: "es" }).toLocaleString(DateTime.TIME_SIMPLE)).toBe("9:23");
  expect(dt.reconfigure({ locale: "es" }).toLocaleString(DateTime.TIME_24_SIMPLE)).toBe("9:23");
});

//------
// #resolvedLocaleOptions()
//------

test("DateTime#resolvedLocaleOptions returns a thing", () => {
  const res = DateTime.now().resolvedLocaleOptions();

  expect(res.outputCalendar).toBeDefined();
  expect(res.locale).toBeDefined();
  expect(res.numberingSystem).toBeDefined();
});

test("DateTime#resolvedLocaleOptions reflects changes to the locale", () => {
  const res = DateTime.now()
    .reconfigure({
      locale: "be",
      numberingSystem: "mong",
      outputCalendar: "coptic"
    })
    .resolvedLocaleOptions();

  expect(res.locale).toBe("be-u-ca-coptic-nu-mong");
  expect(res.outputCalendar).toBe("coptic");
  expect(res.numberingSystem).toBe("mong");
});

test("DateTime#resolvedLocaleOptions can override with options", () => {
  const res = DateTime.now().resolvedLocaleOptions({
    locale: "be",
    numberingSystem: "mong",
    outputCalendar: "coptic"
  });

  expect(res.locale).toBe("be-u-ca-coptic-nu-mong");
  expect(res.outputCalendar).toBe("coptic");
  expect(res.numberingSystem).toBe("mong");
});

Helpers.withoutIntl("DateTime#resolvedLocaleOptions default values without intl", () => {
  const res = DateTime.local().resolvedLocaleOptions();

  expect(res.outputCalendar).toBe("gregory");
  expect(res.locale).toBe("en-US");
  expect(res.numberingSystem).toBe("latn");
});

//------
// #toLocaleParts()
//------

test("DateTime#toLocaleParts returns a en-US by default", () => {
  expect(dt.reconfigure({ locale: "en-US" }).toLocaleParts()).toEqual([
    { type: "month", value: "5" },
    { type: "literal", value: "/" },
    { type: "day", value: "25" },
    { type: "literal", value: "/" },
    { type: "year", value: "1982" }
  ]);
});

test("DateTime#toLocaleParts accepts locale settings from the dateTime", () => {
  expect(dt.reconfigure({ locale: "be" }).toLocaleParts()).toEqual([
    { type: "day", value: "25" },
    { type: "literal", value: "." },
    { type: "month", value: "5" },
    { type: "literal", value: "." },
    { type: "year", value: "1982" }
  ]);
});

test("DateTime#toLocaleParts accepts date formatting options", () => {
  expect(dt.toLocaleParts(DateTime.TIME_24_SIMPLE)).toEqual([
    { type: "hour", value: "09" },
    { type: "literal", value: ":" },
    { type: "minute", value: "23" }
  ]);
});
