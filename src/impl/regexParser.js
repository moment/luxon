import { Util } from './util';
import { English } from './english';
import { FixedOffsetZone } from '../zones/fixedOffsetZone';

function combineRegexes(...regexes) {
  const full = regexes.reduce((f, r) => f + r.source, '');
  return RegExp(full);
}

function combineExtractors(...extractors) {
  return m =>
    extractors
      .reduce(
        ([mergedVals, mergedZone, cursor], ex) => {
          const [val, zone, next] = ex(m, cursor);
          return [Object.assign(mergedVals, val), mergedZone || zone, next];
        },
        [{}, null, 1]
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

function simpleParse(...keys) {
  return (match, cursor) => {
    const ret = {};
    let i;

    for (i = 0; i < keys.length; i++) {
      ret[keys[i]] = parseInt(match[cursor + i]);
    }
    return [ret, null, cursor + i];
  };
}

// ISO parsing
const isoTimeRegex = /(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d\d\d))?)?)?(?:(Z)|([+-]\d\d)(?::?(\d\d))?)?)?$/,
  isoYmdRegex = /^([+-]\d{6}|\d{4})(?:-?(\d\d)(?:-?(\d\d))?)?/,
  isoWeekRegex = /^(\d{4})-?W(\d\d)-?(\d)/,
  isoOrdinalRegex = /^(\d{4})-?(\d{3})/,
  extractISOWeekData = simpleParse('weekYear', 'weekNumber', 'weekDay'),
  extractISOOrdinalData = simpleParse('year', 'ordinal');

function extractISOYmd(match, cursor) {
  const item = {
    year: parseInt(match[cursor]),
    month: parseInt(match[cursor + 1]) || 1,
    day: parseInt(match[cursor + 2]) || 1
  };

  return [item, null, cursor + 3];
}

function extractISOTime(match, cursor) {
  const local = !match[cursor + 4] && !match[cursor + 5],
    fullOffset = Util.signedOffset(match[cursor + 5], match[cursor + 6]),
    item = {
      hour: parseInt(match[cursor]) || 0,
      minute: parseInt(match[cursor + 1]) || 0,
      second: parseInt(match[cursor + 2]) || 0,
      millisecond: parseInt(match[cursor + 3]) || 0
    },
    zone = local ? null : new FixedOffsetZone(fullOffset);

  return [item, zone, cursor + 7];
}

// ISO duration parsing

const isoDuration = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/;

function extractISODuration(match) {
  const [, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr] = match;

  return {
    year: parseInt(yearStr),
    month: parseInt(monthStr),
    day: parseInt(dayStr),
    hour: parseInt(hourStr),
    minute: parseInt(minuteStr),
    second: parseInt(secondStr)
  };
}

// These are a little braindead. EDT *should* tell us that we're in, say, America/New_York
// and not just that we're in -240 *right now*. But since I don't think these are used that often
// I'm just going to ignore that
const obsOffsets = {
  GMT: 0,
  EDT: -4 * 60,
  EST: -5 * 60,
  CDT: -5 * 60,
  CST: -6 * 60,
  MDT: -6 * 60,
  MST: -7 * 60,
  PDT: -7 * 60,
  PST: -8 * 60
};

function fromStrings(
  weekdayStr,
  yearStr,
  monthStr,
  dayStr,
  hourStr,
  minuteStr,
  secondStr
) {
  const result = {
    year:
      yearStr.length === 2
        ? Util.untrucateYear(parseInt(yearStr))
        : parseInt(yearStr),
    month: English.monthsShort.indexOf(monthStr) + 1,
    day: parseInt(dayStr),
    hour: parseInt(hourStr),
    minute: parseInt(minuteStr)
  };

  if (secondStr) result.second = parseInt(secondStr);
  if (weekdayStr) {
    result.weekday =
      weekdayStr.length > 3
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
    result = fromStrings(
      weekdayStr,
      yearStr,
      monthStr,
      dayStr,
      hourStr,
      minuteStr,
      secondStr
    );

  let offset;
  if (obsOffset) {
    offset = obsOffsets[obsOffset];
  } else if (milOffset) {
    offset = 0;
  } else {
    offset = Util.signedOffset(offHourStr, offMinuteStr);
  }

  return [result, new FixedOffsetZone(offset)];
}

function preprocessRFC2822(s) {
  // Remove comments and folding whitespace and replace multiple-spaces with a single space
  return s
    .replace(/\([^)]*\)|[\n\t]/g, ' ')
    .replace(/(\s\s+)/g, ' ')
    .trim();
}

// http date

const rfc1123 = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d\d):(\d\d):(\d\d) GMT$/,
  rfc850 = /^(Monday|Tuesday|Wedsday|Thursday|Friday|Saturday|Sunday), (\d\d)-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d\d) (\d\d):(\d\d):(\d\d) GMT$/,
  ascii = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( \d|\d\d) (\d\d):(\d\d):(\d\d) (\d{4})$/;

function extractRFC1123Or850(match) {
  const [
      ,
      weekdayStr,
      dayStr,
      monthStr,
      yearStr,
      hourStr,
      minuteStr,
      secondStr
    ] = match,
    result = fromStrings(
      weekdayStr,
      yearStr,
      monthStr,
      dayStr,
      hourStr,
      minuteStr,
      secondStr
    );
  return [result, FixedOffsetZone.utcInstance];
}

function extractASCII(match) {
  const [
      ,
      weekdayStr,
      monthStr,
      dayStr,
      hourStr,
      minuteStr,
      secondStr,
      yearStr
    ] = match,
    result = fromStrings(
      weekdayStr,
      yearStr,
      monthStr,
      dayStr,
      hourStr,
      minuteStr,
      secondStr
    );
  return [result, FixedOffsetZone.utcInstance];
}

/**
 * @private
 */

export class RegexParser {
  static parseISODate(s) {
    return parse(
      s,
      [
        combineRegexes(isoYmdRegex, isoTimeRegex),
        combineExtractors(extractISOYmd, extractISOTime)
      ],
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
