import { expect, test } from "vitest";

import { DateTime } from "../../src/luxon";
import { InvalidDurationError } from "../../src/errors";

test("Diffing invalid DateTimes throws", () => {
  const invalidDT = DateTime.invalid("so?");
  expect(() => invalidDT.diff(DateTime.now())).toThrow(InvalidDurationError);
  expect(() => DateTime.now().diff(invalidDT)).toThrow(InvalidDurationError);
});
