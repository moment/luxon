function combine(...regexes){
  let full = regexes.reduce((f, r) => f + r.source, '');
  return RegExp(full);
}

function parse(s, ...patterns){
  if (s == null){
    return null;
  }
  for(let [regex, extractors] of patterns){
    let m = s.match(regex);
    if (m){
      return extractors.reduce(([merged, cursor], ex) => {
        let [val, next] = ex(m, cursor);
        return [Object.assign(merged, val), next];
      }, [{}, 1])[0];
    }
  }
  return null;
}

export class ISOParser {

  static parseISODate(s, opts = {}){

    const timeRegex = /(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d\d\d))?)?)?(?:(Z)|([+-]\d\d)(?::?(\d\d))?)?)?$/,
          ymdRegex = /^([+-]?\d{6}|\d{4})-?(\d\d)-?(\d\d)/;

    function extractTime(match, cursor){

      let local = !match[cursor + 4] && !match[cursor + 5],
          offHour = parseInt(match[cursor + 5]) || 0,
          offMin = parseInt(match[cursor + 6]) || 0,
          offMinSigned = offHour < 0 ? -offMin : offMin,
          fullOffset = offHour * 60 + offMinSigned;

      let item = {
        hour: parseInt(match[cursor]) || 0,
        minute: parseInt(match[cursor + 1]) || 0,
        second: parseInt(match[cursor + 2]) || 0,
        millisecond: parseInt(match[cursor + 3]) || 0,
        offset: fullOffset,
        local: local
      };

      return [item, cursor + 7];
    }

    function extractYmd(match, cursor){

      let items = {
        year: parseInt(match[cursor]),
        month: parseInt(match[cursor + 1]),
        day: parseInt(match[cursor + 2])
      };

      return [items, cursor + 3];
    }

    let ymdComb = [
          combine(ymdRegex, timeRegex),
          [extractYmd, extractTime]
        ];
    return parse(s, ymdComb);
  };

  static parseISODuration(s, opts = {}){
  }

  static parseISOInterval(s, opts = {}){
  }
}
