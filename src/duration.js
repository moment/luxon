import { Util } from './impl/util';
import { Locale } from './impl/locale';
import { Formatter } from './impl/formatter';
import { RegexParser } from './impl/regexParser';

const matrix = {
  year: {
    month: 12,
    day: 365,
    hour: 365 * 24,
    minute: 365 * 24 * 60,
    second: 365 * 24 * 60 * 60,
    millisecond: 365 * 24 * 60 * 60 * 1000
  },
  month: {
    day: 30,
    hour: 30 * 24,
    minute: 30 * 24 * 60,
    second: 30 * 24 * 60 * 60,
    millisecond: 30 * 24 * 60 * 60 * 1000
  },
  day: { hour: 24, minute: 24 * 60, second: 24 * 60 * 60, millisecond: 24 * 60 * 60 * 1000 },
  hour: { minute: 60, second: 60 * 60, millisecond: 60 * 60 * 1000 },
  minute: { second: 60, millisecond: 60 * 1000 },
  second: { millisecond: 1000 }
};

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
  constructor(config) {
    this.values = config.values;
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
    const realUnit = Util.normalizeUnit(unit);
    return Duration.fromObject({ [realUnit]: count });
  }

  /**
   * Create an DateTime from a Javascript object with keys like 'years' and 'hours'.
   * @param {Object} obj - the object to create the DateTime from
   * @param {number} obj.years
   * @param {number} obj.months
   * @param {number} obj.days
   * @param {number} obj.hours
   * @param {number} obj.minutes
   * @param {number} obj.seconds
   * @param {number} obj.milliseconds
   * @return {Duration}
   */
  static fromObject(obj) {
    return new Duration({ values: Util.normalizeObject(obj) });
  }

  /**
   * Create a DateTime from an ISO 8601 duration string.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Durations
   * @example Duration.fromISO('P3Y6M4DT12H30M5S').toObject() //=> { year: 3, month: 6, day: 4, hour: 12, minute: 30, second: 5 }
   * @example Duration.fromISO('PT23H').toObject() //=> { hour: 23 }
   > Duration.fromISO('P5Y3M').toObject() //=> { year: 5, month: 3 }
   * @return {Duration}
   */
  static fromISO(text) {
    const vals = RegexParser.parseISODuration(text);
    return Duration.fromObject(vals);
  }

  /**
   * Get or "set" the locale of a Duration, such 'en-UK'. The locale is used when formatting the Duration.
   * @param {string} localeCode - the locale to set. If omitted, the method operates as a getter. If the locale is not supported, the best alternative is selected
   * @return {string|Duration} - If a localeCode is provided, returns a new DateTime with the new locale. If not, returns the localeCode (a string) of the DateTime
   */
  locale(localeCode) {
    return Util.isUndefined(localeCode) ? this.loc : clone(this, { loc: Locale.create(localeCode) });
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
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toObject() //=> { year: 1, day: 6, second: 2 }
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
    if (this.days() > 0) s += this.days() + 'D';
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
   * @param {string} [unit='millisecond'] - The unit to add. Only applicable if the first argument is a number. Can be 'years', 'months', 'days', 'hours', 'minutes', 'seconds', or 'milliseconds'.
   * @return {Duration}
   */
  plus(durationOrNumber, unit = 'millisecond') {
    const dur = Util.friendlyDuration(durationOrNumber, unit), result = {};

    for (const k of Util.orderedUnits) {
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
   * @param {string} [unit='millisecond'] - The unit to subtract. Only applicable if the first argument is a number. Can be 'years', 'months', 'days', 'hours', 'minutes', 'seconds', or 'milliseconds'.
   * @return {Duration}
   */
  minus(durationOrNumber, unit = 'millisecond') {
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
    const accessor = `${Util.normalizeUnit(unit)}s`;
    return this[accessor]();
  }

  /**
   * "Set" the values of specified units. Return a newly-constructed Duration.
   * @param {object} values - a mapping of units to numbers
   * @example dur.set({ years: 2017 })
   * @example dur.set({ hours: 8, minutes: 30 })
   * @return {Duration}
   */
  set(values) {
    const mixed = Object.assign(this.values, Util.normalizeObject(values));
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
   * @example Duration.fromObject({ years: 2, days: 5000 }).normalize().toObject() //=> { year: 15, day: 255 }
   * @example Duration.fromObject({ hours: 12, minutes: -45 }).normalize().toObject() //=> { hour: 11, minute: 15 }
   * @return {Duration}
   */
  normalize() {
    return this.shiftTo(...Object.keys(this.values));
  }

  /**
   * Convert this Duration into its representation in a different set of units.
   * @example Duration.fromObject({ hours: 1, seconds: 30 }).shiftTo('minutes', 'milliseconds').toObject() //=> { minute: 60, millisecond: 30000 }
   * @return {Duration}
   */
  shiftTo(...units) {
    if (units.length === 0) {
      return this;
    }

    units = units.map(Util.normalizeUnit);

    const built = {}, accumulated = {}, vals = this.toObject();
    let lastUnit;

    for (const k of Util.orderedUnits) {
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
          if (Util.orderedUnits.indexOf(down) > Util.orderedUnits.indexOf(k)) {
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
   * @example Duration.fromObject({ hours: 1, seconds: 30 }).negate().toObject() //=> { hour: -1, second: -30 }
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
   * Get or "set" the day of the years.
   * @param {number} years - the day to set. If omitted, `years()` acts as a getter for the years.
   * @return {number|Duration}
   */
  years(years) {
    return Util.isUndefined(months) ? this.values.year || 0 : this.set({ years });
  }

  /**
   * Get or "set" the day of the months.
   * @param {number} months - the day to set. If omitted, `months()` acts as a getter for the months.
   * @return {number|Duration}
   */
  months(months) {
    return Util.isUndefined(months) ? this.values.month || 0 : this.set({ months });
  }

  /**
   * Get or "set" the day of the days.
   * @param {number} days - the day to set. If omitted, `days()` acts as a getter for the days.
   * @return {number|Duration}
   */
  days(days) {
    return Util.isUndefined(days) ? this.values.day || 0 : this.set({ days });
  }

  /**
   * Get or "set" the day of the hours.
   * @param {number} hours - the day to set. If omitted, `hours()` acts as a getter for the hours.
   * @return {number|Duration}
   */
  hours(hours) {
    return Util.isUndefined(hours) ? this.values.hour || 0 : this.set({ hour });
  }

  /**
   * Get or "set" the day of the minutes.
   * @param {number} minutes - the day to set. If omitted, `minutes()` acts as a getter for the minutes.
   * @return {number|Duration}
   */
  minutes(minutes) {
    return Util.isUndefined(minutes) ? this.values.minute || 0 : this.set({ minutes });
  }

  /**
   * Get or "set" the day of the seconds.
   * @param {number} seconds - the day to set. If omitted, `seconds()` acts as a getter for the seconds.
   * @return {number|Duration}
   */
  seconds(seconds) {
    return Util.isUndefined(seconds) ? this.values.second || 0 : this.set({ seconds });
  }

  /**
   * Get or "set" the day of the milliseconds.
   * @param {number} milliseconds - the day to set. If omitted, `milliseconds()` acts as a getter for the milliseconds.
   * @return {number|Duration}
   */
  milliseconds(milliseconds) {
    return Util.isUndefined(milliseconds) ? this.values.millisecond || 0 : this.set({ milliseconds });
  }

  /**
   * Equality check
   * Two Durations are equal iff they have the same units and the same values for each unit.
   * @param {Duration} other
   * @return {boolean}
   */
  equals(other) {
    for (const u of Util.orderedUnits) {
      if (this.values[u] !== other.values[u]) {
        return false;
      }
    }
    return true;
  }
}
