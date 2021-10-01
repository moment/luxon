/* global test expect */
import { Interval } from "../../src/luxon";
import { atHour } from "../helpers";

const todayFrom = (h1: number, h2: number) => Interval.fromDateTimes(atHour(h1), atHour(h2));

test("Interval.set can set the start", () => {
  expect(todayFrom(3, 5).set({ start: atHour(4) }).start?.hour).toBe(4);
});

test("Interval.set can set the end", () => {
  expect(todayFrom(3, 5).set({ end: atHour(6) }).end?.hour).toBe(6);
});

test("Interval.set preserves invalidity", () => {
  const invalid = Interval.invalid("because");
  expect(invalid.set({ start: atHour(4) }).isValid).toBe(false);
});
