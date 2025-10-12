import { formatOffset, isUndefined, objToLocalTS, parseZoneInfo } from "../impl/util.js";
import Zone, { type UniversalZone } from "../zone.ts";
import { InvalidZoneError } from "../errors.js";
import {
  INTERNAL_CONSTRUCTOR,
  throwInternalConstructorError,
} from "../impl/internalConstructor.ts";

const dtfCache = new Map();
function makeDTF(zoneName: string): Intl.DateTimeFormat {
  let dtf = dtfCache.get(zoneName);
  if (dtf === undefined) {
    dtf = new Intl.DateTimeFormat("en-US", {
      hour12: false,
      timeZone: zoneName,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      era: "short",
    });
    dtfCache.set(zoneName, dtf);
  }
  return dtf;
}

const typeToPos = {
  year: 0,
  month: 1,
  day: 2,
  era: 3,
  hour: 4,
  minute: 5,
  second: 6,
};

type OffsetResult = readonly [
  year: number,
  month: number,
  day: number,
  era: string,
  hour: number,
  minute: number,
  second: number,
];

function partsOffset(dtf: Intl.DateTimeFormat, date: Date | number): OffsetResult {
  const formatted = dtf.formatToParts(date);
  const filled: Array<string | number> = [];
  for (let i = 0; i < formatted.length; i++) {
    const { type, value } = formatted[i];
    const pos = typeToPos[type as keyof typeof typeToPos] as number | undefined;

    if (type === "era") {
      filled[pos!] = value;
    } else if (!isUndefined(pos)) {
      filled[pos] = parseInt(value, 10);
    }
  }
  return filled as unknown as OffsetResult;
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

  readonly zoneName: string;

  private constructor(name: string, m?: typeof INTERNAL_CONSTRUCTOR) {
    super();
    if (m !== INTERNAL_CONSTRUCTOR) throwInternalConstructorError("IANAZone");
    const normalizedName = IANAZone.normalizeZone(name);
    if (normalizedName == null) {
      throw new InvalidZoneError(`Invalid IANA Zone ${name}`);
    }
    this.zoneName = normalizedName.toLowerCase() === name.toLowerCase() ? normalizedName : name;
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
    return this.zoneName;
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
    const date = new Date(ts);

    if (isNaN(+date)) return NaN;
    const dtf = makeDTF(this.name);
    let [year, month, day, adOrBc, hour, minute, second] = partsOffset(dtf, date);

    if (adOrBc === "BC") {
      year = -Math.abs(year) + 1;
    }

    // because we're using hour12 and https://bugs.chromium.org/p/chromium/issues/detail?id=1025564&can=2&q=%2224%3A00%22%20datetimeformat
    const adjustedHour = hour === 24 ? 0 : hour;

    const asUTC = objToLocalTS({
      year,
      month,
      day,
      hour: adjustedHour,
      minute,
      second,
      millisecond: 0,
    });

    let asTS = +date;
    const over = asTS % 1000;
    asTS -= over >= 0 ? over : 1000 + over;
    return (asUTC - asTS) / (60 * 1000);
  }

  normalize(): IANAZone {
    const normalized = IANAZone.normalizeZone(this.name);
    if (normalized == null) throw new Error("Failed to normalize IANA zone.");
    return IANAZone.create(normalized);
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
