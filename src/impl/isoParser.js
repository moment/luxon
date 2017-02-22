function combine(...regexes) {
  const full = regexes.reduce((f, r) => f + r.source, '');
  return RegExp(full);
}

function parse(s, ...patterns) {
  if (s == null) {
    return null;
  }
  for (const [regex, extractors] of patterns) {
    const m = s.match(regex);
    if (m) {
      return extractors.reduce(([merged, cursor], ex) => {
        const [val, next] = ex(m, cursor);
        return [Object.assign(merged, val), next];
      }, [{}, 1])[0];
    }
  }
  return null;
}

export class ISOParser {

  static parseISODate(s) {
    const timeRegex = /(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d\d\d))?)?)?(?:(Z)|([+-]\d\d)(?::?(\d\d))?)?)?$/;
    const ymdRegex = /^([+-]?\d{6}|\d{4})-?(\d\d)-?(\d\d)/;
    const parse10 = inty => parseInt(inty, 10);

    function extractTime(match, cursor) {
      const local = !match[cursor + 4] && !match[cursor + 5];
      const offHour = parse10(match[cursor + 5]) || 0;
      const offMin = parse10(match[cursor + 6]) || 0;
      const offMinSigned = offHour < 0 ? -offMin : offMin;
      const fullOffset = (offHour * 60) + offMinSigned;

      const item = {
        hour: parse10(match[cursor]) || 0,
        minute: parse10(match[cursor + 1]) || 0,
        second: parse10(match[cursor + 2]) || 0,
        millisecond: parse10(match[cursor + 3]) || 0,
        offset: fullOffset,
        local,
      };

      return [item, cursor + 7];
    }

    function extractYmd(match, cursor) {
      const items = {
        year: parse10(match[cursor]),
        month: parse10(match[cursor + 1]),
        day: parse10(match[cursor + 2]),
      };

      return [items, cursor + 3];
    }

    const ymdComb = [
      combine(ymdRegex, timeRegex),
          [extractYmd, extractTime],
    ];
    return parse(s, ymdComb);
  }

  // static parseISODuration(s, opts = {}) {
  // }

  // static parseISOInterval(s, opts = {}) {
  // }
}
