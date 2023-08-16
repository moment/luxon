/* global test expect */

import { Duration, DateTime, Settings } from "../../src/luxon";

test("Explicitly invalid durations are invalid", () => {
  const dur = Duration.invalid("just because", "seriously, just because");
  expect(dur.isValid).toBe(false);
  expect(dur.invalidReason).toBe("just because");
  expect(dur.invalidExplanation).toBe("seriously, just because");
});

test("throwOnInvalid throws", () => {
  try {
    Settings.throwOnInvalid = true;
    expect(() => Duration.invalid("because")).toThrow();
  } finally {
    Settings.throwOnInvalid = false;
  }
});

test("Duration.invalid throws if you don't provide a reason", () => {
  expect(() => Duration.invalid()).toThrow();
});

test("Diffing invalid DateTimes creates invalid Durations", () => {
  const invalidDT = DateTime.invalid("so?");
  expect(invalidDT.diff(DateTime.now()).isValid).toBe(false);
  expect(DateTime.now().diff(invalidDT).isValid).toBe(false);
});

test("Duration.invalid produces invalid Intervals", () => {
  expect(Duration.invalid("because").isValid).toBe(false);
});

test("Duration.toMillis produces NaN on invalid Durations", () => {
  expect(Duration.invalid("because").toMillis()).toBe(NaN);
});

test("Duration.as produces NaN on invalid Durations", () => {
  expect(Duration.invalid("because").as("seconds")).toBe(NaN);
});

test("Duration.toHuman produces null on invalid Durations", () => {
  expect(Duration.invalid("because").toHuman()).toBe("Invalid Duration");
});

test("Duration.toISO produces null on invalid Durations", () => {
  expect(Duration.invalid("because").toISO()).toBeNull();
});

test("Duration.toFormat produces Invalid Duration on invalid Durations", () => {
  expect(Duration.invalid("because").toFormat("s")).toBe("Invalid Duration");
});
