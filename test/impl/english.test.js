/* global test expect */
import * as Formats from "../../src/impl/formats";
import {
  formatRelativeTime,
  formatString,
  months,
  monthsLong,
  monthsNarrow,
  monthsShort,
  weekdays,
  eras,
} from "../../src/impl/english";

test("today", () => {
  expect(formatRelativeTime("days", 0, "auto")).toBe("today");
  expect(formatRelativeTime("days", 0, "always")).toBe("in 0 days");
});

test("tomorrow", () => {
  expect(formatRelativeTime("days", 1, "auto")).toBe("tomorrow");
  expect(formatRelativeTime("days", 1, "always")).toBe("in 1 day");
});

test("yesterday", () => {
  expect(formatRelativeTime("days", -1, "auto")).toBe("yesterday");
  expect(formatRelativeTime("days", -1, "always")).toBe("1 day ago");
});

test("in 0.5 days", () => {
  expect(formatRelativeTime("days", 1.5, "auto")).toBe("in 1.5 days");
  expect(formatRelativeTime("days", 1.5, "always")).toBe("in 1.5 days");
});

test("0.5 days ago", () => {
  expect(formatRelativeTime("days", -1.5, "auto")).toBe("1.5 days ago");
  expect(formatRelativeTime("days", -1.5, "always")).toBe("1.5 days ago");
});

test("2 days ago", () => {
  expect(formatRelativeTime("days", -2, "auto")).toBe("2 days ago");
  expect(formatRelativeTime("days", -2, "always")).toBe("2 days ago");
});

test("this month", () => {
  expect(formatRelativeTime("months", 0, "auto")).toBe("this month");
  expect(formatRelativeTime("months", 0, "always")).toBe("in 0 months");
  expect(formatRelativeTime("months", -0, "always")).toBe("0 months ago");
  expect(formatRelativeTime("months", 0, "always", true)).toBe("in 0 mo.");
  expect(formatRelativeTime("months", -0, "always", true)).toBe("0 mo. ago");
});

test("next month", () => {
  expect(formatRelativeTime("months", 1, "auto")).toBe("next month");
  expect(formatRelativeTime("months", 1, "auto", true)).toBe("next month");
  expect(formatRelativeTime("months", 1, "always")).toBe("in 1 month");
  expect(formatRelativeTime("months", 1, "always", true)).toBe("in 1 mo.");
});

test("last month", () => {
  expect(formatRelativeTime("months", -1, "auto")).toBe("last month");
  expect(formatRelativeTime("months", -1, "auto", true)).toBe("last month");
  expect(formatRelativeTime("months", -1, "always")).toBe("1 month ago");
  expect(formatRelativeTime("months", -1, "always", true)).toBe("1 mo. ago");
});

test("in 3 months", () => {
  expect(formatRelativeTime("months", 3, "auto")).toBe("in 3 months");
  expect(formatRelativeTime("months", 3, "auto", true)).toBe("in 3 mo.");
  expect(formatRelativeTime("months", 3, "always")).toBe("in 3 months");
  expect(formatRelativeTime("months", 3, "always", true)).toBe("in 3 mo.");
});

test("in 1 hour", () => {
  expect(formatRelativeTime("hours", 1, "auto")).toBe("in 1 hour");
  expect(formatRelativeTime("hours", 1, "always")).toBe("in 1 hour");
});

test("in 1 hour", () => {
  expect(formatRelativeTime("hours", 1, "auto")).toBe("in 1 hour");
  expect(formatRelativeTime("hours", 1, "auto", true)).toBe("in 1 hr.");
  expect(formatRelativeTime("hours", 1, "always")).toBe("in 1 hour");
  expect(formatRelativeTime("hours", 1, "always", true)).toBe("in 1 hr.");
});

test("1 hour ago", () => {
  expect(formatRelativeTime("hours", -1, "auto")).toBe("1 hour ago");
  expect(formatRelativeTime("hours", -1, "auto", true)).toBe("1 hr. ago");
  expect(formatRelativeTime("hours", -1, "always")).toBe("1 hour ago");
  expect(formatRelativeTime("hours", -1, "always", true)).toBe("1 hr. ago");
});

test("months", () => {
  expect(months("narrow")).toStrictEqual([...monthsNarrow]);
  expect(months("short")).toStrictEqual([...monthsShort]);
  expect(months("long")).toStrictEqual([...monthsLong]);
  expect(months("numeric")).toStrictEqual([
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
  ]);
  expect(months("2-digit")).toStrictEqual([
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ]);
  expect(months("lets see default")).toBe(null);
});

test("formatString", () => {
  expect(formatString(Formats.DATE_SHORT)).toBe("M/d/yyyy");
  expect(formatString(Formats.DATE_MED)).toBe("LLL d, yyyy");
  expect(formatString(Formats.DATE_MED_WITH_WEEKDAY)).toBe("EEE, LLL d, yyyy");
  expect(formatString(Formats.DATE_FULL)).toBe("LLLL d, yyyy");
  expect(formatString(Formats.DATE_HUGE)).toBe("EEEE, LLLL d, yyyy");
  expect(formatString(Formats.TIME_SIMPLE)).toBe("h:mm a");
  expect(formatString(Formats.TIME_WITH_SECONDS)).toBe("h:mm:ss a");
  expect(formatString(Formats.TIME_WITH_SHORT_OFFSET)).toBe("h:mm a");
  expect(formatString(Formats.TIME_WITH_LONG_OFFSET)).toBe("h:mm a");
  expect(formatString(Formats.TIME_24_SIMPLE)).toBe("HH:mm");
  expect(formatString(Formats.TIME_24_WITH_SECONDS)).toBe("HH:mm:ss");
  expect(formatString(Formats.TIME_24_WITH_SHORT_OFFSET)).toBe("HH:mm");
  expect(formatString(Formats.TIME_24_WITH_LONG_OFFSET)).toBe("HH:mm");
  expect(formatString(Formats.DATETIME_SHORT)).toBe("M/d/yyyy, h:mm a");
  expect(formatString(Formats.DATETIME_MED)).toBe("LLL d, yyyy, h:mm a");
  expect(formatString(Formats.DATETIME_FULL)).toBe("LLLL d, yyyy, h:mm a");
  expect(formatString(Formats.DATETIME_HUGE)).toBe("EEEE, LLLL d, yyyy, h:mm a");
  expect(formatString(Formats.DATETIME_SHORT_WITH_SECONDS)).toBe("M/d/yyyy, h:mm:ss a");
  expect(formatString(Formats.DATETIME_MED_WITH_SECONDS)).toBe("LLL d, yyyy, h:mm:ss a");
  expect(formatString(Formats.DATETIME_MED_WITH_WEEKDAY)).toBe("EEE, d LLL yyyy, h:mm a");
  expect(formatString(Formats.DATETIME_FULL_WITH_SECONDS)).toBe("LLLL d, yyyy, h:mm:ss a");
  expect(formatString(Formats.DATETIME_HUGE_WITH_SECONDS)).toBe("EEEE, LLLL d, yyyy, h:mm:ss a");
  expect(formatString("Give Me Default?")).toBe("EEEE, LLLL d, yyyy, h:mm a");
});

test("weekdays", () => {
  expect(weekdays("narrow")).toStrictEqual(["M", "T", "W", "T", "F", "S", "S"]);
  expect(weekdays("short")).toStrictEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  expect(weekdays("long")).toStrictEqual([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]);
  expect(weekdays("numeric")).toStrictEqual(["1", "2", "3", "4", "5", "6", "7"]);
  expect(weekdays(null)).toStrictEqual(null);
});

test("eras", () => {
  expect(eras("narrow")).toStrictEqual(["B", "A"]);
  expect(eras("short")).toStrictEqual(["BC", "AD"]);
  expect(eras("long")).toStrictEqual(["Before Christ", "Anno Domini"]);
  expect(eras("default")).toStrictEqual(null);
});
