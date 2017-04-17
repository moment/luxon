import { Util } from './util';

function combine(...regexes) {
  const full = regexes.reduce((f, r) => f + r.source, '');
  return RegExp(full);
}

function parse(s, ...patterns) {
  if (s == null) {
    return [null, null];
  }
  for (const [regex, extractors] of patterns) {
    const m = regex.exec(s);
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

function parse10(inty) {
  return parseInt(inty, 10);
}

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

function signedOffset(offHourStr, offMinuteStr) {
  const offHour = parse10(offHourStr) || 0,
    offMin = parse10(offMinuteStr) || 0,
    offMinSigned = offHour < 0 ? -offMin : offMin;
  return offHour * 60 + offMinSigned;
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
    fullOffset = signedOffset(match[cursor + 5], match[cursor + 6]),
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

// RFC 2822/5322
const full2822Regex = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|(?:([+-]\d\d)(\d\d)))$/,
  // These are a little braindead. EDT *should* tell us that we're in, say, America/New_York
  // and not just that we're in -240 *right now*. But since I don't think these are used that often
  // I'm just going to ignore that
  obsOffsets = {
    GMT: 0,
    EDT: -4 * 60,
    EST: -5 * 60,
    CDT: 5 * 60,
    CST: 6 * 60,
    MDT: 6 * 60,
    MST: 7 * 60,
    PDT: 7 * 60,
    PST: 8 * 60
  },
  weekdayAbbreviations = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  monthAbbreviations = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];

function extractRFC2822(match) {
  const [
    ,
    weekdayStr,
    dayStr,
    monthStr,
    yearStr,
    hourStr,
    minuteStr,
    secondStr,
    obsOffset,
    milOffset,
    offHourStr,
    offMinuteStr
  ] = match,
    result = {
      year: yearStr.length === 2 ? Util.untrucateYear(parse10(yearStr)) : parse10(yearStr),
      month: monthAbbreviations.indexOf(monthStr) + 1,
      day: parse10(dayStr),
      hour: parse10(hourStr),
      minute: parse10(minuteStr)
    };

  if (secondStr) result.second = parse10(secondStr);
  if (weekdayStr) result.weekday = weekdayAbbreviations.indexOf(weekdayStr) + 1;

  let offset;
  if (obsOffset) {
    offset = obsOffsets[obsOffset];
  } else if (milOffset) {
    offset = 0;
  } else {
    offset = signedOffset(offHourStr, offMinuteStr);
  }

  return [result, { offset, local: false }, 0];
}

function preprocessRFC2822(s) {
  // Remove comments and folding whitespace and replace multiple-spaces with a single space
  return s.replace(/\([^)]*\)|[\n\t]/g, ' ').replace(/(\s\s+)/g, ' ').trim();
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

  static parseRFC2822Date(s) {
    return parse(preprocessRFC2822(s), [full2822Regex, [extractRFC2822]]);
  }

  // static parseHTTPDate(s, opts = {}) {
  // }

  // static parseISODuration(s, opts = {}) {
  // }

  // static parseISOInterval(s, opts = {}) {
  // }
}
