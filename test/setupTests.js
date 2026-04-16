import { expect } from "vitest";

expect.extend({
  toMatchIgnoringWeirdSpaces(received, expected) {
    const replaceNbspReceived = (str) => str.replace(/\s/g, " ");
    const replaceNbspExpected = (str) => str.replace(/\s/g, " ");

    const pass = replaceNbspReceived(received) === replaceNbspExpected(expected);

    return {
      pass,
      message: () =>
        pass
          ? `Expected ${String(received)} to be (ignorning weird spaces) ${String(expected)}`
          : `Expected ${String(received)} to be (ignorning weird spaces) ${String(expected)}`,
    };
  },
});
