/* global test expect */
import { DateTime } from "../../src/luxon";
import Helpers from "../helpers";
import Settings from "../../src/settings";
import { ConflictingSpecificationError } from "../../src/errors";

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

test("DateTime.fromFormat() yields Invalid reason 'unparseable' for incompatible formats", () => {
  const i = DateTime.fromFormat("Mar 3, 2020", "MMM dd, yyyy");
  expect(i.invalid).not.toBeNull;
  expect(i.invalid.reason).toEqual("unparsable");
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

test("DateTime.fromFormat() throws if h is used with 24-hour time", () => {
  expect(() => DateTime.fromFormat("18:30 AM", "h:mm a")).toThrowError(
    ConflictingSpecificationError
  );
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

test("DateTime.fromFormat() parses variable-digit years", () => {
  expect(DateTime.fromFormat("", "y").isValid).toBe(false);
  expect(DateTime.fromFormat("2", "y").year).toBe(2);
  expect(DateTime.fromFormat("22", "y").year).toBe(22);
  expect(DateTime.fromFormat("222", "y").year).toBe(222);
  expect(DateTime.fromFormat("2222", "y").year).toBe(2222);
  expect(DateTime.fromFormat("22222", "y").year).toBe(22222);
  expect(DateTime.fromFormat("222222", "y").year).toBe(222222);
  expect(DateTime.fromFormat("2222222", "y").isValid).toBe(false);
});

test("DateTime.fromFormat() with yyyyy optionally parses extended years", () => {
  expect(DateTime.fromFormat("222", "yyyyy").isValid).toBe(false);
  expect(DateTime.fromFormat("2222", "yyyyy").year).toBe(2222);
  expect(DateTime.fromFormat("22222", "yyyyy").year).toBe(22222);
  expect(DateTime.fromFormat("222222", "yyyyy").year).toBe(222222);
  expect(DateTime.fromFormat("2222222", "yyyyy").isValid).toBe(false);
});

test("DateTime.fromFormat() with yyyyyy strictly parses extended years", () => {
  expect(DateTime.fromFormat("2222", "yyyyyy").isValid).toBe(false);
  expect(DateTime.fromFormat("222222", "yyyyyy").year).toBe(222222);
  expect(DateTime.fromFormat("022222", "yyyyyy").year).toBe(22222);
  expect(DateTime.fromFormat("2222222", "yyyyyy").isValid).toBe(false);
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

test("DateTime.fromFormat() parses milliseconds", () => {
  expect(DateTime.fromFormat("1", "S").millisecond).toBe(1);
  expect(DateTime.fromFormat("12", "S").millisecond).toBe(12);
  expect(DateTime.fromFormat("123", "S").millisecond).toBe(123);
  expect(DateTime.fromFormat("1234", "S").isValid).toBe(false);

  expect(DateTime.fromFormat("1", "S").millisecond).toBe(1);
  expect(DateTime.fromFormat("12", "S").millisecond).toBe(12);
  expect(DateTime.fromFormat("123", "S").millisecond).toBe(123);

  expect(DateTime.fromFormat("1", "SSS").isValid).toBe(false);
  expect(DateTime.fromFormat("12", "SSS").isValid).toBe(false);
  expect(DateTime.fromFormat("123", "SSS").millisecond).toBe(123);
  expect(DateTime.fromFormat("023", "SSS").millisecond).toBe(23);
  expect(DateTime.fromFormat("1234", "SSS").isValid).toBe(false);
});

test("DateTime.fromFormat() parses fractional seconds", () => {
  expect(DateTime.fromFormat("1", "u").millisecond).toBe(100);
  expect(DateTime.fromFormat("12", "u").millisecond).toBe(120);
  expect(DateTime.fromFormat("123", "u").millisecond).toBe(123);
  expect(DateTime.fromFormat("023", "u").millisecond).toBe(23);
  expect(DateTime.fromFormat("003", "u").millisecond).toBe(3);
  expect(DateTime.fromFormat("1234", "u").millisecond).toBe(123);
  expect(DateTime.fromFormat("1235", "u").millisecond).toBe(123);

  expect(DateTime.fromFormat("1", "uu").millisecond).toBe(100);
  expect(DateTime.fromFormat("12", "uu").millisecond).toBe(120);
  expect(DateTime.fromFormat("02", "uu").millisecond).toBe(20);
  expect(DateTime.fromFormat("-33", "uu").isValid).toBe(false);

  expect(DateTime.fromFormat("1", "uuu").millisecond).toBe(100);
  expect(DateTime.fromFormat("-2", "uuu").isValid).toBe(false);
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
  const i = DateTime.fromFormat("janvQ 25 1982", "LLL dd yyyy", {
    locale: "fr",
  });
  expect(i.isValid).toBe(false);
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

test("DateTime.fromFormat() validates weekday numbers", () => {
  let d = DateTime.fromFormat("2, 05/25/1982", "E, LL/dd/yyyy");
  expect(d.year).toBe(1982);
  expect(d.month).toBe(5);
  expect(d.day).toBe(25);

  d = DateTime.fromFormat("1, 05/25/1982", "E, LL/dd/yyyy");
  expect(d.isValid).toBeFalsy();
});

test("DateTime.fromFormat() validates weekday names", () => {
  let d = DateTime.fromFormat("Tuesday, 05/25/1982", "EEEE, LL/dd/yyyy");
  expect(d.isValid).toBe(true);
  expect(d.year).toBe(1982);
  expect(d.month).toBe(5);
  expect(d.day).toBe(25);

  d = DateTime.fromFormat("Monday, 05/25/1982", "EEEE, LL/dd/yyyy");
  expect(d.isValid).toBeFalsy();

  d = DateTime.fromFormat("mardi, 05/25/1982", "EEEE, LL/dd/yyyy", {
    locale: "fr",
  });
  expect(d.isValid).toBe(true);
  expect(d.year).toBe(1982);
  expect(d.month).toBe(5);
  expect(d.day).toBe(25);
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

test("DateTime.fromFormat() returns invalid when unparsed", () => {
  expect(DateTime.fromFormat("Splurk", "EEEE").isValid).toBe(false);
});

test("DateTime.fromFormat() returns invalid when quarter value is not valid", () => {
  expect(DateTime.fromFormat("2019Qaa", "yyyy'Q'qq").isValid).toBe(false);
  expect(DateTime.fromFormat("2019Q00", "yyyy'Q'qq").isValid).toBe(false);
  expect(DateTime.fromFormat("2019Q0", "yyyy'Q'q").isValid).toBe(false);
  expect(DateTime.fromFormat("2019Q1", "yyyy'Q'q").isValid).toBe(true);
  expect(DateTime.fromFormat("2019Q5", "yyyy'Q'q").isValid).toBe(false);
});

test("DateTime.fromFormat() returns invalid for out-of-range values", () => {
  const rejects = (s, fmt, opts = {}) =>
    expect(DateTime.fromFormat(s, fmt, opts).isValid).toBeFalsy();

  rejects("8, 05/25/1982", "E, MM/dd/yyyy", { locale: "fr" });
  rejects("Tuesday, 05/25/1982", "EEEE, MM/dd/yyyy", { locale: "fr" });
  rejects("Giberish, 05/25/1982", "EEEE, MM/dd/yyyy");
  rejects("14/25/1982", "MM/dd/yyyy");
  rejects("05/46/1982", "MM/dd/yyyy");
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
  expect(d.isValid).toBe(true);
  expect(d.offset).toBe(0);
  expect(d.hour).toBe(0);
  expect(d.minute).toBe(10);

  d = DateTime.fromFormat("1982/05/25 09:10:11.445 UTC", "yyyy/MM/dd HH:mm:ss.SSS z").toUTC();
  expect(d.isValid).toBe(true);
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
  expect(i.isValid).toBe(true);
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
  expect(i.isValid).toBe(true);
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
  expect(i.isValid).toBe(true);
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
  expect(i.isValid).toBe(true);
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
  expect(i.isValid).toBe(true);
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
  expect(i.isValid).toBe(true);
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
  expect(i.isValid).toBe(true);
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

test("DateTime.fromFormat() parses localized macro tokens", () => {
  const formatGroups = [
    {
      formats: ["D", "DD", "DDD", "DDDD"],
      expectEqual: {
        year: true,
        month: true,
        day: true,
      },
    },

    {
      formats: ["t", "T"],
      expectEqual: {
        hour: true,
        minute: true,
      },
    },
    {
      formats: ["tt", "TT"],
      expectEqual: {
        hour: true,
        minute: true,
        second: true,
      },
    },

    {
      formats: ["F", "FF"],
      expectEqual: {
        year: true,
        month: true,
        day: true,
        hour: true,
        minute: true,
        second: true,
      },
    },

    // Parsing time zone names like `EDT` or `Eastern Daylight Time` is not supported
    {
      formats: ["ttt", "tttt", "TTT", "TTTT", "FFF", "FFFF"],
      expectInvalid: true,
    },
  ];

  const sampleDateTime = DateTime.fromMillis(1555555555555);

  for (const { formats, expectEqual, expectInvalid } of formatGroups) {
    for (const locale of [null, "en-gb", "de"]) {
      for (const format of formats) {
        const formatted = sampleDateTime.toFormat(format, { locale });
        const parsed = DateTime.fromFormat(formatted, format, { locale });

        if (expectInvalid) {
          expect(parsed.isValid).toBe(false);
        } else {
          expect(parsed.isValid).toBe(true);

          for (const key of Object.keys(expectEqual)) {
            expect(parsed[key]).toBe(sampleDateTime[key]);
          }
        }
      }
    }
  }
});

test("DateTime.fromFormat() allows non-breaking white-space to be substituted inside macro-tokens", () => {
  expect(DateTime.fromFormat("5:54 PM", "t", { locale: "en-US" }).isValid).toBe(true);
  expect(DateTime.fromFormat("5:54 PM", "t", { locale: "en-US" }).isValid).toBe(true);
  expect(DateTime.fromFormat("5:54\nPM", "t", { locale: "en-US" }).isValid).toBe(false);
});

test("DateTime.fromFormat() throws if you don't provide a format", () => {
  expect(() => DateTime.fromFormat("yo")).toThrowError();
});

test("DateTime.fromFormat validates weekdays", () => {
  let dt = DateTime.fromFormat("Wed 2017-11-29 02:00", "EEE yyyy-MM-dd HH:mm");
  expect(dt.isValid).toBe(true);

  dt = DateTime.fromFormat("Thu 2017-11-29 02:00", "EEE yyyy-MM-dd HH:mm");
  expect(dt.isValid).toBe(false);

  dt = DateTime.fromFormat("Wed 2017-11-29 02:00 +12:00", "EEE yyyy-MM-dd HH:mm ZZ");
  expect(dt.isValid).toBe(true);

  dt = DateTime.fromFormat("Wed 2017-11-29 02:00 +12:00", "EEE yyyy-MM-dd HH:mm ZZ", {
    setZone: true,
  });

  expect(dt.isValid).toBe(true);

  dt = DateTime.fromFormat("Tue 2017-11-29 02:00 +12:00", "EEE yyyy-MM-dd HH:mm ZZ", {
    setZone: true,
  });
  expect(dt.isValid).toBe(false);
});

test("DateTime.fromFormat containing special regex token", () => {
  const ianaFormat = "yyyy-MM-dd'T'HH-mm[z]";
  const dt = DateTime.fromFormat("2019-01-14T11-30[Indian/Maldives]", ianaFormat, {
    setZone: true,
  });
  expect(dt.isValid).toBe(true);
  expect(dt.zoneName).toBe("Indian/Maldives");

  expect(
    DateTime.fromFormat("2019-01-14T11-30[[Indian/Maldives]]", "yyyy-MM-dd'T'HH-mm[[z]]").isValid
  ).toBe(true);

  expect(
    DateTime.fromFormat("2019-01-14T11-30tIndian/Maldivest", "yyyy-MM-dd'T'HH-mm't'z't'").isValid
  ).toBe(true);

  expect(
    DateTime.fromFormat("2019-01-14T11-30\tIndian/Maldives\t", "yyyy-MM-dd'T'HH-mm't'z't'").isValid
  ).toBe(false);
});

// #1362
test("DateTime.fromFormat only an offset", () => {
  const dt = DateTime.fromFormat("+0100", "ZZZ", { setZone: true });
  expect(dt.isValid).toBe(true);
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

test("DateTime.fromFormatExplain() parses localized string with numberingSystem correctly", () => {
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

  const ex4 = DateTime.fromFormatExplain("۰۳-أبريل-۲۰۱۹ ۰۳:۴۷:۲۱ م", "dd-MMMM-yyyy hh:mm:ss a", {
    locale: "ar",
    numberingSystem: "arabext",
  });
  expect(ex4.rawMatches).toBeInstanceOf(Array);
  expect(ex4.matches).toBeInstanceOf(Object);
  expect(keyCount(ex4.matches)).toBe(7);
  expect(ex4.result).toBeInstanceOf(Object);
  expect(keyCount(ex4.result)).toBe(6);

  const ex5 = DateTime.fromFormatExplain("᭐᭓-April-᭒᭐᭑᭙ ᭐᭒:᭔᭔:᭐᭗ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    locale: "id",
    numberingSystem: "bali",
  });
  expect(ex5.rawMatches).toBeInstanceOf(Array);
  expect(ex5.matches).toBeInstanceOf(Object);
  expect(keyCount(ex5.matches)).toBe(7);
  expect(ex5.result).toBeInstanceOf(Object);
  expect(keyCount(ex5.result)).toBe(6);

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

  const ex8 = DateTime.fromFormatExplain("०३-April-२०१९ ०२:५३:१९ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    numberingSystem: "deva",
  });
  expect(ex8.rawMatches).toBeInstanceOf(Array);
  expect(ex8.matches).toBeInstanceOf(Object);
  expect(keyCount(ex8.matches)).toBe(7);
  expect(ex8.result).toBeInstanceOf(Object);
  expect(keyCount(ex8.result)).toBe(6);

  const ex9 = DateTime.fromFormatExplain("૦૩-એપ્રિલ-૨૦૧૯ ૦૨:૫૫:૨૧ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    locale: "gu",
    numberingSystem: "gujr",
  });
  expect(ex9.rawMatches).toBeInstanceOf(Array);
  expect(ex9.matches).toBeInstanceOf(Object);
  expect(keyCount(ex9.matches)).toBe(7);
  expect(ex9.result).toBeInstanceOf(Object);
  expect(keyCount(ex9.result)).toBe(6);

  const ex10 = DateTime.fromFormatExplain("០៣-April-២០១៩ ០៣:៤៩:២០ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    numberingSystem: "khmr",
  });
  expect(ex10.rawMatches).toBeInstanceOf(Array);
  expect(ex10.matches).toBeInstanceOf(Object);
  expect(keyCount(ex10.matches)).toBe(7);
  expect(ex10.result).toBeInstanceOf(Object);
  expect(keyCount(ex10.result)).toBe(6);

  const ex11 = DateTime.fromFormatExplain("໐໓-April-໒໐໑໙ ໐໓:໕໒:໑໑ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    numberingSystem: "laoo",
  });
  expect(ex11.rawMatches).toBeInstanceOf(Array);
  expect(ex11.matches).toBeInstanceOf(Object);
  expect(keyCount(ex11.matches)).toBe(7);
  expect(ex11.result).toBeInstanceOf(Object);
  expect(keyCount(ex11.result)).toBe(6);

  const ex12 = DateTime.fromFormatExplain("᥆᥉-April-᥈᥆᥇᥏ ᥆᥉:᥋᥉:᥇᥎ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    numberingSystem: "limb",
  });
  expect(ex12.rawMatches).toBeInstanceOf(Array);
  expect(ex12.matches).toBeInstanceOf(Object);
  expect(keyCount(ex12.matches)).toBe(7);
  expect(ex12.result).toBeInstanceOf(Object);
  expect(keyCount(ex12.result)).toBe(6);

  const ex13 = DateTime.fromFormatExplain("൦൩-ഏപ്രിൽ-൨൦൧൯ ൦൩:൫൪:൦൮ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    locale: "ml",
    numberingSystem: "mlym",
  });
  expect(ex13.rawMatches).toBeInstanceOf(Array);
  expect(ex13.matches).toBeInstanceOf(Object);
  expect(keyCount(ex13.matches)).toBe(7);
  expect(ex13.result).toBeInstanceOf(Object);
  expect(keyCount(ex13.result)).toBe(6);

  const ex14 = DateTime.fromFormatExplain("᠐᠓-April-᠒᠐᠑᠙ ᠐᠓:᠕᠖:᠑᠙ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    numberingSystem: "mong",
  });
  expect(ex14.rawMatches).toBeInstanceOf(Array);
  expect(ex14.matches).toBeInstanceOf(Object);
  expect(keyCount(ex14.matches)).toBe(7);
  expect(ex14.result).toBeInstanceOf(Object);
  expect(keyCount(ex14.result)).toBe(6);

  const ex15 = DateTime.fromFormatExplain("୦୩-April-୨୦୧୯ ୦୩:୫୮:୪୩ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    numberingSystem: "orya",
  });
  expect(ex15.rawMatches).toBeInstanceOf(Array);
  expect(ex15.matches).toBeInstanceOf(Object);
  expect(keyCount(ex15.matches)).toBe(7);
  expect(ex15.result).toBeInstanceOf(Object);
  expect(keyCount(ex15.result)).toBe(6);

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

  const ex19 = DateTime.fromFormatExplain("༠༣-April-༢༠༡༩ ༠༤:༠༣:༢༥ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    numberingSystem: "tibt",
  });
  expect(ex19.rawMatches).toBeInstanceOf(Array);
  expect(ex19.matches).toBeInstanceOf(Object);
  expect(keyCount(ex19.matches)).toBe(7);
  expect(ex19.result).toBeInstanceOf(Object);
  expect(keyCount(ex19.result)).toBe(6);

  const ex20 = DateTime.fromFormatExplain("၀၃-April-၂၀၁၉ ၀၄:၁၀:၀၁ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    numberingSystem: "mymr",
  });
  expect(ex20.rawMatches).toBeInstanceOf(Array);
  expect(ex20.matches).toBeInstanceOf(Object);
  expect(keyCount(ex20.matches)).toBe(7);
  expect(ex20.result).toBeInstanceOf(Object);
  expect(keyCount(ex20.result)).toBe(6);
});

test("DateTime.fromFormatExplain() takes the same options as fromFormat", () => {
  const ex = DateTime.fromFormatExplain("Janv. 25 1982", "LLL dd yyyy", { locale: "fr" });
  expect(keyCount(ex.result)).toBe(3);
});

//------
// .fromStringExplain
//-------
test("DateTime.fromStringExplain is an alias for DateTime.fromFormatExplain", () => {
  const ff = DateTime.fromStringExplain("1982/05/25 09:10:11.445", "yyyy/MM/dd HH:mm:ss.SSS"),
    fs = DateTime.fromFormatExplain("1982/05/25 09:10:11.445", "yyyy/MM/dd HH:mm:ss.SSS");

  expect(ff).toEqual(fs);
});

//------
// .fromString
//-------

test("DateTime.fromString is an alias for DateTime.fromFormat", () => {
  const ff = DateTime.fromString("1982/05/25 09:10:11.445", "yyyy/MM/dd HH:mm:ss.SSS"),
    fs = DateTime.fromFormat("1982/05/25 09:10:11.445", "yyyy/MM/dd HH:mm:ss.SSS");

  expect(ff).toEqual(fs);
});

//------
// .parseFormatForOpts
//-------

test("DateTime.parseFormatForOpts returns a parsing format", () => {
  const format = DateTime.parseFormatForOpts(DateTime.DATETIME_FULL);
  expect(format).toEqual("MMMM d, yyyyy at h:m a ZZZ");
});

test("DateTime.parseFormatForOpts returns a parsing format", () => {
  const format = DateTime.parseFormatForOpts("");
  expect(format).toBeNull();
});
test("DateTime.parseFormatForOpts respects the hour cycle", () => {
  const enFormat = DateTime.parseFormatForOpts(DateTime.TIME_SIMPLE, { locale: "en-US" });
  expect(enFormat).toEqual("h:m a");

  const deFormat = DateTime.parseFormatForOpts(DateTime.TIME_SIMPLE, { locale: "de-DE" });
  expect(deFormat).toEqual("H:m");
});
test("DateTime.parseFormatForOpts respects the hour cycle when forced by the options", () => {
  const format = DateTime.parseFormatForOpts(DateTime.TIME_24_SIMPLE, { locale: "en-US" });
  expect(format).toEqual("H:m");
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

test("DateTime.expandFormat respects the hour cycle", () => {
  const enFormat = DateTime.expandFormat("t", { locale: "en-US" });
  expect(enFormat).toBe("h:m a");

  const deFormat = DateTime.expandFormat("t", { locale: "de-DE" });
  expect(deFormat).toBe("H:m");
});

test("DateTime.expandFormat respects the hour cycle when forced by the macro token", () => {
  const format = DateTime.expandFormat("T", { locale: "en-US" });
  expect(format).toBe("H:m");
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
  expect(ffP1.isValid).toBe(true);
});

test("DateTime.fromFormatParser throws error when used with a different locale than it was created with", () => {
  const format = "yyyy/MM/dd HH:mm:ss.SSS";
  const formatParser = DateTime.buildFormatParser(format, { locale: "es-ES" });
  expect(() =>
    DateTime.fromFormatParser("1982/05/25 09:10:11.445", formatParser, { locale: "es-MX" })
  ).toThrowError(
    "fromFormatParser called with a locale of Locale(es-MX, null, null), but the format parser was created for Locale(es-ES, null, null)"
  );
});
