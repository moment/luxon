import { Duration } from "../../src";
import { InvalidArgumentError, InvalidUnitError } from "../../src/errors";
import Helpers from "../helpers";

//------
// .fromObject()
//-------
test("Duration.fromObject sets all the values", () => {
  const dur = Duration.fromObject({
    years: 1,
    months: 2,
    days: 3,
    hours: 4,
    minutes: 5,
    seconds: 6,
    milliseconds: 7
  });
  expect(dur.years).toBe(1);
  expect(dur.months).toBe(2);
  expect(dur.days).toBe(3);
  expect(dur.hours).toBe(4);
  expect(dur.minutes).toBe(5);
  expect(dur.seconds).toBe(6);
  expect(dur.milliseconds).toBe(7);
});

test("Duration.fromObject sets all the values from the object having string type values", () => {
  const dur = Duration.fromObject({
    // @ts-ignore
    years: "1",
    // @ts-ignore
    months: "2",
    // @ts-ignore
    days: "3",
    // @ts-ignore
    hours: "4",
    // @ts-ignore
    minutes: "5",
    // @ts-ignore
    seconds: "6",
    // @ts-ignore
    milliseconds: "7"
  });
  expect(dur.years).toBe(1);
  expect(dur.months).toBe(2);
  expect(dur.days).toBe(3);
  expect(dur.hours).toBe(4);
  expect(dur.minutes).toBe(5);
  expect(dur.seconds).toBe(6);
  expect(dur.milliseconds).toBe(7);
});

test("Duration.fromObject accepts a conversionAccuracy", () => {
  const dur = Duration.fromObject({ days: 1 }, { conversionAccuracy: "longterm" });
  expect(Helpers.conversionAccuracy(dur)).toBe("longterm");
});

test("Duration.fromObject accepts locale settings", () => {
  const dur = Duration.fromObject({ days: 1 }, { locale: "fr", numberingSystem: "beng" });
  expect(dur.numberingSystem).toBe("beng");
  expect(dur.locale).toBe("fr");
});

test("Duration.fromObject throws if the argument is not an object", () => {
  // @ts-ignore
  expect(() => Duration.fromObject()).toThrow(InvalidArgumentError);
  // @ts-ignore
  expect(() => Duration.fromObject(null)).toThrow(InvalidArgumentError);
  // @ts-ignore
  expect(() => Duration.fromObject("foo")).toThrow(InvalidArgumentError);
});

test("Duration.fromObject({}) constructs zero duration", () => {
  const dur = Duration.fromObject({});
  expect(dur.years).toBe(0);
  expect(dur.months).toBe(0);
  expect(dur.days).toBe(0);
  expect(dur.hours).toBe(0);
  expect(dur.minutes).toBe(0);
  expect(dur.seconds).toBe(0);
  expect(dur.milliseconds).toBe(0);
});

test("Duration.fromObject throws if the initial object has invalid keys", () => {
  // @ts-ignore
  expect(() => Duration.fromObject({ foo: 0 })).toThrow(InvalidUnitError);
  // @ts-ignore
  expect(() => Duration.fromObject({ years: 1, foo: 0 })).toThrow(InvalidUnitError);
});

test("Duration.fromObject throws if the initial object has invalid values", () => {
  // @ts-ignore
  expect(() => Duration.fromObject({ years: {} })).toThrow(InvalidArgumentError);
  // @ts-ignore
  expect(() => Duration.fromObject({ months: "some" })).toThrow(InvalidArgumentError);
  expect(() => Duration.fromObject({ days: NaN })).toThrow(InvalidArgumentError);
  // @ts-ignore
  expect(() => Duration.fromObject({ hours: true })).toThrow(InvalidArgumentError);
  // @ts-ignore
  expect(() => Duration.fromObject({ minutes: false })).toThrow(InvalidArgumentError);
  // @ts-ignore
  expect(() => Duration.fromObject({ seconds: "" })).toThrow(InvalidArgumentError);
});

test("Duration.fromObject is valid if providing options only", () => {
  const dur = Duration.fromObject({}, { conversionAccuracy: "longterm" });
  expect(dur.years).toBe(0);
  expect(dur.months).toBe(0);
  expect(dur.days).toBe(0);
  expect(dur.hours).toBe(0);
  expect(dur.minutes).toBe(0);
  expect(dur.seconds).toBe(0);
  expect(dur.milliseconds).toBe(0);
});

test("Duration.fromObject returns null with nullOnInvalid option", () => {
  expect(Duration.fromObject(undefined, { nullOnInvalid: true })).toBe(null);
  expect(Duration.fromObject(null, { nullOnInvalid: true })).toBe(null);
  expect(Duration.fromObject("foo", { nullOnInvalid: true })).toBe(null);

  expect(Duration.fromObject({ invalidUnit: 42 }, { nullOnInvalid: true })).toBe(null);
  expect(Duration.fromObject({ years: {} }, { nullOnInvalid: true })).toBe(null);
  expect(Duration.fromObject({ months: "some" }, { nullOnInvalid: true })).toBe(null);
  expect(Duration.fromObject({ days: NaN }, { nullOnInvalid: true })).toBe(null);
  expect(Duration.fromObject({ hours: true }, { nullOnInvalid: true })).toBe(null);
  expect(Duration.fromObject({ minutes: false }, { nullOnInvalid: true })).toBe(null);
  expect(Duration.fromObject({ seconds: "" }, { nullOnInvalid: true })).toBe(null);
});
