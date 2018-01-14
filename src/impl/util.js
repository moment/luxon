import { Duration } from '../duration';
import { DateTime } from '../datetime';
import { Zone } from '../zone';
import { LocalZone } from '../zones/localZone';
import { IANAZone } from '../zones/IANAZone';
import { FixedOffsetZone } from '../zones/fixedOffsetZone';
import { InvalidZone } from '../zones/invalidZone';
import { Settings } from '../settings';
import { InvalidArgumentError } from '../errors';

/*
  This is just a junk drawer, containing anything used across multiple classes.
  Because Luxon is small(ish), this should stay small and we won't worry about splitting
  it up into, say, parsingUtil.js and basicUtil.js and so on. But they are divided up by feature area.
*/

/**
 * @private
 */

export class Util {
  // TYPES

  static isUndefined(o) {
    return typeof o === 'undefined';
  }

  static isNumber(o) {
    return typeof o === 'number';
  }

  static isString(o) {
    return typeof o === 'string';
  }

  static isDate(o) {
    return Object.prototype.toString.call(o) === '[object Date]';
  }

  // OBJECTS AND ARRAYS

  static maybeArray(thing) {
    return Array.isArray(thing) ? thing : [thing];
  }

  static bestBy(arr, by, compare) {
    if (arr.length === 0) {
      return undefined;
    }
    return arr.reduce((best, next) => {
      const pair = [by(next), next];
      if (!best) {
        return pair;
      } else if (compare.apply(null, [best[0], pair[0]]) === best[0]) {
        return best;
      } else {
        return pair;
      }
    }, null)[1];
  }

  static pick(obj, keys) {
    return keys.reduce((a, k) => {
      a[k] = obj[k];
      return a;
    }, {});
  }

  // NUMBERS AND STRINGS

  static numberBetween(thing, bottom, top) {
    return Util.isNumber(thing) && thing >= bottom && thing <= top;
  }

  static padStart(input, n = 2) {
    return ('0'.repeat(n) + input).slice(-n);
  }

  static parseMillis(fraction) {
    if (fraction) {
      const f = parseFloat('0.' + fraction) * 1000;
      return Math.round(f);
    } else {
      return 0;
    }
  }

  // DATE BASICS

  static isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }

  static daysInYear(year) {
    return Util.isLeapYear(year) ? 366 : 365;
  }

  static daysInMonth(year, month) {
    if (month === 2) {
      return Util.isLeapYear(year) ? 29 : 28;
    } else {
      return [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
    }
  }

  static untruncateYear(year) {
    if (year > 99) {
      return year;
    } else return year > 60 ? 1900 + year : 2000 + year;
  }

  // PARSING

  static parseZoneInfo(ts, offsetFormat, locale, timeZone = null) {
    const date = new Date(ts),
      intl = {
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      };

    if (timeZone) {
      intl.timeZone = timeZone;
    }

    const modified = Object.assign({ timeZoneName: offsetFormat }, intl),
      hasIntl = Util.hasIntl();

    if (hasIntl && Util.hasFormatToParts()) {
      const parsed = new Intl.DateTimeFormat(locale, modified)
        .formatToParts(date)
        .find(m => m.type.toLowerCase() === 'timezonename');
      return parsed ? parsed.value : null;
    } else if (hasIntl) {
      // this probably doesn't work for all locales
      const without = new Intl.DateTimeFormat(locale, intl).format(date),
        included = new Intl.DateTimeFormat(locale, modified).format(date),
        diffed = included.substring(without.length),
        trimmed = diffed.replace(/^[, ]+/, '');
      return trimmed;
    } else {
      return null;
    }
  }

  // signedOffset('-5', '30') -> -330
  static signedOffset(offHourStr, offMinuteStr) {
    const offHour = parseInt(offHourStr, 10) || 0,
      offMin = parseInt(offMinuteStr, 10) || 0,
      offMinSigned = offHour < 0 ? -offMin : offMin;
    return offHour * 60 + offMinSigned;
  }

  // COERCION

  static friendlyDuration(duration) {
    if (Util.isNumber(duration)) {
      return Duration.fromMillis(duration);
    } else if (duration instanceof Duration) {
      return duration;
    } else if (duration instanceof Object) {
      return Duration.fromObject(duration);
    } else {
      throw new InvalidArgumentError('Unknown duration argument');
    }
  }

  static friendlyDateTime(dateTimeish) {
    if (dateTimeish instanceof DateTime) {
      return dateTimeish;
    } else if (dateTimeish.valueOf && Util.isNumber(dateTimeish.valueOf())) {
      return DateTime.fromJSDate(dateTimeish);
    } else if (dateTimeish instanceof Object) {
      return DateTime.fromObject(dateTimeish);
    } else {
      throw new InvalidArgumentError('Unknown datetime argument');
    }
  }

  static normalizeZone(input) {
    let offset;
    if (Util.isUndefined(input) || input === null) {
      return Settings.defaultZone;
    } else if (input instanceof Zone) {
      return input;
    } else if (Util.isString(input)) {
      const lowered = input.toLowerCase();
      if (lowered === 'local') return LocalZone.instance;
      else if (lowered === 'utc') return FixedOffsetZone.utcInstance;
      else if ((offset = IANAZone.parseGMTOffset(input)) != null) {
        // handle Etc/GMT-4, which V8 chokes on
        return FixedOffsetZone.instance(offset);
      } else if (IANAZone.isValidSpecifier(lowered)) return new IANAZone(input);
      else return FixedOffsetZone.parseSpecifier(lowered) || InvalidZone.instance;
    } else if (Util.isNumber(input)) {
      return FixedOffsetZone.instance(input);
    } else if (typeof input === 'object' && input.offset) {
      // This is dumb, but the instanceof check above doesn't seem to really work
      // so we're duck checking it
      return input;
    } else {
      return InvalidZone.instance;
    }
  }

  static normalizeObject(obj, normalizer, ignoreUnknown = false) {
    const normalized = {};
    for (const u in obj) {
      if (obj.hasOwnProperty(u)) {
        const v = obj[u];
        if (v !== null && !Util.isUndefined(v) && !Number.isNaN(v)) {
          const mapped = normalizer(u, ignoreUnknown);
          if (mapped) {
            normalized[mapped] = v;
          }
        }
      }
    }
    return normalized;
  }

  static timeObject(obj) {
    return Util.pick(obj, ['hour', 'minute', 'second', 'millisecond']);
  }

  // CAPABILITIES

  static hasIntl() {
    return typeof Intl !== 'undefined' && Intl.DateTimeFormat;
  }

  static hasFormatToParts() {
    return !Util.isUndefined(Intl.DateTimeFormat.prototype.formatToParts);
  }
}
