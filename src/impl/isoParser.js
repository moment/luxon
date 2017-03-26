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

/**
 * @private
 */

export class ISOParser {
  static parseISODate(s) {
    const timeRegex = /(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d\d\d))?)?)?(?:(Z)|([+-]\d\d)(?::?(\d\d))?)?)?$/,
      ymdRegex = /^([+-]?\d{6}|\d{4})-?(\d\d)-?(\d\d)/,
      parse10 = inty => parseInt(inty, 10);

    function extractTime(match, cursor) {
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

    function extractYmd(match, cursor) {
      const item = {
        year: parse10(match[cursor]),
        month: parse10(match[cursor + 1]),
        day: parse10(match[cursor + 2])
      };

      return [item, {}, cursor + 3];
    }

    const ymdComb = [combine(ymdRegex, timeRegex), [extractYmd, extractTime]];
    return parse(s, ymdComb);
  }
  // static parseISODuration(s, opts = {}) {
  // }
  // static parseISOInterval(s, opts = {}) {
  // }
}
