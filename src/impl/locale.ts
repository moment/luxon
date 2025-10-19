import { hasLocaleWeekInfo, hasRelative, padStart, roundTo, validateWeekSettings } from "./util.ts";
import * as English from "./english.ts";
import Settings from "../settings.js";
import DateTime from "../datetime.js";
import IANAZone from "../zones/IANAZone.ts";
import type { LuxonWeekSettings } from "./weekInfo.ts";
import type Zone from "../zone.ts";

// todo - remap caching

const intlLFCache = new Map<string, Intl.ListFormat>();

function getCachedLF(locString: string, opts: Intl.ListFormatOptions = {}): Intl.ListFormat {
  const key = JSON.stringify([locString, opts]);
  let dtf = intlLFCache.get(key);
  if (!dtf) {
    dtf = new Intl.ListFormat(locString, opts);
    intlLFCache.set(key, dtf);
  }
  return dtf;
}

const intlDTCache = new Map<string, Intl.DateTimeFormat>();

function getCachedDTF(
  locString: string,
  opts: Intl.DateTimeFormatOptions = {}
): Intl.DateTimeFormat {
  const key = JSON.stringify([locString, opts]);
  let dtf = intlDTCache.get(key);
  if (dtf === undefined) {
    dtf = new Intl.DateTimeFormat(locString, opts);
    intlDTCache.set(key, dtf);
  }
  return dtf;
}

const intlNumCache = new Map<string, Intl.NumberFormat>();

function getCachedINF(locString: string, opts: Intl.NumberFormatOptions = {}): Intl.NumberFormat {
  const key = JSON.stringify([locString, opts]);
  let inf = intlNumCache.get(key);
  if (inf === undefined) {
    inf = new Intl.NumberFormat(locString, opts);
    intlNumCache.set(key, inf);
  }
  return inf;
}

const intlRelCache = new Map<string, Intl.RelativeTimeFormat>();

function getCachedRTF(
  locString: string,
  opts: Intl.RelativeTimeFormatOptions & { base?: unknown } = {}
): Intl.RelativeTimeFormat {
  const { base, ...cacheKeyOpts } = opts; // exclude `base` from the options
  const key = JSON.stringify([locString, cacheKeyOpts]);
  let inf = intlRelCache.get(key);
  if (inf === undefined) {
    inf = new Intl.RelativeTimeFormat(locString, opts);
    intlRelCache.set(key, inf);
  }
  return inf;
}

let sysLocaleCache: string | null = null;

function systemLocale(): string {
  return (sysLocaleCache ??= new Intl.DateTimeFormat().resolvedOptions().locale);
}

const intlResolvedOptionsCache = new Map<string, Intl.ResolvedDateTimeFormatOptions>();

function getCachedIntResolvedOptions(locString: string): Intl.ResolvedDateTimeFormatOptions {
  let opts = intlResolvedOptionsCache.get(locString);
  if (opts === undefined) {
    opts = new Intl.DateTimeFormat(locString).resolvedOptions();
    intlResolvedOptionsCache.set(locString, opts);
  }
  return opts;
}

const weekInfoCache = new Map<string, LuxonWeekSettings>();

function getCachedWeekInfo(locString: string): LuxonWeekSettings {
  let data: LuxonWeekSettings | Intl.WeekInfo | undefined = weekInfoCache.get(locString);
  if (!data) {
    const locale = new Intl.Locale(locString);
    // browsers currently implement this as a property, but spec says it should be a getter function
    data = "getWeekInfo" in locale ? locale.getWeekInfo() : (locale as Intl.Locale).weekInfo;
    // minimalDays was removed from WeekInfo: https://github.com/tc39/proposal-intl-locale-info/issues/86
    if (!("minimalDays" in data)) {
      data = { ...fallbackWeekSettings, ...data };
    }
    weekInfoCache.set(locString, data as LuxonWeekSettings);
  }
  return data as LuxonWeekSettings;
}

function parseLocaleString(
  localeStr: string
): [locale: string, numberingSystem?: string, calendar?: string] {
  // I really want to avoid writing a BCP 47 parser
  // see, e.g. https://github.com/wooorm/bcp-47
  // Instead, we'll do this:

  // a) if the string has no -u extensions, just leave it alone
  // b) if it does, use Intl to resolve everything
  // c) if Intl fails, try again without the -u

  // private subtags and unicode subtags have ordering requirements,
  // and we're not properly parsing this, so just strip out the
  // private ones if they exist.
  const xIndex = localeStr.indexOf("-x-");
  if (xIndex !== -1) {
    localeStr = localeStr.substring(0, xIndex);
  }

  const uIndex = localeStr.indexOf("-u-");
  if (uIndex === -1) {
    return [localeStr];
  } else {
    let options;
    let selectedStr;
    try {
      options = getCachedDTF(localeStr).resolvedOptions();
      selectedStr = localeStr;
    } catch (e) {
      const smaller = localeStr.substring(0, uIndex);
      options = getCachedDTF(smaller).resolvedOptions();
      selectedStr = smaller;
    }

    const { numberingSystem, calendar } = options;
    return [selectedStr, numberingSystem, calendar];
  }
}

function intlConfigString(
  localeStr: string,
  numberingSystem: string | null | undefined,
  outputCalendar: string | null | undefined
): string {
  if (outputCalendar || numberingSystem) {
    if (!localeStr.includes("-u-")) {
      localeStr += "-u";
    }

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

function mapMonths<T>(f: (dt: DateTime) => T): T[] {
  const ms: T[] = [];
  for (let i = 1; i <= 12; i++) {
    const dt = DateTime.utc(2009, i, 1);
    ms.push(f(dt));
  }
  return ms;
}

function mapWeekdays<T>(f: (dt: DateTime) => T): T[] {
  const ms: T[] = [];
  for (let i = 1; i <= 7; i++) {
    const dt = DateTime.utc(2016, 11, 13 + i);
    ms.push(f(dt));
  }
  return ms;
}

function listStuff<T, R>(
  loc: Locale,
  length: T,
  englishFn: (length: T) => R,
  intlFn: (length: T) => R
): R {
  const mode = loc.listingMode();
  if (mode === "en") {
    return englishFn(length);
  } else {
    return intlFn(length);
  }
}

function supportsFastNumbers(loc: Locale): boolean {
  if (loc.numberingSystem && loc.numberingSystem !== "latn") {
    return false;
  } else {
    return (
      loc.numberingSystem === "latn" ||
      !loc.locale ||
      loc.locale.startsWith("en") ||
      getCachedIntResolvedOptions(loc.locale).numberingSystem === "latn"
    );
  }
}

/**
 * @private
 */

export interface PolyNumberFormatterOptions extends Intl.NumberFormatOptions {
  padTo?: number | null | undefined;
  floor?: boolean | null | undefined;
}

interface ExtendedPolyNumberFormatterOptions extends PolyNumberFormatterOptions {
  /* TODO: Investigate if this is used at all */
  forceSimple?: boolean;
}

class PolyNumberFormatter {
  private readonly padTo: number;
  private readonly floor: boolean;
  private readonly inf: Intl.NumberFormat | undefined;

  constructor(intl: string, forceSimple: boolean, opts: PolyNumberFormatterOptions) {
    this.padTo = opts.padTo || 0;
    this.floor = opts.floor || false;

    const { padTo, floor, ...otherOpts } = opts;

    if (!forceSimple || Object.keys(otherOpts).length > 0) {
      const intlOpts: Intl.NumberFormatOptions = { useGrouping: false, ...otherOpts };
      if (this.padTo > 0) intlOpts.minimumIntegerDigits = this.padTo;
      this.inf = getCachedINF(intl, intlOpts);
    }
  }

  format(i: number): string {
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

export interface PolyDateFormatterOptions extends Intl.DateTimeFormatOptions {}

export class PolyDateFormatter {
  private readonly dt: DateTime;
  private readonly opts: PolyDateFormatterOptions;
  private readonly originalZone: Zone | undefined;
  readonly dtf: Intl.DateTimeFormat;

  constructor(dt: DateTime, intl: string, opts: PolyDateFormatterOptions) {
    this.opts = opts;
    this.originalZone = undefined;

    let z = undefined;
    if (this.opts.timeZone) {
      // Don't apply any workarounds if a timeZone is explicitly provided in opts
      this.dt = dt;
    } else if (dt.zone.type === "fixed") {
      // UTC-8 or Etc/UTC-8 are not part of tzdata, only Etc/GMT+8 and the like.
      // That is why fixed-offset TZ is set to that unless it is:
      // 1. Representing offset 0 when UTC is used to maintain previous behavior and does not become GMT.
      // 2. Unsupported by the browser:
      //    - some do not support Etc/
      //    - < Etc/GMT-14, > Etc/GMT+12, and 30-minute or 45-minute offsets are not part of tzdata
      const gmtOffset = -1 * (dt.offset / 60);
      const offsetZ = gmtOffset >= 0 ? `Etc/GMT+${gmtOffset}` : `Etc/GMT${gmtOffset}`;
      if (dt.offset !== 0 && IANAZone.isValidZone(offsetZ)) {
        z = offsetZ;
        this.dt = dt;
      } else {
        // Not all fixed-offset zones like Etc/+4:30 are present in tzdata so
        // we manually apply the offset and substitute the zone as needed.
        z = "UTC";
        this.dt = dt.offset === 0 ? dt : dt.setZone("UTC").plus({ minutes: dt.offset });
        this.originalZone = dt.zone;
      }
    } else if (dt.zone.type === "system") {
      this.dt = dt;
    } else if (dt.zone.type === "iana") {
      this.dt = dt;
      z = dt.zone.name;
    } else {
      // Custom zones can have any offset / offsetName so we just manually
      // apply the offset and substitute the zone as needed.
      z = "UTC";
      this.dt = dt.setZone("UTC").plus({ minutes: dt.offset });
      this.originalZone = dt.zone;
    }

    const intlOpts = { ...this.opts };
    intlOpts.timeZone = intlOpts.timeZone || z;
    this.dtf = getCachedDTF(intl, intlOpts);
  }

  format(): string {
    if (this.originalZone) {
      // If we have to substitute in the actual zone name, we have to use
      // formatToParts so that the timezone can be replaced.
      return this.formatToParts()
        .map(({ value }) => value)
        .join("");
    }
    return this.dtf.format(this.dt.toJSDate());
  }

  formatToParts(): Intl.DateTimeFormatPart[] {
    const parts = this.dtf.formatToParts(this.dt.toJSDate());
    if (this.originalZone) {
      return parts.map((part) => {
        if (part.type === "timeZoneName") {
          const offsetName = this.originalZone!.offsetName(this.dt.ts, {
            locale: this.dt.locale,
            format: this.opts.timeZoneName,
          });
          return {
            ...part,
            value: offsetName,
          };
        } else {
          return part;
        }
      });
    }
    return parts;
  }

  resolvedOptions(): Intl.ResolvedDateTimeFormatOptions {
    return this.dtf.resolvedOptions();
  }
}

interface PolyRelFormatterOptions extends Intl.RelativeTimeFormatOptions {}

/**
 * @private
 */
class PolyRelFormatter {
  private readonly opts: PolyRelFormatterOptions;
  private readonly rtf: Intl.RelativeTimeFormat | undefined;

  constructor(intl: string, isEnglish: boolean, opts: PolyRelFormatterOptions) {
    this.opts = { style: "long", ...opts };
    if (!isEnglish && hasRelative()) {
      this.rtf = getCachedRTF(intl, opts);
    }
  }

  format(count: number, unit: Intl.RelativeTimeFormatUnit): string {
    if (this.rtf) {
      return this.rtf.format(count, unit);
    } else {
      return English.formatRelativeTime(unit, count, this.opts.numeric, this.opts.style !== "long");
    }
  }

  formatToParts(count: number, unit: Intl.RelativeTimeFormatUnit): Intl.RelativeTimeFormatPart[] {
    if (this.rtf) {
      return this.rtf.formatToParts(count, unit);
    } else {
      /* TODO: Investigate if this causes problems */
      return [];
    }
  }
}

const fallbackWeekSettings = {
  firstDay: 1,
  minimalDays: 4,
  weekend: [6, 7],
};

export interface LocaleOptions {
  locale?: string | null | undefined;
  numberingSystem?: string | null | undefined;
  outputCalendar?: string | null | undefined;
  weekSettings?: LuxonWeekSettings | null | undefined;
}

export interface InternalLocaleOptions extends LocaleOptions {
  defaultToEN?: boolean | undefined;
}

/**
 * @private
 */
export default class Locale {
  static fromOpts(opts: InternalLocaleOptions): Locale {
    return Locale.create(
      opts.locale,
      opts.numberingSystem,
      opts.outputCalendar,
      opts.weekSettings,
      opts.defaultToEN
    );
  }

  static create(
    locale?: string | null | undefined,
    numberingSystem?: string | null | undefined,
    outputCalendar?: string | null | undefined,
    weekSettings?: LuxonWeekSettings | null | undefined,
    defaultToEN = false
  ): Locale {
    const specifiedLocale = locale || Settings.defaultLocale;
    // the system locale is useful for human-readable strings but annoying for parsing/formatting known formats
    const localeR = specifiedLocale || (defaultToEN ? "en-US" : systemLocale());
    const numberingSystemR = numberingSystem || Settings.defaultNumberingSystem;
    const outputCalendarR = outputCalendar || Settings.defaultOutputCalendar;
    const weekSettingsR = validateWeekSettings(weekSettings) || Settings.defaultWeekSettings;
    return new Locale(localeR, numberingSystemR, outputCalendarR, weekSettingsR, specifiedLocale);
  }

  static resetCache() {
    sysLocaleCache = null;
    intlDTCache.clear();
    intlLFCache.clear();
    intlNumCache.clear();
    intlRelCache.clear();
    intlResolvedOptionsCache.clear();
    weekInfoCache.clear();
  }

  static fromObject({ locale, numberingSystem, outputCalendar, weekSettings }: LocaleOptions = {}) {
    return Locale.create(locale, numberingSystem, outputCalendar, weekSettings);
  }

  readonly locale: string;
  readonly numberingSystem: string | null;
  readonly outputCalendar: string | null;
  private readonly weekSettings: LuxonWeekSettings | null;
  private readonly intl: string;
  private readonly specifiedLocale: string;

  private readonly weekdaysCache: Record<
    "format" | "standalone",
    Partial<Record<NonNullable<Intl.DateTimeFormatOptions["weekday"]>, string[]>>
  >;
  private readonly monthsCache: Record<
    "format" | "standalone",
    Partial<Record<NonNullable<Intl.DateTimeFormatOptions["month"]>, string[]>>
  >;
  private meridiemCache: string[] | null;
  private readonly eraCache: Partial<
    Record<NonNullable<Intl.DateTimeFormatOptions["era"]>, string[]>
  >;
  private fastNumbersCached: boolean | null;

  constructor(
    locale: string,
    numbering: string | null,
    outputCalendar: string | null,
    weekSettings: LuxonWeekSettings | null,
    specifiedLocale: string
  ) {
    const [parsedLocale, parsedNumberingSystem, parsedOutputCalendar] = parseLocaleString(locale);

    this.locale = parsedLocale;
    this.numberingSystem = numbering || parsedNumberingSystem || null;
    this.outputCalendar = outputCalendar || parsedOutputCalendar || null;
    this.weekSettings = weekSettings;
    this.intl = intlConfigString(this.locale, this.numberingSystem, this.outputCalendar);

    this.weekdaysCache = { format: {}, standalone: {} };
    this.monthsCache = { format: {}, standalone: {} };
    this.meridiemCache = null;
    this.eraCache = {};

    this.specifiedLocale = specifiedLocale;
    this.fastNumbersCached = null;
  }

  get fastNumbers() {
    return (this.fastNumbersCached ??= supportsFastNumbers(this));
  }

  listingMode(): "en" | "intl" {
    const isActuallyEn = this.isEnglish();
    const hasNoWeirdness =
      (this.numberingSystem === null || this.numberingSystem === "latn") &&
      (this.outputCalendar === null || this.outputCalendar === "gregory");
    return isActuallyEn && hasNoWeirdness ? "en" : "intl";
  }

  clone(alts: InternalLocaleOptions | null | undefined) {
    if (!alts || Object.getOwnPropertyNames(alts).length === 0) {
      return this;
    } else {
      return Locale.create(
        alts.locale || this.specifiedLocale,
        alts.numberingSystem || this.numberingSystem,
        alts.outputCalendar || this.outputCalendar,
        validateWeekSettings(alts.weekSettings) || this.weekSettings,
        alts.defaultToEN || false
      );
    }
  }

  redefaultToEN(alts = {}) {
    return this.clone({ ...alts, defaultToEN: true });
  }

  redefaultToSystem(alts = {}) {
    return this.clone({ ...alts, defaultToEN: false });
  }

  months(length: NonNullable<Intl.DateTimeFormatOptions["month"]>, format = false): string[] {
    return listStuff(this, length, English.months, () => {
      // Workaround for "ja" locale: formatToParts does not label all parts of the month
      // as "month" and for this locale there is no difference between "format" and "non-format".
      // As such, just use format() instead of formatToParts() and take the whole string
      const monthSpecialCase = this.intl === "ja" || this.intl.startsWith("ja-");
      format &&= !monthSpecialCase;
      const intl: Intl.DateTimeFormatOptions = format
          ? { month: length, day: "numeric" }
          : { month: length },
        formatStr = format ? "format" : "standalone";
      if (!this.monthsCache[formatStr][length]) {
        const mapper = !monthSpecialCase
          ? (dt: DateTime): string => this.extract(dt, intl, "month")
          : (dt: DateTime): string => this.dtFormatter(dt, intl).format();
        this.monthsCache[formatStr][length] = mapMonths(mapper);
      }
      return this.monthsCache[formatStr][length];
    });
  }

  weekdays(length: NonNullable<Intl.DateTimeFormatOptions["weekday"]>, format = false): string[] {
    return listStuff(this, length, English.weekdays, () => {
      const intl: Intl.DateTimeFormatOptions = format
          ? { weekday: length, year: "numeric", month: "long", day: "numeric" }
          : { weekday: length },
        formatStr = format ? "format" : "standalone";
      if (!this.weekdaysCache[formatStr][length]) {
        this.weekdaysCache[formatStr][length] = mapWeekdays((dt) =>
          this.extract(dt, intl, "weekday")
        );
      }
      return this.weekdaysCache[formatStr][length];
    });
  }

  meridiems(): string[] {
    return listStuff(
      this,
      undefined,
      () => English.meridiems,
      () => {
        // In theory there could be aribitrary day periods. We're gonna assume there are exactly two
        // for AM and PM. This is probably wrong, but it's makes parsing way easier.
        if (!this.meridiemCache) {
          const intl: Intl.DateTimeFormatOptions = { hour: "numeric", hourCycle: "h12" };
          this.meridiemCache = [DateTime.utc(2016, 11, 13, 9), DateTime.utc(2016, 11, 13, 19)].map(
            (dt) => this.extract(dt, intl, "dayPeriod")
          );
        }

        return this.meridiemCache;
      }
    );
  }

  eras(length: NonNullable<Intl.DateTimeFormatOptions["era"]>): string[] {
    return listStuff(this, length, English.eras, () => {
      const intl = { era: length };

      // This is problematic. Different calendars are going to define eras totally differently. What I need is the minimum set of dates
      // to definitely enumerate them.
      if (!this.eraCache[length]) {
        this.eraCache[length] = [DateTime.utc(-40, 1, 1), DateTime.utc(2017, 1, 1)].map((dt) =>
          this.extract(dt, intl, "era")
        );
      }

      return this.eraCache[length];
    });
  }

  extract(
    dt: DateTime,
    intlOpts: Intl.DateTimeFormatOptions,
    field: Intl.DateTimeFormatPart["type"]
  ): string {
    const df = this.dtFormatter(dt, intlOpts),
      results = df.formatToParts(),
      matching = results.find((m) => m.type === field);
    return matching
      ? matching.value
      : null! /* TODO: Add error checking instead of returning null */;
  }

  numberFormatter(opts: ExtendedPolyNumberFormatterOptions = {}): PolyNumberFormatter {
    // this forcesimple option is never used (the only caller short-circuits on it, but it seems safer to leave)
    // (in contrast, the rest of the condition is used heavily)
    return new PolyNumberFormatter(this.intl, opts.forceSimple || this.fastNumbers, opts);
  }

  dtFormatter(dt: DateTime, intlOpts: PolyDateFormatterOptions = {}): PolyDateFormatter {
    return new PolyDateFormatter(dt, this.intl, intlOpts);
  }

  relFormatter(opts: PolyRelFormatterOptions = {}): PolyRelFormatter {
    return new PolyRelFormatter(this.intl, this.isEnglish(), opts);
  }

  listFormatter(opts: Intl.ListFormatOptions = {}): Intl.ListFormat {
    return getCachedLF(this.intl, opts);
  }

  isEnglish(): boolean {
    return (
      this.locale === "en" ||
      this.locale.toLowerCase() === "en-us" ||
      getCachedIntResolvedOptions(this.intl).locale.startsWith("en-us")
    );
  }

  getWeekSettings(): LuxonWeekSettings {
    if (this.weekSettings) {
      return this.weekSettings;
    } else if (!hasLocaleWeekInfo()) {
      return fallbackWeekSettings;
    } else {
      return getCachedWeekInfo(this.locale);
    }
  }

  getStartOfWeek(): number {
    return this.getWeekSettings().firstDay;
  }

  getMinDaysInFirstWeek(): number {
    return this.getWeekSettings().minimalDays;
  }

  getWeekendDays(): number[] {
    return this.getWeekSettings().weekend;
  }

  equals(other: Locale): boolean {
    return (
      this.locale === other.locale &&
      this.numberingSystem === other.numberingSystem &&
      this.outputCalendar === other.outputCalendar
    );
  }

  toString(): string {
    return `Locale(${this.locale}, ${this.numberingSystem}, ${this.outputCalendar})`;
  }
}
