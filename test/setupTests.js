import { expect } from "vitest";

expect.extend({
  toMatchIgnoringWeirdSpaces(received, expected) {
    function replaceWeirdSpaces(str) {
      return str.replace(/\s/g, " ");
    }

    let pass, expectedDisplay;
    if (Array.isArray(expected)) {
      pass = expected.some((e) => replaceWeirdSpaces(received) === replaceWeirdSpaces(e));
      expectedDisplay = `one of ${expected.join(", ")}`;
    } else {
      pass = replaceWeirdSpaces(received) === replaceWeirdSpaces(expected);
      expectedDisplay = expected;
    }

    return {
      pass,
      message: () =>
        pass
          ? `Expected ${String(received)} to be (ignoring weird spaces) ${expectedDisplay}`
          : `Expected ${String(received)} to be (ignoring weird spaces) ${String(expectedDisplay)}`,
    };
  },
});
