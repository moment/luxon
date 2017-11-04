import { Util } from '../impl/util';
import { Zone } from '../zone';
import { Settings } from '../settings';

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
    if (!Util.isUndefined(Intl) && !Util.isUndefined(Intl.DateTimeFormat)) {
      return new Intl.DateTimeFormat().resolvedOptions().timeZone;
    } else return 'local';
  }

  get universal() {
    return false;
  }

  offsetName(ts, { format = 'long', locale = Settings.defaultLocale } = {}) {
    return Util.parseZoneInfo(ts, format, locale);
  }

  offset(ts) {
    return -new Date(ts).getTimezoneOffset();
  }

  equals(otherZone) {
    return otherZone.type === 'local';
  }

  get isValid() {
    return true;
  }
}
