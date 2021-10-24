import { StringUnitLength } from "../types/common";
import DateTime from "../datetime";
import { ZoneOffsetFormat } from "../types/zone";
import * as English from "./english";
import * as Formats from "./formats";
import Locale from "./locale";
import { padStart } from "./util";
import Duration from "../duration";
import { DurationUnit } from "../types/duration";

export interface FormatToken {
  literal: boolean;
  val: string;
}

interface FormatterOptions extends Intl.DateTimeFormatOptions {
  allowZ?: boolean;
  forceSimple?: boolean;
  format?: ZoneOffsetFormat;
  padTo?: number;
  floor?: boolean;
}

function stringifyTokens(splits: FormatToken[], tokenToString: (token: string) => string | null) {
  let s = "";
  for (const token of splits) {
    if (token.literal) {
      s += token.val;
    } else {
      s += tokenToString(token.val);
    }
  }
  return s;
}

const macroTokenToFormatOpts: Record<string, Intl.DateTimeFormatOptions> = {
  D: Formats.DATE_SHORT,
  DD: Formats.DATE_MED,
  DDD: Formats.DATE_FULL,
  DDDD: Formats.DATE_HUGE,
  t: Formats.TIME_SIMPLE,
  tt: Formats.TIME_WITH_SECONDS,
  ttt: Formats.TIME_WITH_SHORT_OFFSET,
  tttt: Formats.TIME_WITH_LONG_OFFSET,
  T: Formats.TIME_24_SIMPLE,
  TT: Formats.TIME_24_WITH_SECONDS,
  TTT: Formats.TIME_24_WITH_SHORT_OFFSET,
  TTTT: Formats.TIME_24_WITH_LONG_OFFSET,
  f: Formats.DATETIME_SHORT,
  ff: Formats.DATETIME_MED,
  fff: Formats.DATETIME_FULL,
  ffff: Formats.DATETIME_HUGE,
  F: Formats.DATETIME_SHORT_WITH_SECONDS,
  FF: Formats.DATETIME_MED_WITH_SECONDS,
  FFF: Formats.DATETIME_FULL_WITH_SECONDS,
  FFFF: Formats.DATETIME_HUGE_WITH_SECONDS,
};

/**
 * @private
 */

export default class Formatter {
  // Private readonly fields
  private opts: Readonly<FormatterOptions>;
  private loc: Locale;
  private systemLoc: Locale | null;

  static create(locale: Locale, opts: FormatterOptions = {}): Formatter {
    return new Formatter(locale, opts);
  }

  static parseFormat(fmt: string): {
    literal: boolean;
    val: string;
  }[] {
    let current = null,
      currentFull = "",
      bracketed = false;
    const splits = [];
    for (let i = 0; i < fmt.length; i++) {
      const c = fmt.charAt(i);
      if (c === "'") {
        if (currentFull.length > 0) {
          splits.push({ literal: bracketed, val: currentFull });
        }
        current = null;
        currentFull = "";
        bracketed = !bracketed;
      } else if (bracketed) {
        currentFull += c;
      } else if (c === current) {
        currentFull += c;
      } else {
        if (currentFull.length > 0) {
          splits.push({ literal: false, val: currentFull });
        }
        currentFull = c;
        current = c;
      }
    }

    if (currentFull.length > 0) {
      splits.push({ literal: bracketed, val: currentFull });
    }

    return splits;
  }

  static macroTokenToFormatOpts(token: string): Intl.DateTimeFormatOptions {
    return macroTokenToFormatOpts[token];
  }

  constructor(locale: Locale, formatOpts: FormatterOptions) {
    this.opts = formatOpts;
    this.loc = locale;
    this.systemLoc = null;
  }

  formatWithSystemDefault(dt: DateTime, opts: Intl.DateTimeFormatOptions): string {
    if (this.systemLoc === null) {
      this.systemLoc = this.loc.redefaultToSystem();
    }
    const df = this.systemLoc.dtFormatter(dt, { ...this.opts, ...opts });
    return df.format();
  }

  formatDateTime(dt: DateTime, opts: Intl.DateTimeFormatOptions = {}): string {
    const df = this.loc.dtFormatter(dt, { ...this.opts, ...opts });
    return df.format();
  }

  formatDateTimeParts(
    dt: DateTime,
    opts: Intl.DateTimeFormatOptions = {}
  ): Intl.DateTimeFormatPart[] {
    const df = this.loc.dtFormatter(dt, { ...this.opts, ...opts });
    return df.formatToParts();
  }

  resolvedOptions(
    dt: DateTime,
    opts: Intl.DateTimeFormatOptions = {}
  ): Intl.ResolvedDateTimeFormatOptions {
    const df = this.loc.dtFormatter(dt, { ...this.opts, ...opts });
    return df.resolvedOptions();
  }

  num(n: number, p = 0): string {
    // we get some perf out of doing this here, annoyingly
    if (this.opts.forceSimple) {
      return padStart(n, p);
    }

    const opts = { ...this.opts };

    if (p > 0) {
      opts.padTo = p;
    }

    return this.loc.numberFormatter(opts).format(n);
  }

  formatDateTimeFromString(dt: DateTime, fmt: string): string {
    const knownEnglish = this.loc.listingMode() === "en",
      useDateTimeFormatter = this.loc.outputCalendar && this.loc.outputCalendar !== "gregory",
      string = (opts: Intl.DateTimeFormatOptions, extract: Intl.DateTimeFormatPartTypes) =>
        this.loc.extract(dt, opts, extract),
      formatOffset = (opts: FormatterOptions & { format: ZoneOffsetFormat }) => {
        if (dt.isOffsetFixed && dt.offset === 0 && opts.allowZ) {
          return "Z";
        }

        return dt.isValid ? dt.zone.formatOffset(dt.toMillis(), opts.format) : "";
      },
      meridiem = () =>
        knownEnglish
          ? English.meridiemForDateTime(dt)
          : string({ hour: "numeric", hourCycle: "h12" }, "dayPeriod"),
      month = (length: StringUnitLength, standalone: boolean) =>
        knownEnglish
          ? English.monthForDateTime(dt, length)
          : string(standalone ? { month: length } : { month: length, day: "numeric" }, "month"),
      weekday = (length: StringUnitLength, standalone: boolean) =>
        knownEnglish
          ? English.weekdayForDateTime(dt, length)
          : string(
              standalone ? { weekday: length } : { weekday: length, month: "long", day: "numeric" },
              "weekday"
            ),
      maybeMacro = (token: string) => {
        const formatOpts = Formatter.macroTokenToFormatOpts(token);
        if (formatOpts) {
          return this.formatWithSystemDefault(dt, formatOpts);
        } else {
          return token;
        }
      },
      era = (length: StringUnitLength) =>
        knownEnglish ? English.eraForDateTime(dt, length) : string({ era: length }, "era"),
      tokenToString = (token: string): string | null => {
        // Where possible: http://cldr.unicode.org/translation/date-time-1/date-time#TOC-Standalone-vs.-Format-Styles
        switch (token) {
          // ms
          case "S":
            return this.num(dt.millisecond);
          case "u":
          // falls through
          case "SSS":
            return this.num(dt.millisecond, 3);
          // seconds
          case "s":
            return this.num(dt.second);
          case "ss":
            return this.num(dt.second, 2);
          // fractional seconds
          case "uu":
            return this.num(Math.floor(dt.millisecond / 10), 2);
          case "uuu":
            return this.num(Math.floor(dt.millisecond / 100));
          // minutes
          case "m":
            return this.num(dt.minute);
          case "mm":
            return this.num(dt.minute, 2);
          // hours
          case "h":
            return this.num(dt.hour % 12 === 0 ? 12 : dt.hour % 12);
          case "hh":
            return this.num(dt.hour % 12 === 0 ? 12 : dt.hour % 12, 2);
          case "H":
            return this.num(dt.hour);
          case "HH":
            return this.num(dt.hour, 2);
          // offset
          case "Z":
            // like +6
            return formatOffset({ format: "narrow", allowZ: this.opts.allowZ });
          case "ZZ":
            // like +06:00
            return formatOffset({ format: "short", allowZ: this.opts.allowZ });
          case "ZZZ":
            // like +0600
            return formatOffset({ format: "techie", allowZ: this.opts.allowZ });
          case "ZZZZ":
            // like EST
            return dt.zone.offsetName(dt.toMillis(), { format: "short", locale: this.loc.locale });
          case "ZZZZZ":
            // like Eastern Standard Time
            return dt.zone.offsetName(dt.toMillis(), { format: "long", locale: this.loc.locale });
          // zone
          case "z":
            // like America/New_York
            return dt.zoneName;
          // meridiems
          case "a":
            return meridiem();
          // dates
          case "d":
            return useDateTimeFormatter ? string({ day: "numeric" }, "day") : this.num(dt.day);
          case "dd":
            return useDateTimeFormatter ? string({ day: "2-digit" }, "day") : this.num(dt.day, 2);
          // weekdays - standalone
          case "c":
            // like 1
            return this.num(dt.weekday);
          case "ccc":
            // like 'Tues'
            return weekday("short", true);
          case "cccc":
            // like 'Tuesday'
            return weekday("long", true);
          case "ccccc":
            // like 'T'
            return weekday("narrow", true);
          // weekdays - format
          case "E":
            // like 1
            return this.num(dt.weekday);
          case "EEE":
            // like 'Tues'
            return weekday("short", false);
          case "EEEE":
            // like 'Tuesday'
            return weekday("long", false);
          case "EEEEE":
            // like 'T'
            return weekday("narrow", false);
          // months - standalone
          case "L":
            // like 1
            return useDateTimeFormatter
              ? string({ month: "numeric", day: "numeric" }, "month")
              : this.num(dt.month);
          case "LL":
            // like 01, doesn't seem to work
            return useDateTimeFormatter
              ? string({ month: "2-digit", day: "numeric" }, "month")
              : this.num(dt.month, 2);
          case "LLL":
            // like Jan
            return month("short", true);
          case "LLLL":
            // like January
            return month("long", true);
          case "LLLLL":
            // like J
            return month("narrow", true);
          // months - format
          case "M":
            // like 1
            return useDateTimeFormatter
              ? string({ month: "numeric" }, "month")
              : this.num(dt.month);
          case "MM":
            // like 01
            return useDateTimeFormatter
              ? string({ month: "2-digit" }, "month")
              : this.num(dt.month, 2);
          case "MMM":
            // like Jan
            return month("short", false);
          case "MMMM":
            // like January
            return month("long", false);
          case "MMMMM":
            // like J
            return month("narrow", false);
          // years
          case "y":
            // like 2014
            return useDateTimeFormatter ? string({ year: "numeric" }, "year") : this.num(dt.year);
          case "yy":
            // like 14
            return useDateTimeFormatter
              ? string({ year: "2-digit" }, "year")
              : this.num(parseInt(dt.year.toString().slice(-2)), 2);
          case "yyyy":
            // like 0012
            return useDateTimeFormatter
              ? string({ year: "numeric" }, "year")
              : this.num(dt.year, 4);
          case "yyyyyy":
            // like 000012
            return useDateTimeFormatter
              ? string({ year: "numeric" }, "year")
              : this.num(dt.year, 6);
          // eras
          case "G":
            // like AD
            return era("short");
          case "GG":
            // like Anno Domini
            return era("long");
          case "GGGGG":
            return era("narrow");
          case "kk":
            return this.num(parseInt(dt.weekYear.toString().slice(-2)), 2);
          case "kkkk":
            return this.num(dt.weekYear, 4);
          case "W":
            return this.num(dt.weekNumber);
          case "WW":
            return this.num(dt.weekNumber, 2);
          case "o":
            return this.num(dt.ordinal);
          case "ooo":
            return this.num(dt.ordinal, 3);
          case "q":
            // like 1
            return this.num(dt.quarter);
          case "qq":
            // like 01
            return this.num(dt.quarter, 2);
          case "X":
            return this.num(Math.floor(dt.toMillis() / 1000));
          case "x":
            return this.num(dt.toMillis());
          default:
            return maybeMacro(token);
        }
      };

    return stringifyTokens(Formatter.parseFormat(fmt), tokenToString);
  }

  formatDurationFromString(dur: Duration, fmt: string): string {
    const tokenToField = (token: string) => {
        switch (token[0]) {
          case "S":
            return "millisecond";
          case "s":
            return "second";
          case "m":
            return "minute";
          case "h":
            return "hour";
          case "d":
            return "day";
          case "M":
            return "month";
          case "y":
            return "year";
          default:
            return null;
        }
      },
      tokenToString = (lildur: Duration) => (token: string) => {
        const mapped = tokenToField(token);
        if (mapped) {
          return this.num(lildur.get(mapped), token.length);
        } else {
          return token;
        }
      },
      tokens = Formatter.parseFormat(fmt),
      realTokens = tokens.reduce<string[]>(
        (found, { literal, val }) => (literal ? found : found.concat(val)),
        []
      ),
      collapsed = dur.shiftTo(...(realTokens.map(tokenToField).filter((t) => t) as DurationUnit[]));
    return stringifyTokens(tokens, tokenToString(collapsed));
  }
}
