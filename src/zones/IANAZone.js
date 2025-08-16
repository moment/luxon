import { formatOffset, parseZoneInfo, isUndefined, objToLocalTS } from "../impl/util.js";
import Zone from "../zone.js";

const directOffsetDTFCache = new Map();
function makeDirectOffsetDTF(zoneName) {
  let dtf = directOffsetDTFCache.get(zoneName);
  if (dtf === undefined) {
    dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: zoneName,
      timeZoneName: "longOffset",
      year: "numeric",
    });
    directOffsetDTFCache.set(zoneName, dtf);
  }
  return dtf;
}

const calculatedOffsetDTFCache = new Map();
function makeCalculatedOffsetDTF(zoneName) {
  let dtf = calculatedOffsetDTFCache.get(zoneName);
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
    calculatedOffsetDTFCache.set(zoneName, dtf);
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

function hackyOffset(dtf, date) {
  const formatted = dtf.format(date).replace(/\u200E/g, ""),
    parsed = /(\d+)\/(\d+)\/(\d+) (AD|BC),? (\d+):(\d+):(\d+)/.exec(formatted),
    [, fMonth, fDay, fYear, fadOrBc, fHour, fMinute, fSecond] = parsed;
  return [fYear, fMonth, fDay, fadOrBc, fHour, fMinute, fSecond];
}

function partsOffset(dtf, date) {
  const formatted = dtf.formatToParts(date);
  const filled = [];
  for (let i = 0; i < formatted.length; i++) {
    const { type, value } = formatted[i];
    const pos = typeToPos[type];

    if (type === "era") {
      filled[pos] = value;
    } else if (!isUndefined(pos)) {
      filled[pos] = parseInt(value, 10);
    }
  }
  return filled;
}

function calculatedOffset(zone, ts) {
  const date = new Date(ts);

  if (isNaN(date)) return NaN;

  const dtf = makeCalculatedOffsetDTF(zone);
  let [year, month, day, adOrBc, hour, minute, second] = dtf.formatToParts
    ? partsOffset(dtf, date)
    : hackyOffset(dtf, date);

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

function directOffset(zone, ts) {
  const dtf = makeDirectOffsetDTF(zone);

  let formatted;

  try {
    formatted = dtf.format(ts);
  } catch (e) {
    return NaN;
  }

  const idx = formatted.search(/GMT([+-][0-9][0-9]:[0-9][0-9](:[0-9][0-9])?)?/);
  const sign = formatted.charCodeAt(idx + 3);

  if (isNaN(sign)) return 0;

  return (
    (44 - sign) *
    (Number(formatted.slice(idx + 4, idx + 6)) * 60 +
      Number(formatted.slice(idx + 7, idx + 9)) +
      Number(formatted.slice(idx + 10, idx + 12)) / 60)
  );
}

const ianaZoneCache = new Map();
let offsetFunc;
/**
 * A zone identified by an IANA identifier, like America/New_York
 * @implements {Zone}
 */
export default class IANAZone extends Zone {
  /**
   * @param {string} name - Zone name
   * @return {IANAZone}
   */
  static create(name) {
    let zone = ianaZoneCache.get(name);
    if (zone === undefined) {
      ianaZoneCache.set(name, (zone = new IANAZone(name)));
    }
    return zone;
  }

  /**
   * Reset local caches. Should only be necessary in testing scenarios.
   * @return {void}
   */
  static resetCache() {
    ianaZoneCache.clear();
    calculatedOffsetDTFCache.clear();
    directOffsetDTFCache.clear();
  }

  /**
   * Returns whether the provided string is a valid specifier. This only checks the string's format, not that the specifier identifies a known zone; see isValidZone for that.
   * @param {string} s - The string to check validity on
   * @example IANAZone.isValidSpecifier("America/New_York") //=> true
   * @example IANAZone.isValidSpecifier("Sport~~blorp") //=> false
   * @deprecated For backward compatibility, this forwards to isValidZone, better use `isValidZone()` directly instead.
   * @return {boolean}
   */
  static isValidSpecifier(s) {
    return this.isValidZone(s);
  }

  /**
   * Returns whether the provided string identifies a real zone
   * @param {string} zone - The string to check
   * @example IANAZone.isValidZone("America/New_York") //=> true
   * @example IANAZone.isValidZone("Fantasia/Castle") //=> false
   * @example IANAZone.isValidZone("Sport~~blorp") //=> false
   * @return {boolean}
   */
  static isValidZone(zone) {
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
  static normalizeZone(zone) {
    if (!zone) {
      return null;
    }
    try {
      return new Intl.DateTimeFormat("en-US", { timeZone: zone }).resolvedOptions().timeZone;
    } catch (e) {
      return null;
    }
  }

  constructor(name) {
    super();
    const normalizedName = IANAZone.normalizeZone(name);
    /** @private **/
    this.valid = normalizedName != null;
    // For backwards compatibility we only normalize in casing, otherwise would also normalize something like
    // EST5EDT to America/New_York.
    /** @private **/
    this.zoneName =
      normalizedName && normalizedName.toLowerCase() === name.toLowerCase() ? normalizedName : name;
  }

  /**
   * The type of zone. `iana` for all instances of `IANAZone`.
   * @override
   * @type {string}
   */
  get type() {
    return "iana";
  }

  /**
   * The name of this zone (i.e. the IANA zone name).
   * @override
   * @type {string}
   */
  get name() {
    return this.zoneName;
  }

  /**
   * Returns whether the offset is known to be fixed for the whole year:
   * Always returns false for all IANA zones.
   * @override
   * @type {boolean}
   */
  get isUniversal() {
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
  offsetName(ts, { format, locale }) {
    return parseZoneInfo(ts, format, locale, this.name);
  }

  /**
   * Returns the offset's value as a string
   * @override
   * @param {number} ts - Epoch milliseconds for which to get the offset
   * @param {string} format - What style of offset to return.
   *                          Accepts 'narrow', 'short', or 'techie'. Returning '+6', '+06:00', or '+0600' respectively
   * @return {string}
   */
  formatOffset(ts, format) {
    return formatOffset(this.offset(ts), format);
  }

  /**
   * Return the offset in minutes for this zone at the specified timestamp.
   * @override
   * @param {number} ts - Epoch milliseconds for which to compute the offset
   * @return {number}
   */
  offset(ts) {
    if (!this.valid) return NaN;

    if (offsetFunc === undefined) {
      try {
        const ts = Date.now();
        // directOffset will raise an error if not supported by the engine
        // also check it works correctly as it relies on a specific format
        if (
          directOffset("Etc/GMT", ts) !== 0 ||
          directOffset("Etc/GMT+1", ts) !== -60 ||
          directOffset("Etc/GMT-1", ts) !== +60
        )
          throw new Error("Invalid offset");
        offsetFunc = directOffset;
      } catch (e) {
        offsetFunc = calculatedOffset;
      }
    }

    return offsetFunc(this.name, ts);
  }

  /**
   * Return whether this Zone is equal to another zone
   * @override
   * @param {Zone} otherZone - the zone to compare
   * @return {boolean}
   */
  equals(otherZone) {
    return otherZone.type === "iana" && otherZone.name === this.name;
  }

  /**
   * Return whether this Zone is valid.
   * @override
   * @type {boolean}
   */
  get isValid() {
    return this.valid;
  }
}
