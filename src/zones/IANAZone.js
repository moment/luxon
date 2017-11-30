import { Util } from '../impl/util';
import { Zone } from '../zone';

const typeToPos = {
  year: 0,
  month: 1,
  day: 2,
  hour: 3,
  minute: 4,
  second: 5
};

function hackyOffset(dtf, date) {
  const formatted = dtf.format(date).replace(/\u200E/g, ''),
    parsed = /(\d+)\/(\d+)\/(\d+),? (\d+):(\d+):(\d+)/.exec(formatted),
    [, fMonth, fDay, fYear, fHour, fMinute, fSecond] = parsed;
  return [fYear, fMonth, fDay, fHour, fMinute, fSecond];
}

function partsOffset(dtf, date) {
  const formatted = dtf.formatToParts(date),
    filled = [];
  for (let i = 0; i < formatted.length; i++) {
    const { type, value } = formatted[i],
      pos = typeToPos[type];

    if (!Util.isUndefined(pos)) {
      filled[pos] = parseInt(value, 10);
    }
  }
  return filled;
}

function isValid(zone) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone }).format();
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * @private
 */

export class IANAZone extends Zone {
  static isValidSpecier(s) {
    return s && s.match(/[a-z_]{1,256}\/[a-z_]{1,256}/i);
  }

  constructor(name) {
    super();
    this.zoneName = name;
    this.valid = isValid(name);
  }

  get type() {
    return 'iana';
  }

  get name() {
    return this.zoneName;
  }

  get universal() {
    return false;
  }

  offsetName(ts, { format, locale }) {
    return Util.parseZoneInfo(ts, format, locale, this.zoneName);
  }

  offset(ts) {
    const date = new Date(ts),
      dtf = new Intl.DateTimeFormat('en-US', {
        hour12: false,
        timeZone: this.zoneName,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      [fYear, fMonth, fDay, fHour, fMinute, fSecond] = dtf.formatToParts
        ? partsOffset(dtf, date)
        : hackyOffset(dtf, date),
      asUTC = Date.UTC(fYear, fMonth - 1, fDay, fHour, fMinute, fSecond);
    let asTS = date.valueOf();
    asTS -= asTS % 1000;
    return (asUTC - asTS) / (60 * 1000);
  }

  equals(otherZone) {
    return otherZone.type === 'iana' && otherZone.zoneName === this.zoneName;
  }

  get isValid() {
    return this.valid;
  }
}
