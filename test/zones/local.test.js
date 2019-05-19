/* global test expect */
import { LocalZone } from "../../src/luxon";
import { withoutIntl } from "../helpers";

test("LocalZone.instance returns a singleton", () => {
  expect(LocalZone.instance).toBe(LocalZone.instance);
});

test("LocalZone.instance provides valid ...", () => {
  expect(LocalZone.instance.type).toBe("local");
  expect(LocalZone.instance.universal).toBe(false);
  expect(LocalZone.instance.isValid).toBe(true);
  expect(LocalZone.instance.equals(LocalZone.instance)).toBe(true);

  // todo: figure out how to test these without inadvertently testing IANAZone
  expect(LocalZone.instance.name).toBe("America/New_York"); // this is true for the provided Docker container, what's the right way to test it?
  // expect(LocalZone.instance.offsetName()).toBe("UTC");
  // expect(LocalZone.instance.formatOffset(0, "short")).toBe("+00:00");
  // expect(LocalZone.instance.offset()).toBe(0);
});

withoutIntl("LocalZone.name simply returns 'local'", () => {
  expect(LocalZone.instance.name).toBe("local");
});
