import { Duration } from './duration';
import { Interval } from './interval';
import { Formatter } from './impl/formatter';
import { FixedOffsetZone } from './impl/fixedOffsetZone';
import { LocalZone } from './impl/localZone';
import { Locale } from './impl/locale';
import { IntlZone } from './impl/intlZone';
import { Util } from './impl/util';
import { ISOParser } from './impl/isoParser';
import { Parser } from './impl/parser';
import { InvalidUnitException } from './impl/exceptions';

const INVALID = 'Invalid Date';

function now() {
  return new Date().valueOf();
}

function clone(inst, alts = {}) {
  const current = { ts: inst.ts, zone: inst.zone, c: inst.c, o: inst.o, loc: inst.loc };
  return new Instant(Object.assign({}, current, alts, { old: current }));
}

function validateObject(obj) {
  return Util.isNumber(obj.year) &&
    Util.isNumber(obj.month) && obj.month >= 1 && obj.month <= 12 &&
    Util.isNumber(obj.day) && obj.day >= 1 && obj.day <= Util.daysInMonth(obj.year, obj.month) &&
    Util.isNumber(obj.hour) && obj.hour >= 0 && obj.hour <= 23 &&
    Util.isNumber(obj.minute) && obj.minute >= 0 && obj.minute <= 59 &&
    Util.isNumber(obj.second) && obj.second >= 0 && obj.second <= 59 &&
    Util.isNumber(obj.millisecond) && obj.millisecond >= 0 && obj.millisecond <= 999;
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
    millisecond: d.getUTCMilliseconds(),
  };
}

function objToTS(obj, zone, offset) {
  let d = Date.UTC(obj.year,
                   obj.month - 1,
                   obj.day,
                   obj.hour,
                   obj.minute,
                   obj.second,
                   obj.millisecond);

  // javascript is stupid and i hate it
  if (obj.year < 100 && obj.year >= 0) {
    const t = new Date(d);
    t.setFullYear(obj.year);
    d = t.valueOf();
  }

  const tsProvis = +d - (offset * 60 * 1000);
  return fixOffset(tsProvis, zone, offset);
}

function adjustTime(inst, dur) {
  const oPre = inst.o;

  // todo: only do this part if there are higher-order items in the dur
  const c = Object.assign({}, inst.c, {
    year: inst.c.year + dur.years(),
    month: inst.c.month + dur.months(),
    day: inst.c.day + dur.days(),
  });

  let [ts, o] = objToTS(c, inst.zone, oPre);

  const millisToAdd = Duration
        .fromObject({ hours: dur.hours(),
          minutes: dur.minutes(),
          seconds: dur.seconds(),
          milliseconds: dur.milliseconds(),
        })
        .as('milliseconds');

  if (millisToAdd !== 0) {
    ts += millisToAdd;
    [ts, o] = fixOffset(ts, inst.zone, o, true);
  }

  return { ts, o };
}

export class Instant {

  constructor(config = {}) {
    Object.defineProperty(this, 'ts', {
      value: config.ts || Instant.now(),
      enumerable: true,
    });

    Object.defineProperty(this, 'zone', {
      value: config.zone || Instant.defaultZone,
      enumerable: true,
    });

    Object.defineProperty(this, 'loc', {
      value: config.loc || Locale.create(),
      enumerable: true,
    });

    Object.defineProperty(this, 'valid', {
      value: Util.isUndefined(config.valid) ? true : config.valid,
      enumerable: false,
    });

    const unchanged = (config.old &&
                       config.old.ts === this.ts &&
                       config.old.zone.equals(this.zone));
    const c = unchanged ? config.old.c : tsToObj(this.ts, this.zone.offset(this.ts));
    const o = unchanged ? config.old.o : this.zone.offset(this.ts);

    Object.defineProperty(this, 'c', { value: c });
    Object.defineProperty(this, 'o', { value: o });
  }

  static get defaultZone() {
    return new LocalZone();
  }

  static now() {
    return new Instant({ ts: now() });
  }

  static invalid() {
    return new Instant({ valid: false });
  }

  static fromJSDate(date) {
    return new Instant({ ts: date.valueOf() });
  }

  static fromMillis(milliseconds) {
    return new Instant({ ts: milliseconds });
  }

  static fromUnix(seconds) {
    return this.fromMillis(seconds * 1000);
  }

  static fromObject(obj, opts = { utc: false, zone: null }) {
    const tsNow = now();
    const zone = opts.zone ? opts.zone : (opts.utc ? new FixedOffsetZone(0) : new LocalZone());
    const offsetProvis = zone.offset(tsNow);
    const defaulted = Object.assign(tsToObj(tsNow, offsetProvis),
                                    { hour: 0, minute: 0, second: 0, millisecond: 0 },
                                    obj);

    if (validateObject(defaulted)) {
      const [tsFinal] = objToTS(defaulted, zone, offsetProvis);
      const inst = new Instant({ ts: tsFinal, zone });

      if (!Util.isUndefined(obj.weekday) && obj.weekday !== inst.weekday()) {
        return Instant.invalid();
      }

      return new Instant({ ts: tsFinal, zone });
    } else {
      return Instant.invalid();
    }
  }

  static fromISO(text, opts = { acceptOffset: false, assumeUTC: false }) {
    const parsed = ISOParser.parseISODate(text);
    if (parsed) {
      const { local, offset } = parsed;
      const zone = local ?
              (opts.assumeUTC ? new FixedOffsetZone(0) : new LocalZone()) :
            new FixedOffsetZone(offset);
      const inst = Instant.fromObject(parsed, { zone });

      return opts.acceptOffset ? inst : inst.local();
    } else {
      return Instant.invalid();
    }
  }

  static fromString(text, fmt, opts = {}) {
    const parser = new Parser(Locale.fromOpts(opts));
    const result = parser.parseInstant(text, fmt);
    return Object.keys(result).length === 0 ?
      Instant.invalid() :
      Instant.fromObject(result);
  }

  static fromStringExplain(text, fmt, opts = {}) {
    const parser = new Parser(Locale.fromOpts(opts));
    return parser.explainParse(text, fmt);
  }

  isValid() {
    return this.valid;
  }

  locale(l) {
    if (Util.isUndefined(l)) {
      // todo: this should return the effective locale
      return this.loc ? this.loc.localeCode : null;
    } else {
      return clone(this, { loc: Locale.create(l) });
    }
  }

  utc() {
    return this.useUTCOffset(0);
  }

  useUTCOffset(offset, opts = { keepCalendarTime: false }) {
    return this.rezone(new FixedOffsetZone(offset), opts);
  }

  local() {
    return this.rezone(new LocalZone());
  }

  timezone(zoneName) {
    return this.rezone(new IntlZone(zoneName));
  }

  rezone(zone, opts = { keepCalendarTime: false }) {
    if (zone.equals(this.zone)) {
      return this;
    } else {
      const newTS = opts.keepCalendarTime ?
              this.ts + ((this.o - zone.offset(this.ts)) * 60 * 1000) :
              this.ts;
      return clone(this, { ts: newTS, zone });
    }
  }

  timezoneName() {
    return this.zone.name;
  }

  offsetNameShort() {
    return this.zone.offsetName(this.ts, { format: 'short', localeCode: this.locale.localeCode });
  }

  offsetNameLong() {
    return this.zone.offsetName(this.ts, { format: 'long', localeCode: this.locale.localeCode });
  }

  isOffsetFixed() {
    return this.zone.universal;
  }

  isInDST() {
    if (this.isOffsetFixed()) {
      return false;
    } else {
      return this.offset() > this.month(0).offset() || this.offset() > this.month(5).offset();
    }
  }

  get(unit) {
    return this.valid ? this[unit]() : NaN;
  }

  set(values) {
    const mixed = Object.assign(this.toObject(), values);
    const [ts, o] = objToTS(mixed, this.zone, this.o);
    return clone(this, { ts, o });
  }

  year(v) {
    return Util.isUndefined(v) ? (this.valid ? this.c.year : NaN) : this.set({ year: v });
  }

  month(v) {
    return Util.isUndefined(v) ? (this.valid ? this.c.month : NaN) : this.set({ month: v });
  }

  day(v) {
    return Util.isUndefined(v) ? (this.valid ? this.c.day : NaN) : this.set({ day: v });
  }

  hour(v) {
    return Util.isUndefined(v) ? (this.valid ? this.c.hour : NaN) : this.set({ hour: v });
  }

  minute(v) {
    return Util.isUndefined(v) ? (this.valid ? this.c.minute : NaN) : this.set({ minute: v });
  }

  second(v) {
    return Util.isUndefined(v) ? (this.valid ? this.c.second : NaN) : this.set({ second: v });
  }

  millisecond(v) {
    return Util.isUndefined(v) ?
      (this.valid ? this.c.millisecond : NaN) :
    this.set({ millisecond: v });
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
    return this.valid ? (Util.isLeapYear(this.year()) ? 366 : 365) : NaN;
  }

  toFormatString(fmt, opts = {}) {
    return this.valid ?
      Formatter.create(this.loc, opts).formatInstantFromString(this, fmt) :
      INVALID;
  }

  toLocaleString(opts = {}) {
    return this.valid ?
      Formatter.create(this.loc.clone(opts), opts).formatInstant(this) :
      INVALID;
  }

  toISO() {
    return this.valid ?
      Formatter.create(Locale.create('en')).formatInstantFromString(this, "yyyy-MM-dd'T'HH:mm:ss.SSSZZ") :
      INVALID;
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
    switch (unit) {
    case 'year': o.month = 1; // falls through
    case 'month': o.day = 1; // falls through
    case 'day': o.hour = 0; // falls through
    case 'hour': o.minute = 0; // falls through
    case 'minute': o.second = 0; // falls through
    case 'second': o.millisecond = 0; break;
    default: throw new InvalidUnitException(unit);
    }
    return this.set(o);
  }

  endOf(unit) {
    return this.valid ?
      this
        .startOf(unit)
        .plus(1, unit)
        .minus(1, 'milliseconds') :
      this;
  }

  diff(otherInstant, ...units) {
    if (!this.valid) return this;

    if (units.length === 0) units = ['milliseconds'];

    const flipped = otherInstant.valueOf() > this.valueOf();
    const post = flipped ? otherInstant : this;
    const accum = {};

    let cursor = flipped ? this : otherInstant,
        lowestOrder = null;

    if (units.indexOf('years') >= 0) {
      let dYear = post.year() - cursor.year();

      cursor = cursor.year(post.year());

      if (cursor > post) {
        cursor = cursor.minus(1, 'years');
        dYear -= 1;
      }

      accum.years = dYear;
      lowestOrder = 'years';
    }

    if (units.indexOf('months') >= 0) {
      const dYear = post.year() - cursor.year();
      let dMonth = post.month() - cursor.month() + dYear * 12;

      cursor = cursor.set({ year: post.year(), month: post.month() });

      if (cursor > post) {
        cursor = cursor.minus(1, 'months');
        dMonth -= 1;
      }

      accum.months = dMonth;
      lowestOrder = 'months';
    }

    // days is tricky because we want to ignore offset differences
    if (units.indexOf('days') >= 0) {
      // there's almost certainly a quicker, simpler way to do this
      const utcDayStart = i => Instant.fromJSDate(Util.asIfUTC(i)).startOf('day').valueOf();
      const ms = utcDayStart(post) - utcDayStart(cursor);
      let dDay = Math.floor(Duration.fromLength(ms).shiftTo('days').days());

      cursor = cursor.set({ year: post.year(), month: post.month(), day: post.day() });

      if (cursor > post) {
        cursor.minus(1, 'day');
        dDay = -1;
      }

      accum.days = dDay;
      lowestOrder = 'days';
    }

    const remaining = Duration.fromLength(post - cursor);
    const moreUnits = units.filter(u => ['hours', 'minutes', 'seconds', 'milliseconds'].indexOf(u) >= 0);
    const shiftTo = moreUnits.length > 0 ? moreUnits : [lowestOrder];
    const shifted = remaining.shiftTo(...shiftTo);
    const merged = shifted.plus(Duration.fromObject(accum));

    return flipped ? merged.negate() : merged;
  }

  diffNow(...units) {
    return this.valid ? this.diff(Instant.now(), ...units) : Duration.invalid();
  }

  until(otherInstant, opts = {}) {
    return this.valid ? Interval.fromInstants(this, otherInstant, opts) : Duration.invalid();
  }

  hasSame(otherInstant, unit) {
    if (!this.valid) return false;
    if (unit === 'millisecond') {
      return this.valueOf() === otherInstant.valueOf();
    } else {
      const inputMs = otherInstant.valueOf();
      return this.startOf(unit) <= inputMs && inputMs <= this.endOf(unit);
    }
  }

  equals(other) {
    // todo - check other stuff?
    return (this.valid && other.valid) ?
      this.valueOf() === other.valueOf() :
      false;
  }

  static min(...instants) {
    return Util.bestBy(instants, i => i.valueOf(), Math.min);
  }

  static max(...instants) {
    return Util.bestBy(instants, i => i.valueOf(), Math.max);
  }
}
