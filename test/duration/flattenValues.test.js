import { flattenValues, casualMatrix } from "../../src/duration";

test("flattenValues converts decimal days to hours", () => {
  const dur = flattenValues(casualMatrix, {
    days: 1.5,
    hours: 4,
  });
  expect(dur.years).toBe(0);
  expect(dur.months).toBe(0);
  expect(dur.days).toBe(1);
  expect(dur.hours).toBe(16);
  expect(dur.minutes).toBe(0);
  expect(dur.seconds).toBe(0);
  expect(dur.milliseconds).toBe(0);
});

test("flattenValues converts in cascade", () => {
  const dur = flattenValues(casualMatrix, {
    days: 1.5,
    hours: 4.5,
  });
  expect(dur.years).toBe(0);
  expect(dur.months).toBe(0);
  expect(dur.days).toBe(1);
  expect(dur.hours).toBe(16);
  expect(dur.minutes).toBe(30);
  expect(dur.seconds).toBe(0);
  expect(dur.milliseconds).toBe(0);
});

test("flattenValues rounds milliseconds", () => {
  const dur = flattenValues(casualMatrix, {
    seconds: 1.5,
    milliseconds: 100.5,
  });
  expect(dur.years).toBe(0);
  expect(dur.months).toBe(0);
  expect(dur.days).toBe(0);
  expect(dur.hours).toBe(0);
  expect(dur.minutes).toBe(0);
  expect(dur.seconds).toBe(1);
  expect(dur.milliseconds).toBe(601);
});
