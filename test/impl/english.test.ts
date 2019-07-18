import { formatRelativeTime } from "../../src/impl/english";

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

test("in 1.5 days", () => {
  expect(formatRelativeTime("days", 1.5, "auto")).toBe("in 1.5 days");
  expect(formatRelativeTime("days", 1.5, "always")).toBe("in 1.5 days");
});

test("1.5 days ago", () => {
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

test("in 6 months", () => {
  expect(formatRelativeTime("quarters", 2, "auto")).toBe("in 2 quarters");
  expect(formatRelativeTime("quarters", 2, "auto", true)).toBe("in 2 qtr.");
  expect(formatRelativeTime("quarters", 2, "always")).toBe("in 2 quarters");
  expect(formatRelativeTime("quarters", 2, "always", true)).toBe("in 2 qtr.");
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

test("with singular units", () => {
  expect(formatRelativeTime("hour", 1, "auto")).toBe("in 1 hour");
  expect(formatRelativeTime("hour", 3, "always")).toBe("in 3 hours");
  expect(formatRelativeTime("day", 1, "auto")).toBe("tomorrow");
  expect(formatRelativeTime("month", 3, "auto")).toBe("in 3 months");
});
