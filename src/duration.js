import { Util } from './impl/util';
import { Locale } from './impl/locale';
import { Formatter } from './impl/formatter';
import { RegexParser } from './impl/regexParser';

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
  weeks: { days: 7, hours: 7 * 24, minutes: 7 * 24 * 60, seconds: 7 * 24 * 60 * 60, milliseconds: 7 * 24 * 60 * 60 * 1000 },
  days: { hours: 24, minutes: 24 * 60, seconds: 24 * 60 * 60, milliseconds: 24 * 60 * 60 * 1000 },
  hours: { minutes: 60, seconds: 60 * 60, milliseconds: 60 * 60 * 1000 },
  minutes: { seconds: 60, milliseconds: 60 * 1000 },
  seconds: { milliseconds: 1000 }
};

const orderedUnits = ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds', 'milliseconds'];

function clone(dur, alts) {
  // deep merge for vals
  const conf = {};
  conf.values = Object.assign(dur.values, alts.values);
  if (alts.loc) {
    conf.loc = alts.loc;
  }
  return new Duration(conf);
}

/**
 * An amount of time.
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
   * Create an invalid Duration.
   * @return {Duration}
   */
  static invalid() {
    return new Duration({ valid: false });
  }

  /**
   * Create Duration from number and a unit.
   * @param {number} count
   * @param {string} [unit='milliseconds'] - a unit such as 'minutes' or 'days'
   * @return {Duration}
   */
  static fromLength(count, unit = 'milliseconds') {
    const realUnit = Duration.normalizeUnit(unit);
    return Duration.fromObject({ [realUnit]: count });
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

    if (!normalized) throw new Error(`Invalid unit ${unit}`);

    return normalized;
  }

  /**
   * Get or "set" the locale of a Duration, such 'en-UK'. The locale is used when formatting the Duration.
   * @param {string} localeCode - the locale to set. If omitted, the method operates as a getter. If the locale is not supported, the best alternative is selected
   * @return {string|Duration} - If a localeCode is provided, returns a new DateTime with the new locale. If not, returns the localeCode (a string) of the DateTime
   */
  locale(localeCode) {
    return Util.isUndefined(localeCode)
      ? this.loc
      : clone(this, { loc: Locale.create(localeCode) });
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
    return Formatter.create(this.loc, opts).formatDurationFromString(this, fmt);
  }

  /**
   * Returns a Javascript object with this Duration's values.
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toObject() //=> { years: 1, days: 6, seconds: 2 }
   * @return {object}
   */
  toObject() {
    return Object.assign({}, this.values);
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
    let s = 'P';
    if (this.years() > 0) s += this.years() + 'Y';
    if (this.months() > 0) s += this.months() + 'M';
    if (this.days() > 0 || this.weeks() > 0) s += this.days() + this.weeks() * 7 + 'D';
    if (this.hours() > 0 || this.minutes() > 0 || this.seconds() > 0 || this.milliseconds() > 0)
      s += 'T';
    if (this.hours() > 0) s += this.hours() + 'H';
    if (this.minutes() > 0) s += this.minutes() + 'M';
    if (this.seconds() > 0) s += this.seconds() + 'S';
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
   * @param {Duration|number} durationOrNumber - The amount to add. Either a Luxon Duration or a number.
   * @param {string} [unit='milliseconds'] - The unit to add. Only applicable if the first argument is a number. Can be 'years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds', or 'milliseconds'.
   * @return {Duration}
   */
  plus(durationOrNumber, unit = 'millisecond') {
    const dur = Util.friendlyDuration(durationOrNumber, unit), result = {};

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
   * @param {Duration|number} durationOrNumber - The amount to subtract. Either a Luxon Duration or a number.
   * @param {string} [unit='milliseconds'] - The unit to subtract. Only applicable if the first argument is a number. Can be 'years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds', or 'milliseconds'.
   * @return {Duration}
   */
  minus(durationOrNumber, unit = 'milliseconds') {
    const dur = Util.friendlyDuration(durationOrNumber, unit);
    return this.plus(dur.negate());
  }

  /**
   * Get the value of unit.
   * @param {string} unit - a unit such as 'minute' or 'day'
   * @example Duration.fromObject({years: 2, days: 3}).years() //=> 2
   * @example Duration.fromObject({years: 2, days: 3}).months() //=> 0
   * @example Duration.fromObject({years: 2, days: 3}).days() //=> 3
   * @return {number}
   */
  get(unit) {
    return this[Duration.normalizeUnit(unit)]();
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
   * Return the length of the duration in the specified unit.
   * @param {string} unit - a unit such as 'minutes' or 'days'
   * @example Duration.fromObject({years: 1}).as('days') //=> 365
   * @example Duration.fromObject({years: 1}).as('months') //=> 12
   * @example Duration.fromObject({hours: 60}).as('days') //=> 2.5
   * @return {number}
   */
  as(unit) {
    return this.shiftTo(unit).get(unit);
  }

  /**
   * Reduce this Duration to its canonical representation in its current units.
   * @example Duration.fromObject({ years: 2, days: 5000 }).normalize().toObject() //=> { years: 15, days: 255 }
   * @example Duration.fromObject({ hours: 12, minutes: -45 }).normalize().toObject() //=> { hours: 11, minutes: 15 }
   * @return {Duration}
   */
  normalize() {
    return this.shiftTo(...Object.keys(this.values));
  }

  /**
   * Convert this Duration into its representation in a different set of units.
   * @example Duration.fromObject({ hours: 1, seconds: 30 }).shiftTo('minutes', 'milliseconds').toObject() //=> { minutes: 60, milliseconds: 30000 }
   * @return {Duration}
   */
  shiftTo(...units) {
    if (units.length === 0) {
      return this;
    }

    units = units.map(Duration.normalizeUnit);

    const built = {}, accumulated = {}, vals = this.toObject();
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
            const conv = matrix[k][down], added = Math.floor(vals[down] / conv);
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
    const negated = {};
    for (const k of Object.keys(this.values)) {
      negated[k] = -this.values[k];
    }
    return Duration.fromObject(negated);
  }

  /**
   * Get or "set" the years.
   * @param {number} years - the years to set. If omitted, `years()` acts as a getter for the years.
   * @return {number|Duration}
   */
  years(years) {
    return Util.isUndefined(years) ? this.values.years || 0 : this.set({ years });
  }

  /**
   * Get or "set" the months.
   * @param {number} months - the months to set. If omitted, `months()` acts as a getter for the months.
   * @return {number|Duration}
   */
  months(months) {
    return Util.isUndefined(months) ? this.values.months || 0 : this.set({ months });
  }

  /**
   * Get or "set" the weeks
   * @param {number} weeks - the weeks to set. If omitted, `weeks()` acts as a getter for the days.
   * @return {number|Duration}
   */
  weeks(weeks) {
    return Util.isUndefined(weeks) ? this.values.weeks || 0 : this.set({ weeks });
  }

  /**
   * Get or "set" the days.
   * @param {number} days - the days to set. If omitted, `days()` acts as a getter for the days.
   * @return {number|Duration}
   */
  days(days) {
    return Util.isUndefined(days) ? this.values.days || 0 : this.set({ days });
  }

  /**
   * Get or "set" the hours.
   * @param {number} hours - the hours to set. If omitted, `hours()` acts as a getter for the hours.
   * @return {number|Duration}
   */
  hours(hours) {
    return Util.isUndefined(hours) ? this.values.hours || 0 : this.set({ hours });
  }

  /**
   * Get or "set" the minutes.
   * @param {number} minutes - the minutes to set. If omitted, `minutes()` acts as a getter for the minutes.
   * @return {number|Duration}
   */
  minutes(minutes) {
    return Util.isUndefined(minutes) ? this.values.minutes || 0 : this.set({ minutes });
  }

  /**
   * Get or "set" the seconds.
   * @param {number} seconds - the seconds to set. If omitted, `seconds()` acts as a getter for the seconds.
   * @return {number|Duration}
   */
  seconds(seconds) {
    return Util.isUndefined(seconds) ? this.values.seconds || 0 : this.set({ seconds });
  }

  /**
   * Get or "set" the milliseconds.
   * @param {number} milliseconds - the milliseconds to set. If omitted, `milliseconds()` acts as a getter for the milliseconds.
   * @return {number|Duration}
   */
  milliseconds(milliseconds) {
    return Util.isUndefined(milliseconds)
      ? this.values.milliseconds || 0
      : this.set({ milliseconds });
  }

  /**
   * Equality check
   * Two Durations are equal iff they have the same units and the same values for each unit.
   * @param {Duration} other
   * @return {boolean}
   */
  equals(other) {
    for (const u of orderedUnits) {
      if (this.values[u] !== other.values[u]) {
        return false;
      }
    }
    return true;
  }
}
