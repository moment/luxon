/* global test expect */

import { DateTime, Settings } from "../../src/luxon";
import { InvalidZoneError } from "../../src/errors";

var Helpers = require("../helpers");

const millis = 391147200000,
  // 1982-05-25T04:00:00.000Z
  dt = () => DateTime.fromMillis(millis);

//------
// defaults
//------
test("setZone defaults to system's time zone", () => {
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

//------
// #toDefaultZone()
//------
test("DateTime#toDefaultZone() sets the DateTime back to default zone", () => {
  const rezoned = dt()
      .toUTC()
      .toDefaultZone(),
    expected = new Date(millis).getHours();
  expect(rezoned.isOffsetFixed).toBe(false);
  expect(rezoned.valueOf()).toBe(millis);
  expect(rezoned.hour).toBe(expected);
});

test("DateTime#toDefaultZone() returns the default time zone", () => {
  Helpers.withDefaultZone("Asia/Tokyo", () => {
    const tokyoLocal = DateTime.local();
    expect(tokyoLocal.toDefaultZone().zoneName).toBe("Asia/Tokyo");
  });
});

//------
// #toSystemZone()
//------
test("DateTime#toSystemZone() sets the zone back to system zone", () => {
  const rezoned = dt()
      .toUTC()
      .toSystemZone(),
    expected = new Date(millis).getHours();
  expect(rezoned.isOffsetFixed).toBe(false);
  expect(rezoned.valueOf()).toBe(millis);
  expect(rezoned.hour).toBe(expected);
});

test("DateTime#toSystemZone() is independent of the default zone", () => {
  const localZoneName = DateTime.local().zoneName;
  Helpers.withDefaultZone("Asia/Tokyo", () => {
    const tokyoLocal = DateTime.local();
    Helpers.withDefaultZone("UTC", () =>
      expect(tokyoLocal.toSystemZone().zoneName).toBe(localZoneName)
    );
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

test("DateTime#setZone accepts 'system'", () => {
  const zoned = DateTime.utc().setZone("system");
  expect(zoned.offset).toBe(DateTime.local().offset);
});

test("DateTime#setZone accepts 'system' and ignores the default zone", () => {
  const localZoneName = DateTime.local().zoneName;
  Helpers.withDefaultZone("Europe/Paris", () => {
    expect(DateTime.utc().setZone("system").zoneName).toBe(localZoneName);
  });
});

test("DateTime#setZone accepts 'default'", () => {
  const zoned = DateTime.utc().setZone("default");
  expect(zoned.offset).toBe(DateTime.local().offset);
});

test("DateTime#setZone accepts 'default' and uses the default zone", () => {
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
  expect(() => DateTime.local().setZone("utc-yo")).toThrow(InvalidZoneError);
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
  expect(() => dt().setZone("blorp")).toThrow(InvalidZoneError);
});

// #650
test("DateTime#setZone works for dates before 1970 with milliseconds", () => {
  const offset = DateTime.fromJSDate(new Date("1967-01-01T00:00:00.001Z")).setZone(
    "America/New_York"
  ).offset;
  expect(offset).toBe(-300);
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
// default zone
//------

test("The local zone does local stuff", () => {
  if (DateTime.local().zoneName === "America/New_York") {
    expect(DateTime.local(2016, 8, 6).offsetNameLong).toBe("Eastern Daylight Time");
    expect(DateTime.local(2016, 8, 6).offsetNameShort).toBe("EDT");
  }
});

test("Setting the default zone results in a different creation zone", () => {
  Helpers.withDefaultZone("Asia/Tokyo", () => {
    expect(DateTime.local().zoneName).toBe("Asia/Tokyo");
    expect(DateTime.fromObject({}).zoneName).toBe("Asia/Tokyo");
  });
});

test("Setting the default zone to undefined gives you back a system zone", () => {
  const sysZone = Settings.defaultZone.name;
  Helpers.withDefaultZone("Asia/Tokyo", () => {
    Settings.defaultZone = undefined;
    expect(DateTime.local().zoneName).toBe(sysZone);
  });
});

test("Setting the default zone to null gives you back a system zone", () => {
  const sysZone = Settings.defaultZone.name;
  Helpers.withDefaultZone("Asia/Tokyo", () => {
    Settings.defaultZone = null;
    expect(DateTime.local().zoneName).toBe(sysZone);
  });
});

test("Setting the default zone to 'default' gives you back the default zone", () => {
  const defaultZone = Settings.defaultZone.name;
  Helpers.withDefaultZone("Asia/Tokyo", () => {
    Settings.defaultZone = "default";
    expect(DateTime.local().zoneName).toBe(defaultZone);
  });
});

test("Setting the default zone to 'system' gives you back a system zone", () => {
  const sysZone = Settings.defaultZone.name;
  Helpers.withDefaultZone("Asia/Tokyo", () => {
    Settings.defaultZone = "system";
    expect(DateTime.local().zoneName).toBe(sysZone);
  });
});
