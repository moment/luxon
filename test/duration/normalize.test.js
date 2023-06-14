/* global test expect */
import { Duration } from "../../src/luxon";

const dur1 = Duration.fromObject({
  years: 2,
  months: 5,
  days: 17,
  hours: 33,
  minutes: 12,
  seconds: 55,
  milliseconds: 700,
});

//------
// #normalize()
//-------
test("Duration#normalize with no options", () => {
  expect(Duration.fromObject({ years: 2, days: 5000 }).normalize().toObject()).toEqual({
    years: 15,
    days: 255,
  });
  expect(Duration.fromObject({ hours: 12, minutes: -45 }).normalize().toObject()).toEqual({
    hours: 11,
    minutes: 15,
  });
  expect(Duration.fromObject({ hours: 0, minutes: 60 }).normalize().toObject()).toEqual({
    hours: 1,
    minutes: 0,
  });
  expect(Duration.fromObject({ minutes: 60 }).normalize().toObject()).toEqual({ minutes: 60 });
  expect(
    Duration.fromObject({ hours: 0, minutes: 0, seconds: 60000 }).normalize().toObject(),
  ).toEqual({
    hours: 16,
    minutes: 40,
    seconds: 0,
  });
});

test("Duration#normalize with empty options", () => {
  expect(Duration.fromObject({ minutes: 60 }).normalize({}).toObject()).toEqual({ hours: 1 });
  expect(Duration.fromObject({ seconds: 60000 }).normalize({}).toObject()).toEqual({
    hours: 16,
    minutes: 40,
  });
});
test("Duration#normalize with precision", () => {
  expect(dur1.normalize({ precision: { seconds: 1 } }).toObject()).toEqual({
    years: 2,
    months: 5,
    days: 18,
    hours: 9,
    minutes: 12,
    seconds: 56,
  });
  expect(dur1.normalize({ precision: { seconds: 0.5 } }).toObject()).toEqual({
    years: 2,
    months: 5,
    days: 18,
    hours: 9,
    minutes: 12,
    seconds: 55.5, // opts.smallestUnit defaults to seconds
  });
  expect(dur1.normalize({ precision: { milliseconds: 500 } }).toObject()).toEqual({
    years: 2,
    months: 5,
    days: 18,
    hours: 9,
    minutes: 12,
    seconds: 55.5, // opts.smallestUnit defaults to seconds
  });
  expect(
    dur1.normalize({ precision: { milliseconds: 500 }, smallestUnit: "milliseconds" }).toObject(),
  ).toEqual({
    years: 2,
    months: 5,
    days: 18,
    hours: 9,
    minutes: 12,
    seconds: 55,
    milliseconds: 500,
  });
  expect(
    dur1.normalize({ precision: { milliseconds: 500 }, smallestUnit: "minutes" }).toObject(),
  ).toEqual({
    years: 2,
    months: 5,
    days: 18,
    hours: 9,
    minutes: 12.925,
  });
  expect(
    dur1.normalize({ precision: { minutes: 10 }, smallestUnit: "seconds" }).toObject(),
  ).toEqual({
    years: 2,
    months: 5,
    days: 18,
    hours: 9,
    minutes: 10,
    seconds: 0,
  });
  expect(dur1.normalize({ precision: { hours: 1 }, smallestUnit: "seconds" }).toObject()).toEqual({
    years: 2,
    months: 5,
    days: 18,
    hours: 9,
    minutes: 0,
    seconds: 0,
  });
});

test("Duration#normalize with smallestUnit", () => {
  // when a smallestUnit is given but no precision, use this as default
  expect(dur1.normalize({ smallestUnit: "minutes" }).toObject()).toEqual({
    years: 2,
    months: 5,
    days: 18,
    hours: 9,
    minutes: 13,
  });
});

test("Duration#normalize with biggestUnit", () => {
  // duration should not be altered
  expect(dur1.normalize({ biggestUnit: "days" }).toMillis()).toBe(dur1.toMillis());
  expect(dur1.normalize({ biggestUnit: "days" }).toObject()).toEqual({
    days: 898,
    hours: 9,
    minutes: 12,
    seconds: 55.7,
  });

  // precision is set to smallestUnit
  expect(dur1.normalize({ biggestUnit: "months", smallestUnit: "minutes" }).toMillis()).toBe(
    dur1
      .set({
        seconds: 60, // 55 sec will be rounded to next minute
        milliseconds: 0,
      })
      .toMillis(),
  );
  expect(dur1.normalize({ biggestUnit: "months", smallestUnit: "minutes" }).toObject()).toEqual({
    months: 5 + 12 * dur1.years,
    days: 28,
    hours: 9,
    minutes: 13, // 55 seconds are rounded to an additional minute
  });
});

test("Duration#normalize with maxUnits", () => {
  expect(dur1.normalize({ maxUnits: 2, precision: { months: 0.01 } }).toObject()).toEqual({
    years: 2,
    months: 5.61,
  });

  expect(dur1.normalize({ maxUnits: 3, biggestUnit: "days" }).toObject()).toEqual({
    days: 898,
    hours: 9,
    minutes: 13,
  });

  expect(dur1.normalize({ maxUnits: 3, biggestUnit: "months" }).toObject()).toEqual({
    months: 5 + 356 * dur1.years,
    days: 18,
    hours: 9,
  });
});
