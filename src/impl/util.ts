/*
  This is just a junk drawer, containing anything used across multiple classes.
  Because Luxon is small(ish), this should stay small and we won't worry about splitting
  it up into, say, parsingUtil.js and basicUtil.js and so on. But they are divided up by feature area.
*/

import { GregorianDateTime, TimeObject } from "../types/datetime";
import { ZoneOffsetFormat } from "../types/zone";
import { InvalidArgumentError } from "../errors";

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

export function isInteger(o: unknown): o is number {
  return typeof o === "number" && o % 1 === 0;
}

export function isString(o: unknown): o is string {
  return typeof o === "string";
}

export function isDate(o: unknown): o is Date {
  return Object.prototype.toString.call(o) === "[object Date]";
}

// CAPABILITIES

export function hasRelative(): boolean {
  return typeof Intl !== "undefined" && "RelativeTimeFormat" in Intl && !!Intl.RelativeTimeFormat;
}

// OBJECTS AND ARRAYS

export function maybeArray<T>(thing: T | T[]): T[] {
  return Array.isArray(thing) ? thing : [thing];
}

export function bestBy<T, U>(
  arr: T[],
  by: (_: T) => U,
  compare: (_: U, __: U) => U
): T | undefined {
  if (arr.length === 0) {
    return undefined;
  }
  const best = arr.reduce<[U, T] | undefined>((best, next) => {
    const pair: [U, T] = [by(next), next];
    if (isUndefined(best)) {
      return pair;
    } else if (compare(best[0], pair[0]) === best[0]) {
      return best;
    } else {
      return pair;
    }
  }, undefined);

  return (best as [U, T])[1];
}

export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce<Partial<Pick<T, K>>>((a, k) => {
    a[k] = obj[k];
    return a;
  }, {}) as Pick<T, K>;
}

export function hasOwnProperty<T extends object>(obj: T, prop: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

// NUMBERS AND STRINGS

export function integerBetween(thing: number, bottom: number, top: number): boolean {
  return isInteger(thing) && thing >= bottom && thing <= top;
}

// x % n but takes the sign of n instead of x
export function floorMod(x: number, n: number): number {
  return x - n * Math.floor(x / n);
}

export function padStart(input: number, n = 2): string {
  const minus = input < 0 ? "-" : "";
  const target = minus ? input * -1 : input;
  let result;

  if (target.toString().length < n) {
    result = ("0".repeat(n) + target).slice(-n);
  } else {
    result = target.toString();
  }

  return `${minus}${result}`;
}

export function parseInteger(string: string): number | undefined {
  if (isUndefined(string) || string === null || string === "") {
    return undefined;
  } else {
    return parseInt(string, 10);
  }
}

export function parseMillis(fraction: string | null | undefined): number | undefined {
  // Return undefined (instead of 0) in these cases, where fraction is not set
  if (isUndefined(fraction) || fraction === null || fraction === "") {
    return undefined;
  } else {
    const f = parseFloat("0." + fraction) * 1000;
    return Math.floor(f);
  }
}

export function roundTo(number: number, digits: number, towardZero = false): number {
  const factor = 10 ** digits,
    rounder = towardZero ? Math.trunc : Math.round;
  return rounder(number * factor) / factor;
}

// DATE BASICS

export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function daysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

export function daysInMonth(year: number, month: number): number {
  const modMonth = floorMod(month - 1, 12) + 1,
    modYear = year + (month - modMonth) / 12;

  if (modMonth === 2) {
    return isLeapYear(modYear) ? 29 : 28;
  } else {
    return [31, null as unknown as number, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][modMonth - 1];
  }
}

// covert a calendar object to a local timestamp (epoch, but with the offset baked in)
export function objToLocalTS(obj: GregorianDateTime): number {
  const ts = Date.UTC(
    obj.year,
    obj.month - 1,
    obj.day,
    obj.hour,
    obj.minute,
    obj.second,
    obj.millisecond
  );

  // for legacy reasons, years between 0 and 99 are interpreted as 19XX; revert that
  if (obj.year < 100 && obj.year >= 0) {
    const date = new Date(ts);
    date.setUTCFullYear(date.getUTCFullYear() - 1900);
    return date.getTime();
  }
  return +ts;
}

export function weeksInWeekYear(weekYear: number): number {
  const p1 =
      (weekYear +
        Math.floor(weekYear / 4) -
        Math.floor(weekYear / 100) +
        Math.floor(weekYear / 400)) %
      7,
    last = weekYear - 1,
    p2 = (last + Math.floor(last / 4) - Math.floor(last / 100) + Math.floor(last / 400)) % 7;
  return p1 === 4 || p2 === 3 ? 53 : 52;
}

export function untruncateYear(year: number): number {
  if (year > 99) {
    return year;
  } else return year > 60 ? 1900 + year : 2000 + year;
}

// PARSING

export function parseZoneInfo(
  ts: number,
  offsetFormat?: "long" | "short",
  locale?: string,
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
  return parsed?.value || null;
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
  if (typeof value === "boolean" || value === "" || Number.isNaN(numericValue))
    throw new InvalidArgumentError(`Invalid unit value ${value}`);
  return numericValue;
}

export function normalizeObject<T extends string>(
  obj: Record<string, unknown>,
  normalizer: (key: string) => T
): Partial<Record<T, number>> {
  return Object.keys(obj).reduce<Partial<Record<T, number>>>((normalized, key) => {
    const value = obj[key];
    if (value !== undefined && value !== null) normalized[normalizer(key)] = asNumber(value);
    return normalized;
  }, {});
}

export function formatOffset(offset: number, format: ZoneOffsetFormat): string {
  const hours = Math.trunc(Math.abs(offset / 60)),
    minutes = Math.trunc(Math.abs(offset % 60)),
    sign = offset >= 0 ? "+" : "-";

  switch (format) {
    case "short":
      return `${sign}${padStart(hours)}:${padStart(minutes)}`;
    case "narrow":
      return `${sign}${hours}${minutes > 0 ? `:${minutes}` : ""}`;
    case "techie":
      return `${sign}${padStart(hours)}${padStart(minutes)}`;
    default:
      throw new RangeError(`Value format ${format} is out of range for property format`);
  }
}

export function timeObject(
  obj: TimeObject
): Pick<TimeObject, "hour" | "minute" | "second" | "millisecond"> {
  return pick(obj, ["hour", "minute", "second", "millisecond"]);
}

export const ianaRegex = /[A-Za-z_+-]{1,256}(:?\/[A-Za-z_+-]{1,256}(\/[A-Za-z_+-]{1,256})?)?/;
