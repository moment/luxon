import { asNumber, isUndefined, isNumber, normalizeObject, roundTo } from "./impl/util";
import Locale from "./impl/locale";
import Formatter from "./impl/formatter";
import { parseISODuration } from "./impl/regexParser";
import { InvalidArgumentError, InvalidUnitError, UnparsableStringError } from "./errors";
import {
  DurationObject,
  DurationOptions,
  DurationToFormatOptions,
  DurationUnit
} from "./types/duration";
import { ConversionAccuracy, ThrowOnInvalid } from "./types/common";

interface NormalizedDurationObject {
  years?: number;
  quarters?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}
type NormalizedDurationUnit = keyof NormalizedDurationObject;

type ConversionMatrixUnit = Exclude<NormalizedDurationUnit, "milliseconds">;
type ConversionMatrix = Readonly<
  { [key in ConversionMatrixUnit]: { [key in NormalizedDurationUnit]?: number } }
>;

// unit conversion constants
const lowOrderMatrix = {
    weeks: {
      days: 7,
      hours: 7 * 24,
      minutes: 7 * 24 * 60,
      seconds: 7 * 24 * 60 * 60,
      milliseconds: 7 * 24 * 60 * 60 * 1000
    },
    days: {
      hours: 24,
      minutes: 24 * 60,
      seconds: 24 * 60 * 60,
      milliseconds: 24 * 60 * 60 * 1000
    },
    hours: { minutes: 60, seconds: 60 * 60, milliseconds: 60 * 60 * 1000 },
    minutes: { seconds: 60, milliseconds: 60 * 1000 },
    seconds: { milliseconds: 1000 }
  },
  casualMatrix: ConversionMatrix = Object.assign(
    {
      years: {
        quarters: 4,
        months: 12,
        weeks: 52,
        days: 365,
        hours: 365 * 24,
        minutes: 365 * 24 * 60,
        seconds: 365 * 24 * 60 * 60,
        milliseconds: 365 * 24 * 60 * 60 * 1000
      },
      quarters: {
        months: 3,
        weeks: 13,
        days: 91,
        hours: 91 * 24,
        minutes: 91 * 24 * 60,
        seconds: 91 * 24 * 60 * 60,
        milliseconds: 91 * 24 * 60 * 60 * 1000
      },
      months: {
        weeks: 4,
        days: 30,
        hours: 30 * 24,
        minutes: 30 * 24 * 60,
        seconds: 30 * 24 * 60 * 60,
        milliseconds: 30 * 24 * 60 * 60 * 1000
      }
    },
    lowOrderMatrix
  ),
  daysInYearAccurate = 146097.0 / 400,
  daysInMonthAccurate = 146097.0 / 4800,
  accurateMatrix: ConversionMatrix = Object.assign(
    {
      years: {
        quarters: 4,
        months: 12,
        weeks: daysInYearAccurate / 7,
        days: daysInYearAccurate,
        hours: daysInYearAccurate * 24,
        minutes: daysInYearAccurate * 24 * 60,
        seconds: daysInYearAccurate * 24 * 60 * 60,
        milliseconds: daysInYearAccurate * 24 * 60 * 60 * 1000
      },
      quarters: {
        months: 3,
        weeks: daysInYearAccurate / 28,
        days: daysInYearAccurate / 4,
        hours: (daysInYearAccurate * 24) / 4,
        minutes: (daysInYearAccurate * 24 * 60) / 4,
        seconds: (daysInYearAccurate * 24 * 60 * 60) / 4,
        milliseconds: (daysInYearAccurate * 24 * 60 * 60 * 1000) / 4
      },
      months: {
        weeks: daysInMonthAccurate / 7,
        days: daysInMonthAccurate,
        hours: daysInMonthAccurate * 24,
        minutes: daysInMonthAccurate * 24 * 60,
        seconds: daysInMonthAccurate * 24 * 60 * 60,
        milliseconds: daysInMonthAccurate * 24 * 60 * 60 * 1000
      }
    },
    lowOrderMatrix
  );

// units ordered by size
const orderedUnits: NormalizedDurationUnit[] = [
  "years",
  "quarters",
  "months",
  "weeks",
  "days",
  "hours",
  "minutes",
  "seconds",
  "milliseconds"
];

const reverseUnits = orderedUnits.slice(0).reverse();

function antiTrunc(n: number) {
  return n < 0 ? Math.floor(n) : Math.ceil(n);
}

// NB: mutates parameters
function convert(
  matrix: ConversionMatrix,
  fromMap: NormalizedDurationObject,
  fromUnit: NormalizedDurationUnit,
  toMap: NormalizedDurationObject,
  toUnit: ConversionMatrixUnit
) {
  const conv = matrix[toUnit][fromUnit] as number,
    raw = (fromMap[fromUnit] as number) / conv,
    sameSign = Math.sign(raw) === Math.sign(toMap[toUnit] as number),
    // ok, so this is wild, but see the matrix in the tests
    added =
      !sameSign && toMap[toUnit] !== 0 && Math.abs(raw) <= 1 ? antiTrunc(raw) : Math.trunc(raw);

  toMap[toUnit] = (toMap[toUnit] as number) + added;
  fromMap[fromUnit] = (fromMap[fromUnit] as number) - added * conv;
}

// NB: mutates vals parameters
function normalizeValues(matrix: ConversionMatrix, vals: NormalizedDurationObject) {
  let previousUnit: NormalizedDurationUnit | undefined;
  reverseUnits.forEach(unit => {
    if (!isUndefined(vals[unit])) {
      if (previousUnit) {
        convert(matrix, vals, previousUnit, vals, unit as ConversionMatrixUnit);
      }
      previousUnit = unit;
    }
  });
}

interface Config {
  conversionAccuracy?: ConversionAccuracy;
  values: NormalizedDurationObject;
  loc: Locale;
}

/**
 * A Duration object represents a period of time, like "2 months" or "1 day, 1 hour". Conceptually, it's just a map of units to their quantities, accompanied by some additional configuration and methods for creating, parsing, interrogating, transforming, and formatting them. They can be used on their own or in conjunction with other Luxon types; for example, you can use {@link DateTime.plus} to add a Duration object to a DateTime, producing another DateTime.
 *
 * Here is a brief overview of commonly used methods and getters in Duration:
 *
 * * **Creation** To create a Duration, use {@link Duration.fromMillis}, {@link Duration.fromObject}, or {@link Duration.fromISO}.
 * * **Unit values** See the {@link Duration#years}, {@link Duration.months}, {@link Duration#weeks}, {@link Duration#days}, {@link Duration#hours}, {@link Duration#minutes}, {@link Duration#seconds}, {@link Duration#milliseconds} accessors.
 * * **Configuration** See  {@link Duration#locale} and {@link Duration#numberingSystem} accessors.
 * * **Transformation** To create new Durations out of old ones use {@link Duration#plus}, {@link Duration#minus}, {@link Duration#normalize}, {@link Duration#set}, {@link Duration#reconfigure}, {@link Duration#shiftTo}, and {@link Duration#negate}.
 * * **Output** To convert the Duration into other representations, see {@link Duration#as}, {@link Duration#toISO}, {@link Duration#toFormat}, and {@link Duration#toJSON}
 *
 * There are more methods documented below. In addition, for more information on subtler topics like internationalization and validity, see the external documentation.
 */
export default class Duration {
  // Private readonly fields
  private values: Readonly<NormalizedDurationObject>;
  private loc: Locale;
  private matrix: ConversionMatrix;
  private readonly isLuxonDuration: true;

  /**
   * @private
   */
  private constructor(config: Config) {
    const accurate = config.conversionAccuracy === "longterm" || false;
    /**
     * @access private
     */
    this.values = config.values;
    /**
     * @access private
     */
    this.loc = config.loc || Locale.create();
    /**
     * @access private
     */
    this.matrix = accurate ? accurateMatrix : casualMatrix;
    /**
     * @access private
     */
    this.isLuxonDuration = true;
  }

  static fromMillis(count: number): Duration;
  static fromMillis(count: number, options: DurationOptions & ThrowOnInvalid): Duration;
  static fromMillis(count: number, options: DurationOptions): Duration | null;
  /**
   * Create Duration from a number of milliseconds.
   * @param {number} count of milliseconds
   * @param {Object} options - options for parsing
   * @param {string} [options.locale='en-US'] - the locale to use
   * @param {string} [options.numberingSystem] - the numbering system to use
   * @param {string} [options.conversionAccuracy='casual'] - the conversion system to use
   * @param {bool} [options.nullOnInvalid=false] - whether to return `null` on error instead of throwing
   * @return {Duration}
   */
  static fromMillis(count: number, options: DurationOptions = {}) {
    return Duration.fromObject({ milliseconds: count }, options);
  }

  static fromObject(obj: DurationObject): Duration;
  static fromObject(obj: DurationObject, options: DurationOptions & ThrowOnInvalid): Duration;
  static fromObject(obj: DurationObject, options: DurationOptions): Duration | null;
  /**
   * Create a Duration from a Javascript object with keys like 'years' and 'hours.
   * If this object is empty then a zero milliseconds duration is returned.
   * @param {Object} obj - the object to create the Duration from
   * @param {number} obj.years
   * @param {number} obj.quarters
   * @param {number} obj.months
   * @param {number} obj.weeks
   * @param {number} obj.days
   * @param {number} obj.hours
   * @param {number} obj.minutes
   * @param {number} obj.seconds
   * @param {number} obj.milliseconds
   * @param {Object} options - options for parsing
   * @param {string} [options.locale='en-US'] - the locale to use
   * @param {string} [options.numberingSystem] - the numbering system to use
   * @param {string} [options.conversionAccuracy='casual'] - the conversion system to use
   * @param {bool} [options.nullOnInvalid=false] - whether to return `null` on error instead of throwing
   * @return {Duration}
   */
  static fromObject(obj: DurationObject, options: DurationOptions = {}) {
    if (obj === undefined || obj === null || typeof obj !== "object") {
      if (options.nullOnInvalid) return null;
      throw new InvalidArgumentError(
        `Duration.fromObject: argument expected to be an object, got ${
          obj === null ? "null" : typeof obj
        }`
      );
    }

    let values;
    try {
      values = normalizeObject(obj as Record<string, number>, Duration.normalizeUnit);
    } catch (error) {
      if (options.nullOnInvalid) return null;
      throw error;
    }

    return new Duration({
      values,
      loc: Locale.fromObject(options),
      conversionAccuracy: options.conversionAccuracy
    });
  }

  static fromISO(text: string): Duration;
  static fromISO(text: string, options: DurationOptions & ThrowOnInvalid): Duration;
  static fromISO(text: string, options: DurationOptions): Duration | null;
  /**
   * Create a Duration from an ISO 8601 duration string.
   * @param {string} text - text to parse
   * @param {Object} options - options for parsing
   * @param {string} [options.locale='en-US'] - the locale to use
   * @param {string} [options.numberingSystem] - the numbering system to use
   * @param {string} [options.conversionAccuracy='casual'] - the conversion system to use
   * @param {bool} [options.nullOnInvalid=false] - whether to return `null` on failed parsing instead of throwing
   * @see https://en.wikipedia.org/wiki/ISO_8601#Durations
   * @example Duration.fromISO('P3Y6M1W4DT12H30M5S').toObject() //=> { years: 3, months: 6, weeks: 1, days: 4, hours: 12, minutes: 30, seconds: 5 }
   * @example Duration.fromISO('PT23H').toObject() //=> { hours: 23 }
   * @example Duration.fromISO('P5Y3M').toObject() //=> { years: 5, months: 3 }
   * @return {Duration}
   */
  static fromISO(text: string, options: DurationOptions = {}) {
    const parsed = parseISODuration(text);
    if (parsed) {
      return Duration.fromObject(parsed, options);
    } else {
      if (options.nullOnInvalid) return null;
      throw new UnparsableStringError("ISO 8601", text);
    }
  }

  /**
   * @private
   */
  static normalizeUnit(unit: string) {
    // TODO should be private
    const pluralMapping: { [key in DurationUnit]: NormalizedDurationUnit } = {
      year: "years",
      years: "years",
      quarter: "quarters",
      quarters: "quarters",
      month: "months",
      months: "months",
      week: "weeks",
      weeks: "weeks",
      day: "days",
      days: "days",
      hour: "hours",
      hours: "hours",
      minute: "minutes",
      minutes: "minutes",
      second: "seconds",
      seconds: "seconds",
      millisecond: "milliseconds",
      milliseconds: "milliseconds"
    };
    const normalized = pluralMapping[(unit ? unit.toLowerCase() : unit) as DurationUnit];

    if (!normalized) throw new InvalidUnitError(unit);

    return normalized;
  }

  /**
   * Check if an object is a Duration. Works across context boundaries
   * @param {Object} o
   * @return {boolean}
   */
  static isDuration(o: unknown): o is Duration {
    return (o && (o as Duration).isLuxonDuration) || false;
  }

  /**
   * Get  the locale of a Duration, such 'en-GB'
   * @type {string}
   */
  get locale() {
    return this.loc.locale;
  }

  /**
   * Get the numbering system of a Duration, such 'beng'. The numbering system is used when formatting the Duration
   *
   * @type {NumberingSystem}
   */
  get numberingSystem() {
    return this.loc.numberingSystem;
  }

  /**
   * Returns a string representation of this Duration formatted according to the specified format string. You may use these tokens:
   * * `S` for milliseconds
   * * `s` for seconds
   * * `m` for minutes
   * * `h` for hours
   * * `d` for days
   * * `M` for months
   * * `y` for years
   * Notes:
   * * Add padding by repeating the token, e.g. "yy" pads the years to two digits, "hhhh" pads the hours out to four digits
   * * The duration will be converted to the set of units in the format string using {@link Duration.shiftTo} and the Durations's conversion accuracy setting.
   * @param {string} format - the format string
   * @param {Object} options - options
   * @param {boolean} [options.floor=true] - whether to floor numerical values or not
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("y d s") //=> "1 6 2"
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("yy dd sss") //=> "01 06 002"
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("M S") //=> "12 518402000"
   * @return {string}
   */
  toFormat(format: string, options: DurationToFormatOptions = { floor: true }) {
    return Formatter.create(this.loc, options).formatDurationFromString(this, format);
  }

  /**
   * Returns a Javascript object with this Duration's values.
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toObject() //=> { years: 1, days: 6, seconds: 2 }
   * @return {Object}
   */
  toObject(): DurationObject {
    return Object.assign({}, this.values);
  }

  /**
   * Returns an ISO 8601-compliant string representation of this Duration.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Durations
   * @example Duration.fromObject({ years: 3, seconds: 45 }).toISO() //=> 'P3YT45S'
   * @example Duration.fromObject({ months: 4, seconds: 45 }).toISO() //=> 'P4MT45S'
   * @example Duration.fromObject({ months: 5 }).toISO() //=> 'P5M'
   * @example Duration.fromObject({ minutes: 5 }).toISO() //=> 'PT5M'
   * @example Duration.fromObject({ milliseconds: 6 }).toISO() //=> 'PT0.006S'
   * @return {string}
   */
  toISO() {
    // we could use the formatter, but this is an easier way to get the minimum string
    let s = "P";
    if (this.years !== 0) s += this.years + "Y";
    if (this.months !== 0 || this.quarters !== 0) s += this.months + this.quarters * 3 + "M";
    if (this.weeks !== 0) s += this.weeks + "W";
    if (this.days !== 0) s += this.days + "D";
    if (this.hours !== 0 || this.minutes !== 0 || this.seconds !== 0 || this.milliseconds !== 0)
      s += "T";
    if (this.hours !== 0) s += this.hours + "H";
    if (this.minutes !== 0) s += this.minutes + "M";
    if (this.seconds !== 0 || this.milliseconds !== 0)
      // this will handle "floating point madness" by removing extra decimal places
      // https://stackoverflow.com/questions/588004/is-floating-point-math-broken
      s += roundTo(this.seconds + this.milliseconds / 1000, 3) + "S";
    if (s === "P") s += "T0S";
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
   * Returns an ISO 8601 representation of this Duration appropriate for use in debugging.
   * @return {string}
   */
  toString() {
    return this.toISO();
  }

  /**
   * Returns an milliseconds value of this Duration.
   * @return {number}
   */
  valueOf() {
    return this.as("milliseconds");
  }

  /**
   * Make this Duration longer by the specified amount. Return a newly-constructed Duration.
   * @param {Duration|Object} duration - The amount to add. Either a Luxon Duration or the object argument to Duration.fromObject()
   * @return {Duration}
   */
  plus(duration: DurationLike) {
    const dur = friendlyDuration(duration),
      result: NormalizedDurationObject = {};

    orderedUnits.forEach(unit => {
      if (dur.values[unit] !== undefined || this.values[unit] !== undefined) {
        result[unit] = dur.get(unit) + this.get(unit);
      }
    });

    return this.clone(result);
  }

  /**
   * Make this Duration shorter by the specified amount. Return a newly-constructed Duration.
   * @param {Duration|Object} duration - The amount to subtract. Either a Luxon Duration or the object argument to Duration.fromObject()
   * @return {Duration}
   */
  minus(duration: DurationLike) {
    const dur = friendlyDuration(duration);
    return this.plus(dur.negate());
  }

  /**
   * Scale this Duration by the specified amount. Return a newly-constructed Duration.
   * @param {function} fn - The function to apply to each unit. Arity is 1 or 2: the value of the unit and, optionally, the unit name. Must return a number.
   * @example Duration.fromObject({ hours: 1, minutes: 30 }).mapUnit(x => x * 2) //=> { hours: 2, minutes: 60 }
   * @example Duration.fromObject({ hours: 1, minutes: 30 }).mapUnit((x, u) => u === "hour" ? x * 2 : x) //=> { hours: 2, minutes: 30 }
   * @return {Duration}
   */
  mapUnits(fn: (x: number, unit: DurationUnit) => number) {
    const result: NormalizedDurationObject = {};
    for (const k in this.values) {
      const unit = k as NormalizedDurationUnit;
      result[unit] = asNumber(fn(this.values[unit] as number, unit));
    }
    return this.clone(result);
  }

  /**
   * Get the value of unit.
   * @param {string} unit - a unit such as 'minute' or 'day'
   * @example Duration.fromObject({years: 2, days: 3}).years //=> 2
   * @example Duration.fromObject({years: 2, days: 3}).months //=> 0
   * @example Duration.fromObject({years: 2, days: 3}).days //=> 3
   * @return {number}
   */
  get(unit: DurationUnit) {
    return this[Duration.normalizeUnit(unit)];
  }

  /**
   * "Set" the values of specified units. Non-specified units stay unchanged. Return a newly-constructed Duration.
   * @param {Object} values - a mapping of units to numbers
   * @example dur.set({ years: 2017 })
   * @example dur.set({ hours: 8, minutes: 30 })
   * @return {Duration}
   */
  set(values: DurationObject) {
    const mixed = Object.assign(
      this.values,
      normalizeObject(values as Record<string, number>, Duration.normalizeUnit)
    );
    return this.clone(mixed, false /* do not clean, merge with existing */);
  }

  /**
   * "Set" the locale and/or numberingSystem and/or conversionAccuracy. Returns a newly-constructed Duration.
   * @example dur.reconfigure({ locale: 'en-GB' })
   * @return {Duration}
   */
  reconfigure({ locale, numberingSystem, conversionAccuracy }: DurationOptions = {}) {
    const conf = {
      values: this.values,
      loc: this.loc.clone({ locale, numberingSystem }),
      conversionAccuracy: conversionAccuracy || this.conversionAccuracy()
    };
    return new Duration(conf);
  }

  /**
   * Return the length of the duration in the specified unit.
   * @param {string} unit - a unit such as 'minutes' or 'days'
   * @example Duration.fromObject({years: 1}).as('days') //=> 365
   * @example Duration.fromObject({years: 1}).as('months') //=> 12
   * @example Duration.fromObject({hours: 60}).as('days') //=> 2.5
   * @return {number}
   */
  as(unit: DurationUnit) {
    return this.shiftTo(unit).get(unit);
  }

  /**
   * Reduce this Duration to its canonical representation in its current units.
   * @example Duration.fromObject({ years: 2, days: 5000 }).normalize().toObject() //=> { years: 15, days: 255 }
   * @example Duration.fromObject({ hours: 12, minutes: -45 }).normalize().toObject() //=> { hours: 11, minutes: 15 }
   * @return {Duration}
   */
  normalize() {
    // todo - this should keep the options...
    const vals = this.toObject();
    normalizeValues(this.matrix, vals);
    return this.clone(vals);
  }

  /**
   * Convert this Duration into its representation in a different set of units.
   * @example Duration.fromObject({ hours: 1, seconds: 30 }).shiftTo('minutes', 'milliseconds').toObject() //=> { minutes: 60, milliseconds: 30000 }
   * @return {Duration}
   */
  shiftTo(...units: DurationUnit[]) {
    const normalizedUnits = units.map(u => Duration.normalizeUnit(u));

    if (normalizedUnits.length === 0) {
      return this;
    }

    const built: NormalizedDurationObject = {},
      accumulated: NormalizedDurationObject = {},
      vals = this.toObject();
    let lastUnit: NormalizedDurationUnit | undefined = undefined;

    for (const k of orderedUnits) {
      if (normalizedUnits.indexOf(k) >= 0) {
        lastUnit = k;

        let own = 0;

        // anything we haven't boiled down yet should get boiled to this unit
        for (const acc in accumulated) {
          const unit = acc as ConversionMatrixUnit;
          own += (this.matrix[unit][k] as number) * (accumulated[unit] as number);
          delete accumulated[unit];
        }

        // plus anything that's already in this unit
        const unitValue = vals[k];
        if (isNumber(unitValue)) own += unitValue;

        const i = Math.trunc(own);
        built[k] = i;
        accumulated[k] = own - i; // we'd like to absorb these fractions in another unit

        // plus anything further down the chain that should be rolled up in to this
        for (const down in vals) {
          if (orderedUnits.indexOf(down as NormalizedDurationUnit) > orderedUnits.indexOf(k)) {
            convert(
              this.matrix,
              vals,
              down as NormalizedDurationUnit,
              built,
              k as ConversionMatrixUnit // never happens when k is milliseconds
            );
          }
        }
        // otherwise, keep it in the wings to boil it later
      } else if (isNumber(vals[k])) {
        accumulated[k] = vals[k];
      }
    }

    // anything leftover becomes the decimal for the last unit
    // lastUnit is defined here since units is not empty
    for (const key in accumulated) {
      const unit = key as NormalizedDurationUnit;
      const acc = accumulated[unit];
      if (acc !== undefined) {
        built[lastUnit as NormalizedDurationUnit] =
          (built[lastUnit as NormalizedDurationUnit] as number) +
          (key === lastUnit
            ? (accumulated[key] as number)
            : // lastUnit could be 'milliseconds' but so would then be the unique key in accumulated
              // Cast to ConversionMatrixUnit is hence safe here
              acc / (this.matrix[lastUnit as ConversionMatrixUnit][unit] as number));
      }
    }

    return this.clone(built).normalize();
  }

  /**
   * Return the negative of this Duration.
   * @example Duration.fromObject({ hours: 1, seconds: 30 }).negate().toObject() //=> { hours: -1, seconds: -30 }
   * @return {Duration}
   */
  negate() {
    const negated: NormalizedDurationObject = {};
    for (const k in this.values) {
      const unit = k as NormalizedDurationUnit;
      negated[unit] = -(this.values[unit] as number);
    }
    return this.clone(negated);
  }

  /**
   * Get the years.
   * @type {number}
   */
  get years() {
    return this.values.years || 0;
  }

  /**
   * Get the quarters.
   * @type {number}
   */
  get quarters() {
    return this.values.quarters || 0;
  }

  /**
   * Get the months.
   * @type {number}
   */
  get months() {
    return this.values.months || 0;
  }

  /**
   * Get the weeks
   * @type {number}
   */
  get weeks() {
    return this.values.weeks || 0;
  }

  /**
   * Get the days.
   * @type {number}
   */
  get days() {
    return this.values.days || 0;
  }

  /**
   * Get the hours.
   * @type {number}
   */
  get hours() {
    return this.values.hours || 0;
  }

  /**
   * Get the minutes.
   * @type {number}
   */
  get minutes() {
    return this.values.minutes || 0;
  }

  /**
   * Get the seconds.
   * @return {number}
   */
  get seconds() {
    return this.values.seconds || 0;
  }

  /**
   * Get the milliseconds.
   * @return {number}
   */
  get milliseconds() {
    return this.values.milliseconds || 0;
  }

  /**
   * Equality check
   * Two Durations are equal iff they have the same units and the same values for each unit.
   * @param {Duration} other
   * @return {boolean}
   */
  equals(other: Duration) {
    if (!this.loc.equals(other.loc)) {
      return false;
    }

    for (const u of orderedUnits) {
      if (this.values[u] !== other.values[u]) {
        return false;
      }
    }

    return true;
  }

  /**
   * @private
   */
  // clone really means "create another instance just like this one, but with these changes"
  private clone(values: NormalizedDurationObject, clear = true) {
    // deep merge for vals
    const conf = {
      values: clear ? values : Object.assign({}, this.values, values),
      loc: this.loc,
      conversionAccuracy: this.conversionAccuracy()
    };
    return new Duration(conf);
  }

  /**
   * @private
   */
  private conversionAccuracy(): ConversionAccuracy {
    return this.matrix === accurateMatrix ? "longterm" : "casual";
  }
}

export type DurationLike = Duration | DurationObject;
/**
 * @private
 */
export function friendlyDuration(duration: DurationLike | unknown) {
  if (Duration.isDuration(duration)) return duration;

  if (typeof duration === "object" && duration !== null) return Duration.fromObject(duration);

  throw new InvalidArgumentError(
    `Unknown duration argument ${duration} of type ${typeof duration}`
  );
}
