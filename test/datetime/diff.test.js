/* global test expect */

import { DateTime } from "../../src/luxon";

const Helpers = require("../helpers");

//------
// diff
//-------
const diffFromObjs = (o1, o2, units) =>
  DateTime.fromObject(o1).diff(DateTime.fromObject(o2), units);
const diffObjs = (o1, o2, units) => diffFromObjs(o1, o2, units).toObject();

test("DateTime#diff defaults to milliseconds", () => {
  expect(diffObjs({ year: 2017, millisecond: 12 }, { year: 2017 })).toEqual({
    milliseconds: 12
  });
  expect(diffFromObjs({ year: 2017 }, { year: 2017 }).milliseconds).toBe(0);
});

test("DateTime#diff makes simple diffs", () => {
  expect(diffObjs({ year: 2017 }, { year: 2017 }, "years")).toEqual({ years: 0 });

  expect(diffObjs({ year: 2017 }, { year: 2016 }, "years")).toEqual({
    years: 1
  });

  expect(
    diffObjs({ year: 2016, month: 6, day: 28 }, { year: 2016, month: 5, day: 28 }, "months")
  ).toEqual({ months: 1 });

  expect(
    diffObjs({ year: 2016, month: 6, day: 28 }, { year: 2016, month: 6, day: 25 }, "days")
  ).toEqual({ days: 3 });

  expect(
    diffObjs({ year: 2016, month: 6, day: 1 }, { year: 2016, month: 5, day: 28 }, "days")
  ).toEqual({ days: 4 });

  expect(
    diffObjs({ year: 2016, month: 6, day: 29 }, { year: 2016, month: 6, day: 1 }, "weeks")
  ).toEqual({ weeks: 4 });

  expect(
    diffObjs({ year: 2016, month: 3, day: 3 }, { year: 2016, month: 2, day: 18 }, "weeks")
  ).toEqual({ weeks: 2 });

  expect(
    diffObjs(
      { year: 2016, month: 6, day: 28, hour: 13 },
      { year: 2016, month: 6, day: 28, hour: 5 },
      "hours"
    )
  ).toEqual({ hours: 8 });

  expect(
    diffObjs(
      { year: 2016, month: 6, day: 28, hour: 13 },
      { year: 2016, month: 6, day: 28, hour: 5 },
      "days"
    )
  ).toEqual({ days: 1 / 3 });

  expect(
    diffObjs(
      { year: 2016, month: 6, day: 28, hour: 13 },
      { year: 2016, month: 6, day: 25, hour: 5 },
      "hours"
    )
  ).toEqual({ hours: 24 * 3 + 8 });
});

test("DateTime#diff accepts multiple units", () => {
  expect(
    diffObjs(
      { year: 2016, month: 3, day: 28, hour: 13, minute: 46 },
      { year: 2016, month: 3, day: 16, hour: 5, second: 18 },
      ["days", "hours", "minutes", "seconds"]
    )
  ).toEqual({ days: 12, hours: 8, minutes: 45, seconds: 42 });

  expect(
    diffObjs({ year: 2016, month: 3, day: 25 }, { year: 2016, month: 3, day: 1 }, ["weeks", "days"])
  ).toEqual({ weeks: 3, days: 3 });

  expect(
    diffObjs({ year: 2016, month: 3, day: 28 }, { year: 2010, month: 3, day: 16 }, [
      "years",
      "days"
    ])
  ).toEqual({ years: 6, days: 12 });

  expect(
    diffObjs({ year: 2016, month: 3, day: 14 }, { year: 2010, month: 3, day: 16 }, [
      "years",
      "days"
    ])
  ).toEqual({ years: 5, days: 364 });

  expect(
    diffObjs({ year: 2015, month: 3, day: 14 }, { year: 2009, month: 3, day: 16 }, [
      "years",
      "days"
    ])
  ).toEqual({ years: 5, days: 363 });
});

test("DateTime#diff handles unmatched units", () => {
  expect(
    diffObjs(
      { year: 2017, month: 6, day: 7, hour: 21 },
      { year: 2017, month: 6, day: 1, hour: 22 },
      ["weeks", "days", "hours"]
    )
  ).toEqual({ weeks: 0, days: 5, hours: 23 });

  expect(
    diffObjs(
      { year: 2017, month: 6, day: 27, hour: 21 },
      { year: 2017, month: 6, day: 26, hour: 22 },
      ["days", "hours"]
    )
  ).toEqual({ days: 0, hours: 23 });

  expect(
    diffObjs(
      { year: 2017, month: 6, day: 7, hour: 21 },
      { year: 2017, month: 6, day: 1, hour: 22 },
      ["weeks", "hours"]
    )
  ).toEqual({ weeks: 0, hours: 23 + 5 * 24 });
});

test("DateTime#diff sets all its units to 0 if the duration is empty", () => {
  const t = DateTime.fromObject({ year: 2018, month: 11, day: 5, hour: 0 });
  expect(t.diff(t).toObject()).toEqual({ milliseconds: 0 });
  expect(t.diff(t, "hours").toObject()).toEqual({ hours: 0 });
  expect(t.diff(t, "days").toObject()).toEqual({ days: 0 });
});

test("DateTime#diff puts fractional parts in the lowest order unit", () => {
  expect(
    diffObjs({ year: 2017, month: 7, day: 14 }, { year: 2016, month: 6, day: 16 }, [
      "years",
      "months"
    ])
  ).toEqual({ years: 1, months: 1 - 2 / 30 });
});

test("DateTime#diff returns the fractional parts even when it can't find a whole unit", () => {
  expect(
    diffObjs(
      { year: 2017, month: 7, day: 14, hour: 6 },
      { year: 2017, month: 7, day: 14, hour: 2 },
      ["days"]
    )
  ).toEqual({ days: 1 / 6 });
});

test("DateTime#diff is calendary for years, months, day", () => {
  // respecting the leap year
  expect(
    diffObjs({ year: 2016, month: 6, day: 14 }, { year: 2010, month: 6, day: 14 }, [
      "years",
      "days"
    ])
  ).toEqual({ years: 6, days: 0 });

  expect(
    diffObjs({ year: 2016, month: 3, day: 14 }, { year: 2010, month: 3, day: 16 }, [
      "years",
      "days"
    ])
  ).toEqual({ years: 5, days: 364 });

  // ignores the DST, works in calendar days, not bubbled months
  expect(
    diffObjs({ year: 2016, month: 5, day: 14 }, { year: 2016, month: 2, day: 14 }, "days")
  ).toEqual({ days: 90 });
});

test("DateTime#diff handles fractional years as fractions of those specific years", () => {
  // the point here is that we're crossing the leap year
  expect(
    diffObjs({ year: 2020, month: 3, day: 27 }, { year: 2018, month: 3, day: 28 }, "years")
  ).toEqual({ years: 1 + 365.0 / 366 });
});

test("DateTime#diff handles fractional months as fractions of those specific months", () => {
  // The point here is that January has 31 days
  expect(
    diffObjs({ year: 2018, month: 2, day: 24 }, { year: 2017, month: 12, day: 25 }, "months")
  ).toEqual({ months: 1 + 30.0 / 31 });
});

test("DateTime#diff handles fractional weeks as fractions of those specific weeks", () => {
  // America/New_York has a fall back Nov 4, 2018 at 2:00
  expect(
    diffObjs(
      { year: 2018, month: 11, day: 16, hour: 0 },
      { year: 2018, month: 11, day: 2, hour: 1 },
      "weeks"
    )
  ).toEqual({ weeks: 1 + 6.0 / 7 + 23.0 / 24 / 7 });
});

test("DateTime#diff handles fractional days as fractions of those specific days", () => {
  // America/New_York has a fall back Nov 4, 2018 at 2:00
  expect(
    diffObjs(
      { year: 2018, month: 11, day: 5, hour: 0 },
      { year: 2018, month: 11, day: 3, hour: 1 },
      "days"
    )
  ).toEqual({ days: 1 + 24 / 25 });
});

test("DateTime#diff is precise for lower order units", () => {
  // spring forward skips one hour
  expect(
    diffObjs({ year: 2016, month: 5, day: 5 }, { year: 2016, month: 1, day: 1 }, "hours")
  ).toEqual({ hours: 2999 });
});

test("DateTime#diff passes through options", () => {
  const dt1 = DateTime.fromObject({ year: 2016, month: 5, day: 5 }),
    dt2 = DateTime.fromObject({ year: 2016, month: 1, day: 1 }),
    dur1 = dt1.diff(dt2, "hours", { conversionAccuracy: "longterm" }),
    dur2 = dt1.diff(dt2, "days", { conversionAccuracy: "longterm" });
  expect(dur1.conversionAccuracy).toBe("longterm");
  expect(dur2.conversionAccuracy).toBe("longterm");
});

test("DateTime#diff returns invalid Durations if the DateTimes are invalid", () => {
  const i = DateTime.invalid("because");
  expect(i.diff(DateTime.local()).isValid).toBe(false);
  expect(DateTime.local().diff(i).isValid).toBe(false);
});

test("DateTime#diff results in a duration with the same locale", () => {
  const dt1 = DateTime.fromObject({
      year: 2016,
      month: 5,
      day: 5,
      locale: "fr",
      numberingSystem: "mong"
    }),
    dt2 = DateTime.fromObject({
      year: 2016,
      month: 1,
      day: 1,
      locale: "es",
      numberingSystem: "beng"
    }),
    dur = dt1.diff(dt2);

  expect(dur.locale).toBe("fr");
  expect(dur.numberingSystem).toBe("mong");
});

// see https://github.com/moment/luxon/issues/487
test("DateTime#diff results works when needing to backtrack months", () => {
  const left = DateTime.fromJSDate(new Date(1554036127038));
  const right = DateTime.fromJSDate(new Date(1554122527128));

  const diff = right.diff(left, ["months", "days", "hours"]);
  expect(diff.months).toBe(0);
  expect(diff.days).toBe(1);
});

//------
// diffNow
//-------

Helpers.withNow("DateTime#diffNow defaults to milliseconds", DateTime.local(2017, 5, 15), () => {
  const dt = DateTime.local(2014, 8, 6),
    dur = dt.diffNow();
  expect(dur.milliseconds).toBe(-87523200000);
});

Helpers.withNow("DateTime#diffNow accepts units", DateTime.local(2017, 5, 15), () => {
  const dt = DateTime.local(2014, 8, 6),
    dur = dt.diffNow("days");
  expect(dur.days).toBe(-1013);
});

Helpers.withNow("DateTime#diffNow passes through options", DateTime.local(2017, 5, 15), () => {
  const dt = DateTime.local(2014, 8, 6),
    dur = dt.diffNow("days", { conversionAccuracy: "longterm" });
  expect(dur.conversionAccuracy).toBe("longterm");
});

test("DateTime#diffNow returns invalid Durations if the DateTime is invalid", () => {
  const i = DateTime.invalid("because");
  expect(i.diffNow().isValid).toBe(false);
});
