import { ZoneIsAbstractError } from "./errors.js";
import { isLuxonType, LUXON_TYPE, type LuxonTypeMarker } from "./impl/crossRealm.ts";

export const LUXON_TYPE_ZONE = "zone" as LuxonTypeMarker<Zone>;

export default class Zone {
  constructor() {
    if (new.target === Zone) throw new ZoneIsAbstractError();
  }

  get [LUXON_TYPE](): typeof LUXON_TYPE_ZONE {
    return LUXON_TYPE_ZONE;
  }

  /**
   * Check if the provided value is a Zone.
   * This function works across JavaScript realms (such as an iframe).
   * @param value
   */
  static isZone(value: unknown): value is Zone {
    return isLuxonType(value, LUXON_TYPE_ZONE);
  }

  /**
   * The type of zone
   * @abstract
   * @type {string}
   */
  get type(): string {
    throw new ZoneIsAbstractError();
  }

  /**
   * The name of this zone.
   * @abstract
   * @type {string}
   */
  get name(): string {
    throw new ZoneIsAbstractError();
  }

  /**
   * The IANA name of this zone.
   * Defaults to `name` if not overwritten by a subclass.
   * @abstract
   * @type {string}
   */
  get ianaName(): string {
    return this.name;
  }

  /**
   * Returns whether the offset is known to be fixed for the whole year.
   * @abstract
   * @type {boolean}
   */
  get isUniversal(): boolean {
    throw new ZoneIsAbstractError();
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
  offsetName(ts: number, opts: any): string {
    throw new ZoneIsAbstractError();
  }

  /**
   * Returns the offset's value as a string
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to get the offset
   * @param {string} format - What style of offset to return.
   *                          Accepts 'narrow', 'short', or 'techie'. Returning '+6', '+06:00', or '+0600' respectively
   * @return {string}
   */
  formatOffset(ts: number, format: string): string {
    throw new ZoneIsAbstractError();
  }

  /**
   * Return the offset in minutes for this zone at the specified timestamp.
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to compute the offset
   * @return {number}
   */
  offset(ts: number): number {
    throw new ZoneIsAbstractError();
  }

  /**
   * Return whether this Zone is equal to another zone
   * @abstract
   * @param {Zone} otherZone - the zone to compare
   * @return {boolean}
   */
  equals(otherZone: Zone): boolean {
    throw new ZoneIsAbstractError();
  }

  /**
   * Return whether this Zone is valid.
   * @abstract
   * @type {boolean}
   */
  get isValid(): boolean {
    throw new ZoneIsAbstractError();
  }
}
