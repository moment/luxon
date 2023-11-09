/* global test expect */

import { DateTime, Interval } from "../../src/luxon";

//------
// .count() with useLocaleWeeks
//------
test("count(weeks) with useLocaleWeeks adheres to the locale", () => {
  const start = DateTime.fromISO("2023-06-04T13:00:00Z", { setZone: true, locale: "en-US" });
  const end = DateTime.fromISO("2023-06-23T13:00:00Z", { setZone: true, locale: "en-US" });
  const interval = Interval.fromDateTimes(start, end);

  expect(interval.count("weeks", { useLocaleWeeks: true })).toBe(3);
});

test("count(weeks) with useLocaleWeeks uses the start locale", () => {
  const start = DateTime.fromISO("2023-06-04T13:00:00Z", { setZone: true, locale: "de-DE" });
  const end = DateTime.fromISO("2023-06-23T13:00:00Z", { setZone: true, locale: "en-US" });
  const interval = Interval.fromDateTimes(start, end);

  expect(interval.count("weeks", { useLocaleWeeks: true })).toBe(4);
});
