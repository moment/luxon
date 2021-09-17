/* global test expect */
import { Zone } from "../../mod/Module";

test("You can instantiate Zone directly", () => {
  expect(() => new Zone().isValid).toThrow();
});
