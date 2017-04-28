import { Util } from './util';
import { English } from './english';

function combineRegexes(...regexes) {
  const full = regexes.reduce((f, r) => f + r.source, '');
  return RegExp(full);
}

function combineExtractors(...extractors) {
  return m =>
    extractors
      .reduce(
        ([mergedVals, mergedContext, cursor], ex) => {
          const [val, context, next] = ex(m, cursor);
          return [Object.assign(mergedVals, val), Object.assign(mergedContext, context), next];
        },
        [{}, {}, 1]
      )
      .slice(0, 2);
}

function parse(s, ...patterns) {
  if (s == null) {
    return [null, null];
  }
  for (const [regex, extractor] of patterns) {
    const m = regex.exec(s);
    if (m) {
      return extractor(m);
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

// ISO duration parsing

const isoDuration = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/;

function extractISODuration(match) {
  const [, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr] = match;

  return {
    year: parse10(yearStr),
    month: parse10(monthStr),
    day: parse10(dayStr),
    hour: parse10(hourStr),
    minute: parse10(minuteStr),
    second: parse10(secondStr)
  };
}

// These are a little braindead. EDT *should* tell us that we're in, say, America/New_York
// and not just that we're in -240 *right now*. But since I don't think these are used that often
// I'm just going to ignore that
const obsOffsets = {
  GMT: 0,
  EDT: -4 * 60,
  EST: -5 * 60,
  CDT: 5 * 60,
  CST: 6 * 60,
  MDT: 6 * 60,
  MST: 7 * 60,
  PDT: 7 * 60,
  PST: 8 * 60
};

function fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
  const result = {
    year: yearStr.length === 2 ? Util.untrucateYear(parse10(yearStr)) : parse10(yearStr),
    month: English.monthsShort.indexOf(monthStr) + 1,
    day: parse10(dayStr),
    hour: parse10(hourStr),
    minute: parse10(minuteStr)
  };

  if (secondStr) result.second = parse10(secondStr);
  if (weekdayStr) {
    result.weekday = weekdayStr.length > 3
      ? English.weekdaysLong.indexOf(weekdayStr) + 1
      : English.weekdaysShort.indexOf(weekdayStr) + 1;
  }

  return result;
}

// RFC 2822/5322
const rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|(?:([+-]\d\d)(\d\d)))$/;

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
    result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);

  let offset;
  if (obsOffset) {
    offset = obsOffsets[obsOffset];
  } else if (milOffset) {
    offset = 0;
  } else {
    offset = signedOffset(offHourStr, offMinuteStr);
  }

  return [result, { offset, local: false }];
}

function preprocessRFC2822(s) {
  // Remove comments and folding whitespace and replace multiple-spaces with a single space
  return s.replace(/\([^)]*\)|[\n\t]/g, ' ').replace(/(\s\s+)/g, ' ').trim();
}

// http date

const rfc1123 = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d\d):(\d\d):(\d\d) GMT$/,
  rfc850 = /^(Monday|Tuesday|Wedsday|Thursday|Friday|Saturday|Sunday), (\d\d)-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d\d) (\d\d):(\d\d):(\d\d) GMT$/,
  ascii = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( \d|\d\d) (\d\d):(\d\d):(\d\d) (\d{4})$/;

function extractRFC1123Or850(match) {
  const [, weekdayStr, dayStr, monthStr, yearStr, hourStr, minuteStr, secondStr] = match,
    result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
  return [result, { offset: 0, local: false }];
}

function extractASCII(match) {
  const [, weekdayStr, monthStr, dayStr, hourStr, minuteStr, secondStr, yearStr] = match,
    result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
  return [result, { offset: 0, local: false }];
}

/**
 * @private
 */

export class RegexParser {
  static parseISODate(s) {
    return parse(
      s,
      [combineRegexes(isoYmdRegex, isoTimeRegex), combineExtractors(extractISOYmd, extractISOTime)],
      [
        combineRegexes(isoWeekRegex, isoTimeRegex),
        combineExtractors(extractISOWeekData, extractISOTime)
      ],
      [
        combineRegexes(isoOrdinalRegex, isoTimeRegex),
        combineExtractors(extractISOOrdinalData, extractISOTime)
      ]
    );
  }

  static parseRFC2822Date(s) {
    return parse(preprocessRFC2822(s), [rfc2822, extractRFC2822]);
  }

  static parseHTTPDate(s) {
    return parse(
      s,
      [rfc1123, extractRFC1123Or850],
      [rfc850, extractRFC1123Or850],
      [ascii, extractASCII]
    );
  }

  static parseISODuration(s) {
    return parse(s, [isoDuration, extractISODuration]);
  }
}
