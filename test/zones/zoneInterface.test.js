/* global test expect */
import { Zone } from "../../src/luxon";

test("You can instantiate Zone directly", () => {
  expect(() => new Zone().isValid).toThrow();
});
