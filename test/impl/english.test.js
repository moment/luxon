/* global test expect */

import { formatRelativeTime } from "../../src/impl/english";

test("today", () => {
  expect(formatRelativeTime("days", 0)).toBe("today");
  expect(formatRelativeTime("days", 0, true)).toBe("in 0 days");
  expect(formatRelativeTime("days", -0, true)).toBe("0 days ago");
});

test("tomorrow", () => {
  expect(formatRelativeTime("days", 1)).toBe("tomorrow");
  expect(formatRelativeTime("days", 1, true)).toBe("in 1 day");
});

test("yesterday", () => {
  expect(formatRelativeTime("days", -1)).toBe("yesterday");
  expect(formatRelativeTime("days", -1, true)).toBe("1 day ago");
});

test("in 0.5 days", () => {
  expect(formatRelativeTime("days", 1.5, true)).toBe("in 1.5 days");
  expect(formatRelativeTime("days", 1.5, false)).toBe("in 1.5 days");
});

test("0.5 days ago", () => {
  expect(formatRelativeTime("days", -1.5)).toBe("1.5 days ago");
  expect(formatRelativeTime("days", -1.5, true)).toBe("1.5 days ago");
});

test("2 days ago", () => {
  expect(formatRelativeTime("days", -2)).toBe("2 days ago");
  expect(formatRelativeTime("days", -2, true)).toBe("2 days ago");
});

test("this month", () => {
  expect(formatRelativeTime("months", 0)).toBe("this month");
  expect(formatRelativeTime("months", 0, true)).toBe("in 0 months");
  expect(formatRelativeTime("months", -0, true)).toBe("0 months ago");
  expect(formatRelativeTime("months", 0, true, true)).toBe("in 0 mo.");
  expect(formatRelativeTime("months", -0, true, true)).toBe("0 mo. ago");
});

test("next month", () => {
  expect(formatRelativeTime("months", 1)).toBe("next month");
  expect(formatRelativeTime("months", 1, false, true)).toBe("next month");
  expect(formatRelativeTime("months", 1, true)).toBe("in 1 month");
  expect(formatRelativeTime("months", 1, true, true)).toBe("in 1 mo.");
});

test("last month", () => {
  expect(formatRelativeTime("months", -1)).toBe("last month");
  expect(formatRelativeTime("months", -1, false, true)).toBe("last month");
  expect(formatRelativeTime("months", -1, true)).toBe("1 month ago");
  expect(formatRelativeTime("months", -1, true, true)).toBe("1 mo. ago");
});

test("in 3 months", () => {
  expect(formatRelativeTime("months", 3)).toBe("in 3 months");
  expect(formatRelativeTime("months", 3, false, true)).toBe("in 3 mo.");
  expect(formatRelativeTime("months", 3, true)).toBe("in 3 months");
  expect(formatRelativeTime("months", 3, true, true)).toBe("in 3 mo.");
});

test("in 1 hour", () => {
  expect(formatRelativeTime("hours", 1)).toBe("in 1 hour");
  expect(formatRelativeTime("hours", 1, true)).toBe("in 1 hour");
});

test("in 1 hour", () => {
  expect(formatRelativeTime("hours", 1)).toBe("in 1 hour");
  expect(formatRelativeTime("hours", 1, false, true)).toBe("in 1 hr.");
  expect(formatRelativeTime("hours", 1, true)).toBe("in 1 hour");
  expect(formatRelativeTime("hours", 1, true, true)).toBe("in 1 hr.");
});

test("1 hour ago", () => {
  expect(formatRelativeTime("hours", -1)).toBe("1 hour ago");
  expect(formatRelativeTime("hours", -1, false, true)).toBe("1 hr. ago");
  expect(formatRelativeTime("hours", -1, true)).toBe("1 hour ago");
  expect(formatRelativeTime("hours", -1, true, true)).toBe("1 hr. ago");
});
