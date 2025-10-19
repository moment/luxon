import { parseMillis, isUndefined, untruncateYear, signedOffset, hasOwnProperty } from "./util.ts";
import Formatter, { type FormatToken } from "./formatter.ts";
import FixedOffsetZone from "../zones/fixedOffsetZone.ts";
import IANAZone from "../zones/IANAZone.ts";
import DateTime from "../datetime.ts";
import { digitRegex, parseDigits } from "./digits.ts";
import { ConflictingSpecificationError } from "../errors.js";
import type Locale from "./locale.ts";
import type Zone from "../zone.ts";
import type { DateTimeObjectInput } from "./dateObjects.ts";

const MISSING_FTP = "missing Intl.DateTimeFormat.formatToParts support";

interface FormatTokenParser<T> {
  regex: RegExp;
  deser: (strings: string[]) => T;
  groups?: number;
  literal?: boolean;
  token?: FormatToken;
  invalidReason?: never;
}

interface FormatTokenParserInvalidMarker {
  // TODO: Remove Invalid
  invalidReason: string;
  token?: FormatToken;
}

function intUnit(regex: RegExp, post = (i: number): number => i): FormatTokenParser<number> {
  return { regex, deser: ([s]) => post(parseDigits(s)) };
}

const NBSP = String.fromCharCode(160);
const spaceOrNBSP = `[ ${NBSP}]`;
const spaceOrNBSPRegExp = new RegExp(spaceOrNBSP, "g");

function fixListRegex(s: string): string {
  // make dots optional and also make them literal
  // make space and non breakable space characters interchangeable
  return s.replace(/\./g, "\\.?").replace(spaceOrNBSPRegExp, spaceOrNBSP);
}

function stripInsensitivities(s: string): string {
  return s
    .replace(/\./g, "") // ignore dots that were made optional
    .replace(spaceOrNBSPRegExp, " ") // interchange space and nbsp
    .toLowerCase();
}

function oneOf(strings: string[] | null, startIndex: number): FormatTokenParser<number> | null {
  if (strings === null) {
    return null;
  } else {
    return {
      regex: RegExp(strings.map(fixListRegex).join("|")),
      deser: ([s]) =>
        strings.findIndex((i) => stripInsensitivities(s) === stripInsensitivities(i)) + startIndex,
    };
  }
}

function offset(regex: RegExp, groups: number): FormatTokenParser<number> {
  return { regex, deser: ([, h, m]) => signedOffset(h, m), groups };
}

function simple(regex: RegExp): FormatTokenParser<string> {
  return { regex, deser: ([s]) => s };
}

function escapeToken(value: string): string {
  return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}

/**
 * @param token
 * @param {Locale} loc
 */
function unitForToken(
  token: FormatToken,
  loc: Locale
): FormatTokenParser<string> | FormatTokenParser<number> | FormatTokenParserInvalidMarker {
  const one = digitRegex(loc),
    two = digitRegex(loc, "{2}"),
    three = digitRegex(loc, "{3}"),
    four = digitRegex(loc, "{4}"),
    six = digitRegex(loc, "{6}"),
    oneOrTwo = digitRegex(loc, "{1,2}"),
    oneToThree = digitRegex(loc, "{1,3}"),
    oneToSix = digitRegex(loc, "{1,6}"),
    oneToNine = digitRegex(loc, "{1,9}"),
    twoToFour = digitRegex(loc, "{2,4}"),
    fourToSix = digitRegex(loc, "{4,6}"),
    literal = (t: FormatToken): FormatTokenParser<string> => ({
      regex: RegExp(escapeToken(t.val)),
      deser: ([s]) => s,
      literal: true,
    }),
    unitate = (t: FormatToken): FormatTokenParser<number> | FormatTokenParser<string> | null => {
      if (token.literal) {
        return literal(t);
      }
      switch (t.val) {
        // era
        case "G":
          return oneOf(loc.eras("short"), 0);
        case "GG":
          return oneOf(loc.eras("long"), 0);
        // years
        case "y":
          return intUnit(oneToSix);
        case "yy":
          return intUnit(twoToFour, untruncateYear);
        case "yyyy":
          return intUnit(four);
        case "yyyyy":
          return intUnit(fourToSix);
        case "yyyyyy":
          return intUnit(six);
        // months
        case "M":
          return intUnit(oneOrTwo);
        case "MM":
          return intUnit(two);
        case "MMM":
          return oneOf(loc.months("short", true), 1);
        case "MMMM":
          return oneOf(loc.months("long", true), 1);
        case "L":
          return intUnit(oneOrTwo);
        case "LL":
          return intUnit(two);
        case "LLL":
          return oneOf(loc.months("short", false), 1);
        case "LLLL":
          return oneOf(loc.months("long", false), 1);
        // dates
        case "d":
          return intUnit(oneOrTwo);
        case "dd":
          return intUnit(two);
        // ordinals
        case "o":
          return intUnit(oneToThree);
        case "ooo":
          return intUnit(three);
        // time
        case "HH":
          return intUnit(two);
        case "H":
          return intUnit(oneOrTwo);
        case "hh":
          return intUnit(two);
        case "h":
          return intUnit(oneOrTwo);
        case "mm":
          return intUnit(two);
        case "m":
          return intUnit(oneOrTwo);
        case "q":
          return intUnit(oneOrTwo);
        case "qq":
          return intUnit(two);
        case "s":
          return intUnit(oneOrTwo);
        case "ss":
          return intUnit(two);
        case "S":
          return intUnit(oneToThree);
        case "SSS":
          return intUnit(three);
        case "u":
          return simple(oneToNine);
        case "uu":
          return simple(oneOrTwo);
        case "uuu":
          return intUnit(one);
        // meridiem
        case "a":
          return oneOf(loc.meridiems(), 0);
        // weekYear (k)
        case "kkkk":
          return intUnit(four);
        case "kk":
          return intUnit(twoToFour, untruncateYear);
        // weekNumber (W)
        case "W":
          return intUnit(oneOrTwo);
        case "WW":
          return intUnit(two);
        // weekdays
        case "E":
        case "c":
          return intUnit(one);
        case "EEE":
          return oneOf(loc.weekdays("short", false), 1);
        case "EEEE":
          return oneOf(loc.weekdays("long", false), 1);
        case "ccc":
          return oneOf(loc.weekdays("short", true), 1);
        case "cccc":
          return oneOf(loc.weekdays("long", true), 1);
        // offset/zone
        case "Z":
        case "ZZ":
          return offset(new RegExp(`([+-]${oneOrTwo.source})(?::(${two.source}))?`), 2);
        case "ZZZ":
          return offset(new RegExp(`([+-]${oneOrTwo.source})(${two.source})?`), 2);
        // we don't support ZZZZ (PST) or ZZZZZ (Pacific Standard Time) in parsing
        // because we don't have any way to figure out what they are
        case "z":
          return simple(/[a-z_+-/]{1,256}?/i);
        // this special-case "token" represents a place where a macro-token expanded into a white-space literal
        // in this case we accept any non-newline white-space
        case " ":
          return simple(/[^\S\n\r]/);
        default:
          return literal(t);
      }
    };

  const unit:
    | FormatTokenParser<string>
    | FormatTokenParser<number>
    | FormatTokenParserInvalidMarker = unitate(token) || {
    invalidReason: MISSING_FTP,
  };

  unit.token = token;

  return unit;
}

const partTypeStyleToTokenVal = {
  year: {
    "2-digit": "yy",
    numeric: "yyyyy",
  },
  month: {
    numeric: "M",
    "2-digit": "MM",
    short: "MMM",
    long: "MMMM",
  },
  day: {
    numeric: "d",
    "2-digit": "dd",
  },
  weekday: {
    short: "EEE",
    long: "EEEE",
  },
  dayperiod: "a",
  dayPeriod: "a",
  hour12: {
    numeric: "h",
    "2-digit": "hh",
  },
  hour24: {
    numeric: "H",
    "2-digit": "HH",
  },
  minute: {
    numeric: "m",
    "2-digit": "mm",
  },
  second: {
    numeric: "s",
    "2-digit": "ss",
  },
  timeZoneName: {
    long: "ZZZZZ",
    short: "ZZZ",
  },
};

function tokenForPart(
  part: Intl.DateTimeFormatPart,
  formatOpts: Intl.DateTimeFormatOptions,
  resolvedOpts: Intl.ResolvedDateTimeFormatOptions
): FormatToken | undefined {
  const { type, value } = part;

  if (type === "literal") {
    const isSpace = /^\s+$/.test(value);
    return {
      literal: !isSpace,
      val: isSpace ? " " : value,
    };
  }

  const style = formatOpts[type];

  // The user might have explicitly specified hour12 or hourCycle
  // if so, respect their decision
  // if not, refer back to the resolvedOpts, which are based on the locale
  let actualType: Intl.DateTimeFormatPartTypes | "hour12" | "hour24" = type;
  if (type === "hour") {
    if (formatOpts.hour12 != null) {
      actualType = formatOpts.hour12 ? "hour12" : "hour24";
    } else if (formatOpts.hourCycle != null) {
      if (formatOpts.hourCycle === "h11" || formatOpts.hourCycle === "h12") {
        actualType = "hour12";
      } else {
        actualType = "hour24";
      }
    } else {
      // tokens only differentiate between 24 hours or not,
      // so we do not need to check hourCycle here, which is less supported anyways
      actualType = resolvedOpts.hour12 ? "hour12" : "hour24";
    }
  }
  let val = partTypeStyleToTokenVal[actualType];
  if (typeof val === "object") {
    val = val[style];
  }

  if (val) {
    return {
      literal: false,
      val,
    };
  }

  return undefined;
}

function buildRegex(units: Array<FormatTokenParser<unknown>>): string {
  const re = units.map((u) => u.regex).reduce((f, r) => `${f}(${r.source})`, "");
  return `^${re}$`;
}

function match(
  input: string,
  regex: RegExp,
  handlers: Array<FormatTokenParser<string> | FormatTokenParser<number>>
): [rawMatches: RegExpMatchArray | null, Record<string, number | string>] {
  const matches = input.match(regex);

  if (matches) {
    const all: Record<string, number | string> = {};
    let matchIndex = 1;
    for (const h of handlers) {
      const groups = h.groups ? h.groups + 1 : 1;
      if (!h.literal && h.token) {
        all[h.token.val[0]] = h.deser(matches.slice(matchIndex, matchIndex + groups));
      }
      matchIndex += groups;
    }
    return [matches, all];
  } else {
    return [matches, {}];
  }
}

function dateTimeFromMatches(
  matches: Record<string, string | number>
): [vals: DateTimeObjectInput, zone: Zone | null, offset: number | undefined] {
  const toField = (token: string) => {
    switch (token) {
      case "S":
        return "millisecond";
      case "s":
        return "second";
      case "m":
        return "minute";
      case "h":
      case "H":
        return "hour";
      case "d":
        return "day";
      case "o":
        return "ordinal";
      case "L":
      case "M":
        return "month";
      case "y":
        return "year";
      case "E":
      case "c":
        return "weekday";
      case "W":
        return "weekNumber";
      case "k":
        return "weekYear";
      case "q":
        return "quarter";
      default:
        return null;
    }
  };

  let zone = null;
  let specificOffset;
  if (!isUndefined(matches.z)) {
    zone = IANAZone.create(matches.z);
  }

  if (!isUndefined(matches.Z)) {
    if (!zone) {
      zone = new FixedOffsetZone(matches.Z);
    }
    specificOffset = matches.Z;
  }

  if (!isUndefined(matches.q)) {
    matches.M = (matches.q - 1) * 3 + 1;
  }

  if (!isUndefined(matches.h)) {
    if (matches.h < 12 && matches.a === 1) {
      matches.h += 12;
    } else if (matches.h === 12 && matches.a === 0) {
      matches.h = 0;
    }
  }

  if (matches.G === 0 && matches.y) {
    matches.y = -matches.y;
  }

  if (!isUndefined(matches.u)) {
    matches.S = parseMillis(matches.u);
  }

  const vals = Object.keys(matches).reduce((r, k) => {
    const f = toField(k);
    if (f) {
      r[f] = matches[k];
    }

    return r;
  }, {});

  return [vals, zone, specificOffset as number | undefined];
}

let dummyDateTimeCache: DateTime | null = null;

function getDummyDateTime(): DateTime {
  if (!dummyDateTimeCache) {
    dummyDateTimeCache = DateTime.fromMillis(1555555555555);
  }

  return dummyDateTimeCache;
}

function maybeExpandMacroToken(token: FormatToken, locale: Locale): FormatToken | FormatToken[] {
  if (token.literal) {
    return token;
  }

  const formatOpts = Formatter.macroTokenToFormatOpts(token.val);
  const tokens = formatOptsToTokens(formatOpts, locale);

  if (tokens == null || tokens.includes(undefined)) {
    return token;
  }

  return tokens as FormatToken[];
}

export function expandMacroTokens(tokens: FormatToken[], locale: Locale): FormatToken[] {
  return tokens.flatMap((t) => maybeExpandMacroToken(t, locale));
}

export interface ParseExplanation {
  input: string;
  tokens: FormatToken[];
  regex: RegExp;
  rawMatches: RegExpMatchArray | null;
  matches: Record<string, string | number>;
  result: DateTimeObjectInput | null;
  zone: Zone | null;
  specificOffset: number | undefined;
}

/**
 * @private
 */

// TODO: create exportable opaque type for "buildFormatParser"
export class TokenParser {
  // TODO: make these private?
  readonly locale: Locale;
  readonly format: string;

  private readonly regex?: RegExp;
  private readonly tokens: FormatToken[];
  private readonly units: Array<
    FormatTokenParser<string> | FormatTokenParser<number> | FormatTokenParserInvalidMarker
  >;
  /**
   * @deprecated
   * @private
   */
  private readonly handlers?: Array<
    FormatTokenParser<string> | FormatTokenParser<number> | FormatTokenParserInvalidMarker
  >;
  private readonly disqualifyingUnit: FormatTokenParserInvalidMarker | undefined;

  constructor(locale: Locale, format: string) {
    this.locale = locale;
    this.format = format;
    this.tokens = expandMacroTokens(Formatter.parseFormat(format), locale);
    this.units = this.tokens.map((t) => unitForToken(t, locale));
    this.disqualifyingUnit = this.units.find(
      (t): t is FormatTokenParserInvalidMarker => !!t.invalidReason
    );

    if (!this.disqualifyingUnit) {
      const regexString = buildRegex(
        // TODO: Remove cast when invalid is removed
        this.units as Array<FormatTokenParser<string> | FormatTokenParser<number>>
      );
      this.regex = RegExp(regexString, "i");
      this.handlers = this.units;
    }
  }

  explainFromTokens(input: string): ParseExplanation {
    if (!this.isValid) {
      // TODO: Remove invalid
      return { input, tokens: this.tokens, invalidReason: this.invalidReason } as never;
    } else {
      const [rawMatches, matches] = match(
          input,
          this.regex!,
          this.handlers as Array<FormatTokenParser<string> | FormatTokenParser<number>>
        ),
        [result, zone, specificOffset] = matches
          ? dateTimeFromMatches(matches)
          : [null, null, undefined];
      if (hasOwnProperty(matches, "a") && hasOwnProperty(matches, "H")) {
        throw new ConflictingSpecificationError(
          "Can't include meridiem when specifying 24-hour format"
        );
      }
      return {
        input,
        tokens: this.tokens,
        regex: this.regex!,
        rawMatches,
        matches,
        result,
        zone,
        specificOffset,
      };
    }
  }

  get isValid(): boolean {
    return !this.disqualifyingUnit;
  }

  get invalidReason(): string | null {
    return this.disqualifyingUnit ? this.disqualifyingUnit.invalidReason : null;
  }
}

export function explainFromTokens(locale: Locale, input: string, format: string): ParseExplanation {
  const parser = new TokenParser(locale, format);
  return parser.explainFromTokens(input);
}

export function parseFromTokens(
  locale: Locale,
  input: string,
  format: string
): [
  result: DateTimeObjectInput | null,
  zone: Zone | null,
  specificOffset: number | undefined,
  invalidReason: string | null,
] {
  // TODO: Remove invalid
  const { result, zone, specificOffset, invalidReason } = explainFromTokens(
    locale,
    input,
    format
  ) as never;
  return [result, zone, specificOffset, invalidReason];
}

export function formatOptsToTokens(
  formatOpts: Intl.DateTimeFormatOptions | null | undefined,
  locale: Locale
): Array<FormatToken | undefined> | null {
  if (!formatOpts) {
    return null;
  }

  const formatter = Formatter.create(locale, formatOpts);
  const df = formatter.dtFormatter(getDummyDateTime());
  const parts = df.formatToParts();
  const resolvedOpts = df.resolvedOptions();
  return parts.map((p) => tokenForPart(p, formatOpts, resolvedOpts));
}
