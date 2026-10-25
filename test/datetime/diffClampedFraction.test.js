/* global test expect */
import { DateTime } from "../../src/luxon";

// The fractional part of a months/quarters diff must be measured against the next
// anchor reached from the *start* (start + (n+1) units), as the overshoot branch already
// does, not against cursor + 1 unit, which is shorter when the cursor was clamped to a month end.

test("DateTime#diff in months is monotonic across a clamped month end", () => {
  const start = DateTime.fromISO("2019-01-31T10:00", { zone: "utc" });
  const a = DateTime.fromISO("2019-02-28T23:00", { zone: "utc" }).diff(start, "months").months;
  const b = DateTime.fromISO("2019-03-01T00:00", { zone: "utc" }).diff(start, "months").months;
  expect(b).toBeGreaterThan(a);
  // 1 month + 13 h out of (2019-03-31T10:00 - 2019-02-28T10:00) = 31 days
  expect(a).toBeCloseTo(1 + 13 / (31 * 24), 12);
});

test("DateTime#diff in quarters measures the fraction against start + (n+1) quarters", () => {
  const start = DateTime.fromISO("2020-11-30T10:00", { zone: "utc" });
  const end = DateTime.fromISO("2021-03-31T10:00", { zone: "utc" });
  // start + 1Q = 2021-02-28T10:00, start + 2Q = 2021-05-30T10:00 (91 days later); 31 days elapsed
  expect(end.diff(start, "quarters").quarters).toBeCloseTo(1 + 31 / 91, 12);
  const later = DateTime.fromISO("2021-04-01T00:00", { zone: "utc" });
  expect(later.diff(start, "quarters").quarters).toBeGreaterThan(
    DateTime.fromISO("2021-03-31T23:00", { zone: "utc" }).diff(start, "quarters").quarters
  );
});
