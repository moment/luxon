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

  // Additional time unit conversions
  test("seconds => milliseconds", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ seconds: 5 }).as("milliseconds")).toBe(5_000);
    });
    expect(warnings).toHaveLength(0);
  });

  test("hours => seconds", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ hours: 1 }).as("seconds")).toBe(3_600);
    });
    expect(warnings).toHaveLength(0);
  });

  test("hours => milliseconds", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ hours: 1 }).as("milliseconds")).toBe(3_600_000);
    });
    expect(warnings).toHaveLength(0);
  });

  test("milliseconds => seconds", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ milliseconds: 5_000 }).as("seconds")).toBe(5);
    });
    expect(warnings).toHaveLength(0);
  });

  test("milliseconds => hours", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ milliseconds: 3_600_000 }).as("hours")).toBe(1);
    });
    expect(warnings).toHaveLength(0);
  });

  test("minutes => hours", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ minutes: 120 }).as("hours")).toBe(2);
    });
    expect(warnings).toHaveLength(0);
  });

  // Complex time combinations
  test("hours & minutes => seconds", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ hours: 1, minutes: 30 }).as("seconds")).toBe(5_400);
    });
    expect(warnings).toHaveLength(0);
  });

  test("hours & minutes & seconds => milliseconds", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ hours: 1, minutes: 1, seconds: 1 }).as("milliseconds")).toBe(
        3_661_000
      );
    });
    expect(warnings).toHaveLength(0);
  });

  test("mixed time units => minutes", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ hours: 2, seconds: 120 }).as("minutes")).toBe(122);
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

  // Weeks conversions
  test("weeks => days", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ weeks: 2 }).as("days")).toBe(14);
    });
    expect(warnings).toHaveLength(0);
  });

  test("days => weeks", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ days: 14 }).as("weeks")).toBe(2);
    });
    expect(warnings).toHaveLength(0);
  });

  test("weeks & days => days", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ weeks: 2, days: 3 }).as("days")).toBe(17);
    });
    expect(warnings).toHaveLength(0);
  });

  test("weeks & days => weeks", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ weeks: 1, days: 7 }).as("weeks")).toBe(2);
    });
    expect(warnings).toHaveLength(0);
  });

  // Month/quarter/year combinations
  test("quarters => months", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ quarters: 3 }).as("months")).toBe(9);
    });
    expect(warnings).toHaveLength(0);
  });

  test("quarters => years", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ quarters: 8 }).as("years")).toBe(2);
    });
    expect(warnings).toHaveLength(0);
  });

  test("months => years", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ months: 24 }).as("years")).toBe(2);
    });
    expect(warnings).toHaveLength(0);
  });

  test("years & quarters => months", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ years: 1, quarters: 2 }).as("months")).toBe(18);
    });
    expect(warnings).toHaveLength(0);
  });

  test("years & months & quarters => quarters", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ years: 1, months: 6, quarters: 2 }).as("quarters")).toBe(8);
    });
    expect(warnings).toHaveLength(0);
  });

  // Edge cases with zero values
  test("zero duration => any unit returns zero", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({}).as("minutes")).toBe(0);
      expect(Duration.fromObject({}).as("hours")).toBe(0);
      expect(Duration.fromObject({}).as("seconds")).toBe(0);
      expect(Duration.fromObject({}).as("months")).toBe(0);
      expect(Duration.fromObject({}).as("years")).toBe(0);
      expect(Duration.fromObject({}).as("days")).toBe(0);
      expect(Duration.fromObject({}).as("weeks")).toBe(0);
    });
    expect(warnings).toHaveLength(0);
  });

  test("explicit zero values", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ minutes: 0 }).as("seconds")).toBe(0);
      expect(Duration.fromObject({ hours: 0 }).as("minutes")).toBe(0);
      expect(Duration.fromObject({ years: 0 }).as("months")).toBe(0);
      expect(Duration.fromObject({ days: 0 }).as("hours")).toBe(0);
      expect(Duration.fromObject({ weeks: 0 }).as("days")).toBe(0);
    });
    expect(warnings).toHaveLength(0);
  });

  // Large values
  test("large seconds value => hours", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ seconds: 36_000 }).as("hours")).toBe(10);
    });
    expect(warnings).toHaveLength(0);
  });

  test("large milliseconds value => hours", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ milliseconds: 36_000_000 }).as("hours")).toBe(10);
    });
    expect(warnings).toHaveLength(0);
  });

  test("large years value => quarters", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ years: 10 }).as("quarters")).toBe(40);
    });
    expect(warnings).toHaveLength(0);
  });

  test("large days value => weeks", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ days: 70 }).as("weeks")).toBe(10);
    });
    expect(warnings).toHaveLength(0);
  });

  test("large weeks value => days", () => {
    const warnings = getDeprecationWarnings(() => {
      expect(Duration.fromObject({ weeks: 52 }).as("days")).toBe(364);
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
