import { Util } from './util';
import { Formatter } from './formatter';

function intUnit(regex, post = i => i) {
  return { regex, deser: s => post(parseInt(s, 10)) };
}

function untruncateYear(years) {
  return years > 60 ? 1900 + years : 2000 + years;
}

function oneOf(strings, startIndex) {
  return { regex: RegExp(strings.join('|')), deser: s => strings.indexOf(s) + startIndex };
}

function unitForToken(token, loc) {
  const one = /\d/,
    two = /\d\d/,
    three = /\d{3}/,
    four = /\d{4}/,
    oneOrTwo = /\d\d?/,
    oneToThree = /\d\d{2}?/,
    twoToFour = /\d\d\d{2}?/,
    literal = t => ({ regex: RegExp(t.val), deser: s => s, literal: true }),
    unitate = t => {
      if (token.literal) {
        return literal(t);
      }

      switch (t.val) {
        // era (G)
        // years
        case 'yyyy':
          return intUnit(four);
        case 'yy':
          return intUnit(twoToFour, untruncateYear);

        // months
        case 'M':
          return intUnit(oneOrTwo);
        case 'MM':
          return intUnit(two);
        case 'MMM':
          return oneOf(loc.months('short', true), 1);
        case 'MMMM':
          return oneOf(loc.months('long', true), 1);
        case 'L':
          return intUnit(oneOrTwo);
        case 'LL':
          return intUnit(two);
        case 'LLL':
          return oneOf(loc.months('short', false), 1);
        case 'LLLL':
          return oneOf(loc.months('long', false), 1);

        // dates
        case 'd':
          return intUnit(oneOrTwo);
        case 'dd':
          return intUnit(two);

        // time
        case 'HH':
          return intUnit(two);
        case 'H':
          return intUnit(oneOrTwo);
        case 'hh':
          return intUnit(two);
        case 'h':
          return intUnit(oneOrTwo);
        case 'mm':
          return intUnit(two);
        case 'm':
          return intUnit(oneOrTwo);
        case 's':
          return intUnit(oneOrTwo);
        case 'ss':
          return intUnit(two);
        case 'S':
          return intUnit(oneToThree);
        case 'SSS':
          return intUnit(three);

        // meridiem
        case 'a':
          return oneOf(loc.meridiems(), 0);

        // weekYear (k)
        case 'kkkk':
          return intUnit(four);
        case 'kk':
          return intUnit(twoToFour, untruncateYear);

        // weekNumber (W)
        case 'W':
          return intUnit(oneOrTwo);
        case 'WW':
          return intUnit(two);

        // weekdays
        case 'E':
          return intUnit(one);
        case 'EEE':
          return oneOf(loc.weekdays('short'), 0);
        case 'EEEE':
          return oneOf(loc.weekdays('long'), 0);

        // offset/zone
        case 'Z':
        case 'ZZ':
          return null;
        // we don't support ZZZ (PST) or ZZZZ (Pacific Standard Time) in parsing
        // because we don't have any way to figure out what they are
        case 'z':
          return null;

        default:
          return literal(t);

      }
    },
    unit = unitate(token);
  unit.token = token;
  return unit;
}

function buildRegex(units) {
  return [units.map(u => u.regex).reduce((f, r) => `${f}(${r.source})`, ''), units];
}

function match(input, regex, handlers) {
  const matches = input.match(regex);

  if (matches) {
    if (matches.length - 1 !== handlers.length) {
      return null;
    }

    return Util.zip(matches.splice(1), handlers).reduce(
      (all, [m, h]) => {
        if (!h.literal) {
          all[h.token.val[0]] = h.deser(m);
        }
        return all;
      },
      {}
    );
  } else {
    return {};
  }
}

function dateTimeFromMatches(matches) {
  const toField = token => {
    switch (token) {
      case 'S':
        return 'millisecond';
      case 's':
        return 'second';
      case 'm':
        return 'minute';
      case 'h':
      case 'H':
        return 'hour';
      case 'd':
        return 'day';
      case 'L':
      case 'M':
        return 'month';
      case 'y':
        return 'year';
      case 'E':
      case 'c':
        return 'weekday';
      case 'W':
        return 'weekNumber';
      case 'k':
        return 'weekYear';
      default:
        return null;
    }
  };

  if (matches.h && matches.a === 1) {
    matches.h += 12;
  }

  // todo: era
  return Object.keys(matches).reduce(
    (r, k) => {
      const f = toField(k);
      if (f) {
        r[f] = matches[k];
      }

      return r;
    },
    {}
  );
}

/**
 * @private
 */

export class Parser {
  constructor(loc) {
    Object.defineProperty(this, 'loc', { value: loc, enumerable: true });
  }

  explainParse(input, format) {
    const tokens = Formatter.parseFormat(format),
      units = tokens.map(t => unitForToken(t, this.loc)),
      [regex, handlers] = buildRegex(units),
      matches = match(input, regex, handlers),
      result = matches ? dateTimeFromMatches(matches) : null;

    return { input, tokens, regex, matches, result };
  }

  parseDateTime(input, format) {
    return this.explainParse(input, format).result;
  }
}
