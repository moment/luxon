import { Duration } from './duration';
import { Interval } from './interval';
import { Settings } from './settings';
import { Formatter } from './impl/formatter';
import { FixedOffsetZone } from './zones/fixedOffsetZone';
import { LocalZone } from './zones/localZone';
import { Locale } from './impl/locale';
import { Util } from './impl/util';
import { ISOParser } from './impl/isoParser';
import { Parser } from './impl/parser';
import { Weeks } from './impl/weeks';

const INVALID = 'Invalid Date';

function possiblyCachedWeekData(dt) {
  if (dt.weekData === null) {
    dt.weekData = Weeks.toWeekData(dt.c);
  }
  return dt.weekData;
}

function clone(inst, alts = {}) {
  const current = { ts: inst.ts, zone: inst.zone, c: inst.c, o: inst.o, loc: inst.loc };
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

function isoFormat(dt, format) {
  return dt.valid
    ? Formatter.create(Locale.create('en')).formatDateTimeFromString(dt, format)
    : INVALID;
}

const defaultUnitValues = { month: 1, day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 },
  defaultWeekUnitValues = {
    weekNumber: 1,
    weekday: 1,
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
      containsGregorDef = !Util.isUndefined(normalized.year) ||
        !Util.isUndefined(normalized.month) ||
        !Util.isUndefined(normalized.day),
      definiteWeekDef = normalized.weekYear || normalized.weekNumber;

    // Four cases:
    // just a weekday -> this week's instance of that weekday
    // gregorian data of any kind -> use it
    // gregorian data of any kind + weekYear or weekNumber -> error
    // weekYear/weekNumber data -> use it

    if (containsGregorDef && definiteWeekDef) {
      throw new Error("Can't mix weekYear/weekNumber units with year/month/day");
    }

    const useWeekData = definiteWeekDef || (normalized.weekday && !containsGregorDef);

    // configure ourselves to deal with gregorian dates or week stuff
    let units, defaultValues, objNow;
    if (useWeekData) {
      units = Util.orderedWeekUnits;
      defaultValues = defaultWeekUnitValues;
      objNow = Weeks.toWeekData(tsToObj(tsNow, offsetProvis));
    } else {
      units = Util.orderedUnits;
      defaultValues = defaultUnitValues;
      objNow = tsToObj(tsNow, offsetProvis);
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
    if (
      (useWeekData && !Weeks.validateWeekData(normalized)) ||
      (!useWeekData && !validateObject(normalized))
    ) {
      return DateTime.invalid();
    }

    // compute the actual time
    const gregorian = useWeekData ? Weeks.toGregorian(normalized) : normalized,
      [tsFinal] = objToTS(gregorian, zoneToUse, offsetProvis),
      inst = new DateTime({ ts: tsFinal, zone: zoneToUse });

    // gregorian data + weekday serves only to validate
    if (normalized.weekday && containsGregorDef && obj.weekday !== inst.weekday()) {
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
    const [vals, context] = ISOParser.parseISODate(text);
    if (vals) {
      const { local, offset } = context,
        interpretationZone = local ? zone : new FixedOffsetZone(offset),
        inst = DateTime.fromObject(vals, interpretationZone);
      return setZone ? inst : inst.timezone(zone);
    } else {
      return DateTime.invalid();
    }
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
    const parser = new Parser(Locale.fromOpts({ localeCode, nums, cal })),
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
    const parser = new Parser(Locale.fromOpts(options));
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
   * @return {DateTime}
   */
  set(values) {
    const normalized = Util.normalizeObject(values),
      settingWeekStuff = !Util.isUndefined(normalized.weekYear) ||
        !Util.isUndefined(normalized.weekNumber) ||
        !Util.isUndefined(normalized.weekday),
      mixed = settingWeekStuff
        ? Weeks.toGregorian(Object.assign(Weeks.toWeekData(this.c), normalized))
        : Object.assign(this.toObject(), normalized),
      [ts, o] = objToTS(mixed, this.zone, this.o);
    return clone(this, { ts, o });
  }

  /**
   * Gets or "sets" the year.
   * @param {number} year - the year to set. If omitted, `year()` acts as a getter for the year.
   * @example DateTime.local(2017, 5, 25).year(1982).toISODate() //=> "1982-05-25"
   * @example DateTime.local(2017, 5, 25).year() //=> 2017
   * @return {number|DateTime}
   */
  year(year) {
    return Util.isUndefined(year) ? this.valid ? this.c.year : NaN : this.set({ year });
  }

  /**
   * Gets or "sets" the month.
   * @param {number} month - the month to set. If omitted, `month()` acts as a getter for the month.
   * @example DateTime.local(2017, 5, 25).month(6).toISODate() //=> "2017-06-25"
   * @example DateTime.local(2017, 5, 25).month() //=> 5
   * @return {number|DateTime}
   */
  month(month) {
    return Util.isUndefined(month) ? this.valid ? this.c.month : NaN : this.set({ month });
  }

  /**
   * Gets or "sets" the day of the day.
   * @param {number} day - the day to set. If omitted, `day()` acts as a getter for the day.
   * @example DateTime.local(2017, 5, 25).day(26).toISODate() //=> "2017-05-26"
   * @example DateTime.local(2017, 5, 25).day() //=> 25
   * @return {number|DateTime}
   */
  day(day) {
    return Util.isUndefined(day) ? this.valid ? this.c.day : NaN : this.set({ day });
  }

  hour(hour) {
    return Util.isUndefined(hour) ? this.valid ? this.c.hour : NaN : this.set({ hour });
  }

  minute(minute) {
    return Util.isUndefined(minute) ? this.valid ? this.c.minute : NaN : this.set({ minute });
  }

  second(second) {
    return Util.isUndefined(second) ? this.valid ? this.c.second : NaN : this.set({ second });
  }

  millisecond(v) {
    return Util.isUndefined(v)
      ? this.valid ? this.c.millisecond : NaN
      : this.set({ millisecond: v });
  }

  weekNumber(weekNumber) {
    return Util.isUndefined(weekNumber)
      ? this.valid ? possiblyCachedWeekData(this).weekNumber : NaN
      : this.set({ weekNumber });
  }

  weekYear(weekYear) {
    return Util.isUndefined(weekYear)
      ? this.valid ? possiblyCachedWeekData(this).weekYear : NaN
      : this.set({ weekYear });
  }

  weekday(weekday) {
    return Util.isUndefined(weekday)
      ? this.valid ? possiblyCachedWeekData(this).weekday : NaN
      : this.set({ weekday });
  }

  offset() {
    return this.valid ? this.zone.offset(this.ts) : NaN;
  }

  isInLeapYear() {
    return Util.isLeapyear(this.year());
  }

  daysInMonth() {
    return Util.daysInMonth(this.year(), this.month());
  }

  daysInYear() {
    return this.valid ? Util.daysInYear(this.year()) : NaN;
  }

  toFormatString(fmt, opts = {}) {
    return this.valid
      ? Formatter.create(this.loc, opts).formatDateTimeFromString(this, fmt)
      : INVALID;
  }

  toLocaleString(opts = {}) {
    return this.valid ? Formatter.create(this.loc.clone(opts), opts).formatDateTime(this) : INVALID;
  }

  toISO() {
    return isoFormat(this, "yyyy-MM-dd'T'HH:mm:ss.SSSZZ");
  }

  toISODate() {
    return isoFormat(this, 'yyyy-MM-dd');
  }

  toISOTime({ suppressMilliseconds = false, suppressSeconds = false } = {}) {
    const f = suppressSeconds && this.second() === 0 && this.millisecond() === 0
      ? 'hh:mm'
      : suppressMilliseconds && this.millisecond() === 0 ? 'hh:mm:ss' : 'hh:mm:ss.SSS';
    return isoFormat(this, f);
  }

  toString() {
    return this.valid ? this.toISO() : INVALID;
  }

  valueOf() {
    return this.valid ? this.ts : NaN;
  }

  toJSON() {
    return this.toISO();
  }

  toObject() {
    // todo: invalid
    return Object.assign({}, this.c);
  }

  toJSDate() {
    return new Date(this.valid ? this.ts : NaN);
  }

  resolvedLocaleOpts(opts = {}) {
    return Formatter.create(this.loc, opts).resolvedOptions();
  }

  plus(durationOrNumber, type) {
    if (!this.valid) return this;
    const dur = Util.friendlyDuration(durationOrNumber, type);
    return clone(this, adjustTime(this, dur));
  }

  minus(durationOrNumber, type) {
    if (!this.valid) return this;
    const dur = Util.friendlyDuration(durationOrNumber, type).negate();
    return clone(this, adjustTime(this, dur));
  }

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

  diffNow(...units) {
    return this.valid ? this.diff(DateTime.local(), ...units) : Duration.invalid();
  }

  until(otherDateTime, opts = {}) {
    return this.valid ? Interval.fromDateTimes(this, otherDateTime, opts) : Duration.invalid();
  }

  hasSame(otherDateTime, unit) {
    if (!this.valid) return false;
    if (unit === 'millisecond') {
      return this.valueOf() === otherDateTime.valueOf();
    } else {
      const inputMs = otherDateTime.valueOf();
      return this.startOf(unit) <= inputMs && inputMs <= this.endOf(unit);
    }
  }

  equals(other) {
    // todo - check other stuff?
    return this.valid && other.valid ? this.valueOf() === other.valueOf() : false;
  }

  static min(...DateTimes) {
    return Util.bestBy(DateTimes, i => i.valueOf(), Math.min);
  }

  static max(...DateTimes) {
    return Util.bestBy(DateTimes, i => i.valueOf(), Math.max);
  }
}
