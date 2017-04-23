import { Util } from '../impl/util';
import { Zone } from '../zone';

/**
 * @private
 */

export class IANAZone extends Zone {
  static isValidSpecier(s) {
    return s && s.match(/[a-z_]+\/[a-z_]+/i);
  }

  constructor(name) {
    super();
    this.zoneName = name;
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

  offsetName(ts, { format = 'long', localeCode = 'en-us' } = {}) {
    return Util.parseZoneInfo(ts, format, localeCode || 'en-us', this.zoneName);
  }

  offset(ts) {
    // formatToParts() will simplify this, but the polyfill doesn't support TZs,
    // so leaving this hack in
    const date = new Date(ts),
      formatted = new Intl.DateTimeFormat('en-us', {
        hour12: false,
        timeZone: this.zoneName,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(date),
      parsed = /(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)/.exec(formatted),
      [, fMonth, fDay, fYear, fHour, fMinute, fSecond] = parsed,
      asUTC = Date.UTC(fYear, fMonth - 1, fDay, fHour, fMinute, fSecond);
    let asTS = date.valueOf();
    asTS -= asTS % 1000;
    return (asUTC - asTS) / (60 * 1000);
  }

  equals(otherZone) {
    return otherZone.type === 'iana' && otherZone.zoneName === this.zoneName;
  }
}
