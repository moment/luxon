import { NumberingSystem, LocaleOptions } from "./locale";
import DateTime from "../datetime";
import Zone from "../zone";
import { FormatToken } from "../impl/formatter";

export interface ZoneOptions {
  keepLocalTime?: boolean;
}

export interface ToRelativeOptions {
  /** The DateTime to use as the basis to which this time is compared. Defaults to now. */
  base?: DateTime;
  locale?: string;
  style?: Intl.RelativeTimeFormatStyle;
  /** If omitted, the method will pick the unit. */
  unit?: Intl.RelativeTimeFormatUnit;
  /** Defaults to `true`. */
  round?: boolean;
  /**
   * Padding in milliseconds. This allows you to round up the result if it fits inside the threshold.
   * Don't use in combination with {round: false} because the decimal output will include the padding.
   * Defaults to 0.
   */
  padding?: number;
  /** The Intl system may choose not to honor this */
  numberingSystem?: NumberingSystem;
}

export type ToRelativeCalendarUnit = "years" | "quarters" | "months" | "weeks" | "days";

export interface ToRelativeCalendarOptions {
  /** The DateTime to use as the basis to which this time is compared. Defaults to now. */
  base?: DateTime;
  locale?: string;
  /** If omitted, the method will pick the unit. */
  unit?: ToRelativeCalendarUnit;
  /** The Intl system may choose not to honor this. */
  numberingSystem?: NumberingSystem;
}

export interface ToSQLOptions {
  includeOffset?: boolean;
  includeZone?: boolean;
}

export type ToISOFormat = "basic" | "extended";

export interface ToISOTimeOptions {
  suppressMilliseconds?: boolean;
  suppressSeconds?: boolean;
  includeOffset?: boolean;
  format?: ToISOFormat;
}

export interface DateTimeOptions extends LocaleOptions {
  zone?: string | Zone;
  nullOnInvalid?: boolean;
}

export interface DateTimeWithZoneOptions extends DateTimeOptions {
  setZone?: boolean;
}

export interface TimeObject {
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

export interface GregorianDateTime extends TimeObject {
  year: number;
  month: number;
  day: number;
}

export interface WeekDateTime extends TimeObject {
  weekYear: number;
  weekNumber: number;
  weekday: number;
}

export interface OrdinalDateTime extends TimeObject {
  year: number;
  ordinal: number;
}

export type GenericDateTime = Partial<GregorianDateTime & WeekDateTime & OrdinalDateTime>;

export interface ExplainedFormat {
  input: string;
  tokens: FormatToken[];
  regex?: RegExp;
  rawMatches?: RegExpMatchArray | null;
  matches?: Record<string, string | number>;
  result?: GenericDateTime | null;
  zone?: Zone | null;
  invalidReason?: string;
}
