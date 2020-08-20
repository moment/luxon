import { hasFormatToParts, hasIntl, padStart, roundTo, hasRelative } from "./util";
import * as English from "./english";
import Settings from "../settings";
import DateTime from "../datetime";
import Formatter from "./formatter";

import { StringUnitLength, UnitLength } from "../types/common";
import { LocaleOptions, NumberingSystem, CalendarSystem } from "../types/locale";
import { ToRelativeUnit, DateTimeFormatOptions } from "../types/datetime";

let intlDTCache: Record<string, Intl.DateTimeFormat> = {};
function getCachedDTF(locString: string, options: DateTimeFormatOptions = {}) {
  const key = JSON.stringify([locString, options]);
  let dtf = intlDTCache[key];
  if (!dtf) {
    dtf = new Intl.DateTimeFormat(locString, options);
    intlDTCache[key] = dtf;
  }
  return dtf;
}

let intlNumCache: Record<string, Intl.NumberFormat> = {};
function getCachedINF(locString: string, options: Intl.NumberFormatOptions) {
  const key = JSON.stringify([locString, options]);
  let inf = intlNumCache[key];
  if (!inf) {
    inf = new Intl.NumberFormat(locString, options);
    intlNumCache[key] = inf;
  }
  return inf;
}

let intlRelCache: Record<string, Intl.RelativeTimeFormat> = {};
function getCachedRTF(locString: string, options: Intl.RelativeTimeFormatOptions = {}) {
  const key = JSON.stringify([locString, options]);
  let inf = intlRelCache[key];
  if (!inf) {
    inf = new Intl.RelativeTimeFormat(locString, options);
    intlRelCache[key] = inf;
  }
  return inf;
}

let sysLocaleCache: string | undefined;
function systemLocale() {
  if (sysLocaleCache) {
    return sysLocaleCache;
  } else if (hasIntl()) {
    const computedSys = new Intl.DateTimeFormat().resolvedOptions().locale;
    // node sometimes defaults to "und". Override that because that is dumb
    sysLocaleCache = !computedSys || computedSys === "und" ? "en-US" : computedSys;
    return sysLocaleCache;
  } else {
    sysLocaleCache = "en-US";
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
    let options: Intl.ResolvedDateTimeFormatOptions;
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
  numberingSystem?: NumberingSystem,
  outputCalendar?: CalendarSystem
) {
  if (hasIntl()) {
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
  } else {
    // arbitrary value, should never be used, all subsequent uses of this.intl are protected by an hasIntl check
    return "";
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
  defaultOK: boolean,
  englishFn: (length: T) => string[],
  intlFn: (length: T) => string[]
) {
  const mode = loc.listingMode(defaultOK);

  if (mode === "error") {
    return [];
  } else if (mode === "en") {
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

class PolyNumberFormatter {
  private readonly padTo: number;
  private readonly floor: boolean;
  private inf?: Readonly<Intl.NumberFormat>;

  constructor(intl: string, forceSimple: boolean, options: NumberFormatterOptions) {
    this.padTo = options.padTo || 0;
    this.floor = options.floor || false;

    if (!forceSimple && hasIntl()) {
      const intlOpts: Intl.NumberFormatOptions = { useGrouping: false };
      if (this.padTo > 0) intlOpts.minimumIntegerDigits = this.padTo;
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
  private options: Readonly<DateTimeFormatOptions>;
  private dt: DateTime;
  private dtf?: Readonly<Intl.DateTimeFormat>;

  constructor(dt: DateTime, intl: string, options: DateTimeFormatOptions) {
    this.options = options;
    const hasIntlDTF = hasIntl();

    let z;
    if (dt.zone.isUniversal && hasIntlDTF) {
      // Chromium doesn't support fixed-offset zones like Etc/GMT+8 in its formatter,
      // See https://bugs.chromium.org/p/chromium/issues/detail?id=364374.
      // So we have to make do. Two cases:
      // 1. The format options tell us to show the zone. We can't do that, so the best
      // we can do is format the date in UTC.
      // 2. The format options don't tell us to show the zone. Then we can adjust
      // the time and tell the formatter to show it to us in UTC, so that the time is right
      // and the bad zone doesn't show up.
      // We can clean all this up when Chrome fixes this.
      z = "UTC";
      if (options.timeZoneName) {
        this.dt = dt;
      } else {
        this.dt = dt.offset === 0 ? dt : DateTime.fromMillis(dt.toMillis() + dt.offset * 60 * 1000);
      }
    } else if (dt.zone.type === "system") {
      this.dt = dt;
    } else {
      this.dt = dt;
      z = dt.zone.name;
    }

    if (hasIntlDTF) {
      const intlOpts: DateTimeFormatOptions = Object.assign({}, this.options);
      if (z) {
        intlOpts.timeZone = z;
      }
      this.dtf = getCachedDTF(intl, intlOpts);
    }
  }

  format() {
    if (this.dtf) {
      return this.dtf.format(this.dt.toJSDate());
    } else {
      const tokenFormat = English.formatString(this.options),
        loc = Locale.create("en-US");
      return Formatter.create(loc).formatDateTimeFromString(this.dt, tokenFormat);
    }
  }

  formatToParts() {
    if (this.dtf && hasFormatToParts()) {
      return this.dtf.formatToParts(this.dt.toJSDate());
    } else {
      // This is kind of a cop out. We actually could do this for English. However, we couldn't do it for intl strings
      // and IMO it's too weird to have an uncanny valley like that
      return [];
    }
  }

  resolvedOptions() {
    if (this.dtf) {
      return this.dtf.resolvedOptions();
    } else {
      return {
        locale: "en-US",
        numberingSystem: "latn",
        calendar: "gregory",
        timeZone: "UTC"
      };
    }
  }
}

/**
 * @private
 */
class PolyRelFormatter {
  private options: Readonly<Intl.RelativeTimeFormatOptions>;
  private rtf?: Readonly<Intl.RelativeTimeFormat>;

  constructor(intl: string, isEnglish: boolean, options: Intl.RelativeTimeFormatOptions) {
    this.options = Object.assign({ style: "long" }, options);
    if (!isEnglish && hasRelative()) {
      this.rtf = getCachedRTF(intl, options);
    }
  }

  format(count: number, unit: ToRelativeUnit) {
    if (this.rtf) {
      return this.rtf.format(count, unit);
    } else {
      return English.formatRelativeTime(
        unit,
        count,
        this.options.numeric,
        this.options.style !== "long"
      );
    }
  }

  formatToParts(count: number, unit: ToRelativeUnit) {
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
  public numberingSystem?: Readonly<NumberingSystem>;
  public outputCalendar?: Readonly<CalendarSystem>;

  private readonly intl: string;

  private weekdaysCache: Readonly<WeekDaysCache>;
  private monthsCache: Readonly<MonthCache>;
  private meridiemCache?: Readonly<string[]>;
  private eraCache: EraCache;

  private readonly specifiedLocale?: string;
  private fastNumbersCached?: boolean;

  static create(
    locale?: string,
    numberingSystem?: NumberingSystem,
    outputCalendar?: CalendarSystem,
    defaultToEN = false
  ) {
    const specifiedLocale = locale || Settings.defaultLocale,
      // the system locale is useful for human readable strings but annoying for parsing/formatting known formats
      localeR = specifiedLocale || (defaultToEN ? "en-US" : systemLocale()),
      numberingSystemR = numberingSystem || Settings.defaultNumberingSystem,
      outputCalendarR = outputCalendar || Settings.defaultOutputCalendar;
    return new Locale(localeR, numberingSystemR, outputCalendarR, specifiedLocale);
  }

  static resetCache() {
    sysLocaleCache = undefined;
    intlDTCache = {};
    intlNumCache = {};
    intlRelCache = {};
  }

  static fromObject({ locale, numberingSystem, outputCalendar }: LocaleOptions = {}) {
    return Locale.create(locale, numberingSystem, outputCalendar);
  }

  private constructor(
    locale: string,
    numberingSystem?: NumberingSystem,
    outputCalendar?: CalendarSystem,
    specifiedLocale?: string
  ) {
    const [parsedLocale, parsedNumberingSystem, parsedOutputCalendar] = parseLocaleString(locale);

    this.locale = parsedLocale;
    this.numberingSystem = numberingSystem || parsedNumberingSystem;
    this.outputCalendar = outputCalendar || parsedOutputCalendar;
    this.intl = intlConfigString(this.locale, this.numberingSystem, this.outputCalendar);

    this.weekdaysCache = { format: {}, standalone: {} };
    this.monthsCache = { format: {}, standalone: {} };
    this.meridiemCache = undefined;
    this.eraCache = {};

    this.specifiedLocale = specifiedLocale;
    this.fastNumbersCached = undefined;
  }

  private supportsFastNumbers() {
    if (this.numberingSystem && this.numberingSystem !== "latn") {
      return false;
    } else {
      return (
        this.numberingSystem === "latn" ||
        !this.locale ||
        this.locale.startsWith("en") ||
        (hasIntl() && Intl.DateTimeFormat(this.intl).resolvedOptions().numberingSystem === "latn")
      );
    }
  }

  get fastNumbers() {
    if (this.fastNumbersCached === undefined) {
      this.fastNumbersCached = this.supportsFastNumbers();
    }

    return this.fastNumbersCached;
  }

  listingMode(defaultOK = true) {
    const intl = hasIntl(),
      hasFTP = intl && hasFormatToParts(),
      isActuallyEn = this.isEnglish(),
      hasNoWeirdness =
        (this.numberingSystem === undefined || this.numberingSystem === "latn") &&
        (this.outputCalendar === undefined || this.outputCalendar === "gregory");

    if (!hasFTP && !(isActuallyEn && hasNoWeirdness) && !defaultOK) {
      return "error";
    } else if (!hasFTP || (isActuallyEn && hasNoWeirdness)) {
      return "en";
    } else {
      return "intl";
    }
  }

  clone(alts: LocaleOptions, defaultToEN = false) {
    if (!alts || Object.getOwnPropertyNames(alts).length === 0) {
      return this;
    } else {
      return Locale.create(
        alts.locale || this.specifiedLocale,
        alts.numberingSystem || this.numberingSystem,
        alts.outputCalendar || this.outputCalendar,
        defaultToEN
      );
    }
  }

  redefaultToEN(alts: LocaleOptions = {}) {
    return this.clone(alts, true /* defaultToEN */);
  }

  redefaultToSystem(alts: LocaleOptions = {}) {
    return this.clone(alts);
  }

  months(length: UnitLength, format = false, defaultOK = true) {
    return listStuff(this, length, defaultOK, English.months, len => {
      const intl = format ? { month: len, day: "numeric" } : { month: len },
        formatStr = format ? "format" : "standalone";
      if (!this.monthsCache[formatStr][len]) {
        this.monthsCache[formatStr][len] = mapMonths(dt => this.extract(dt, intl, "month"));
      }
      return this.monthsCache[formatStr][len] as string[];
    });
  }

  weekdays(length: StringUnitLength, format = false, defaultOK = true) {
    return listStuff(this, length, defaultOK, English.weekdays, len => {
      const intl = format
          ? { weekday: len, year: "numeric", month: "long", day: "numeric" }
          : { weekday: len },
        formatStr = format ? "format" : "standalone";
      if (!this.weekdaysCache[formatStr][len]) {
        this.weekdaysCache[formatStr][len] = mapWeekdays(dt => this.extract(dt, intl, "weekday"));
      }
      return this.weekdaysCache[formatStr][len] as string[];
    });
  }

  meridiems(defaultOK = true) {
    return listStuff(
      this,
      "long", // arbitrary unused value
      defaultOK,
      () => English.meridiems,
      () => {
        // In theory there could be aribitrary day periods. We're gonna assume there are exactly two
        // for AM and PM. This is probably wrong, but it makes parsing way easier.
        if (this.meridiemCache === undefined) {
          const intl = { hour: "numeric", hour12: true };
          this.meridiemCache = [
            DateTime.utc(2016, 11, 13, 9),
            DateTime.utc(2016, 11, 13, 19)
          ].map(dt => this.extract(dt, intl, "dayPeriod"));
        }

        return this.meridiemCache as string[];
      }
    );
  }

  eras(length: StringUnitLength, defaultOK = true) {
    return listStuff(this, length, defaultOK, English.eras, len => {
      const intl = { era: len };

      // This is utter bullshit. Different calendars are going to define eras totally differently. What I need is the minimum set of dates
      // to definitely enumerate them.
      if (!this.eraCache[len]) {
        this.eraCache[len] = [DateTime.utc(-40, 1, 1), DateTime.utc(2017, 1, 1)].map(dt =>
          this.extract(dt, intl, "era")
        );
      }

      return this.eraCache[len] as string[];
    });
  }

  extract(dt: DateTime, intlOptions: DateTimeFormatOptions, field: Intl.DateTimeFormatPartTypes) {
    const df = this.dtFormatter(dt, intlOptions),
      results = df.formatToParts(),
      // Lower case comparison, type is 'dayperiod' instead of 'dayPeriod' in documentation
      matching = results.find(
        (m: Intl.DateTimeFormatPart) => m.type.toLowerCase() === field.toLowerCase()
      );

    if (!matching) throw new Error(`Invalid extract field ${field}`);
    return matching.value;
  }

  numberFormatter(options: NumberFormatterOptions = {}) {
    return new PolyNumberFormatter(this.intl, this.fastNumbers, options);
  }

  dtFormatter(dt: DateTime, intlOptions: DateTimeFormatOptions = {}) {
    return new PolyDateFormatter(dt, this.intl, intlOptions);
  }

  relFormatter(options: Intl.RelativeTimeFormatOptions = {}) {
    return new PolyRelFormatter(this.intl, this.isEnglish(), options);
  }

  isEnglish() {
    return (
      this.locale === "en" ||
      this.locale.toLowerCase() === "en-us" ||
      (hasIntl() && new Intl.DateTimeFormat(this.intl).resolvedOptions().locale.startsWith("en-us"))
    );
  }

  equals(other: Locale) {
    return (
      this.locale === other.locale &&
      this.numberingSystem === other.numberingSystem &&
      this.outputCalendar === other.outputCalendar
    );
  }
}
