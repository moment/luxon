import { ZoneOffsetFormat, ZoneOffsetOptions } from "../types/zone";
import { formatOffset, parseZoneInfo } from "../impl/util";
import Zone from "../zone";

let singleton: SystemZone | null = null;

/**
 * Represents the local zone for this JavaScript environment.
 * @implements {Zone}
 */
export default class SystemZone extends Zone {
  /**
   * Get a singleton instance of the local zone
   * @return {SystemZone}
   */
  static get instance(): SystemZone {
    if (singleton === null) {
      singleton = new SystemZone();
    }
    return singleton;
  }

  /** @override **/
  get type(): string {
    return "system";
  }

  /** @override **/
  get name(): string {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  /** @override **/
  get isUniversal(): boolean {
    return false;
  }

  /** @override **/
  offsetName(ts: number, { format, locale }: ZoneOffsetOptions): string | null {
    return parseZoneInfo(ts, format, locale);
  }

  /** @override **/
  formatOffset(ts: number, format: ZoneOffsetFormat): string {
    return formatOffset(this.offset(ts), format);
  }

  /** @override **/
  offset(ts: number): number {
    return -new Date(ts).getTimezoneOffset();
  }

  /** @override **/
  equals(otherZone: Zone): boolean {
    return otherZone.type === "system";
  }

  /** @override **/
  get isValid(): boolean {
    return true;
  }
}
