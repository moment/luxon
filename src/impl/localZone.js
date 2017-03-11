import { Util } from './util';

export class LocalZone {
  get name() {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  get universal() {
    return false;
  }

  offsetName(ts, opts = {}) {
    const offsetFormat = opts.format || 'long';
    return Util.parseZoneInfo(ts, offsetFormat, opts.localeCode || 'en-us');
  }

  offset(ts) {
    return -new Date(ts).getTimezoneOffset();
  }

  equals(otherZone) {
    return otherZone instanceof LocalZone;
  }
}
