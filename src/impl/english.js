export class English {

  static get monthsLong() {
    return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  }

  static get monthsShort() {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  }

  static get monthsNarrow() {
    return [
    'J',
    'F',
    'M',
    'A',
    'M',
    'J',
    'J',
    'A',
    'S',
    'O',
    'N',
    'D'
    ];
  }

  static months(length) {
    switch(length) {
      case 'narrow': return English.monthsNarrow;
      case 'short': return English.monthsShort;
      case 'long': return English.monthsLong;
      default: return null;
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
    switch(length) {
      case 'narrow': return English.weekdaysNarrow;
      case 'short': return English.weekdaysShort;
      case 'long': return English.weekdaysLong;
      default: return null;
    }
  }

  static get meridiems() {
    return ['AM', 'PM'];
  }
}
