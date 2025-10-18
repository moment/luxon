import { describe, expect, test } from "vitest";
import { computeOrdinal, daysInMonth, uncomputeOrdinal } from "../../src/impl/dateMath.ts";

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

describe("computeOrdinal", () => {
  test.for(Array.from({ length: 365 }, (_, i) => i + 1))(
    "ordinal $0 in a non-leap year",
    (ordinal) => {
      const d = new Date(Date.UTC(2025, 0, ordinal));
      expect(computeOrdinal(2025, d.getUTCMonth() + 1, d.getUTCDate())).toBe(ordinal);
    }
  );
  test.for(Array.from({ length: 366 }, (_, i) => i + 1))("ordinal $0 in a leap year", (ordinal) => {
    const d = new Date(Date.UTC(2020, 0, ordinal));
    expect(computeOrdinal(2020, d.getUTCMonth() + 1, d.getUTCDate())).toBe(ordinal);
  });
});

describe("uncomputeOrdinal", () => {
  test.for(Array.from({ length: 365 }, (_, i) => i + 1))(
    "ordinal $0 in a non-leap year",
    (ordinal) => {
      const d = new Date(Date.UTC(2025, 0, ordinal));
      expect(uncomputeOrdinal(2025, ordinal)).toEqual({
        day: d.getUTCDate(),
        month: d.getUTCMonth() + 1,
      });
    }
  );
  test.for(Array.from({ length: 366 }, (_, i) => i + 1))("ordinal $0 in a leap year", (ordinal) => {
    const d = new Date(Date.UTC(2020, 0, ordinal));
    expect(uncomputeOrdinal(2020, ordinal)).toEqual({
      day: d.getUTCDate(),
      month: d.getUTCMonth() + 1,
    });
  });
});
