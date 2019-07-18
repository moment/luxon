/* global test expect */
import { Zone } from "../../src/luxon";

test("You can instantiate Zone directly", () => {
  // @ts-ignore
  expect(() => new Zone().isValid).toThrow();
});
