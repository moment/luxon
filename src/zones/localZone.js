import { Util } from '../impl/util';
import { Zone } from '../zone';

export class LocalZone extends Zone {
  get name() {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  get universal() {
    return false;
  }

  offsetName(ts, { format = 'long', localeCode = 'en-us' } = {}) {
    return Util.parseZoneInfo(ts, format, localeCode || 'en-us');
  }

  offset(ts) {
    return -new Date(ts).getTimezoneOffset();
  }

  equals(otherZone) {
    return otherZone instanceof LocalZone;
  }
}
