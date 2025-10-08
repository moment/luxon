import { test, expect } from "vitest";
import { Info } from "../../src/luxon";

import * as Helpers from "../helpers";

Helpers.withoutRTF("Info.features shows no support", () => {
  expect(Info.features().relative).toBe(false);
});

Helpers.withoutLocaleWeekInfo("Info.features shows no support", () => {
  expect(Info.features().localeWeek).toBe(false);
});
