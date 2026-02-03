import { describe, expect, test } from "vitest";
import { DateTime } from "../../src/luxon.ts";
import * as Helpers from "../helpers";
import Settings from "../../src/settings.ts";
import {
  ConflictingSpecificationError,
  InvalidDateTimeError,
  InvalidFormatError,
  LuxonParseError,
} from "../../src/errors.ts";
import { hasOutdatedKannadaAmPmBehavior, hasOutdatedTamilAmPmBehavior } from "../specialCases";
import { UNPARSABLE } from "../../src/impl/dateTimeErrors.ts";

//------
// .fromFormat
//-------
test("DateTime.fromFormat() parses basic times", () => {
  const i = DateTime.fromFormat("1982/05/25 09:10:11.445", "yyyy/MM/dd HH:mm:ss.SSS");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);
  expect(i.hour).toBe(9);
  expect(i.minute).toBe(10);
  expect(i.second).toBe(11);
  expect(i.millisecond).toBe(445);
});

test("DateTime.fromFormat() throws code 'unparseable' for incompatible formats", () => {
  // TODO: Proper error type and params
  expect(() => DateTime.fromFormat("Mar 3, 2020", "MMM dd, yyyy")).toThrowError();
});

test("DateTime.fromFormat() parses with variable-length input", () => {
  let i = DateTime.fromFormat("1982/05/03 09:07:05.004", "y/M/d H:m:s.S");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(3);
  expect(i.hour).toBe(9);
  expect(i.minute).toBe(7);
  expect(i.second).toBe(5);
  expect(i.millisecond).toBe(4);

  i = DateTime.fromFormat("82/5/3 9:7:5.4", "yy/M/d H:m:s.S");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(3);
  expect(i.hour).toBe(9);
  expect(i.minute).toBe(7);
  expect(i.second).toBe(5);
  expect(i.millisecond).toBe(4);
});

test("DateTime.fromFormat() parses meridiems", () => {
  let i = DateTime.fromFormat("1982/05/25 9 PM", "yyyy/MM/dd h a");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);
  expect(i.hour).toBe(21);

  i = DateTime.fromFormat("1982/05/25 9 AM", "yyyy/MM/dd h a");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);
  expect(i.hour).toBe(9);

  i = DateTime.fromFormat("1982/05/25 12 AM", "yyyy/MM/dd h a");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);
  expect(i.hour).toBe(0);

  i = DateTime.fromFormat("1982/05/25 12 PM", "yyyy/MM/dd h a");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);
  expect(i.hour).toBe(12);
});

test("DateTime.fromFormat() throws if you specify meridiem with 24-hour time", () => {
  expect(() => DateTime.fromFormat("930PM", "Hmma")).toThrow(ConflictingSpecificationError);
});

// #714
test("DateTime.fromFormat() makes dots optional and handles non breakable spaces", () => {
  function parseMeridiem(input, isAM) {
    const d = DateTime.fromFormat(input, "hh:mm a");
    expect(d.hour).toBe(isAM ? 10 : 22);
    expect(d.minute).toBe(45);
    expect(d.second).toBe(0);
  }

  // Meridiem for this locale is "a. m." or "p. m.", with a non breakable space
  Helpers.withDefaultLocale("es-ES", () => {
    parseMeridiem("10:45 a. m.", true);
    parseMeridiem("10:45 a. m", true);
    parseMeridiem("10:45 a m.", true);
    parseMeridiem("10:45 a m", true);

    parseMeridiem("10:45 p. m.", false);
    parseMeridiem("10:45 p. m", false);
    parseMeridiem("10:45 p m.", false);
    parseMeridiem("10:45 p m", false);

    const nbsp = String.fromCharCode(160);

    parseMeridiem(`10:45 a.${nbsp}m.`, true);
    parseMeridiem(`10:45 a.${nbsp}m`, true);
    parseMeridiem(`10:45 a${nbsp}m.`, true);
    parseMeridiem(`10:45 a${nbsp}m`, true);

    parseMeridiem(`10:45 p.${nbsp}m.`, false);
    parseMeridiem(`10:45 p.${nbsp}m`, false);
    parseMeridiem(`10:45 p${nbsp}m.`, false);
    parseMeridiem(`10:45 p${nbsp}m`, false);
  });
});

test.each([
  ["2", 2],
  ["22", 22],
  ["222", 222],
  ["2222", 2222],
  ["22222", 22222],
  ["222222", 222222],
])("DateTime.fromFormat() parses $0 as variable-digit years with token y", (val, year) => {
  expect(DateTime.fromFormat(val, "y").year).toBe(year);
});

test.each(["", "2222222"])(
  "DateTime.fromFormat() does not accept $0 as variable-digit years with token y",
  (val) => {
    expect(() => DateTime.fromFormat(val, "y")).toThrowError(
      expect.objectContaining({
        constructor: LuxonParseError,
        // TODO: check that extended info is provided
      })
    );
  }
);

test.each(["222", "2222222"])("DateTime.fromFormat() with yyyyy rejects $0", (input) => {
  // TODO: Correct error type
  expect(() => DateTime.fromFormat(input, "yyyyy")).toThrow();
});

test.each([
  ["2222", 2222],
  ["22222", 22222],
  ["222222", 222222],
])("DateTime.fromFormat() with yyyyy parses $0 correctly", (input, year) => {
  expect(DateTime.fromFormat(input, "yyyyy").year).toBe(year);
});

test.each(["2222", "2222222"])("DateTime.fromFormat() with yyyyyy rejects $0", (input) => {
  // TODO: Correct error type
  expect(() => DateTime.fromFormat(input, "yyyyyy")).toThrow();
});

test.each([
  ["222222", 222222],
  ["022222", 22222],
])("DateTime.fromFormat() with yyyyyy parses $0 correctly", (input, year) => {
  expect(DateTime.fromFormat(input, "yyyyyy").year).toBe(year);
});

test("DateTime.fromFormat() defaults yy to the right century", () => {
  expect(DateTime.fromFormat("60", "yy").year).toBe(2060);
  expect(DateTime.fromFormat("61", "yy").year).toBe(1961);
  expect(DateTime.fromFormat("1960", "yy").year).toBe(1960);
});

test("DateTime.fromFormat() respects Settings.twoDigitCutoffYear when parsing yy to the right century", () => {
  const oldTwoDigitCutoffYear = Settings.twoDigitCutoffYear;

  try {
    Settings.twoDigitCutoffYear = 50;
    expect(DateTime.fromFormat("50", "yy").year).toBe(2050);
    expect(DateTime.fromFormat("51", "yy").year).toBe(1951);
    expect(DateTime.fromFormat("1950", "yy").year).toBe(1950);
  } finally {
    Settings.twoDigitCutoffYear = oldTwoDigitCutoffYear;
  }
});

test("DateTime.fromFormat() parses hours", () => {
  expect(DateTime.fromFormat("5", "h").hour).toBe(5);
  expect(DateTime.fromFormat("12", "h").hour).toBe(12);
  expect(DateTime.fromFormat("05", "hh").hour).toBe(5);
  expect(DateTime.fromFormat("12", "hh").hour).toBe(12);
  expect(DateTime.fromFormat("5", "H").hour).toBe(5);
  expect(DateTime.fromFormat("13", "H").hour).toBe(13);
  expect(DateTime.fromFormat("05", "HH").hour).toBe(5);
  expect(DateTime.fromFormat("13", "HH").hour).toBe(13);
});

test.each([
  ["1", 1],
  ["12", 12],
  ["123", 123],
])("DateTime.fromFormat('S') parses $0 as $1 milliseconds", (input, ms) => {
  expect(DateTime.fromFormat(input, "S").millisecond).toBe(ms);
});

test("DateTime.fromFormat does not accept ms > 999 for token S", () => {
  // TODO: Proper error type
  expect(() => DateTime.fromFormat("1234", "S")).toThrow();
});

test.each([
  ["123", 123],
  ["023", 23],
  ["001", 1],
])("DateTime.fromFormat('SSS') parses $0 as $1 milliseconds", (input, ms) => {
  expect(DateTime.fromFormat(input, "SSS").millisecond).toBe(ms);
  expect(DateTime.fromFormat("023", "SSS").millisecond).toBe(23);
});

test("DateTime.fromFormat does not accept ms > 999 for token SSS", () => {
  // TODO: Proper error type
  expect(() => DateTime.fromFormat("1234", "SSS")).toThrow();
});

test("DateTime.fromFormat only accepts 3 digits for token SSS", () => {
  // TODO: Proper error type
  expect(() => DateTime.fromFormat("1", "SSS")).toThrow();
  expect(() => DateTime.fromFormat("12", "SSS")).toThrow();
});

test.each([
  ["1", 100],
  ["12", 120],
  ["123", 123],
  ["023", 23],
  ["003", 3],
  ["1234", 123],
  ["1235", 123],
])("DateTime.fromFormat() parses $0 as fractional seconds with 'u'", (input, ms) => {
  expect(DateTime.fromFormat(input, "u").millisecond).toBe(ms);
});

test.each([
  ["1", 100],
  ["12", 120],
  ["02", 20],
])("DateTime.fromFormat() parses $0 as fractional seconds with 'uu'", (input, ms) => {
  expect(DateTime.fromFormat(input, "uu").millisecond).toBe(ms);
});

test("DateTime.fromFormat() does not allow negative fractional seconds with 'uu'", () => {
  // TODO: Proper error type
  expect(() => DateTime.fromFormat("-33", "uu")).toThrow();
});

test.each([["1", 100]])(
  "DateTime.fromFormat() parses $0 as fractional seconds with 'uuu'",
  (input, ms) => {
    expect(DateTime.fromFormat(input, "uuu").millisecond).toBe(ms);
  }
);

test("DateTime.fromFormat() does not allow negative fractional seconds with 'uuu'", () => {
  // TODO: Proper error type
  expect(() => DateTime.fromFormat("-2", "uuu")).toThrow();
});

test("DateTime.fromFormat() parses weekdays", () => {
  expect(DateTime.fromFormat("5", "E").weekday).toBe(5);
  expect(DateTime.fromFormat("5", "c").weekday).toBe(5);

  expect(DateTime.fromFormat("Fri", "EEE").weekday).toBe(5);
  expect(DateTime.fromFormat("Fri", "ccc").weekday).toBe(5);

  expect(DateTime.fromFormat("Friday", "EEEE").weekday).toBe(5);
  expect(DateTime.fromFormat("Friday", "cccc").weekday).toBe(5);
});

test("DateTime.fromFormat() parses eras", () => {
  let dt = DateTime.fromFormat("0206 AD", "yyyy G");
  expect(dt.year).toEqual(206);

  dt = DateTime.fromFormat("0206 BC", "yyyy G");
  expect(dt.year).toEqual(-206);

  dt = DateTime.fromFormat("0206 Before Christ", "yyyy GG");
  expect(dt.year).toEqual(-206);
});

test("DateTime.fromFormat() parses variable-length days", () => {
  let i = DateTime.fromFormat("Mar 3, 2020", "MMM d, yyyy");
  expect(i.day).toBe(3);

  i = DateTime.fromFormat("Mar 13, 2020", "MMM d, yyyy");
  expect(i.day).toBe(13);
});

test("DateTime.fromFormat() parses fixed-length days", () => {
  let i = DateTime.fromFormat("Mar 03, 2020", "MMM dd, yyyy");
  expect(i.day).toBe(3);

  i = DateTime.fromFormat("Mar 13, 2020", "MMM dd, yyyy");
  expect(i.day).toBe(13);
});

test("DateTime.fromFormat() parses standalone month names", () => {
  let i = DateTime.fromFormat("May 25 1982", "LLLL dd yyyy");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat("Sep 25 1982", "LLL dd yyyy");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(9);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat("5 25 1982", "L dd yyyy");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat("05 25 1982", "LL dd yyyy");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat("mai 25 1982", "LLLL dd yyyy", { locale: "fr" });
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat("janv. 25 1982", "LLL dd yyyy", { locale: "fr" });
  expect(i.year).toBe(1982);
  expect(i.month).toBe(1);
  expect(i.day).toBe(25);
});

test("DateTime.fromFormat() parses format month names", () => {
  let i = DateTime.fromFormat("May 25 1982", "MMMM dd yyyy");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat("Sep 25 1982", "MMM dd yyyy");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(9);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat("5 25 1982", "M dd yyyy");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat("05 25 1982", "MM dd yyyy");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat("mai 25 1982", "MMMM dd yyyy", { locale: "fr" });
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat("janv. 25 1982", "MMM dd yyyy", { locale: "fr" });
  expect(i.year).toBe(1982);
  expect(i.month).toBe(1);
  expect(i.day).toBe(25);
});

test("DateTime.fromFormat() parses quarters", () => {
  const i = DateTime.fromFormat("1982Q2", "yyyy'Q'q");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(4);
  expect(i.quarter).toBe(2);
  expect(DateTime.fromFormat("2019Q1", "yyyy'Q'q").month).toBe(1);
  expect(DateTime.fromFormat("2019Q2", "yyyy'Q'q").month).toBe(4);
  expect(DateTime.fromFormat("2019Q3", "yyyy'Q'q").month).toBe(7);
  expect(DateTime.fromFormat("2019Q4", "yyyy'Q'q").month).toBe(10);
  expect(DateTime.fromFormat("2019Q01", "yyyy'Q'qq").month).toBe(1);
  expect(DateTime.fromFormat("2019Q02", "yyyy'Q'qq").month).toBe(4);
  expect(DateTime.fromFormat("2019Q03", "yyyy'Q'qq").month).toBe(7);
  expect(DateTime.fromFormat("2019Q04", "yyyy'Q'qq").month).toBe(10);
});

test("DateTime.fromFormat() makes trailing periods in month names optional", () => {
  const i = DateTime.fromFormat("janv 25 1982", "LLL dd yyyy", {
    locale: "fr",
  });
  expect(i.year).toBe(1982);
  expect(i.month).toBe(1);
  expect(i.day).toBe(25);
});

test("DateTime.fromFormat() does not match arbitrary stuff with those periods", () => {
  // TODO: Correct error type
  expect(() =>
    DateTime.fromFormat("janvQ 25 1982", "LLL dd yyyy", {
      locale: "fr",
    })
  ).toThrow();
});

test("DateTime.fromFormat() uses case-insensitive matching", () => {
  const i = DateTime.fromFormat("Janv. 25 1982", "LLL dd yyyy", {
    locale: "fr",
  });
  expect(i.year).toBe(1982);
  expect(i.month).toBe(1);
  expect(i.day).toBe(25);
});

test("DateTime.fromFormat() parses offsets", () => {});

describe("DateTime.fromFormat() validates weekday numbers", () => {
  test("when the weekday is correct", () => {
    const d = DateTime.fromFormat("2, 05/25/1982", "E, LL/dd/yyyy");
    expect(d.year).toBe(1982);
    expect(d.month).toBe(5);
    expect(d.day).toBe(25);
  });

  test("it throws when the weekday is incorrect", () => {
    // TODO: Correct error type
    expect(() => DateTime.fromFormat("1, 05/25/1982", "E, LL/dd/yyyy")).toThrow();
  });
});

describe("DateTime.fromFormat() validates weekday names", () => {
  test("when the weekday name is correct", () => {
    const d = DateTime.fromFormat("Tuesday, 05/25/1982", "EEEE, LL/dd/yyyy");
    expect(d.year).toBe(1982);
    expect(d.month).toBe(5);
    expect(d.day).toBe(25);
  });

  test("when the weekday name is correct with locale fr", () => {
    const d = DateTime.fromFormat("mardi, 05/25/1982", "EEEE, LL/dd/yyyy", {
      locale: "fr",
    });
    expect(d.year).toBe(1982);
    expect(d.month).toBe(5);
    expect(d.day).toBe(25);
  });

  test("it throws when the weekday name is incorrect", () => {
    // TODO: Correct error type
    expect(() => DateTime.fromFormat("Monday, 05/25/1982", "EEEE, LL/dd/yyyy")).toThrow();
  });
});

test("DateTime.fromFormat() defaults weekday to this week", () => {
  const d = DateTime.fromFormat("Monday", "EEEE"),
    now = DateTime.now();
  expect(d.weekYear).toBe(now.weekYear);
  expect(d.weekNumber).toBe(now.weekNumber);
  expect(d.weekday).toBe(1);

  const d2 = DateTime.fromFormat("3", "E");
  expect(d2.weekYear).toBe(now.weekYear);
  expect(d2.weekNumber).toBe(now.weekNumber);
  expect(d2.weekday).toBe(3);
});

test("DateTime.fromFormat() parses ordinals", () => {
  let d = DateTime.fromFormat("2016 200", "yyyy ooo");
  expect(d.year).toBe(2016);
  expect(d.ordinal).toBe(200);

  d = DateTime.fromFormat("2016 200", "yyyy ooo");
  expect(d.year).toBe(2016);
  expect(d.ordinal).toBe(200);

  d = DateTime.fromFormat("2016 016", "yyyy ooo");
  expect(d.year).toBe(2016);
  expect(d.ordinal).toBe(16);

  d = DateTime.fromFormat("2016 200", "yyyy o");
  expect(d.year).toBe(2016);
  expect(d.ordinal).toBe(200);

  d = DateTime.fromFormat("2016 16", "yyyy o");
  expect(d.year).toBe(2016);
  expect(d.ordinal).toBe(16);
});

test("DateTime.fromFormat() throws on mixed units", () => {
  expect(() => {
    DateTime.fromFormat("2017 34", "yyyy WW");
  }).toThrow();

  expect(() => {
    DateTime.fromFormat("2017 05 340", "yyyy MM ooo");
  }).toThrow();
});

test("DateTime.fromFormat() accepts weekYear by itself", () => {
  let d = DateTime.fromFormat("2004", "kkkk");
  expect(d.weekYear).toBe(2004);
  expect(d.weekNumber).toBe(1);
  expect(d.weekday).toBe(1);

  d = DateTime.fromFormat("04", "kk");
  expect(d.weekYear).toBe(2004);
  expect(d.weekNumber).toBe(1);
  expect(d.weekday).toBe(1);
});

test("DateTime.fromFormat() defaults kk to the right century", () => {
  expect(DateTime.fromFormat("60", "kk").weekYear).toBe(2060);
  expect(DateTime.fromFormat("61", "kk").weekYear).toBe(1961);
  expect(DateTime.fromFormat("1960", "kk").weekYear).toBe(1960);
});

test("DateTime.fromFormat() respects Settings.twoDigitCutoffYear when parsing two digit weekYear to the right century", () => {
  const oldTwoDigitCutoffYear = Settings.twoDigitCutoffYear;

  try {
    Settings.twoDigitCutoffYear = 50;
    expect(DateTime.fromFormat("50", "kk").weekYear).toBe(2050);
    expect(DateTime.fromFormat("51", "kk").weekYear).toBe(1951);
    expect(DateTime.fromFormat("1950", "kk").weekYear).toBe(1950);
  } finally {
    Settings.twoDigitCutoffYear = oldTwoDigitCutoffYear;
  }
});

test("DateTime.fromFormat() accepts weekNumber by itself", () => {
  const now = DateTime.now();

  let d = DateTime.fromFormat("17", "WW");
  expect(d.weekYear).toBe(now.weekYear);
  expect(d.weekNumber).toBe(17);
  expect(d.weekday).toBe(1);

  d = DateTime.fromFormat("17", "W");
  expect(d.weekYear).toBe(now.weekYear);
  expect(d.weekNumber).toBe(17);
  expect(d.weekday).toBe(1);
});

test("DateTime.fromFormat() accepts weekYear/weekNumber/weekday", () => {
  const d = DateTime.fromFormat("2004 17 2", "kkkk WW E");
  expect(d.weekYear).toBe(2004);
  expect(d.weekNumber).toBe(17);
  expect(d.weekday).toBe(2);
});

test("DateTime.fromFormat() allows regex content", () => {
  const d = DateTime.fromFormat("Monday", "EEEE"),
    now = DateTime.now();
  expect(d.weekYear).toBe(now.weekYear);
  expect(d.weekNumber).toBe(now.weekNumber);
  expect(d.weekday).toBe(1);
});

test("DateTime.fromFormat() allows literals", () => {
  const i = DateTime.fromFormat("1982/05/25 hello 09:10:11.445", "yyyy/MM/dd 'hello' HH:mm:ss.SSS");

  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);
  expect(i.hour).toBe(9);
  expect(i.minute).toBe(10);
  expect(i.second).toBe(11);
  expect(i.millisecond).toBe(445);
});

test("DateTime.fromFormat() throws when unparsed", () => {
  // TODO: Correct error type
  expect(() => DateTime.fromFormat("Splurk", "EEEE")).toThrow();
});

test("DateTime.fromFormat() parses valid quarters", () => {
  const d = DateTime.fromFormat("2019Q1", "yyyy'Q'q");
  expect(d.year).toBe(2019);
  expect(d.quarter).toBe(1);
});

describe("DateTime.fromFormat() returns invalid when quarter value is not valid", () => {
  test.each([
    ["2019Qaa", "yyyy'Q'qq"],
    ["2019Q00", "yyyy'Q'qq"],
    ["2019Q0", "yyyy'Q'q"],
    ["2019Q5", "yyyy'Q'q"],
  ])("$0 as $1", (v, format) => {
    // TODO: Correct error type
    expect(() => DateTime.fromFormat(v, format)).toThrow();
  });
});

describe("DateTime.fromFormat() returns invalid for out-of-range values", () => {
  test.each([
    ["8, 05/25/1982", "E, MM/dd/yyyy", { locale: "fr" }],
    ["Tuesday, 05/25/1982", "EEEE, MM/dd/yyyy", { locale: "fr" }],
    ["Giberish, 05/25/1982", "EEEE, MM/dd/yyyy", undefined],
    ["14/25/1982", "MM/dd/yyyy", undefined],
    ["05/46/1982", "MM/dd/yyyy", undefined],
  ])("$0 as $1 with options $2", (v, format, options) => {
    // TODO: Correct error type
    expect(() => DateTime.fromFormat(v, format, options)).toThrow();
  });
});

test("DateTime.fromFormat() accepts a zone argument", () => {
  const d = DateTime.fromFormat("1982/05/25 09:10:11.445", "yyyy/MM/dd HH:mm:ss.SSS", {
    zone: "Asia/Tokyo",
  });
  expect(d.zoneName).toBe("Asia/Tokyo");
  expect(d.offset).toBe(9 * 60);
  expect(d.year).toBe(1982);
  expect(d.month).toBe(5);
  expect(d.day).toBe(25);
  expect(d.hour).toBe(9);
  expect(d.minute).toBe(10);
  expect(d.second).toBe(11);
  expect(d.millisecond).toBe(445);
});

test("DateTime.fromFormat() parses IANA zones", () => {
  let d = DateTime.fromFormat(
    "1982/05/25 09:10:11.445 Asia/Tokyo",
    "yyyy/MM/dd HH:mm:ss.SSS z"
  ).toUTC();
  expect(d.offset).toBe(0);
  expect(d.hour).toBe(0);
  expect(d.minute).toBe(10);

  d = DateTime.fromFormat("1982/05/25 09:10:11.445 UTC", "yyyy/MM/dd HH:mm:ss.SSS z").toUTC();
  expect(d.offset).toBe(0);
  expect(d.hour).toBe(9);
  expect(d.minute).toBe(10);
});

test("DateTime.fromFormat() with setZone parses IANA zones and sets it", () => {
  const d = DateTime.fromFormat("1982/05/25 09:10:11.445 Asia/Tokyo", "yyyy/MM/dd HH:mm:ss.SSS z", {
    setZone: true,
  });
  expect(d.zoneName).toBe("Asia/Tokyo");
  expect(d.offset).toBe(9 * 60);
  expect(d.hour).toBe(9);
  expect(d.minute).toBe(10);
});

test("DateTime.fromFormat() parses fixed offsets", () => {
  const formats = [
    ["Z", "-4"],
    ["ZZ", "-4:00"],
    ["ZZZ", "-0400"],
  ];

  for (const i in formats) {
    if (Object.prototype.hasOwnProperty.call(formats, i)) {
      const [format, example] = formats[i],
        dt = DateTime.fromFormat(
          `1982/05/25 09:10:11.445 ${example}`,
          `yyyy/MM/dd HH:mm:ss.SSS ${format}`
        );
      expect(dt.toUTC().hour).toBe(13);
      expect(dt.toUTC().minute).toBe(10);
    }
  }
});

test("DateTime.fromFormat() with setZone parses fixed offsets and sets it", () => {
  const formats = [
    ["Z", "-4"],
    ["ZZ", "-4:00"],
    ["ZZZ", "-0400"],
  ];

  for (const i in formats) {
    if (Object.prototype.hasOwnProperty.call(formats, i)) {
      const [format, example] = formats[i],
        dt = DateTime.fromFormat(
          `1982/05/25 09:10:11.445 ${example}`,
          `yyyy/MM/dd HH:mm:ss.SSS ${format}`,
          { setZone: true }
        );
      expect(dt.offset).toBe(-4 * 60);
      expect(dt.toUTC().hour).toBe(13);
      expect(dt.toUTC().minute).toBe(10);
    }
  }
});

test("DateTime.fromFormat() prefers IANA zone id", () => {
  const i = DateTime.fromFormat(
    "2021-11-12T09:07:13.000+08:00[Australia/Perth]",
    "yyyy-MM-dd'T'HH:mm:ss.SSSZZ[z]",
    { setZone: true }
  );
  expect(i.year).toBe(2021);
  expect(i.month).toBe(11);
  expect(i.day).toBe(12);
  expect(i.hour).toBe(9);
  expect(i.minute).toBe(7);
  expect(i.second).toBe(13);
  expect(i.millisecond).toBe(0);
  expect(i.offset).toBe(480); //+08:00
  expect(i.zoneName).toBe("Australia/Perth");
});

test("DateTime.fromFormat() ignores numerical offsets when they conflict with the zone", () => {
  // +11:00 is not a valid offset for the Australia/Perth time zone
  const i = DateTime.fromFormat(
    "2021-11-12T09:07:13.000+11:00[Australia/Perth]",
    "yyyy-MM-dd'T'HH:mm:ss.SSSZZ[z]",
    { setZone: true }
  );
  expect(i.year).toBe(2021);
  expect(i.month).toBe(11);
  expect(i.day).toBe(12);
  expect(i.hour).toBe(9);
  expect(i.minute).toBe(7);
  expect(i.second).toBe(13);
  expect(i.millisecond).toBe(0);
  expect(i.offset).toBe(480); //+08:00
  expect(i.zoneName).toBe("Australia/Perth");
});

test("DateTime.fromFormat() ignores numerical offsets when they are are wrong right now", () => {
  // DST is not in effect at this timestamp, so +10:00 is the correct offset
  const i = DateTime.fromFormat(
    "2021-10-03T01:30:00.000+11:00[Australia/Sydney]",
    "yyyy-MM-dd'T'HH:mm:ss.SSSZZ[z]",
    { setZone: true }
  );
  expect(i.year).toBe(2021);
  expect(i.month).toBe(10);
  expect(i.day).toBe(3);
  expect(i.hour).toBe(1);
  expect(i.minute).toBe(30);
  expect(i.second).toBe(0);
  expect(i.millisecond).toBe(0);
  expect(i.offset).toBe(600); //+10:00
  expect(i.zoneName).toBe("Australia/Sydney");
});

test("DateTime.fromFormat() maintains offset that belongs to time zone during overlap", () => {
  // On this day, 02:30 exists for both offsets, due to DST ending.
  let i = DateTime.fromFormat(
    "2021-04-04T02:30:00.000+11:00[Australia/Sydney]",
    "yyyy-MM-dd'T'HH:mm:ss.SSSZZ[z]",
    { setZone: true }
  );
  expect(i.year).toBe(2021);
  expect(i.month).toBe(4);
  expect(i.day).toBe(4);
  expect(i.hour).toBe(2);
  expect(i.minute).toBe(30);
  expect(i.second).toBe(0);
  expect(i.millisecond).toBe(0);
  expect(i.offset).toBe(660); //+11:00
  expect(i.zoneName).toBe("Australia/Sydney");

  i = DateTime.fromFormat(
    "2021-04-04T02:30:00.000+10:00[Australia/Sydney]",
    "yyyy-MM-dd'T'HH:mm:ss.SSSZZ[z]",
    { setZone: true }
  );
  expect(i.year).toBe(2021);
  expect(i.month).toBe(4);
  expect(i.day).toBe(4);
  expect(i.hour).toBe(2);
  expect(i.minute).toBe(30);
  expect(i.second).toBe(0);
  expect(i.millisecond).toBe(0);
  expect(i.offset).toBe(600); //+10:00
  expect(i.zoneName).toBe("Australia/Sydney");
});

test("DateTime.format() uses local zone when setZone is false and offset in input", () => {
  const i = DateTime.fromFormat("2021-11-12T09:07:13.000+08:00", "yyyy-MM-dd'T'HH:mm:ss.SSSZZ", {
    setZone: false,
  });
  expect(i.year).toBe(2021);
  expect(i.month).toBe(11);
  expect(i.day).toBe(11);
  expect(i.hour).toBe(20);
  expect(i.minute).toBe(7);
  expect(i.second).toBe(13);
  expect(i.millisecond).toBe(0);
  expect(i.offset).toBe(-300);
  expect(i.zoneName).toBe("America/New_York");
});

test("DateTime.format() uses local zone when setZone is false and zone id in input", () => {
  const i = DateTime.fromFormat(
    "2021-11-12T09:07:13.000+08:00[Australia/Perth]",
    "yyyy-MM-dd'T'HH:mm:ss.SSSZZ[z]",
    { setZone: false }
  );
  expect(i.year).toBe(2021);
  expect(i.month).toBe(11);
  expect(i.day).toBe(11);
  expect(i.hour).toBe(20);
  expect(i.minute).toBe(7);
  expect(i.second).toBe(13);
  expect(i.millisecond).toBe(0);
  expect(i.offset).toBe(-300);
  expect(i.zoneName).toBe("America/New_York");
});

describe("DateTime.fromFormat() parses localized macro tokens", () => {
  const formatGroups = [
    {
      formats: ["D", "DD", "DDD", "DDDD"],
      expectEqual: ["year", "month", "day"] as const,
    },
    {
      formats: ["t", "T"],
      expectEqual: ["hour", "minute"] as const,
    },
    {
      formats: ["tt", "TT"],
      expectEqual: ["hour", "minute", "second"] as const,
    },
    {
      formats: ["F", "FF"],
      expectEqual: ["year", "month", "day", "hour", "minute", "second"] as const,
    },
  ];
  const locales = [null, "en-gb", "de"];

  const testCases = formatGroups.flatMap(({ formats, expectEqual }) => {
    return locales.flatMap((locale) => {
      return formats.map((format) => {
        return [locale, format, expectEqual] as const;
      });
    });
  });

  test.each(testCases)("$1 in locale $0", (locale, format, expectEqual) => {
    const sampleDateTime = DateTime.fromMillis(1555555555555);
    const formatted = sampleDateTime.toFormat(format, { locale });
    const parsed = DateTime.fromFormat(formatted, format, { locale });
    for (const key of expectEqual) {
      expect(parsed[key]).toBe(sampleDateTime[key]);
    }
  });
});

describe("DateTime.fromFormat cannot parse zone names", () => {
  const locales = [null, "en-gb", "de"];
  const formats = ["ttt", "tttt", "TTT", "TTTT", "FFF", "FFFF"];

  const testCases = locales.flatMap((locale) => {
    return formats.map((format) => [locale, format] as const);
  });

  test.each(testCases)("format $1 in locale $0", (locale, format) => {
    const sampleDateTime = DateTime.fromMillis(1555555555555);
    const formatted = sampleDateTime.toFormat(format, { locale });
    // TODO: Correct error type
    expect(() => DateTime.fromFormat(formatted, format, { locale })).toThrow();
  });
});

describe("DateTime.fromFormat() allows non-breaking white-space to be substituted inside macro-tokens", () => {
  test("Accepts a plain space", () => {
    const d = DateTime.fromFormat("5:54 PM", "t", { locale: "en-US" });
    expect(d.hour).toBe(17);
    expect(d.minute).toBe(54);
  });
  test("Accepts Narrow No-Break Space", () => {
    const d = DateTime.fromFormat("5:54 PM", "t", { locale: "en-US" });
    expect(d.hour).toBe(17);
    expect(d.minute).toBe(54);
  });
  test("Does not accept line break", () => {
    // TODO: Correct error type
    expect(() => DateTime.fromFormat("5:54\nPM", "t", { locale: "en-US" })).toThrow();
  });
});

test("DateTime.fromFormat() throws if you don't provide a format", () => {
  expect(() => {
    // @ts-expect-error
    return DateTime.fromFormat("yo");
  }).toThrow();
});

describe("DateTime.fromFormat validates weekdays", () => {
  test("Without locale time zone", () => {
    const dt = DateTime.fromFormat("Wed 2017-11-29 02:00", "EEE yyyy-MM-dd HH:mm");
    expect(dt.weekday).toBe(3);
  });

  test("It throws without locale time zone and mismatched weekday", () => {
    // TODO: Correct error type
    expect(() => DateTime.fromFormat("Thu 2017-11-29 02:00", "EEE yyyy-MM-dd HH:mm")).toThrow();
  });

  test("With an offset in the format", () => {
    const dt = DateTime.fromFormat("Wed 2017-11-29 02:00 +12:00", "EEE yyyy-MM-dd HH:mm ZZ");
    expect(dt.weekday).toBe(2); // setZone is false, so the parsed date is in local zone
  });

  test("With an offset in the format and setZone", () => {
    const dt = DateTime.fromFormat("Wed 2017-11-29 02:00 +12:00", "EEE yyyy-MM-dd HH:mm ZZ", {
      setZone: true,
    });
    expect(dt.weekday).toBe(3);
  });

  test("It throws with an offset in the format, setZone and mismatched weekday", () => {
    // TODO: Correct error type
    expect(() =>
      DateTime.fromFormat("Tue 2017-11-29 02:00 +12:00", "EEE yyyy-MM-dd HH:mm ZZ", {
        setZone: true,
      })
    ).toThrow();
  });
});

describe("DateTime.fromFormat containing special regex token", () => {
  test.each([
    ["yyyy-MM-dd'T'HH-mm[z]", "2019-01-14T11-30[Indian/Maldives]"],
    ["yyyy-MM-dd'T'HH-mm[[z]]", "2019-01-14T11-30[[Indian/Maldives]]"],
    ["yyyy-MM-dd'T'HH-mm't'z't'", "2019-01-14T11-30tIndian/Maldivest"],
  ])("Format $0", (format, text) => {
    const dt = DateTime.fromFormat(text, format, {
      setZone: true,
    });
    expect(dt.zoneName).toBe("Indian/Maldives");
  });

  test("It does not parse escape sequences", () => {
    // TODO: Correct error type
    expect(() =>
      DateTime.fromFormat("2019-01-14T11-30\tIndian/Maldives\t", "yyyy-MM-dd'T'HH-mm't'z't'")
    ).toThrow();
  });
});

// #1362
test("DateTime.fromFormat only an offset", () => {
  const dt = DateTime.fromFormat("+0100", "ZZZ", { setZone: true });
  expect(dt.offset).toBe(60);
});

//------
// .fromFormatExplain
//-------

function keyCount(o) {
  return Object.keys(o).length;
}

test("DateTime.fromFormatExplain() explains success", () => {
  const ex = DateTime.fromFormatExplain("May 25, 1982 09:10:12.445", "MMMM dd, yyyy HH:mm:ss.SSS");
  expect(ex.rawMatches).toBeInstanceOf(Array);
  expect(ex.matches).toBeInstanceOf(Object);
  expect(keyCount(ex.matches)).toBe(7);
  expect(ex.result).toBeInstanceOf(Object);
  expect(keyCount(ex.result)).toBe(7);
});

test("DateTime.fromFormatExplain() explains a bad match", () => {
  const ex = DateTime.fromFormatExplain("May 25, 1982 09:10:12.445", "MMMM dd, yyyy mmmm");
  expect(ex.rawMatches).toBeNull();
  expect(ex.matches).toBeInstanceOf(Object);
  expect(keyCount(ex.matches)).toBe(0);
  expect(ex.result).toBeInstanceOf(Object);
  expect(keyCount(ex.result)).toBe(0);
});

test("DateTime.fromFormatExplain() parses zone correctly", () => {
  const ex = DateTime.fromFormatExplain(
    "America/New_York 1-April-2019 04:10:48 PM Mon",
    "z d-MMMM-yyyy hh:mm:ss a EEE"
  );
  expect(ex.rawMatches).toBeInstanceOf(Array);
  expect(ex.matches).toBeInstanceOf(Object);
  expect(keyCount(ex.matches)).toBe(9);
  expect(ex.result).toBeInstanceOf(Object);
  expect(keyCount(ex.result)).toBe(7);
  expect(ex.matches).toEqual({
    E: 1,
    M: 4,
    a: 1,
    d: 1,
    h: 16,
    m: 10,
    s: 48,
    y: 2019,
    z: "America/New_York",
  });
});

describe("DateTime.fromFormatExplain() parses localized string with numberingSystem correctly", () => {
  test.runIf(hasOutdatedKannadaAmPmBehavior)("locale 'kn' (old cldr)", () => {
    const ex1 = DateTime.fromFormatExplain(
      "೦೩-ಏಪ್ರಿಲ್-೨೦೧೯ ೧೨:೨೬:೦೭ ಅಪರಾಹ್ನ Asia/Calcutta",
      "dd-MMMM-yyyy hh:mm:ss a z",
      { locale: "kn", numberingSystem: "knda" }
    );
    expect(ex1.rawMatches).toBeInstanceOf(Array);
    expect(ex1.matches).toBeInstanceOf(Object);
    expect(keyCount(ex1.matches)).toBe(8);
    expect(ex1.result).toBeInstanceOf(Object);
    expect(keyCount(ex1.result)).toBe(6);
    expect(ex1.matches).toEqual({
      M: 4,
      a: 1,
      d: 3,
      h: 12,
      m: 26,
      s: 7,
      y: 2019,
      z: "Asia/Calcutta",
    });
  });
  test.skipIf(hasOutdatedKannadaAmPmBehavior)("locale 'kn'", () => {
    const ex1 = DateTime.fromFormatExplain(
      "೦೩-ಏಪ್ರಿಲ್-೨೦೧೯ ೧೨:೨೬:೦೭ PM Asia/Calcutta",
      "dd-MMMM-yyyy hh:mm:ss a z",
      { locale: "kn", numberingSystem: "knda" }
    );
    expect(ex1.rawMatches).toBeInstanceOf(Array);
    expect(ex1.matches).toBeInstanceOf(Object);
    expect(keyCount(ex1.matches)).toBe(8);
    expect(ex1.result).toBeInstanceOf(Object);
    expect(keyCount(ex1.result)).toBe(6);
    expect(ex1.matches).toEqual({
      M: 4,
      a: 1,
      d: 3,
      h: 12,
      m: 26,
      s: 7,
      y: 2019,
      z: "Asia/Calcutta",
    });
  });

  test("ex2", () => {
    const ex2 = DateTime.fromFormatExplain(
      "〇三-四-二〇一九 一二:三四:四九 下午 Asia/Shanghai",
      "dd-MMMM-yyyy hh:mm:ss a z",
      { locale: "zh", numberingSystem: "hanidec" }
    );
    expect(ex2.rawMatches).toBeInstanceOf(Array);
    expect(ex2.matches).toBeInstanceOf(Object);
    expect(keyCount(ex2.matches)).toBe(8);
    expect(ex2.result).toBeInstanceOf(Object);
    expect(keyCount(ex2.result)).toBe(6);
    expect(ex2.matches).toEqual({
      M: 4,
      a: 1,
      d: 3,
      h: 12,
      m: 34,
      s: 49,
      y: 2019,
      z: "Asia/Shanghai",
    });
  });

  test("ex3", () => {
    const ex3 = DateTime.fromFormatExplain("٠٣-أبريل-٢٠١٩ ٠٣:٤٦:٠١ م", "dd-MMMM-yyyy hh:mm:ss a", {
      locale: "ar",
      numberingSystem: "arab",
    });
    expect(ex3.rawMatches).toBeInstanceOf(Array);
    expect(ex3.matches).toBeInstanceOf(Object);
    expect(keyCount(ex3.matches)).toBe(7);
    expect(ex3.result).toBeInstanceOf(Object);
    expect(keyCount(ex3.result)).toBe(6);
    expect(ex3.matches).toEqual({
      M: 4,
      a: 1,
      d: 3,
      h: 15,
      m: 46,
      s: 1,
      y: 2019,
    });
  });

  test("ex4", () => {
    const ex4 = DateTime.fromFormatExplain("۰۳-أبريل-۲۰۱۹ ۰۳:۴۷:۲۱ م", "dd-MMMM-yyyy hh:mm:ss a", {
      locale: "ar",
      numberingSystem: "arabext",
    });
    expect(ex4.rawMatches).toBeInstanceOf(Array);
    expect(ex4.matches).toBeInstanceOf(Object);
    expect(keyCount(ex4.matches)).toBe(7);
    expect(ex4.result).toBeInstanceOf(Object);
    expect(keyCount(ex4.result)).toBe(6);
  });

  test("ex5", () => {
    const ex5 = DateTime.fromFormatExplain("᭐᭓-April-᭒᭐᭑᭙ ᭐᭒:᭔᭔:᭐᭗ PM", "dd-MMMM-yyyy hh:mm:ss a", {
      locale: "id",
      numberingSystem: "bali",
    });
    expect(ex5.rawMatches).toBeInstanceOf(Array);
    expect(ex5.matches).toBeInstanceOf(Object);
    expect(keyCount(ex5.matches)).toBe(7);
    expect(ex5.result).toBeInstanceOf(Object);
    expect(keyCount(ex5.result)).toBe(6);
  });

  test("ex6", () => {
    const ex6 = DateTime.fromFormatExplain("০৩ এপ্রিল ২০১৯ ১২.৫৭", "dd MMMM yyyy hh.mm", {
      locale: "bn",
      numberingSystem: "beng",
    });
    expect(ex6.rawMatches).toBeInstanceOf(Array);
    expect(ex6.matches).toBeInstanceOf(Object);
    expect(keyCount(ex6.matches)).toBe(5);
    expect(ex6.result).toBeInstanceOf(Object);
    expect(keyCount(ex6.result)).toBe(5);
    expect(ex6.matches).toEqual({
      M: 4,
      d: 3,
      h: 12,
      m: 57,
      y: 2019,
    });
  });

  test("ex7", () => {
    const ex7 = DateTime.fromFormatExplain(
      "０３-April-２０１９ ０２:４７:０４ PM",
      "dd-MMMM-yyyy hh:mm:ss a",
      {
        locale: "en-US",
        numberingSystem: "fullwide",
      }
    );
    expect(ex7.rawMatches).toBeInstanceOf(Array);
    expect(ex7.matches).toBeInstanceOf(Object);
    expect(keyCount(ex7.matches)).toBe(7);
    expect(ex7.result).toBeInstanceOf(Object);
    expect(keyCount(ex7.result)).toBe(6);
  });

  test("ex8", () => {
    const ex8 = DateTime.fromFormatExplain("०३-April-२०१९ ०२:५३:१९ PM", "dd-MMMM-yyyy hh:mm:ss a", {
      numberingSystem: "deva",
    });
    expect(ex8.rawMatches).toBeInstanceOf(Array);
    expect(ex8.matches).toBeInstanceOf(Object);
    expect(keyCount(ex8.matches)).toBe(7);
    expect(ex8.result).toBeInstanceOf(Object);
    expect(keyCount(ex8.result)).toBe(6);
  });

  test("ex9", () => {
    const ex9 = DateTime.fromFormatExplain(
      "૦૩-એપ્રિલ-૨૦૧૯ ૦૨:૫૫:૨૧ PM",
      "dd-MMMM-yyyy hh:mm:ss a",
      {
        locale: "gu",
        numberingSystem: "gujr",
      }
    );
    expect(ex9.rawMatches).toBeInstanceOf(Array);
    expect(ex9.matches).toBeInstanceOf(Object);
    expect(keyCount(ex9.matches)).toBe(7);
    expect(ex9.result).toBeInstanceOf(Object);
    expect(keyCount(ex9.result)).toBe(6);
  });

  test("ex10", () => {
    const ex10 = DateTime.fromFormatExplain(
      "០៣-April-២០១៩ ០៣:៤៩:២០ PM",
      "dd-MMMM-yyyy hh:mm:ss a",
      {
        numberingSystem: "khmr",
      }
    );
    expect(ex10.rawMatches).toBeInstanceOf(Array);
    expect(ex10.matches).toBeInstanceOf(Object);
    expect(keyCount(ex10.matches)).toBe(7);
    expect(ex10.result).toBeInstanceOf(Object);
    expect(keyCount(ex10.result)).toBe(6);
  });

  test("ex11", () => {
    const ex11 = DateTime.fromFormatExplain(
      "໐໓-April-໒໐໑໙ ໐໓:໕໒:໑໑ PM",
      "dd-MMMM-yyyy hh:mm:ss a",
      {
        numberingSystem: "laoo",
      }
    );
    expect(ex11.rawMatches).toBeInstanceOf(Array);
    expect(ex11.matches).toBeInstanceOf(Object);
    expect(keyCount(ex11.matches)).toBe(7);
    expect(ex11.result).toBeInstanceOf(Object);
    expect(keyCount(ex11.result)).toBe(6);
  });

  test("ex12", () => {
    const ex12 = DateTime.fromFormatExplain(
      "᥆᥉-April-᥈᥆᥇᥏ ᥆᥉:᥋᥉:᥇᥎ PM",
      "dd-MMMM-yyyy hh:mm:ss a",
      {
        numberingSystem: "limb",
      }
    );
    expect(ex12.rawMatches).toBeInstanceOf(Array);
    expect(ex12.matches).toBeInstanceOf(Object);
    expect(keyCount(ex12.matches)).toBe(7);
    expect(ex12.result).toBeInstanceOf(Object);
    expect(keyCount(ex12.result)).toBe(6);
  });

  test("ex13", () => {
    const ex13 = DateTime.fromFormatExplain(
      "൦൩-ഏപ്രിൽ-൨൦൧൯ ൦൩:൫൪:൦൮ PM",
      "dd-MMMM-yyyy hh:mm:ss a",
      {
        locale: "ml",
        numberingSystem: "mlym",
      }
    );
    expect(ex13.rawMatches).toBeInstanceOf(Array);
    expect(ex13.matches).toBeInstanceOf(Object);
    expect(keyCount(ex13.matches)).toBe(7);
    expect(ex13.result).toBeInstanceOf(Object);
    expect(keyCount(ex13.result)).toBe(6);
  });

  test("ex14", () => {
    const ex14 = DateTime.fromFormatExplain(
      "᠐᠓-April-᠒᠐᠑᠙ ᠐᠓:᠕᠖:᠑᠙ PM",
      "dd-MMMM-yyyy hh:mm:ss a",
      {
        numberingSystem: "mong",
      }
    );
    expect(ex14.rawMatches).toBeInstanceOf(Array);
    expect(ex14.matches).toBeInstanceOf(Object);
    expect(keyCount(ex14.matches)).toBe(7);
    expect(ex14.result).toBeInstanceOf(Object);
    expect(keyCount(ex14.result)).toBe(6);
  });

  test("ex15", () => {
    const ex15 = DateTime.fromFormatExplain(
      "୦୩-April-୨୦୧୯ ୦୩:୫୮:୪୩ PM",
      "dd-MMMM-yyyy hh:mm:ss a",
      {
        numberingSystem: "orya",
      }
    );
    expect(ex15.rawMatches).toBeInstanceOf(Array);
    expect(ex15.matches).toBeInstanceOf(Object);
    expect(keyCount(ex15.matches)).toBe(7);
    expect(ex15.result).toBeInstanceOf(Object);
    expect(keyCount(ex15.result)).toBe(6);
  });

  test.skipIf(hasOutdatedTamilAmPmBehavior)("locale 'ta'", () => {
    const ex16 = DateTime.fromFormatExplain(
      "௦௩-ஏப்ரல்-௨௦௧௯ ௦௪:௦௦:௪௧ PM",
      "dd-MMMM-yyyy hh:mm:ss a",
      {
        locale: "ta",
        numberingSystem: "tamldec",
      }
    );
    expect(ex16.rawMatches).toBeInstanceOf(Array);
    expect(ex16.matches).toBeInstanceOf(Object);
    expect(keyCount(ex16.matches)).toBe(7);
    expect(ex16.result).toBeInstanceOf(Object);
    expect(keyCount(ex16.result)).toBe(6);
  });

  test.runIf(hasOutdatedTamilAmPmBehavior)("locale 'ta' (old CLDR)", () => {
    const ex16 = DateTime.fromFormatExplain(
      "௦௩-ஏப்ரல்-௨௦௧௯ ௦௪:௦௦:௪௧ பிற்பகல்",
      "dd-MMMM-yyyy hh:mm:ss a",
      {
        locale: "ta",
        numberingSystem: "tamldec",
      }
    );
    expect(ex16.rawMatches).toBeInstanceOf(Array);
    expect(ex16.matches).toBeInstanceOf(Object);
    expect(keyCount(ex16.matches)).toBe(7);
    expect(ex16.result).toBeInstanceOf(Object);
    expect(keyCount(ex16.result)).toBe(6);
  });

  test("ex17", () => {
    const ex17 = DateTime.fromFormatExplain(
      "౦౩-ఏప్రిల్-౨౦౧౯ ౦౪:౦౧:౩౩ PM",
      "dd-MMMM-yyyy hh:mm:ss a",
      {
        locale: "te",
        numberingSystem: "telu",
      }
    );
    expect(ex17.rawMatches).toBeInstanceOf(Array);
    expect(ex17.matches).toBeInstanceOf(Object);
    expect(keyCount(ex17.matches)).toBe(7);
    expect(ex17.result).toBeInstanceOf(Object);
    expect(keyCount(ex17.result)).toBe(6);
  });

  test("ex18", () => {
    const ex18 = DateTime.fromFormatExplain(
      "๐๓-เมษายน-๒๐๑๙ ๐๔:๐๒:๒๔ หลังเที่ยง",
      "dd-MMMM-yyyy hh:mm:ss a",
      {
        locale: "th",
        numberingSystem: "thai",
      }
    );
    expect(ex18.rawMatches).toBeInstanceOf(Array);
    expect(ex18.matches).toBeInstanceOf(Object);
    expect(keyCount(ex18.matches)).toBe(7);
    expect(ex18.result).toBeInstanceOf(Object);
    expect(keyCount(ex18.result)).toBe(6);
  });

  test("ex19", () => {
    const ex19 = DateTime.fromFormatExplain(
      "༠༣-April-༢༠༡༩ ༠༤:༠༣:༢༥ PM",
      "dd-MMMM-yyyy hh:mm:ss a",
      {
        numberingSystem: "tibt",
      }
    );
    expect(ex19.rawMatches).toBeInstanceOf(Array);
    expect(ex19.matches).toBeInstanceOf(Object);
    expect(keyCount(ex19.matches)).toBe(7);
    expect(ex19.result).toBeInstanceOf(Object);
    expect(keyCount(ex19.result)).toBe(6);
  });

  test("ex20", () => {
    const ex20 = DateTime.fromFormatExplain(
      "၀၃-April-၂၀၁၉ ၀၄:၁၀:၀၁ PM",
      "dd-MMMM-yyyy hh:mm:ss a",
      {
        numberingSystem: "mymr",
      }
    );
    expect(ex20.rawMatches).toBeInstanceOf(Array);
    expect(ex20.matches).toBeInstanceOf(Object);
    expect(keyCount(ex20.matches)).toBe(7);
    expect(ex20.result).toBeInstanceOf(Object);
    expect(keyCount(ex20.result)).toBe(6);
  });
});

test("DateTime.fromFormatExplain() takes the same options as fromFormat", () => {
  const ex = DateTime.fromFormatExplain("Janv. 25 1982", "LLL dd yyyy", { locale: "fr" });
  expect(keyCount(ex.result)).toBe(3);
});

//------
// .parseFormatForOpts
//-------

test("DateTime.parseFormatForOpts returns a parsing format", () => {
  const format = DateTime.parseFormatForOpts(DateTime.DATETIME_FULL);
  expect(format).toMatch(/^MMMM d, yyyyy(?: 'at'|,) h:m a ZZZ$/);
});

describe("DateTime.parseFormatForOpts respects the hour cycle", () => {
  test("locale en-US", () => {
    const enFormat = DateTime.parseFormatForOpts(DateTime.TIME_SIMPLE, { locale: "en-US" });
    expect(enFormat).toEqual("h:m a");
  });

  test("locale de-DE", () => {
    const deFormat = DateTime.parseFormatForOpts(DateTime.TIME_SIMPLE, { locale: "de-DE" });
    expect(deFormat).toEqual("H:m");
  });
});

test("DateTime.parseFormatForOpts respects the hour cycle when forced by the options", () => {
  const format = DateTime.parseFormatForOpts(DateTime.TIME_24_SIMPLE, { locale: "en-US" });
  expect(format).toEqual("H:m");
});

describe("DateTime.parseFormatForOpts throws for invalid inputs", () => {
  test.for(["", "T", 13, null, undefined, true, false, Symbol()])("input $0", (item) => {
    expect(() => DateTime.parseFormatForOpts(item as never)).toThrow(TypeError);
  });
});

//------
// .expandFormat
//-------
//
test("DateTime.expandFormat works with the default locale", () => {
  const format = DateTime.expandFormat("D");
  expect(format).toBe("M/d/yyyyy");
});

test("DateTime.expandFormat works with other locales", () => {
  const format = DateTime.expandFormat("D", { locale: "en-gb" });
  expect(format).toBe("d/M/yyyyy");
});

describe("DateTime.expandFormat respects the hour cycle", () => {
  test("en-US", () => {
    const enFormat = DateTime.expandFormat("t", { locale: "en-US" });
    expect(enFormat).toBe("h:m a");
  });

  test("de-DE", () => {
    const deFormat = DateTime.expandFormat("t", { locale: "de-DE" });
    expect(deFormat).toBe("H:m");
  });
});

test("DateTime.expandFormat respects the hour cycle when forced by the macro token", () => {
  const format = DateTime.expandFormat("T", { locale: "en-US" });
  expect(format).toBe("H:m");
});

test("DateTime.expandFormat works with quoted elements", () => {
  const format = DateTime.expandFormat("T 'quoted'", { locale: "en-US" });
  expect(format).toBe("H:m 'quoted'");
});

//------
// .fromFormatParser
//-------

test("DateTime.fromFormatParser behaves equivalently to DateTime.fromFormat", () => {
  const dateTimeStr = "1982/05/25 09:10:11.445";
  const format = "yyyy/MM/dd HH:mm:ss.SSS";
  const formatParser = DateTime.buildFormatParser(format);
  const ff1 = DateTime.fromFormat(dateTimeStr, format),
    ffP1 = DateTime.fromFormatParser(dateTimeStr, formatParser);

  expect(ffP1).toEqual(ff1);
});

test("DateTime.fromFormatParser throws error when used with a different locale than it was created with", () => {
  const format = "yyyy/MM/dd HH:mm:ss.SSS";
  const formatParser = DateTime.buildFormatParser(format, { locale: "es-ES" });
  expect(() =>
    DateTime.fromFormatParser("1982/05/25 09:10:11.445", formatParser, { locale: "es-MX" })
  ).toThrow(
    "fromFormatParser called with a locale of Locale(es-MX, null, null), but the format parser was created for Locale(es-ES, null, null)"
  );
});
