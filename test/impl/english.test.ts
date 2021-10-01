/* global test expect */

import { formatRelativeTime, formatString } from "../../src/impl/english";
import * as Formats from "../../src/impl/formats";

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

test("formatRelativeTime numeric defaults to always", () => {
  expect(formatRelativeTime("days", 1)).toBe("in 1 day");
  expect(formatRelativeTime("days", -1)).toBe("1 day ago");
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
  // @ts-expect-error test
  expect(formatString({ gibberish: true })).toBe("EEEE, LLLL d, yyyy, h:mm a");
});
