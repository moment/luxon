import { ZoneOffsetFormat, ZoneOffsetOptions } from "../types/zone";
import { formatOffset, parseZoneInfo, isUndefined, ianaRegex, objToLocalTS } from "../impl/util";
import Zone from "../zone";

const matchingRegex = RegExp(`^${ianaRegex.source}$`);

let dtfCache: Record<string, Intl.DateTimeFormat> = {};
function makeDTF(zone: string): Intl.DateTimeFormat {
  if (!dtfCache[zone]) {
    dtfCache[zone] = new Intl.DateTimeFormat("en-US", {
      hourCycle: "h23",
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }
  return dtfCache[zone];
}

const typeToPos: Partial<Record<Intl.DateTimeFormatPartTypes, number>> = {
  year: 0,
  month: 1,
  day: 2,
  hour: 3,
  minute: 4,
  second: 5,
};

function hackyOffset(dtf: Intl.DateTimeFormat, date: Date) {
  const formatted = dtf.format(date).replace(/\u200E/g, ""),
    parsed = /(\d+)\/(\d+)\/(\d+),? (\d+):(\d+):(\d+)/.exec(formatted),
    [, fMonth, fDay, fYear, fHour, fMinute, fSecond] = parsed as RegExpExecArray;
  return [
    parseInt(fYear),
    parseInt(fMonth),
    parseInt(fDay),
    parseInt(fHour),
    parseInt(fMinute),
    parseInt(fSecond),
  ];
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

let ianaZoneCache: { [name: string]: IANAZone } = {};
/**
 * A zone identified by an IANA identifier, like America/New_York
 * @implements {Zone}
 */
export default class IANAZone extends Zone {
  readonly valid: boolean;
  readonly zoneName: string;

  /**
   * @param {string} name - Zone name
   * @return {IANAZone}
   */
  static create(name: string): IANAZone {
    if (!ianaZoneCache[name]) {
      ianaZoneCache[name] = new IANAZone(name);
    }
    return ianaZoneCache[name];
  }

  /**
   * Reset local caches. Should only be necessary in testing scenarios.
   * @return {void}
   */
  static resetCache(): void {
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
  static isValidSpecifier(s: string): boolean {
    return !!(s && s.match(matchingRegex));
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
    if (!zone) {
      return false;
    }
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: zone }).format();
      return true;
    } catch (e) {
      return false;
    }
  }

  // Etc/GMT+8 -> -480
  /** @ignore */
  static parseGMTOffset(specifier: string): number | null {
    if (specifier) {
      const match = specifier.match(/^Etc\/GMT(0|[+-]\d{1,2})$/i);
      if (match) {
        return -60 * parseInt(match[1]);
      }
    }
    return null;
  }

  constructor(name: string) {
    super();
    /** @private **/
    this.zoneName = name;
    /** @private **/
    this.valid = IANAZone.isValidZone(name);
  }

  /** @override **/
  get type(): string {
    return "iana";
  }

  /** @override **/
  get name(): string {
    return this.zoneName;
  }

  /** @override **/
  get isUniversal(): boolean {
    return false;
  }

  /** @override **/
  offsetName(ts: number, { format, locale }: ZoneOffsetOptions): string | null {
    return parseZoneInfo(ts, format, locale, this.name);
  }

  /** @override **/
  formatOffset(ts: number, format: ZoneOffsetFormat): string {
    return formatOffset(this.offset(ts), format);
  }

  /** @override **/
  offset(ts: number): number {
    const date = new Date(ts);
    const dtf = makeDTF(this.name),
      [year, month, day, hour, minute, second] = isUndefined(dtf.formatToParts)
        ? hackyOffset(dtf, date)
        : partsOffset(dtf, date);

    const asUTC = objToLocalTS({
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond: 0,
    });

    let asTS = +date;
    const over = asTS % 1000;
    asTS -= over >= 0 ? over : 1000 + over;
    return (asUTC - asTS) / (60 * 1000);
  }

  /** @override **/
  equals(otherZone: Zone): boolean {
    return otherZone.type === "iana" && otherZone.name === this.name;
  }

  /** @override **/
  get isValid(): boolean {
    return this.valid;
  }
}
