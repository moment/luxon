const d365 = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365],
      d366 = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366],
      f = Math.floor;

function isLeap(year){
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function hasOverflow({year: year, month: month, day: day, hour: hour, minute: minute, second: second, millisecond: millisecond}){
  let leap = isLeap(year),
      days = leap ? d366 : d365;
  return month < 1 || month > 12 ||
    day < 1 || days[month] > day ||
    hour < 0 || hour > 23 ||
    minute < 0 || minute > 59 ||
    second < 0 || second > 59 ||
    millisecond < 0 || millisecond > 999;
}

function rollupDays(n){

  let y400 = f(n / 146097);
  n -= y400 * 146097;

  let y100 = f(n / 36524);
  if (y100 == 4) y100 = 3;
  n -= y100 * 36524;

  let y4 = f(n / 1461);
  n -= y4 * 1461;

  let y1 = f(n / 365);
  if (y1 == 4) y1 = 3;
  n -= y1 * 365;

  let year = y400 * 400 + y100 * 100 + y4 * 4 + y1 + 1,
      leap = y1 == 3 && (y4 != 24 || y100 == 3),
      days = leap ? d366 : d365,
      month = n >> 5;

  while (n >= days[month]){
    month++;
  }

  let day = n - days[month - 1] + 1;
  return [year, month, day];
}

function rollupMilliseconds(ms){

  let days = f(ms / 864e5);
  ms = ms % 864e5;

  let hours = f(ms / 36e5);
  ms = ms % 36e5;

  let minutes = f(ms / 6e4);
  ms = ms % 6e4;

  let seconds = f(ms / 1e3),
      milliseconds = ms % 1e3;

  return [days, hours, minutes, seconds, milliseconds];
}

function fixOverflow(year, month, day){

  if (month < 1 || month > 11 || day < 0 || day > Gregorian.daysInMonth(month, year) < day){

    function adjustMonthYear(){
      if (month < 1 || month > 12){
        year = year + f((month - 1) / 12) + 1;
        month = (month - 1) % 12 + 1;
      }
    }

    adjustMonthYear();

    while(day < 0){
      adjustMonthYear();
      day += Gregorian.daysInMonth(month - 1, year);
      month--;
    }

    while (Gregorian.daysInMonth(month, year) < day){
      adjustMonthYear();
      day -= Gregorian.daysInMonth(month, year);
      month++;
    }
  }

  return [year, month, day];
}

function boilToDays(year, month, day){
  let [aYear, aMonth, aDay] = fixOverflow(year, month, day);

  let y = aYear - 1,
      days = isLeap(aYear) ? d366 : d365,
      dayCount = y * 365 + f(y / 4) - f(y / 100) + f(y / 400) + days[aMonth - 1] + aDay;

  return dayCount;
}

function boilToMilliseconds(hour, minute, second, millisecond){
  return (hour * 3600 * 1000) + (minute * 60000) + (second * 1000) + millisecond;
}

export class Gregorian {
  static tsToObj(ts, offset){

    ts += offset * 60 * 1000;

    let days = f(ts / 864e5) + 719162;

    let [year, month, day] = rollupDays(days),
        [_, hour, minute, second, millisecond] = rollupMilliseconds(ts);

    return {
      year: year,
      month: month,
      day: day,
      hour: hour,
      minute: minute,
      second: second,
      millisecond: millisecond
    };
  }

  static objToTS(obj, offset = 0){
    let {year: year, month: month, day: day, hour: hour, minute: minute, second: second, millisecond: millisecond} = obj,
        days = boilToDays(year, month, day),
        timeMS = boilToMilliseconds(hour, minute, second, millisecond),
        offsetMS = offset * 60 * 1000;
    return (days - 719163) * 864e5 + timeMS - offsetMS;
  }

  static normalize(obj){
    if (hasOverflow(obj)){

      let {year: year, month: month, day: day, hour: hour, minute: minute, second: second, millisecond: millisecond} = obj,
          rawMS = boilToMilliseconds(hour, minute, second, millisecond),
          [iDay, rHour, rMinute, rSecond, rMillisecond] = rollupMilliseconds(rawMS),
          [rYear, rMonth, rDay] = fixOverflow(year, month, day + iDay);

      return {
        year: rYear,
        month: rMonth,
        day: rDay,
        hour: rHour,
        minute: rMinute,
        second: rSecond,
        millisecond: rMillisecond
      };
    }
    else{
      return obj;
    }
  }

  static daysInMonth(m, year){
    if (m == 2){
      return isLeap(year) ? 29 : 28;
    }
    else {
      return [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
    }
  }

  static daysInYear(year){
    return leap(year) ? 366 : 365;
  }

}
