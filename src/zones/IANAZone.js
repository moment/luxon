import { parseZoneInfo, isUndefined } from '../impl/util';
import Zone from '../zone';

let zoneCache = {};

const makeDTF = zone =>
  new Intl.DateTimeFormat('en-US', {
    hour12: false,
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

const typeToPos = {
  year: 0,
  month: 1,
  day: 2,
  hour: 3,
  minute: 4,
  second: 5
};

const hackyOffset = (dtf, date) => {
  const formatted = dtf.format(date).replace(/\u200E/g, ''),
    parsed = /(\d+)\/(\d+)\/(\d+),? (\d+):(\d+):(\d+)/.exec(formatted),
    [, fMonth, fDay, fYear, fHour, fMinute, fSecond] = parsed;
  return [fYear, fMonth, fDay, fHour, fMinute, fSecond];
};

const partsOffset = (dtf, date) => {
  const formatted = dtf.formatToParts(date),
    filled = [];
  for (let i = 0; i < formatted.length; i++) {
    const { type, value } = formatted[i],
      pos = typeToPos[type];

    if (!isUndefined(pos)) {
      filled[pos] = parseInt(value, 10);
    }
  }
  return filled;
};

export default class IANAZone extends Zone {
  static create(specifier) {
    if (!zoneCache[specifier]) {
      zoneCache[specifier] = new IANAZone(specifier);
    }
    return zoneCache[specifier];
  }

  static resetCache() {
    zoneCache = {};
  }

  static isValidSpecifier(s) {
    return s && s.match(/^[a-z_+-]{1,256}(\/[a-z_+-]{1,256}(\/[a-z_+-]{1,256})?)?$/i);
  }

  static isValidZone(zone) {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: zone }).format();
      return true;
    } catch (e) {
      return false;
    }
  }

  // Etc/GMT+8 -> -480
  static parseGMTOffset(specifier) {
    if (specifier) {
      const match = specifier.match(/^Etc\/GMT([+-]\d{1,2})$/i);
      if (match) {
        return -60 * parseInt(match[1]);
      }
    }
    return null;
  }

  constructor(name) {
    super();
    this.zoneName = name;
    this.valid = IANAZone.isValidZone(name);
    if (this.valid) {
      this.dtf = makeDTF(name);
    }
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
    return parseZoneInfo(ts, format, locale, this.zoneName);
  }

  offset(ts) {
    if (!this.valid) {
      return NaN;
    } else {
      const date = new Date(ts),
        [fYear, fMonth, fDay, fHour, fMinute, fSecond] = this.dtf.formatToParts
          ? partsOffset(this.dtf, date)
          : hackyOffset(this.dtf, date),
        asUTC = Date.UTC(fYear, fMonth - 1, fDay, fHour, fMinute, fSecond);
      let asTS = date.valueOf();
      asTS -= asTS % 1000;
      return (asUTC - asTS) / (60 * 1000);
    }
  }

  equals(otherZone) {
    return otherZone.type === 'iana' && otherZone.zoneName === this.zoneName;
  }

  get isValid() {
    return this.valid;
  }
}
