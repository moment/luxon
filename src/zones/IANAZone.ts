import { formatOffset, parseZoneInfo } from "../impl/util.ts";
import Zone, { type UniversalZone } from "../zone.ts";
import { InvalidZoneError, LuxonIntlError } from "../errors.ts";
import {
  INTERNAL_CONSTRUCTOR,
  throwInternalConstructorError,
} from "../impl/internalConstructor.ts";

const dtfCache = new Map<string, Intl.DateTimeFormat>();

function makeDTF(zoneName: string): Intl.DateTimeFormat {
  let dtf = dtfCache.get(zoneName);
  if (dtf === undefined) {
    dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: zoneName,
      hour: "numeric",
      timeZoneName: "longOffset",
    });
    dtfCache.set(zoneName, dtf);
  }
  return dtf;
}

const ianaZoneCache = new Map<string, IANAZone>();

/**
 * A zone identified by an IANA identifier, like America/New_York
 * @implements {Zone}
 */
export default class IANAZone extends Zone {
  /**
   * @param {string} name - Zone name
   * @return {IANAZone}
   */
  static create(name: string): IANAZone {
    let zone = ianaZoneCache.get(name);
    if (zone === undefined) {
      ianaZoneCache.set(name, (zone = new IANAZone(name, INTERNAL_CONSTRUCTOR)));
    }
    return zone;
  }

  /**
   * Reset local caches. Should only be necessary in testing scenarios.
   * @return {void}
   */
  static resetCache(): void {
    ianaZoneCache.clear();
    dtfCache.clear();
  }

  /**
   * Returns whether the provided string identifies a real zone
   * @param {string} zone - The string to check
   * @example IANAZone.isValidZone("America/New_York") //=> true
   * @example IANAZone.isValidZone("Fantasia/Castle") //=> false
   * @example IANAZone.isValidZone("Sport~~blorp") //=> false
   * @return {boolean}
   */
  static isValidZone(zone: string): boolean {
    return IANAZone.normalizeZone(zone) != null;
  }

  /**
   * Normalize the name of the provided IANA zone or return null
   * if it is not a valid IANA zone.
   * @param {string} zone - The string to normalize
   * @example IANAZone.normalizeZone("America/New_York") //=> "America/New_York"
   * @example IANAZone.normalizeZone("america/NEw_York") //=> "America/New_York"
   * @example IANAZone.normalizeZone("EST5EDT") //=> "America/New_York"
   * @example IANAZone.normalizeZone("Fantasia/Castle") //=> null
   * @example IANAZone.normalizeZone("Sport~~blorp") //=> null
   * @return {string|null}
   */
  static normalizeZone(zone: string): string | null {
    if (!zone) {
      return null;
    }
    try {
      return new Intl.DateTimeFormat("en-US", { timeZone: zone }).resolvedOptions().timeZone;
    } catch (e) {
      return null;
    }
  }

  readonly #zoneName: string;

  private constructor(name: string, m?: typeof INTERNAL_CONSTRUCTOR) {
    super();
    if (m !== INTERNAL_CONSTRUCTOR) throwInternalConstructorError("IANAZone");
    const normalizedName = IANAZone.normalizeZone(name);
    if (normalizedName == null) {
      throw new InvalidZoneError(`Invalid IANA Zone ${name}`);
    }
    this.#zoneName = normalizedName.toLowerCase() === name.toLowerCase() ? normalizedName : name;
  }

  /**
   * The type of zone. `iana` for all instances of `IANAZone`.
   * @override
   * @type {string}
   */
  get type(): "iana" {
    return "iana";
  }

  /**
   * The name of this zone (i.e. the IANA zone name).
   * @override
   * @type {string}
   */
  get name(): string {
    return this.#zoneName;
  }

  /**
   * Returns whether the offset is known to be fixed for the whole year:
   * Always returns false for all IANA zones.
   * @override
   * @type {boolean}
   */
  isOffsetFixed(): this is UniversalZone {
    return false;
  }

  /**
   * Returns the offset's common name (such as EST) at the specified timestamp
   * @override
   * @param {number} ts - Epoch milliseconds for which to get the name
   * @param {Object} opts - Options to affect the format
   * @param {string} opts.format - What style of offset to return. Accepts 'long' or 'short'.
   * @param {string} opts.locale - What locale to return the offset name in.
   * @return {string}
   */
  offsetName(ts: number, { format, locale }: any /* TODO */): string {
    return parseZoneInfo(ts, format, locale, this.name as any /* TODO */) as string;
  }

  /**
   * Returns the offset's value as a string
   * @override
   * @param {number} ts - Epoch milliseconds for which to get the offset
   * @param {string} format - What style of offset to return.
   *                          Accepts 'narrow', 'short', or 'techie'. Returning '+6', '+06:00', or '+0600' respectively
   * @return {string}
   */
  formatOffset(ts: number, format: string /* TODO */): string {
    return formatOffset(this.offset(ts), format);
  }

  /**
   * Return the offset in minutes for this zone at the specified timestamp.
   * @override
   * @param {number} ts - Epoch milliseconds for which to compute the offset
   * @return {number}
   */
  offset(ts: number): number {
    const dtf = makeDTF(this.name);
    let offsetPart: Intl.DateTimeFormatPart | undefined;
    try {
      offsetPart = dtf.formatToParts(ts).find((p) => p.type === "timeZoneName");
    } catch (e) {
      return NaN;
    }
    const match = offsetPart?.value.match(/^GMT(?:([+-])(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
    if (match == null) {
      throw new LuxonIntlError(`Failed to extract GMT offset from ${offsetPart?.value}`);
    }
    const [, sign, h = 0, m = 0, s = 0] = match;
    let r = +h * 3600 + +m * 60 + +s;
    if (sign === "-") {
      r *= -1;
    }
    // TODO: This should be in seconds
    return r / 60;
  }

  /**
   * Return whether this Zone is equal to another zone
   * @override
   * @param {Zone} otherZone - the zone to compare
   * @return {boolean}
   */
  equals(otherZone: unknown): boolean {
    return Zone.isZone(otherZone) && otherZone.type === "iana" && otherZone.name === this.name;
  }
}
