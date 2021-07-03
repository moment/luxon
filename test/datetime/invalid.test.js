/* global test expect */

import { DateTime, Settings } from "../../src/luxon";

const organic1 = DateTime.utc(2014, 13, 33),
  // not an actual Wednesday
  organic2 = DateTime.fromObject({ weekday: 3, year: 1982, month: 5, day: 25 }, { zone: "UTC" }),
  organic3 = DateTime.fromObject({ year: 1982, month: 5, day: 25, hour: 27 });

test("Explicitly invalid dates are invalid", () => {
  const dt = DateTime.invalid("just because", "seriously, just because");
  expect(dt.isValid).toBe(false);
  expect(dt.invalidReason).toBe("just because");
  expect(dt.invalidExplanation).toBe("seriously, just because");
});

test("Invalid creations are invalid", () => {
  expect(organic1.isValid).toBe(false);
  expect(organic2.isValid).toBe(false);
  expect(organic3.isValid).toBe(false);
});

test("invalid zones result in invalid dates", () => {
  expect(DateTime.now().setZone("America/Lasers").isValid).toBe(false);
  expect(DateTime.local({ zone: "America/Lasers" }).isValid).toBe(false);
  expect(DateTime.fromJSDate(new Date(), { zone: "America/Lasers" }).isValid).toBe(false);
});

test("Invalid DateTimes tell you why", () => {
  expect(organic1.invalidReason).toBe("unit out of range");
  expect(organic2.invalidReason).toBe("mismatched weekday");
  expect(organic3.invalidReason).toBe("unit out of range");
});

test("Invalid DateTimes can provide an extented explanation", () => {
  expect(organic1.invalidExplanation).toBe(
    "you specified 13 (of type number) as a month, which is invalid"
  );
  expect(organic2.invalidExplanation).toBe(
    "you can't specify both a weekday of 3 and a date of 1982-05-25T00:00:00.000Z"
  );
  expect(organic3.invalidExplanation).toBe(
    "you specified 27 (of type number) as a hour, which is invalid"
  );
});

test("Invalid DateTimes return invalid Dates", () => {
  expect(organic1.toJSDate().valueOf()).toBe(NaN);
});

test("Diffing invalid DateTimes creates invalid Durations", () => {
  expect(organic1.diff(DateTime.now()).isValid).toBe(false);
  expect(DateTime.now().diff(organic1).isValid).toBe(false);
});

test("throwOnInvalid throws", () => {
  try {
    Settings.throwOnInvalid = true;
    expect(() =>
      DateTime.fromObject({
        weekday: 3,
        year: 1982,
        month: 5,
        day: 25
      })
    ).toThrow();
  } finally {
    Settings.throwOnInvalid = false;
  }
});

test("DateTime.invalid throws if you don't provide a reason", () => {
  expect(() => DateTime.invalid()).toThrow();
});
