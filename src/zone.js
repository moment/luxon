/* eslint no-unused-vars: "off" */
import { ZoneIsAbstract } from './errors';

/**
 * @interface
*/
export class Zone {
  /**
   * The type of zone
   * @abstract
   * @return {string}
   */
  get type() {
    throw new ZoneIsAbstract();
  }

  /**
   * The name of this zone.
   * @abstract
   * @return {string}
   */
  get name() {
    throw new ZoneIsAbstract();
  }

  /**
   * Returns whether the offset is known to be fixed for the whole year.
   * @abstract
   * @return {boolean}
   */
  get universal() {
    throw new ZoneIsAbstract();
  }

  /**
   * Returns the offset's common name (such as EST) at the specified timestamp
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to get the name
   * @param {Object} options - Options to affect the format
   * @param {string} options.format - What style of offset to return. Accepts 'long' or 'short'.
   * @param {string} options.localeCode - What locale to return the offset name in. Defaults to us-en
   * @return {string}
   */
  static offsetName(ts, { format = 'long', localeCode = 'en-us' } = {}) {
    throw new ZoneIsAbstract();
  }

  /**
   * Return the offset in minutes for this zone at the specified timestamp.
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to compute the offset
   * @return {number}
   */
  offset(ts) {
    throw new ZoneIsAbstract();
  }

  /**
   * Return whether this Zone is equal to another zoner
   * @abstract
   * @param {Zone} otherZone - the zone to compare
   * @return {boolean}
   */
  equals(otherZone) {
    throw new ZoneIsAbstract();
  }

  /**
   * Return whether this Zone is valid.
   * @abstract
   * @return {boolean}
   */
  get isValid() {
    throw new ZoneIsAbstract();
  }
}
