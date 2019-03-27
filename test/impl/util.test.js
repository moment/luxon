/* global test expect, jest */
import { memoize } from "../../src/impl/util";

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
