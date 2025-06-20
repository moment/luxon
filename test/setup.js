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
      if (!(e instanceof constructor) || e.code !== code) {
        return {
          pass: false,
          message: () =>
            `expected function to throw ${constructor.name} with code ${code}, but it had code ${e.code} instead.`,
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
