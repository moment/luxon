import { test, expect } from "vitest";
import { Info } from "../../src/luxon";

import * as Helpers from "../helpers";
import { hasLocaleWeekInfo } from "../../src/impl/util";

test("Info.features shows this environment supports Intl.RelativeTimeFormat", () => {
  expect(Info.features().relative).toBe(true);
});

test.skipIf(!hasLocaleWeekInfo())(
  "Info.features shows this environment supports Intl.WeekInfo",
  () => {
    expect(Info.features().localeWeek).toBe(true);
  }
);

Helpers.withoutRTF("Info.features shows no support", () => {
  expect(Info.features().relative).toBe(false);
});

Helpers.withoutLocaleWeekInfo("Info.features shows no support", () => {
  expect(Info.features().localeWeek).toBe(false);
});
