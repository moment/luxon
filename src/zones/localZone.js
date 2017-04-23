import { Util } from '../impl/util';
import { Zone } from '../zone';

let singleton = null;

/**
 * @private
 */

export class LocalZone extends Zone {
  static get instance() {
    if (singleton === null) {
      singleton = new LocalZone();
    }
    return singleton;
  }

  get type() {
    return 'local';
  }

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
    return otherZone.type === 'local';
  }
}
