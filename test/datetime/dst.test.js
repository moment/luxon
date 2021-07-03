/* global test expect */

import { DateTime, Settings } from "../../src/luxon";

const local = (year, month, day, hour) =>
  DateTime.fromObject({ year, month, day, hour }, { zone: "America/New_York" });

test("Hole dates are bumped forward", () => {
  const d = local(2017, 3, 12, 2);
  expect(d.hour).toBe(3);
  expect(d.offset).toBe(-4 * 60);
});

// this is questionable behavior, but I wanted to document it
test("Ambiguous dates pick the one with the current offset", () => {
  const oldSettings = Settings.now;
  try {
    Settings.now = () => 1495653314595; // May 24, 2017
    let d = local(2017, 11, 5, 1);
    expect(d.hour).toBe(1);
    expect(d.offset).toBe(-4 * 60);

    Settings.now = () => 1484456400000; // Jan 15, 2017
    d = local(2017, 11, 5, 1);
    expect(d.hour).toBe(1);
    expect(d.offset).toBe(-5 * 60);
  } finally {
    Settings.now = oldSettings;
  }
});

test("Adding an hour to land on the Spring Forward springs forward", () => {
  const d = local(2017, 3, 12, 1).plus({ hour: 1 });
  expect(d.hour).toBe(3);
  expect(d.offset).toBe(-4 * 60);
});

test("Subtracting an hour to land on the Spring Forward springs forward", () => {
  const d = local(2017, 3, 12, 3).minus({ hour: 1 });
  expect(d.hour).toBe(1);
  expect(d.offset).toBe(-5 * 60);
});

test("Adding an hour to land on the Fall Back falls back", () => {
  const d = local(2017, 11, 5, 0).plus({ hour: 2 });
  expect(d.hour).toBe(1);
  expect(d.offset).toBe(-5 * 60);
});

test("Subtracting an hour to land on the Fall Back falls back", () => {
  let d = local(2017, 11, 5, 3).minus({ hour: 2 });
  expect(d.hour).toBe(1);
  expect(d.offset).toBe(-5 * 60);

  d = d.minus({ hour: 1 });
  expect(d.hour).toBe(1);
  expect(d.offset).toBe(-4 * 60);
});

test("Changing a calendar date to land on a hole bumps forward", () => {
  let d = local(2017, 3, 11, 2).plus({ day: 1 });
  expect(d.hour).toBe(3);
  expect(d.offset).toBe(-4 * 60);

  d = local(2017, 3, 13, 2).minus({ day: 1 });
  expect(d.hour).toBe(3);
  expect(d.offset).toBe(-4 * 60);
});

test("Changing a calendar date to land on an ambiguous time chooses the closest one", () => {
  let d = local(2017, 11, 4, 1).plus({ day: 1 });
  expect(d.hour).toBe(1);
  expect(d.offset).toBe(-4 * 60);

  d = local(2017, 11, 6, 1).minus({ day: 1 });
  expect(d.hour).toBe(1);
  expect(d.offset).toBe(-5 * 60);
});

test("Start of a 0:00->1:00 DST day is 1:00", () => {
  const d = DateTime.fromObject(
    {
      year: 2017,
      month: 10,
      day: 15
    },
    {
      zone: "America/Sao_Paulo"
    }
  ).startOf("day");
  expect(d.day).toBe(15);
  expect(d.hour).toBe(1);
  expect(d.minute).toBe(0);
  expect(d.second).toBe(0);
});

test("End of a 0:00->1:00 DST day is 23:59", () => {
  const d = DateTime.fromObject(
    {
      year: 2017,
      month: 10,
      day: 15
    },
    {
      zone: "America/Sao_Paulo"
    }
  ).endOf("day");
  expect(d.day).toBe(15);
  expect(d.hour).toBe(23);
  expect(d.minute).toBe(59);
  expect(d.second).toBe(59);
});
