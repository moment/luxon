import DateTime from "../../src/datetime";

const Helpers = require("../helpers");

/* global expect test */

//------
// #toRelative()
//-------

test("DateTime#toRelative works down through the units", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14 });
  expect(base.plus({ minutes: 1 }).toRelative({ base })).toBe("in 1 minute");
  expect(base.plus({ minutes: 5 }).toRelative({ base })).toBe("in 5 minutes");
  expect(base.plus({ minutes: 65 }).toRelative({ base })).toBe("in 1 hour");
  expect(base.plus({ minutes: 165 }).toRelative({ base })).toBe("in 2 hours");
  expect(base.plus({ hours: 24 }).toRelative({ base })).toBe("in 1 day");
  expect(base.plus({ days: 3 }).toRelative({ base })).toBe("in 3 days");
  expect(base.plus({ months: 5 }).toRelative({ base })).toBe("in 5 months");
  expect(base.plus({ months: 15 }).toRelative({ base })).toBe("in 1 year");

  expect(base.minus({ minutes: 1 }).toRelative({ base })).toBe("1 minute ago");
  expect(base.minus({ minutes: 5 }).toRelative({ base })).toBe("5 minutes ago");
  expect(base.minus({ minutes: 65 }).toRelative({ base })).toBe("1 hour ago");
  expect(base.minus({ minutes: 165 }).toRelative({ base })).toBe("2 hours ago");
  expect(base.minus({ hours: 24 }).toRelative({ base })).toBe("1 day ago");
  expect(base.minus({ days: 3 }).toRelative({ base })).toBe("3 days ago");
  expect(base.minus({ months: 5 }).toRelative({ base })).toBe("5 months ago");
  expect(base.minus({ months: 15 }).toRelative({ base })).toBe("1 year ago");
});

test("DateTime#toRelative allows padding", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14 });
  expect(base.endOf("day").toRelative({ base, padding: 10 })).toBe("in 1 day");
  expect(base.minus({ days: 1, milliseconds: -1 }).toRelative({ base, padding: 10 })).toBe(
    "1 day ago"
  );
  expect(base.plus({ minutes: 1, seconds: 30 }).toRelative({ base, padding: 30000 })).toBe(
    "in 2 minutes"
  );
  expect(base.plus({ seconds: 29 }).toRelative({ base, padding: 30000 })).toBe("in 29 seconds");
});

test("DateTime#toRelative takes a round argument", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14 });
  expect(base.plus({ months: 15 }).toRelative({ base, round: false })).toBe("in 1.25 years");
  expect(base.minus({ months: 15 }).toRelative({ base, round: false })).toBe("1.25 years ago");
});

test("DateTime#toRelative takes a unit argument", () => {
  const base = DateTime.fromObject({ year: 2018, month: 10, day: 14 }, { zone: "UTC" });
  expect(base.plus({ months: 15 }).toRelative({ base, unit: "months" })).toBe("in 15 months");
  expect(base.minus({ months: 15 }).toRelative({ base, unit: "months" })).toBe("15 months ago");
  expect(base.plus({ months: 3 }).toRelative({ base, unit: "years", round: false })).toBe(
    "in 0.25 years"
  );
  expect(base.minus({ months: 3 }).toRelative({ base, unit: "years", round: false })).toBe(
    "0.25 years ago"
  );
  expect(base.minus({ seconds: 30 }).toRelative({ base, unit: ["days", "hours", "minutes"] })).toBe(
    "0 minutes ago"
  );
  expect(base.minus({ seconds: 1 }).toRelative({ base, unit: "minutes" })).toBe("0 minutes ago");
  expect(base.plus({ seconds: 1 }).toRelative({ base, unit: "minutes" })).toBe("in 0 minutes");
  expect(
    base.plus({ seconds: 30 }).toRelative({
      base,
      unit: ["days", "hours", "minutes"],
    })
  ).toBe("in 0 minutes");
  expect(
    base.plus({ years: 2 }).toRelative({
      base,
      unit: ["days", "hours", "minutes"],
    })
  ).toBe("in 731 days");
});

test("DateTime#toRelative always rounds toward 0", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14 });
  expect(base.endOf("day").toRelative({ base })).toBe("in 23 hours");
  expect(base.minus({ days: 1, milliseconds: -1 }).toRelative({ base })).toBe("23 hours ago");
});

test("DateTime#toRelative uses the absolute time", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14, hour: 23, minute: 59 });
  const end = DateTime.fromObject({ year: 1983, month: 10, day: 15, hour: 0, minute: 3 });
  expect(end.toRelative({ base })).toBe("in 4 minutes");
  expect(base.toRelative({ base: end })).toBe("4 minutes ago");
});

Helpers.withoutRTF("DateTime#toRelative works without RTF", () => {
  const base = DateTime.fromObject({ year: 2019, month: 12, day: 25 });

  expect(base.plus({ months: 1 }).toRelative({ base })).toBe("in 1 month");
  expect(base.plus({ months: 1 }).toRelative({ base, style: "narrow" })).toBe("in 1 mo.");
  expect(base.plus({ months: 1 }).toRelative({ base, unit: "days" })).toBe("in 31 days");
  expect(base.plus({ months: 1 }).toRelative({ base, style: "short", unit: "days" })).toBe(
    "in 31 days"
  );
  expect(base.plus({ months: 1, days: 2 }).toRelative({ base, round: false })).toBe(
    "in 1.06 months"
  );
});

Helpers.withoutRTF("DateTime#toRelative falls back to English", () => {
  const base = DateTime.fromObject({ year: 2019, month: 12, day: 25 });
  expect(base.setLocale("fr").plus({ months: 1 }).toRelative({ base })).toBe("in 1 month");
});

test("DateTime#toRelative returns null when used on an invalid date", () => {
  expect(DateTime.invalid("not valid").toRelative()).toBe(null);
});

//------
// #toRelativeCalendar()
//-------

test("DateTime#toRelativeCalendar uses the calendar", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14, hour: 23, minute: 59 });
  const end = DateTime.fromObject({ year: 1983, month: 10, day: 15, hour: 0, minute: 3 });
  expect(end.toRelativeCalendar({ base })).toBe("tomorrow");
});

test("DateTime#toRelativeCalendar picks the correct unit with no options", () => {
  const now = DateTime.now();
  const isLastDayOfMonth = now.endOf("month").day === now.day;
  expect(now.plus({ days: 1 }).toRelativeCalendar()).toBe(
    isLastDayOfMonth ? "next month" : "tomorrow"
  );
});

test("DateTime#toRelativeCalendar returns null when used on an invalid date", () => {
  expect(DateTime.invalid("not valid").toRelativeCalendar()).toBe(null);
});

test("DateTime#toRelativeCalendar works down through the units", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14, hour: 12 });
  expect(base.plus({ minutes: 1 }).toRelativeCalendar({ base })).toBe("today");
  expect(base.plus({ minutes: 5 }).toRelativeCalendar({ base })).toBe("today");
  expect(base.plus({ minutes: 65 }).toRelativeCalendar({ base })).toBe("today");
  expect(base.plus({ hours: 13 }).toRelativeCalendar({ base })).toBe("tomorrow");
  expect(base.plus({ days: 3 }).toRelativeCalendar({ base })).toBe("in 3 days");
  expect(base.plus({ months: 1 }).toRelativeCalendar({ base })).toBe("next month");
  expect(base.plus({ months: 5 }).toRelativeCalendar({ base })).toBe("next year");
  expect(base.plus({ months: 15 }).toRelativeCalendar({ base })).toBe("in 2 years");

  expect(base.minus({ minutes: 1 }).toRelativeCalendar({ base })).toBe("today");
  expect(base.minus({ minutes: 5 }).toRelativeCalendar({ base })).toBe("today");
  expect(base.minus({ minutes: 65 }).toRelativeCalendar({ base })).toBe("today");
  expect(base.minus({ hours: 24 }).toRelativeCalendar({ base })).toBe("yesterday");
  expect(base.minus({ days: 3 }).toRelativeCalendar({ base })).toBe("3 days ago");
  expect(base.minus({ months: 1 }).toRelativeCalendar({ base })).toBe("last month");
  expect(base.minus({ months: 5 }).toRelativeCalendar({ base })).toBe("5 months ago");
  expect(base.minus({ months: 15 }).toRelativeCalendar({ base })).toBe("last year");
});

test("DateTime#toRelativeCalendar takes a unit argument", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14, hour: 12 }),
    target = base.plus({ months: 3 });
  expect(target.toRelativeCalendar({ base, unit: "months" })).toBe("in 3 months");
});

Helpers.withoutRTF("DateTime#toRelativeCalendar works without RTF", () => {
  const base = DateTime.fromObject({ year: 2019, month: 10, day: 25 });
  expect(base.plus({ months: 1 }).toRelativeCalendar({ base })).toBe("next month");
});

Helpers.withoutRTF("DateTime#toRelativeCalendar falls back to English", () => {
  const base = DateTime.fromObject({ year: 2019, month: 12, day: 25 });
  expect(base.setLocale("fr").plus({ months: 1 }).toRelativeCalendar({ base })).toBe("next year");
});

test("DateTime#toRelativeCalendar works down through the units for different zone than local", () => {
  const target = DateTime.now().setZone(`UTC+3`),
    target1 = target.plus({ days: 1 }),
    target2 = target1.plus({ days: 1 }),
    target3 = target2.plus({ days: 1 }),
    options = { unit: "days" };

  expect(target.toRelativeCalendar(options)).toBe("today");
  expect(target1.toRelativeCalendar(options)).toBe("tomorrow");
  expect(target2.toRelativeCalendar(options)).toBe("in 2 days");
  expect(target3.toRelativeCalendar(options)).toBe("in 3 days");
});

test("DateTime#toRelative works down through the units for different zone than local", () => {
  const base = DateTime.now().setZone(`UTC+3`);

  expect(base.plus({ minutes: 65 }).toRelative()).toBe("in 1 hour");
  expect(base.plus({ minutes: 165 }).toRelative()).toBe("in 2 hours");
  expect(base.plus({ hours: 25 }).toRelative()).toBe("in 1 day");
  expect(base.plus({ months: 15 }).toRelative()).toBe("in 1 year");

  expect(base.minus({ minutes: 65 }).toRelative()).toBe("1 hour ago");
  expect(base.minus({ minutes: 165 }).toRelative()).toBe("2 hours ago");
  expect(base.minus({ hours: 25 }).toRelative()).toBe("1 day ago");
  expect(base.minus({ months: 15 }).toRelative()).toBe("1 year ago");
});
