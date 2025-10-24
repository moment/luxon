import { expect } from "vitest";
import { LuxonError } from "../src/errors.ts";

console.log("SETUP RUNS");

expect.extend({
  toThrowLuxonError(func: () => unknown, expected, code) {
    const { isNot } = this;

    let thrown: unknown = undefined;
    let didThrow = false;
    try {
      func();
    } catch (e: unknown) {
      didThrow = true;
      thrown = e;
    }

    return {
      pass:
        didThrow &&
        thrown instanceof expected &&
        thrown instanceof LuxonError &&
        (code === undefined || thrown.code === code),
      message: () => {
        const expectedError =
          code === undefined ? `${expected.name}` : `${expected.name}(code=${code})`;
        const but = didThrow
          ? ` but it threw something else: "${thrown}"`
          : ` but it did not throw`;
        return `expected ${func} to throw ${expectedError}, ${but}`;
      },
    };
  },
});
