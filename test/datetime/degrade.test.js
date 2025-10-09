import { expect } from "vitest";
import { DateTime } from "../../src/luxon.ts";

import * as Helpers from "../helpers";

Helpers.withoutRTF("calling toRelative falls back to English", () => {
  expect(
    DateTime.fromISO("2014-08-06", { locale: "fr" }).toRelative({
      base: DateTime.fromISO("1982-05-25"),
    })
  ).toBe("in 32 years");
});
