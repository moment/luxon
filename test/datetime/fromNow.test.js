import { Helpers } from "../helpers";
import DateTime from "../../src/datetime";

/* global test expect */

Helpers.withoutRTF("DateTime#fromNow falls back to English", () => {
  const base = DateTime.fromObject({ year: 2019, month: 12, day: 25 });

  expect(base.plus({ months: 1 }).fromNow({ base })).toBe("next month");
  expect(base.plus({ months: 1 }).fromNow({ base, forceNumbers: true })).toBe("in 1 month");
  expect(base.plus({ months: 1 }).fromNow({ base, forceNumbers: true, style: "narrow" })).toBe(
    "in 1 mo."
  );
});
