/* global test expect */
import { Duration } from "../../src/luxon";

//------
// #shiftTo()
//-------
test("Duration#shiftTo rolls milliseconds up hours and minutes", () => {
  const dur = Duration.fromMillis(5760000);
  expect(dur.shiftTo("hours").hours).toBe(1.6);

  const mod = dur.shiftTo("hours", "minutes");
  expect(mod.toObject()).toEqual({ hours: 1, minutes: 36 });
});

test("Duration#shiftTo boils hours down milliseconds", () => {
  const dur = Duration.fromObject({ hours: 1 }).shiftTo("milliseconds");
  expect(dur.milliseconds).toBe(3600000);
});

test("Duration boils hours down shiftTo minutes and milliseconds", () => {
  const dur = Duration.fromObject({ hours: 1, seconds: 30 }).shiftTo("minutes", "milliseconds");
  expect(dur.toObject()).toEqual({ minutes: 60, milliseconds: 30000 });
});

test("Duration#shiftTo boils down and then rolls up", () => {
  const dur = Duration.fromObject({ years: 2, hours: 5000 }).shiftTo("months", "days", "minutes");
  expect(dur.toObject()).toEqual({ months: 30, days: 28, minutes: 8 * 60 });
});

test("Duration#shiftTo throws on invalid units", () => {
  expect(() => {
    Duration.fromObject({ years: 2, hours: 5000 }).shiftTo("months", "glorp");
  }).toThrow();
});

test("Duration#shiftTo tacks decimals onto the end", () => {
  const dur = Duration.fromObject({ minutes: 73 }).shiftTo("hours");
  expect(dur.isValid).toBe(true);
  expect(dur.hours).toBeCloseTo(1.2167, 4);
});

test("Duration#shiftTo deconstructs decimal inputs", () => {
  const dur = Duration.fromObject({ hours: 2.3 }).shiftTo("hours", "minutes");
  expect(dur.isValid).toBe(true);
  expect(dur.hours).toBe(2);
  expect(dur.minutes).toBeCloseTo(18, 8);
});

test("Duration#shiftTo maintains invalidity", () => {
  const dur = Duration.invalid("because").shiftTo("years");
  expect(dur.isValid).toBe(false);
  expect(dur.invalidReason).toBe("because");
});

test("Duration#shiftTo without any units no-ops", () => {
  const dur = Duration.fromObject({ years: 3 }).shiftTo();
  expect(dur.isValid).toBe(true);
  expect(dur.toObject()).toEqual({ years: 3 });
});

test("Duration#shifTo accumulates when rolling up", () => {
  expect(
    Duration.fromObject({ minutes: 59, seconds: 183 })
      .shiftTo("hours", "minutes", "seconds")
      .toObject()
  ).toEqual({ hours: 1, minutes: 2, seconds: 3 });
});

test("Duration#shifTo keeps unecessary higher-order negative units 0", () => {
  expect(
    Duration.fromObject({ milliseconds: -100 })
      .shiftTo("hours", "minutes", "seconds")
      .toObject()
  ).toEqual({ hours: 0, minutes: 0, seconds: -0.1 });
});

//------
// #normalize()
//-------
test("Duration#normalize rebalances negative units", () => {
  const dur = Duration.fromObject({ years: 2, days: -2 }).normalize();
  expect(dur.toObject()).toEqual({ years: 1, days: 363 });
});

test("Duration#normalize de-overflows", () => {
  const dur = Duration.fromObject({ years: 2, days: 5000 }).normalize();
  expect(dur.years).toBe(15);
  expect(dur.days).toBe(255);
  expect(dur.toObject()).toEqual({ years: 15, days: 255 });
});

test("Duration#normalize handles fully negative durations", () => {
  const dur = Duration.fromObject({ years: -2, days: -5000 }).normalize();
  expect(dur.toObject()).toEqual({ years: -15, days: -255 });
});

test("Duration#normalize handles the full grid partially negative durations", () => {
  const sets = [
    [{ months: 1, days: 32 }, { months: 2, days: 2 }],
    [{ months: 1, days: 28 }, { months: 1, days: 28 }],
    [{ months: 1, days: -32 }, { months: 0, days: -2 }],
    [{ months: 1, days: -28 }, { months: 0, days: 2 }],
    [{ months: -1, days: 32 }, { months: 0, days: 2 }],
    [{ months: -1, days: 28 }, { months: 0, days: -2 }],
    [{ months: -1, days: -32 }, { months: -2, days: -2 }],
    [{ months: -1, days: -28 }, { months: -1, days: -28 }],
    [{ months: 0, days: 32 }, { months: 1, days: 2 }],
    [{ months: 0, days: 28 }, { months: 0, days: 28 }],
    [{ months: 0, days: -32 }, { months: -1, days: -2 }],
    [{ months: 0, days: -28 }, { months: 0, days: -28 }]
  ];

  sets.forEach(([from, to]) => {
    expect(
      Duration.fromObject(from)
        .normalize()
        .toObject()
    ).toEqual(to);
  });
});

test("Duration#normalize maintains invalidity", () => {
  const dur = Duration.invalid("because").normalize();
  expect(dur.isValid).toBe(false);
  expect(dur.invalidReason).toBe("because");
});

//------
// #as()
//-------

test("Duration#as shifts to one unit and returns it", () => {
  const dur = Duration.fromMillis(5760000);
  expect(dur.as("hours")).toBe(1.6);
});

test("Duration#as returns null for invalid durations", () => {
  expect(Duration.invalid("because").as("hours")).toBeFalsy();
});

//------
// #valueOf()
//-------

test("Duration#valueOf value of zero duration", () => {
  const dur = Duration.fromObject({});
  expect(dur.valueOf()).toBe(0);
});

test("Duration#valueOf returns as millisecond value (lower order units)", () => {
  const dur = Duration.fromObject({ hours: 1, minutes: 36, seconds: 0 });
  expect(dur.valueOf()).toBe(5760000);
});

test("Duration#valueOf value of the duration with lower and higher order units", () => {
  const dur = Duration.fromObject({ days: 2, seconds: 1 });
  expect(dur.valueOf()).toBe(172801000);
});
