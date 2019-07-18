import SystemZone from "./zones/systemZone";
import IANAZone from "./zones/IANAZone";
import Locale from "./impl/locale";

import { normalizeZone } from "./impl/zoneUtil";
import { NumberingSystem, CalendarSystem } from "./types/locale";
import { ZoneLike } from "./types/zone";

let now = () => Date.now(),
  defaultZone: ZoneLike | undefined,
  defaultLocale: string | undefined,
  defaultNumberingSystem: NumberingSystem | undefined,
  defaultOutputCalendar: CalendarSystem | undefined;

/**
 * Settings contains static getters and setters that control Luxon's overall behavior. Luxon is a simple library with few options, but the ones it does have live here.
 */
export default class Settings {
  /**
   * Get the callback for returning the current timestamp.
   * @type {function}
   */
  static get now() {
    return now;
  }

  /**
   * Set the callback for returning the current timestamp.
   * The function should return a number, which will be interpreted as an Epoch millisecond count
   * @type {function}
   * @example Settings.now = () => Date.now() + 3000 // pretend it is 3 seconds in the future
   * @example Settings.now = () => 0 // always pretend it's Jan 1, 1970 at midnight in UTC time
   */
  static set now(n) {
    now = n;
  }

  /**
   * Set the default time zone to create DateTimes in. Does not affect existing instances.
   *
   * Use the value "system" (default) to reset this value to the system's time zone.
   *
   * zone can be any IANA zone supported by the host environment, or a fixed-offset name of the form 'UTC+3'.
   *
   * You may also supply an instance of a {@link Zone} class, or a number which will be interpreted as a UTC offset in minutes.
   * @param {Zone | string | number} [zone='system'] - the zone value
   */
  static setDefaultZone(zone?: ZoneLike) {
    defaultZone = zone;
  }

  /**
   * Get the default time zone object currently used to create DateTimes. Does not affect existing instances.
   * The default value is the system's time zone (the one set on the machine that runs this code).
   * @type {Zone}
   */
  static get defaultZone() {
    return normalizeZone(defaultZone, SystemZone.instance);
  }

  /**
   * Get the default locale to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static get defaultLocale() {
    return defaultLocale;
  }

  /**
   * Set the default locale to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static set defaultLocale(locale: string | undefined) {
    defaultLocale = locale;
  }

  /**
   * Get the default numbering system to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static get defaultNumberingSystem() {
    return defaultNumberingSystem;
  }

  /**
   * Set the default numbering system to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static set defaultNumberingSystem(numberingSystem: NumberingSystem | undefined) {
    defaultNumberingSystem = numberingSystem;
  }

  /**
   * Get the default output calendar to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static get defaultOutputCalendar() {
    return defaultOutputCalendar;
  }

  /**
   * Set the default output calendar to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static set defaultOutputCalendar(outputCalendar: CalendarSystem | undefined) {
    defaultOutputCalendar = outputCalendar;
  }

  /**
   * Reset Luxon's global caches. Should only be necessary in testing scenarios.
   * @return {void}
   */
  static resetCaches() {
    Locale.resetCache();
    IANAZone.resetCache();
  }
}
