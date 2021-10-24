/* global test expect */

import {
  hasInvalidGregorianData,
  hasInvalidOrdinalData,
  hasInvalidTimeData,
  hasInvalidWeekData,
} from "../../src/impl/conversions";
import Invalid from "../../src/impl/invalid";
import {
  GregorianDateTime,
  OrdinalDateTime,
  TimeObject,
  WeekDateTime,
} from "../../src/types/datetime";

test("conversions.hasInvalidWeekData returns Invalid for invalid weekYear", () => {
  const invalidWeekData: WeekDateTime = {
    weekYear: 3.14,
    weekNumber: 4,
    weekday: 2,
    hour: 23,
    minute: 5,
    second: 6,
    millisecond: 0,
  };
  if (!hasInvalidWeekData(invalidWeekData))
    fail("conversions.hasInvalidWeekData returned false for invalid weekYear");
  expect(hasInvalidWeekData(invalidWeekData)).toBeInstanceOf(Invalid);
});

test("conversions.hasInvalidOrdinalData returns Invalid for invalid year", () => {
  const invalidOrdinalData: OrdinalDateTime = {
    year: 3.14,
    ordinal: 4,
    hour: 23,
    minute: 5,
    second: 6,
    millisecond: 0,
  };
  if (!hasInvalidOrdinalData(invalidOrdinalData))
    fail("conversions.hasInvalidOrdinalData returned false for invalid year");
  expect(hasInvalidOrdinalData(invalidOrdinalData)).toBeInstanceOf(Invalid);
});

test("conversions.hasInvalidGregorianData returns Invalid for invalid year", () => {
  const invalidGregorianData: GregorianDateTime = {
    year: 3.14,
    month: 4,
    day: 12,
    hour: 23,
    minute: 5,
    second: 6,
    millisecond: 0,
  };
  if (!hasInvalidGregorianData(invalidGregorianData))
    fail("conversions.hasInvalidGregorianData returned false for invalid year");
  expect(hasInvalidGregorianData(invalidGregorianData)).toBeInstanceOf(Invalid);
});

test("conversions.hasInvalidTimeData returns Invalid for invalid second", () => {
  const invalidTimeData: TimeObject = {
    hour: 23,
    minute: 5,
    second: 6.23,
    millisecond: 0,
  };
  if (!hasInvalidTimeData(invalidTimeData))
    fail("conversions.hasInvalidTimeData returned false for invalid second");
  expect(hasInvalidTimeData(invalidTimeData)).toBeInstanceOf(Invalid);
});
