import { test, expect } from "vitest";

import { Duration } from "../../src/luxon.ts";

const dur = Duration.fromObject({
  years: 1,
  months: 2,
  days: 3.3,
});

//------
// #toObject
//-------
test("Duration#toObject returns the object", () => {
  expect(dur.toObject()).toEqual({
    years: 1,
    months: 2,
    days: 3.3,
  });
});

test("Duration#toObject returns an empty object for invalid durations", () => {
  expect(Duration.invalid("because").toObject()).toEqual({});
});
