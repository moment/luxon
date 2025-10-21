import SystemZone from "./zones/systemZone.ts";
import IANAZone from "./zones/IANAZone.ts";
import Locale from "./impl/locale.ts";
import DateTime from "./datetime.ts";

import { normalizeZone, type ZoneInput } from "./impl/zoneUtil.ts";
import { validateWeekSettings } from "./impl/util.ts";
import { resetDigitRegexCache } from "./impl/digits.ts";
import type { LuxonWeekSettings } from "./impl/weekInfo.ts";
import type Zone from "./zone.ts";

let now = () => Date.now(),
  defaultZone: ZoneInput = "system",
  defaultLocale: string | null = null,
  defaultNumberingSystem: string | null = null,
  defaultOutputCalendar: string | null = null,
  twoDigitCutoffYear: number = 60,
  throwOnInvalid: boolean,
  defaultWeekSettings: LuxonWeekSettings | null = null;

/**
 * Settings contains static getters and setters that control Luxon's overall behavior. Luxon is a simple library with few options, but the ones it does have live here.
 */
export default class Settings {
  /**
   * Get the callback for returning the current timestamp.
   * @type {function}
   */
  static get now(): () => number {
    return now;
  }

  /**
   * Set the callback for returning the current timestamp.
   * The function should return a number, which will be interpreted as an Epoch millisecond count
   * @type {function}
   * @example Settings.now = () => Date.now() + 3000 // pretend it is 3 seconds in the future
   * @example Settings.now = () => 0 // always pretend it's Jan 1, 1970 at midnight in UTC time
   */
  static set now(n: () => number) {
    now = n;
  }

  /**
   * Set the default time zone to create DateTimes in. Does not affect existing instances.
   * Use the value "system" to reset this value to the system's time zone.
   * @type {string}
   */
  static set defaultZone(zone: ZoneInput) {
    // TODO: Normalize in the setter, not the getter
    defaultZone = zone;
  }

  /**
   * Get the default time zone object currently used to create DateTimes. Does not affect existing instances.
   * The default value is the system's time zone (the one set on the machine that runs this code).
   * @type {Zone}
   */
  static get defaultZone(): Zone {
    return normalizeZone(defaultZone, SystemZone.instance);
  }

  /**
   * Get the default locale to create DateTimes with. Does not affect existing instances.
   * `null` for the system locale.
   * @type {string}
   */
  static get defaultLocale(): string | null {
    return defaultLocale;
  }

  /**
   * Set the default locale to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static set defaultLocale(locale: string | null) {
    defaultLocale = locale;
  }

  /**
   * Get the default numbering system to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static get defaultNumberingSystem(): string | null {
    return defaultNumberingSystem;
  }

  /**
   * Set the default numbering system to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static set defaultNumberingSystem(numberingSystem: string | null) {
    defaultNumberingSystem = numberingSystem;
  }

  /**
   * Get the default output calendar to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static get defaultOutputCalendar(): string | null {
    return defaultOutputCalendar;
  }

  /**
   * Set the default output calendar to create DateTimes with. Does not affect existing instances.
   * @type {string}
   */
  static set defaultOutputCalendar(outputCalendar: string | null) {
    defaultOutputCalendar = outputCalendar;
  }

  /**
   * @return {LuxonWeekSettings|null}
   */
  static get defaultWeekSettings(): LuxonWeekSettings | null {
    return defaultWeekSettings;
  }

  /**
   * Allows overriding the default locale week settings, i.e. the start of the week, the weekend and
   * how many days are required in the first week of a year.
   * Does not affect existing instances.
   *
   * @param {LuxonWeekSettings|null} weekSettings
   */
  static set defaultWeekSettings(weekSettings: LuxonWeekSettings | null) {
    defaultWeekSettings = validateWeekSettings(weekSettings);
  }

  /**
   * Get the cutoff year for whether a 2-digit year string is interpreted in the current or previous century. Numbers higher than the cutoff will be considered to mean 19xx and numbers lower or equal to the cutoff will be considered 20xx.
   * @type {number}
   */
  static get twoDigitCutoffYear(): number {
    return twoDigitCutoffYear;
  }

  /**
   * Set the cutoff year for whether a 2-digit year string is interpreted in the current or previous century. Numbers higher than the cutoff will be considered to mean 19xx and numbers lower or equal to the cutoff will be considered 20xx.
   * @type {number}
   * @example Settings.twoDigitCutoffYear = 0 // all 'yy' are interpreted as 20th century
   * @example Settings.twoDigitCutoffYear = 99 // all 'yy' are interpreted as 21st century
   * @example Settings.twoDigitCutoffYear = 50 // '49' -> 2049; '50' -> 1950
   * @example Settings.twoDigitCutoffYear = 1950 // interpreted as 50
   * @example Settings.twoDigitCutoffYear = 2050 // ALSO interpreted as 50
   */
  static set twoDigitCutoffYear(cutoffYear: number) {
    twoDigitCutoffYear = cutoffYear % 100;
  }

  /**
   * Get whether Luxon will throw when it encounters invalid DateTimes, Durations, or Intervals
   * @deprecated
   * @type {boolean}
   */
  static get throwOnInvalid(): boolean {
    return throwOnInvalid;
  }

  /**
   * Set whether Luxon will throw when it encounters invalid DateTimes, Durations, or Intervals
   * @type {boolean}
   */
  static set throwOnInvalid(t: boolean) {
    throwOnInvalid = t;
  }

  /**
   * Reset Luxon's global caches. Should only be necessary in testing scenarios.
   * @return {void}
   */
  static resetCaches(): void {
    Locale.resetCache();
    IANAZone.resetCache();
    DateTime.resetCache();
    resetDigitRegexCache();
  }
}
