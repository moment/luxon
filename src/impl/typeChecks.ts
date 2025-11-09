import type { DateTimeWithZoneOptions } from "../datetime.ts";
import { isDate } from "./util.ts";
import { LuxonTypeError } from "../errors.ts";

export function checkIntlDtfOptions(value: unknown) {
  if (value == null || typeof value !== "object")
    throw new TypeError(`Intl.DateTimeFormatOptions was required, but received ${value}.`);
}

export function checkValidDate(value: unknown, arg: string) {
  if (!isDate(value) || !isFinite(+value)) {
    throw new TypeError(`${arg} must be a valid Date, but received ${value}.`);
  }
}

export function checkString(value: unknown, arg: string): asserts value is string {
  if (typeof value !== "string") {
    throw new TypeError(`${arg} must be a string, but received ${value}.`);
  }
}

export function checkObject(value: unknown, arg: string): asserts value is object {
  if (typeof value !== "object") {
    throw new TypeError(`${arg} must be a object, but received ${value}.`);
  }
}

declare const integerBrand: unique symbol;

type IntegerGuard = number & { [integerBrand]: true };

export function checkInteger(value: unknown, arg: string): asserts value is IntegerGuard {
  if (!Number.isInteger(value)) {
    throw new TypeError(`${arg} must be a an integer, but received ${value}.`);
  }
}

declare const integerMinMaxBrand: unique symbol;

type IntegerMinMaxGuard = number & { [integerMinMaxBrand]: true };

export function checkIntegerBetween(
  value: unknown,
  min: number,
  max: number,
  arg: string
): asserts value is IntegerMinMaxGuard {
  checkInteger(value, arg);
  if (value < min || value > max) {
    throw new RangeError(`${arg} must be between ${min} and ${max}, but received ${value}.`);
  }
}

declare const finiteNumberBrand: unique symbol;

type FiniteNumber = number & { [finiteNumberBrand]: true };

export function checkFiniteNumber(value: unknown, arg: string): asserts value is FiniteNumber {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${arg} must be a finite number, but received ${value}.`);
  }
}
