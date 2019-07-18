import { parseMillis, isUndefined, untruncateYear, signedOffset } from "./util";
import Formatter, { FormatToken } from "./formatter";
import FixedOffsetZone from "../zones/fixedOffsetZone";
import IANAZone from "../zones/IANAZone";
import { digitRegex, parseDigits } from "./digits";
import Locale from "./locale";
import { GenericDateTime, ExplainedFormat } from "../types/datetime";
import Zone from "../zone";
import DateTime from "../datetime";
import { ConflictingSpecificationError } from "../errors";

const MISSING_FTP = "missing Intl.DateTimeFormat.formatToParts support";

interface UnitParser {
  regex: RegExp;
  deser: (_: string[]) => number | string;
  groups?: number;
  literal?: boolean; // TODO investigate if this shall not be merged with token.literal
  token: FormatToken;
}

interface InvalidUnitParser {
  invalidReason: string;
}

type CoreUnitParser = Omit<UnitParser, "token">;

function intUnit(regex: RegExp, post: (_: number) => number = i => i): CoreUnitParser {
  return { regex, deser: ([s]) => post(parseDigits(s)) };
}

function fixListRegex(s: string) {
  // make dots optional and also make them literal
  return s.replace(/\./, "\\.?");
}

function stripInsensitivities(s: string) {
  return s.replace(/\./, "").toLowerCase();
}

function oneOf(strings: string[], startIndex: number): CoreUnitParser {
  return {
    regex: RegExp(strings.map(fixListRegex).join("|")),
    deser: ([s]) =>
      strings.findIndex(i => stripInsensitivities(s) === stripInsensitivities(i)) + startIndex
  };
}

function offset(regex: RegExp, groups: number): CoreUnitParser {
  return { regex, deser: ([, h, m]) => signedOffset(h, m), groups };
}

function simple(regex: RegExp): CoreUnitParser {
  return { regex, deser: ([s]) => s };
}

function escapeToken(value: string) {
  // eslint-disable-next-line no-useless-escape
  return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}

function unitForToken(token: FormatToken, loc: Locale) {
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
    literal = (t: FormatToken): CoreUnitParser => ({
      regex: RegExp(escapeToken(t.val)),
      deser: ([s]) => s,
      literal: true
    }),
    unitate = (t: FormatToken) => {
      if (token.literal) {
        return literal(t);
      }
      switch (t.val) {
        // era
        case "G":
          return oneOf(loc.eras("short", false), 0);
        case "GG":
          return oneOf(loc.eras("long", false), 0);
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
          return oneOf(loc.months("short", true, false), 1);
        case "MMMM":
          return oneOf(loc.months("long", true, false), 1);
        case "L":
          return intUnit(oneOrTwo);
        case "LL":
          return intUnit(two);
        case "LLL":
          return oneOf(loc.months("short", false, false), 1);
        case "LLLL":
          return oneOf(loc.months("long", false, false), 1);
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
          return oneOf(loc.weekdays("short", false, false), 1);
        case "EEEE":
          return oneOf(loc.weekdays("long", false, false), 1);
        case "ccc":
          return oneOf(loc.weekdays("short", true, false), 1);
        case "cccc":
          return oneOf(loc.weekdays("long", true, false), 1);
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
        default:
          return literal(t);
      }
    };

  const unit = unitate(token);

  if (unit === null)
    return {
      invalidReason: MISSING_FTP
    };

  return { ...unit, token };
}

const partTypeStyleToTokenVal: Record<
  Intl.DateTimeFormatPartTypes,
  Record<string, string> | undefined
> = {
  literal: undefined, // Never used
  dayPeriod: undefined, // Never used
  era: undefined, // TODO investigate
  timeZoneName: undefined, // TODO investigate
  year: {
    "2-digit": "yy",
    numeric: "yyyyy"
  },
  month: {
    numeric: "M",
    "2-digit": "MM",
    short: "MMM",
    long: "MMMM"
  },
  day: {
    numeric: "d",
    "2-digit": "dd"
  },
  weekday: {
    short: "EEE",
    long: "EEEE"
  },
  hour: {
    numeric: "h",
    "2-digit": "hh"
  },
  minute: {
    numeric: "m",
    "2-digit": "mm"
  },
  second: {
    numeric: "s",
    "2-digit": "ss"
  }
};

function tokenForPart(part: Intl.DateTimeFormatPart, formatOptions: Intl.DateTimeFormatOptions) {
  const { type, value } = part;

  if (type === "literal") {
    return {
      literal: true,
      val: value
    };
  }

  if (type === "dayPeriod") {
    return {
      literal: false,
      val: "a"
    };
  }

  const tokenVals = partTypeStyleToTokenVal[type];
  if (tokenVals !== undefined) {
    const style = formatOptions[type];
    if (style) {
      const val = tokenVals[style];
      if (val !== undefined) {
        return {
          literal: false,
          val
        };
      }
    }
  }

  return undefined;
}

function buildRegex(units: UnitParser[]) {
  const re = units.map(u => u.regex).reduce((f, r) => `${f}(${r.source})`, "");
  return `^${re}$`;
}

function match(
  input: string,
  regex: RegExp,
  handlers: UnitParser[]
): [RegExpMatchArray | null, Record<string, number | string>] {
  const matches = regex.exec(input);
  const all: Record<string, number | string> = {};

  if (matches !== null) {
    let matchIndex = 1;
    handlers.forEach(h => {
      const groups = h.groups ? h.groups + 1 : 1;
      if (!h.literal) {
        all[h.token.val[0]] = h.deser(matches.slice(matchIndex, matchIndex + groups));
      }
      matchIndex += groups;
    });
  }

  return [matches, all];
}

function dateTimeFromMatches(
  matches: Record<string, string | number>
): [GenericDateTime, Zone | null] {
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
      default:
        return null;
    }
  };

  let zone;
  if (!isUndefined(matches.Z)) {
    zone = new FixedOffsetZone(matches.Z as number);
  } else if (!isUndefined(matches.z)) {
    zone = IANAZone.create(matches.z as string);
  } else {
    zone = null;
  }

  if (!isUndefined(matches.q)) {
    matches.M = ((matches.q as number) - 1) * 3 + 1;
  }

  if (!isUndefined(matches.h)) {
    if (matches.h < 12 && matches.a === 1) {
      matches.h = (matches.h as number) + 12;
    } else if (matches.h === 12 && matches.a === 0) {
      matches.h = 0;
    }
  }

  if (matches.G === 0 && matches.y) {
    matches.y = -matches.y;
  }

  if (!isUndefined(matches.u)) {
    matches.S = parseMillis(matches.u as string) || 0;
  }

  const vals = Object.keys(matches).reduce<GenericDateTime>((r, k) => {
    const f = toField(k);
    if (f) {
      r[f] = matches[k] as number;
    }

    return r;
  }, {});

  return [vals, zone];
}

let dummyDateTimeCache: DateTime | undefined;

function getDummyDateTime() {
  if (dummyDateTimeCache === undefined) {
    dummyDateTimeCache = DateTime.fromMillis(1555555555555);
  }

  return dummyDateTimeCache;
}

function maybeExpandMacroToken(token: FormatToken, locale: Locale) {
  if (token.literal) {
    return token;
  }

  const formatOpts = Formatter.macroTokenToFormatOpts(token.val);

  if (!formatOpts) {
    return token;
  }

  const formatter = Formatter.create(locale, formatOpts);
  const parts = formatter.formatDateTimeParts(getDummyDateTime());

  const tokens = parts.map(p => tokenForPart(p, formatOpts));

  if (tokens.indexOf(undefined) >= 0) {
    return token;
  }

  return tokens;
}

function expandMacroTokens(tokens: FormatToken[], locale: Locale) {
  return Array.prototype.concat(...tokens.map(t => maybeExpandMacroToken(t, locale)));
}

function isInvalidUnitParser(parser: unknown): parser is InvalidUnitParser {
  return !!parser && !!(parser as { invalidReason: string | undefined }).invalidReason;
}

/**
 * @private
 */
export function explainFromTokens(locale: Locale, input: string, format: string): ExplainedFormat {
  const tokens = expandMacroTokens(Formatter.parseFormat(format), locale),
    units = tokens.map(t => unitForToken(t, locale)),
    disqualifyingUnit = units.find(isInvalidUnitParser);

  if (disqualifyingUnit) {
    return { input, tokens, invalidReason: disqualifyingUnit.invalidReason };
  } else {
    const regexString = buildRegex(units as UnitParser[]),
      regex = RegExp(regexString, "i"),
      [rawMatches, matches] = match(input, regex, units as UnitParser[]),
      [result, zone] = matches ? dateTimeFromMatches(matches) : [null, null];
    if ("a" in matches && "H" in matches) {
      throw new ConflictingSpecificationError(
        "Can't include meridiem when specifying 24-hour format"
      );
    }
    return { input, tokens, regex, rawMatches, matches, result, zone };
  }
}

export function parseFromTokens(
  locale: Locale,
  input: string,
  format: string
): [GenericDateTime | null | undefined, Zone | null | undefined, string | undefined] {
  const { result, zone, invalidReason } = explainFromTokens(locale, input, format);
  return [result, zone, invalidReason];
}
