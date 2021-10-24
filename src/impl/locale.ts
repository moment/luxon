import { padStart, roundTo, hasRelative } from "./util";
import * as English from "./english";
import Settings from "../settings";
import DateTime from "../datetime";
import IANAZone from "../zones/IANAZone";
import { CalendarSystem, LocaleOptions, NumberingSystem } from "../types/locale";
import { StringUnitLength, UnitLength } from "../types/common";

let intlDTCache: Record<string, Intl.DateTimeFormat> = {};
function getCachedDTF(locString: string, opts: Intl.DateTimeFormatOptions = {}) {
  const key = JSON.stringify([locString, opts]);
  let dtf = intlDTCache[key];
  if (!dtf) {
    dtf = new Intl.DateTimeFormat(locString, opts);
    intlDTCache[key] = dtf;
  }
  return dtf;
}

let intlNumCache: Record<string, Intl.NumberFormat> = {};
function getCachedINF(locString: string, opts: Intl.NumberFormatOptions = {}) {
  const key = JSON.stringify([locString, opts]);
  let inf = intlNumCache[key];
  if (!inf) {
    inf = new Intl.NumberFormat(locString, opts);
    intlNumCache[key] = inf;
  }
  return inf;
}

let intlRelCache: Record<string, Intl.RelativeTimeFormat> = {};
function getCachedRTF(locString: string, opts: Intl.RelativeTimeFormatOptions = {}) {
  const key = JSON.stringify([locString, opts]);
  let inf = intlRelCache[key];
  if (!inf) {
    inf = new Intl.RelativeTimeFormat(locString, opts);
    intlRelCache[key] = inf;
  }
  return inf;
}

let sysLocaleCache: string | null;
function systemLocale() {
  if (sysLocaleCache) {
    return sysLocaleCache;
  } else {
    sysLocaleCache = new Intl.DateTimeFormat().resolvedOptions().locale;
    return sysLocaleCache;
  }
}

function parseLocaleString(localeStr: string): [string, NumberingSystem?, CalendarSystem?] {
  // I really want to avoid writing a BCP 47 parser
  // see, e.g. https://github.com/wooorm/bcp-47
  // Instead, we'll do this:

  // a) if the string has no -u extensions, just leave it alone
  // b) if it does, use Intl to resolve everything
  // c) if Intl fails, try again without the -u

  const uIndex = localeStr.indexOf("-u-");
  if (uIndex === -1) {
    return [localeStr];
  } else {
    let options;
    const smaller = localeStr.substring(0, uIndex);
    try {
      options = getCachedDTF(localeStr).resolvedOptions();
    } catch (e) {
      options = getCachedDTF(smaller).resolvedOptions();
    }

    const { numberingSystem, calendar } = options;
    // return the smaller one so that we can append the calendar and numbering overrides to it
    return [smaller, numberingSystem as NumberingSystem, calendar as CalendarSystem];
  }
}

function intlConfigString(
  localeStr: string,
  numberingSystem: NumberingSystem | null,
  outputCalendar: CalendarSystem | null
) {
  if (outputCalendar || numberingSystem) {
    localeStr += "-u";

    if (outputCalendar) {
      localeStr += `-ca-${outputCalendar}`;
    }

    if (numberingSystem) {
      localeStr += `-nu-${numberingSystem}`;
    }
    return localeStr;
  } else {
    return localeStr;
  }
}

function mapMonths<T>(f: (_: DateTime) => T): T[] {
  const ms = [];
  for (let i = 1; i <= 12; i++) {
    const dt = DateTime.utc(2016, i, 1);
    ms.push(f(dt));
  }
  return ms;
}

function mapWeekdays<T>(f: (_: DateTime) => T): T[] {
  const ms = [];
  for (let i = 1; i <= 7; i++) {
    const dt = DateTime.utc(2016, 11, 13 + i);
    ms.push(f(dt));
  }
  return ms;
}

function listStuff<T extends UnitLength>(
  loc: Locale,
  length: T,
  englishFn: (length: T) => string[],
  intlFn: (length: T) => string[]
) {
  const mode = loc.listingMode();

  if (mode === "en") {
    return englishFn(length);
  } else {
    return intlFn(length);
  }
}

/**
 * @private
 */
interface NumberFormatterOptions {
  padTo?: number;
  floor?: boolean;
}

/**
 * @private
 */
class PolyNumberFormatter {
  private readonly padTo: number;
  private readonly floor: boolean;
  private inf?: Readonly<Intl.NumberFormat>;

  constructor(intl: string, forceSimple: boolean, opts: NumberFormatterOptions) {
    this.padTo = opts.padTo || 0;
    this.floor = opts.floor || false;

    if (!forceSimple) {
      const intlOpts: Intl.NumberFormatOptions = { useGrouping: false };
      if (this.padTo > 0) intlOpts.minimumIntegerDigits = opts.padTo;
      this.inf = getCachedINF(intl, intlOpts);
    }
  }

  format(i: number) {
    if (this.inf) {
      const fixed = this.floor ? Math.floor(i) : i;
      return this.inf.format(fixed);
    } else {
      // to match the browser's numberformatter defaults
      const fixed = this.floor ? Math.floor(i) : roundTo(i, 3);
      return padStart(fixed, this.padTo);
    }
  }
}

/**
 * @private
 */

class PolyDateFormatter {
  private opts: Readonly<Intl.DateTimeFormatOptions>;
  private dt: DateTime;
  private dtf: Readonly<Intl.DateTimeFormat>;

  constructor(dt: DateTime, intl: string, opts: Intl.DateTimeFormatOptions) {
    this.opts = opts;

    let z;
    if (dt.zone.isUniversal) {
      // UTC-8 or Etc/UTC-8 are not part of tzdata, only Etc/GMT+8 and the like.
      // That is why fixed-offset TZ is set to that unless it is:
      // 1. Representing offset 0 when UTC is used to maintain previous behavior and does not become GMT.
      // 2. Unsupported by the browser:
      //    - some do not support Etc/
      //    - < Etc/GMT-14, > Etc/GMT+12, and 30-minute or 45-minute offsets are not part of tzdata
      const gmtOffset = -1 * (dt.offset / 60);
      const offsetZ = gmtOffset >= 0 ? `Etc/GMT+${gmtOffset}` : `Etc/GMT${gmtOffset}`;
      const isOffsetZoneSupported = IANAZone.isValidZone(offsetZ);
      if (dt.offset !== 0 && isOffsetZoneSupported) {
        z = offsetZ;
        this.dt = dt;
      } else {
        // Not all fixed-offset zones like Etc/+4:30 are present in tzdata.
        // So we have to make do. Two cases:
        // 1. The format options tell us to show the zone. We can't do that, so the best
        // we can do is format the date in UTC.
        // 2. The format options don't tell us to show the zone. Then we can adjust them
        // the time and tell the formatter to show it to us in UTC, so that the time is right
        // and the bad zone doesn't show up.
        z = "UTC";
        if (opts.timeZoneName) {
          this.dt = dt;
        } else {
          this.dt =
            dt.offset === 0 ? dt : DateTime.fromMillis(dt.toMillis() + dt.offset * 60 * 1000);
        }
      }
    } else if (dt.zone.type === "system") {
      this.dt = dt;
    } else {
      this.dt = dt;
      z = dt.zone.name;
    }

    const intlOpts = { ...this.opts };
    if (z) {
      intlOpts.timeZone = z;
    }
    this.dtf = getCachedDTF(intl, intlOpts);
  }

  format() {
    return this.dtf.format(this.dt.toJSDate());
  }

  formatToParts() {
    return this.dtf.formatToParts(this.dt.toJSDate());
  }

  resolvedOptions() {
    return this.dtf.resolvedOptions();
  }
}

/**
 * @private
 */
class PolyRelFormatter {
  private opts: Readonly<Intl.RelativeTimeFormatOptions>;
  private rtf?: Readonly<Intl.RelativeTimeFormat>;

  constructor(intl: string, isEnglish: boolean, opts: Intl.RelativeTimeFormatOptions) {
    this.opts = { style: "long", ...opts };
    if (!isEnglish && hasRelative()) {
      this.rtf = getCachedRTF(intl, opts);
    }
  }

  format(count: number, unit: Intl.RelativeTimeFormatUnit) {
    if (this.rtf) {
      return this.rtf.format(count, unit);
    } else {
      return English.formatRelativeTime(unit, count, this.opts.numeric, this.opts.style !== "long");
    }
  }

  formatToParts(count: number, unit: Intl.RelativeTimeFormatUnit) {
    if (this.rtf) {
      return this.rtf.formatToParts(count, unit);
    } else {
      return [];
    }
  }
}

interface MonthCache {
  format: Partial<Record<UnitLength, string[]>>;
  standalone: Partial<Record<UnitLength, string[]>>;
}

interface WeekDaysCache {
  format: Partial<Record<StringUnitLength, string[]>>;
  standalone: Partial<Record<StringUnitLength, string[]>>;
}

type EraCache = Partial<Record<StringUnitLength, string[]>>;

/**
 * @private
 */
export default class Locale {
  public readonly locale: string;
  public numberingSystem: Readonly<NumberingSystem> | null;
  public outputCalendar: Readonly<CalendarSystem> | null;

  private readonly intl: string;

  private weekdaysCache: Readonly<WeekDaysCache>;
  private monthsCache: Readonly<MonthCache>;
  private meridiemCache: Readonly<string[]> | null;
  private eraCache: EraCache;

  private readonly specifiedLocale?: string;
  private fastNumbersCached: boolean | null;

  static fromOpts(opts: LocaleOptions & { defaultToEN?: boolean }): Locale {
    return Locale.create(opts.locale, opts.numberingSystem, opts.outputCalendar, opts.defaultToEN);
  }

  static create(
    locale?: string,
    numberingSystem?: NumberingSystem | null,
    outputCalendar?: CalendarSystem | null,
    defaultToEN = false
  ): Locale {
    const specifiedLocale = locale || Settings.defaultLocale;
    // the system locale is useful for human readable strings but annoying for parsing/formatting known formats
    const localeR = specifiedLocale || (defaultToEN ? "en-US" : systemLocale());
    const numberingSystemR = numberingSystem || Settings.defaultNumberingSystem;
    const outputCalendarR = outputCalendar || Settings.defaultOutputCalendar;
    return new Locale(
      localeR,
      numberingSystemR || undefined,
      outputCalendarR || undefined,
      specifiedLocale || undefined
    );
  }

  static resetCache(): void {
    sysLocaleCache = null;
    intlDTCache = {};
    intlNumCache = {};
    intlRelCache = {};
  }

  static fromObject({ locale, numberingSystem, outputCalendar }: LocaleOptions = {}): Locale {
    return Locale.create(locale, numberingSystem, outputCalendar);
  }

  constructor(
    locale: string,
    numbering?: NumberingSystem,
    outputCalendar?: CalendarSystem,
    specifiedLocale?: string
  ) {
    const [parsedLocale, parsedNumberingSystem, parsedOutputCalendar] = parseLocaleString(locale);

    this.locale = parsedLocale;
    this.numberingSystem = numbering || parsedNumberingSystem || null;
    this.outputCalendar = outputCalendar || parsedOutputCalendar || null;
    this.intl = intlConfigString(this.locale, this.numberingSystem, this.outputCalendar);

    this.weekdaysCache = { format: {}, standalone: {} };
    this.monthsCache = { format: {}, standalone: {} };
    this.meridiemCache = null;
    this.eraCache = {};

    this.specifiedLocale = specifiedLocale;
    this.fastNumbersCached = null;
  }

  get fastNumbers(): boolean {
    if (this.fastNumbersCached == null) {
      this.fastNumbersCached = this.supportsFastNumbers();
    }

    return this.fastNumbersCached;
  }

  listingMode(): "en" | "intl" {
    const isActuallyEn = this.isEnglish();
    const hasNoWeirdness =
      (this.numberingSystem === null || this.numberingSystem === "latn") &&
      (this.outputCalendar === null || this.outputCalendar === "gregory");
    return isActuallyEn && hasNoWeirdness ? "en" : "intl";
  }

  clone(alts?: LocaleOptions & { defaultToEN?: boolean }): Locale {
    if (!alts || Object.getOwnPropertyNames(alts).length === 0) {
      return this;
    } else {
      return Locale.create(
        alts.locale || this.specifiedLocale,
        alts.numberingSystem || this.numberingSystem,
        alts.outputCalendar || this.outputCalendar,
        alts.defaultToEN || false
      );
    }
  }

  redefaultToEN(alts = {}): Locale {
    return this.clone({ ...alts, defaultToEN: true });
  }

  redefaultToSystem(alts = {}): Locale {
    return this.clone({ ...alts, defaultToEN: false });
  }

  months(length: UnitLength, format = false): string[] {
    return listStuff(this, length, English.months as (length: UnitLength) => string[], () => {
      const intl: Intl.DateTimeFormatOptions = format
          ? { month: length, day: "numeric" }
          : { month: length },
        formatStr = format ? "format" : "standalone";
      if (!this.monthsCache[formatStr][length]) {
        this.monthsCache[formatStr][length] = mapMonths((dt) =>
          this.extract(dt, intl, "month")
        ) as string[];
      }
      return this.monthsCache[formatStr][length] as string[];
    });
  }

  weekdays(length: StringUnitLength, format = false): string[] {
    return listStuff(this, length, English.weekdays as (length: UnitLength) => string[], () => {
      const intl: Intl.DateTimeFormatOptions = format
          ? {
              weekday: length,
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          : { weekday: length },
        formatStr = format ? "format" : "standalone";
      if (!this.weekdaysCache[formatStr][length]) {
        this.weekdaysCache[formatStr][length] = mapWeekdays((dt) =>
          this.extract(dt, intl, "weekday")
        ) as string[];
      }
      return this.weekdaysCache[formatStr][length] as string[];
    });
  }

  meridiems(): string[] {
    return listStuff(
      this,
      "numeric",
      () => English.meridiems,
      () => {
        // In theory there could be aribitrary day periods. We're gonna assume there are exactly two
        // for AM and PM. This is probably wrong, but it's makes parsing way easier.
        if (!this.meridiemCache) {
          const intl: Intl.DateTimeFormatOptions = {
            timeStyle: "medium",
            hourCycle: "h12",
          };
          this.meridiemCache = [DateTime.utc(2016, 11, 13, 9), DateTime.utc(2016, 11, 13, 19)].map(
            (dt) => this.extract(dt, intl, "dayPeriod")
          ) as string[];
        }

        return this.meridiemCache as string[];
      }
    );
  }

  eras(length: StringUnitLength): string[] {
    return listStuff(this, length, English.eras as (length: StringUnitLength) => string[], () => {
      const intl = { era: length };

      // This is problematic. Different calendars are going to define eras totally differently. What I need is the minimum set of dates
      // to definitely enumerate them.
      if (!this.eraCache[length]) {
        this.eraCache[length] = [DateTime.utc(-40, 1, 1), DateTime.utc(2017, 1, 1)].map((dt) =>
          this.extract(dt, intl, "era")
        ) as string[];
      }

      return this.eraCache[length] as string[];
    });
  }

  extract(
    dt: DateTime,
    intlOpts: Intl.DateTimeFormatOptions,
    field: Intl.DateTimeFormatPartTypes
  ): string | null {
    const df = this.dtFormatter(dt, intlOpts),
      results = df.formatToParts(),
      matching = results.find((m) => m.type === field);
    return matching ? matching.value : null;
  }

  numberFormatter(opts: NumberFormatterOptions = {}): PolyNumberFormatter {
    // this forcesimple option is never used (the only caller short-circuits on it, but it seems safer to leave)
    // (in contrast, the rest of the condition is used heavily)
    return new PolyNumberFormatter(this.intl, this.fastNumbers, opts);
  }

  dtFormatter(dt: DateTime, intlOpts: Intl.DateTimeFormatOptions = {}): PolyDateFormatter {
    return new PolyDateFormatter(dt, this.intl, intlOpts);
  }

  relFormatter(opts: Intl.RelativeTimeFormatOptions = {}): PolyRelFormatter {
    return new PolyRelFormatter(this.intl, this.isEnglish(), opts);
  }

  isEnglish(): boolean {
    return (
      this.locale === "en" ||
      this.locale.toLowerCase() === "en-us" ||
      new Intl.DateTimeFormat(this.intl).resolvedOptions().locale.startsWith("en-us")
    );
  }

  equals(other: Locale): boolean {
    return (
      this.locale === other.locale &&
      this.numberingSystem === other.numberingSystem &&
      this.outputCalendar === other.outputCalendar
    );
  }

  private supportsFastNumbers() {
    if (this.numberingSystem && this.numberingSystem !== "latn") {
      return false;
    } else {
      return (
        this.numberingSystem === "latn" ||
        !this.locale ||
        this.locale.startsWith("en") ||
        new Intl.DateTimeFormat(this.intl).resolvedOptions().numberingSystem === "latn"
      );
    }
  }
}
