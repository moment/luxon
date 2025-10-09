import { formatOffset, signedOffset } from "../impl/util.js";
import Zone, { type UniversalZone } from "../zone.ts";

let singleton: FixedOffsetZone | null = null;

/**
 * A zone with a fixed offset (meaning no DST)
 * @implements {Zone}
 */
export default class FixedOffsetZone extends Zone {
  /**
   * Get a singleton instance of UTC
   * @return {FixedOffsetZone}
   */
  static get utcInstance(): FixedOffsetZone {
    return (singleton ??= new FixedOffsetZone(0));
  }

  /**
   * Get an instance with a specified offset
   * @param {number} offset - The offset in minutes
   * @return {FixedOffsetZone}
   */
  static instance(offset: number): FixedOffsetZone {
    return offset === 0 ? FixedOffsetZone.utcInstance : new FixedOffsetZone(offset);
  }

  /**
   * Get an instance of FixedOffsetZone from a UTC offset string, like "UTC+6"
   * @param {string} s - The offset string to parse
   * @example FixedOffsetZone.parseSpecifier("UTC+6")
   * @example FixedOffsetZone.parseSpecifier("UTC+06")
   * @example FixedOffsetZone.parseSpecifier("UTC-6:00")
   * @return {FixedOffsetZone}
   */
  static parseSpecifier(s: string): FixedOffsetZone | null {
    if (s) {
      const r = s.match(/^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i);
      if (r) {
        return new FixedOffsetZone(signedOffset(r[1], r[2]));
      }
    }
    return null;
  }

  readonly #fixed: number;

  constructor(offset: number) {
    super();
    this.#fixed = offset;
  }

  /**
   * The type of zone. `fixed` for all instances of `FixedOffsetZone`.
   * @override
   * @type {string}
   */
  get type(): "fixed" {
    return "fixed";
  }

  /**
   * The name of this zone.
   * All fixed zones' names always start with "UTC" (plus optional offset)
   * @override
   * @type {string}
   */
  get name(): string {
    return this.#fixed === 0 ? "UTC" : `UTC${formatOffset(this.#fixed, "narrow")}`;
  }

  /**
   * The IANA name of this zone, i.e. `Etc/UTC` or `Etc/GMT+/-nn`
   *
   * @override
   * @type {string}
   */
  get ianaName(): string {
    if (this.#fixed === 0) {
      return "Etc/UTC";
    } else {
      return `Etc/GMT${formatOffset(-this.#fixed, "narrow")}`;
    }
  }

  /**
   * Returns the offset's common name at the specified timestamp.
   *
   * For fixed offset zones this equals to the zone name.
   * @override
   */
  offsetName(): string {
    return this.name;
  }

  /**
   * Returns the offset's value as a string
   * @override
   * @param {number} ts - Epoch milliseconds for which to get the offset
   * @param {string} format - What style of offset to return.
   *                          Accepts 'narrow', 'short', or 'techie'. Returning '+6', '+06:00', or '+0600' respectively
   * @return {string}
   */
  formatOffset(ts: number, format: string): string {
    return formatOffset(this.#fixed, format);
  }

  /**
   * Returns whether the offset is known to be fixed for the whole year:
   * Always returns true for all fixed offset zones.
   * @override
   * @type {boolean}
   */
  isOffsetFixed(): this is UniversalZone {
    return true;
  }

  /**
   * Return the offset in minutes for this zone at the specified timestamp.
   *
   * For fixed offset zones, this is constant and does not depend on a timestamp.
   * @override
   * @return {number}
   */
  offset(): number {
    return this.#fixed;
  }

  /**
   * Return whether this Zone is equal to another zone (i.e. also fixed and same offset)
   * @override
   * @param {Zone} otherZone - the zone to compare
   * @return {boolean}
   */
  equals(otherZone: unknown): boolean {
    return (
      Zone.isZone(otherZone) && otherZone.type === "fixed" && otherZone.offset(0) === this.#fixed
    );
  }
}
