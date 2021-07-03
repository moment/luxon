/* global test expect */
import { InvalidZone } from "../../src/luxon";

test("InvalidZone", () => {
  const zone = new InvalidZone("foo");

  expect(zone.type).toBe("invalid");
  expect(zone.name).toBe("foo");
  expect(zone.offsetName()).toBe(null); // the abstract class states this returns a string, yet InvalidZones return null :(
  expect(zone.formatOffset(0, "short")).toBe("");
  expect(zone.isUniversal).toBe(false);
  expect(zone.offset()).toBe(NaN);
  expect(zone.isValid).toBe(false);
  expect(zone.equals(zone)).toBe(false); // always false even if it has the same name
});
