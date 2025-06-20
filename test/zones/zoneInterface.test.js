/* global test expect */
import { Zone } from "../../src/luxon";

test("You cannot instantiate Zone directly", () => {
  expect(() => new Zone()).toThrow(TypeError);
});
