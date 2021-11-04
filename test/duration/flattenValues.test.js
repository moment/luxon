import { flattenValues, casualMatrix, accurateMatrix } from "../../src/duration";

test("flattenValues converts decimal days to hours", () => {
  const dur = flattenValues(casualMatrix, {
    days: 1.5,
    hours: 4,
  });
  expect(dur.days).toBe(1);
  expect(dur.hours).toBe(16);
});

test("flattenValues converts in cascade", () => {
  const dur = flattenValues(casualMatrix, {
    days: 1.5,
    hours: 4.5,
  });
  expect(dur.days).toBe(1);
  expect(dur.hours).toBe(16);
  expect(dur.minutes).toBe(30);

  const dur2 = flattenValues(casualMatrix, {
    months: 1.5,
  });
  expect(dur2.months).toBe(1);
  expect(dur2.weeks).toBe(2);

  const dur3 = flattenValues(accurateMatrix, {
    months: 1.5,
  });
  expect(dur3.months).toBe(1);
  expect(dur3.weeks).toBe(2);
  expect(dur3.days).toBe(1);
  expect(dur3.hours).toBe(5);
  expect(dur3.minutes).toBe(14);
  expect(dur3.seconds).toBe(33);
  expect(dur3.milliseconds).toBe(1);
});

test("flattenValues rounds milliseconds", () => {
  const dur = flattenValues(casualMatrix, {
    seconds: 1.5,
    milliseconds: 100.5,
  });
  expect(dur.seconds).toBe(1);
  expect(dur.milliseconds).toBe(601);
});
