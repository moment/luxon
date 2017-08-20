import { Util } from './util';

const nonLeapLadder = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
  leapLadder = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];

function dayOfWeek(year, month, day) {
  const js = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return js === 0 ? 7 : js;
}

function lastWeekNumber(weekYear) {
  const p1 =
      (weekYear +
        Math.floor(weekYear / 4) -
        Math.floor(weekYear / 100) +
        Math.floor(weekYear / 400)) %
      7,
    last = weekYear - 1,
    p2 = (last + Math.floor(last / 4) - Math.floor(last / 100) + Math.floor(last / 400)) % 7;
  return p1 === 4 || p2 === 3 ? 53 : 52;
}

function computeOrdinal(year, month, day) {
  return day + (Util.isLeapYear(year) ? leapLadder : nonLeapLadder)[month - 1];
}

function uncomputeOrdinal(year, ordinal) {
  const table = Util.isLeapYear(year) ? leapLadder : nonLeapLadder,
    month0 = table.findIndex(i => i < ordinal),
    day = ordinal - table[month0];
  return { month: month0 + 1, day };
}

/**
 * @private
 */

export class Conversions {
  static gregorianToWeek(gregObj) {
    const { year, month, day } = gregObj,
      ordinal = computeOrdinal(year, month, day),
      weekday = dayOfWeek(year, month, day);

    let weekNumber = Math.floor((ordinal - weekday + 10) / 7),
      weekYear;

    if (weekNumber < 1) {
      weekYear = year - 1;
      weekNumber = lastWeekNumber(weekYear);
    } else if (weekNumber > lastWeekNumber(year)) {
      weekYear = year + 1;
      weekNumber = 1;
    } else {
      weekYear = year;
    }

    return Object.assign({ weekYear, weekNumber, weekday }, Util.timeObject(gregObj));
  }

  static weekToGregorian(weekData) {
    const { weekYear, weekNumber, weekday } = weekData,
      weekdayOfJan4 = dayOfWeek(weekYear, 1, 4),
      daysInYear = Util.daysInYear(weekYear);
    let ordinal = weekNumber * 7 + weekday - weekdayOfJan4 - 3,
      year;

    if (ordinal < 1) {
      year = weekYear - 1;
      ordinal += Util.daysInYear(year);
    } else if (ordinal > daysInYear) {
      year = weekYear + 1;
      ordinal -= Util.daysInYear(year);
    } else {
      year = weekYear;
    }

    const { month, day } = uncomputeOrdinal(year, ordinal);

    return Object.assign({ year, month, day }, Util.timeObject(weekData));
  }

  static gregorianToOrdinal(gregData) {
    const { year, month, day } = gregData,
      ordinal = computeOrdinal(year, month, day);

    return Object.assign({ year, ordinal }, Util.timeObject(gregData));
  }

  static ordinalToGregorian(ordinalData) {
    const { year, ordinal } = ordinalData,
      { month, day } = uncomputeOrdinal(year, ordinal);

    return Object.assign({ year, month, day }, Util.timeObject(ordinalData));
  }

  static hasInvalidWeekData(obj) {
    const validYear = Util.isNumber(obj.weekYear),
      validWeek = Util.numberBetween(obj.weekNumber, 1, lastWeekNumber(obj.weekYear)),
      validWeekday = Util.numberBetween(obj.weekday, 1, 7);

    if (!validYear) {
      return 'weekYear out of range';
    } else if (!validWeek) {
      return 'week out of range';
    } else if (!validWeekday) {
      return 'weekday out of range';
    } else return false;
  }

  static hasInvalidOrdinalData(obj) {
    const validYear = Util.isNumber(obj.year),
      validOrdinal = Util.numberBetween(obj.ordinal, 1, Util.daysInYear(obj.year));

    if (!validYear) {
      return 'year out of range';
    } else if (!validOrdinal) {
      return 'ordinal out of range';
    } else return false;
  }

  static hasInvalidGregorianData(obj) {
    const validYear = Util.isNumber(obj.year),
      validMonth = Util.numberBetween(obj.month, 1, 12),
      validDay = Util.numberBetween(obj.day, 1, Util.daysInMonth(obj.year, obj.month));

    if (!validYear) {
      return 'year out of range';
    } else if (!validMonth) {
      return 'month out of range';
    } else if (!validDay) {
      return 'day out of range';
    } else return false;
  }

  static hasInvalidTimeData(obj) {
    const validHour = Util.numberBetween(obj.hour, 0, 23),
      validMinute = Util.numberBetween(obj.minute, 0, 59),
      validSecond = Util.numberBetween(obj.second, 0, 59),
      validMillisecond = Util.numberBetween(obj.millisecond, 0, 999);

    if (!validHour) {
      return 'hour out of range';
    } else if (!validMinute) {
      return 'minute out of range';
    } else if (!validSecond) {
      return 'second out of range';
    } else if (!validMillisecond) {
      return 'millisecond out of range';
    } else return false;
  }
}
