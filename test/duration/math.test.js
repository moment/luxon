import { test, expect } from "vitest";

import { Duration } from "../../src/luxon";

//------
// #plus()
//------
test("Duration#plus add straightforward durations", () => {
  const first = Duration.fromObject({ hours: 4, minutes: 12, seconds: 2 }),
    second = Duration.fromObject({ hours: 1, seconds: 6, milliseconds: 14 }),
    result = first.plus(second);

  expect(result.hours).toBe(5);
  expect(result.minutes).toBe(12);
  expect(result.seconds).toBe(8);
  expect(result.milliseconds).toBe(14);
});

test("Duration#plus defaults empty durations to 0", () => {
  const first = Duration.fromObject({ hours: 4, minutes: 12, seconds: 2 }),
    second = Duration.fromObject({}),
    result = first.plus(second);

  expect(result.hours).toBe(4);
  expect(result.minutes).toBe(12);
  expect(result.seconds).toBe(2);
});

test("Duration#plus adds negatives", () => {
  const first = Duration.fromObject({ hours: 4, minutes: -12, seconds: -2 }),
    second = Duration.fromObject({ hours: -5, seconds: 6, milliseconds: 14 }),
    result = first.plus(second);

  expect(result.hours).toBe(-1);
  expect(result.minutes).toBe(-12);
  expect(result.seconds).toBe(4);
  expect(result.milliseconds).toBe(14);
});

test("Duration#plus adds single values", () => {
  const first = Duration.fromObject({ hours: 4, minutes: 12, seconds: 2 }),
    result = first.plus({ minutes: 5 });

  expect(result.hours).toBe(4);
  expect(result.minutes).toBe(17);
  expect(result.seconds).toBe(2);
});

test("Duration#plus adds number as milliseconds", () => {
  const first = Duration.fromObject({ minutes: 11, seconds: 22 }),
    result = first.plus(333);

  expect(result.minutes).toBe(11);
  expect(result.seconds).toBe(22);
  expect(result.milliseconds).toBe(333);
});

describe("Duration#plus results in the union of the set units", () => {
  test("Basic", () => {
    const dur = Duration.fromObject({ hours: 1, minutes: 0 }).plus({ seconds: 3, milliseconds: 0 });
    expect(dur.toObject()).toStrictEqual({
      hours: expect.anything(),
      minutes: expect.anything(),
      seconds: expect.anything(),
      milliseconds: expect.anything(),
    });
  });

  test("When adding empty Duration", () => {
    const dur = Duration.fromObject({ hours: 1, minutes: 0 }).plus({});
    expect(dur.toObject()).toStrictEqual({
      hours: expect.anything(),
      minutes: expect.anything(),
    });
  });
});

test("Duration#plus throws with invalid parameter", () => {
  expect(() => Duration.fromObject({}).plus("123")).toThrow();
});

//------
// #minus()
//------
test("Duration#minus subtracts durations", () => {
  const first = Duration.fromObject({ hours: 4, minutes: 12, seconds: 2 }),
    second = Duration.fromObject({ hours: 1, seconds: 6, milliseconds: 14 }),
    result = first.minus(second);

  expect(result.toObject()).toStrictEqual({
    hours: 3,
    minutes: 12,
    seconds: -4,
    milliseconds: -14,
  });
});

test("Duration#minus subtracts single values", () => {
  const first = Duration.fromObject({ hours: 4, minutes: 12, seconds: 2 }),
    result = first.minus({ minutes: 5 });

  expect(result.hours).toBe(4);
  expect(result.minutes).toBe(7);
  expect(result.seconds).toBe(2);
});

test("Duration#minus produces the union of the set of units", () => {
  const first = Duration.fromObject({ hours: 4, seconds: 2 }),
    result = first.minus({ minutes: 5 });

  expect(result.toObject()).toStrictEqual({
    hours: expect.anything(),
    minutes: expect.anything(),
    seconds: expect.anything(),
  });
});

//------
// #negate()
//------

test("Duration#negate flips all the signs", () => {
  const dur = Duration.fromObject({ hours: 4, minutes: -12, seconds: 2 }),
    result = dur.negate();
  expect(result.hours).toBe(-4);
  expect(result.minutes).toBe(12);
  expect(result.seconds).toBe(-2);
});

test("Duration#negate doesn't mutate", () => {
  const orig = Duration.fromObject({ hours: 8 });
  orig.negate();
  expect(orig.hours).toBe(8);
});

test("Duration#negate does not change the set of units", () => {
  const dur = Duration.fromObject({ years: 1, days: 2, minutes: 3 }),
    result = dur.negate();

  expect(result.toObject()).toStrictEqual({
    years: expect.anything(),
    days: expect.anything(),
    minutes: expect.anything(),
  });
});

//------
// #mapUnits
//------

test("Duration#mapUnits can multiply durations", () => {
  const dur = Duration.fromObject({ hours: 1, minutes: 2, seconds: -3, milliseconds: -4 }),
    result = dur.mapUnits((x) => x * 5);

  expect(result.hours).toBe(5);
  expect(result.minutes).toBe(10);
  expect(result.seconds).toBe(-15);
  expect(result.milliseconds).toBe(-20);
});

test("Duration#mapUnits does not change the set of units", () => {
  const dur = Duration.fromObject({ years: 1, days: 2, minutes: 3 }),
    result = dur.mapUnits((x) => x * 5);

  expect(result.toObject()).toStrictEqual({
    years: expect.anything(),
    days: expect.anything(),
    minutes: expect.anything(),
  });
});

test("Duration#units can take the unit into account", () => {
  const dur = Duration.fromObject({ hours: 1, minutes: 2, seconds: -3, milliseconds: -4 }),
    result = dur.mapUnits((x, u) => x * (u === "milliseconds" ? 2 : 5));

  expect(result.hours).toBe(5);
  expect(result.minutes).toBe(10);
  expect(result.seconds).toBe(-15);
  expect(result.milliseconds).toBe(-8);
});

test("Duration#mapUnits requires that fn return a number", () => {
  const dur = Duration.fromObject({ hours: 1, minutes: 2, seconds: -3, milliseconds: -4 });
  expect(() => dur.mapUnits(() => "hello?")).toThrow();
});
