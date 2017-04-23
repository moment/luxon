import { Duration } from './duration';
import { Interval } from './interval';
import { Settings } from './settings';
import { Formatter } from './impl/formatter';
import { FixedOffsetZone } from './zones/fixedOffsetZone';
import { LocalZone } from './zones/localZone';
import { Locale } from './impl/locale';
import { Util } from './impl/util';
import { RegexParser } from './impl/regexParser';
import { TokenParser } from './impl/tokenParser';
import { Conversions } from './impl/conversions';

const INVALID = 'Invalid Date';

function possiblyCachedWeekData(dt) {
  if (dt.weekData === null) {
    dt.weekData = Conversions.gregorianToWeek(dt.c);
  }
  return dt.weekData;
}

function clone(inst, alts = {}) {
  const current = {
    ts: inst.ts,
    zone: inst.zone,
    c: inst.c,
    o: inst.o,
    loc: inst.loc,
    valid: inst.valid
  };
  return new DateTime(Object.assign({}, current, alts, { old: current }));
}

function validateObject(obj) {
  const validYear = Util.isNumber(obj.year),
    validMonth = Util.numberBetween(obj.month, 1, 12),
    validDay = Util.numberBetween(obj.day, 1, Util.daysInMonth(obj.year, obj.month)),
    validHour = Util.numberBetween(obj.hour, 0, 23),
    validMinute = Util.numberBetween(obj.minute, 0, 59),
    validSecond = Util.numberBetween(obj.second, 0, 59),
    validMillisecond = Util.numberBetween(obj.millisecond, 0, 999);

  return validYear &&
    validMonth &&
    validDay &&
    validHour &&
    validMinute &&
    validSecond &&
    validMillisecond;
}

// Seems like this might be more complicated than it appears. E.g.:
// https://github.com/v8/v8/blob/master/src/date.cc#L212
function fixOffset(ts, tz, o, leaveTime = false) {
  // 1. test whether the zone matches the offset for this ts
  const o2 = tz.offset(ts);
  if (o === o2) {
    return [ts, o];
  }

  // 2. if not, change the ts by the difference in the offset
  if (!leaveTime) {
    ts -= (o2 - o) * 60 * 1000;
  }

  // 3. check it again
  const o3 = tz.offset(ts);

  // 4. if it's the same, good to go
  if (o2 === o3) {
    return [ts, o2];
  }

  // 5. if it's different, steal underpants
  // 6. ???
  // 7. profit!
  return [ts, o];
}

function tsToObj(ts, offset) {
  ts += offset * 60 * 1000;

  const d = new Date(ts);

  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    second: d.getUTCSeconds(),
    millisecond: d.getUTCMilliseconds()
  };
}

function objToTS(obj, zone, offset) {
  let d = Date.UTC(
    obj.year,
    obj.month - 1,
    obj.day,
    obj.hour,
    obj.minute,
    obj.second,
    obj.millisecond
  );

  // javascript is stupid and i hate it
  if (obj.year < 100 && obj.year >= 0) {
    const t = new Date(d);
    t.setFullYear(obj.year);
    d = t.valueOf();
  }

  const tsProvis = +d - offset * 60 * 1000;
  return fixOffset(tsProvis, zone, offset);
}

function adjustTime(inst, dur) {
  const oPre = inst.o,
    // todo: only do this part if there are higher-order items in the dur
    c = Object.assign({}, inst.c, {
      year: inst.c.year + dur.years(),
      month: inst.c.month + dur.months(),
      day: inst.c.day + dur.days()
    }),
    millisToAdd = Duration.fromObject({
      hours: dur.hours(),
      minutes: dur.minutes(),
      seconds: dur.seconds(),
      milliseconds: dur.milliseconds()
    }).as('milliseconds');

  let [ts, o] = objToTS(c, inst.zone, oPre);

  if (millisToAdd !== 0) {
    ts += millisToAdd;
    [ts, o] = fixOffset(ts, inst.zone, o, true);
  }

  return { ts, o };
}

function formatMaybe(dt, format) {
  return dt.valid
    ? Formatter.create(Locale.create('en')).formatDateTimeFromString(dt, format)
    : INVALID;
}

function adjustZoneOfParsedDate(vals, context, setZone, zone) {
  if (vals) {
    const { local, offset } = context,
      interpretationZone = local ? zone : new FixedOffsetZone(offset),
      inst = DateTime.fromObject(vals, interpretationZone);
    return setZone ? inst : inst.timezone(zone);
  } else {
    return DateTime.invalid();
  }
}

const defaultUnitValues = { month: 1, day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 },
  defaultWeekUnitValues = {
    weekNumber: 1,
    weekday: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  },
  defaultOrdinalUnitValues = {
    ordinal: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  };

/**
 * A specific millisecond with an associated time zone and locale
 */
export class DateTime {
  /**
   * @access private
   */
  constructor(config = {}) {
    Object.defineProperty(this, 'ts', { value: config.ts || Settings.now(), enumerable: true });

    Object.defineProperty(this, 'zone', {
      value: config.zone || Settings.defaultZone,
      enumerable: true
    });

    Object.defineProperty(this, 'loc', { value: config.loc || Locale.create(), enumerable: true });

    Object.defineProperty(this, 'valid', {
      value: Util.isUndefined(config.valid) ? true : config.valid,
      enumerable: false
    });

    Object.defineProperty(this, 'weekData', {
      writable: true, // !!!
      value: null,
      enumerable: false
    });

    const unchanged = config.old && config.old.ts === this.ts && config.old.zone.equals(this.zone),
      c = unchanged ? config.old.c : tsToObj(this.ts, this.zone.offset(this.ts)),
      o = unchanged ? config.old.o : this.zone.offset(this.ts);

    Object.defineProperty(this, 'c', { value: c });
    Object.defineProperty(this, 'o', { value: o });
  }

  /**
   * Create a local time
   * @param {number} year - The calendar year. If omitted (as in, call `local()` with no arguments), the current time will be used
   * @param {number} [month=1] - The month, 1-indexed
   * @param {number} [day=1] - The day of the month
   * @param {number} [hour=0] - The hour of the day, in 24-hour time
   * @param {number} [minute=0] - The minute of the hour, i.e. a number between 0 and 59
   * @param {number} [second=0] - The second of the minute, i.e. a number between 0 and 59
   * @param {number} [millisecond=0] - The millisecond of the second, i.e. a number between 0 and 999
   * @example DateTime.local()                            //~> now
   * @example DateTime.local(2017)                        //~> 2017-01-01T00:00:00
   * @example DateTime.local(2017, 3)                     //~> 2017-03-01T00:00:00
   * @example DateTime.local(2017, 3, 12)                 //~> 2017-03-12T00:00:00
   * @example DateTime.local(2017, 3, 12, 5)              //~> 2017-03-12T05:00:00
   * @example DateTime.local(2017, 3, 12, 5, 45)          //~> 2017-03-12T05:45:00
   * @example DateTime.local(2017, 3, 12, 5, 45, 10)      //~> 2017-03-12T05:45:10
   * @example DateTime.local(2017, 3, 12, 5, 45, 10, 765) //~> 2017-03-12T05:45:10.675
   * @return {DateTime}
   */
  static local(year, month, day, hour, minute, second, millisecond) {
    if (Util.isUndefined(year)) {
      return new DateTime({ ts: Settings.now() });
    } else {
      return DateTime.fromObject(
        { year, month, day, hour, minute, second, millisecond },
        Settings.defaultZone
      );
    }
  }

  /**
   * Create a UTC time
   * @param {number} year - The calendar year. If omitted (as in, call `utc()` with no arguments), the current time will be used
   * @param {number} [month=1] - The month, 1-indexed
   * @param {number} [day=1] - The day of the month
   * @param {number} [hour=0] - The hour of the day, in 24-hour time
   * @param {number} [minute=0] - The minute of the hour, i.e. a number between 0 and 59
   * @param {number} [second=0] - The second of the minute, i.e. a number between 0 and 59
   * @param {number} [millisecond=0] - The millisecond of the second, i.e. a number between 0 and 999
   * @example DateTime.utc()                            //~> now
   * @example DateTime.utc(2017)                        //~> 2017-01-01T00:00:00Z
   * @example DateTime.utc(2017, 3)                     //~> 2017-03-01T00:00:00Z
   * @example DateTime.utc(2017, 3, 12)                 //~> 2017-03-12T00:00:00Z
   * @example DateTime.utc(2017, 3, 12, 5)              //~> 2017-03-12T05:00:00Z
   * @example DateTime.utc(2017, 3, 12, 5, 45)          //~> 2017-03-12T05:45:00Z
   * @example DateTime.utc(2017, 3, 12, 5, 45, 10)      //~> 2017-03-12T05:45:10Z
   * @example DateTime.utc(2017, 3, 12, 5, 45, 10, 765) //~> 2017-03-12T05:45:10.675Z
   * @return {DateTime}
   */
  static utc(year, month, day, hour, minute, second, millisecond) {
    if (Util.isUndefined(year)) {
      return new DateTime({ ts: Settings.now(), zone: FixedOffsetZone.utcInstance });
    } else {
      return DateTime.fromObject(
        { year, month, day, hour, minute, second, millisecond },
        FixedOffsetZone.utcInstance
      );
    }
  }

  /**
   * Create an invalid DateTime.
   * @return {DateTime}
   */
  static invalid() {
    return new DateTime({ valid: false });
  }

  /**
   * Create an DateTime from a Javascript Date object. Uses the default zone.
   * @param {Date} date - a Javascript Date object
   * @return {DateTime}
   */
  static fromJSDate(date) {
    return new DateTime({ ts: date.valueOf() });
  }

  /**
   * Create an DateTime from a count of epoch milliseconds. Uses the default zone.
   * @param {number} milliseconds - a number of milliseconds since 1970 UTC
   * @return {DateTime}
   */
  static fromMillis(milliseconds) {
    return new DateTime({ ts: milliseconds });
  }

  /**
   * Create an DateTime from a Javascript object with keys like 'year' and 'hour' with reasonable defaults.
   * @param {Object} obj - the object to create the DateTime from
   * @param {number} obj.year - a year, such as 1987
   * @param {number} obj.month - a month, 1-12
   * @param {number} obj.day - a day of the month, 1-31, depending on the month
   * @param {number} obj.ordinal - day of the year, 1-365 or 366
   * @param {number} obj.weekYear - an ISO week year
   * @param {number} obj.weekNumber - an ISO week number, between 1 and 52 or 53, depending on the year
   * @param {number} obj.weekday - an ISO weekday, 1-7, where 1 is Monday and 7 is Sunday
   * @param {number} obj.hour - hour of the day, 0-23
   * @param {number} obj.minute - minute of the hour, 0-59
   * @param {number} obj.second - second of the minute, 0-59
   * @param {number} obj.millisecond - millisecond of the second, 0-999
   * @param {string|Zone} [zone='local'] - interpret the numbers in the context of a particular zone. Can take any value taken as the first argument to timezone()
   * @example DateTime.fromObject({year: 1982, month: 5, day: 25}).toISODate() //=> '1982-05-25'
   * @example DateTime.fromObject({year: 1982}).toISODate() //=> '1982-01-01T00'
   * @example DateTime.fromObject({hour: 10, minute: 26, second: 6}) //~> today at 10:26:06
   * @example DateTime.fromObject({hour: 10, minute: 26, second: 6}, 'utc')
   * @example DateTime.fromObject({hour: 10, minute: 26, second: 6}, 'local')
   * @example DateTime.fromObject({hour: 10, minute: 26, second: 6}, 'America/New_York')
   * @example DateTime.fromObject({ weekYear: 2016, weekNumber: 2, weekday: 3 }).toISODate() //=> '2016-01-13'
   * @return {DateTime}
   */
  static fromObject(obj, zone) {
    const tsNow = Settings.now(),
      zoneToUse = Util.normalizeZone(zone),
      offsetProvis = zoneToUse.offset(tsNow),
      normalized = Util.normalizeObject(obj),
      containsOrdinal = !Util.isUndefined(normalized.ordinal),
      containsGregorYear = !Util.isUndefined(normalized.year),
      containsGregorMD = !Util.isUndefined(normalized.month) || !Util.isUndefined(normalized.day),
      containsGregor = containsGregorYear || containsGregorMD,
      definiteWeekDef = normalized.weekYear || normalized.weekNumber;

    // cases:
    // just a weekday -> this week's instance of that weekday, no worries
    // (gregorian data or ordinal) + (weekYear or weekNumber) -> error
    // (gregorian month or day) + ordinal -> error
    // otherwise just use weeks or ordinals or gregorian, depending on what's specified

    if ((containsGregor || containsOrdinal) && definiteWeekDef) {
      throw new Error("Can't mix weekYear/weekNumber units with year/month/day or ordinals");
    }

    if (containsGregorMD && containsOrdinal) {
      throw new Error("Can't mix ordinal dates with month/day");
    }

    const useWeekData = definiteWeekDef || (normalized.weekday && !containsGregor);

    // configure ourselves to deal with gregorian dates or week stuff
    let units, defaultValues, objNow = tsToObj(tsNow, offsetProvis);
    if (useWeekData) {
      units = Util.orderedWeekUnits;
      defaultValues = defaultWeekUnitValues;
      objNow = Conversions.gregorianToWeek(objNow);
    } else if (containsOrdinal) {
      units = Util.orderedOrdinalUnits;
      defaultValues = defaultOrdinalUnitValues;
      objNow = Conversions.gregorianToOrdinal(objNow);
    } else {
      units = Util.orderedUnits;
      defaultValues = defaultUnitValues;
    }

    // set default values for missing stuff
    let foundFirst = false;
    for (const u of units) {
      const v = normalized[u];
      if (!Util.isUndefined(v)) {
        foundFirst = true;
      } else if (foundFirst) {
        normalized[u] = defaultValues[u];
      } else {
        normalized[u] = objNow[u];
      }
    }

    // make sure the values we have are in range
    const valid = useWeekData
      ? Conversions.validateWeekData(normalized)
      : containsOrdinal ? Conversions.validateOrdinalData(normalized) : validateObject(normalized);

    if (!valid) {
      return DateTime.invalid();
    }

    // compute the actual time
    const gregorian = useWeekData
      ? Conversions.weekToGregorian(normalized)
      : containsOrdinal ? Conversions.ordinalToGregorian(normalized) : normalized,
      [tsFinal] = objToTS(gregorian, zoneToUse, offsetProvis),
      inst = new DateTime({ ts: tsFinal, zone: zoneToUse });

    // gregorian data + weekday serves only to validate
    if (normalized.weekday && containsGregor && obj.weekday !== inst.weekday()) {
      return DateTime.invalid();
    }

    return inst;
  }

  /**
   * Create a DateTime from an ISO 8601 string
   * @param {string} text - the ISO string
   * @param {Object} options - options to affect the creation
   * @param {boolean} [options.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the time to this zone
   * @param {boolean} [options.setZone=false] - override the zone with a fixed-offset zone specified in the string itself, if it specifies one
   * @example DateTime.fromISO('2016-05-25T09:08:34.123')
   * @example DateTime.fromISO('2016-05-25T09:08:34.123+06:00')
   * @example DateTime.fromISO('2016-05-25T09:08:34.123+06:00', {setZone: true})
   * @example DateTime.fromISO('2016-05-25T09:08:34.123', {zone: 'utc')
   * @example DateTime.fromISO('2016-W05-4')
   * @return {DateTime}
   */
  static fromISO(text, { setZone = false, zone = Settings.defaultZone } = {}) {
    const [vals, context] = RegexParser.parseISODate(text);
    return adjustZoneOfParsedDate(vals, context, setZone, zone);
  }

  /**
   * Create a DateTime from an RFC 2822 string
   * @param {string} text - the RFC 2822 string
   * @param {Object} options - options to affect the creation
   * @param {boolean} [options.zone='local'] - convert the time to this zone. Since the offset is always specified in the string itself, this has no effect on the interpretation of string, merely the zone the resulting DateTime is expressed in.
   * @param {boolean} [options.setZone=false] - override the zone with a fixed-offset zone specified in the string itself, if it specifies one
   * @example DateTime.fromRFC2822('25 Nov 2016 13:23:12 GMT')
   * @example DateTime.fromRFC2822('Tue, 25 Nov 2016 13:23:12 +0600')
   * @example DateTime.fromRFC2822('25 Nov 2016 13:23 Z')
   * @return {DateTime}
   */
  static fromRFC2822(text, { setZone = false, zone = Settings.defaultZone } = {}) {
    const [vals, context] = RegexParser.parseRFC2822Date(text);
    return adjustZoneOfParsedDate(vals, context, setZone, zone);
  }

  /**
   * Create a DateTime from an HTTP header date
   * @see https://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1
   * @param {string} text - the HTTP header date
   * @param {object} options - options to affect the creation
   * @param {boolean} [options.zone='local'] - convert the time to this zone. Since HTTP dates are always in UTC, this has no effect on the interpretation of string, merely the zone the resulting DateTime is expressed in.
   * @param {boolean} [options.setZone=false] - override the zone with the fixed-offset zone specified in the string. For HTTP dates, this is always UTC, so this option is equivalent to setting the `zone` option to 'utc', but this option is included for consistency with similar methods.
   * @example DateTime.fromHTTP('Sun, 06 Nov 1994 08:49:37 GMT')
   * @example DateTime.fromHTTP('Sunday, 06-Nov-94 08:49:37 GMT')
   * @example DateTime.fromHTTP('Sun Nov  6 08:49:37 1994')
   * @return {DateTime}
   */
  static fromHTTP(text, { setZone = false, zone = Settings.defaultZone } = {}) {
    const [vals, context] = RegexParser.parseHTTPDate(text);
    return adjustZoneOfParsedDate(vals, context, setZone, zone);
  }

  /**
   * Create a DateTime from an input string and format string
   * @param {string} text - the string to parse
   * @param {string} fmt - the format the string is expected to be in (see description)
   * @param {Object} options - options to affect the creation
   * @param {boolean} [options.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the DateTime to this zone
   * @param {string} [options.localeCode='en-US'] - a locale string to use when parsing. Will also convert the DateTime to this locale
   * @return {DateTime}
   */
  static fromString(
    text,
    fmt,
    { zone = Settings.defaultZone, localeCode = null, nums = null, cal = null } = {}
  ) {
    const parser = new TokenParser(Locale.fromOpts({ localeCode, nums, cal })),
      result = parser.parseDateTime(text, fmt);
    if (Object.keys(result).length === 0) {
      return DateTime.invalid();
    } else {
      return DateTime.fromObject(result, zone);
    }
  }

  /**
   * Explain how a string would be parsed by fromString()
   * @param {string} text - the string to parse
   * @param {string} fmt - the format the string is expected to be in (see description)
   * @param {object} options - options taken by fromString()
   * @return {object}
   */
  static fromStringExplain(text, fmt, options = {}) {
    const parser = new TokenParser(Locale.fromOpts(options));
    return parser.explainParse(text, fmt);
  }

  /**
   * Returns whether the DateTime is invalid. Invalid dates occur when:
   * * The DateTime was created from invalid calendar information, such as the 13th month or February 30
   * * The DateTime was created by an operation on another invalid date
   * @return {boolean}
   */
  isValid() {
    return this.valid;
  }

  /**
   * Get or "set" the locale of a DateTime, such en-UK. The locale is used when formatting the DateTime
   *
   * @param {string} localeCode - the locale to set. If omitted, the method operates as a getter. If the locale is not supported, the best alternative is selected
   * @return {string|DateTime} - If a localeCode is provided, returns a new DateTime with the new locale. If not, returns the localeCode (a string) of the DateTime
   */
  locale(localeCode) {
    if (Util.isUndefined(localeCode)) {
      // todo: this should return the effective locale using resolvedOptions
      return this.loc ? this.loc.localeCode : null;
    } else {
      return clone(this, { loc: Locale.create(localeCode) });
    }
  }

  /**
   * "Sets" the DateTime's zone to UTC. Returns a newly-constructed DateTime.
   *
   * Equivalent to timezone('utc')
   * @param {number} [offset=0] - optionally, an offset from UTC in minutes
   * @return {DateTime}
   */
  toUTC(offset = 0) {
    return this.timezone(FixedOffsetZone.instance(offset));
  }

  /**
   * "Sets" the DateTime's zone to the environment's local zone. Returns a newly-constructed DateTime.
   *
   * Equivalent to `timezone('local')`
   * @return {DateTime}
   */
  toLocal() {
    return this.timezone(new LocalZone());
  }

  /**
   * "Sets" the DateTime's zone to specified zone. Returns a newly-constructed DateTime.
   *
   * By default, the setter keeps the underlying time the same (as in, the same UTC timestamp), but the new instance will behave differently in these ways:
   * * getters such as {@link hour} or {@link minute} will report local times in the target zone
   * * {@link plus} and {@link minus} will use the target zone's DST rules (or their absence) when adding days or larger to the DateTime
   * * strings will be formatted according to the target zone's offset
   * You may wish to use {@link toLocal} and {@link toUTC} which provide simple convenience wrappers for commonly used zones.
   *
   * @return {DateTime}
   */
  timezone(zone, { keepCalendarTime = false } = {}) {
    zone = Util.normalizeZone(zone);
    if (zone.equals(this.zone)) {
      return this;
    } else {
      const newTS = keepCalendarTime
        ? this.ts + (this.o - zone.offset(this.ts)) * 60 * 1000
        : this.ts;
      return clone(this, { ts: newTS, zone });
    }
  }

  /**
   * Gets the name of the timezone
   * @return {String}
   */
  timezoneName() {
    return this.zone.name;
  }

  /**
   * Gets the short human name for the zone's current offset, for example "EST" or "EDT"
   * @return {String}
   */
  offsetNameShort() {
    return this.zone.offsetName(this.ts, { format: 'short', localeCode: this.locale.localeCode });
  }

  /**
   * Gets the long human name for the zone's current offset, for example "Eastern Standard Time" or "Eastern Daylight Time". Is locale-aware.
   * @return {String}
   */
  offsetNameLong() {
    return this.zone.offsetName(this.ts, { format: 'long', localeCode: this.locale.localeCode });
  }

  /**
   * Gets whether this zone's offset ever changes, as in a DST
   * @return {boolean}
   */
  isOffsetFixed() {
    return this.zone.universal;
  }

  /**
   * Gets whether the DateTime is in a DST
   * @return {boolean}
   */
  isInDST() {
    if (this.isOffsetFixed()) {
      return false;
    } else {
      return this.offset() > this.month(0).offset() || this.offset() > this.month(5).offset();
    }
  }

  /**
   * Gets the value of unit
   * @param {string} unit - a unit such as 'minute' or 'day'
   * @example DateTime.local(2017, 7, 4).get('month'); //=> 7
   * @example DateTime.local(2017, 7, 4).get('day'); //=> 4
   * @return {number}
   */
  get(unit) {
    return this.valid ? this[unit]() : NaN;
  }

  /**
   * "Sets" the values of specified units. Returns a newly-constructed DateTime.
   * @param {object} values - a mapping of units to numbers
   * @example dt.set({ year: 2017 })
   * @example dt.set({ hour: 8, minute: 30 })
   * @example dt.set({ weekday: 5 })
   * @example dt.set({ year: 2005, ordinal: 234 })
   * @return {DateTime}
   */
  set(values) {
    const normalized = Util.normalizeObject(values),
      settingWeekStuff = !Util.isUndefined(normalized.weekYear) ||
        !Util.isUndefined(normalized.weekNumber) ||
        !Util.isUndefined(normalized.weekday);

    let mixed;
    if (settingWeekStuff) {
      mixed = Conversions.weekToGregorian(
        Object.assign(Conversions.gregorianToWeek(this.c), normalized)
      );
    } else if (!Util.isUndefined(normalized.ordinal)) {
      mixed = Conversions.ordinalToGregorian(
        Object.assign(Conversions.gregorianToOrdinal(this.c), normalized)
      );
    } else {
      mixed = Object.assign(this.toObject(), normalized);
    }

    const [ts, o] = objToTS(mixed, this.zone, this.o);
    return clone(this, { ts, o });
  }

  /**
   * Gets or "sets" the year.
   * @param {number} year - the year to set. If omitted, `year()` acts as a getter for the year.
   * @example DateTime.local(2017, 5, 25).year() //=> 2017
   * @example DateTime.local(2017, 5, 25).year(1982).toISODate() //=> "1982-05-25"
   * @return {number|DateTime}
   */
  year(year) {
    return Util.isUndefined(year) ? this.valid ? this.c.year : NaN : this.set({ year });
  }

  /**
   * Gets or "sets" the month (1-12).
   * @param {number} month - the month to set. If omitted, `month()` acts as a getter for the month.
   * @example DateTime.local(2017, 5, 25).month() //=> 5
   * @example DateTime.local(2017, 5, 25).month(6).toISODate() //=> "2017-06-25"
   * @return {number|DateTime}
   */
  month(month) {
    return Util.isUndefined(month) ? this.valid ? this.c.month : NaN : this.set({ month });
  }

  /**
   * Gets or "sets" the day of the month (1-30ish).
   * @param {number} day - the day to set. If omitted, `day()` acts as a getter for the day.
   * @example DateTime.local(2017, 5, 25).day() //=> 25
   * @example DateTime.local(2017, 5, 25).day(26).toISODate() //=> "2017-05-26"
   * @return {number|DateTime}
   */
  day(day) {
    return Util.isUndefined(day) ? this.valid ? this.c.day : NaN : this.set({ day });
  }

  /**
   * Gets or "sets" the hour of the day (0-23).
   * @param {number} hour - the hour to set. If omitted, `hour()` acts as a getter for the hour.
   * @example DateTime.local(2017, 5, 25, 9).hour() //=> 9
   * @example DateTime.local(2017, 5, 25, 9).hour(13).toISOTime() //=> 13:00:00.000"
   * @return {number|DateTime}
   */
  hour(hour) {
    return Util.isUndefined(hour) ? this.valid ? this.c.hour : NaN : this.set({ hour });
  }

  /**
   * Gets or "sets" the minute of the hour (0-59).
   * @param {number} minute - the minute to set. If omitted, `minute()` acts as a getter for the minute.
   * @example DateTime.local(2017, 5, 25, 9, 30).minute() //=> 30
   * @example DateTime.local(2017, 5, 25, 9, 15).minute(45).toISOTime() //=> "09:45:00.000"
   * @return {number|DateTime}
   */
  minute(minute) {
    return Util.isUndefined(minute) ? this.valid ? this.c.minute : NaN : this.set({ minute });
  }

  /**
   * Gets or "sets" the second of the minute (0-59).
   * @param {number} second - the second to set. If omitted, `second()` acts as a getter for the second.
   * @example DateTime.local(2017, 5, 25, 9, 30, 52).second() //=> 52
   * @example DateTime.local(2017, 5, 25, 9, 30, 52).second(45).toISOTime() //=> "09:30:45.000"
   * @return {number|DateTime}
   */
  second(second) {
    return Util.isUndefined(second) ? this.valid ? this.c.second : NaN : this.set({ second });
  }

  /**
   * Gets or "sets" the millisecond of the second (0-999).
   * @param {number} millisecond - the millisecond to set. If omitted, `millisecond()` acts as a getter for the millisecond.
   * @example DateTime.local(2017, 5, 25, 9, 30, 52, 654).millisecond() //=> 654
   * @example DateTime.local(2017, 5, 25, 9, 30, 52, 654).millisecond(236).toISOTime() //=> "09:30:52.226"
   * @return {number|DateTime}
   */
  millisecond(millisecond) {
    return Util.isUndefined(millisecond)
      ? this.valid ? this.c.millisecond : NaN
      : this.set({ millisecond });
  }

  /**
   * Gets or "sets" the week year.
   * The setter maintains the current week number and day of the week.
   * @see https://en.wikipedia.org/wiki/ISO_week_date
   * @param {number} weekYear - the week year to set. If omitted, `weekYear()` acts as a getter for the week year.
   * @example DateTime.local(2014, 11, 31).weekYear() //=> 2015
   * @example DateTime.local(2017, 5, 25).weekYear(2016).toISODate() //=> "2015-05-21"
   * @return {number|DateTime}
   */
  weekYear(weekYear) {
    return Util.isUndefined(weekYear)
      ? this.valid ? possiblyCachedWeekData(this).weekYear : NaN
      : this.set({ weekYear });
  }

  /**
   * Gets or "sets" the week number of the week year (1-52ish).
   * The setter maintains the current day of the week.
   * @see https://en.wikipedia.org/wiki/ISO_week_date
   * @param {number} weekNumber - the week number to set. If omitted, `weekNumber()` acts as a getter for the week number.
   * @example DateTime.local(2017, 5, 25).weekNumber() //=> 21
   * @example DateTime.local(2017, 5, 25).weekNumber(15).toISODate() //=> "2017-04-13"
   * @return {number|DateTime}
   */
  weekNumber(weekNumber) {
    return Util.isUndefined(weekNumber)
      ? this.valid ? possiblyCachedWeekData(this).weekNumber : NaN
      : this.set({ weekNumber });
  }

  /**
   * Gets or "sets" the day of the week.
   * 1 is Monday and 7 is Sunday
   * @see https://en.wikipedia.org/wiki/ISO_week_date
   * @param {number} weekday - the weekday to set. If omitted, `weekday()` acts as a getter for the weekday.
   * @example DateTime.local(2014, 11, 31).weekday() //=> 4
   * @example DateTime.local(2017, 5, 25).weekday(1).toISODate() //=> "2015-05-22"
   * @return {number|DateTime}
   */
  weekday(weekday) {
    return Util.isUndefined(weekday)
      ? this.valid ? possiblyCachedWeekData(this).weekday : NaN
      : this.set({ weekday });
  }

  /**
   * Gets or "sets" the ordinal (i.e. the day of the year)
   * @param {number} ordinal - the ordinal to set. If omitted, `ordinal()` acts as a getter for the ordinal number.
   * @example DateTime.local(2017, 5, 25).ordinal(200).toISODate() //=> "2017-07-19"
   * @example DateTime.local(2017, 5, 25).ordinal() //=> 145
   * @return {number|DateTime}
   */
  ordinal(ordinal) {
    return Util.isUndefined(ordinal)
      ? this.valid ? Conversions.gregorianToOrdinal(this.c).ordinal : NaN
      : this.set({ ordinal });
  }

  /**
   * Gets the UTC offset of this DateTime in minutes
   * @example DateTime.local().offset() //=> -240
   * @example DateTime.utc().offset() //=> 0
   * @return {number}
   */
  offset() {
    return this.valid ? this.zone.offset(this.ts) : NaN;
  }

  /**
   * Returns true if this DateTime is in a leap year, false otherwise
   * @example DateTime.local(2016).isInLeapYear() //=> true
   * @example DateTime.local(2013).isInLeapYear() //=> false
   * @return {boolean}
   */
  isInLeapYear() {
    return Util.isLeapYear(this.year());
  }

  /**
   * Returns the number of days in this DateTime's month
   * @example DateTime.local(2016, 2).days() //=> 29
   * @example DateTime.local(2016, 3).days() //=> 31
   * @return {number}
   */
  daysInMonth() {
    return Util.daysInMonth(this.year(), this.month());
  }

  /**
   * Returns the number of days in this DateTime's year
   * @example DateTime.local(2016).daysInYear() //=> 366
   * @example DateTime.local(2013).daysInYear() //=> 365
   * @return {number}
   */
  daysInYear() {
    return this.valid ? Util.daysInYear(this.year()) : NaN;
  }

  /**
   * Returns a string representation of this DateTime formatted according to the provided format string
   * **You may not want this.** See {@link toLocaleString} for a more flexible formatting tool.
   * [todo - token definitions here]
   * @param {string} fmt - the format string
   * @param {object} opts - options
   * @param {boolean} opts.round - round numerical values
   * @example DateTime.local().toFormat('yyyy LLL dd') //=> '2017 avr. 22'
   * @example DateTime.local().locale('fr').toFormat('yyyy LLL dd') //=> '2017 Apr 22'
   * @example DateTime.local().toFormat("HH 'hours and' mm 'minutes'") //=> '20 hours and 55 minutes'
   * @return {string}
   */
  toFormat(fmt, opts = {}) {
    return this.valid
      ? Formatter.create(this.loc, opts).formatDateTimeFromString(this, fmt)
      : INVALID;
  }

  /**
   * Returns a localized string representing this date. Accepts the same options as the Intl.DateTimeFormat constructor.
   * The exact behavior of this method is browser-specific, but in general it will return an appropriate representation
   * of the DateTime in the assigned locale. The options
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param opts {object} - Intl.DateTimeFormat constructor options
   * @example DateTime.local().toLocaleString(); //=> 4/20/2017
   * @example DateTime.local().locale('en-gb').toLocaleString(); //=> '20/04/2017'
   * @example DateTime.local().toLocaleString({weekday: 'long', month: 'long', date: '2-digit'}); //=> 'Thu, Apr 20'
   * @example DateTime.local().toLocaleString({weekday: 'long', month: 'long', date: '2-digit', hour: '2-digit', minute: '2-digit'}); //=> 'Thu, Apr 20, 11:27'
   * @example DateTime.local().toLocaleString({hour: '2-digit', minute: '2-digit'}); //=> '11:32'
   * @return {string}
   */
  toLocaleString(opts = {}) {
    return this.valid ? Formatter.create(this.loc.clone(opts), opts).formatDateTime(this) : INVALID;
  }

  /**
   * Returns an ISO 8601-compliant string representation of this DateTime
   * @example DateTime.utc(1982, 5, 25).toISO() //=> '1982-05-25T00:00:00.000Z'
   * @example DateTime.local().toISO() //=> '2017-04-22T20:47:05.335-04:00'
   * @return {string}
   */
  toISO() {
    return formatMaybe(this, "yyyy-MM-dd'T'HH:mm:ss.SSSZZ");
  }

  /**
   * Returns an ISO 8601-compliant string representation of this DateTime's date component
   * @example DateTime.utc(1982, 5, 25).toISODate() //=> '07:34:19.361Z'
   * @return {string}
   */
  toISODate() {
    return formatMaybe(this, 'yyyy-MM-dd');
  }

  /**
   * Returns an ISO 8601-compliant string representation of this DateTime's time component
   * @param {object} opts - options
   * @param {boolean} opts.suppressMilliseconds - exclude milliseconds from the format if they're 0
   * @param {boolean} opts.supressSeconds - exclude seconds from the format if they're 0
   * @example DateTime.utc().hour(7).minute(34).toISOTime() //=> '07:34:19.361Z'
   * @example DateTime.utc().hour(7).minute(34).toISOTime({ suppressSeconds: true }) //=> '07:34Z'
   * @return {string}
   */
  toISOTime({ suppressMilliseconds = false, suppressSeconds = false } = {}) {
    const f = suppressSeconds && this.second() === 0 && this.millisecond() === 0
      ? 'hh:mmZ'
      : suppressMilliseconds && this.millisecond() === 0 ? 'hh:mm:ssZZ' : 'hh:mm:ss.SSSZZ';
    return formatMaybe(this, f);
  }

  /**
   * Returns an RFC 2822-compatible string representation of this DateTime, always in UTC
   * @example DateTime.utc(2014, 7, 13).toRFC2822() //=> 'Sun, 13 Jul 2014 00:00:00 +0000'
   * @example DateTime.local(2014, 7, 13).toRFC2822() //=> 'Sun, 13 Jul 2014 00:00:00 -0400'
   * @return {string}
   */
  toRFC2822() {
    return formatMaybe(this, 'EEE, dd LLL yyyy hh:mm:ss ZZZ');
  }

  /**
   * Returns a string representation of this DateTime appropriate for use in HTTP headers.
   * Specifically, the string conforms to RFC 1123.
   * @see https://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1
   * @example DateTime.utc(2014, 7, 13).toHTTP() //=> 'Sun, 13 Jul 2014 00:00:00 GMT'
   * @return {string}
   */
  toHTTP() {
    return formatMaybe(this.toUTC(), "EEE, dd LLL yyyy hh:mm:ss 'GMT'");
  }

  /**
   * Returns a string representation of this DateTime appropriate for debugging
   * @return {string}
   */
  toString() {
    return this.valid ? this.toISO() : INVALID;
  }

  /**
   * Returns the epoch milliseconds of this DateTime
   * @return {number}
   */
  valueOf() {
    return this.valid ? this.ts : NaN;
  }

  /**
   * Returns an ISO 8601 representation of this DateTime appropriate for use in JSON
   * @return {number}
   */
  toJSON() {
    return this.toISO();
  }

  /**
   * Returns a Javascript object with this DateTime's year, month, day, and so on
   * @example DateTime.local().toObject() //=> { year: 2017, month: 4, day: 22, hour: 20, minute: 49, second: 42, millisecond: 268 }
   * @return {object}
   */
  toObject() {
    // todo: invalid
    return Object.assign({}, this.c);
  }

  /**
   * Returns a Javascript Date equivalent to this DateTime
   * @return {object}
   */
  toJSDate() {
    return new Date(this.valid ? this.ts : NaN);
  }

  /**
   * Returns the resolved Intl options for this DateTime
   * This is useful in understanding the behavior of parsing and formatting methods
   * @param {object} opts - the same options as toLocaleString
   * @return {object}
   */
  resolvedLocaleOpts(opts = {}) {
    return Formatter.create(this.loc, opts).resolvedOptions();
  }

  /**
   * Add a period of time to this DateTime and return the resulting DateTime
   * * Adding hours, minutes, seconds, or milliseconds increases the timestamp by the right number of milliseconds.
   * * Adding days, months, or years shifts the calendar, accounting for DSTs and leap years along the way.
   * Thus, `dt.plus(24, 'hours')` may result in a different time than `dt.plus(1, 'day')` if there's a DST shift in between.
   * @param {Duration|number} durationOrNumber - The amount to add. Either a Luxon Duration or a number
   * @param {string} unit - The unit to add. Only applicable if the first argument is a number. Can be 'year', 'month', 'day', 'hour', 'minute', 'second', or 'millisecond'.
   * @example DateTime.local().plus(15, 'minutes') //~> in 15 minutes
   * @example DateTime.local().plus(1, 'day') //~> this time tomorrow
   * @example DateTime.local().plus(Duration.fromObject({hours: 3, minutes: 13}) //~> in 1 hr, 13 min
   * @return {DateTime}
   */
  plus(durationOrNumber, unit) {
    if (!this.valid) return this;
    const dur = Util.friendlyDuration(durationOrNumber, unit);
    return clone(this, adjustTime(this, dur));
  }

  /**
   * Subtract a period of time to this DateTime and return the resulting DateTime
   * See {@link plus}
   * @param {Duration|number} durationOrNumber - The amount to add. Either a Luxon Duration or a number
   * @param {string} unit - The unit to add. Only applicable if the first argument is a number. Can be 'year', 'month', 'day', 'hour', 'minute', 'second', or 'millisecond'.
   * @return {DateTime}
   */
  minus(durationOrNumber, unit) {
    if (!this.valid) return this;
    const dur = Util.friendlyDuration(durationOrNumber, unit).negate();
    return clone(this, adjustTime(this, dur));
  }

  /**
   * "Sets" this DateTime to the beginning of a unit of time
   * @param {string} unit - The unit to go to the beginning of. Can be 'year', 'month', 'day', 'hour', 'minute', 'second', or 'millisecond'.
   * @example DateTime.local(2014, 3, 3).startOf('month').toISODate(); //=> '2014-03-01'
   * @example DateTime.local(2014, 3, 3).startOf('year').toISODate(); //=> '2014-01-01'
   * @example DateTime.local(2014, 3, 3, 5, 30).startOf('day').toISOTime(); //=> '00:00.000-05:00'
   * @example DateTime.local(2014, 3, 3, 5, 30).startOf('hour').toISOTime(); //=> '05:00:00.000-05:00'
   * @return {DateTime}
   */
  startOf(unit) {
    if (!this.valid) return this;
    const o = {};
    switch (Util.normalizeUnit(unit)) {
      case 'year':
        o.month = 1;
      // falls through
      case 'month':
        o.day = 1;
      // falls through
      case 'day':
        o.hour = 0;
      // falls through
      case 'hour':
        o.minute = 0;
      // falls through
      case 'minute':
        o.second = 0;
      // falls through
      case 'second':
        o.millisecond = 0;
        break;
      default:
        throw new Error(`Can't find the start of ${unit}`);
    }
    return this.set(o);
  }

  /**
   * "Sets" this DateTime to the end (i.e. the last millisecond) of a unit of time
   * @param {string} unit - The unit to go to the end of. Can be 'year', 'month', 'day', 'hour', 'minute', 'second', or 'millisecond'.
   * @example DateTime.local(2014, 3, 3).endOf('month').toISO(); //=> '2014-03-03T00:00:00.000-05:00'
   * @example DateTime.local(2014, 3, 3).endOf('year').toISO(); //=> '2014-12-31T23:59:59.999-05:00'
   * @example DateTime.local(2014, 3, 3, 5, 30).endOf('day').toISO(); //=> '2014-03-03T23:59:59.999-05:00'
   * @example DateTime.local(2014, 3, 3, 5, 30).endOf('hour').toISO(); //=> '2014-03-03T05:59:59.999-05:00'
   * @return {DateTime}
   */
  endOf(unit) {
    return this.valid ? this.startOf(unit).plus(1, unit).minus(1, 'milliseconds') : this;
  }

  /**
   * Return the difference between two DateTimes as a Duration.
   * @param {DateTime} otherDateTime - the DateTime to compare this one to
   * @param {...string} [units=['milliseconds']] - the units (such as 'hours' or 'days') to include in the duration
   * @example
   * var i1 = DateTime.fromISO('1982-05-25T09:45'),
   *     i2 = DateTime.fromISO('1983-10-14T10:30');
   * i2.diff(i1).toObject() //=> { milliseconds: 43807500000 }
   * i2.diff(i1, 'months', 'days').toObject() //=> { months: 16, days: 19.03125 }
   * i2.diff(i1, 'months', 'days', 'hours').toObject() //=> { months: 16, days: 19, hours: 0.75 }
   * i2.diff(i1, 'hours').toObject() //=> { hours: 12168.75 }
   * @return {Duration}
   */
  diff(otherDateTime, ...units) {
    if (!this.valid) return this;

    if (units.length === 0) {
      units = ['millisecond'];
    } else {
      units = units.map(Util.normalizeUnit);
    }

    const flipped = otherDateTime.valueOf() > this.valueOf(),
      post = flipped ? otherDateTime : this,
      accum = {};

    let cursor = flipped ? this : otherDateTime, lowestOrder = null;

    if (units.indexOf('year') >= 0) {
      let dYear = post.year() - cursor.year();

      cursor = cursor.year(post.year());

      if (cursor > post) {
        cursor = cursor.minus(1, 'year');
        dYear -= 1;
      }

      accum.years = dYear;
      lowestOrder = 'year';
    }

    if (units.indexOf('month') >= 0) {
      const dYear = post.year() - cursor.year();
      let dMonth = post.month() - cursor.month() + dYear * 12;

      cursor = cursor.set({ year: post.year(), month: post.month() });

      if (cursor > post) {
        cursor = cursor.minus(1, 'month');
        dMonth -= 1;
      }

      accum.months = dMonth;
      lowestOrder = 'month';
    }

    // days is tricky because we want to ignore offset differences
    if (units.indexOf('day') >= 0) {
      // there's almost certainly a quicker, simpler way to do this
      const utcDayStart = i => DateTime.fromJSDate(Util.asIfUTC(i)).startOf('day').valueOf(),
        ms = utcDayStart(post) - utcDayStart(cursor);
      let dDay = Math.floor(Duration.fromLength(ms).shiftTo('day').days());

      cursor = cursor.set({ year: post.year(), month: post.month(), day: post.day() });

      if (cursor > post) {
        cursor.minus(1, 'day');
        dDay = -1;
      }

      accum.days = dDay;
      lowestOrder = 'day';
    }

    const remaining = Duration.fromLength(post - cursor),
      moreUnits = units.filter(u => ['hour', 'minute', 'second', 'millisecond'].indexOf(u) >= 0),
      shiftTo = moreUnits.length > 0 ? moreUnits : [lowestOrder],
      shifted = remaining.shiftTo(...shiftTo),
      merged = shifted.plus(Duration.fromObject(accum));

    return flipped ? merged.negate() : merged;
  }

  /**
   * Return the difference between this DateTime and right now.
   * See {@link diff}
   * @param {...string} [units=['milliseconds']] - the units (such as 'hours' or 'days') to include in the duration
   * @return {Duration}
   */
  diffNow(...units) {
    return this.valid ? this.diff(DateTime.local(), ...units) : Duration.invalid();
  }

  /**
   * Return an Interval spanning between this DateTime and another DateTime
   * @param {DateTime} otherDateTime - the other end point of the Interval
   * @param {object} opts - options for constructing the interval. {@link Interval.fromDateTimes}
   * @return {Duration}
   */
  until(otherDateTime, opts = {}) {
    return this.valid ? Interval.fromDateTimes(this, otherDateTime, opts) : Duration.invalid();
  }

  /**
   * Return whether this DateTime is in the same unit of time as another DateTime
   * @param {DateTime} otherDateTime - the other DateTime
   * @param {string} unit - the unit of time to check sameness on
   * @example DateTime.local().hasSame(otherDT, 'day'); //~> true if both the same calendar day
   * @return {boolean}
   */
  hasSame(otherDateTime, unit) {
    if (!this.valid) return false;
    if (unit === 'millisecond') {
      return this.valueOf() === otherDateTime.valueOf();
    } else {
      const inputMs = otherDateTime.valueOf();
      return this.startOf(unit) <= inputMs && inputMs <= this.endOf(unit);
    }
  }

  /**
   * Equality check
   * Two DateTimes are equal iff they represent the same millisecond
   * @param {DateTime} other - the other DateTime
   * @return {boolean}
   */
  equals(other) {
    // todo - check other stuff?
    return this.valid && other.valid ? this.valueOf() === other.valueOf() : false;
  }

  /**
   * Return the min of several date times
   * @param {...DateTime} dateTimes - the DateTimes from which to choose the minimum
   * @return {DateTime}
   */
  static min(...dateTimes) {
    return Util.bestBy(dateTimes, i => i.valueOf(), Math.min);
  }

  /**
   * Return the max of several date times
   * @param {...DateTime} dateTimes - the DateTimes from which to choose the maximum
   * @return {DateTime}
   */
  static max(...dateTimes) {
    return Util.bestBy(dateTimes, i => i.valueOf(), Math.max);
  }
}
