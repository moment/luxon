import { test, expect } from "vitest";
import { Zone } from "../../src/luxon.ts";

test("You can instantiate Zone directly", () => {
  expect(() => new Zone().isValid).toThrow();
});
