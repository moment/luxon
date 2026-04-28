import { it, test, expect } from "vitest";

import { Duration } from "../../src/luxon";
import { InvalidArgumentError, InvalidUnitError, InvalidUnitValueError } from "../../src/errors";

//------
// .fromObject()
//-------
test("Duration.fromObject sets all the values", () => {
  const dur = Duration.fromObject({
    years: 1,
    months: 2,
    days: 3,
    hours: 4,
    minutes: 5,
    seconds: 6,
    milliseconds: 7,
    weeks: 9,
    quarters: 10,
  });
  expect(dur.years).toBe(1);
  expect(dur.months).toBe(2);
  expect(dur.days).toBe(3);
  expect(dur.hours).toBe(4);
  expect(dur.minutes).toBe(5);
  expect(dur.seconds).toBe(6);
  expect(dur.milliseconds).toBe(7);
  expect(dur.weeks).toBe(9);
  expect(dur.quarters).toBe(10);
});

test("Duration.fromObject accepts negative durations", () => {
  const dur = Duration.fromObject({
    days: -3,
    weeks: -9,
  });
  expect(dur.toObject()).toStrictEqual({
    days: -3,
    weeks: -9,
  });
});

test("Duration.fromObject accepts durations with negative and positive values", () => {
  const dur = Duration.fromObject({
    years: 1,
    days: -3,
    hours: 4,
    seconds: -6,
  });
  expect(dur.toObject()).toStrictEqual({
    years: 1,
    days: -3,
    hours: 4,
    seconds: -6,
  });
});

test("Duration.fromObject throws for fractional values", () => {
  expect(() =>
    Duration.fromObject({
      years: 1,
      months: 2,
      days: 3,
      hours: 4.5,
    })
  ).toThrow(new InvalidUnitValueError("hours", "integer", 4.5));
});

test("Duration.fromObject throws if the argument is not an object", () => {
  expect(() => Duration.fromObject()).toThrow(InvalidArgumentError);
  expect(() => Duration.fromObject(null)).toThrow(InvalidArgumentError);
  expect(() => Duration.fromObject("foo")).toThrow(InvalidArgumentError);
});

test("Duration.fromObject({}) constructs zero duration", () => {
  const dur = Duration.fromObject({});
  expect(dur.years).toBe(0);
  expect(dur.months).toBe(0);
  expect(dur.days).toBe(0);
  expect(dur.hours).toBe(0);
  expect(dur.minutes).toBe(0);
  expect(dur.seconds).toBe(0);
  expect(dur.milliseconds).toBe(0);
});

test("Duration.fromObject normalizes -0", () => {
  const dur = Duration.fromObject({ seconds: -0 });
  expect(dur.toObject()).toStrictEqual({ seconds: 0 });
});

test("Duration.fromObject throws if the initial object has invalid keys", () => {
  expect(() => Duration.fromObject({ foo: 0 })).toThrow(InvalidUnitError);
  expect(() => Duration.fromObject({ years: 1, foo: 0 })).toThrow(InvalidUnitError);
});

test("Duration.fromObject throws if the initial object has invalid values", () => {
  expect(() => Duration.fromObject({ years: {} })).toThrow(InvalidUnitValueError);
  expect(() => Duration.fromObject({ months: "some" })).toThrow(InvalidUnitValueError);
  expect(() => Duration.fromObject({ days: NaN })).toThrow(InvalidUnitValueError);
  expect(() => Duration.fromObject({ hours: true })).toThrow(InvalidUnitValueError);
  expect(() => Duration.fromObject({ minutes: false })).toThrow(InvalidUnitValueError);
  expect(() => Duration.fromObject({ seconds: "" })).toThrow(InvalidUnitValueError);
});

test("Duration.fromObject is valid if providing options only", () => {
  const dur = Duration.fromObject({}, { locale: "de" });
  expect(dur.years).toBe(0);
  expect(dur.months).toBe(0);
  expect(dur.days).toBe(0);
  expect(dur.hours).toBe(0);
  expect(dur.minutes).toBe(0);
  expect(dur.seconds).toBe(0);
  expect(dur.milliseconds).toBe(0);
  expect(dur.locale).toBe("de");
});

//------
// .fromDurationLike()
//-------

it("Duration.fromDurationLike returns a Duration from millis", () => {
  const dur = Duration.fromDurationLike(1000);
  expect(dur).toBeInstanceOf(Duration);
  expect(dur.toObject()).toStrictEqual({ milliseconds: 1000 });
});

it("Duration.fromDurationLike returns a Duration from object", () => {
  const dur = Duration.fromDurationLike({ hours: 1 });
  expect(dur).toBeInstanceOf(Duration);
  expect(dur.toObject()).toStrictEqual({ hours: 1 });
});

it("Duration.fromDurationLike returns passed Duration", () => {
  const durFromObject = Duration.fromObject({ hours: 1 });
  const dur = Duration.fromDurationLike(durFromObject);
  expect(dur).toBe(durFromObject);
});

test("Duration.fromDurationLike normalizes -0", () => {
  const dur = Duration.fromDurationLike(-0);
  expect(dur.toObject()).toStrictEqual({ milliseconds: 0 });
});

it("Duration.fromDurationLike throws for invalid inputs", () => {
  expect(() => Duration.fromDurationLike("foo")).toThrow(InvalidArgumentError);
  expect(() => Duration.fromDurationLike(null)).toThrow(InvalidArgumentError);
  expect(() => Duration.fromDurationLike(Infinity)).toThrow(InvalidUnitValueError);
  expect(() => Duration.fromDurationLike(NaN)).toThrow(InvalidUnitValueError);
});
