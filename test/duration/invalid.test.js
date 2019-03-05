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
  expect(invalidDT.diff(DateTime.local()).isValid).toBe(false);
  expect(DateTime.local().diff(invalidDT).isValid).toBe(false);
});

test("Duration.invalid produces invalid Intervals", () => {
  expect(Duration.invalid("because").isValid).toBe(false);
});
