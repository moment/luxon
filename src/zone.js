function zoneIsAbstract() {
  throw new TypeError("Zone is abstract.");
}

/**
 * @interface
 */
export default class Zone {
  constructor() {
    if (new.target === Zone) {
      zoneIsAbstract();
    }
  }

  /**
   * The type of zone
   * @abstract
   * @type {string}
   */
  get type() {
    zoneIsAbstract();
  }

  /**
   * The name of this zone.
   * @abstract
   * @type {string}
   */
  get name() {
    zoneIsAbstract();
  }

  /**
   * The IANA name of this zone.
   * Defaults to `name` if not overwritten by a subclass.
   * @type {string}
   */
  get ianaName() {
    return this.name;
  }

  /**
   * Returns whether the offset is known to be fixed for the whole year.
   * @abstract
   * @type {boolean}
   */
  get isUniversal() {
    zoneIsAbstract();
  }

  /**
   * Returns the offset's common name (such as EST) at the specified timestamp
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to get the name
   * @param {Object} opts - Options to affect the format
   * @param {string} opts.format - What style of offset to return. Accepts 'long' or 'short'.
   * @param {string} opts.locale - What locale to return the offset name in.
   * @return {string}
   */
  offsetName(ts, opts) {
    zoneIsAbstract();
  }

  /**
   * Returns the offset's value as a string
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to get the offset
   * @param {string} format - What style of offset to return.
   *                          Accepts 'narrow', 'short', or 'techie'. Returning '+6', '+06:00', or '+0600' respectively
   * @return {string}
   */
  formatOffset(ts, format) {
    zoneIsAbstract();
  }

  /**
   * Return the offset in minutes for this zone at the specified timestamp.
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to compute the offset
   * @return {number}
   */
  offset(ts) {
    zoneIsAbstract();
  }

  /**
   * Return whether this Zone is equal to another zone
   * @abstract
   * @param {Zone} otherZone - the zone to compare
   * @return {boolean}
   */
  equals(otherZone) {
    zoneIsAbstract();
  }

  /**
   * Return whether this Zone is valid.
   * Always true.
   * @deprecated
   * @type {boolean}
   */
  get isValid() {
    return true;
  }
}
