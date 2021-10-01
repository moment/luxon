/* global test expect */
import { normalizeZone } from "../../src/impl/zoneUtil";
import { InvalidZone, Zone } from "../../src/luxon";

test("You can instantiate Zone directly", () => {
  // @ts-expect-error test
  expect(() => new Zone().isValid).toThrow();
});

test("normalizeZone returns Invalid Zone for boolean argument", () => {
  // @ts-expect-error test
  expect(normalizeZone(true)).toBeInstanceOf(InvalidZone);
});

test("normalizeZone returns Invalid Zone for gibberish string argument", () => {
  // @ts-expect-error test
  expect(normalizeZone("Sport~~blorp")).toBeInstanceOf(InvalidZone);
});
