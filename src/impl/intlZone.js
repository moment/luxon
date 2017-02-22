import { Util } from './util';

export class IntlZone {

  constructor(name) {
    this.zoneName = name;
  }

  get name() {
    return this.zoneName;
  }

  get universal() {
    return false;
  }

  offsetName(ts, opts = {}) {
    const offsetFormat = opts.format || 'long';
    return Util.parseZoneInfo(ts,
                              offsetFormat,
                              opts.localeCode || 'en-us',
                              this.zoneName);
  }

  offset(ts) {
    // formatToParts() will simplify this, but the polyfill doesn't support TZs,
    // so leaving this hack in
    const date = new Date(ts);
    const formatted = new Intl.DateTimeFormat('en-us', {
      hour12: false,
      timeZone: this.zoneName,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit' }).format(date);
    const parsed = /(\d+)\/(\d+)\/(\d+), (\d+):(\d+)/.exec(formatted);
    const [, fMonth, fDay, fYear, fHour, fMinute] = parsed;
    const asUTC = Date.UTC(fYear, fMonth - 1, fDay, fHour, fMinute);
    const asTS = date.valueOf();
    return (asUTC - asTS) / (60 * 1000);
  }

  equals(otherZone) {
    return (otherZone instanceof IntlZone) && otherZone.zoneName === this.zoneName;
  }
}
