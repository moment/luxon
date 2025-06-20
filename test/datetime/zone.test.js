/* global test expect */

import { DateTime, Settings, IANAZone } from "../../src/luxon";
import { INVALID_ZONE_NAME, InvalidDurationError, InvalidZoneError } from "../../src/errors";
import { normalizeZone } from "../../src/impl/zoneUtil";

var Helpers = require("../helpers");

const millis = 391147200000,
  // 1982-05-25T04:00:00.000Z
  dt = () => DateTime.fromMillis(millis);

//------
// defaults
//------
test("setZone defaults to local", () => {
  expect(dt().isOffsetFixed).toBe(false);
});

//------
// #toUTC()
//------
test("DateTime#utc() puts the dt in UTC 'mode'", () => {
  const zoned = dt().toUTC();
  expect(zoned.valueOf()).toBe(millis);
  expect(zoned.hour).toBe(4);
  expect(zoned.zoneName).toBe("UTC");
  expect(zoned.isOffsetFixed).toBe(true);
  expect(zoned.isInDST).toBe(false);
});

test("DateTime#utc(offset) sets dt in UTC+offset 'mode'", () => {
  const zoned = dt().toUTC(5 * 60);
  expect(zoned.valueOf()).toBe(millis);
  expect(zoned.hour).toBe(9);
  expect(zoned.zoneName).toBe("UTC+5");
  expect(zoned.isOffsetFixed).toBe(true);
  expect(zoned.isInDST).toBe(false);
});

test("DateTime#utc maintains invalidity", () => {
  expect(DateTime.invalid("because").toUTC().isValid).toBe(false);
});

//------
// #toLocal()
//------
test("DateTime#toLocal() sets the calendar back to local", () => {
  const relocaled = dt().toUTC().toLocal(),
    expected = new Date(millis).getHours();
  expect(relocaled.isOffsetFixed).toBe(false);
  expect(relocaled.valueOf()).toBe(millis);
  expect(relocaled.hour).toBe(expected);
});

test("DateTime#toLocal() accepts the default locale", () => {
  Helpers.withDefaultZone("Asia/Tokyo", () => {
    const tokyoLocal = DateTime.local();
    Helpers.withDefaultZone("UTC", () => expect(tokyoLocal.toLocal().zoneName).toBe("UTC"));
  });
});

//------
// #setZone()
//------
test("DateTime#setZone setZone sets the TZ to the specified zone", () => {
  const zoned = dt().setZone("America/Los_Angeles");

  expect(zoned.zoneName).toBe("America/Los_Angeles");
  expect(zoned.isOffsetFixed).toBe(false);
  expect(zoned.valueOf()).toBe(millis);
  expect(zoned.day).toBe(24);
  expect(zoned.hour).toBe(21);
  // pacific daylight time
  expect(zoned.isInDST).toBe(true);
});

test('DateTime#setZone accepts "system"', () => {
  const zoned = DateTime.utc().setZone("system");
  expect(zoned.offset).toBe(DateTime.local().offset);
});

test('DateTime#setZone accepts "local"', () => {
  const zoned = DateTime.utc().setZone("local");
  expect(zoned.offset).toBe(DateTime.local().offset);
});

test('DateTime#setZone accepts "system" and uses the system zone', () => {
  const systemZone = Settings.defaultZone.name;
  expect(DateTime.utc().setZone("system").zoneName).toBe(systemZone);
});

test('DateTime#setZone accepts "default" and uses the default zone', () => {
  Helpers.withDefaultZone("Europe/Paris", () => {
    expect(DateTime.utc().setZone("default").zoneName).toBe("Europe/Paris");
  });
});

test('DateTime#setZone accepts "utc"', () => {
  const zoned = DateTime.local().setZone("utc");
  expect(zoned.offset).toBe(0);
  expect(zoned.offsetNameShort).toBe("UTC");
  expect(zoned.offsetNameLong).toBe("UTC");
});

test('DateTime#setZone accepts "gmt"', () => {
  const zoned = DateTime.local().setZone("gmt");
  expect(zoned.offset).toBe(0);
  expect(zoned.offsetNameShort).toBe("UTC");
  expect(zoned.offsetNameLong).toBe("UTC");
});

test('DateTime#setZone accepts "utc+3"', () => {
  const zoned = DateTime.local().setZone("utc+3");
  expect(zoned.zone.name).toBe("UTC+3");
  expect(zoned.offset).toBe(3 * 60);
  expect(zoned.offsetNameShort).toBe("UTC+3");
  expect(zoned.offsetNameLong).toBe("UTC+3");
});

test('DateTime#setZone accepts "utc-3"', () => {
  const zoned = DateTime.local().setZone("utc-3");
  expect(zoned.zone.name).toBe("UTC-3");
  expect(zoned.offset).toBe(-3 * 60);
  expect(zoned.offsetNameShort).toBe("UTC-3");
  expect(zoned.offsetNameLong).toBe("UTC-3");
});

test('DateTime#setZone accepts "utc-3:30"', () => {
  const zoned = DateTime.local().setZone("utc-3:30");
  expect(zoned.zone.name).toBe("UTC-3:30");
  expect(zoned.offset).toBe(-3 * 60 - 30);
  expect(zoned.offsetNameShort).toBe("UTC-3:30");
  expect(zoned.offsetNameLong).toBe("UTC-3:30");
});

test("DateTime#setZone does not accept dumb things", () => {
  Helpers.withDefaultZone("system", () => {
    const zoned = DateTime.local().setZone("utc-yo");
    // this is questionable; should this be invalid instead?
    expect(zoned.zone.type).toBe("system");
  });
});

test("DateTime#setZone accepts IANA zone names", () => {
  const zoned = dt().setZone("Europe/Paris");
  expect(zoned.zoneName).toBe("Europe/Paris");
  // not convinced this is universal. Could also be 'CEDT'
  expect(zoned.offsetNameShort).toBe("GMT+2");
  expect(zoned.offsetNameLong).toBe("Central European Summer Time");
  expect(zoned.valueOf()).toBe(millis);
  expect(zoned.hour).toBe(6); // cedt is +2
});

test.each([
  ["PST8PDT", -7], // my date is in daylight time
  ["EST5EDT", -4],
  ["GMT+0", 0],
  ["GMT0", 0],
])("DateTime#setZone accepts whacky zone %p", (iana, offset) => {
  const zoned = dt().setZone(iana);
  expect(zoned.isValid).toBe(true);
  expect(zoned.zoneName).toBe(iana);
  expect(zoned.offset).toBe(offset * 60);
});

test("DateTime#setZone accepts a keepLocalTime option", () => {
  const zoned = dt().toUTC().setZone("America/Los_Angeles", { keepLocalTime: true });
  expect(zoned.zoneName).toBe("America/Los_Angeles");
  expect(zoned.year).toBe(1982);
  expect(zoned.month).toBe(5);
  expect(zoned.day).toBe(25);
  expect(zoned.hour).toBe(4);
  expect(zoned.isOffsetFixed).toBe(false);

  const zonedMore = zoned.setZone("America/New_York", {
    keepLocalTime: true,
  });
  expect(zonedMore.zoneName).toBe("America/New_York");
  expect(zonedMore.year).toBe(1982);
  expect(zonedMore.month).toBe(5);
  expect(zonedMore.day).toBe(25);
  expect(zonedMore.hour).toBe(4);
  expect(zonedMore.isOffsetFixed).toBe(false);
});

test("DateTime#setZone with keepLocalTime can span wacky offsets", () => {
  const d = DateTime.fromISO("0001-01-01", { zone: "UTC" });
  const d2 = d.setZone("America/Curacao", { keepLocalTime: true });
  expect(d2.year).toBe(1);
  expect(d2.month).toBe(1);
  expect(d2.day).toBe(1);
  expect(d2.hour).toBe(0);
});

test("DateTime#setZone with keepLocalTime handles zones with very different offsets than the current one", () => {
  const local = DateTime.local(2016, 10, 30, 2, 59);
  const zoned = local.setZone("Europe/Athens", { keepLocalTime: true });
  expect(zoned.hour).toBe(2);
});

test("DateTime#setZone rejects jibberish", () => {
  const d = dt();
  expect(() => d.setZone("blorp")).toThrowLuxonError(InvalidZoneError, INVALID_ZONE_NAME);
});

// #650
test("DateTime#setZone works for dates before 1970 with milliseconds", () => {
  const offset = DateTime.fromJSDate(new Date("1967-01-01T00:00:00.001Z")).setZone(
    "America/New_York"
  ).offset;
  expect(offset).toBe(-300);
});

// # 1179
test("DateTime#setZone handles negative years", () => {
  const dt = DateTime.fromMillis(-84753824400000).setZone("Europe/Rome");
  expect(dt.year).toBe(-716);
  expect(dt.offset < 60).toBe(true);
});

//------
// #isInDST()
//------
test("DateTime#isInDST() returns false for pre-DST times", () => {
  const zoned = dt().setZone("America/Los_Angeles");
  expect(zoned.set({ month: 1 }).isInDST).toBe(false);
});

test("DateTime#isInDST() returns true for during-DST times", () => {
  const zoned = dt().setZone("America/Los_Angeles");
  expect(zoned.set({ month: 5 }).isInDST).toBe(true);
});

test("DateTime#isInDST() returns false for post-DST times", () => {
  const zoned = dt().setZone("America/Los_Angeles");
  expect(zoned.set({ month: 12 }).isInDST).toBe(false);
});

test("DateTime#isInDST() returns true for 1974 whole year in USA- from January 6th to October 27th", () => {
  const zoned = dt().setZone("America/Los_Angeles");
  expect(zoned.set({ year: 1974, month: 1, day: 6 }).isInDST).toBe(true);
  expect(zoned.set({ year: 1974, month: 10, day: 27 }).isInDST).toBe(false);
});

//------
// #getPossibleOffsets()
//------
test("DateTime#getPossibleOffsets() returns the same DateTime for fixed zones", () => {
  const fixedZoned = dt().setZone("UTC+02:00");
  const possibleOffsets = fixedZoned.getPossibleOffsets();
  expect(possibleOffsets).toHaveLength(1);
  expect(possibleOffsets[0]).toBe(fixedZoned);
});

test("DateTime#getPossibleOffsets() returns the same DateTime when not at an ambiguous local time", () => {
  const zoned = DateTime.fromISO("2023-01-01T15:00", { zone: "Europe/Berlin" });
  const possibleOffsets = zoned.getPossibleOffsets();
  expect(possibleOffsets).toHaveLength(1);
  expect(possibleOffsets[0]).toBe(zoned);
});

test("DateTime#getPossibleOffsets() returns the possible DateTimes when at an ambiguous local time", () => {
  const zoned = DateTime.fromISO("2023-10-29T02:30:00+01:00", { zone: "Europe/Berlin" });
  const possibleOffsets = zoned.getPossibleOffsets();
  expect(possibleOffsets).toHaveLength(2);
  expect(possibleOffsets[0].toISO()).toBe("2023-10-29T02:30:00.000+02:00");
  expect(possibleOffsets[1].toISO()).toBe("2023-10-29T02:30:00.000+01:00");
});

//------
// #invalid
//------

// these functions got tested in the individual zones, but let's do invalid DateTimes

test("DateTime#offset returns NaN for invalid times", () => {
  const zoned = DateTime.invalid("because");
  expect(zoned.isInDST).toBeFalsy();
});

test("DateTime#offsetNameLong returns null for invalid times", () => {
  const zoned = DateTime.invalid("because");
  expect(zoned.offsetNameLong).toBe(null);
});

test("DateTime#offsetNameShort returns null for invalid times", () => {
  const zoned = DateTime.invalid("because");
  expect(zoned.offsetNameShort).toBe(null);
});

//------
// Etc/GMT zones
//------
test.each([
  ["Etc/GMT+8", -8],
  ["Etc/GMT-5", 5],
  ["Etc/GMT", 0],
  ["Etc/GMT-0", 0],
  ["Etc/GMT", 0],
])("Etc/GMTx zones now work natively", (zone, expectedOffset) => {
  let zoned = dt().setZone(zone);
  expect(zoned.isValid).toBe(true);
  expect(zoned.offset).toEqual(expectedOffset * 60);
});

//------
// local zone
//------

test("The local zone does local stuff", () => {
  expect(DateTime.local(2016, 8, 6).offsetNameLong).toBe("Eastern Daylight Time");
  expect(DateTime.local(2016, 8, 6).offsetNameShort).toBe("EDT");
});

//------
// default zone
//------

test("Setting the default zone results in a different creation zone", () => {
  Helpers.withDefaultZone("Asia/Tokyo", () => {
    expect(DateTime.local().zoneName).toBe("Asia/Tokyo");
    expect(DateTime.fromObject({}).zoneName).toBe("Asia/Tokyo");
  });
});

test("Setting the default zone to 'system' gives you back the system zone", () => {
  const systemZone = Settings.defaultZone.name;
  Helpers.withDefaultZone("Asia/Tokyo", () => {
    Settings.defaultZone = "system";
    expect(DateTime.local().zoneName).toBe(systemZone);
  });
});

//------
// invalid
//------

test("invalid DateTimes have no zone", () => {
  expect(DateTime.invalid("because").zoneName).toBe(null);
});

test("can parse zones with special JS keywords as invalid", () => {
  for (const kw of ["constructor", "__proto__"]) {
    expect(() => DateTime.fromISO(`2020-01-01T11:22:33+01:00[${kw}]`)).toThrowLuxonError(
      InvalidZoneError,
      INVALID_ZONE_NAME
    );
  }
});

test("Special JS keywords make Zone throw", () => {
  for (const kw of ["constructor", "__proto__"]) {
    expect(() => IANAZone.create(kw)).toThrowLuxonError(InvalidZoneError, INVALID_ZONE_NAME);
  }
});

test("Special JS keywords make normalizeZone", () => {
  for (const kw of ["constructor", "__proto__"]) {
    expect(() => normalizeZone(kw)).toThrowLuxonError(InvalidZoneError, INVALID_ZONE_NAME);
  }
});
