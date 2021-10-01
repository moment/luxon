/* global expect */
import { hasRelative } from "../../src/impl/util";
import { DateTime } from "../../src/luxon";
import { withoutRTF } from "../helpers";

withoutRTF("calling toRelative falls back to English", () => {
  expect(
    DateTime.fromISO("2014-08-06", { locale: "fr" }).toRelative({
      base: DateTime.fromISO("1982-05-25"),
    })
  ).toBe("in 32 years");
});

withoutRTF("calling hasRelative returns false", () => {
  expect(hasRelative()).toBeFalsy();
});
