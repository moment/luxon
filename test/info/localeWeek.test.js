/* global test expect */
import { Info } from "../../src/luxon";
import { supportsMinDaysInFirstWeek } from "../helpers";

const Helpers = require("../helpers");

test("Info.getStartOfWeek reports the correct start of the week", () => {
  expect(Info.getStartOfWeek({ locale: "en-US" })).toBe(7);
  expect(Info.getStartOfWeek({ locale: "de-DE" })).toBe(1);
});

Helpers.withoutLocaleWeekInfo("Info.getStartOfWeek reports Monday as the start of the week", () => {
  expect(Info.getStartOfWeek({ locale: "en-US" })).toBe(1);
  expect(Info.getStartOfWeek({ locale: "de-DE" })).toBe(1);
});

test("Info.getMinimumDaysInFirstWeek reports the correct value", () => {
  expect(Info.getMinimumDaysInFirstWeek({ locale: "en-US" })).toBe(
    supportsMinDaysInFirstWeek() ? 1 : 4
  );
  expect(Info.getMinimumDaysInFirstWeek({ locale: "de-DE" })).toBe(4);
});

Helpers.withoutLocaleWeekInfo("Info.getMinimumDaysInFirstWeek reports 4", () => {
  expect(Info.getMinimumDaysInFirstWeek({ locale: "en-US" })).toBe(4);
  expect(Info.getMinimumDaysInFirstWeek({ locale: "de-DE" })).toBe(4);
});

test("Info.getWeekendWeekdays reports the correct value", () => {
  expect(Info.getWeekendWeekdays({ locale: "en-US" })).toStrictEqual([6, 7]);
  expect(Info.getWeekendWeekdays({ locale: "he" })).toStrictEqual([5, 6]);
});

Helpers.withoutLocaleWeekInfo("Info.getWeekendWeekdays reports [6, 7]", () => {
  expect(Info.getWeekendWeekdays({ locale: "en-US" })).toStrictEqual([6, 7]);
  expect(Info.getWeekendWeekdays({ locale: "he" })).toStrictEqual([6, 7]);
});

test("Info.getStartOfWeek honors the default locale", () => {
  Helpers.withDefaultLocale("en-US", () => {
    expect(Info.getStartOfWeek()).toBe(7);
    expect(Info.getMinimumDaysInFirstWeek()).toBe(supportsMinDaysInFirstWeek() ? 1 : 4);
    expect(Info.getWeekendWeekdays()).toStrictEqual([6, 7]);
  });

  Helpers.withDefaultLocale("de-DE", () => {
    expect(Info.getStartOfWeek()).toBe(1);
  });

  Helpers.withDefaultLocale("he", () => {
    expect(Info.getWeekendWeekdays()).toStrictEqual([5, 6]);
  });

  Helpers.withDefaultLocale("he", () => {
    expect(Info.getWeekendWeekdays()).toStrictEqual([5, 6]);
  });
});
