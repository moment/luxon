import { formatOffset, signedOffset } from "../impl/util";
import Zone from "../zone";
import { ZoneOffsetFormat, ZoneOffsetOptions } from "../types/zone";

let singleton: FixedOffsetZone | undefined;

/**
 * A zone with a fixed offset (meaning no DST)
 * @implements {Zone}
 */
export default class FixedOffsetZone extends Zone {
  private fixed: Readonly<number>;

  /**
   * Get a singleton instance of UTC
   * @return {FixedOffsetZone}
   */
  static get utcInstance() {
    if (singleton === undefined) {
      singleton = new FixedOffsetZone(0);
    }
    return singleton;
  }

  /**
   * Get an instance with a specified offset
   * @param {number} offset - The offset in minutes
   * @return {FixedOffsetZone}
   */
  static instance(offset: number) {
    return offset === 0 ? FixedOffsetZone.utcInstance : new FixedOffsetZone(offset);
  }

  /**
   * Get an instance of FixedOffsetZone from a UTC offset string, like "UTC+6"
   * @param {string} s - The offset string to parse
   * @example FixedOffsetZone.parseSpecifier("UTC+6")
   * @example FixedOffsetZone.parseSpecifier("UTC+06")
   * @example FixedOffsetZone.parseSpecifier("UTC-6:00")
   * @return {FixedOffsetZone | null}
   */
  static parseSpecifier(s: string) {
    if (s) {
      const regexp = /^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i;
      const r = regexp.exec(s);
      if (r !== null) {
        return new FixedOffsetZone(signedOffset(r[1], r[2]));
      }
    }
    return null;
  }

  constructor(offset: number) {
    super();
    /** @private **/
    this.fixed = offset;
  }

  /** @override **/
  get type() {
    return "fixed";
  }

  /** @override **/
  get name() {
    return this.fixed === 0 ? "UTC" : `UTC${formatOffset(this.fixed, "narrow")}`;
  }

  /** @override **/
  offsetName(_ts?: number, _options?: ZoneOffsetOptions) {
    return this.name;
  }

  /** @override **/
  formatOffset(_ts: number, format: ZoneOffsetFormat) {
    return formatOffset(this.fixed, format);
  }

  /** @override **/
  get universal() {
    return true;
  }

  /** @override **/
  offset(_ts?: number) {
    return this.fixed;
  }

  /** @override **/
  equals(other: Zone): boolean {
    return other.type === "fixed" && (other as FixedOffsetZone).fixed === this.fixed;
  }

  /** @override **/
  get isValid() {
    return true;
  }
}
