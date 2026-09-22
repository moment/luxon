/* global test expect */
import { DateTime, Duration, Settings } from "../../src/luxon";

const numberingSystems = [
  "arab",
  "arabext",
  "bali",
  "beng",
  "deva",
  "fullwide",
  "gujr",
  "hanidec",
  "khmr",
  "knda",
  "laoo",
  "limb",
  "mlym",
  "mong",
  "mymr",
  "orya",
  "tamldec",
  "telu",
  "thai",
  "tibt",
  "latn",
];

function formatNumber(value, numberingSystem, minimumIntegerDigits = 0) {
  const options = { numberingSystem, useGrouping: false };
  if (minimumIntegerDigits > 0) {
    options.minimumIntegerDigits = minimumIntegerDigits;
  }
  return new Intl.NumberFormat("en-US", options).format(value);
}

test("DateTime.fromFormat() parses the complete fullwide digit range", () => {
  for (let value = 0; value < 10; value++) {
    const parsed = DateTime.fromFormat(formatNumber(value, "fullwide"), "H", {
      locale: "en-US",
      numberingSystem: "fullwide",
      zone: "UTC",
    });

    expect(parsed.isValid).toBe(true);
    expect(parsed.hour).toBe(value);
  }
});

test("DateTime.fromFormat() parses the complete hanidec digit range and rejects the pipe", () => {
  for (let value = 0; value < 10; value++) {
    const parsed = DateTime.fromFormat(formatNumber(value, "hanidec"), "H", {
      locale: "zh",
      numberingSystem: "hanidec",
      zone: "UTC",
    });

    expect(parsed.isValid).toBe(true);
    expect(parsed.hour).toBe(value);
  }

  const parsed = DateTime.fromFormat("|", "d", {
    locale: "zh",
    numberingSystem: "hanidec",
  });
  expect(parsed.isValid).toBe(false);
  expect(parsed.invalidReason).toBe("unparsable");
});

test("DateTime.fromFormat() parses dates in every supported numbering system", () => {
  for (const numberingSystem of numberingSystems) {
    const input = [
      formatNumber(2024, numberingSystem),
      formatNumber(8, numberingSystem, 2),
      formatNumber(9, numberingSystem, 2),
    ].join("-");
    const parsed = DateTime.fromFormat(input, "yyyy-MM-dd", {
      locale: "en-US",
      numberingSystem,
      zone: "UTC",
    });

    expect(parsed.isValid).toBe(true);
    expect(parsed.toObject()).toMatchObject({ year: 2024, month: 8, day: 9 });
  }
});

test("normal date and duration parsing remain unchanged", () => {
  expect(DateTime.fromISO("2024-08-09", { zone: "UTC" }).toISODate()).toBe("2024-08-09");
  expect(Duration.fromISO("P8Y9M10DT8H9M10S").toObject()).toEqual({
    years: 8,
    months: 9,
    days: 10,
    hours: 8,
    minutes: 9,
    seconds: 10,
  });
});

test("invalid digits remain unparsable and propagate through DateTime invalidation", () => {
  const invalid = DateTime.fromFormat("x", "d", { numberingSystem: "hanidec" });
  expect(invalid.isValid).toBe(false);
  expect(invalid.invalidReason).toBe("unparsable");

  try {
    Settings.throwOnInvalid = true;
    expect(() => DateTime.fromFormat("|", "d", { numberingSystem: "hanidec" })).toThrow(
      'the input "|" can\'t be parsed as format d'
    );
  } finally {
    Settings.throwOnInvalid = false;
  }
});
