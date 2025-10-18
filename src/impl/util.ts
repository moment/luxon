/*
  This is just a junk drawer, containing anything used across multiple classes.
  Because Luxon is small(ish), this should stay small and we won't worry about splitting
  it up into, say, parsingUtil.js and basicUtil.js and so on. But they are divided up by feature area.
*/

import { InvalidArgumentError } from "../errors.js";
import Settings from "../settings.js";
import type { AnyDateObject, DateTimeObject, TimeObject } from "./dateObjects.ts";
import { dayOfWeek, daysInYear, isoWeekdayToLocal } from "./dateMath.ts";

/**
 * @private
 */

// TYPES

export function isUndefined(o: unknown): o is undefined {
  return typeof o === "undefined";
}

export function isNumber(o: unknown): o is number {
  return typeof o === "number";
}

declare const integerBrand: unique symbol;

type IntegerGuard = number & { [integerBrand]: true };

export function isInteger(o: unknown): o is IntegerGuard {
  return typeof o === "number" && o % 1 === 0;
}

export function isString(o: unknown): o is string {
  return typeof o === "string";
}

export function isDate(o: unknown): o is Date {
  return Object.prototype.toString.call(o) === "[object Date]";
}

// CAPABILITIES

export function hasRelative() {
  try {
    return typeof Intl !== "undefined" && !!Intl.RelativeTimeFormat;
  } catch (e) {
    return false;
  }
}

export function hasLocaleWeekInfo() {
  try {
    return (
      typeof Intl !== "undefined" &&
      !!Intl.Locale &&
      ("weekInfo" in Intl.Locale.prototype || "getWeekInfo" in Intl.Locale.prototype)
    );
  } catch (e) {
    return false;
  }
}

// OBJECTS AND ARRAYS

export function maybeArray<T>(thing: T | T[]): T[] {
  return Array.isArray(thing) ? thing : [thing];
}

export function bestBy<T, R>(
  arr: readonly T[],
  by: (val: T) => R,
  compare: (a: R, b: R) => R
): T | undefined {
  if (arr.length === 0) {
    return undefined;
  }
  return arr.reduce<[R, T] | null>((best, next) => {
    const pair: [R, T] = [by(next), next];
    if (!best) {
      return pair;
    } else if (compare(best[0], pair[0]) === best[0]) {
      return best;
    } else {
      return pair;
    }
  }, null)![1];
}

export function pick(obj: any, keys: any): any /* TODO */ {
  return keys.reduce((a: any, k: any) => {
    a[k] = obj[k];
    return a;
  }, {});
}

export function hasOwnProperty(obj: unknown, prop: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

export function validateWeekSettings(settings: unknown) /* TODO */ {
  if (settings == null) {
    return null;
  } else if (typeof settings !== "object") {
    throw new InvalidArgumentError("Week settings must be an object");
  } else {
    if (
      !integerBetween((settings as any).firstDay, 1, 7) ||
      !integerBetween((settings as any).minimalDays, 1, 7) ||
      !Array.isArray((settings as any).weekend) ||
      (settings as any).weekend.some((v: any) => !integerBetween(v, 1, 7))
    ) {
      throw new InvalidArgumentError("Invalid week settings");
    }
    return {
      firstDay: (settings as any).firstDay,
      minimalDays: (settings as any).minimalDays,
      weekend: Array.from((settings as any).weekend),
    };
  }
}

// NUMBERS AND STRINGS

declare const integerMinMaxBrand: unique symbol;

type IntegerMinMaxGuard = number & { [integerMinMaxBrand]: true };

export function integerBetween(
  thing: unknown,
  bottom: number,
  top: number
): thing is IntegerMinMaxGuard {
  return isInteger(thing) && thing >= bottom && thing <= top;
}

export function padStart(input: number, n: number = 2): string {
  const isNeg = input < 0;
  let padded;
  if (isNeg) {
    padded = "-" + ("" + -input).padStart(n, "0");
  } else {
    padded = ("" + input).padStart(n, "0");
  }
  return padded;
}

export function parseInteger(string: string | null | undefined): number | undefined {
  if (isUndefined(string) || string === null || string === "") {
    return undefined;
  } else {
    return parseInt(string, 10);
  }
}

export function parseFloating(string: string | null | undefined): number | undefined {
  if (isUndefined(string) || string === null || string === "") {
    return undefined;
  } else {
    return parseFloat(string);
  }
}

export function parseMillis(fraction: string): number | undefined {
  // Return undefined (instead of 0) in these cases, where fraction is not set
  if (isUndefined(fraction) || fraction === null || fraction === "") {
    return undefined;
  } else {
    const f = parseFloat("0." + fraction) * 1000;
    return Math.floor(f);
  }
}

export function roundTo(number: number, digits: number, rounding = "round"): number {
  const factor = 10 ** digits;
  switch (rounding) {
    case "expand":
      return number > 0
        ? Math.ceil(number * factor) / factor
        : Math.floor(number * factor) / factor;
    case "trunc":
      return Math.trunc(number * factor) / factor;
    case "round":
      return Math.round(number * factor) / factor;
    case "floor":
      return Math.floor(number * factor) / factor;
    case "ceil":
      return Math.ceil(number * factor) / factor;
    default:
      throw new RangeError(`Value rounding ${rounding} is out of range`);
  }
}

// DATE BASICS

/**
 * Like Date.UTC, but with 1-based month and non-weird year handling
 */
export function utcTs(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0,
  second: number = 0,
  millisecond: number = 0
): number {
  let d = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);

  // for legacy reasons, years between 0 and 99 are interpreted as 19XX; revert that
  if (year < 100 && year >= 0) {
    // set the month and day again, this is necessary because year 2000 is a leap year, but year 100 is not
    // so if obj.year is in 99, but obj.day makes it roll over into year 100,
    // the calculations done by Date.UTC are using year 2000 - which is incorrect
    d = new Date(d).setUTCFullYear(year, month - 1, day);
  }
  return d;
}

// convert a calendar object to a local timestamp (epoch, but with the offset baked in)
export function objToLocalTS(obj: any /* TODO */): number {
  return utcTs(obj.year, obj.month, obj.day, obj.hour, obj.minute, obj.second, obj.millisecond);
}

// adapted from moment.js: https://github.com/moment/moment/blob/000ac1800e620f770f4eb31b5ae908f6167b0ab2/src/lib/units/week-calendar-utils.js
function firstWeekOffset(year: number, minDaysInFirstWeek: number, startOfWeek: number): number {
  const fwdlw = isoWeekdayToLocal(dayOfWeek(year, 1, minDaysInFirstWeek), startOfWeek);
  return -fwdlw + minDaysInFirstWeek - 1;
}

export function weeksInWeekYear(weekYear: number, minDaysInFirstWeek = 4, startOfWeek = 1): number {
  const weekOffset = firstWeekOffset(weekYear, minDaysInFirstWeek, startOfWeek);
  const weekOffsetNext = firstWeekOffset(weekYear + 1, minDaysInFirstWeek, startOfWeek);
  return (daysInYear(weekYear) - weekOffset + weekOffsetNext) / 7;
}

export function untruncateYear(year: number): number {
  if (year > 99) {
    return year;
  } else return year > Settings.twoDigitCutoffYear ? 1900 + year : 2000 + year;
}

// PARSING

export function parseZoneInfo(
  ts: number,
  offsetFormat: Intl.DateTimeFormatOptions["timeZoneName"],
  locale: string,
  timeZone: string | null = null
): string | null {
  const date = new Date(ts),
    intlOpts: Intl.DateTimeFormatOptions = {
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };

  if (timeZone) {
    intlOpts.timeZone = timeZone;
  }

  const modified = { timeZoneName: offsetFormat, ...intlOpts };

  const parsed = new Intl.DateTimeFormat(locale, modified)
    .formatToParts(date)
    .find((m) => m.type.toLowerCase() === "timezonename");
  // TODO: don't return null here
  return parsed ? parsed.value : null;
}

// signedOffset('-5', '30') -> -330
export function signedOffset(offHourStr: string, offMinuteStr: string): number {
  let offHour = parseInt(offHourStr, 10);

  // don't || this because we want to preserve -0
  if (Number.isNaN(offHour)) {
    offHour = 0;
  }

  const offMin = parseInt(offMinuteStr, 10) || 0,
    offMinSigned = offHour < 0 || Object.is(offHour, -0) ? -offMin : offMin;
  return offHour * 60 + offMinSigned;
}

// COERCION

export function asNumber(value: unknown): number {
  const numericValue = Number(value);
  if (typeof value === "boolean" || value === "" || !Number.isFinite(numericValue))
    throw new InvalidArgumentError(`Invalid unit value ${value}`);
  return numericValue;
}

export function normalizeObject(obj: any, normalizer: (key: string) => string): any /* TODO */ {
  const normalized: any = {};
  for (const u in obj) {
    if (hasOwnProperty(obj, u)) {
      const v = obj[u];
      if (v === undefined || v === null) continue;
      normalized[normalizer(u)] = asNumber(v);
    }
  }
  return normalized;
}

/**
 * Returns the offset's value as a string
 * @param {number} offset - The offset in minutes
 * @param {string} format - What style of offset to return.
 *                          Accepts 'narrow', 'short', or 'techie'. Returning '+6', '+06:00', or '+0600' respectively
 * @return {string}
 */
export function formatOffset(offset: number, format: "short" | "narrow" | "techie"): string {
  const hours = Math.trunc(Math.abs(offset / 60)),
    minutes = Math.trunc(Math.abs(offset % 60)),
    sign = offset >= 0 ? "+" : "-";

  switch (format) {
    case "short":
      return `${sign}${padStart(hours, 2)}:${padStart(minutes, 2)}`;
    case "narrow":
      return `${sign}${hours}${minutes > 0 ? `:${minutes}` : ""}`;
    case "techie":
      return `${sign}${padStart(hours, 2)}${padStart(minutes, 2)}`;
    default:
      throw new RangeError(`Value format ${format} is out of range for property format`);
  }
}

export function timeObject(obj: DateTimeObject<AnyDateObject>): TimeObject {
  return pick(obj, ["hour", "minute", "second", "millisecond"]);
}
