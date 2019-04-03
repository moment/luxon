/* global test expect */

import { numberingSystemsUTF16 } from "../../src/impl/digits";

/**
 * a test to ensure that future numberingSystem implementations
 * have correct unicode point ranges. either the difference between
 * the two endpoints must always be 9 or the length of the range must be 9.
 */
test("range should always be nine", () => {
  for (const nu in numberingSystemsUTF16) {
    const range = numberingSystemsUTF16[nu];

    if (range.length === 2) {
      expect(range[1] - range[0]).toEqual(9);
    } else {
      expect(range.length - 1).toEqual(9);
    }
  }
});
