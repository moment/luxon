/* global test expect */

import { DateTime, Settings } from "../../src/luxon";
import { Helpers } from "../helpers";

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
  const relocaled = dt()
      .toUTC()
      .toLocal(),
    expected = new Date(millis).getHours();
  expect(relocaled.isOffsetFixed).toBe(false);
  expect(relocaled.valueOf()).toBe(millis);
  expect(relocaled.hour).toBe(expected);
});

test("DateTime#toLocal() accepts the default locale", () => {
  Helpers.withDefaultZone("Asia/Tokyo", () => {
    Settings.defaultZoneName = "UTC";
    expect(DateTime.local().toLocal().zoneName).toBe("UTC");
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

test('DateTime#setZone accepts "local"', () => {
  const zoned = DateTime.utc().setZone("local");
  expect(zoned.offset).toBe(DateTime.local().offset);
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
  Helpers.withDefaultZone("local", () => {
    const zoned = DateTime.local().setZone("utc-yo");
    // this is questionable; should this be invalid instead?
    expect(zoned.zone.type).toBe("local");
  });
});

test("DateTime#setZone accepts IANA zone names", () => {
  // this will only work in Chrome/V8 for now
  const zoned = dt().setZone("Europe/Paris");
  expect(zoned.zoneName).toBe("Europe/Paris");
  // not convinced this is universal. Could also be 'CEDT'
  expect(zoned.offsetNameShort).toBe("GMT+2");
  expect(zoned.offsetNameLong).toBe("Central European Summer Time");
  expect(zoned.valueOf()).toBe(millis);
  expect(zoned.hour).toBe(6); // cedt is +2
});

test("DateTime#setZone accepts a keepLocalTime option", () => {
  const zoned = dt()
    .toUTC()
    .setZone("America/Los_Angeles", { keepLocalTime: true });
  expect(zoned.zoneName).toBe("America/Los_Angeles");
  expect(zoned.year).toBe(1982);
  expect(zoned.month).toBe(5);
  expect(zoned.day).toBe(25);
  expect(zoned.hour).toBe(4);
  expect(zoned.isOffsetFixed).toBe(false);

  const zonedMore = zoned.setZone("America/New_York", {
    keepLocalTime: true
  });
  expect(zonedMore.zoneName).toBe("America/New_York");
  expect(zonedMore.year).toBe(1982);
  expect(zonedMore.month).toBe(5);
  expect(zonedMore.day).toBe(25);
  expect(zonedMore.hour).toBe(4);
  expect(zonedMore.isOffsetFixed).toBe(false);
});

test("DateTime#setZone rejects jibberish", () => {
  const zoned = dt().setZone("blorp");
  expect(zoned.isValid).toBe(false);
  expect(zoned.invalidReason).toBe("unsupported zone");
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
test("Etc/GMT zones work even though V8 does not support them", () => {
  let zoned = DateTime.local().setZone("Etc/GMT+8");
  expect(zoned.zoneName).toBe("UTC-8");
  zoned = DateTime.local().setZone("Etc/GMT-5");
  expect(zoned.zoneName).toBe("UTC+5");
  zoned = DateTime.local().setZone("Etc/GMT-0");
  expect(zoned.zoneName).toBe("UTC");
});

//------
// local zone
//------

test("The local zone does local stuff", () => {
  if (DateTime.local().zoneName === "America/New_York") {
    expect(DateTime.local(2016, 8, 6).offsetNameLong).toBe("Eastern Daylight Time");
    expect(DateTime.local(2016, 8, 6).offsetNameShort).toBe("EDT");
  }
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

test("Setting the default zone to 'local' gives you back a local zone", () => {
  const localZone = Settings.defaultZoneName;
  Helpers.withDefaultZone("Asia/Tokyo", () => {
    Settings.defaultZoneName = "local";
    expect(DateTime.local().zoneName).toBe(localZone);
  });
});

//------
// invalid
//------

test("invalid DateTimes have no zone", () => {
  expect(DateTime.invalid("because").zoneName).toBe(null);
});
