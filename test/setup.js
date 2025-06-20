import { equals } from "@jest/expect-utils";
import Settings from "../src/settings";

beforeEach(() => {
  Settings.resetCaches();
});

expect.extend({
  toThrowLuxonError(func, constructor, code, args) {
    try {
      func();
    } catch (e) {
      if (!(e instanceof constructor)) {
        return {
          pass: false,
          message: () =>
            `expected function to throw ${constructor.name}, but it threw ${e.constructor.name} instead.`,
        };
      }
      if (e.code !== code) {
        return {
          pass: false,
          message: () =>
            `expected function to throw ${constructor.name} with code ${code}, but it had code ${e.code} instead.`,
        };
      }
      if (args != null && !equals(args, e.args)) {
        return {
          pass: false,
          message: () =>
            `expected function to throw ${
              constructor.name
            } with code ${code} and args ${JSON.stringify(args)}, but it had args ${JSON.stringify(
              e.args
            )} instead.`,
        };
      }

      return {
        pass: true,
        message: () => `expected function not to throw ${constructor.name} with code ${code}.`,
      };
    }

    return {
      pass: false,
      message: () => `expected function to throw ${constructor.name}, but it did not throw`,
    };
  },
});
