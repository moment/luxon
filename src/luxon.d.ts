// Type definitions for luxon 2.0
// TypeScript Version: 3.6

export interface ZoneOptions {
  keepLocalTime?: boolean;
}

export interface ToRelativeOptions {
  /** The DateTime to use as the basis to which this time is compared. Defaults to now. */
  base?: DateTime;
  locale?: string;
  style?: StringUnitLength;
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

export interface ToISOTimeOptions {
  suppressMilliseconds?: boolean;
  suppressSeconds?: boolean;
  includeOffset?: boolean;
}

export interface LocaleOptions {
  locale?: string;
  outputCalendar?: CalendarSystem;
  numberingSystem?: NumberingSystem;
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

export interface DiffOptions {
  conversionAccuracy?: ConversionAccuracy;
}

export interface FormatToken {
  literal: boolean;
  val: string;
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

export interface ThrowOnInvalid {
  nullOnInvalid?: false;
}

export class DateTime {
  static readonly DATETIME_FULL: Intl.DateTimeFormatOptions;
  static readonly DATETIME_FULL_WITH_SECONDS: Intl.DateTimeFormatOptions;
  static readonly DATETIME_HUGE: Intl.DateTimeFormatOptions;
  static readonly DATETIME_HUGE_WITH_SECONDS: Intl.DateTimeFormatOptions;
  static readonly DATETIME_MED: Intl.DateTimeFormatOptions;
  static readonly DATETIME_MED_WITH_SECONDS: Intl.DateTimeFormatOptions;
  static readonly DATETIME_SHORT: Intl.DateTimeFormatOptions;
  static readonly DATETIME_SHORT_WITH_SECONDS: Intl.DateTimeFormatOptions;
  static readonly DATE_FULL: Intl.DateTimeFormatOptions;
  static readonly DATE_HUGE: Intl.DateTimeFormatOptions;
  static readonly DATE_MED: Intl.DateTimeFormatOptions;
  static readonly DATETIME_MED_WITH_WEEKDAY: Intl.DateTimeFormatOptions;
  static readonly DATE_SHORT: Intl.DateTimeFormatOptions;
  static readonly TIME_24_SIMPLE: Intl.DateTimeFormatOptions;
  static readonly TIME_24_WITH_LONG_OFFSET: Intl.DateTimeFormatOptions;
  static readonly TIME_24_WITH_SECONDS: Intl.DateTimeFormatOptions;
  static readonly TIME_24_WITH_SHORT_OFFSET: Intl.DateTimeFormatOptions;
  static readonly TIME_SIMPLE: Intl.DateTimeFormatOptions;
  static readonly TIME_WITH_LONG_OFFSET: Intl.DateTimeFormatOptions;
  static readonly TIME_WITH_SECONDS: Intl.DateTimeFormatOptions;
  static readonly TIME_WITH_SHORT_OFFSET: Intl.DateTimeFormatOptions;
  static fromHTTP(text: string, options: DateTimeWithZoneOptions & ThrowOnInvalid): DateTime;
  static fromHTTP(text: string, options: DateTimeWithZoneOptions): DateTime | null;
  static fromHTTP(text: string): DateTime;
  static fromISO(text: string, options: DateTimeWithZoneOptions & ThrowOnInvalid): DateTime;
  static fromISO(text: string, options: DateTimeWithZoneOptions): DateTime | null;
  static fromISO(text: string): DateTime;
  static fromJSDate(date: Date, options: DateTimeOptions & ThrowOnInvalid): DateTime;
  static fromJSDate(date: Date, options: DateTimeOptions): DateTime | null;
  static fromJSDate(date: Date): DateTime;
  static fromMillis(milliseconds: number, options: DateTimeOptions & ThrowOnInvalid): DateTime;
  static fromMillis(milliseconds: number, options: DateTimeOptions): DateTime | null;
  static fromMillis(milliseconds: number): DateTime;
  static fromObject(object: GenericDateTime, options: DateTimeOptions & ThrowOnInvalid): DateTime;
  static fromObject(object: GenericDateTime, options: DateTimeOptions): DateTime | null;
  static fromObject(object: GenericDateTime): DateTime;
  static fromRFC2822(text: string, options: DateTimeWithZoneOptions & ThrowOnInvalid): DateTime;
  static fromRFC2822(text: string, options: DateTimeWithZoneOptions): DateTime | null;
  static fromRFC2822(text: string): DateTime;
  static fromSeconds(seconds: number, options: DateTimeOptions & ThrowOnInvalid): DateTime;
  static fromSeconds(seconds: number, options: DateTimeOptions): DateTime | null;
  static fromSeconds(seconds: number): DateTime;
  static fromSQL(text: string, options: DateTimeWithZoneOptions & ThrowOnInvalid): DateTime;
  static fromSQL(text: string, options: DateTimeWithZoneOptions): DateTime | null;
  static fromSQL(text: string): DateTime;
  static fromFormat(
    text: string,
    format: string,
    options: DateTimeWithZoneOptions
  ): DateTime | null;
  static fromFormat(text: string, format: string): DateTime;
  static fromFormat(
    text: string,
    format: string,
    options: DateTimeWithZoneOptions & ThrowOnInvalid
  ): DateTime;
  static fromFormatExplain(
    text: string,
    format: string,
    options?: DateTimeOptions
  ): ExplainedFormat;
  static isDateTime(o: unknown): o is DateTime;
  static local(...args: (number | (DateTimeOptions & ThrowOnInvalid))[]): DateTime;
  static local(...args: (number | DateTimeOptions)[]): DateTime | null;
  static local(...args: number[]): DateTime;
  static max(): undefined;
  static max(...dateTimes: DateTime[]): DateTime;
  static min(): undefined;
  static min(...dateTimes: DateTime[]): DateTime;
  static utc(...args: (number | (DateTimeOptions & ThrowOnInvalid))[]): DateTime;
  static utc(...args: (number | DateTimeOptions)[]): DateTime | null;
  static utc(...args: number[]): DateTime;
  readonly day: number;
  readonly daysInMonth: 28 | 29 | 30 | 31;
  readonly daysInYear: 366 | 365;
  readonly hour: number;
  readonly isInDST: boolean;
  readonly isInLeapYear: boolean;
  readonly isOffsetFixed: boolean;
  readonly locale: string;
  readonly millisecond: number;
  readonly minute: number;
  readonly month: number;
  readonly monthLong: string;
  readonly monthShort: string;
  readonly numberingSystem: NumberingSystem | undefined;
  readonly offset: number;
  readonly offsetNameLong: string | null;
  readonly offsetNameShort: string | null;
  readonly ordinal: number;
  readonly outputCalendar: CalendarSystem | undefined;
  readonly quarter: number;
  readonly second: number;
  readonly weekday: number;
  readonly weekdayLong: string;
  readonly weekdayShort: string;
  readonly weekNumber: number;
  readonly weeksInWeekYear: 53 | 52;
  readonly weekYear: number;
  readonly year: number;
  readonly zone: Readonly<Zone>;
  readonly zoneName: string;
  diff(other: DateTime, unit?: DurationUnit | DurationUnit[], options?: DiffOptions): Duration;
  diffNow(unit?: DurationUnit | DurationUnit[], options?: DiffOptions): Duration;
  endOf(unit: DurationUnit): DateTime;
  equals(other: DateTime): boolean;
  get(unit: keyof GenericDateTime): number;
  hasSame(other: DateTime, unit: DurationUnit): boolean;
  minus(duration: DurationLike): DateTime;
  plus(duration: DurationLike): DateTime;
  reconfigure(options: LocaleOptions): DateTime;
  resolvedLocaleOptions(
    options?: Intl.DateTimeFormatOptions
  ): { locale: string; numberingSystem: NumberingSystem; outputCalendar: CalendarSystem };
  set(values: GenericDateTime): DateTime;
  setLocale(locale: string): DateTime;
  setZone(zone: ZoneLike, { keepLocalTime }?: ZoneOptions): DateTime;
  startOf(unit: DurationUnit): DateTime;
  toBSON(): Date;
  toDefaultZone(): DateTime;
  toFormat(format: string, options?: LocaleOptions): string;
  toHTTP(): string;
  toISO(options?: ToISOTimeOptions): string;
  toISODate(): string;
  toISOTime(options?: ToISOTimeOptions): string;
  toISOWeekDate(): string;
  toJSDate(): Date;
  toJSON(): string;
  toLocaleParts(options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormatPart[];
  toLocaleString(options?: Intl.DateTimeFormatOptions): string;
  toMillis(): number;
  toObject(): GregorianDateTime;
  toRelative(options?: ToRelativeOptions): string;
  toRelativeCalendar(options?: ToRelativeCalendarOptions): string;
  toRFC2822(): string;
  toSeconds(): number;
  toSQL(options?: ToSQLOptions): string;
  toSQLDate(): string;
  toSQLTime(options?: ToSQLOptions): string;
  toString(): string;
  toSystemZone(): DateTime;
  toUTC(offset?: number, options?: ZoneOptions): DateTime;
  until(other: DateTime): Interval;
  valueOf(): number;
}

export type DateTimeLike = DateTime | Date | GenericDateTime;

export interface DurationOptions {
  locale?: string;
  numberingSystem?: NumberingSystem;
  conversionAccuracy?: ConversionAccuracy;
}

export interface DurationFromISOOptions extends DurationOptions {
  nullOnInvalid?: boolean;
}

export interface DurationObject {
  years?: number;
  year?: number;
  quarters?: number;
  quarter?: number;
  months?: number;
  month?: number;
  weeks?: number;
  week?: number;
  days?: number;
  day?: number;
  hours?: number;
  hour?: number;
  minutes?: number;
  minute?: number;
  seconds?: number;
  second?: number;
  milliseconds?: number;
  millisecond?: number;
}

export type DurationUnit = keyof DurationObject;

export interface DurationToFormatOptions {
  floor?: boolean;
}
export class Duration {
  static fromISO(text: string): Duration;
  static fromISO(text: string, options: DurationFromISOOptions & ThrowOnInvalid): Duration;
  static fromISO(text: string, options: DurationFromISOOptions): Duration | null;
  static fromMillis(count: number, options?: DurationOptions): Duration;
  static fromObject(obj: DurationObject, options?: DurationOptions): Duration;
  static isDuration(o: unknown): o is Duration;
  readonly days: number;
  readonly hours: number;
  readonly locale: string;
  readonly milliseconds: number;
  readonly minutes: number;
  readonly months: number;
  readonly numberingSystem: NumberingSystem | undefined;
  readonly quarters: number;
  readonly seconds: number;
  readonly weeks: number;
  readonly years: number;
  as(unit: DurationUnit): number;
  equals(other: Duration): boolean;
  get(unit: DurationUnit): number;
  minus(duration: DurationLike): Duration;
  negate(): Duration;
  normalize(): Duration;
  plus(duration: DurationLike): Duration;
  reconfigure(options?: DurationOptions): Duration;
  set(values: DurationObject): Duration;
  shiftTo(...units: DurationUnit[]): Duration;
  toFormat(format: string, options?: DurationToFormatOptions): string;
  toISO(): string;
  toJSON(): string;
  toObject(): DurationObject;
  toString(): string;
  valueOf(): number;
}
export type DurationLike = Duration | DurationObject | number;

export type NumberingSystem =
  | "arab"
  | "arabext"
  | "bali"
  | "beng"
  | "deva"
  | "fullwide"
  | "gujr"
  | "hanidec"
  | "khmr"
  | "knda"
  | "laoo"
  | "latn"
  | "limb"
  | "mlym"
  | "mong"
  | "mymr"
  | "orya"
  | "tamldec"
  | "telu"
  | "thai"
  | "tibt";

export type CalendarSystem =
  | "buddhist"
  | "chinese"
  | "coptic"
  | "ethioaa"
  | "ethiopic"
  | "gregory"
  | "hebrew"
  | "indian"
  | "islamic"
  | "islamicc"
  | "iso8601"
  | "japanese"
  | "persian"
  | "roc";

export type ConversionAccuracy = "casual" | "longterm";
export type StringUnitLength = "narrow" | "short" | "long";
export type NumberUnitLength = "numeric" | "2-digit";
export type UnitLength = StringUnitLength | NumberUnitLength;

// Info
export interface InfoOptions {
  locale?: string;
}

export interface InfoUnitOptions extends InfoOptions {
  numberingSystem?: NumberingSystem;
}
export interface InfoCalendarOptions extends InfoUnitOptions {
  outputCalendar?: CalendarSystem;
}

export interface Features {
  intl: boolean;
  intlTokens: boolean;
  zones: boolean;
  relative: boolean;
}

export class Info {
  static eras(length?: StringUnitLength, { locale }?: InfoOptions): string[];
  static features(): Features;
  static hasDST(zone?: ZoneLike): boolean;
  static isValidIANAZone(zone: string): boolean;
  static meridiems(options?: InfoOptions): string[];
  static months(length?: UnitLength, options?: InfoCalendarOptions): string[];
  static monthsFormat(length?: UnitLength, options?: InfoCalendarOptions): string[];
  static normalizeZone(input?: ZoneLike): Zone;
  static weekdays(length?: StringUnitLength, options?: InfoUnitOptions): string[];
  static weekdaysFormat(length?: StringUnitLength, options?: InfoUnitOptions): string[];
}

//Interval
export interface IntervalObject {
  start?: DateTime;
  end?: DateTime;
}

export class Interval {
  static after(start: DateTimeLike, duration: DurationLike): Interval;
  static before(end: DateTimeLike, duration: DurationLike): Interval;
  static fromDateTimes(start: DateTimeLike, end: DateTimeLike): Interval;
  static fromISO(text: string, options?: DateTimeWithZoneOptions): Interval;
  static isInterval(o: unknown): o is Interval;
  static merge(intervals: Interval[]): Interval[];
  static xor(intervals: Interval[]): Interval[];
  readonly start: DateTime;
  readonly end: DateTime;
  abutsEnd(other: Interval): boolean;
  abutsStart(other: Interval): boolean;
  contains(dateTime: DateTime): boolean;
  count(unit?: DurationUnit): number;
  difference(...intervals: Interval[]): Interval[];
  divideEqually(numberOfParts: number): Interval[];
  engulfs(other: Interval): boolean;
  equals(other: Interval): boolean;
  hasSame(unit: DurationUnit): boolean;
  intersection(other: Interval): Interval | null;
  isAfter(dateTime: DateTime): boolean;
  isBefore(dateTime: DateTime): boolean;
  isEmpty(): boolean;
  length(unit?: DurationUnit): number;
  mapEndpoints(mapFn: (dt: DateTime) => DateTime): Interval;
  overlaps(other: Interval): boolean;
  set(interval: IntervalObject): Interval;
  splitAt(...dateTimes: DateTimeLike[]): Interval[];
  splitBy(duration: DurationLike): Interval[];
  toDuration(unit?: DurationUnit | DurationUnit[], options?: DiffOptions): Duration;
  toFormat(dateFormat: string, options?: { separator: string }): string;
  toISO(options?: ToISOTimeOptions): string;
  toString(): string;
  union(other: Interval): Interval;
}

// Settings
export class Settings {
  static defaultLocale: string | undefined;
  static defaultNumberingSystem: NumberingSystem | undefined;
  static defaultOutputCalendar: CalendarSystem | undefined;
  static now: () => number;
  static readonly defaultZone: Zone;
  static resetCaches(): void;
  static setDefaultZone(zone?: ZoneLike): void;
}

// Zone
export interface ZoneOffsetOptions {
  format?: "short" | "long";
  locale?: string;
}

export type ZoneOffsetFormat = "narrow" | "short" | "techie";

export type ZoneLike = Zone | number | string | null | undefined;

export abstract class Zone {
  readonly isValid: boolean;
  readonly name: string;
  readonly type: string;
  readonly isUniversal: boolean;
  equals(other: Zone): boolean;
  offset(ts: number): number;
  offsetName(ts?: number, options?: ZoneOffsetOptions): string | null;
  formatOffset(ts: number, format: ZoneOffsetFormat): string;
}

export class IANAZone extends Zone {
  static create(name: string): IANAZone;
  static isValidSpecifier(s: string): boolean;
  static isValidZone(zone: string): boolean;
  static resetCache(): void;
}

export class FixedOffsetZone extends Zone {
  constructor(offset: number);
  static readonly utcInstance: FixedOffsetZone;
  static instance(offset: number): FixedOffsetZone;
  static parseSpecifier(s: string): FixedOffsetZone | null;
}

export class InvalidZone extends Zone {
  constructor(zoneName: string);
}

export class SystemZone extends Zone {
  static readonly instance: SystemZone;
}
