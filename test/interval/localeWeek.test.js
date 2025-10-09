import { describe, test, expect } from "vitest";

import { DateTime, Interval } from "../../src/luxon.ts";
import { isMissingLocaleWeekInfo } from "../specialCases";
import * as Helpers from "../helpers";

const withDefaultWeekSettings = Helpers.setUnset("defaultWeekSettings");

//------
// .count() with useLocaleWeeks
//------
describe("count(weeks) with useLocaleWeeks adheres to the locale", () => {
  test.skipIf(isMissingLocaleWeekInfo)("with native support", () => {
    const start = DateTime.fromISO("2023-06-04T13:00:00Z", { setZone: true, locale: "en-US" });
    const end = DateTime.fromISO("2023-06-23T13:00:00Z", { setZone: true, locale: "en-US" });
    const interval = Interval.fromDateTimes(start, end);

    expect(interval.count("weeks", { useLocaleWeeks: true })).toBe(3);
  });
  test("with custom week settings", () => {
    withDefaultWeekSettings(
      {
        firstDay: 7,
        minimalDays: 1,
        weekend: [6, 7],
      },
      () => {
        const start = DateTime.fromISO("2023-06-04T13:00:00Z", { setZone: true, locale: "en-US" });
        const end = DateTime.fromISO("2023-06-23T13:00:00Z", { setZone: true, locale: "en-US" });
        const interval = Interval.fromDateTimes(start, end);

        expect(interval.count("weeks", { useLocaleWeeks: true })).toBe(3);
      }
    );
  });
});

describe("count(weeks) with useLocaleWeeks uses the start locale", () => {
  test.skipIf(isMissingLocaleWeekInfo)("with native support", () => {
    const start = DateTime.fromISO("2023-06-04T13:00:00Z", { setZone: true, locale: "de-DE" });
    const end = DateTime.fromISO("2023-06-23T13:00:00Z", { setZone: true, locale: "en-US" });
    const interval = Interval.fromDateTimes(start, end);

    expect(interval.count("weeks", { useLocaleWeeks: true })).toBe(4);
  });
  test("with custom week settings", () => {
    withDefaultWeekSettings(
      {
        firstDay: 1,
        minimalDays: 4,
        weekend: [6, 7],
      },
      () => {
        const start = DateTime.fromISO("2023-06-04T13:00:00Z", { setZone: true, locale: "de-DE" });
        const end = DateTime.fromISO("2023-06-23T13:00:00Z", { setZone: true, locale: "en-US" });
        const interval = Interval.fromDateTimes(start, end);

        expect(interval.count("weeks", { useLocaleWeeks: true })).toBe(4);
      }
    );
  });
});
