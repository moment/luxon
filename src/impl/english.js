/**
 * @private
 */

export class English {
  static get monthsLong() {
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

  static get monthsShort() {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  }

  static get monthsNarrow() {
    return ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  }

  static months(length) {
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
        return ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
      default:
        return null;
    }
  }

  static get weekdaysLong() {
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  }

  static get weekdaysShort() {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  }

  static get weekdaysNarrow() {
    return ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  }

  static weekdays(length) {
    switch (length) {
      case 'narrow':
        return English.weekdaysNarrow;
      case 'short':
        return English.weekdaysShort;
      case 'long':
        return English.weekdaysLong;
      case 'numeric':
        return ['1', '2', '3', '4', '5', '6', '7'];
      default:
        return null;
    }
  }

  static get meridiems() {
    return ['AM', 'PM'];
  }

  static get erasLong() {
    return ['Before Christ', 'Anno Domini'];
  }

  static get erasShort() {
    return ['BC', 'AD'];
  }

  static get erasNarrow() {
    return ['B', 'A'];
  }

  static eras(length) {
    switch (length) {
      case 'narrow':
        return English.erasNarrow;
      case 'short':
        return English.erasShort;
      case 'long':
        return English.erasLong;
      default:
        return null;
    }
  }

  static meridiemForDateTime(dt) {
    return English.meridiems[dt.hour < 12 ? 0 : 1];
  }

  static weekdayForDateTime(dt, length) {
    return English.weekdays(length)[dt.weekday - 1];
  }

  static monthForDateTime(dt, length) {
    return English.months(length)[dt.month - 1];
  }

  static eraForDateTime(dt, length) {
    return English.eras(length)[dt.year < 0 ? 0 : 1];
  }
}
