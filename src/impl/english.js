// @flow

import { Formats } from './formats';
import { Util } from './util';

function stringify(obj: Object) {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

/**
 * @private
 */

export class English {
  static get monthsLong(): Array<string> {
    return [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
  }

  static get monthsShort(): Array<string> {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  }

  static get monthsNarrow(): Array<string> {
    return ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  }

  static months(length: string): Array<string> {
    switch (length) {
      case 'narrow':
        return English.monthsNarrow;
      case 'short':
        return English.monthsShort;
      case 'long':
        return English.monthsLong;
      case 'numeric':
        return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
      case '2-digit':
      default:
        return ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    }
  }

  static get weekdaysLong(): Array<string> {
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  }

  static get weekdaysShort(): Array<string> {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  }

  static get weekdaysNarrow(): Array<string> {
    return ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  }

  static weekdays(length: string): Array<string> {
    switch (length) {
      case 'narrow':
        return English.weekdaysNarrow;
      case 'short':
        return English.weekdaysShort;
      case 'long':
        return English.weekdaysLong;
      case 'numeric':
      default:
        return ['1', '2', '3', '4', '5', '6', '7'];
    }
  }

  static get meridiems(): Array<string> {
    return ['AM', 'PM'];
  }

  static get erasLong(): Array<string> {
    return ['Before Christ', 'Anno Domini'];
  }

  static get erasShort(): Array<string> {
    return ['BC', 'AD'];
  }

  static get erasNarrow(): Array<string> {
    return ['B', 'A'];
  }

  static eras(length: string): Array<string> {
    switch (length) {
      case 'narrow':
        return English.erasNarrow;
      case 'short':
        return English.erasShort;
      case 'long':
      default:
        return English.erasLong;
    }
  }

  static meridiemForDateTime(dt: Object) {
    return English.meridiems[dt.hour < 12 ? 0 : 1];
  }

  static weekdayForDateTime(dt: Object, length: string) {
    return English.weekdays(length)[dt.weekday - 1];
  }

  static monthForDateTime(dt: Object, length: string) {
    return English.months(length)[dt.month - 1];
  }

  static eraForDateTime(dt: Object, length: string) {
    return English.eras(length)[dt.year < 0 ? 0 : 1];
  }

  static formatString(knownFormat: string) {
    // these all have the offsets removed because we don't have access to them
    // without all the intl stuff this is backfilling
    const filtered = Util.pick(knownFormat, [
        'weekday',
        'era',
        'year',
        'month',
        'day',
        'hour',
        'minute',
        'second',
        'timeZoneName',
        'hour12'
      ]),
      key = stringify(filtered),
      dateTimeHuge = 'EEEE, LLLL d, yyyy, h:mm a';
    switch (key) {
      case stringify(Formats.DATE_SHORT):
        return 'M/d/yyyy';
      case stringify(Formats.DATE_MED):
        return 'LLL d, yyyy';
      case stringify(Formats.DATE_FULL):
        return 'LLLL d, yyyy';
      case stringify(Formats.DATE_HUGE):
        return 'EEEE, LLLL d, yyyy';
      case stringify(Formats.TIME_SIMPLE):
        return 'h:mm a';
      case stringify(Formats.TIME_WITH_SECONDS):
        return 'h:mm:ss a';
      case stringify(Formats.TIME_WITH_SHORT_OFFSET):
        return 'h:mm a';
      case stringify(Formats.TIME_WITH_LONG_OFFSET):
        return 'h:mm a';
      case stringify(Formats.TIME_24_SIMPLE):
        return 'HH:mm';
      case stringify(Formats.TIME_24_WITH_SECONDS):
        return 'HH:mm:ss';
      case stringify(Formats.TIME_24_WITH_SHORT_OFFSET):
        return 'HH:mm';
      case stringify(Formats.TIME_24_WITH_LONG_OFFSET):
        return 'HH:mm';
      case stringify(Formats.DATETIME_SHORT):
        return 'M/d/yyyy, h:mm a';
      case stringify(Formats.DATETIME_MED):
        return 'LLL d, yyyy, h:mm a';
      case stringify(Formats.DATETIME_FULL):
        return 'LLLL d, yyyy, h:mm a';
      case stringify(Formats.DATETIME_HUGE):
        return dateTimeHuge;
      case stringify(Formats.DATETIME_SHORT_WITH_SECONDS):
        return 'M/d/yyyy, h:mm:ss a';
      case stringify(Formats.DATETIME_MED_WITH_SECONDS):
        return 'LLL d, yyyy, h:mm:ss a';
      case stringify(Formats.DATETIME_FULL_WITH_SECONDS):
        return 'LLLL d, yyyy, h:mm:ss a';
      case stringify(Formats.DATETIME_HUGE_WITH_SECONDS):
        return 'EEEE, LLLL d, yyyy, h:mm:ss a';
      default:
        return dateTimeHuge;
    }
  }
}
