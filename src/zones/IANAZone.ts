import { formatOffset, parseZoneInfo, isUndefined, ianaRegex, objToLocalTS } from "../impl/util";
import Zone from "../zone";
import { ZoneOffsetOptions, ZoneOffsetFormat } from "../types/zone";
import { InvalidZoneError } from "../errors";

const matchingRegex = RegExp(`^${ianaRegex.source}$`);

let dtfCache: Record<string, Intl.DateTimeFormat> = {};

function makeDTF(zone: string) {
  if (!dtfCache[zone]) {
    try {
      dtfCache[zone] = new Intl.DateTimeFormat("en-US", {
        hour12: false,
        timeZone: zone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch {
      throw new InvalidZoneError(zone);
    }
  }
  return dtfCache[zone];
}

const typeToPos: Partial<Record<Intl.DateTimeFormatPartTypes, number>> = {
  year: 0,
  month: 1,
  day: 2,
  hour: 3,
  minute: 4,
  second: 5
};

function hackyOffset(dtf: Intl.DateTimeFormat, date: Date) {
  const formatted = dtf.format(date).replace(/\u200E/g, ""),
    parsed = /(\d+)\/(\d+)\/(\d+),? (\d+):(\d+):(\d+)/.exec(formatted);

  if (parsed !== null) {
    const [, month, day, year, hour, minute, second] = parsed;
    return [
      parseInt(year, 10),
      parseInt(month, 10),
      parseInt(day, 10),
      parseInt(hour, 10),
      parseInt(minute, 10),
      parseInt(second, 10)
    ];
  }

  return [0, 0, 0, 0, 0, 0];
}

function partsOffset(dtf: Intl.DateTimeFormat, date: Date) {
  const formatted = dtf.formatToParts(date),
    filled = [];
  for (let i = 0; i < formatted.length; i++) {
    const { type, value } = formatted[i],
      pos = typeToPos[type];

    if (!isUndefined(pos)) {
      filled[pos] = parseInt(value, 10);
    }
  }
  return filled;
}

let ianaZoneCache: Record<string, IANAZone> = {};
/**
 * A zone identified by an IANA identifier, like America/New_York
 * @implements {Zone}
 */
export default class IANAZone extends Zone {
  private readonly zoneName: string;
  private readonly valid: boolean;

  /**
   * @param {string} name - Zone name
   * @return {IANAZone}
   */
  static create(name: string) {
    if (!ianaZoneCache[name]) {
      ianaZoneCache[name] = new IANAZone(name);
    }
    return ianaZoneCache[name];
  }

  /**
   * Reset local caches. Should only be necessary in testing scenarios.
   * @return {void}
   */
  static resetCache() {
    ianaZoneCache = {};
    dtfCache = {};
  }

  /**
   * Returns whether the provided string is a valid specifier. This only checks the string's format, not that the specifier identifies a known zone; see isValidZone for that.
   * @param {string} s - The string to check validity on
   * @example IANAZone.isValidSpecifier("America/New_York") //=> true
   * @example IANAZone.isValidSpecifier("Fantasia/Castle") //=> true
   * @example IANAZone.isValidSpecifier("Sport~~blorp") //=> false
   * @return {boolean}
   */
  static isValidSpecifier(s: string) {
    return !!(s && matchingRegex.exec(s) !== null);
  }

  /**
   * Returns whether the provided string identifies a real zone
   * @param {string} zone - The string to check
   * @example IANAZone.isValidZone("America/New_York") //=> true
   * @example IANAZone.isValidZone("Fantasia/Castle") //=> false
   * @example IANAZone.isValidZone("Sport~~blorp") //=> false
   * @return {boolean}
   */
  static isValidZone(zone: string) {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: zone }).format();
      return true;
    } catch (e) {
      return false;
    }
  }

  // Etc/GMT+8 -> -480
  /** @ignore */
  static parseGMTOffset(specifier: string) {
    if (specifier) {
      const regexp = /^Etc\/GMT([+-]\d{1,2})$/i;
      const match = regexp.exec(specifier);
      if (match !== null) {
        return -60 * parseInt(match[1]);
      }
    }
    return null;
  }

  private constructor(name: string) {
    super();
    /** @private **/
    this.zoneName = name;
    /** @private **/
    this.valid = IANAZone.isValidZone(name);
  }

  /** @override **/
  get type() {
    return "iana";
  }

  /** @override **/
  get name() {
    return this.zoneName;
  }

  /** @override **/
  get universal() {
    return false;
  }

  /** @override **/
  offsetName(ts: number, { format, locale }: ZoneOffsetOptions = {}) {
    return parseZoneInfo(ts, format, locale, this.name);
  }

  /** @override **/
  formatOffset(ts: number, format: ZoneOffsetFormat) {
    return formatOffset(this.offset(ts), format);
  }

  /** @override **/
  offset(ts: number) {
    const date = new Date(ts),
      dtf = makeDTF(this.name),
      [year, month, day, hour, minute, second] =
        dtf.formatToParts === undefined ? hackyOffset(dtf, date) : partsOffset(dtf, date),
      // work around https://bugs.chromium.org/p/chromium/issues/detail?id=1025564&can=2&q=%2224%3A00%22%20datetimeformat
      adjustedHour = hour === 24 ? 0 : hour;

    const asUTC = objToLocalTS({
      year,
      month,
      day,
      hour: adjustedHour,
      minute,
      second,
      millisecond: 0
    });

    let asTS = date.valueOf();
    const over = asTS % 1000;
    asTS -= over >= 0 ? over : 1000 + over;
    return (asUTC - asTS) / (60 * 1000);
  }

  /** @override **/
  equals(other: Zone) {
    return other.type === "iana" && other.name === this.name;
  }

  /** @override **/
  get isValid() {
    return this.valid;
  }
}
