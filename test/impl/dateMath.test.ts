import { describe, expect, test } from "vitest";
import { daysInMonth } from "../../src/impl/util.ts";

describe("daysInMonth", () => {
  test("calculates the correct number of days for february in a non-leap year", () => {
    expect(daysInMonth(2021, 2)).toBe(28);
    expect(daysInMonth(1999, 2)).toBe(28);
    expect(daysInMonth(2100, 2)).toBe(28);
  });
  test("calculates the correct number of days for february in a leap year", () => {
    expect(daysInMonth(2000, 2)).toBe(29);
    expect(daysInMonth(2004, 2)).toBe(29);
  });
  test("calculates the correct number of days for february in a non-leap year with overflow", () => {
    expect(daysInMonth(2020, 14)).toBe(28);
    expect(daysInMonth(1998, 14)).toBe(28);
    expect(daysInMonth(2098, 26)).toBe(28);
  });
  test("calculates the correct number of days for february in a leap year with overflow", () => {
    expect(daysInMonth(1999, 14)).toBe(29);
    expect(daysInMonth(2002, 26)).toBe(29);
  });

  describe.for([
    [1, 31],
    [3, 31],
    [4, 30],
    [5, 31],
    [6, 30],
    [7, 31],
    [8, 31],
    [9, 30],
    [10, 31],
    [11, 30],
    [12, 31],
    // overflow
  ])("calculates the correct number of days for Month $0 in all years", ([month, days]) => {
    test("without overflow", () => {
      expect(daysInMonth(2021, month)).toBe(days);
      expect(daysInMonth(1999, month)).toBe(days);
      expect(daysInMonth(2100, month)).toBe(days);
      expect(daysInMonth(2000, month)).toBe(days);
      expect(daysInMonth(2004, month)).toBe(days);
    });
    test("with overflow", () => {
      expect(daysInMonth(2021, month + 12)).toBe(days);
      expect(daysInMonth(1999, month + 24)).toBe(days);
    });
  });
});
