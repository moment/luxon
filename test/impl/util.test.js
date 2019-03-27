/* global test expect, jest */
import { isValidZone, memoize } from "../../src/impl/util";

test("memoize calls target function once for same argument", () => {
  const fn = jest.fn();
  const memoized = memoize(fn);
  memoized("test");
  memoized("test");
  expect(fn).toBeCalledTimes(1);
});

test("memoize calls target function if arguments are different", () => {
  const fn = jest.fn();
  const memoized = memoize(fn);
  memoized("test 1");
  memoized("test 2");
  expect(fn).toBeCalledTimes(2);
});

test("isValidZone should return correct results", () => {
  expect(isValidZone("America/Los_Angeles")).toBe(true);
  expect(isValidZone("Europe/London")).toBe(true);
  expect(isValidZone("Invalid/Zone")).toBe(false);
});
