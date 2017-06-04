import { LocalZone } from './zones/localZone';

let now = () => new Date().valueOf(),
  defaultZone = LocalZone.instance,
  throwOnInvalid = false;

/**
 * Global settings
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
   * Get the default time zone to create DateTimes in.
   * @type {Zone}
   */
  static get defaultZone() {
    return defaultZone;
  }

  /**
   * Set the default time zone to create DateTimes in.
   * @type {Zone}
   */
  static set defaultZone(z) {
    defaultZone = z;
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
