import { describe, test, expect } from "vitest";
import { Duration, DateTime } from "../../src/luxon";
import { DateReferenceRequiredError } from "../../src/errors";

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
});

test("Duration#toMillis returns the total value in milliseconds", () => {
  expect(Duration.fromObject({ hours: 2, seconds: 2 }).toMillis()).toBe(
    2 * 60 * 60 * 1000 + 2 * 1000
  );
});

test("Duration#toMillis accepts a date reference", () => {
  const date = DateTime.utc(2024, 1, 1);
  expect(Duration.fromObject({ days: 2 }).toMillis({ after: date })).toBe(2 * 24 * 60 * 60 * 1000);
});

test("Duration#toMillis handles date reference DST", () => {
  const date = DateTime.local(2026, 3, 8);
  expect(Duration.fromObject({ days: 2 }).toMillis({ after: date })).toBe(
    (24 + 23) * 60 * 60 * 1000
  );
});

test("Duration#toMillis throws if a date reference is required", () => {
  expect(() => Duration.fromObject({ days: 2 }).toMillis()).toThrow(DateReferenceRequiredError);
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
  const dur = Duration.fromObject({
    hours: 1,
    minutes: 2,
    seconds: 3,
    milliseconds: 4,
  });
  expect(dur.toFormat("S")).toBe("3723004");
});

test("Duration#toFormat pads milliseconds correctly", () => {
  const dur = Duration.fromMillis(5);
  expect(dur.toFormat("S")).toBe("5");
  expect(dur.toFormat("SS")).toBe("05");
  expect(dur.toFormat("SSSSS")).toBe("00005");
});

test("Duration#toFormat('s') returns seconds", () => {
  const dur = Duration.fromObject({
    hours: 1,
    minutes: 2,
    seconds: 3,
  });
  expect(dur.toFormat("s")).toBe("3723");
});

test("Duration#toFormat pads seconds correctly", () => {
  const dur = Duration.fromObject({ seconds: 6 });
  expect(dur.toFormat("s")).toBe("6");
  expect(dur.toFormat("ss")).toBe("06");
  expect(dur.toFormat("sss")).toBe("006");
  expect(dur.toFormat("ssss")).toBe("0006");
});

test("Duration#toFormat('m') returns minutes", () => {
  const dur = Duration.fromObject({
    hours: 1,
    minutes: 2,
  });
  expect(dur.toFormat("m")).toBe("62");
});

test("Duration#toFormat pads minutes correctly", () => {
  const dur = Duration.fromObject({ minutes: 6 });
  expect(dur.toFormat("m")).toBe("6");
  expect(dur.toFormat("mm")).toBe("06");
  expect(dur.toFormat("mmm")).toBe("006");
  expect(dur.toFormat("mmmm")).toBe("0006");
});

test("Duration#toFormat('h') returns hours", () => {
  const dur = Duration.fromObject({ hours: 2, minutes: 180 });
  expect(dur.toFormat("h")).toBe("5");
});

test("Duration#toFormat pads hours correctly", () => {
  const dur = Duration.fromObject({ hours: 6 });
  expect(dur.toFormat("h")).toBe("6");
  expect(dur.toFormat("hh")).toBe("06");
  expect(dur.toFormat("hhh")).toBe("006");
  expect(dur.toFormat("hhhh")).toBe("0006");
});

test("Duration#toFormat('d') returns days", () => {
  const dur = Duration.fromObject({
    days: 2,
    weeks: 3,
  });
  expect(dur.toFormat("d")).toBe("23");
});

test("Duration#toFormat pads days correctly", () => {
  const dur = Duration.fromObject({ days: 6 });
  expect(dur.toFormat("d")).toBe("6");
  expect(dur.toFormat("dd")).toBe("06");
  expect(dur.toFormat("ddd")).toBe("006");
  expect(dur.toFormat("dddd")).toBe("0006");
});

test("Duration#toFormat('w') returns weeks", () => {
  const dur = Duration.fromObject({ days: 14, weeks: 1 });
  expect(dur.toFormat("w")).toBe("3");
});

test("Duration#toFormat pads weeks correctly", () => {
  const dur = Duration.fromObject({ weeks: 6 });
  expect(dur.toFormat("w")).toBe("6");
  expect(dur.toFormat("ww")).toBe("06");
  expect(dur.toFormat("www")).toBe("006");
  expect(dur.toFormat("wwww")).toBe("0006");
});

test("Duration#toFormat('M') returns months", () => {
  const dur = Duration.fromObject({ months: 2, years: 1 });
  expect(dur.toFormat("M")).toBe("14");
});

test("Duration#toFormat pads months correctly", () => {
  const dur = Duration.fromObject({ months: 6 });
  expect(dur.toFormat("M")).toBe("6");
  expect(dur.toFormat("MM")).toBe("06");
  expect(dur.toFormat("MMM")).toBe("006");
  expect(dur.toFormat("MMMM")).toBe("0006");
});

test("Duration#toFormat('Q') returns quarters", () => {
  const dur = Duration.fromObject({ months: 6, quarters: 1 });
  expect(dur.toFormat("Q")).toBe("3");
});

test("Duration#toFormat pads quarters correctly", () => {
  const dur = Duration.fromObject({ quarters: 6 });
  expect(dur.toFormat("Q")).toBe("6");
  expect(dur.toFormat("QQ")).toBe("06");
  expect(dur.toFormat("QQQ")).toBe("006");
  expect(dur.toFormat("QQQQ")).toBe("0006");
});

test("Duration#toFormat('y') returns years", () => {
  const dur = Duration.fromObject({ years: 3 });
  expect(dur.toFormat("y")).toBe("3");
});

test("Duration#toFormat pads years correctly", () => {
  const dur = Duration.fromObject({ years: 5 });
  expect(dur.toFormat("y")).toBe("5");
  expect(dur.toFormat("yy")).toBe("05");
  expect(dur.toFormat("yyyyy")).toBe("00005");
});

test("Duration#toFormat leaves in zeros", () => {
  const tiny = Duration.fromObject({ seconds: 5 });
  expect(tiny.toFormat("hh:mm:ss")).toBe("00:00:05");
  expect(tiny.toFormat("hh:mm:ss.SSS")).toBe("00:00:05.000");
});

test("Duration#toFormat localizes the numbers", () => {
  expect(dur().reconfigure({ locale: "bn" }).toFormat("yy:MM:dd:h:mm:ss.SSS")).toBe(
    "০১:০২:১০:৪:০৫:০৬.০০৭"
  );
});

test("Duration#toFormat allows converting to fractional values", () => {
  const dur = Duration.fromObject({ days: 8 });
  expect(dur.toFormat("w")).toBe("1.143");
});

test("Duration#toFormat accepts NumberFormat options", () => {
  const dur = Duration.fromObject({ days: 8 });
  expect(dur.toFormat("w", { maximumFractionDigits: 5 })).toBe("1.14286");
});

test("Duration#toFormat does not allow ambiguous conversions", () => {
  const dur = Duration.fromObject({ months: 2 });
  expect(() => dur.toFormat("d")).toThrow();
});

test("Duration#toFormat accepts a reference date", () => {
  const dur = Duration.fromObject({ months: 2 });
  const date = DateTime.utc(2025, 1, 1);
  expect(() => dur.toFormat("d", { after: date })).toBe("59");
});

test("Duration#toFormat handles reference date DST", () => {
  const dur = Duration.fromObject({ days: 2 });
  const date = DateTime.local(2026, 3, 8);
  expect(() => dur.toFormat("h", { after: date })).toBe("47");
});

// - signMode

describe("Duration#toFormat applies signDisplay according to unitSignDisplay", () => {
  test("Duration#toFormat with unitSignDisplay: 'all' applies signDisplay option to all units", () => {
    const dur = Duration.fromObject({ years: 3, seconds: 0 });
    expect(
      dur.toFormat("y 'years' s 'seconds'", { signDisplay: "always", unitSignDisplay: "all" })
    ).toBe("+3 years +0 seconds");
  });
  test("Duration#toFormat with unitSignDisplay: 'all' defaults signDisplay to 'exceptZero'", () => {
    const dur = Duration.fromObject({ years: 3, seconds: 0 });
    expect(dur.toFormat("y 'years' s 'seconds'", { unitSignDisplay: "all" })).toBe(
      "+3 years 0 seconds"
    );
  });
  test("Duration#toFormat with unitSignDisplay: 'all' defaults signDisplay to 'exceptZero' for mixed durations", () => {
    const dur = Duration.fromObject({ years: 3, minutes: -5, seconds: 0 });
    expect(dur.toFormat("y 'years' m 'minutes' s 'seconds'", { unitSignDisplay: "all" })).toBe(
      "+3 years -5 minutes 0 seconds"
    );
  });

  test("Duration#toFormat with unitSignDisplay: 'leading' shows sign only on leading unit", () => {
    const dur = Duration.fromObject({ years: 3, seconds: 2 });
    expect(
      dur.toFormat("y 'years' s 'seconds'", { signDisplay: "always", unitSignDisplay: "leading" })
    ).toBe("+3 years 2 seconds");
  });
  test("Duration#toFormat with unitSignDisplay: 'leading' defaults signDisplay to 'auto'", () => {
    const dur = Duration.fromObject({ years: 3, seconds: 0 });
    expect(dur.toFormat("y 'years' s 'seconds'", { unitSignDisplay: "leading" })).toBe(
      "3 years 0 seconds"
    );
  });
  test("Duration#toFormat with unitSignDisplay: 'leading' defaults signDisplay to 'auto' with negative durations", () => {
    const dur = Duration.fromObject({ years: -3, seconds: -2 });
    expect(dur.toFormat("y 'years' s 'seconds'", { unitSignDisplay: "leading" })).toBe(
      "-3 years 2 seconds"
    );
  });
  test("Duration#toFormat with unitSignDisplay: 'leading' throws for mixed durations", () => {
    expect(() =>
      Duration.fromObject({ years: -3, seconds: -2 }).toFormat("y s ", {
        unitSignDisplay: "leading",
      })
    ).toThrow();
  });

  test("Duration#toFormat with unitSignDisplay: 'largest' shows sign only on largest unit", () => {
    const dur = Duration.fromObject({ years: 3, seconds: 2 });
    expect(
      dur.toFormat("s 'seconds' y 'years'", { signDisplay: "always", unitSignDisplay: "largest" })
    ).toBe("2 seconds +3 years");
  });
  test("Duration#toFormat with unitSignDisplay: 'largest' defaults signDisplay to 'auto'", () => {
    const dur = Duration.fromObject({ years: 3, seconds: 0 });
    expect(dur.toFormat("s 'seconds' y 'years'", { unitSignDisplay: "largest" })).toBe(
      "0 seconds 3 years"
    );
  });
  test("Duration#toFormat with unitSignDisplay: 'largest' defaults signDisplay to 'auto' with negative durations", () => {
    const dur = Duration.fromObject({ years: -3, seconds: -2 });
    expect(dur.toFormat("s 'seconds' y 'years'", { unitSignDisplay: "largest" })).toBe(
      "2 seconds -3 years"
    );
  });
  test("Duration#toFormat with unitSignDisplay: 'largest' throws for mixed durations", () => {
    expect(() =>
      Duration.fromObject({ years: -3, seconds: -2 }).toFormat("y s ", {
        unitSignDisplay: "largest",
      })
    ).toThrow();
  });

  test("Duration#toFormat with unitSignDisplay: 'auto' defaults signDisplay to 'auto' for non-mixed durations", () => {
    const dur = Duration.fromObject({ years: 3, seconds: 2 });
    expect(dur.toFormat("y 'years' s 'seconds'", { unitSignDisplay: "auto" })).toBe(
      "3 years 2 seconds"
    );
  });
  test("Duration#toFormat with unitSignDisplay: 'auto' defaults signDisplay to 'exceptZero' for mixed durations", () => {
    const dur = Duration.fromObject({ years: 3, seconds: -2 });
    expect(dur.toFormat("y 'years' s 'seconds'", { unitSignDisplay: "auto" })).toBe(
      "3 years -2 seconds"
    );
  });
  test("Duration#toFormat with unitSignDisplay: 'auto' means unitSignDisplay 'leading' for non-mixed durations", () => {
    const dur = Duration.fromObject({ years: -3, seconds: -2 });
    expect(dur.toFormat("y 'years' s 'seconds'", { unitSignDisplay: "auto" })).toBe(
      "-3 years 2 seconds"
    );
  });
  test("Duration#toFormat with unitSignDisplay: 'auto' means unitSignDisplay 'all', signDisplay 'exceptZero' for mixed durations", () => {
    const dur = Duration.fromObject({ years: -3, seconds: 2 });
    expect(dur.toFormat("y 'years' s 'seconds'", { unitSignDisplay: "auto" })).toBe(
      "-3 years +2 seconds"
    );
  });
  test("Duration#toFormat with unitSignDisplay: 'auto' still allows setting signDisplay", () => {
    const dur = Duration.fromObject({ years: 3, seconds: 2 });
    expect(
      dur.toFormat("y 'years' s 'seconds'", { unitSignDisplay: "auto", signDisplay: "always" })
    ).toBe("+3 years 2 seconds");
  });
});

//------
// #toHuman()
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

test("Duration#toHuman accepts hiding of zero values", () => {
  expect(
    Duration.fromObject({
      years: 1,
      months: 0,
      weeks: 1,
      days: 0,
      hours: 4,
      minutes: 0,
      seconds: 6,
      milliseconds: 0,
    }).toHuman({ showZeros: false })
  ).toEqual("1 year, 1 week, 4 hours, 6 seconds");
});

test("Duration#toHuman handles undefined showZeros", () => {
  expect(
    Duration.fromObject({
      years: 1,
      months: 0,
      weeks: 1,
      days: 0,
      hours: 4,
      minutes: 0,
      seconds: 6,
      milliseconds: 0,
    }).toHuman({ showZeros: undefined })
  ).toEqual("1 year, 0 months, 1 week, 0 days, 4 hours, 0 minutes, 6 seconds, 0 milliseconds");
});

test("Duration#toHuman works in different languages", () => {
  expect(dur().reconfigure({ locale: "fr" }).toHuman()).toEqual(
    "1 an, 2 mois, 1 semaine, 3 jours, 4 heures, 5 minutes, 6 secondes, 7 millisecondes"
  );
});

test("Duration#toHuman handles quarters", () => {
  expect(
    Duration.fromObject({
      years: 1,
      quarters: 2,
      hours: 2,
    }).toHuman()
  ).toEqual("1 year, 6 months, 2 hours");
});

test("Duration#toHuman handles quarters and months together", () => {
  expect(
    Duration.fromObject({
      years: 1,
      months: 1,
      quarters: 2,
      hours: 2,
    }).toHuman()
  ).toEqual("1 year, 7 months, 2 hours");
});

test("Duration#toHuman handles quarters and months with showZeros false", () => {
  expect(
    Duration.fromObject({
      years: 1,
      months: 1,
      quarters: 0,
      hours: 2,
    }).toHuman({ showZeros: false })
  ).toEqual("1 year, 1 month, 2 hours");
  expect(
    Duration.fromObject({
      years: 1,
      months: 0,
      quarters: 1,
      hours: 2,
    }).toHuman({ showZeros: false })
  ).toEqual("1 year, 3 months, 2 hours");
  expect(
    Duration.fromObject({
      years: 1,
      months: 0,
      quarters: 0,
      hours: 2,
    }).toHuman({ showZeros: false })
  ).toEqual("1 year, 2 hours");
  expect(
    Duration.fromObject({
      years: 1,
      quarters: 0,
      hours: 2,
    }).toHuman({ showZeros: false })
  ).toEqual("1 year, 2 hours");
});
