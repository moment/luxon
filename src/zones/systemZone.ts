import { formatOffset, parseZoneInfo, hasIntl } from "../impl/util";
import Zone from "../zone";
import { ZoneOffsetFormat, ZoneOffsetOptions } from "../types/zone";

let singleton: SystemZone | null = null;

/**
 * Represents the system's local zone for this Javascript environment.
 * @implements {Zone}
 */
export default class SystemZone extends Zone {
  /**
   * Get a singleton instance of the system's local zone
   * @return {SystemZone}
   */
  static get instance() {
    if (singleton === null) {
      singleton = new SystemZone();
    }
    return singleton;
  }

  /** @override **/
  get type() {
    return "system";
  }

  /** @override **/
  get name() {
    if (hasIntl()) {
      return new Intl.DateTimeFormat().resolvedOptions().timeZone;
    } else return "system";
  }

  /** @override **/
  get isUniversal() {
    return false;
  }

  /** @override **/
  offsetName(ts: number, { format, locale }: ZoneOffsetOptions = {}) {
    return parseZoneInfo(ts, format, locale);
  }

  /** @override **/
  formatOffset(ts: number, format: ZoneOffsetFormat) {
    return formatOffset(this.offset(ts), format);
  }

  /** @override **/
  offset(ts: number) {
    return -new Date(ts).getTimezoneOffset();
  }

  /** @override **/
  equals(other: Zone) {
    return other.type === "system";
  }

  /** @override **/
  get isValid() {
    return true;
  }
}
