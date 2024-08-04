/* global test expect */
import { Duration } from "../../src/luxon";

const Helpers = require("../helpers");

const dur = () =>
  Duration.fromObject({
    years: 1,
    months: 2,
    weeks: 1,
    days: 3,
    hours: 4,
    minutes: 5,
    seconds: 6,
    milliseconds: 7,
  });

//------
// #toISO()
//------

test("Duration#toISO fills out every field", () => {
  expect(dur().toISO()).toBe("P1Y2M1W3DT4H5M6.007S");
});

test("Duration#toISO fills out every field with fractional", () => {
  const dur = Duration.fromObject({
    years: 1.1,
    months: 2.2,
    weeks: 1.1,
    days: 3.3,
    hours: 4.4,
    minutes: 5.5,
    seconds: 6.6,
    milliseconds: 7,
  });
  expect(dur.toISO()).toBe("P1.1Y2.2M1.1W3.3DT4.4H5.5M6.607S");
});

test("Duration#toISO creates a minimal string", () => {
  expect(Duration.fromObject({ years: 3, seconds: 45 }).toISO()).toBe("P3YT45S");
  expect(Duration.fromObject({ months: 4, seconds: 45 }).toISO()).toBe("P4MT45S");
  expect(Duration.fromObject({ months: 5 }).toISO()).toBe("P5M");
  expect(Duration.fromObject({ minutes: 5 }).toISO()).toBe("PT5M");
});

test("Duration#toISO handles negative durations", () => {
  expect(Duration.fromObject({ years: -3, seconds: -45 }).toISO()).toBe("P-3YT-45S");
});

test("Duration#toISO handles mixed negative/positive durations", () => {
  expect(Duration.fromObject({ years: 3, seconds: -45 }).toISO()).toBe("P3YT-45S");
  expect(Duration.fromObject({ years: 0, seconds: -45 }).toISO()).toBe("PT-45S");
  expect(Duration.fromObject({ years: -5, seconds: 34 }).toISO()).toBe("P-5YT34S");
});

test("Duration#toISO handles zero durations", () => {
  expect(Duration.fromMillis(0).toISO()).toBe("PT0S");
});

test("Duration#toISO returns null for invalid durations", () => {
  expect(Duration.invalid("because").toISO()).toBe(null);
});

test("Duration#toISO handles milliseconds duration", () => {
  expect(Duration.fromObject({ milliseconds: 7 }).toISO()).toBe("PT0.007S");
});

test("Duration#toISO handles seconds/milliseconds duration", () => {
  expect(Duration.fromObject({ seconds: 17, milliseconds: 548 }).toISO()).toBe("PT17.548S");
});

test("Duration#toISO handles negative seconds/milliseconds duration", () => {
  expect(Duration.fromObject({ seconds: -17, milliseconds: -548 }).toISO()).toBe("PT-17.548S");
});

test("Duration#toISO handles mixed negative/positive numbers in seconds/milliseconds durations", () => {
  expect(Duration.fromObject({ seconds: 17, milliseconds: -548 }).toISO()).toBe("PT16.452S");
  expect(Duration.fromObject({ seconds: -17, milliseconds: 548 }).toISO()).toBe("PT-16.452S");
});

//------
// #toISOTime()
//------

const hhmmssSSS = Duration.fromObject({ hours: 11, minutes: 22, seconds: 33, milliseconds: 444 });
const hhSSS = Duration.fromObject({ hours: 11, milliseconds: 444 });
const hhss = Duration.fromObject({ hours: 11, seconds: 33 });
const hh = Duration.fromObject({ hours: 11 });

test("Duration#toISOTime creates a correct extended string", () => {
  expect(hhmmssSSS.toISOTime()).toBe("11:22:33.444");
});

test("Duration#toISOTime suppresses milliseconds correctly", () => {
  expect(hhSSS.toISOTime({ suppressMilliseconds: true })).toBe("11:00:00.444");
  expect(hhss.toISOTime({ suppressMilliseconds: true })).toBe("11:00:33");
  expect(hh.toISOTime({ suppressMilliseconds: true })).toBe("11:00:00");
});

test("Duration#toISOTime suppresses seconds correctly", () => {
  expect(hhSSS.toISOTime({ suppressSeconds: true })).toBe("11:00:00.444");
  expect(hhss.toISOTime({ suppressSeconds: true })).toBe("11:00:33.000");
  expect(hh.toISOTime({ suppressSeconds: true })).toBe("11:00");
});

test("Duration#toISOTime includes the prefix correctly", () => {
  expect(hh.toISOTime({ includePrefix: true })).toBe("T11:00:00.000");
});

test("Duration#toISOTime creates a correct basic string", () => {
  expect(hhmmssSSS.toISOTime({ format: "basic" })).toBe("112233.444");
  expect(hh.toISOTime({ format: "basic", suppressMilliseconds: true })).toBe("110000");
  expect(hh.toISOTime({ format: "basic", suppressSeconds: true })).toBe("1100");
});

test("Duration#toISOTime returns null if the value is outside the range of one day", () => {
  expect(Duration.fromObject({ hours: 24 }).toISOTime()).toBe(null);
  expect(Duration.fromObject({ milliseconds: -1 }).toISOTime()).toBe(null);
});

test("Duration#toISOTime is not influenced by the locale", () => {
  expect(Duration.fromObject({ hours: 3, minutes: 10 }, { locale: "ar-QA" }).toISOTime()).toBe(
    "03:10:00.000"
  );
});

//------
// #toMillis()
//------

test("Duration#toMillis returns the value in milliseconds", () => {
  expect(Duration.fromMillis(1000).toMillis()).toBe(1000);
  expect(dur().valueOf()).toBe(dur().toMillis());
});

//------
// #toJSON()
//------

test("Duration#toJSON returns the ISO representation", () => {
  expect(dur().toJSON()).toBe(dur().toISO());
});

//------
// #toString()
//------

test("Duration#toString returns the ISO representation", () => {
  expect(dur().toString()).toBe(dur().toISO());
});

//------
// #toFormat()
//------

test("Duration#toFormat('S') returns milliseconds", () => {
  expect(dur().toFormat("S")).toBe("37598706007");

  const lil = Duration.fromMillis(5);
  expect(lil.toFormat("S")).toBe("5");
  expect(lil.toFormat("SS")).toBe("05");
  expect(lil.toFormat("SSSSS")).toBe("00005");
});

test("Duration#toFormat('s') returns seconds", () => {
  expect(dur().toFormat("s")).toBe("37598706");
  expect(dur().toFormat("s", { floor: false })).toBe("37598706.007");
  expect(dur().toFormat("s.SSS")).toBe("37598706.007");

  const lil = Duration.fromObject({ seconds: 6 });
  expect(lil.toFormat("s")).toBe("6");
  expect(lil.toFormat("ss")).toBe("06");
  expect(lil.toFormat("sss")).toBe("006");
  expect(lil.toFormat("ssss")).toBe("0006");
});

test("Duration#toFormat('m') returns minutes", () => {
  expect(dur().toFormat("m")).toBe("626645");
  expect(dur().toFormat("m", { floor: false })).toBe("626645.1");
  expect(dur().toFormat("m:ss")).toBe("626645:06");
  expect(dur().toFormat("m:ss.SSS")).toBe("626645:06.007");

  const lil = Duration.fromObject({ minutes: 6 });
  expect(lil.toFormat("m")).toBe("6");
  expect(lil.toFormat("mm")).toBe("06");
  expect(lil.toFormat("mmm")).toBe("006");
  expect(lil.toFormat("mmmm")).toBe("0006");
});

test("Duration#toFormat('h') returns hours", () => {
  expect(dur().toFormat("h")).toBe("10444");
  expect(dur().toFormat("h", { floor: false })).toBe("10444.085");
  expect(dur().toFormat("h:ss")).toBe("10444:306");
  expect(dur().toFormat("h:mm:ss.SSS")).toBe("10444:05:06.007");

  const lil = Duration.fromObject({ hours: 6 });
  expect(lil.toFormat("h")).toBe("6");
  expect(lil.toFormat("hh")).toBe("06");
  expect(lil.toFormat("hhh")).toBe("006");
  expect(lil.toFormat("hhhh")).toBe("0006");
});

test("Duration#toFormat('d') returns days", () => {
  expect(dur().toFormat("d")).toBe("435");
  expect(dur().toFormat("d", { floor: false })).toBe("435.17");
  expect(dur().toFormat("d:h:ss")).toBe("435:4:306");
  expect(dur().toFormat("d:h:mm:ss.SSS")).toBe("435:4:05:06.007");

  const lil = Duration.fromObject({ days: 6 });
  expect(lil.toFormat("d")).toBe("6");
  expect(lil.toFormat("dd")).toBe("06");
  expect(lil.toFormat("ddd")).toBe("006");
  expect(lil.toFormat("dddd")).toBe("0006");
});

test("Duration#toFormat('w') returns weeks", () => {
  expect(dur().toFormat("w")).toBe("61");
  expect(dur().toFormat("w", { floor: false })).toBe("61.453");
  expect(dur().toFormat("w:s")).toBe("61:273906");
  expect(dur().toFormat("w:dd:h:mm:ss.SSS")).toBe("61:03:4:05:06.007");

  const lil = Duration.fromObject({ weeks: 6 });
  expect(lil.toFormat("w")).toBe("6");
  expect(lil.toFormat("ww")).toBe("06");
  expect(lil.toFormat("www")).toBe("006");
  expect(lil.toFormat("wwww")).toBe("0006");
});

test("Duration#toFormat('M') returns months", () => {
  expect(dur().toFormat("M")).toBe("14");
  expect(dur().toFormat("M", { floor: false })).toBe("14.356");
  expect(dur().toFormat("M:s")).toBe("14:878706");
  expect(dur().toFormat("M:dd:h:mm:ss.SSS")).toBe("14:10:4:05:06.007");

  const lil = Duration.fromObject({ months: 6 });
  expect(lil.toFormat("M")).toBe("6");
  expect(lil.toFormat("MM")).toBe("06");
  expect(lil.toFormat("MMM")).toBe("006");
  expect(lil.toFormat("MMMM")).toBe("0006");
});

test("Duration#toFormat('y') returns years", () => {
  expect(dur().toFormat("y")).toBe("1");
  expect(dur().toFormat("y", { floor: false })).toBe("1.195");
  expect(dur().toFormat("y:m")).toBe("1:101045");
  expect(dur().toFormat("y:M:dd:h:mm:ss.SSS")).toBe("1:2:10:4:05:06.007");

  const lil = Duration.fromObject({ years: 5 });
  expect(lil.toFormat("y")).toBe("5");
  expect(lil.toFormat("yy")).toBe("05");
  expect(lil.toFormat("yyyyy")).toBe("00005");
});

test("Duration#toFormat accepts the deprecated 'round' option", () => {
  expect(dur().toFormat("s", { round: false })).toBe("37598706.007");
  expect(dur().toFormat("m", { round: false })).toBe("626645.1");
  expect(dur().toFormat("h", { round: false })).toBe("10444.085");
  expect(dur().toFormat("d", { round: false })).toBe("435.17");
  expect(dur().toFormat("M", { round: false })).toBe("14.356");
  expect(dur().toFormat("y", { round: false })).toBe("1.195");
});

test("Duration#toFormat leaves in zeros", () => {
  const tiny = Duration.fromObject({ seconds: 5 });
  expect(tiny.toFormat("hh:mm:ss")).toBe("00:00:05");
  expect(tiny.toFormat("hh:mm:ss.SSS")).toBe("00:00:05.000");
});

test("Duration#toFormat rounds down", () => {
  const tiny = Duration.fromObject({ seconds: 5.7 });
  expect(tiny.toFormat("s")).toBe("5");

  const unpromoted = Duration.fromObject({ seconds: 59.7 });
  expect(unpromoted.toFormat("mm:ss")).toBe("00:59");
});

test("Duration#toFormat localizes the numbers", () => {
  expect(dur().reconfigure({ locale: "bn" }).toFormat("yy:MM:dd:h:mm:ss.SSS")).toBe(
    "০১:০২:১০:৪:০৫:০৬.০০৭"
  );
});

test("Duration#toFormat returns a lame string for invalid durations", () => {
  expect(Duration.invalid("because").toFormat("yy")).toBe("Invalid Duration");
});

//------
// #humanize()
//------

test("Duration#toHuman formats out a list", () => {
  expect(dur().toHuman()).toEqual(
    "1 year, 2 months, 1 week, 3 days, 4 hours, 5 minutes, 6 seconds, 7 milliseconds"
  );
});

test("Duration#toHuman only shows the units you have", () => {
  expect(Duration.fromObject({ years: 3, hours: 4 }).toHuman()).toEqual("3 years, 4 hours");
});

test("Duration#toHuman accepts a listStyle", () => {
  expect(dur().toHuman({ listStyle: "long" })).toEqual(
    "1 year, 2 months, 1 week, 3 days, 4 hours, 5 minutes, 6 seconds, and 7 milliseconds"
  );
});

test("Duration#toHuman accepts number format opts", () => {
  expect(dur().toHuman({ unitDisplay: "short" })).toEqual(
    "1 yr, 2 mths, 1 wk, 3 days, 4 hr, 5 min, 6 sec, 7 ms"
  );
});

test("Duration#toHuman works in differt languages", () => {
  expect(dur().reconfigure({ locale: "fr" }).toHuman()).toEqual(
    "1 an, 2 mois, 1 semaine, 3 jours, 4 heures, 5 minutes, 6 secondes, 7 millisecondes"
  );
});

Helpers.withoutLF("Duration#toHuman works without LF", () => {
  expect(dur().toHuman()).toEqual(
    "1 year, 2 months, 1 week, 3 days, 4 hours, 5 minutes, 6 seconds, 7 milliseconds"
  );
});

Helpers.withoutLF("Duration#toHuman falls back to commas", () => {
  expect(dur().reconfigure({ locale: "ja" }).toHuman()).toEqual(
    "1 年, 2 か月, 1 週間, 3 日, 4 時間, 5 分, 6 秒, 7 ミリ秒"
  );
});
