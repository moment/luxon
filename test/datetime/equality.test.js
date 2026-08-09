/* global test expect */

import { DateTime } from "../../src/luxon";

test("equals self", () => {
  const l = DateTime.now();
  expect(l.equals(l)).toBe(true);
});

test("equals identically constructed", () => {
  const l1 = DateTime.local(2017, 5, 15),
    l2 = DateTime.local(2017, 5, 15);
  expect(l1.equals(l2)).toBe(true);
});

test("does not equal a different zone", () => {
  const l1 = DateTime.local(2017, 5, 15).setZone("America/New_York"),
    l2 = DateTime.local(2017, 5, 15).setZone("America/Los_Angeles");
  expect(l1.equals(l2)).toBe(false);
});

test("does not equal an invalid DateTime", () => {
  const l1 = DateTime.local(2017, 5, 15),
    l2 = DateTime.invalid("whatever");
  expect(l1.equals(l2)).toBe(false);
  expect(l1.equals(undefined)).toBe(false);
  expect(l1.equals(null)).toBe(false);
  expect(l1.equals({})).toBe(false);
  expect(l1.equals("abc")).toBe(false);
  expect(l1.equals(123)).toBe(false);
});

test("does not equal a different locale", () => {
  const l1 = DateTime.local(2017, 5, 15),
    l2 = DateTime.local(2017, 5, 15).setLocale("fr");
  expect(l1.equals(l2)).toBe(false);
});

test("does not equal a different numbering system", () => {
  const l1 = DateTime.local(2017, 5, 15),
    l2 = DateTime.local(2017, 5, 15).reconfigure({ numberingSystem: "beng" });
  expect(l1.equals(l2)).toBe(false);
});

test("does not equal a different output calendar", () => {
  const l1 = DateTime.local(2017, 5, 15),
    l2 = DateTime.local(2017, 5, 15).reconfigure({ outputCalendar: "islamic" });
  expect(l1.equals(l2)).toBe(false);
});
