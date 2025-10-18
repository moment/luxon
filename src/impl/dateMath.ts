// x % n but takes the sign of n instead of x
export function floorMod(x: number, n: number): number {
  return x - n * Math.floor(x / n);
}

export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function daysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

export function daysInMonth(year: number, month: number): number {
  const modMonth = floorMod(month - 1, 12) + 1,
    modYear = year + (month - modMonth) / 12;

  if (modMonth === 2) {
    return isLeapYear(modYear) ? 29 : 28;
  } else {
    return 30 + ((modMonth + (modMonth >>> 3)) & 1);
  }
}

export function dayOfWeek(year: number, month: number, day: number): number {
  const d = new Date(Date.UTC(year, month - 1, day));

  if (year < 100 && year >= 0) {
    d.setUTCFullYear(d.getUTCFullYear() - 1900);
  }

  const js = d.getUTCDay();

  return js === 0 ? 7 : js;
}

const nonLeapLadder = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
  leapLadder = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];

export function computeOrdinal(year: number, month: number, day: number): number {
  return (isLeapYear(year) ? leapLadder : nonLeapLadder)[month - 1] + day;
}

export function uncomputeOrdinal(year: number, ordinal: number): { month: number; day: number } {
  const table = isLeapYear(year) ? leapLadder : nonLeapLadder,
    month0 = table.findLastIndex((i) => ordinal > i),
    day = ordinal - table[month0];
  return { month: month0 + 1, day };
}

export function isoWeekdayToLocal(isoWeekday: number, startOfWeek: number): number {
  return ((isoWeekday - startOfWeek + 7) % 7) + 1;
}
