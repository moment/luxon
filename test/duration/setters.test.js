/* global test expect */
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
    milliseconds: 1
  });

test("Duration#set() sets the values", () => {
  expect(dur().set({ years: 2 }).years).toBe(2);
  expect(dur().set({ months: 2 }).months).toBe(2);
  expect(dur().set({ days: 2 }).days).toBe(2);
  expect(dur().set({ hours: 4 }).hours).toBe(4);
  expect(dur().set({ minutes: 16 }).minutes).toBe(16);
  expect(dur().set({ seconds: 45 }).seconds).toBe(45);
  expect(dur().set({ milliseconds: 86 }).milliseconds).toBe(86);
});
