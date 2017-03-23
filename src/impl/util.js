import { Duration } from '../duration';

/**
 * @private
 */

export class Util {
  static friendlyDuration(durationOrNumber, type) {
    return Util.isNumber(durationOrNumber)
      ? Duration.fromLength(durationOrNumber, type)
      : durationOrNumber;
  }

  static isUndefined(o) {
    return typeof o === 'undefined';
  }

  static isNumber(o) {
    return typeof o === 'number';
  }

  static pad(input, n = 2) {
    return ('0'.repeat(n) + input).slice(-n);
  }

  static towardZero(input) {
    return input < 0 ? Math.ceil(input) : Math.floor(input);
  }

  // DateTime -> JS date such that the date's UTC time is the datetimes's local time
  static asIfUTC(dt) {
    const ts = dt.ts - dt.offset();
    return new Date(ts);
  }

  // http://stackoverflow.com/a/15030117
  static flatten(arr) {
    return arr.reduce(
      (flat, toFlatten) =>
        flat.concat(Array.isArray(toFlatten) ? Util.flatten(toFlatten) : toFlatten),
      []
    );
  }

  static bestBy(arr, by, compare) {
    return arr.reduce(
      (best, next) => {
        const pair = [by(next), next];
        if (!best) {
          return pair;
        } else if (compare.apply(null, [best[0], pair[0]]) === best[0]) {
          return best;
        } else {
          return pair;
        }
      },
      null
    )[1];
  }

  static zip(...arrays) {
    return arrays[0].map((_, c) => arrays.map(arr => arr[c]));
  }

  static isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }

  static daysInMonth(year, month) {
    if (month === 2) {
      return Util.isLeapYear(year) ? 29 : 28;
    } else {
      return [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
    }
  }

  // Huge hack. The point of this is to extract the named offset info
  // WITHOUT using the polyfill OR formatToParts, since the poly doesn't support
  // zones and real JS doesn't support formatToParts.
  // Only works if offset name is at the end of the string, so probably spews
  // junk for Arabic. Also note that this won't internationalize in Node
  // unless you have an Intl build.
  static parseZoneInfo(ts, offsetFormat, localeCode, timeZone = null) {
    const date = new Date(ts),
      intl = {
        hour12: false,
        // avoid AM/PM
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      };

    if (timeZone) {
      intl.timeZone = timeZone;
    }

    const without = new Intl.DateTimeFormat(localeCode, intl).format(date),
      modified = Object.assign({ timeZoneName: offsetFormat }, intl),
      included = new Intl.DateTimeFormat(localeCode, modified).format(date),
      diffed = included.substring(without.length),
      trimmed = diffed.replace(/^[, ]+/, '');

    return trimmed;
  }
}
