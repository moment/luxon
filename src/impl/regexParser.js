function combine(...regexes) {
  const full = regexes.reduce((f, r) => f + r.source, '');
  return RegExp(full);
}

function parse(s, ...patterns) {
  if (s == null) {
    return [null, null];
  }
  for (const [regex, extractors] of patterns) {
    const m = s.match(regex);
    if (m) {
      return extractors
        .reduce(
          ([mergedVals, mergedContext, cursor], ex) => {
            const [val, context, next] = ex(m, cursor);
            return [Object.assign(mergedVals, val), Object.assign(mergedContext, context), next];
          },
          [{}, {}, 1]
        )
        .slice(0, 2);
    }
  }
  return [null, null];
}

const parse10 = inty => parseInt(inty, 10);

function simpleParse(...keys) {
  return (match, cursor) => {
    const ret = {};
    let i;

    for (i = 0; i < keys.length; i++) {
      ret[keys[i]] = parse10(match[cursor + i]);
    }
    return [ret, {}, cursor + i];
  };
}

// ISO parsing
const isoTimeRegex = /(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d\d\d))?)?)?(?:(Z)|([+-]\d\d)(?::?(\d\d))?)?)?$/,
  extractISOYmd = simpleParse('year', 'month', 'day'),
  isoYmdRegex = /^([+-]?\d{6}|\d{4})-?(\d\d)-?(\d\d)/,
  extractISOWeekData = simpleParse('weekYear', 'weekNumber', 'weekDay'),
  isoWeekRegex = /^(\d{4})-?W(\d\d)-?(\d)/,
  isoOrdinalRegex = /^(\d{4})-?(\d{3})/,
  extractISOOrdinalData = simpleParse('year', 'ordinal');

function extractISOTime(match, cursor) {
  const local = !match[cursor + 4] && !match[cursor + 5],
    offHour = parse10(match[cursor + 5]) || 0,
    offMin = parse10(match[cursor + 6]) || 0,
    offMinSigned = offHour < 0 ? -offMin : offMin,
    fullOffset = offHour * 60 + offMinSigned,
    item = {
      hour: parse10(match[cursor]) || 0,
      minute: parse10(match[cursor + 1]) || 0,
      second: parse10(match[cursor + 2]) || 0,
      millisecond: parse10(match[cursor + 3]) || 0
    },
    context = {
      offset: fullOffset,
      local
    };

  return [item, context, cursor + 7];
}

/**
 * @private
 */

export class RegexParser {
  static parseISODate(s) {
    return parse(
      s,
      [combine(isoYmdRegex, isoTimeRegex), [extractISOYmd, extractISOTime]],
      [combine(isoWeekRegex, isoTimeRegex), [extractISOWeekData, extractISOTime]],
      [combine(isoOrdinalRegex, isoTimeRegex), [extractISOOrdinalData, extractISOTime]]
    );
  }

  // static parseISODuration(s, opts = {}) {
  // }
  // static parseISOInterval(s, opts = {}) {
  // }
}
