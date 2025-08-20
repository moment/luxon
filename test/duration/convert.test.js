/* global test expect */

import { Duration, DateTime } from "../../src/luxon";
import { getDeprecationWarnings } from "../helpers";
import { DURATION_AMBIGUOUS_CONVERSION } from "../../src/deprecations";

describe("Duration.as works correctly without reference date with unambiguous inputs", () => {
  test("minutes => seconds", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ minutes: 1 }).as("seconds")).toBe(60);
    });
    expect(warnings).toHaveLength(0);
  });
  test("minutes => milliseconds", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ minutes: 1 }).as("milliseconds")).toBe(60_000);
    });
    expect(warnings).toHaveLength(0);
  });
  test("hours => minutes", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ hours: 2 }).as("minutes")).toBe(120);
    });
    expect(warnings).toHaveLength(0);
  });
  test("seconds => hours", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ seconds: 7200 }).as("hours")).toBe(2);
    });
    expect(warnings).toHaveLength(0);
  });
  test("milliseconds => minutes", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ milliseconds: 120_000 }).as("minutes")).toBe(2);
    });
    expect(warnings).toHaveLength(0);
  });
  test("years => months", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ years: 3 }).as("months")).toBe(36);
    });
    expect(warnings).toHaveLength(0);
  });
  test("years => quarters", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ years: 3 }).as("quarters")).toBe(12);
    });
    expect(warnings).toHaveLength(0);
  });
  test("months => quarters", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ months: 6 }).as("quarters")).toBe(2);
    });
    expect(warnings).toHaveLength(0);
  });
  test("months & quarters => quarters", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ months: 6, quarters: 2 }).as("quarters")).toBe(4);
    });
    expect(warnings).toHaveLength(0);
  });
  test("years & months => quarters", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ years: 2, months: 3 }).as("quarters")).toBe(9);
    });
    expect(warnings).toHaveLength(0);
  });
});

describe("Duration.as works correctly with reference date with unambiguous inputs", () => {
  test("minutes => seconds", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(
        Duration.fromObject({ minutes: 1 }).as("seconds", { referenceDate: DateTime.utc(2025) })
      ).toBe(60);
    });
    expect(warnings).toHaveLength(0);
  });
  test("minutes => milliseconds", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(
        Duration.fromObject({ minutes: 1 }).as("milliseconds", {
          referenceDate: DateTime.utc(2025),
        })
      ).toBe(60_000);
    });
    expect(warnings).toHaveLength(0);
  });
  test("hours => minutes", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(
        Duration.fromObject({ hours: 2 }).as("minutes", { referenceDate: DateTime.utc(2025) })
      ).toBe(120);
    });
    expect(warnings).toHaveLength(0);
  });
  test("seconds => hours", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(
        Duration.fromObject({ seconds: 7200 }).as("hours", { referenceDate: DateTime.utc(2025) })
      ).toBe(2);
    });
    expect(warnings).toHaveLength(0);
  });
  test("milliseconds => minutes", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(
        Duration.fromObject({ milliseconds: 120_000 }).as("minutes", {
          referenceDate: DateTime.utc(2025),
        })
      ).toBe(2);
    });
    expect(warnings).toHaveLength(0);
  });
  test("years => months", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(
        Duration.fromObject({ years: 3 }).as("months", { referenceDate: DateTime.utc(2025) })
      ).toBe(36);
    });
    expect(warnings).toHaveLength(0);
  });
});

describe("Duration.as works correctly with reference date for all inputs", () => {
  test("minutes => seconds", () => {
    expect(
      Duration.fromObject({ minutes: 1 }).as("seconds", { referenceDate: DateTime.utc(2025) })
    ).toBe(60);
  });
  test("minutes => milliseconds", () => {
    expect(
      Duration.fromObject({ minutes: 1 }).as("milliseconds", { referenceDate: DateTime.utc(2025) })
    ).toBe(60_000);
  });
  test("hours => minutes", () => {
    expect(
      Duration.fromObject({ hours: 2 }).as("minutes", { referenceDate: DateTime.utc(2025) })
    ).toBe(120);
  });
  test("seconds => hours", () => {
    expect(
      Duration.fromObject({ seconds: 7200 }).as("hours", { referenceDate: DateTime.utc(2025) })
    ).toBe(2);
  });
  test("milliseconds => minutes", () => {
    expect(
      Duration.fromObject({ milliseconds: 120_000 }).as("minutes", {
        referenceDate: DateTime.utc(2025),
      })
    ).toBe(2);
  });
  test("milliseconds => minutes", () => {
    expect(
      Duration.fromObject({ milliseconds: 120_000 }).as("minutes", {
        referenceDate: DateTime.utc(2025),
      })
    ).toBe(2);
  });
});

describe("Duration.as logs a warning for ambiguous conversions without referenceDate", () => {
  test("days => hours", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ days: 3 }).as("hours")).toBe(72);
    });
    expect(warnings).toEqual([DURATION_AMBIGUOUS_CONVERSION]);
  });
  test("days => minutes", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ days: 2 }).as("minutes")).toBe(2880);
    });
    expect(warnings).toEqual([DURATION_AMBIGUOUS_CONVERSION]);
  });
  test("hours => days", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ hours: 48 }).as("days")).toBe(2);
    });
    expect(warnings).toEqual([DURATION_AMBIGUOUS_CONVERSION]);
  });
  test("minutes => days", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ minutes: 1440 }).as("days")).toBe(1);
    });
    expect(warnings).toEqual([DURATION_AMBIGUOUS_CONVERSION]);
  });
  test("months => days", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ months: 2 }).as("days")).toBe(60);
    });
    expect(warnings).toEqual([DURATION_AMBIGUOUS_CONVERSION]);
  });
  test("years => days", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(
        Duration.fromObject({ milliseconds: 120_000 }).as("minutes", {
          referenceDate: DateTime.utc(2025),
        })
      ).toBe(2);
    });
    expect(warnings).toHaveLength(0);
  });
});
