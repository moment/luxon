/* global test expect */
import { Interval } from "../../src/luxon";

const Helpers = require("../helpers");

const todayFrom = (h1, h2) => Interval.fromDateTimes(Helpers.atHour(h1), Helpers.atHour(h2));

test("Interval.start gets the start", () => {
  expect(todayFrom(3, 5).start.hour).toBe(3);
});

test("Interval.end gets the end", () => {
  expect(todayFrom(3, 5).end.hour).toBe(5);
});
