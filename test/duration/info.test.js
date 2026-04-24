import { test, expect } from "vitest";

import { Duration } from "../../src/luxon";

const dur = Duration.fromObject({
  years: 1,
  months: 2,
  days: 3,
});

//------
// #toObject
//-------
test("Duration#toObject returns the object", () => {
  expect(dur.toObject()).toStrictEqual({
    years: 1,
    months: 2,
    days: 3,
  });
});
