/* global test expect */
import { Zone } from "../../src";

test("You can instantiate Zone directly", () => {
  // @ts-expect-error
  expect(() => new Zone().isValid).toThrow();
});
