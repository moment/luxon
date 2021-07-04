/* global test expect */

import { Duration } from "../../src/luxon";

const dur = Duration.fromObject(
  {
    years: 1,
    months: 2,
    days: 3,
  },
  {
    locale: "fr",
    numberingSystem: "beng",
    conversionAccuracy: "longterm",
  }
);

//------
// #toObject
//-------
test("Duration#toObject returns the object", () => {
  expect(dur.toObject()).toEqual({
    years: 1,
    months: 2,
    days: 3,
  });
});

test("Duration#toObject accepts a flag to return config", () => {
  expect(dur.toObject({ includeConfig: true })).toEqual(
    {
      years: 1,
      months: 2,
      days: 3,
    },
    {
      locale: "fr",
      numberingSystem: "beng",
      conversionAccuracy: "longterm",
    }
  );
});

test("Duration#toObject returns an empty object for invalid durations", () => {
  expect(Duration.invalid("because").toObject()).toEqual({});
});
