import Invalid from "../impl/invalid";
import { CalendarSystem, LocaleOptions, NumberingSystem } from "./locale";
import Zone from "../zone";
import Locale from "../impl/locale";
import { FormatToken } from "../impl/formatter";
import DateTime from "../datetime";

export interface Config extends DateTimeConfig {
  old?: {
    ts?: number;
    zone?: Zone;
    o?: number;
    c?: GregorianDateTime;
  };
}

interface DateTimeConfig {
  invalid?: Invalid | null;
  o?: number;
  ts?: number;
  zone?: Zone;
  loc?: Locale;
}

export type DateTimeLike = DateTime | Date | GenericDateTime;

export interface DateTimeOptions extends LocaleOptions {
  zone?: string | Zone;
  nullOnInvalid?: boolean;
}

export interface DateTimeWithZoneOptions extends DateTimeOptions {
  setZone?: boolean;
}

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

export type GenericDateTime = Partial<
  GregorianDateTime & WeekDateTime & OrdinalDateTime & QuarterDateTime
>;

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

export interface OrdinalDateTime extends TimeObject {
  year: number;
  ordinal: number;
}

export interface WeekDateTime extends TimeObject {
  weekYear: number;
  weekNumber: number;
  weekday: number;
}

export interface QuarterDateTime extends TimeObject {
  quarter: number;
  year: number;
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

export interface SetZoneOptions {
  keepCalendarTime?: boolean;
  keepLocalTime?: boolean;
}

export interface FromDateTimeToObject extends Partial<GregorianDateTime> {
  outputCalendar?: CalendarSystem | null;
  numberingSystem?: NumberingSystem | null;
  locale?: string | null;
}
