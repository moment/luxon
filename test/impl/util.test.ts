import { isLeapYear, padStart } from "../../src/impl/util";

test("padStart works with different padding other than default", () => {
  expect(padStart(123, 10)).toBe("0000000123");
});

test("isLeapYear works for years multiple of 400", () => {
  expect(isLeapYear(2000)).toBeTruthy();
});
