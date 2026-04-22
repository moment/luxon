import { describe, test, expect } from "vitest";
import { Duration } from "../../src/luxon";

//------
// #shiftTo()
//-------
test("Duration#shiftTo converts milliseconds to hours", () => {
  const dur = Duration.fromMillis(2 * 60 * 60 * 1000);
  expect(dur.shiftTo("hours").toObject()).toEqual({ hours: 2 });
});

test("Duration#shiftTo converts milliseconds to hours and minutes", () => {
  const mod = Duration.fromMillis(3 * 60 * 60 * 1000 + 36 * 60 * 1000).shiftTo("hours", "minutes");
  expect(mod.toObject()).toEqual({ hours: 3, minutes: 36 });
});

test("Duration#shiftTo boils hours down milliseconds", () => {
  const dur = Duration.fromObject({ hours: 1 }).shiftTo("milliseconds");
  expect(dur.toObject()).toEqual({ milliseconds: 3600000 });
});

test("Duration boils hours down shiftTo minutes and milliseconds", () => {
  const dur = Duration.fromObject({ hours: 1, seconds: 30 }).shiftTo("minutes", "milliseconds");
  expect(dur.toObject()).toEqual({ minutes: 60, milliseconds: 30000 });
});

test("Duration#shiftTo boils down and then rolls up", () => {
  const dur = Duration.fromObject({ hours: 2, seconds: 1400 }).shiftTo("minutes", "milliseconds");
  expect(dur.toObject()).toEqual({ minutes: 143, milliseconds: 20000 });
});

test("Duration#shiftTo throws on invalid units", () => {
  expect(() => {
    Duration.fromObject({ years: 2, hours: 5000 }).shiftTo("months", "glorp");
  }).toThrow();
});

describe("Duration#shiftTo supports the roundingMode option", () => {
  // rounding is tested in more detail elsewhere
  test("roundingMode = ceil", () => {
    const dur = Duration.fromObject({ minutes: 90 }).shiftTo("hours", { roundingMode: "ceil" });
    expect(dur.toObject()).toEqual({ hours: 2 });
  });
  test("roundingMode = floor", () => {
    const dur = Duration.fromObject({ minutes: 90 }).shiftTo("hours", { roundingMode: "floor" });
    expect(dur.toObject()).toEqual({ hours: 1 });
  });
  test("roundingMode = unnecessary", () => {
    const dur = Duration.fromObject({ minutes: 180 }).shiftTo("hours", {
      roundingMode: "unnecessary",
    });
    expect(dur.toObject()).toEqual({ hours: 2 });
  });
  test("roundingMode = unnecessary throws when rounding is needed", () => {
    expect(() =>
      Duration.fromObject({ minutes: 90 }).shiftTo("hours", { roundingMode: "unnecessary" })
    ).toThrow(RangeError);
  });
});

test("Duration#shiftTo defaults to rounding = unnecessary", () => {
  expect(() =>
    Duration.fromObject({ minutes: 90 }).shiftTo("hours", { roundingMode: "unnecessary" })
  ).toThrow(RangeError);
});

test("Duration#shiftTo without any units no-ops", () => {
  const dur = Duration.fromObject({ years: 3 }).shiftTo();
  expect(dur.toObject()).toEqual({ years: 3 });
});

test("Duration#shiftTo accumulates when rolling up", () => {
  expect(
    Duration.fromObject({ minutes: 59, seconds: 183 })
      .shiftTo("hours", "minutes", "seconds")
      .toObject()
  ).toEqual({ hours: 1, minutes: 2, seconds: 3 });
});

test("Duration#shiftTo keeps unnecessary higher-order negative units 0", () => {
  expect(
    Duration.fromObject({ milliseconds: -1000 }).shiftTo("hours", "minutes", "seconds").toObject()
  ).toEqual({ hours: 0, minutes: 0, seconds: -1 });
});

test("Duration#shiftTo normalizes values", () => {
  expect(
    Duration.fromObject({ years: 0, quarters: 0, months: 30 }).shiftTo("years", "months").toObject()
  ).toEqual({ years: 2, months: 6 });
});

test("Duration#shiftTo handles mixed units", () => {
  const dur = Duration.fromObject({ weeks: -1, days: 14 });
  expect(dur.shiftTo("years", "months", "weeks").toObject()).toEqual({
    years: 0,
    months: 0,
    weeks: 1,
  });
});

describe("Duration#shiftTo does not do ambiguous conversions", () => {
  test.each([
    [{ days: 2, hours: 50 }, ["days", "minutes"], { days: 2, hours: 50 }],
    [{ days: 2, minutes: 50 * 60 }, ["days", "hours"], { days: 2, hours: 50 }],
    [{ months: 3, days: 62 }, ["months", "days"], { months: 3, days: 62 }],
    [{ months: 3, days: 62 }, ["months", "weeks", "days"], { months: 3, weeks: 8, days: 6 }],
  ])("%o.shiftTo(%S) => %o", (from, units, to) => {
    expect(
      Duration.fromObject(from)
        .shiftTo(...units)
        .toObject()
    ).toEqual(to);
  });
});

//------
// #shiftToAll()
//-------
test("Duration#shiftToAll shifts to all available units", () => {
  const dur = Duration.fromMillis(5760000).shiftToAll();
  expect(dur.toObject()).toEqual({
    years: 0,
    months: 0,
    weeks: 0,
    days: 0,
    hours: 1,
    minutes: 36,
    seconds: 0,
    milliseconds: 0,
  });
});

test("Duration#shiftToAll does not do ambiguous conversions", () => {
  // minimal test here, the extensive tests are done for shiftTo()
  const duration = Duration.fromObject({ hours: 50 });
  expect(duration.shiftToAll().toObject()).toEqual({
    years: 0,
    months: 0,
    weeks: 0,
    days: 0,
    hours: 50,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });
});

//------
// #normalize()
//-------
test("Duration#normalize rebalances negative units", () => {
  const dur = Duration.fromObject({ years: 2, months: -2 }).normalize();
  expect(dur.toObject()).toEqual({ years: 1, months: 10 });
});

test("Duration#normalize de-overflows", () => {
  const dur = Duration.fromObject({ years: 2, months: 50 }).normalize();
  expect(dur.toObject()).toEqual({ years: 6, months: 2 });
});

test("Duration#normalize handles fully negative durations", () => {
  const dur = Duration.fromObject({ years: -2, days: -50 }).normalize();
  expect(dur.toObject()).toEqual({ years: -6, months: -2 });
});

test("Duration#normalize does not introduce new units", () => {
  const dur = Duration.fromObject({ hours: 50 }).normalize();
  expect(dur.toObject()).toEqual({ hours: 50 });
});

describe("Duration#normalize handles the full grid partially negative durations", () => {
  test.each([
    [
      { weeks: 1, days: 9 },
      { weeks: 2, days: 2 },
    ],
    [
      { weeks: 1, days: 6 },
      { weeks: 1, days: 6 },
    ],
    [
      { weeks: 1, days: -9 },
      { weeks: 0, days: -2 },
    ],
    [
      { weeks: 1, days: -5 },
      { weeks: 0, days: 2 },
    ],
    [
      { weeks: -1, days: 9 },
      { weeks: 0, days: 2 },
    ],
    [
      { weeks: -1, days: 5 },
      { weeks: 0, days: -2 },
    ],
    [
      { weeks: -1, days: -9 },
      { weeks: -2, days: -2 },
    ],
    [
      { weeks: -1, days: -5 },
      { weeks: -1, days: -5 },
    ],
    [
      { weeks: 0, days: 9 },
      { weeks: 1, days: 2 },
    ],
    [
      { weeks: 0, days: 5 },
      { weeks: 0, days: 5 },
    ],
    [
      { weeks: 0, days: -9 },
      { weeks: -1, days: -2 },
    ],
    [
      { weeks: 0, days: -5 },
      { weeks: 0, days: -5 },
    ],
    [
      { hours: 96, minutes: 0, seconds: -10 },
      { hours: 95, minutes: 59, seconds: 50 },
    ],
  ])("%o => %o", (from, to) => {
    expect(Duration.fromObject(from).normalize().toObject()).toEqual(to);
  });
});

describe("Duration#normalize can convert all time unit pairs", () => {
  const timeUnits = ["hours", "minutes", "seconds", "milliseconds"];
  const conversions = {
    hours: 60 * 60 * 1000,
    minutes: 60 * 1000,
    seconds: 1000,
    milliseconds: 1,
  };
  describe.for(timeUnits)("%s", (sourceUnit) => {
    test.for(timeUnits.filter((targetUnit) => conversions[targetUnit] > conversions[sourceUnit]))(
      "into %s",
      (targetUnit) => {
        const targetValue = 2;
        const sourceValue = (targetValue * conversions[targetUnit]) / conversions[sourceUnit];
        const duration = Duration.fromObject({ [sourceUnit]: sourceValue, [targetUnit]: 5 });
        expect(duration.normalize().toObject()).toEqual({
          [targetUnit]: targetValue + 5,
          [sourceUnit]: 0,
        });
      }
    );
  });
});

describe("Duration#normalize can convert all day unit pairs", () => {
  const dayUnits = ["days", "weeks"];
  const conversions = {
    weeks: 7,
    days: 1,
  };
  describe.for(dayUnits)("%s", (sourceUnit) => {
    test.for(dayUnits.filter((targetUnit) => conversions[targetUnit] > conversions[sourceUnit]))(
      "into %s",
      (targetUnit) => {
        const targetValue = 2;
        const sourceValue = (targetValue * conversions[targetUnit]) / conversions[sourceUnit];
        const duration = Duration.fromObject({ [sourceUnit]: sourceValue, [targetUnit]: 5 });
        expect(duration.normalize().toObject()).toEqual({
          [targetUnit]: targetValue + 5,
          [sourceUnit]: 0,
        });
      }
    );
  });
});

describe("Duration#normalize can convert all month unit pairs", () => {
  const monthUnits = ["months", "quarters", "years"];
  const conversions = {
    years: 12,
    quarters: 3,
    months: 1,
  };
  describe.for(monthUnits)("%s", (sourceUnit) => {
    test.for(monthUnits.filter((targetUnit) => conversions[targetUnit] > conversions[sourceUnit]))(
      "into %s",
      (targetUnit) => {
        const targetValue = 2;
        const sourceValue = (targetValue * conversions[targetUnit]) / conversions[sourceUnit];
        const duration = Duration.fromObject({ [sourceUnit]: sourceValue, [targetUnit]: 5 });
        expect(duration.normalize().toObject()).toEqual({
          [targetUnit]: targetValue + 5,
          [sourceUnit]: 0,
        });
      }
    );
  });
});

describe("Duration#normalize does not convert ambiguous units", () => {
  describe.each(["milliseconds", "seconds", "minutes", "hours"])("time unit %s", (timeUnit) => {
    test.each(["days", "weeks"])("into day-based unit %s", (dateUnit) => {
      const timeValue = 16 * 24 * 60 * 60 * 1000; // 16 days in millis is > 1 week
      const duration = Duration.fromObject({ [dateUnit]: 1, [timeUnit]: timeValue });
      const normalizedDuration = duration.normalize();
      expect(normalizedDuration.toObject()).toEqual({ [dateUnit]: 1, [timeUnit]: timeValue });
    });
    test.each(["months", "quarters", "years"])("into month-based unit %s", (dateUnit) => {
      const timeValue = 600 * 24 * 60 * 60 * 1000; // 600 days in millis is > 1 year
      const duration = Duration.fromObject({ [dateUnit]: 1, [timeUnit]: timeValue });
      const normalizedDuration = duration.normalize();
      expect(normalizedDuration.toObject()).toEqual({ [dateUnit]: 1, [timeUnit]: timeValue });
    });
  });

  describe.each(["days", "weeks"])("day-based unit %s", (dayBasedUnit) => {
    test.each(["milliseconds", "seconds", "minutes", "hours"])(
      "into time-based unit %s",
      (timeBasedUnit) => {
        const duration = Duration.fromObject({ [timeBasedUnit]: 1, [dayBasedUnit]: 2 });
        const normalizedDuration = duration.normalize();
        expect(normalizedDuration.toObject()).toEqual({ [timeBasedUnit]: 1, [dayBasedUnit]: 2 });
      }
    );
    test.each(["months", "quarters", "years"])("into month-based unit %s", (monthBasedUnit) => {
      const dayValue = 600; // 600 because 600 days is > 1 year
      const duration = Duration.fromObject({ [monthBasedUnit]: 1, [dayBasedUnit]: dayValue });
      const normalizedDuration = duration.normalize();
      expect(normalizedDuration.toObject()).toEqual({
        [monthBasedUnit]: 1,
        [dayBasedUnit]: dayValue,
      });
    });
  });

  describe.each(["months", "quarters", "years"])("month-based unit %s", (monthBasedUnit) => {
    test.each(["milliseconds", "seconds", "minutes", "hours"])(
      "into time-based unit %s",
      (timeBasedUnit) => {
        const duration = Duration.fromObject({ [timeBasedUnit]: 1, [monthBasedUnit]: 2 });
        const normalizedDuration = duration.normalize();
        expect(normalizedDuration.toObject()).toEqual({ [timeBasedUnit]: 1, [monthBasedUnit]: 2 });
      }
    );
    test.each(["days", "weeks"])("into day-based unit %s", (dayBasedUnit) => {
      const duration = Duration.fromObject({ [dayBasedUnit]: 1, [dayBasedUnit]: 3 });
      const normalizedDuration = duration.normalize();
      expect(normalizedDuration.toObject()).toEqual({ [dayBasedUnit]: 1, [dayBasedUnit]: 3 });
    });
  });
});

//------
// #rescale()
//-------
describe("Duration#rescale reduces to optimal set of units", () => {
  test.each([
    [{ milliseconds: 90000 }, { minutes: 1, seconds: 30 }],
    [
      { minutes: 70, milliseconds: 12100 },
      { hours: 1, minutes: 10, seconds: 12, milliseconds: 100 },
    ],
    [{ years: 2, months: -12 }, { years: 1 }],
  ])("%o => %o", (from, to) => {
    expect(Duration.fromObject(from).rescale().toObject()).toEqual(to);
  });
});

describe("Duration#rescale does not convert ambiguous units", () => {
  test.each([
    [
      { months: 2, days: -30 },
      { months: 2, days: -30 },
    ],
    [
      { days: 30, hours: 48 },
      { days: 30, hours: 48 },
    ],
  ])("%o => %o", (from, to) => {
    expect(Duration.fromObject(from).rescale().toObject()).toEqual(to);
  });
});

//------
// #as()
//-------

test("Duration#as shifts to one unit and returns it", () => {
  const dur = Duration.fromMillis(5760000);
  expect(dur.as("hours")).toBe(1.6);
});

//------
// #valueOf()
//-------

test("Duration#valueOf value of zero duration", () => {
  const dur = Duration.fromObject({});
  expect(dur.valueOf()).toBe(0);
});

test("Duration#valueOf returns as millisecond value (lower order units)", () => {
  const dur = Duration.fromObject({ hours: 1, minutes: 36, seconds: 0 });
  expect(dur.valueOf()).toBe(5760000);
});

test("Duration#valueOf value of the duration with lower and higher order units", () => {
  const dur = Duration.fromObject({ days: 2, seconds: 1 });
  expect(dur.valueOf()).toBe(172801000);
});

//------
// #removeZeroes()
//-------

test("Duration#removeZeros leaves empty object if everything was zero", () => {
  expect(Duration.fromObject({ years: 0, days: 0, hours: 0 }).removeZeros().toObject()).toEqual({});
});

test("Duration#removeZeros removes units with zero value", () => {
  expect(
    Duration.fromObject({
      years: 1,
      months: 0,
      weeks: 1,
      days: 0,
      hours: 4,
      minutes: 0,
      seconds: 6,
      milliseconds: 0,
    })
      .removeZeros()
      .toObject()
  ).toEqual({
    years: 1,
    weeks: 1,
    hours: 4,
    seconds: 6,
  });
});

test("Duration#removeZeros removes nothing if no value is zero", () => {
  const dur = {
    years: 1,
    months: 2,
    weeks: 1,
    days: 3,
    hours: 4,
    minutes: 5,
    seconds: 6,
    milliseconds: 7,
  };
  expect(Duration.fromObject(dur).removeZeros().toObject()).toEqual(dur);
});
