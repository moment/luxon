import { DateTime } from './datetime';
import { Settings } from './settings';
import { Locale } from './impl/locale';

/**
 * Static methods for retrieving information.
 */
export class Info {
  /**
   * Return whether the specified zone contains a DST.
   * @param {string|Zone} [zone='local'] - Zone to check. Defaults to the environment's local zone.
   * @return {boolean}
   */
  static hasDST(zone = Settings.defaultZone) {
    return (
      !zone.universal &&
      DateTime.local().timezone(zone).month(1).offset() !==
        DateTime.local().timezone(zone).month(5).offset()
    );
  }

  /**
   * Return an array of standalone month names.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param {string} [length='long'] - the length of the month representation, such as "numeric", "2-digit", "narrow", "short", "long"
   * @param {string} [localeCode='en'] - the locale code
   * @param {string} [numbering=null] - the numbering system
   * @example Info.months()[0] //=> 'January'
   * @example Info.months('short')[0] //=> 'Jan'
   * @example Info.months('numeric')[0] //=> '1'
   * @example Info.months('short', 'fr-CA')[0] //=> 'janv.'
   * @example Info.months('numeric', 'ar')[0] //=> '١'
   * @return {[string]}
   */
  static months(length = 'long', localeCode = 'en', numbering = null) {
    return new Locale(localeCode, numbering).months(length);
  }

  /**
   * Return an array of format month names.
   * Format months differ from standalone months in that they're meant to appear next to the day of the month. In some languages, that
   * changes the string.
   * See {@link months}
   * @param {string} [length='long'] - the length of the month representation, such as "numeric", "2-digit", "narrow", "short", "long"
   * @param {string} [localeCode='en'] - the locale code
   * @param {string} [numbering=null] - the numbering system
   * @return {[string]}
   */
  static monthsFormat(length = 'long', localeCode = 'en', numbering = null) {
    return new Locale(localeCode, numbering).months(length, true);
  }

  /**
   * Return an array of standalone week names.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param {string} [length='long'] - the length of the month representation, such as "narrow", "short", "long".
   * @param {string} [localeCode='en'] - the locale code
   * @param {string} [numbering=null] - the numbering system
   * @example Info.weekdays()[0] //=> 'Monday'
   * @example Info.weekdays('short')[0] //=> 'Mon'
   * @example Info.weekdays('short', 'fr-CA')[0] //=> 'lun.'
   * @example Info.weekdays('short', 'ar')[0] //=> 'الاثنين'
   * @return {[string]}
   */
  static weekdays(length = 'long', localeCode = 'en', numbering = null) {
    return new Locale(localeCode, numbering).weekdays(length);
  }

  /**
   * Return an array of format week names.
   * Format weekdays differ from standalone weekdays in that they're meant to appear next to more date information. In some languages, that
   * changes the string.
   * See {@link weekdays}
   * @param {string} [length='long'] - the length of the month representation, such as "narrow", "short", "long".
   * @param {string} [localeCode='en'] - the locale code
   * @param {string} [numbering=null] - the numbering system
   * @return {[string]}
   */
  static weekdaysFormat(length = 'long', localeCode = 'en', numbering = null) {
    return new Locale(localeCode, numbering).weekdays(length, true);
  }

  /**
   * Return an array of meridiems.
   * @param {string} [localeCode='en'] - the locale code
   * @example Info.meridiems() //=> [ 'AM', 'PM' ]
   * @example Info.meridiems('de') //=> [ 'vorm.', 'nachm.' ]
   * @return {[string]}
   */
  static meridiems(localeCode = 'en') {
    return new Locale(localeCode).meridiems();
  }

  /**
   * Return an array of eras.
   * @param {string} [length='short'] - the length of the era representation, such as "short" or "long".
   * @param {string} [localeCode='en'] - the locale code
   * @example Info.eras() //=> [ 'BC', 'AD' ]
   * @example Info.eras('long') //=> [ 'Before Christ', 'Anno Domini' ]
   * @example Info.eras('long', 'fr') //=> [ 'avant Jésus-Christ', 'après Jésus-Christ' ]
   * @return {[string]}
   */
  static eras(length = 'short', localeCode = 'en') {
    return new Locale(localeCode).eras(length);
  }

  /**
   * Return the set of available features in this environment.
   * Some features of Luxon are not available in all environments. For example, on older browsers, timezone support is not available. Use this function to figure out if that's the case.
   * Keys:
   * * `timezones`: whether this environment supports IANA timezones
   * * `intlTokens`: whether this environment supports internationalized token-based formatting/parsing
   * * `intl`: whether this environment supports general internationalization
   * @example Info.feature() //=> { intl: true, intlTokens: false, timezones: true }
   * @return {object}
   */
  static features() {
    let intl = false,
      intlTokens = false,
      timezones = false;

    if (Intl.DateTimeFormat) {
      intl = true;

      intlTokens = typeof new Intl.DateTimeFormat().formatToParts !== 'undefined';

      try {
        Intl.DateTimeFormat({ timeZone: 'America/New_York' });
        timezones = true;
      } catch (e) {
        timezones = false;
      }
    }

    return { intl, intlTokens, timezones };
  }
}
