import { LocalZone } from './zones/localZone';
import { Util } from './impl/util';

let now = () => new Date().valueOf(),
  defaultZone = LocalZone.instance,
  throwOnInvalid = false;

/**
 * Settings contains static getters and setters that control Luxon's overall behavior. Luxon is a simple library with few options, but the ones it does have live here.
 */
export class Settings {
  /**
   * Get the callback for returning the current timestamp.
   * @type {function}
   */
  static get now() {
    return now;
  }

  /**
   * Set the callback for returning the current timestamp.
   * @type {function}
   */
  static set now(n) {
    now = n;
  }

  /**
   * Set the default time zone to create DateTimes in.
   * @type {string}
   */
  static get defaultZoneName() {
    return defaultZone.name;
  }

  /**
   * Set the default time zone to create DateTimes in.
   * @type {string}
   */
  static set defaultZoneName(z) {
    defaultZone = Util.normalizeZone(z);
  }

  /**
   * Get the default time zone object to create DateTimes in.
   * @type {Zone}
   */
  static get defaultZone() {
    return defaultZone;
  }

  /**
   * Get whether Luxon will throw when it encounters invalid DateTimes, Durations, or Intervals
   * @type {Zone}
   */
  static get throwOnInvalid() {
    return throwOnInvalid;
  }

  /**
   * Set whether Luxon will throw when it encounters invalid DateTimes, Durations, or Intervals
   * @type {Zone}
   */
  static set throwOnInvalid(t) {
    throwOnInvalid = t;
  }
}
