import { Interval } from "../../src/luxon";

import Helpers from "../helpers";

const todayFrom = (h1: number, h2: number) =>
  Interval.fromDateTimes(Helpers.atHour(h1), Helpers.atHour(h2));

test("Interval.set can set the start", () => {
  expect(todayFrom(3, 5).set({ start: Helpers.atHour(4) }).start.hour).toBe(4);
});

test("Interval.set can set the end", () => {
  expect(todayFrom(3, 5).set({ end: Helpers.atHour(6) }).end.hour).toBe(6);
});
