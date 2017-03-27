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

const INVALID = 'Invalid Date';

function clone(inst, alts = {}) {
  const current = { ts: inst.ts, zone: inst.zone, c: inst.c, o: inst.o, loc: inst.loc };
  return new DateTime(Object.assign({}, current, alts, { old: current }));
}

function numberBetween(thing, bottom, top) {
  return Util.isNumber(thing) && thing >= bottom && thing <= top;
}

function validateObject(obj) {
  const validYear = Util.isNumber(obj.year),
    validMonth = numberBetween(obj.month, 1, 12),
    validDay = numberBetween(obj.day, 1, Util.daysInMonth(obj.year, obj.month)),
    validHour = numberBetween(obj.hour, 0, 23),
    validMinute = numberBetween(obj.minute, 0, 59),
    validSecond = numberBetween(obj.second, 0, 59),
    validMillisecond = numberBetween(obj.millisecond, 0, 999);

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

const defaultUnitValues = { month: 1, day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 };

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
   * @param {number} [day=1]
   * @param {number} [hour=0] - The day of the day, in 24-hour time
   * @param {number} [minute=0] - The minute of the hour, i.e. a number between 0 and 59
   * @param {number} [second=0] - The second of the minute, i.e. a number between 0 and 59
   * @param {number} [millisecond=0] - The millisecond of the second, i.e. a number between 0 and 999
   * @example DateTime.local() //~> now
   * @example DateTime.local(2017) //~> 2017-01-01T00:00:00
   * @example DateTime.local(2017, 3) //~> 2017-03-01T00:00:00
   * @example DateTime.local(2017, 3, 12) //~> 2017-03-12T00:00:00
   * @example DateTime.local(2017, 3, 12, 5) //~> 2017-03-12T05:00:00
   * @example DateTime.local(2017, 3, 12, 5, 45) //~> 2017-03-12T05:45:00
   * @example DateTime.local(2017, 3, 12, 5, 45, 10) //~> 2017-03-12T05:45:10
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
   * @param {number} [day=1]
   * @param {number} [hour=0] - The day of the day, in 24-hour time
   * @param {number} [minute=0] - The minute of the hour, i.e. a number between 0 and 59
   * @param {number} [second=0] - The second of the minute, i.e. a number between 0 and 59
   * @param {number} [millisecond=0] - The millisecond of the second, i.e. a number between 0 and 999
   * @example DateTime.utc() //~> now
   * @example DateTime.utc(2017) //~> 2017-01-01T00:00:00Z
   * @example DateTime.utc(2017, 3) //~> 2017-03-01T00:00:00Z
   * @example DateTime.utc(2017, 3, 12) //~> 2017-03-12T00:00:00Z
   * @example DateTime.utc(2017, 3, 12, 5) //~> 2017-03-12T05:00:00Z
   * @example DateTime.utc(2017, 3, 12, 5, 45) //~> 2017-03-12T05:45:00Z
   * @example DateTime.utc(2017, 3, 12, 5, 45, 10) //~> 2017-03-12T05:45:10Z
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
   * Create an DateTime from a Javascript object with keys like "year" and "hour" with reasonable defaults.
   * @param {Object} obj - the object to create the DateTime from
   * @param {string|Zone} [zone='local'] - interpret the numbers in the context of a particular zone. Can take any value taken as the first argument to timezone()
   * @example DateTime.fromObject({year: 1982, month: 5, day: 25}).toISO() //=> '1982-05-25T00:00:00'
   * @example DateTime.fromObject({year: 1982}).toISO() //=> '1982-01-01T00:00:00'
   * @example DateTime.fromObject({hour: 10, minute: 26, second: 6}) //~> today at 10:26:06
   * @example DateTime.fromObject({hour: 10, minute: 26, second: 6}, 'utc')
   * @example DateTime.fromObject({hour: 10, minute: 26, second: 6}, 'local')
   * @example DateTime.fromObject({hour: 10, minute: 26, second: 6}, 'America/New_York')
   * @return {DateTime}
   */
  static fromObject(obj, zone = Settings.defaultZone) {
    const tsNow = Settings.now(),
      zoneToUse = Util.normalizeZone(zone) || Settings.defaultZone,
      offsetProvis = zoneToUse.offset(tsNow),
      objNow = tsToObj(tsNow, offsetProvis),
      normalized = Util.normalizeObject(obj);

    let foundFirst = false;
    for (const u of Util.orderedUnits) {
      const v = normalized[u];
      if (!Util.isUndefined(v)) {
        foundFirst = true;
      } else if (foundFirst) {
        normalized[u] = defaultUnitValues[u];
      } else {
        normalized[u] = objNow[u];
      }
    }

    if (validateObject(normalized)) {
      const [tsFinal] = objToTS(normalized, zoneToUse, offsetProvis),
        inst = new DateTime({ ts: tsFinal, zone: zoneToUse });

      if (!Util.isUndefined(obj.weekday) && obj.weekday !== inst.weekday()) {
        return DateTime.invalid();
      }

      return new DateTime({ ts: tsFinal, zone: zoneToUse });
    } else {
      return DateTime.invalid();
    }
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
    return Object.keys(result).length === 0
      ? DateTime.invalid()
      : DateTime.fromObject(result, zone);
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
   * Get or set the locale of a DateTime, such en-UK. The locale is used when formatting the DateTime
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
   * Sets the DateTime's zone to UTC. Equivalent to timezone('utc')
   * @param {number} [offset=0] - optionally, an offset from UTC in minutes
   * @return {DateTime}
   */
  toUTC(offset = 0) {
    return this.timezone(FixedOffsetZone.instance(offset));
  }

  /**
   * Sets the DateTime's zone to the environment's local zone. Equivalent to `timezone('local')`
   * @return {DateTime}
   */
  toLocal() {
    return this.timezone(new LocalZone());
  }

  /**
   * Gets or sets the DateTime's zone to specified zone.
   *
   * **As a setter**: By default, the setter keeps the underlying time the same (as in, the same UTC timestamp), but the new instance will behave differently in these ways:
   * * getters such as {@link hour} or {@link minute} will report local times in the target zone
   * * {@link plus} and {@link minus} will use the target zone's DST rules (or their absence) when adding days or larger to the DateTime
   * * strings will be formatted according to the target zone's offset
   * You may wish to use {@link toLocal} and {@link toUTC} which provide simple convenience wrappers for commonly used zones.
   *
   * **As a getter**: If you provide no arguments, returns a Luxon Zone instance. This is generally less useful than {@link timezoneName}.
   * @param {string|Zone} zone - The zone to set. Can be a Luxon Zone instance or a string. Strings accepted include 'utc', 'local', 'utc+3', and any IANA identifier supported by the environment, such as 'America/New_York'
   * @param {Object} options - options to affect the conversion
   * @param {boolean} [options.keepCalendarTime=false] - Shift the underlying time so that the new local time is the same
   * @return {DateTime|Zone}
   */
  timezone(zone, { keepCalendarTime = false } = {}) {
    if (Util.isUndefined(zone)) {
      return this.zone;
    } else {
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
   * Gets the value of unit such as "minute" or "day".
   * @return {number}
   */
  get(unit) {
    return this.valid ? this[unit]() : NaN;
  }

  set(values) {
    const mixed = Object.assign(this.toObject(), values),
      [ts, o] = objToTS(mixed, this.zone, this.o);
    return clone(this, { ts, o });
  }

  year(v) {
    return Util.isUndefined(v) ? this.valid ? this.c.year : NaN : this.set({ year: v });
  }

  month(v) {
    return Util.isUndefined(v) ? this.valid ? this.c.month : NaN : this.set({ month: v });
  }

  day(v) {
    return Util.isUndefined(v) ? this.valid ? this.c.day : NaN : this.set({ day: v });
  }

  hour(v) {
    return Util.isUndefined(v) ? this.valid ? this.c.hour : NaN : this.set({ hour: v });
  }

  minute(v) {
    return Util.isUndefined(v) ? this.valid ? this.c.minute : NaN : this.set({ minute: v });
  }

  second(v) {
    return Util.isUndefined(v) ? this.valid ? this.c.second : NaN : this.set({ second: v });
  }

  millisecond(v) {
    return Util.isUndefined(v)
      ? this.valid ? this.c.millisecond : NaN
      : this.set({ millisecond: v });
  }

  weekday() {
    return this.valid ? Util.asIfUTC(this).getUTCDay() : NaN;
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
    return this.valid ? Util.isLeapYear(this.year()) ? 366 : 365 : NaN;
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
    return this.valid
      ? Formatter.create(Locale.create('en')).formatDateTimeFromString(
          this,
          "yyyy-MM-dd'T'HH:mm:ss.SSSZZ"
        )
      : INVALID;
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
