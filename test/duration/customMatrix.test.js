/* global test expect */

import { Duration } from "../../src/luxon";
import { casualMatrix } from "../../src/duration";

const businessMatrix = {
  ...casualMatrix,
  months: {
    weeks: 4,
    days: 22,
    hours: 22 * 7,
    minutes: 22 * 7 * 60,
    seconds: 22 * 7 * 60 * 60,
    milliseconds: 22 * 7 * 60 * 60 * 1000,
  },
  weeks: {
    days: 5,
    hours: 5 * 7,
    minutes: 5 * 7 * 60,
    seconds: 5 * 7 * 60 * 60,
    milliseconds: 5 * 7 * 60 * 60 * 1000,
  },
  days: {
    hours: 7,
    minutes: 7 * 60,
    seconds: 7 * 60 * 60,
    milliseconds: 7 * 60 * 60 * 1000,
  },
};

const convert = (amt, from, to) =>
  Duration.fromObject({ [from]: amt }, { matrix: businessMatrix }).as(to);

test("One day is made of 7 hours", () => {
  expect(convert(1, "days", "hours")).toBeCloseTo(7, 4);
  expect(convert(7, "hours", "days")).toBeCloseTo(1, 4);
});

test("One and a half week is made of 7 days 3 hours and 30 minutes", () => {
  const dur = Duration.fromObject({ weeks: 1.5 }, { matrix: businessMatrix }).shiftTo(
    "days",
    "hours",
    "minutes"
  );

  expect(dur.days).toBeCloseTo(7, 4);
  expect(dur.hours).toBeCloseTo(3, 4);
  expect(dur.minutes).toBeCloseTo(30, 4);
});
