import { Interval } from "../../src/luxon";

import Helpers from "../helpers";

const todayFrom = (h1: number, h2: number) =>
  Interval.fromDateTimes(Helpers.atHour(h1), Helpers.atHour(h2));

test("Interval.start gets the start", () => {
  expect(todayFrom(3, 5).start.hour).toBe(3);
});

test("Interval.end gets the end", () => {
  expect(todayFrom(3, 5).end.hour).toBe(5);
});
