import { ZoneOffsetFormat } from "../types/zone";
import { formatOffset, signedOffset } from "../impl/util";
import Zone from "../zone";

let singleton: FixedOffsetZone | null = null;

/**
 * A zone with a fixed offset (meaning no DST)
 * @implements {Zone}
 */
export default class FixedOffsetZone extends Zone {
  private readonly fixed: number;

  /**
   * Get a singleton instance of UTC
   * @return {FixedOffsetZone}
   */
  static get utcInstance(): FixedOffsetZone {
    if (singleton === null) {
      singleton = new FixedOffsetZone(0);
    }
    return singleton;
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
  static parseSpecifier(s?: string): FixedOffsetZone | null {
    if (!s) return null;
    const r = s.match(/^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i);
    if (r) {
      return new FixedOffsetZone(signedOffset(r[1], r[2]));
    }
    return null;
  }

  constructor(offset: number) {
    super();
    /** @private **/
    this.fixed = offset;
  }

  /** @override **/
  get type(): string {
    return "fixed";
  }

  /** @override **/
  get name(): string {
    return this.fixed === 0 ? "UTC" : `UTC${formatOffset(this.fixed, "narrow")}`;
  }

  /** @override **/
  offsetName(): string {
    return this.name;
  }

  /** @override **/
  formatOffset(_ts: number, format: ZoneOffsetFormat): string {
    return formatOffset(this.fixed, format);
  }

  /** @override **/
  get isUniversal(): boolean {
    return true;
  }

  /** @override **/
  offset(): number {
    return this.fixed;
  }

  /** @override **/
  equals(otherZone: Zone): boolean {
    return otherZone.type === "fixed" && (otherZone as FixedOffsetZone).fixed === this.fixed;
  }

  /** @override **/
  get isValid(): boolean {
    return true;
  }
}
