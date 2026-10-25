/* global test expect */
import { DateTime, Interval } from "../../src/luxon";

// Zones where DST starts at local midnight: on that day 00:00-00:59 does not exist,
// so startOf("day") is 01:00. Interval#count must still count calendar dates.
const days = [
  ["Africa/Cairo", "2025-04-25T09:00", "2025-04-28T09:00"],
  ["America/Santiago", "2025-09-07T10:00", "2025-09-10T10:00"],
  ["America/Havana", "2025-03-09T10:00", "2025-03-12T10:00"],
  ["Asia/Beirut", "2025-03-30T10:00", "2025-04-02T10:00"],
  ["Atlantic/Azores", "2025-03-30T10:00", "2025-04-02T10:00"],
];

for (const [zone, s, e] of days) {
  test(`Interval#count('days') counts the DST-start day when its midnight is skipped (${zone})`, () => {
    const i = Interval.fromDateTimes(DateTime.fromISO(s, { zone }), DateTime.fromISO(e, { zone }));
    // the interval touches 4 calendar dates: start day, +1, +2 and the end day
    expect(i.count("days")).toBe(4);
  });
}

test("Interval#count('weeks') counts the week whose Monday midnight is skipped (Asia/Tehran 2016)", () => {
  const zone = "Asia/Tehran";
  const i = Interval.fromDateTimes(
    DateTime.fromISO("2016-03-21T10:00", { zone }),
    DateTime.fromISO("2016-04-04T10:00", { zone })
  );
  // weeks of 2016-03-21, 2016-03-28 and 2016-04-04
  expect(i.count("weeks")).toBe(3);
});

test("Interval#count('days') still excludes an end that is exactly the start of a skipped-midnight day", () => {
  const zone = "America/Santiago";
  const i = Interval.fromDateTimes(
    DateTime.fromISO("2025-09-05T10:00", { zone }),
    DateTime.fromISO("2025-09-07T00:00", { zone }) // normalised to 01:00, the first instant of 09-07
  );
  expect(i.count("days")).toBe(2);
});
