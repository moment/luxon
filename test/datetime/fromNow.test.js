import { Helpers } from "../helpers";
import DateTime from "../../src/datetime";

/* global expect */

Helpers.withoutRTF("DateTime#fromNow works without RTF", () => {
  const base = DateTime.fromObject({ year: 2019, month: 12, day: 25 });

  expect(base.plus({ months: 1 }).fromNow({ base })).toBe("next month");
  expect(base.plus({ months: 1 }).fromNow({ base, forceNumbers: true })).toBe("in 1 month");
  expect(base.plus({ months: 1 }).fromNow({ base, forceNumbers: true, style: "narrow" })).toBe(
    "in 1 mo."
  );
  expect(base.plus({ months: 1 }).fromNow({ base, unit: "days" })).toBe("in 31 days");
  expect(base.plus({ months: 1, days: 2 }).fromNow({ base, round: false })).toBe("in 1.06 months");
  expect(base.plus({ months: 1, days: 2 }).fromNow({ base, round: true })).toBe("next month");
});

Helpers.withoutRTF("DateTime#fromNow falls back to English", () => {
  const base = DateTime.fromObject({ year: 2019, month: 12, day: 25 });

  expect(
    base
      .setLocale("fr")
      .plus({ months: 1 })
      .fromNow({ base })
  ).toBe("next month");
  expect(base.plus({ months: 1 }).fromNow({ base, locale: "fr" })).toBe("next month");
});
