import { Util } from './impl/util';
import { Locale } from './impl/locale';
import { Formatter } from './impl/formatter';
import { RegexParser } from './impl/regexParser';
import { InvalidUnitError } from './errors';

const INVALID = 'Invalid Duration';

const matrix = {
  years: {
    months: 12,
    weeks: 52,
    days: 365,
    hours: 365 * 24,
    minutes: 365 * 24 * 60,
    seconds: 365 * 24 * 60 * 60,
    milliseconds: 365 * 24 * 60 * 60 * 1000
  },
  months: {
    weeks: 4,
    days: 30,
    hours: 30 * 24,
    minutes: 30 * 24 * 60,
    seconds: 30 * 24 * 60 * 60,
    milliseconds: 30 * 24 * 60 * 60 * 1000
  },
  weeks: {
    days: 7,
    hours: 7 * 24,
    minutes: 7 * 24 * 60,
    seconds: 7 * 24 * 60 * 60,
    milliseconds: 7 * 24 * 60 * 60 * 1000
  },
  days: { hours: 24, minutes: 24 * 60, seconds: 24 * 60 * 60, milliseconds: 24 * 60 * 60 * 1000 },
  hours: { minutes: 60, seconds: 60 * 60, milliseconds: 60 * 60 * 1000 },
  minutes: { seconds: 60, milliseconds: 60 * 1000 },
  seconds: { milliseconds: 1000 }
};

const orderedUnits = [
  'years',
  'months',
  'weeks',
  'days',
  'hours',
  'minutes',
  'seconds',
  'milliseconds'
];

function clone(dur, alts) {
  // deep merge for vals
  const conf = {
    values: Object.assign(dur.values, alts.values),
    loc: dur.loc.clone(alts.loc)
  };
  return new Duration(conf);
}

function isHighOrderNegative(obj) {
  // only rule is that the highest-order part must be non-negative
  for (const k of orderedUnits) {
    if (obj[k]) return obj[k] < 0;
  }
  return false;
}

/**
 * A Duration object represents a period of time, like "2 months" or "1 day, 1 hour". Conceptually, it's just a map of units to their quantities, accompanied by some additional configuration and methods for creating, parsing, interrogating, transforming, and formatting them. They can be used on their own or in conjunction with other Luxon types; for example, you can use {@link DateTime.plus} to add a Duration object to a DateTime, producing another DateTime.
 *
 * Here is a brief overview of commonly used methods and getters in Duration:
 *
 * * **Creation** To create a Duration, use {@link fromMilliseconds}, {@link fromObject}, or {@link fromISO}.
 * * **Unit values** See the {@link years}, {@link months}, {@link weeks}, {@link days}, {@link hours}, {@link minutes}, {@link seconds}, {@link milliseconds} accessors.
 * * **Configuration** See  {@link locale} and {@link numberingSystem} accessors.
 * * **Transformation** To create new Durations out of old ones use {@link plus}, {@link minus}, {@link normalize}, {@link set}, {@link reconfigure}, {@link shiftTo}, and {@link negate}.
 * * **Output** To convert the Duration into other representations, see {@link as}, {@link toISO}, {@link toFormat}, and {@link toJSON}
 *
 * There's are more methods documented below. In addition, for more information on subtler topics like internationalization and validity, see the external documentation.
 */
export class Duration {
  /**
   * @private
   */
  constructor(config) {
    Object.defineProperty(this, 'values', { value: config.values, enumerable: true });
    Object.defineProperty(this, 'loc', { value: config.loc || Locale.create(), enumerable: true });
    Object.defineProperty(this, 'valid', { value: config.valid || true, enumerable: false });
  }

  /**
   * Create Duration from a number of milliseconds.
   * @param {number} count of milliseconds
   * @return {Duration}
   */
  static fromMilliseconds(count) {
    return Duration.fromObject({ milliseconds: count });
  }

  /**
   * Create an DateTime from a Javascript object with keys like 'years' and 'hours'.
   * @param {Object} obj - the object to create the DateTime from
   * @param {number} obj.years
   * @param {number} obj.months
   * @param {number} obj.weeks
   * @param {number} obj.days
   * @param {number} obj.hours
   * @param {number} obj.minutes
   * @param {number} obj.seconds
   * @param {number} obj.milliseconds
   * @return {Duration}
   */
  static fromObject(obj) {
    return new Duration({ values: Util.normalizeObject(obj, Duration.normalizeUnit) });
  }

  /**
   * Create a DateTime from an ISO 8601 duration string.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Durations
   * @example Duration.fromISO('P3Y6M4DT12H30M5S').toObject() //=> { years: 3, months: 6, day: 4, hours: 12, minutes: 30, seconds: 5 }
   * @example Duration.fromISO('PT23H').toObject() //=> { hours: 23 }
   > Duration.fromISO('P5Y3M').toObject() //=> { years: 5, months: 3 }
   * @return {Duration}
   */
  static fromISO(text) {
    const vals = RegexParser.parseISODuration(text);
    return Duration.fromObject(vals);
  }

  /**
   * Create an invalid Duration.
   * @return {Duration}
   */
  static invalid() {
    return new Duration({ valid: false });
  }

  /**
   * @private
   */
  static normalizeUnit(unit) {
    const normalized = {
      year: 'years',
      years: 'years',
      month: 'months',
      months: 'months',
      week: 'weeks',
      weeks: 'weeks',
      day: 'days',
      days: 'days',
      hour: 'hours',
      hours: 'hours',
      minute: 'minutes',
      minutes: 'minutes',
      second: 'seconds',
      seconds: 'seconds',
      millisecond: 'milliseconds',
      milliseconds: 'milliseconds'
    }[unit ? unit.toLowerCase() : unit];

    if (!normalized) throw new InvalidUnitError(unit);

    return normalized;
  }

  /**
   * Get  the locale of a Duration, such 'en-UK'
   * @return {string}
   */
  get locale() {
    return this.loc.locale;
  }

  /**
   * Get the numbering system of a Duration, such 'beng'. The numbering system is used when formatting the Duration
   *
   * @return {string}
   */
  get numberingSystem() {
    return this.loc.numberingSystem;
  }

  /**
   * Returns a string representation of this Duration formatted according to the specified format string.
   * [todo - token definitions here]
   * @param {string} fmt - the format string
   * @param {object} opts - options
   * @param {boolean} opts.round - round numerical values
   * @return {string}
   */
  toFormat(fmt, opts = {}) {
    return this.valid
      ? Formatter.create(this.loc, opts).formatDurationFromString(this, fmt)
      : INVALID;
  }

  /**
   * Returns a Javascript object with this Duration's values.
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toObject() //=> { years: 1, days: 6, seconds: 2 }
   * @return {object}
   */
  toObject() {
    return this.valid ? Object.assign({}, this.values) : {};
  }

  /**
   * Returns an ISO 8601-compliant string representation of this Duration.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Durations
   * Duration.fromObject({ years: 3, seconds: 45 }).toISO() //=> 'P3YT45S'
   * Duration.fromObject({ months: 4, seconds: 45 }).toISO() //=> 'P4MT45S'
   * Duration.fromObject({ months: 5 }).toISO() //=> 'P5M'
   * Duration.fromObject({ minutes: 5 }).toISO() //=> 'PT5M'
   * @return {string}
   */
  toISO() {
    // we could use the formatter, but this is an easier way to get the minimum string
    if (!this.valid) return null;

    let s = 'P',
      norm = this.normalize();

    // ISO durations are always positive, so take the absolute value
    norm = isHighOrderNegative(norm.values) ? norm.negate() : norm;

    if (norm.years > 0) s += norm.years + 'Y';
    if (norm.months > 0) s += norm.months + 'M';
    if (norm.days > 0 || norm.weeks > 0) s += norm.days + norm.weeks * 7 + 'D';
    if (norm.hours > 0 || norm.minutes > 0 || norm.seconds > 0 || norm.milliseconds > 0) s += 'T';
    if (norm.hours > 0) s += norm.hours + 'H';
    if (norm.minutes > 0) s += norm.minutes + 'M';
    if (norm.seconds > 0) s += norm.seconds + 'S';
    return s;
  }

  /**
   * Returns an ISO 8601 representation of this Duration appropriate for use in JSON.
   * @return {string}
   */
  toJSON() {
    return this.toISO();
  }

  /**
   * Make this Duration longer by the specified amount. Return a newly-constructed Duration.
   * @param {Duration|number|object} duration - The amount to add. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   * @return {Duration}
   */
  plus(duration) {
    if (!this.valid) return this;

    const dur = Util.friendlyDuration(duration),
      result = {};

    for (const k of orderedUnits) {
      const val = dur.get(k) + this.get(k);
      if (val !== 0) {
        result[k] = val;
      }
    }

    return Duration.fromObject(result);
  }

  /**
   * Make this Duration shorter by the specified amount. Return a newly-constructed Duration.
   * @param {Duration|number|object} duration - The amount to subtract. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   * @return {Duration}
   */
  minus(duration) {
    if (!this.valid) return this;

    const dur = Util.friendlyDuration(duration);
    return this.plus(dur.negate());
  }

  /**
   * Get the value of unit.
   * @param {string} unit - a unit such as 'minute' or 'day'
   * @example Duration.fromObject({years: 2, days: 3}).years //=> 2
   * @example Duration.fromObject({years: 2, days: 3}).months //=> 0
   * @example Duration.fromObject({years: 2, days: 3}).days //=> 3
   * @return {number}
   */
  get(unit) {
    return this[Duration.normalizeUnit(unit)];
  }

  /**
   * "Set" the values of specified units. Return a newly-constructed Duration.
   * @param {object} values - a mapping of units to numbers
   * @example dur.set({ years: 2017 })
   * @example dur.set({ hours: 8, minutes: 30 })
   * @return {Duration}
   */
  set(values) {
    const mixed = Object.assign(this.values, Util.normalizeObject(values, Duration.normalizeUnit));
    return clone(this, { values: mixed });
  }

  /**
   * "Set" the locale and/or numberingSystem.  Returns a newly-constructed Duration.
   * @example dur.reconfigure({ locale: 'en-UK' })
   * @return {Duration}
   */
  reconfigure({ locale, numberingSystem } = {}) {
    const loc = this.loc.clone({ locale, numberingSystem });
    return clone(this, { loc });
  }

  /**
   * Return the length of the duration in the specified unit.
   * @param {string} unit - a unit such as 'minutes' or 'days'
   * @example Duration.fromObject({years: 1}).as('days') //=> 365
   * @example Duration.fromObject({years: 1}).as('months') //=> 12
   * @example Duration.fromObject({hours: 60}).as('days') //=> 2.5
   * @return {number}
   */
  as(unit) {
    return this.valid ? this.shiftTo(unit).get(unit) : NaN;
  }

  /**
   * Reduce this Duration to its canonical representation in its current units.
   * @example Duration.fromObject({ years: 2, days: 5000 }).normalize().toObject() //=> { years: 15, days: 255 }
   * @example Duration.fromObject({ hours: 12, minutes: -45 }).normalize().toObject() //=> { hours: 11, minutes: 15 }
   * @return {Duration}
   */
  normalize() {
    if (!this.valid) return this;

    const neg = isHighOrderNegative(this.values),
      dur = neg ? this.negate() : this,
      shifted = dur.shiftTo(...Object.keys(this.values));
    return neg ? shifted.negate() : shifted;
  }

  /**
   * Convert this Duration into its representation in a different set of units.
   * @example Duration.fromObject({ hours: 1, seconds: 30 }).shiftTo('minutes', 'milliseconds').toObject() //=> { minutes: 60, milliseconds: 30000 }
   * @return {Duration}
   */
  shiftTo(...units) {
    if (!this.valid) return this;

    if (units.length === 0) {
      return this;
    }

    units = units.map(Duration.normalizeUnit);

    const built = {},
      accumulated = {},
      vals = this.toObject();
    let lastUnit;

    for (const k of orderedUnits) {
      if (units.indexOf(k) >= 0) {
        built[k] = 0;
        lastUnit = k;

        // anything we haven't boiled down yet should get boiled to this unit
        for (const ak in accumulated) {
          if (accumulated.hasOwnProperty(ak)) {
            built[k] += matrix[ak][k] * accumulated[ak];
          }
          delete accumulated[ak];
        }

        // plus anything that's already in this unit
        if (Util.isNumber(vals[k])) {
          built[k] += vals[k];
        }

        // plus anything further down the chain that should be rolled up in to this
        for (const down in vals) {
          if (orderedUnits.indexOf(down) > orderedUnits.indexOf(k)) {
            const conv = matrix[k][down],
              added = Math.floor(vals[down] / conv);
            built[k] += added;
            vals[down] -= added * conv;
          }
        }
        // otherwise, keep it in the wings to boil it later
      } else if (Util.isNumber(vals[k])) {
        accumulated[k] = vals[k];
      }
    }

    // anything leftover becomes the decimal for the last unit
    if (lastUnit) {
      for (const key in accumulated) {
        if (accumulated.hasOwnProperty(key)) {
          built[lastUnit] += accumulated[key] / matrix[lastUnit][key];
        }
      }
    }

    return Duration.fromObject(built);
  }

  /**
   * Return the negative of this Duration.
   * @example Duration.fromObject({ hours: 1, seconds: 30 }).negate().toObject() //=> { hours: -1, seconds: -30 }
   * @return {Duration}
   */
  negate() {
    if (!this.valid) return this;
    const negated = {};
    for (const k of Object.keys(this.values)) {
      negated[k] = -this.values[k];
    }
    return Duration.fromObject(negated);
  }

  /**
   * Get the years.
   * @return {number}
   */
  get years() {
    return this.valid ? this.values.years || 0 : NaN;
  }

  /**
   * Get the months.
   * @return {number}
   */
  get months() {
    return this.valid ? this.values.months || 0 : NaN;
  }

  /**
   * Get the weeks
   * @return {number}
   */
  get weeks() {
    return this.valid ? this.values.weeks || 0 : NaN;
  }

  /**
   * Get the days.
   * @return {number
   */
  get days() {
    return this.valid ? this.values.days || 0 : NaN;
  }

  /**
   * Get the hours.
   * @return {number}
   */
  get hours() {
    return this.valid ? this.values.hours || 0 : NaN;
  }

  /**
   * Get the minutes.
   * @return {number}
   */
  get minutes() {
    return this.valid ? this.values.minutes || 0 : NaN;
  }

  /**
   * Get the seconds.
   * @return {number}
   */
  get seconds() {
    return this.valid ? this.values.seconds || 0 : NaN;
  }

  /**
   * Get the milliseconds.
   * @return {number}
   */
  get milliseconds() {
    return this.valid ? this.values.milliseconds || 0 : NaN;
  }

  /**
   * Returns whether the Duration is invalid. Invalid durations are returned by diff operations
   * on invalid DateTimes or Intervals.
   * @return {boolean}
   */
  get isValid() {
    return this.valid;
  }

  /**
   * Equality check
   * Two Durations are equal iff they have the same units and the same values for each unit.
   * @param {Duration} other
   * @return {boolean}
   */
  equals(other) {
    if (!this.valid || !other.valid) {
      return false;
    }

    for (const u of orderedUnits) {
      if (this.values[u] !== other.values[u]) {
        return false;
      }
    }
    return true;
  }
}
