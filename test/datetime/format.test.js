/* global test expect */

import { DateTime, Zone, FixedOffsetZone } from "../../src/luxon";

const dtMaker = () =>
    DateTime.fromObject(
      {
        year: 1982,
        month: 5,
        day: 25,
        hour: 9,
        minute: 23,
        second: 54,
        millisecond: 123,
      },
      {
        zone: "utc",
      }
    ),
  dt = dtMaker(),
  invalid = DateTime.invalid("because");

class CustomZone extends Zone {
  constructor(name, offset) {
    super();
    this._name = name;
    this._offset = offset;
  }

  get isUniversal() {
    return true;
  }

  get isValid() {
    return true;
  }

  get name() {
    return this._name;
  }

  get type() {
    return "custom";
  }

  equals(zone) {
    return zone instanceof CustomZone && zone._name === this._name && zone._offset === this._offset;
  }

  offset(_ms) {
    return this._offset;
  }

  offsetName(_ms, { format }) {
    if (format === "short") {
      return this._name.substring(0, 4);
    } else {
      return this._name;
    }
  }

  formatOffset(...args) {
    return FixedOffsetZone.prototype.formatOffset(...args);
  }
}

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

test("DateTime#toISO() shows the offset, unless explicitly asked", () => {
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
  expect(dt.set({ seconds: 0, milliseconds: 0 }).toISO(noZeroSeconds)).toBe("1982-05-25T09:23Z");

  const suppressOnlySeconds = { suppressSeconds: true };
  expect(dt.set({ seconds: 0 }).toISO(suppressOnlySeconds)).toBe("1982-05-25T09:23:00.123Z");
  expect(dt.set({ seconds: 0, milliseconds: 0 }).toISO(suppressOnlySeconds)).toBe(
    "1982-05-25T09:23Z"
  );
});

test("DateTime#toISO() truncates [milli]seconds", () => {
  const truncateMilliseconds = { truncateMilliseconds: true };
  expect(dt.toISO(truncateMilliseconds)).toBe("1982-05-25T09:23:54Z");
  expect(dt.set({ millisecond: 0 }).toISO(truncateMilliseconds)).toBe("1982-05-25T09:23:54Z");

  const noZeroSeconds = {
    suppressSeconds: true,
    suppressMilliseconds: true,
    truncateMilliseconds: true,
  };
  expect(dt.set({ seconds: 0 }).toISO(noZeroSeconds)).toBe("1982-05-25T09:23Z");
  expect(dt.set({ millisecond: 0 }).toISO(noZeroSeconds)).toBe("1982-05-25T09:23:54Z");
  expect(dt.set({ seconds: 0, milliseconds: 0 }).toISO(noZeroSeconds)).toBe("1982-05-25T09:23Z");

  const suppressOnlySeconds = { suppressSeconds: true };
  expect(dt.set({ seconds: 0 }).toISO(suppressOnlySeconds)).toBe("1982-05-25T09:23:00.123Z");
  expect(dt.set({ seconds: 0, milliseconds: 0 }).toISO(suppressOnlySeconds)).toBe(
    "1982-05-25T09:23Z"
  );

  const suppressMillisecondsOnly = { suppressMilliseconds: true };
  expect(dt.toISO(suppressMillisecondsOnly)).toBe("1982-05-25T09:23:54.123Z");
  expect(dt.set({ seconds: 0, milliseconds: 0 }).toISO(suppressMillisecondsOnly)).toBe(
    "1982-05-25T09:23:00Z"
  );
});

test("DateTime#toISO() returns null for invalid DateTimes", () => {
  expect(invalid.toISO()).toBe(null);
});

// #724, Firefox specific issue, offset prints as '-05:50.60000000000002'
test("DateTime#toISO() rounds fractional timezone minute offsets", () => {
  expect(DateTime.fromMillis(-62090696591000).setZone("America/Chicago").toISO()).toBe(
    "0002-06-04T10:26:13.000-05:50"
  );
});

test("DateTime#toISO() handles long gregorian format", () => {
  const negativeYear = dt.set({ year: 12345 });
  expect(negativeYear.toISO()).toBe("+012345-05-25T09:23:54.123Z");
});

test("DateTime#toISO() handles negative years", () => {
  const negativeYear = dt.set({ year: -12345 });
  expect(negativeYear.toISO()).toBe("-012345-05-25T09:23:54.123Z");
});

test("DateTime#toISO() default to Z when timezone is 00:00", () => {
  const negativeYear = dt.setZone("utc");
  expect(negativeYear.toISO()).toBe("1982-05-25T09:23:54.123Z");
});

test("DateTime#toISO() renders 00:00 for non-offset but non utc datetimes", () => {
  const negativeYear = dt.setZone("Africa/Abidjan");
  expect(negativeYear.toISO()).toBe("1982-05-25T09:23:54.123+00:00");
});

test("DateTime#toISO() supports the extendedZone option", () => {
  let zoned = dt.setZone("America/Chicago");
  expect(zoned.toISO({ extendedZone: true })).toBe(
    "1982-05-25T04:23:54.123-05:00[America/Chicago]"
  );
  expect(zoned.toISO({ includeOffset: false, extendedZone: true })).toBe(
    "1982-05-25T04:23:54.123[America/Chicago]"
  );

  zoned = dt.setZone("UTC+6");
  expect(zoned.toISO({ extendedZone: true })).toBe("1982-05-25T15:23:54.123+06:00[Etc/GMT-6]");
  expect(zoned.toISO({ includeOffset: false, extendedZone: true })).toBe(
    "1982-05-25T15:23:54.123[Etc/GMT-6]"
  );

  zoned = dt.setZone("UTC");
  // note no Z
  expect(zoned.toISO({ extendedZone: true })).toBe("1982-05-25T09:23:54.123+00:00[Etc/UTC]");
  expect(zoned.toISO({ includeOffset: false, extendedZone: true })).toBe(
    "1982-05-25T09:23:54.123[Etc/UTC]"
  );
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

test("DateTime#toISODate() returns null for invalid DateTimes", () => {
  expect(invalid.toISODate()).toBe(null);
});

test("DateTime#toISODate() returns ISO 8601 date in format [±YYYYY]", () => {
  expect(
    DateTime.fromObject({ year: 118040, month: 5, day: 25 }, { zone: "utc" }).toISODate()
  ).toBe("+118040-05-25");
  expect(
    DateTime.fromObject({ year: -118040, month: 5, day: 25 }, { zone: "utc" }).toISODate()
  ).toBe("-118040-05-25");
});

test("DateTime#toISODate() correctly pads negative years", () => {
  expect(DateTime.fromObject({ year: -1, month: 1, day: 1 }, { zone: "utc" }).toISODate()).toBe(
    "-000001-01-01"
  );
  expect(DateTime.fromObject({ year: -10, month: 1, day: 1 }, { zone: "utc" }).toISODate()).toBe(
    "-000010-01-01"
  );
});

//------
// #toISOWeekDate()
//------
test("DateTime#toISOWeekDate() returns ISO 8601 date", () => {
  expect(dt.toISOWeekDate()).toBe("1982-W21-2");
});

test("DateTime#toISOWeekDate() returns null for invalid DateTimes", () => {
  expect(invalid.toISOWeekDate()).toBe(null);
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

test("DateTime#toISOTime() won't truncate milliseconds by default", () => {
  expect(dt.toISOTime()).toBe("09:23:54.123Z");
});

test("DateTime#toISOTime({suppressMilliseconds: true}) won't suppress milliseconds if they're nonzero", () => {
  expect(dt.toISOTime({ suppressMilliseconds: true })).toBe("09:23:54.123Z");
});

test("DateTime#toISOTime({suppressMilliseconds: true}) will suppress milliseconds if they're zero", () => {
  expect(dt.set({ millisecond: 0 }).toISOTime({ suppressMilliseconds: true })).toBe("09:23:54Z");
});

test("DateTime#toISOTime({truncateMilliseconds: true}) will truncate milliseconds if value is not zero", () => {
  expect(dt.toISOTime({ truncateMilliseconds: true })).toBe("09:23:54Z");
});

test("DateTime#toISOTime({truncateMilliseconds: true}) will truncate milliseconds if value is zero", () => {
  expect(dt.set({ millisecond: 0 }).toISOTime({ truncateMilliseconds: true })).toBe("09:23:54Z");
});

test("DateTime#toISOTime({suppressSeconds: true}) won't suppress milliseconds if they're nonzero", () => {
  expect(dt.toISOTime({ suppressSeconds: true })).toBe("09:23:54.123Z");
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
  const dt2 = dt.set({ second: 0, millisecond: 0 });
  expect(dt2.toISOTime({ format: "basic", suppressMilliseconds: true })).toBe("092300Z");
  expect(dt2.toISOTime({ format: "basic", suppressSeconds: true })).toBe("0923Z");
});

test("DateTime#toISOTime can include the prefix", () => {
  expect(dt.toISOTime({ includePrefix: true })).toBe("T09:23:54.123Z");
  expect(dt.toISOTime({ format: "basic", includePrefix: true })).toBe("T092354.123Z");
});

test("DateTime#toISOTime() returns null for invalid DateTimes", () => {
  expect(invalid.toISOTime()).toBe(null);
});

//------
// #toRFC2822()
//------

test("DateTime#toRFC2822() returns an RFC 2822 date", () => {
  expect(dt.toUTC().toRFC2822()).toBe("Tue, 25 May 1982 09:23:54 +0000");
  expect(dt.setZone("America/New_York").toRFC2822()).toBe("Tue, 25 May 1982 05:23:54 -0400");
  expect(dt.set({ hour: 15 }).toRFC2822()).toBe("Tue, 25 May 1982 15:23:54 +0000");
});

test("DateTime#toRFC2822() returns null for invalid DateTimes", () => {
  expect(invalid.toRFC2822()).toBe(null);
});

//------
// #toHTTP()
//------

test("DateTime#toHTTP() returns an RFC 1123 date", () => {
  expect(dt.toUTC().toHTTP()).toBe("Tue, 25 May 1982 09:23:54 GMT");
  expect(dt.setZone("America/New_York").toHTTP()).toBe("Tue, 25 May 1982 09:23:54 GMT");
  expect(dt.plus({ hours: 10 }).toHTTP()).toBe("Tue, 25 May 1982 19:23:54 GMT");
});

test("DateTime#toHTTP() returns null for invalid DateTimes", () => {
  expect(invalid.toHTTP()).toBe(null);
});

//------
// #toSQLDate()
//------

test("DateTime#toSQLDate() returns SQL date", () => {
  expect(dt.toUTC().toSQLDate()).toBe("1982-05-25");
  expect(dt.setZone("America/New_York").toSQLDate()).toBe("1982-05-25");
});

test("DateTime#toSQLDate() returns null for invalid DateTimes", () => {
  expect(invalid.toSQLDate()).toBe(null);
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

test("DateTime#toSQLTime() accepts an includeOffsetSpace option", () => {
  expect(dt.setZone("America/New_York").toSQLTime({ includeOffsetSpace: false })).toBe(
    "05:23:54.123-04:00"
  );
});

test("DateTime#toSQLTime() accepts an includeZone option", () => {
  expect(dt.toUTC().toSQLTime({ includeZone: true })).toBe("09:23:54.123 UTC");
  expect(dt.setZone("America/New_York").toSQLTime({ includeZone: true })).toBe(
    "05:23:54.123 America/New_York"
  );
});

test("DateTime#toSQLTime() returns null for invalid DateTimes", () => {
  expect(invalid.toSQLTime()).toBe(null);
});

//------
// #toSQL()
//------

test("DateTime#toSQL() returns SQL date time", () => {
  expect(dt.toUTC().toSQL()).toBe("1982-05-25 09:23:54.123 Z");
  expect(dt.setZone("America/New_York").toSQL()).toBe("1982-05-25 05:23:54.123 -04:00");
});

test("DateTime#toSQL() accepts space option", () => {
  expect(dt.setZone("America/New_York").toSQL({ includeOffsetSpace: false })).toBe(
    "1982-05-25 05:23:54.123-04:00"
  );
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

test("DateTime#toSQL() returns null for invalid DateTimes", () => {
  expect(invalid.toSQL()).toBe(null);
});

//------
// #toString()
//-------
test("DateTime#toString() returns the ISO time", () => {
  expect(dt.toUTC(-6 * 60).toString()).toBe("1982-05-25T03:23:54.123-06:00");
});

test("DateTime#toString() returns something different for invalid DateTimes", () => {
  expect(invalid.toString()).toBe("Invalid DateTime");
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
  expect(dt.reconfigure({ outputCalendar: "islamic" }).toLocaleString()).toBe("8/2/1402 AH");
});

test("DateTime#toLocaleString accepts options to the formatter", () => {
  expect(dt.toLocaleString({ weekday: "short" }).indexOf("Tue") >= 0).toBeTruthy();
});

test("DateTime#toLocaleString can override the dateTime's locale", () => {
  expect(dt.reconfigure({ locale: "be" }).toLocaleString({}, { locale: "fr" })).toBe("25/05/1982");
});

test("DateTime#toLocaleString can override the dateTime's numbering system", () => {
  expect(
    dt.reconfigure({ numberingSystem: "beng" }).toLocaleString({ numberingSystem: "mong" })
  ).toBe("᠕/᠒᠕/᠑᠙᠘᠒");
});

test("DateTime#toLocaleString can override the dateTime's output calendar", () => {
  expect(
    dt.reconfigure({ outputCalendar: "islamic" }).toLocaleString({}, { outputCalendar: "coptic" })
  ).toBe("9/17/1698 ERA1");
});

test("DateTime#toLocaleString() returns something different for invalid DateTimes", () => {
  expect(invalid.toLocaleString()).toBe("Invalid DateTime");
});

test("DateTime#toLocaleString() shows things in the right IANA zone", () => {
  expect(dt.setZone("America/New_York").toLocaleString(DateTime.DATETIME_SHORT)).toBe(
    "5/25/1982, 5:23 AM"
  );
});

test("DateTime#toLocaleString() shows things in the right fixed-offset zone", () => {
  expect(dt.setZone("UTC-8").toLocaleString(DateTime.DATETIME_SHORT)).toBe("5/25/1982, 1:23 AM");
});

test("DateTime#toLocaleString() shows things in the right fixed-offset zone when showing the zone", () => {
  expect(dt.setZone("UTC-8").toLocaleString(DateTime.DATETIME_FULL)).toBe(
    "May 25, 1982 at 1:23 AM GMT-8"
  );
});

test("DateTime#toLocaleString() shows things with UTC if fixed-offset zone with 0 offset is used", () => {
  expect(dt.setZone("UTC").toLocaleString(DateTime.DATETIME_FULL)).toBe(
    "May 25, 1982 at 9:23 AM UTC"
  );
});

test("DateTime#toLocaleString() does the best it can with unsupported fixed-offset zone when showing the zone", () => {
  expect(dt.setZone("UTC+4:30").toLocaleString(DateTime.DATETIME_FULL)).toBe(
    "May 25, 1982 at 1:53\u202FPM UTC+4:30"
  );
});

test("DateTime#toLocaleString() does the best it can with unsupported fixed-offset zone with timeStyle full", () => {
  expect(dt.setZone("UTC+4:30").toLocaleString({ timeStyle: "full" })).toBe(
    "1:53:54\u202FPM UTC+4:30"
  );
});

test("DateTime#toLocaleString() shows things in the right custom zone", () => {
  expect(dt.setZone(new CustomZone("CUSTOM", 30)).toLocaleString(DateTime.DATETIME_SHORT)).toBe(
    "5/25/1982, 9:53\u202FAM"
  );
});

test("DateTime#toLocaleString() shows things in the right custom zone when showing the zone", () => {
  expect(dt.setZone(new CustomZone("CUSTOM", 30)).toLocaleString(DateTime.DATETIME_FULL)).toBe(
    "May 25, 1982 at 9:53\u202FAM CUST"
  );
});

test("DateTime#toLocaleString() shows things in the right custom zone with timeStyle full", () => {
  expect(dt.setZone(new CustomZone("CUSTOM", 30)).toLocaleString({ timeStyle: "full" })).toBe(
    "9:53:54\u202FAM CUSTOM"
  );
});

test("DateTime#toLocaleString uses locale-appropriate time formats", () => {
  expect(dt.reconfigure({ locale: "en-US" }).toLocaleString(DateTime.TIME_SIMPLE)).toBe("9:23 AM");
  expect(dt.reconfigure({ locale: "en-US" }).toLocaleString(DateTime.TIME_24_SIMPLE)).toBe("09:23");

  // France has 24-hour time by default
  expect(dt.reconfigure({ locale: "fr" }).toLocaleString(DateTime.TIME_SIMPLE)).toBe("09:23");
  expect(dt.reconfigure({ locale: "fr" }).toLocaleString(DateTime.TIME_24_SIMPLE)).toBe("09:23");

  // For whatever reason, Spain doesn't prefix with "0"
  expect(dt.reconfigure({ locale: "es" }).toLocaleString(DateTime.TIME_SIMPLE)).toBe("9:23");
  expect(dt.reconfigure({ locale: "es" }).toLocaleString(DateTime.TIME_24_SIMPLE)).toBe("9:23");
});

test("DateTime#toLocaleString() respects language tags", () => {
  expect(dt.reconfigure({ locale: "en-US-u-hc-h23" }).toLocaleString(DateTime.TIME_SIMPLE)).toBe(
    "09:23"
  );
});

test("DateTime#toLocaleString() accepts a zone even when the zone is set", () => {
  expect(
    dt.toLocaleString({
      hour: "numeric",
      minute: "numeric",
      timeZoneName: "short",
      timeZone: "America/Los_Angeles",
    })
  ).toBe("2:23 AM PDT");
});

//------
// #resolvedLocaleOpts()
//------
test("DateTime#resolvedLocaleOpts returns a thing", () => {
  const res = DateTime.now().resolvedLocaleOptions();

  expect(res.outputCalendar).toBeDefined();
  expect(res.locale).toBeDefined();
  expect(res.numberingSystem).toBeDefined();
});

test("DateTime#resolvedLocaleOpts reflects changes to the locale", () => {
  const res = DateTime.now()
    .reconfigure({
      locale: "be",
      numberingSystem: "mong",
      outputCalendar: "coptic",
    })
    .resolvedLocaleOptions();

  expect(res.locale).toBe("be-u-ca-coptic-nu-mong");
  expect(res.outputCalendar).toBe("coptic");
  expect(res.numberingSystem).toBe("mong");
});

test("DateTime#resolvedLocaleOpts can override with options", () => {
  const res = DateTime.now().resolvedLocaleOptions({
    locale: "be",
    numberingSystem: "mong",
    outputCalendar: "coptic",
  });

  expect(res.locale).toBe("be-u-ca-coptic-nu-mong");
  expect(res.outputCalendar).toBe("coptic");
  expect(res.numberingSystem).toBe("mong");
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
    { type: "year", value: "1982" },
  ]);
});

test("DateTime#toLocaleParts accepts locale settings from the dateTime", () => {
  expect(dt.reconfigure({ locale: "be" }).toLocaleParts()).toEqual([
    { type: "day", value: "25" },
    { type: "literal", value: "." },
    { type: "month", value: "5" },
    { type: "literal", value: "." },
    { type: "year", value: "1982" },
  ]);
});

test("DateTime#toLocaleParts can override the dateTime's locale", () => {
  expect(dt.reconfigure({ locale: "be" }).toLocaleParts({ locale: "fr" })).toEqual([
    { type: "day", value: "25" },
    { type: "literal", value: "/" },
    { type: "month", value: "05" },
    { type: "literal", value: "/" },
    { type: "year", value: "1982" },
  ]);
});

test("DateTime#toLocaleParts accepts date formatting options", () => {
  expect(dt.toLocaleParts(DateTime.TIME_24_SIMPLE)).toEqual([
    { type: "hour", value: "09" },
    { type: "literal", value: ":" },
    { type: "minute", value: "23" },
  ]);
});

test("DateTime#toLocaleParts returns empty for invalid DateTimes", () => {
  expect(invalid.toLocaleParts()).toEqual([]);
});
