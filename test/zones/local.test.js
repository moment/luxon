/* global test expect */
import { SystemZone } from "../../src/luxon";

test("SystemZone.instance returns a singleton", () => {
  expect(SystemZone.instance).toBe(SystemZone.instance);
});

test("SystemZone.instance provides valid ...", () => {
  expect(SystemZone.instance.type).toBe("system");
  expect(SystemZone.instance.universal).toBe(false);
  expect(SystemZone.instance.isValid).toBe(true);
  expect(SystemZone.instance).toBe(SystemZone.instance);

  // todo: figure out how to test these without inadvertently testing IANAZone
  expect(SystemZone.instance.name).toBe("America/New_York"); // this is true for the provided Docker container, what's the right way to test it?
  // expect(SystemZone.instance.offsetName()).toBe("UTC");
  // expect(SystemZone.instance.formatOffset(0, "short")).toBe("+00:00");
  // expect(SystemZone.instance.offset()).toBe(0);
});
