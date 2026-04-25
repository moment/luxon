import { describe, test, expect } from "vitest";

import { Duration } from "../../src/luxon";
import { ParseError } from "../../src/errors";

//------
// #fromISO()
//------

describe("Duration.fromISO can parse a variety of ISO formats", () => {
  test.each([
    ["P5Y3M", { years: 5, months: 3 }],
    ["PT54M32S", { minutes: 54, seconds: 32 }],
    ["P3DT54M32S", { days: 3, minutes: 54, seconds: 32 }],
    ["P1YT34000S", { years: 1, seconds: 34000 }],
    ["P1W1DT13H23M34S", { weeks: 1, days: 1, hours: 13, minutes: 23, seconds: 34 }],
    ["P2W", { weeks: 2 }],
    ["PT10000000000000000000.999S", { seconds: 10000000000000000000, milliseconds: 999 }],
  ])("fromISO(%s) => %o", (s, expected) => {
    expect(Duration.fromISO(s).toObject()).toStrictEqual(expected);
  });
});

describe("Duration.fromISO can parse mixed or negative durations", () => {
  test.each([
    ["P-5Y-3M", { years: -5, months: -3 }],
    ["PT-54M32S", { minutes: -54, seconds: 32 }],
    ["P-3DT54M-32S", { days: -3, minutes: 54, seconds: -32 }],
    ["P1YT-34000S", { years: 1, seconds: -34000 }],
    ["P-1W1DT13H23M34S", { weeks: -1, days: 1, hours: 13, minutes: 23, seconds: 34 }],
    ["P-2W", { weeks: -2 }],
    ["-P1D", { days: -1 }],
    ["-P5Y3M", { years: -5, months: -3 }],
    ["-P-5Y-3M", { years: 5, months: 3 }],
    ["-P-1W1DT13H-23M34S", { weeks: 1, days: -1, hours: -13, minutes: 23, seconds: -34 }],
    ["PT-1.5S", { seconds: -1, milliseconds: -500 }],
    ["PT-0.5S", { seconds: 0, milliseconds: -500 }],
    ["PT1.5S", { seconds: 1, milliseconds: 500 }],
    ["PT0.5S", { seconds: 0, milliseconds: 500 }],
  ])("fromISO(%s) => %o", (s, expected) => {
    expect(Duration.fromISO(s).toObject()).toStrictEqual(expected);
  });
});

describe("Duration.fromISO can parse fractions of time units", () => {
  test.each([
    ["PT54M32.5S", { minutes: 54, seconds: 32, milliseconds: 500 }],
    ["PT54M32.534S", { minutes: 54, seconds: 32, milliseconds: 534 }],
    ["PT54M32.034S", { minutes: 54, seconds: 32, milliseconds: 34 }],
    ["P13YT54M32.034S", { years: 13, minutes: 54, seconds: 32, milliseconds: 34 }],
    ["PT54.5M12.034S", { minutes: 54, seconds: 42, milliseconds: 34 }],
    ["PT54.5M32.034S", { minutes: 55, seconds: 2, milliseconds: 34 }],
    ["PT2.5083H10M", { hours: 2, minutes: 30, seconds: 29, milliseconds: 880 }],
  ])("fromISO(%s) => %o", (s, expected) => {
    expect(Duration.fromISO(s).toObject()).toStrictEqual(expected);
  });
});

describe("Duration.fromISO rejects fractions in date units", () => {
  test.each([["P3.5Y"], ["P3.5M"], ["P2Y1.5M"], ["P1.5D"], ["P2.5WT3H"]])(
    "Duration.fromISO rejects %s",
    (s) => {
      expect(() => Duration.fromISO(s)).toThrow(new ParseError("Duration", "ISO 8601 duration", s));
    }
  );
});

describe("Duration.fromISO rejects nonsense", () => {
  test.each([["poop"], ["PTglorb"], ["P5Y34S"], ["5Y"], ["P34S"], ["P34K"], ["P5D2W"]])(
    "Duration.fromISO rejects %s",
    (s) => {
      expect(() => Duration.fromISO(s)).toThrow(new ParseError("Duration", "ISO 8601 duration", s));
    }
  );
});

//------
// #fromISOTime()
//------

describe("Duration.fromISOTime can parse a variety of extended ISO time formats", () => {
  test.each([
    ["11:22:33.444", { hours: 11, minutes: 22, seconds: 33, milliseconds: 444 }],
    ["11:22:33", { hours: 11, minutes: 22, seconds: 33 }],
    ["11:22", { hours: 11, minutes: 22, seconds: 0 }],
    ["T11:22", { hours: 11, minutes: 22, seconds: 0 }],
  ])("fromISOTime(%s) => %o", (s, expected) => {
    expect(Duration.fromISOTime(s).toObject()).toStrictEqual(expected);
  });
});

describe("Duration.fromISOTime can parse a variety of basic ISO time formats", () => {
  test.each([
    ["112233.444", { hours: 11, minutes: 22, seconds: 33, milliseconds: 444 }],
    ["112233", { hours: 11, minutes: 22, seconds: 33 }],
    ["1122", { hours: 11, minutes: 22, seconds: 0 }],
    ["11", { hours: 11, minutes: 0, seconds: 0 }],
    ["T1122", { hours: 11, minutes: 22, seconds: 0 }],
  ])("fromISOTime(%s) => %o", (s, expected) => {
    expect(Duration.fromISOTime(s).toObject()).toStrictEqual(expected);
  });
});

describe("Duration.fromISOTime rejects nonsense", () => {
  test.each([["poop"], ["Tglorb"], ["-00:00"]])("Duration.fromISOTime rejects %s", (s) => {
    expect(() => Duration.fromISOTime(s)).toThrow(new ParseError("Duration", "ISO 8601 time", s));
  });
});
