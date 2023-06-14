/* global test expect */
import { Info } from "../../src/luxon";

const Helpers = require("../helpers");

test("Info.getStartOfWeek reports the correct start of the week", () => {
  expect(Info.getStartOfWeek({ locale: "en-US" })).toBe(7);
  expect(Info.getStartOfWeek({ locale: "de-DE" })).toBe(1);
});

Helpers.withoutLocaleWeekInfo("Info.getStartOfWeek reports Monday as the start of the week", () => {
  expect(Info.getStartOfWeek({ locale: "en-US" })).toBe(1);
  expect(Info.getStartOfWeek({ locale: "de-DE" })).toBe(1);
});

test("Info.getStartOfWeek honors the default locale", () => {
  Helpers.withDefaultLocale("en-US", () => {
    expect(Info.getStartOfWeek()).toBe(7);
  });

  Helpers.withDefaultLocale("de-DE", () => {
    expect(Info.getStartOfWeek()).toBe(1);
  });
});
