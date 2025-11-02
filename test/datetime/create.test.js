import { describe, test, expect } from "vitest";

import { DateTime, Settings } from "../../src/luxon.ts";
import * as Helpers from "../helpers";
import { supportsMinDaysInFirstWeek } from "../helpers";
import { hasMissingLocaleBeSupport, isMissingLocaleWeekInfo } from "../specialCases";
import { InvalidArgumentError, InvalidDateTimeError, InvalidZoneError } from "../../src/errors.ts";
import { INVALID_UNIT_VALUE } from "../../src/impl/dateTimeErrors.ts";

const withDefaultLocale = Helpers.withDefaultLocale,
  withDefaultNumberingSystem = Helpers.setUnset("defaultNumberingSystem"),
  withDefaultOutputCalendar = Helpers.setUnset("defaultOutputCalendar"),
  withthrowOnInvalid = Helpers.setUnset("throwOnInvalid"),
  withDefaultZone = Helpers.withDefaultZone,
  withDefaultWeekSettings = Helpers.setUnset("defaultWeekSettings");

//------
// .now()
//------
test("DateTime.now has today's date", () => {
  const date = new Date(),
    now = DateTime.now();
  expect(now.toJSDate().getDate()).toBe(date.getDate());
  // The two instants should be a few milliseconds apart
  expect(Math.abs(now.valueOf() - date.valueOf()) < 1000).toBe(true);
});

test("DateTime.now accepts the default locale", () => {
  withDefaultLocale("fr", () => expect(DateTime.now().locale).toBe("fr"));
});

test("DateTime.now accepts the default numbering system", () => {
  withDefaultNumberingSystem("beng", () => expect(DateTime.now().numberingSystem).toBe("beng"));
});

test("DateTime.now accepts the default output calendar", () => {
  withDefaultOutputCalendar("hebrew", () => expect(DateTime.now().outputCalendar).toBe("hebrew"));
});

test("DateTime.now accepts the default time zone", () => {
  withDefaultZone("Europe/Paris", () => expect(DateTime.now().zoneName).toBe("Europe/Paris"));
});

//------
// .local()
//------
test("DateTime.local() has today's date", () => {
  const date = new Date(),
    now = DateTime.local();
  expect(now.toJSDate().getDate()).toBe(date.getDate());
  // The two instants should be a few milliseconds apart
  expect(Math.abs(now.valueOf() - date.valueOf()) < 1000).toBe(true);
});

test("DateTime.local(2017) is the beginning of the year", () => {
  const dt = DateTime.local(2017);
  expect(dt.year).toBe(2017);
  expect(dt.month).toBe(1);
  expect(dt.day).toBe(1);
  expect(dt.hour).toBe(0);
  expect(dt.minute).toBe(0);
  expect(dt.second).toBe(0);
  expect(dt.millisecond).toBe(0);
});

test("DateTime.local(2017, 6) is the beginning of the month", () => {
  const dt = DateTime.local(2017, 6);
  expect(dt.year).toBe(2017);
  expect(dt.month).toBe(6);
  expect(dt.day).toBe(1);
  expect(dt.hour).toBe(0);
  expect(dt.minute).toBe(0);
  expect(dt.second).toBe(0);
  expect(dt.millisecond).toBe(0);
});

test("DateTime.local(2017, 6, 12) is the beginning of 6/12", () => {
  const dt = DateTime.local(2017, 6, 12);
  expect(dt.year).toBe(2017);
  expect(dt.month).toBe(6);
  expect(dt.day).toBe(12);
  expect(dt.hour).toBe(0);
  expect(dt.minute).toBe(0);
  expect(dt.second).toBe(0);
  expect(dt.millisecond).toBe(0);
});

test("DateTime.local(2017, 6, 12, 5) is the beginning of the hour", () => {
  const dt = DateTime.local(2017, 6, 12, 5);
  expect(dt.year).toBe(2017);
  expect(dt.month).toBe(6);
  expect(dt.day).toBe(12);
  expect(dt.hour).toBe(5);
  expect(dt.minute).toBe(0);
  expect(dt.second).toBe(0);
  expect(dt.millisecond).toBe(0);
});

test("DateTime.local(2017, 6, 12, 5, 25) is the beginning of the minute", () => {
  const dt = DateTime.local(2017, 6, 12, 5, 25);
  expect(dt.year).toBe(2017);
  expect(dt.month).toBe(6);
  expect(dt.day).toBe(12);
  expect(dt.hour).toBe(5);
  expect(dt.minute).toBe(25);
  expect(dt.second).toBe(0);
  expect(dt.millisecond).toBe(0);
});

test("DateTime.local(2017, 6, 12, 5, 25, 16) is the beginning of the second", () => {
  const dt = DateTime.local(2017, 6, 12, 5, 25, 16);
  expect(dt.year).toBe(2017);
  expect(dt.month).toBe(6);
  expect(dt.day).toBe(12);
  expect(dt.hour).toBe(5);
  expect(dt.minute).toBe(25);
  expect(dt.second).toBe(16);
  expect(dt.millisecond).toBe(0);
});

test("DateTime.local(2017, 6, 12, 5, 25, 16, 255) is right down to the millisecond", () => {
  const dt = DateTime.local(2017, 6, 12, 5, 25, 16, 255);
  expect(dt.year).toBe(2017);
  expect(dt.month).toBe(6);
  expect(dt.day).toBe(12);
  expect(dt.hour).toBe(5);
  expect(dt.minute).toBe(25);
  expect(dt.second).toBe(16);
  expect(dt.millisecond).toBe(255);
});

test("DateTime.local accepts the default locale", () => {
  withDefaultLocale("fr", () => expect(DateTime.local().locale).toBe("fr"));
});

test("DateTime.local accepts the default numbering system", () => {
  withDefaultNumberingSystem("beng", () => expect(DateTime.local().numberingSystem).toBe("beng"));
});

test("DateTime.local accepts the default output calendar", () => {
  withDefaultOutputCalendar("hebrew", () => expect(DateTime.local().outputCalendar).toBe("hebrew"));
});

test("DateTime.local does not accept non-integer values", () => {
  expect(() => DateTime.local(2017, 6.7, 12)).toThrow(TypeError);
});

describe("DateTime.local does not accept out of range values", () => {
  test.each([15, -2, 0])("for month $0", (m) => {
    expect(() => DateTime.local(2017, m, 12)).toThrow(RangeError);
  });
  test.each([
    [2024, 12, 32],
    [2024, 11, 31],
    [2024, 2, 30],
    [2023, 2, 29],
    [2024, 10, -2],
  ])("for day", (year, month, day) => {
    expect(() => DateTime.local(year, month, day)).toThrow(RangeError);
  });
});

test("DateTime.local accepts the default time zone", () => {
  withDefaultZone("Europe/Paris", () => expect(DateTime.local().zoneName).toBe("Europe/Paris"));
});

test("DateTime.local accepts an options hash in any position", () => {
  const options = {
    zone: "Europe/Paris",
    numberingSystem: "beng",
    outputCalendar: "islamic",
    locale: "fr",
  };
  const args = [
    DateTime.local(options),
    DateTime.local(2017, options),
    DateTime.local(2017, 6, options),
    DateTime.local(2017, 6, 12, options),
    DateTime.local(2017, 6, 12, options),
    DateTime.local(2017, 6, 12, 5, options),
    DateTime.local(2017, 6, 12, 5, 25, options),
    DateTime.local(2017, 6, 12, 5, 25, 16, options),
    DateTime.local(2017, 6, 12, 5, 25, 16, 255, options),
  ];

  for (const i in args) {
    const dt = args[i];
    expect(dt.zoneName).toBe("Europe/Paris");
    expect(dt.numberingSystem).toBe("beng");
    expect(dt.outputCalendar).toBe("islamic");
    expect(dt.locale).toBe("fr");
  }
});

//------
// .utc()
//-------
test("DateTime.utc() is in utc", () => {
  const now = DateTime.utc();
  expect(now.offset).toBe(0);
});

test("DateTime.utc(2017) is the beginning of the year", () => {
  const dt = DateTime.utc(2017);
  expect(dt.year).toBe(2017);
  expect(dt.month).toBe(1);
  expect(dt.day).toBe(1);
  expect(dt.hour).toBe(0);
  expect(dt.minute).toBe(0);
  expect(dt.second).toBe(0);
  expect(dt.millisecond).toBe(0);
});

test("DateTime.utc(2017, 6) is the beginning of the month", () => {
  const dt = DateTime.utc(2017, 6);
  expect(dt.year).toBe(2017);
  expect(dt.month).toBe(6);
  expect(dt.day).toBe(1);
  expect(dt.hour).toBe(0);
  expect(dt.minute).toBe(0);
  expect(dt.second).toBe(0);
  expect(dt.millisecond).toBe(0);
});

test("DateTime.utc(2017, 6, 12) is the beginning of 6/12", () => {
  const dt = DateTime.utc(2017, 6, 12);
  expect(dt.year).toBe(2017);
  expect(dt.month).toBe(6);
  expect(dt.day).toBe(12);
  expect(dt.hour).toBe(0);
  expect(dt.minute).toBe(0);
  expect(dt.second).toBe(0);
  expect(dt.millisecond).toBe(0);
});

test("DateTime.utc(2017, 6, 12, 5) is the beginning of the hour", () => {
  const dt = DateTime.utc(2017, 6, 12, 5);
  expect(dt.year).toBe(2017);
  expect(dt.month).toBe(6);
  expect(dt.day).toBe(12);
  expect(dt.hour).toBe(5);
  expect(dt.minute).toBe(0);
  expect(dt.second).toBe(0);
  expect(dt.millisecond).toBe(0);
});

test("DateTime.utc(2017, 6, 12, 5, 25) is the beginning of the minute", () => {
  const dt = DateTime.utc(2017, 6, 12, 5, 25);
  expect(dt.year).toBe(2017);
  expect(dt.month).toBe(6);
  expect(dt.day).toBe(12);
  expect(dt.hour).toBe(5);
  expect(dt.minute).toBe(25);
  expect(dt.second).toBe(0);
  expect(dt.millisecond).toBe(0);
});

test("DateTime.utc(2017, 6, 12, 5, 25, 16) is the beginning of the second", () => {
  const dt = DateTime.utc(2017, 6, 12, 5, 25, 16);
  expect(dt.year).toBe(2017);
  expect(dt.month).toBe(6);
  expect(dt.day).toBe(12);
  expect(dt.hour).toBe(5);
  expect(dt.minute).toBe(25);
  expect(dt.second).toBe(16);
  expect(dt.millisecond).toBe(0);
});

test("DateTime.utc(2017, 6, 12, 5, 25, 16, 255) is right down to the millisecond", () => {
  const dt = DateTime.utc(2017, 6, 12, 5, 25, 16, 255);
  expect(dt.year).toBe(2017);
  expect(dt.month).toBe(6);
  expect(dt.day).toBe(12);
  expect(dt.hour).toBe(5);
  expect(dt.minute).toBe(25);
  expect(dt.second).toBe(16);
  expect(dt.millisecond).toBe(255);
});

test("DateTime.utc accepts the default locale", () => {
  withDefaultLocale("fr", () => expect(DateTime.utc().locale).toBe("fr"));
});

test("DateTime.utc accepts an options hash in any position", () => {
  const options = {
    numberingSystem: "beng",
    outputCalendar: "islamic",
    locale: "fr",
  };
  const args = [
    DateTime.utc(options),
    DateTime.utc(2017, options),
    DateTime.utc(2017, 6, options),
    DateTime.utc(2017, 6, 12, options),
    DateTime.utc(2017, 6, 12, options),
    DateTime.utc(2017, 6, 12, 5, options),
    DateTime.utc(2017, 6, 12, 5, 25, options),
    DateTime.utc(2017, 6, 12, 5, 25, 16, options),
    DateTime.utc(2017, 6, 12, 5, 25, 16, 255, options),
  ];

  for (const i in args) {
    const dt = args[i];
    expect(dt.zoneName).toBe("UTC");
    expect(dt.numberingSystem).toBe("beng");
    expect(dt.outputCalendar).toBe("islamic");
    expect(dt.locale).toBe("fr");
  }
});

//------
// .fromJSDate()
//-------
test("DateTime.fromJSDate(date) clones the date", () => {
  const date = new Date(1982, 4, 25),
    dateTime = DateTime.fromJSDate(date),
    oldValue = dateTime.valueOf();

  date.setDate(14);
  expect(dateTime.toJSDate().valueOf()).toBe(oldValue);
});

test("DateTime.fromJSDate(date) accepts a zone option", () => {
  const date = new Date(1982, 4, 25),
    dateTime = DateTime.fromJSDate(date, { zone: "America/Santiago" });

  expect(dateTime.toJSDate().valueOf()).toBe(date.valueOf());
  expect(dateTime.zoneName).toBe("America/Santiago");
});

test("DateTime.fromJSDate accepts the default locale", () => {
  withDefaultLocale("fr", () => expect(DateTime.fromJSDate(new Date()).locale).toBe("fr"));
});

test.for(["", 15, null, undefined, 13n, {}, { valueOf: () => 15 }, "2019-04-16T11:32:32Z"])(
  "DateTime.fromJSDate(date) throw errors for invalid argument $0",
  (val) => {
    expect(() => DateTime.fromJSDate(val)).toThrow(TypeError);
  }
);

test("DateTime.fromJSDate throws for invalid Date objects", () => {
  expect(() => DateTime.fromJSDate(new Date(""))).toThrow(TypeError);
});

test("DateTime.fromJSDate throws for invalid time zones", () => {
  expect(() => DateTime.fromJSDate(new Date(), { zone: "America/Blorp" })).toThrow(
    InvalidZoneError
  );
});

//------
// .fromMillis()
//-------
test("DateTime.fromMillis(ms) has a value of ms", () => {
  const bigValue = 391147200000;
  expect(DateTime.fromMillis(bigValue).valueOf()).toBe(bigValue);

  expect(DateTime.fromMillis(0).valueOf()).toBe(0);
});

test("DateTime.fromMillis(ms) accepts a zone option", () => {
  const value = 391147200000,
    dateTime = DateTime.fromMillis(value, { zone: "America/Santiago" });

  expect(dateTime.valueOf()).toBe(value);
  expect(dateTime.zoneName).toBe("America/Santiago");
});

test("DateTime.fromMillis accepts the default locale", () => {
  withDefaultLocale("fr", () => expect(DateTime.fromMillis(391147200000).locale).toBe("fr"));
});

test.each(["slurp", 3.5, { valueOf: () => 1 }, new Date(15), 13n])(
  "DateTime.fromMillis($0) throws TypeError",
  (v) => {
    expect(() => DateTime.fromMillis(v)).toThrow(TypeError);
  }
);

test.each([-8.64e15 - 1, 8.64e15 + 1])(
  "DateTime.fromMillis(ms) does not accept out-of-bounds numbers",
  () => {
    expect(() => DateTime.fromMillis(-8.64e15 - 1)).toThrow(RangeError);
  }
);

test.each([Infinity, -Infinity, NaN])(
  "DateTime.fromMillis(ms) does not accept non-finite number $0",
  (v) => {
    expect(() => DateTime.fromMillis(v)).toThrow(TypeError);
  }
);

test("DateTime.fromMillis(-0) is normalized to 0", () => {
  expect(DateTime.fromMillis(-0).toMillis()).toBe(0);
});

//------
// .fromSeconds()
//-------
test("DateTime.fromSeconds(seconds) has a value of 1000 * seconds", () => {
  const seconds = 391147200;
  expect(DateTime.fromSeconds(seconds).valueOf()).toBe(1000 * seconds);

  expect(DateTime.fromSeconds(0).valueOf()).toBe(0);
});

test("DateTime.fromSeconds(seconds) accepts a zone option", () => {
  const seconds = 391147200,
    dateTime = DateTime.fromSeconds(seconds, { zone: "America/Santiago" });

  expect(dateTime.valueOf()).toBe(1000 * seconds);
  expect(dateTime.zoneName).toBe("America/Santiago");
});

test("DateTime.fromSeconds accepts the default locale", () => {
  withDefaultLocale("fr", () => expect(DateTime.fromSeconds(391147200).locale).toBe("fr"));
});

test.each(["slurp", 3.5, { valueOf: () => 1 }, new Date(15), 13n])(
  "DateTime.fromSeconds($0) throws TypeError",
  (v) => {
    expect(() => DateTime.fromSeconds(v)).toThrow(TypeError);
  }
);

test.each([-8.64e12 - 1, 8.64e12 + 1])(
  "DateTime.fromSeconds(seconds) does not accept out-of-bounds number $0",
  (v) => {
    expect(() => DateTime.fromSeconds(v)).toThrow(RangeError);
  }
);
test.each([Infinity, -Infinity, NaN])(
  "DateTime.fromSeconds(seconds) does not accept non-finite number $0",
  (v) => {
    expect(() => DateTime.fromSeconds(v)).toThrow(TypeError);
  }
);

test("DateTime.fromSeconds(-0) is normalized to 0", () => {
  expect(DateTime.fromSeconds(-0).toMillis()).toBe(0);
});

//------
// .fromObject()
//-------
const baseObject = {
  year: 1982,
  month: 5,
  day: 25,
  hour: 9,
  minute: 23,
  second: 54,
  millisecond: 123,
};

test("DateTime.fromObject() sets all the fields", () => {
  const dateTime = DateTime.fromObject(baseObject);

  expect(dateTime.isOffsetFixed).toBe(false);
  expect(dateTime.year).toBe(1982);
  expect(dateTime.month).toBe(5);
  expect(dateTime.day).toBe(25);
  expect(dateTime.hour).toBe(9);
  expect(dateTime.minute).toBe(23);
  expect(dateTime.second).toBe(54);
  expect(dateTime.millisecond).toBe(123);
});

test('DateTime.fromObject() accepts a zone option of "utc"', () => {
  const dateTime = DateTime.fromObject(baseObject, { zone: "utc" });

  expect(dateTime.isOffsetFixed).toBe(true);
  expect(dateTime.year).toBe(1982);
  expect(dateTime.month).toBe(5);
  expect(dateTime.day).toBe(25);
  expect(dateTime.hour).toBe(9);
  expect(dateTime.minute).toBe(23);
  expect(dateTime.second).toBe(54);
  expect(dateTime.millisecond).toBe(123);
});

test('DateTime.fromObject() accepts "utc-8" as the zone option', () => {
  const dateTime = DateTime.fromObject(baseObject, { zone: "utc-8" });

  expect(dateTime.isOffsetFixed).toBe(true);
  expect(dateTime.offset).toBe(-8 * 60);
  expect(dateTime.year).toBe(1982);
  expect(dateTime.month).toBe(5);
  expect(dateTime.day).toBe(25);
  expect(dateTime.hour).toBe(9);
  expect(dateTime.minute).toBe(23);
  expect(dateTime.second).toBe(54);
  expect(dateTime.millisecond).toBe(123);
});

test('DateTime.fromObject() accepts "America/Los_Angeles" as the zone option', () => {
  const dateTime = DateTime.fromObject(baseObject, { zone: "America/Los_Angeles" });

  expect(dateTime.isOffsetFixed).toBe(false);
  expect(dateTime.offset).toBe(-7 * 60);
  expect(dateTime.year).toBe(1982);
  expect(dateTime.month).toBe(5);
  expect(dateTime.day).toBe(25);
  expect(dateTime.hour).toBe(9);
  expect(dateTime.minute).toBe(23);
  expect(dateTime.second).toBe(54);
  expect(dateTime.millisecond).toBe(123);
});

test("DateTime.fromObject() accepts a Zone as the zone option", () => {
  const daylight = DateTime.fromObject(
    { ...baseObject, month: 5 },
    { zone: "America/Los_Angeles" }
  );
  const standard = DateTime.fromObject(
    { ...baseObject, month: 12 },
    { zone: "America/Los_Angeles" }
  );

  expect(daylight.isOffsetFixed).toBe(false);
  expect(daylight.offset).toBe(-7 * 60);
  expect(daylight.year).toBe(1982);
  expect(daylight.month).toBe(5);
  expect(daylight.day).toBe(25);
  expect(daylight.hour).toBe(9);
  expect(daylight.minute).toBe(23);
  expect(daylight.second).toBe(54);
  expect(daylight.millisecond).toBe(123);

  expect(standard.isOffsetFixed).toBe(false);
  expect(standard.offset).toBe(-8 * 60);
  expect(standard.year).toBe(1982);
  expect(standard.month).toBe(12);
  expect(standard.day).toBe(25);
  expect(standard.hour).toBe(9);
  expect(standard.minute).toBe(23);
  expect(standard.second).toBe(54);
  expect(standard.millisecond).toBe(123);
});

test("DateTime.fromObject() rejects invalid zones", () => {
  expect(() => DateTime.fromObject({}, { zone: "blorp" })).toThrow(InvalidZoneError);
});

test("DateTime.fromObject() ignores the case of object keys", () => {
  const dt = DateTime.fromObject({ Year: 2019, MONTH: 4, daYs: 10 });
  expect(dt.year).toBe(2019);
  expect(dt.month).toBe(4);
  expect(dt.day).toBe(10);
});

test("DateTime.fromObject() throws with invalid object key", () => {
  expect(() => DateTime.fromObject({ invalidUnit: 42 })).toThrow();
});

describe("DateTime.fromObject() throws with invalid value types", () => {
  test.for(
    [
      "year",
      "month",
      "day",
      "hour",
      "minute",
      "second",
      "millisecond",
      "weekYear",
      "weekNumber",
      "weekday",
      "localWeekYear",
      "localWeekNumber",
      "localWeekday",
    ].flatMap((unit) => {
      return [
        "blorb",
        "",
        NaN,
        Infinity,
        -Infinity,
        true,
        false,
        {},
        { unit: 1 },
        { valueOf: () => 1 },
      ].map((val) => [val, unit]);
    })
  )("$1: $0", ([val, unit]) => {
    expect(() => DateTime.fromObject({ [unit]: val })).toThrow(TypeError);
  });
});

test("DateTime.fromObject() reject invalid values", () => {
  expect(DateTime.fromObject({ ordinal: 5000 }).isValid).toBe(false);
  expect(DateTime.fromObject({ minute: -6 }).isValid).toBe(false);
  expect(DateTime.fromObject({ millisecond: new Date() }).isValid).toBe(false);
});

test("DateTime.fromObject() defaults high-order values to the current date", () => {
  const dateTime = DateTime.fromObject({}),
    now = DateTime.now();

  expect(dateTime.year).toBe(now.year);
  expect(dateTime.month).toBe(now.month);
  expect(dateTime.day).toBe(now.day);
});

test("DateTime.fromObject() defaults lower-order values to their minimums if a high-order value is set", () => {
  const dateTime = DateTime.fromObject({ year: 2017 });
  expect(dateTime.year).toBe(2017);
  expect(dateTime.month).toBe(1);
  expect(dateTime.day).toBe(1);
  expect(dateTime.hour).toBe(0);
  expect(dateTime.minute).toBe(0);
  expect(dateTime.second).toBe(0);
  expect(dateTime.millisecond).toBe(0);
});

test("DateTime.fromObject() w/weeks handles fully specified dates", () => {
  const dt = DateTime.fromObject({
    weekYear: 2016,
    weekNumber: 2,
    weekday: 3,
    hour: 9,
    minute: 23,
    second: 54,
    millisecond: 123,
  });
  expect(dt.weekYear).toBe(2016);
  expect(dt.weekNumber).toBe(2);
  expect(dt.weekday).toBe(3);
  expect(dt.year).toBe(2016);
  expect(dt.month).toBe(1);
  expect(dt.day).toBe(13);
});

test("DateTime.fromObject() w/weekYears handles skew with Gregorian years", () => {
  let dt = DateTime.fromObject({ weekYear: 2015, weekNumber: 1, weekday: 3 });
  expect(dt.weekYear).toBe(2015);
  expect(dt.weekNumber).toBe(1);
  expect(dt.weekday).toBe(3);
  expect(dt.year).toBe(2014);
  expect(dt.month).toBe(12);
  expect(dt.day).toBe(31);

  dt = DateTime.fromObject({ weekYear: 2009, weekNumber: 53, weekday: 5 });
  expect(dt.weekYear).toBe(2009);
  expect(dt.weekNumber).toBe(53);
  expect(dt.weekday).toBe(5);
  expect(dt.year).toBe(2010);
  expect(dt.month).toBe(1);
  expect(dt.day).toBe(1);
});

test("DateTime.fromObject() w/weeks defaults high-order values to the current date", () => {
  const dt = DateTime.fromObject({ weekday: 2 }),
    now = DateTime.now();

  expect(dt.weekYear).toBe(now.weekYear);
  expect(dt.weekNumber).toBe(now.weekNumber);
  expect(dt.weekday).toBe(2);
});

test("DateTime.fromObject() w/weeks defaults low-order values to their minimums", () => {
  const dt = DateTime.fromObject({ weekYear: 2016 });

  expect(dt.weekYear).toBe(2016);
  expect(dt.weekNumber).toBe(1);
  expect(dt.weekday).toBe(1);
  expect(dt.hour).toBe(0);
  expect(dt.minute).toBe(0);
  expect(dt.second).toBe(0);
  expect(dt.millisecond).toBe(0);
});

test("DateTime.fromObject() w/locale weeks defaults low-order values to their minimums", () => {
  const dt = DateTime.fromObject({ localWeekYear: 2016 }, { locale: "en-US" });

  expect(dt.localWeekYear).toBe(2016);
  expect(dt.localWeekNumber).toBe(1);
  expect(dt.localWeekday).toBe(1);
  expect(dt.hour).toBe(0);
  expect(dt.minute).toBe(0);
  expect(dt.second).toBe(0);
  expect(dt.millisecond).toBe(0);
});

test("DateTime.fromObject() w/locale weeks defaults high-order values to the current date", () => {
  const dt = DateTime.fromObject({ localWeekday: 2 }, { locale: "en-US" }),
    now = DateTime.local({ locale: "en-US" });

  expect(dt.localWeekYear).toBe(now.localWeekYear);
  expect(dt.localWeekNumber).toBe(now.localWeekNumber);
  expect(dt.localWeekday).toBe(2);
});

test.skipIf(isMissingLocaleWeekInfo)(
  "DateTime.fromObject() w/locale weeks handles fully specified dates",
  () => {
    const dt = DateTime.fromObject(
      {
        localWeekYear: 2022,
        localWeekNumber: 2,
        localWeekday: 3,
        hour: 9,
        minute: 23,
        second: 54,
        millisecond: 123,
      },
      { locale: "en-US" }
    );
    expect(dt.localWeekYear).toBe(2022);
    expect(dt.localWeekNumber).toBe(2);
    expect(dt.localWeekday).toBe(3);
    expect(dt.year).toBe(2022);
    expect(dt.month).toBe(1);
    expect(dt.day).toBe(supportsMinDaysInFirstWeek() ? 4 : 11);
  }
);

test("DateTime.fromObject() w/locale weeks handles fully specified dates with custom week settings", () => {
  withDefaultWeekSettings(
    {
      firstDay: 7,
      minimalDays: 1,
      weekend: [6, 7],
    },
    () => {
      const dt = DateTime.fromObject(
        {
          localWeekYear: 2022,
          localWeekNumber: 2,
          localWeekday: 3,
          hour: 9,
          minute: 23,
          second: 54,
          millisecond: 123,
        },
        { locale: "en-US" }
      );
      expect(dt.localWeekYear).toBe(2022);
      expect(dt.localWeekNumber).toBe(2);
      expect(dt.localWeekday).toBe(3);
      expect(dt.year).toBe(2022);
      expect(dt.month).toBe(1);
      expect(dt.day).toBe(4);
    }
  );
});

test.skipIf(isMissingLocaleWeekInfo)(
  "DateTime.fromObject() w/localWeekYears handles skew with Gregorian years",
  () => {
    let dt = DateTime.fromObject(
      { localWeekYear: 2022, localWeekNumber: 1, localWeekday: 1 },
      { locale: "en-US" }
    );
    expect(dt.localWeekYear).toBe(2022);
    expect(dt.localWeekNumber).toBe(1);
    expect(dt.localWeekday).toBe(1);
    expect(dt.year).toBe(supportsMinDaysInFirstWeek() ? 2021 : 2022);
    expect(dt.month).toBe(supportsMinDaysInFirstWeek() ? 12 : 1);
    expect(dt.day).toBe(supportsMinDaysInFirstWeek() ? 26 : 2);

    dt = DateTime.fromObject(
      { localWeekYear: 2009, localWeekNumber: 53, localWeekday: 5 },
      { locale: "de-DE" }
    );
    expect(dt.localWeekYear).toBe(2009);
    expect(dt.localWeekNumber).toBe(53);
    expect(dt.localWeekday).toBe(5);
    expect(dt.year).toBe(2010);
    expect(dt.month).toBe(1);
    expect(dt.day).toBe(1);
  }
);

test("DateTime.fromObject() w/localWeekYears handles skew with Gregorian years and custom week settings", () => {
  withDefaultWeekSettings(
    {
      firstDay: 7,
      minimalDays: 1,
      weekend: [6, 7],
    },
    () => {
      let dt = DateTime.fromObject({ localWeekYear: 2022, localWeekNumber: 1, localWeekday: 1 });
      expect(dt.localWeekYear).toBe(2022);
      expect(dt.localWeekNumber).toBe(1);
      expect(dt.localWeekday).toBe(1);
      expect(dt.year).toBe(2021);
      expect(dt.month).toBe(12);
      expect(dt.day).toBe(26);
    }
  );
});

test("DateTime.fromObject throws when both locale based weeks and ISO-weeks are specified", () => {
  expect(() => DateTime.fromObject({ localWeekYear: 2022, weekNumber: 12 })).toThrow();
  expect(() => DateTime.fromObject({ localWeekYear: 2022, weekday: 2 })).toThrow();
});

test("DateTime.fromObject() w/ordinals handles fully specified dates", () => {
  const dt = DateTime.fromObject({
    year: 2016,
    ordinal: 200,
    hour: 9,
    minute: 23,
    second: 54,
    millisecond: 123,
  });
  expect(dt.year).toBe(2016);
  expect(dt.ordinal).toBe(200);
  expect(dt.month).toBe(7);
  expect(dt.day).toBe(18);
});

test("DateTime.fromObject() w/ordinal defaults to the current year", () => {
  const dt = DateTime.fromObject({ ordinal: 200 }),
    now = DateTime.now();
  expect(dt.year).toBe(now.year);
  expect(dt.ordinal).toBe(200);
});

test("DateTime.fromObject() returns invalid for invalid values", () => {
  expect(DateTime.fromObject({ weekYear: 2017, weekNumber: 54 }).isValid).toBe(false);
  expect(DateTime.fromObject({ weekYear: 2017, weekNumber: 3.6 }).isValid).toBe(false);
  expect(DateTime.fromObject({ weekYear: 2017, weekNumber: 15, weekday: 0 }).isValid).toBe(false);
});

test("DateTime.fromObject accepts the default locale", () => {
  withDefaultLocale("fr", () => expect(DateTime.fromObject({}).locale).toBe("fr"));
});

test("DateTime.fromObject accepts really low year numbers", () => {
  const dt = DateTime.fromObject({ year: 5 });
  expect(dt.year).toBe(5);
  expect(dt.month).toBe(1);
  expect(dt.day).toBe(1);
});

test("DateTime.fromObject accepts really low year numbers with IANA zones", () => {
  const dt = DateTime.fromObject({ year: 5 }, { zone: "America/New_York" });
  expect(dt.year).toBe(5);
  expect(dt.month).toBe(1);
  expect(dt.day).toBe(1);
});

test("DateTime.fromObject accepts plurals and weird capitalization", () => {
  const dt = DateTime.fromObject({ Year: 2005, months: 12, dAy: 13 });
  expect(dt.year).toBe(2005);
  expect(dt.month).toBe(12);
  expect(dt.day).toBe(13);
});

test("DateTime.fromObject validates weekdays", () => {
  let dt = DateTime.fromObject({ year: 2005, months: 12, day: 13, weekday: 1 });
  expect(dt.isValid).toBe(false);

  dt = DateTime.fromObject({ year: 2005, months: 12, day: 13, weekday: 2 });
  expect(dt.isValid).toBe(true);
});

test("DateTime.fromObject accepts a locale", () => {
  const res = DateTime.fromObject({}, { locale: "be" });
  expect(res.locale).toBe("be");
});

describe("DateTime.fromObject accepts a locale with calendar and numbering identifiers", () => {
  test.skipIf(hasMissingLocaleBeSupport)("with locale 'be'", () => {
    const res = DateTime.fromObject({}, { locale: "be-u-ca-coptic-nu-mong" });
    expect(res.locale).toBe("be-u-ca-coptic-nu-mong");
    expect(res.outputCalendar).toBe("coptic");
    expect(res.numberingSystem).toBe("mong");
  });
  test("with locale 'de'", () => {
    const res = DateTime.fromObject({}, { locale: "de-u-ca-coptic-nu-mong" });
    expect(res.locale).toBe("de-u-ca-coptic-nu-mong");
    expect(res.outputCalendar).toBe("coptic");
    expect(res.numberingSystem).toBe("mong");
  });
});

test("DateTime.fromObject accepts a locale string with weird junk in it", () => {
  withDefaultLocale("en-US", () => {
    const res = DateTime.fromObject(
      {},
      {
        locale: "be-u-ca-coptic-ca-islamic",
      }
    );

    expect(res.locale).toBe("be-u-ca-coptic-ca-islamic");

    // "coptic" is right, but some versions of Node 10 give "gregory"
    expect(res.outputCalendar === "gregory" || res.outputCalendar === "coptic").toBe(true);
    expect(res.numberingSystem).toBe("latn");
  });
});

test("DateTime.fromObject overrides the locale string with explicit settings", () => {
  const res = DateTime.fromObject(
    {},
    {
      locale: "be-u-ca-coptic-nu-mong",
      numberingSystem: "thai",
      outputCalendar: "islamic",
    }
  );

  expect(res.locale).toBe("be-u-ca-coptic-nu-mong");
  expect(res.outputCalendar).toBe("islamic");
  expect(res.numberingSystem).toBe("thai");
});

test("DateTime.fromObject handles null as a language tag", () => {
  withDefaultLocale("en-GB", () => {
    const res = DateTime.fromObject(
      {},
      {
        locale: null,
        numberingSystem: "thai",
        outputCalendar: "islamic",
      }
    );

    expect(res.locale).toBe("en-GB");
    expect(res.outputCalendar).toBe("islamic");
    expect(res.numberingSystem).toBe("thai");
  });
});

test("DateTime.fromRFC2822 parses GMT correctly", () => {
  const dt = DateTime.fromRFC2822("25 Nov 2016 13:23:12 GMT", { zone: "UTC" });
  expect(dt.year).toBe(2016);
  expect(dt.month).toBe(11);
  expect(dt.day).toBe(25);
  expect(dt.hour).toBe(13);
  expect(dt.minute).toBe(23);
  expect(dt.second).toBe(12);
  expect(dt.millisecond).toBe(0);
  expect(dt.offset).toBe(0);
});

test("DateTime.fromRFC2822 parses Zulu correctly", () => {
  const dt = DateTime.fromRFC2822("25 Nov 2016 13:23 Z", { zone: "UTC" });
  expect(dt.year).toBe(2016);
  expect(dt.month).toBe(11);
  expect(dt.day).toBe(25);
  expect(dt.hour).toBe(13);
  expect(dt.minute).toBe(23);
  expect(dt.second).toBe(0);
  expect(dt.millisecond).toBe(0);
  expect(dt.offset).toBe(0);
});

test("DateTime.fromRFC2822 parses offset correctly", () => {
  const dt = DateTime.fromRFC2822("Fri, 25 Nov 2016 13:23:12 +0600", {
    zone: "UTC",
  });
  expect(dt.year).toBe(2016);
  expect(dt.month).toBe(11);
  expect(dt.day).toBe(25);
  expect(dt.hour).toBe(7);
  expect(dt.minute).toBe(23);
  expect(dt.second).toBe(12);
  expect(dt.millisecond).toBe(0);
  expect(dt.offset).toBe(0);
});

test("DateTime.fromRFC2822 is invalid when weekday is not consistent", () => {
  // Actually a Friday, not a Saturday
  expect(DateTime.fromRFC2822("Sat, 25 Nov 2016 13:23:12 +0600").isValid).toBe(false);
});

test("DateTime.fromHTTP parses rfc1123", () => {
  const dt = DateTime.fromHTTP("Sun, 06 Nov 1994 08:49:37 GMT", {
    zone: "UTC",
  });
  expect(dt.year).toBe(1994);
  expect(dt.month).toBe(11);
  expect(dt.day).toBe(6);
  expect(dt.hour).toBe(8);
  expect(dt.minute).toBe(49);
  expect(dt.second).toBe(37);
  expect(dt.millisecond).toBe(0);
  expect(dt.offset).toBe(0);
});

test("DateTime.fromHTTP parses rfc850", () => {
  const dt = DateTime.fromHTTP("Sunday, 06-Nov-94 08:49:37 GMT", {
    zone: "UTC",
  });
  expect(dt.year).toBe(1994);
  expect(dt.month).toBe(11);
  expect(dt.day).toBe(6);
  expect(dt.hour).toBe(8);
  expect(dt.minute).toBe(49);
  expect(dt.second).toBe(37);
  expect(dt.millisecond).toBe(0);
  expect(dt.offset).toBe(0);
});

test("DateTime.fromHTTP parses ascii", () => {
  const dt = DateTime.fromHTTP("Sun Nov  6 08:49:37 1994", { zone: "UTC" });
  expect(dt.year).toBe(1994);
  expect(dt.month).toBe(11);
  expect(dt.day).toBe(6);
  expect(dt.hour).toBe(8);
  expect(dt.minute).toBe(49);
  expect(dt.second).toBe(37);
  expect(dt.millisecond).toBe(0);
  expect(dt.offset).toBe(0);
});

test("DateTime.fromHTTP is invalid when weekday is not consistent", () => {
  // Actually a Sunday, not a Saturday
  expect(DateTime.fromRFC2822("Sat, 06 Nov 1994 08:49:37 GMT").isValid).toBe(false);
  expect(DateTime.fromRFC2822("Saturday, 06-Nov-94 08:49:37 GMT").isValid).toBe(false);
  expect(DateTime.fromRFC2822("Sat Nov  6 08:49:37 1994").isValid).toBe(false);
});

test("DateTime.fromObject takes a undefined to mean {}", () => {
  const res = DateTime.fromObject();
  expect(res.year).toBe(new Date().getFullYear());
});

test("private language subtags don't break unicode subtags", () => {
  const res = DateTime.fromObject(
    {},
    {
      locale: "be-u-ca-coptic-nu-mong-x-twain",
      numberingSystem: "thai",
      outputCalendar: "islamic",
    }
  );

  expect(res.locale).toBe("be-u-ca-coptic-nu-mong");
  expect(res.outputCalendar).toBe("islamic");
  expect(res.numberingSystem).toBe("thai");
});

test("DateTime.local works even after time zone change", () => {
  // This test catches errors produced when guessOffsetForZone produces wildy wrong guesses
  // This guards against a regression by broken caching in that method
  Settings.resetCaches();
  withDefaultZone("America/Los_Angeles", () => {
    expect(DateTime.local(2024).year).toBe(2024);
  });
  withDefaultZone("America/Chicago", () => {
    const dateTime = DateTime.local(2024, 11, 3, 0, 5, 0);
    expect(dateTime.zoneName).toBe("America/Chicago");
    expect(dateTime.toObject()).toEqual({
      year: 2024,
      month: 11,
      day: 3,
      hour: 0,
      minute: 5,
      second: 0,
      millisecond: 0,
    });
  });
});
