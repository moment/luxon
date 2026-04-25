import { describe, test, expect } from "vitest";
import { Duration } from "../../src/luxon";

//------
// years/months/days/hours/minutes/seconds/milliseconds
//-------
const dur = () =>
  Duration.fromObject({
    years: 1,
    months: 1,
    days: 1,
    hours: 1,
    minutes: 1,
    seconds: 1,
    milliseconds: 1,
  });

describe("Duration#set() sets the values", () => {
  const source = {
    years: 1,
    months: 1,
    days: 1,
    hours: 1,
    minutes: 1,
    seconds: 1,
    milliseconds: 1,
  };
  test.each([
    ["years", 2],
    ["months", 2],
    ["days", 2],
    ["hours", 4],
    ["hours", 4],
    ["minutes", 16],
    ["seconds", 45],
    ["milliseconds", 86],
  ])("set({ %s: %s })", (key, value) => {
    expect(
      Duration.fromObject(source)
        .set({ [key]: value })
        .toObject()
    ).toStrictEqual({ ...source, [key]: value });
  });
});

test("Duration#set() throws for metadata", () => {
  expect(() => dur.set({ locale: "be" })).toThrow();
  expect(() => dur.set({ numberingSystem: "thai" })).toThrow();
  expect(() => dur.set({ invalid: 42 })).toThrow();
});
