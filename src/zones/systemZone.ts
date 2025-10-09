import { formatOffset, parseZoneInfo } from "../impl/util.js";
import Zone, { type UniversalZone } from "../zone.ts";
import { SINGLETON_MARKER } from "../impl/singleton.ts";

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
    return (singleton ??= new SystemZone(SINGLETON_MARKER));
  }

  private constructor(m: unknown) {
    super();
    if (m !== SINGLETON_MARKER) throw new TypeError("SystemZone is a singleton");
  }

  /** @override **/
  get type() {
    return "system";
  }

  /** @override **/
  get name(): string {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  isOffsetFixed(): this is UniversalZone {
    return false;
  }

  /** @override **/
  offsetName(ts: number, { format, locale }: any /* TODO */): string {
    return parseZoneInfo(ts, format, locale) as never;
  }

  /** @override **/
  formatOffset(ts: number, format: any /* TODO */): string {
    return formatOffset(this.offset(ts), format);
  }

  /** @override **/
  offset(ts: number): number {
    // TODO: Handle floating point result / sub-minute offsets
    return -new Date(ts).getTimezoneOffset();
  }

  /** @override **/
  equals(other: unknown): boolean {
    return Zone.isZone(other) && other.type === "system";
  }
}
