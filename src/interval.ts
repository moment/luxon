import DateTime, { DateTimeLike } from "./datetime";
import Duration, { friendlyDuration, DurationLike } from "./duration";
import { InvalidArgumentError, UnparsableStringError } from "./errors";
import { ToISOTimeOptions, DateTimeWithZoneOptions } from "./types/datetime";
import { DurationUnit, DurationOptions } from "./types/duration";
import { IntervalObject } from "./types/interval";
import { ThrowOnInvalid } from "./types/common";

// checks if the start is equal to or before the end
function validateStartEnd(start: DateTime | null, end: DateTime | null) {
  if (!DateTime.isDateTime(start)) {
    throw new InvalidArgumentError("Must pass a DateTime as the start");
  } else if (!DateTime.isDateTime(end)) {
    throw new InvalidArgumentError("Must pass a DateTime as the end");
  } else if (end < start) {
    throw new InvalidArgumentError(
      `The end of an interval must be after its start, but you had start=${start.toISO()} and end=${end.toISO()}`
    );
  }
}

function friendlyDateTime(dateTimeish: DateTimeLike) {
  if (DateTime.isDateTime(dateTimeish)) {
    return dateTimeish;
  } else if (dateTimeish instanceof Date) {
    return DateTime.fromJSDate(dateTimeish);
  } else if (typeof dateTimeish === "object" && dateTimeish) {
    return DateTime.fromObject(dateTimeish);
  }

  throw new InvalidArgumentError(
    `Unknown datetime argument: ${dateTimeish}, of type ${typeof dateTimeish}`
  );
}

interface Config {
  start: DateTime | null;
  end: DateTime | null;
}

/**
 * An Interval object represents a half-open interval of time, where each endpoint is a {@link DateTime}. Conceptually, it's a container for those two endpoints, accompanied by methods for creating, parsing, interrogating, comparing, transforming, and formatting them.
 *
 * Here is a brief overview of the most commonly used methods and getters in Interval:
 *
 * * **Creation** To create an Interval, use {@link Interval.fromDateTimes}, {@link Interval.after}, {@link Interval.before}, or {@link Interval.fromISO}.
 * * **Accessors** Use {@link Interval#start} and {@link Interval#end} to get the start and end.
 * * **Interrogation** To analyze the Interval, use {@link Interval#count}, {@link Interval#length}, {@link Interval#hasSame}, {@link Interval#contains}, {@link Interval#isAfter}, or {@link Interval#isBefore}.
 * * **Transformation** To create other Intervals out of this one, use {@link Interval#set}, {@link Interval#splitAt}, {@link Interval#splitBy}, {@link Interval#divideEqually}, {@link Interval#merge}, {@link Interval#xor}, {@link Interval#union}, {@link Interval#intersection}, or {@link Interval#difference}.
 * * **Comparison** To compare this Interval to another one, use {@link Interval#equals}, {@link Interval#overlaps}, {@link Interval#abutsStart}, {@link Interval#abutsEnd}, {@link Interval#engulfs}.
 * * **Output** To convert the Interval into other representations, see {@link Interval#toString}, {@link Interval#toISO}, {@link Interval#toISODate}, {@link Interval#toISOTime}, {@link Interval#toFormat}, and {@link Interval#toDuration}.
 */
export default class Interval {
  // Private readonly fields
  private s: DateTime;
  private e: DateTime;
  private readonly isLuxonInterval: true;

  /**
   * @private
   */
  private constructor(config: Config) {
    validateStartEnd(config.start, config.end);

    /**
     * @access private
     */
    this.s = config.start as DateTime;
    /**
     * @access private
     */
    this.e = config.end as DateTime;
    /**
     * @access private
     */
    this.isLuxonInterval = true;
  }

  /**
   * Create an Interval from a start DateTime and an end DateTime. Inclusive of the start but not the end.
   * @param {DateTime|Date|Object} start
   * @param {DateTime|Date|Object} end
   * @return {Interval}
   */
  static fromDateTimes(start: DateTimeLike, end: DateTimeLike) {
    const builtStart = friendlyDateTime(start),
      builtEnd = friendlyDateTime(end);

    return new Interval({
      start: builtStart,
      end: builtEnd
    });
  }

  /**
   * Create an Interval from a start DateTime and a Duration to extend to.
   * @param {DateTime|Date|Object} start
   * @param {Duration|Object} duration - the length of the Interval, as a Duration object.
   * @return {Interval}
   */
  static after(start: DateTimeLike, duration: DurationLike) {
    const dur = friendlyDuration(duration),
      dt = friendlyDateTime(start);

    return new Interval({
      start: dt,
      end: dt ? dt.plus(dur) : null
    });
  }

  /**
   * Create an Interval from an end DateTime and a Duration to extend backwards to.
   * @param {DateTime|Date|Object} end
   * @param {Duration|Object} duration - the length of the Interval, as a Duration object.
   * @return {Interval}
   */
  static before(end: DateTimeLike, duration: DurationLike) {
    const dur = friendlyDuration(duration),
      dt = friendlyDateTime(end);

    return new Interval({
      start: dt ? dt.minus(dur) : null,
      end: dt
    });
  }

  /**
   * Create an Interval from an ISO 8601 string.
   * Accepts `<start>/<end>`, `<start>/<duration>`, and `<duration>/<end>` formats.
   * @param {string} text - the ISO string to parse
   * @param {Object} [options] - options to pass {@link DateTime.fromISO} and optionally {@link Duration.fromISO}
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @return {Interval}
   */
  static fromISO(text: string, options: DateTimeWithZoneOptions = {}) {
    const [s, e] = (text || "").split("/", 2);
    const nullOnInvalidOpts = Object.assign({}, options, { nullOnInvalid: true });
    if (s && e) {
      const start = DateTime.fromISO(s, nullOnInvalidOpts);
      const end = DateTime.fromISO(e, nullOnInvalidOpts);

      if (start !== null && end !== null) {
        return Interval.fromDateTimes(start, end);
      }

      if (start !== null) {
        const dur = Duration.fromISO(e, nullOnInvalidOpts);
        if (dur !== null) {
          return Interval.after(start, dur);
        }
      } else if (end !== null) {
        const dur = Duration.fromISO(s, nullOnInvalidOpts);
        if (dur !== null) {
          return Interval.before(end, dur);
        }
      }
    }
    throw new UnparsableStringError("ISO 8601", text);
  }

  /**
   * Check if an object is an Interval. Works across context boundaries
   * @param {Object} o
   * @return {boolean}
   */
  static isInterval(o: unknown): o is Interval {
    return (o && (o as Interval).isLuxonInterval) || false;
  }

  /**
   * Returns the start of the Interval
   * @type {DateTime}
   */
  get start() {
    return this.s;
  }

  /**
   * Returns the end of the Interval
   * @type {DateTime}
   */
  get end() {
    return this.e;
  }

  /**
   * Returns the length of the Interval in the specified unit.
   * @param {string} [unit='milliseconds'] - the unit (such as 'hours' or 'days') to return the length in.
   * @return {number}
   */
  length(unit: DurationUnit = "milliseconds") {
    return this.toDuration(unit).get(unit);
  }

  /**
   * Returns the count of minutes, hours, days, months, or years included in the Interval, even in part.
   * Unlike {@link Interval#length} this counts sections of the calendar, not periods of time, e.g. specifying 'day'
   * asks 'what dates are included in this interval?', not 'how many days long is this interval?'
   * @param {string} [unit='milliseconds'] - the unit of time to count.
   * @return {number}
   */
  count(unit: DurationUnit = "milliseconds") {
    const start = this.start.startOf(unit),
      end = this.end.startOf(unit);
    return Math.floor(end.diff(start, unit).get(unit)) + 1;
  }

  /**
   * Returns whether this Interval's start and end are both in the same unit of time
   * @param {string} unit - the unit of time to check sameness on
   * @return {boolean}
   */
  hasSame(unit: DurationUnit) {
    return this.isEmpty() || this.e.minus({ milliseconds: 1 }).hasSame(this.s, unit);
  }

  /**
   * Return whether this Interval has the same start and end DateTimes.
   * @return {boolean}
   */
  isEmpty() {
    return this.s.valueOf() === this.e.valueOf();
  }

  /**
   * Return whether this Interval's start is after the specified DateTime.
   * @param {DateTime} dateTime
   * @return {boolean}
   */
  isAfter(dateTime: DateTime) {
    return this.s > dateTime;
  }

  /**
   * Return whether this Interval's end is before the specified DateTime.
   * @param {DateTime} dateTime
   * @return {boolean}
   */
  isBefore(dateTime: DateTime) {
    return this.e <= dateTime;
  }

  /**
   * Return whether this Interval contains the specified DateTime.
   * @param {DateTime} dateTime
   * @return {boolean}
   */
  contains(dateTime: DateTime) {
    return this.s <= dateTime && this.e > dateTime;
  }

  /**
   * "Sets" the start and/or end dates. Returns a newly-constructed Interval.
   * @param {Object} values - the values to set
   * @param {DateTime} values.start - the starting DateTime
   * @param {DateTime} values.end - the ending DateTime
   * @return {Interval}
   */
  set({ start, end }: IntervalObject) {
    return Interval.fromDateTimes(start || this.s, end || this.e);
  }

  /**
   * Split this Interval at each of the specified DateTimes
   * @param {...[DateTime]} dateTimes - the unit of time to count.
   * @return {[Interval]}
   */
  splitAt(...dateTimes: DateTimeLike[]) {
    const sorted = dateTimes
        .map(friendlyDateTime)
        .filter(d => this.contains(d))
        .sort(),
      results = [];
    let { s } = this,
      i = 0;

    while (s < this.e) {
      const added = sorted[i] || this.e,
        next = +added > +this.e ? this.e : added;
      results.push(Interval.fromDateTimes(s, next));
      s = next;
      i += 1;
    }

    return results;
  }

  /**
   * Split this Interval into smaller Intervals, each of the specified length.
   * Left over time is grouped into a smaller interval
   * @param {Duration|Object} duration - The length of each resulting interval, as a Duration object.
   * @return {[Interval]}
   */
  splitBy(duration: DurationLike) {
    const dur = friendlyDuration(duration);

    if (dur.as("milliseconds") === 0) {
      return [];
    }

    let { s } = this,
      added,
      next;

    const results = [];
    while (s < this.e) {
      added = s.plus(dur);
      next = +added > +this.e ? this.e : added;
      results.push(Interval.fromDateTimes(s, next));
      s = next;
    }

    return results;
  }

  /**
   * Split this Interval into the specified number of smaller intervals.
   * @param {number} numberOfParts - The number of Intervals to divide the Interval into.
   * @return {[Interval]}
   */
  divideEqually(numberOfParts: number) {
    return this.splitBy({ milliseconds: this.length() / numberOfParts }).slice(0, numberOfParts);
  }

  /**
   * Return whether this Interval overlaps with the specified Interval
   * @param {Interval} other
   * @return {boolean}
   */
  overlaps(other: Interval) {
    return this.e > other.s && this.s < other.e;
  }

  /**
   * Return whether this Interval's end is adjacent to the specified Interval's start.
   * @param {Interval} other
   * @return {boolean}
   */
  abutsStart(other: Interval) {
    return +this.e === +other.s;
  }

  /**
   * Return whether this Interval's start is adjacent to the specified Interval's end.
   * @param {Interval} other
   * @return {boolean}
   */
  abutsEnd(other: Interval) {
    return +other.e === +this.s;
  }

  /**
   * Return whether this Interval engulfs the start and end of the specified Interval.
   * @param {Interval} other
   * @return {boolean}
   */
  engulfs(other: Interval) {
    return this.s <= other.s && this.e >= other.e;
  }

  /**
   * Return whether this Interval has the same start and end as the specified Interval.
   * @param {Interval} other
   * @return {boolean}
   */
  equals(other: Interval) {
    return this.s.equals(other.s) && this.e.equals(other.e);
  }

  /**
   * Return an Interval representing the intersection of this Interval and the specified Interval.
   * Specifically, the resulting Interval has the maximum start time and the minimum end time of the two Intervals.
   * Returns null if the intersection is empty, meaning, the intervals don't intersect.
   * @param {Interval} other
   * @return {Interval|null}
   */
  intersection(other: Interval) {
    const s = this.s > other.s ? this.s : other.s,
      e = this.e < other.e ? this.e : other.e;

    if (s > e) {
      return null;
    } else {
      return Interval.fromDateTimes(s, e);
    }
  }

  /**
   * Return an Interval representing the union of this Interval and the specified Interval.
   * Specifically, the resulting Interval has the minimum start time and the maximum end time of the two Intervals.
   * @param {Interval} other
   * @return {Interval}
   */
  union(other: Interval) {
    const s = this.s < other.s ? this.s : other.s,
      e = this.e > other.e ? this.e : other.e;
    return Interval.fromDateTimes(s, e);
  }

  /**
   * Merge an array of Intervals into a equivalent minimal set of Intervals.
   * Combines overlapping and adjacent Intervals.
   * @param {[Interval]} intervals
   * @return {[Interval]}
   */
  static merge(intervals: Interval[]) {
    const [found, final] = intervals
      .sort((a, b) => a.s.valueOf() - b.s.valueOf())
      .reduce<[Interval[], Interval | null]>(
        ([sofar, current], item) => {
          if (!current) {
            return [sofar, item];
          } else if (current.overlaps(item) || current.abutsStart(item)) {
            return [sofar, current.union(item)];
          } else {
            return [sofar.concat([current]), item];
          }
        },
        [[], null]
      );
    if (final) {
      found.push(final);
    }
    return found;
  }

  /**
   * Return an array of Intervals representing the spans of time that only appear in one of the specified Intervals.
   * @param {[Interval]} intervals
   * @return {[Interval]}
   */
  static xor(intervals: Interval[]) {
    let start: DateTime | null = null,
      currentCount = 0;
    interface IntervalBoundary {
      time: DateTime;
      type: "s" | "e";
    }
    const results = [],
      ends = intervals.map(i => [
        { time: i.s, type: "s" },
        { time: i.e, type: "e" }
      ]),
      flattened: IntervalBoundary[] = Array.prototype.concat(...ends),
      arr = flattened.sort((a, b) => a.time.valueOf() - b.time.valueOf());

    for (const i of arr) {
      currentCount += i.type === "s" ? 1 : -1;

      if (currentCount === 1) {
        start = i.time;
      } else {
        if (start && start.valueOf() !== i.time.valueOf()) {
          results.push(Interval.fromDateTimes(start, i.time));
        }

        start = null;
      }
    }

    return Interval.merge(results);
  }

  /**
   * Returns Intervals representing the span(s) of time in this Interval that don't overlap with any of the specified Intervals.
   * @param {...Interval} intervals
   * @return {[Interval]}
   */
  difference(...intervals: Interval[]) {
    return Interval.xor([this as Interval].concat(intervals))
      .map(i => this.intersection(i))
      .filter(i => i !== null && !i.isEmpty()) as Interval[];
  }

  /**
   * Returns a string representation of this Interval appropriate for debugging.
   * @return {string}
   */
  toString() {
    return `[${this.s.toISO()} – ${this.e.toISO()})`;
  }

  /**
   * Returns an ISO 8601-compliant string representation of this Interval.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @param {Object} options - The same options as {@link DateTime#toISO}
   * @return {string}
   */
  toISO(options: ToISOTimeOptions = {}) {
    return `${this.s.toISO(options)}/${this.e.toISO(options)}`;
  }

  /**
   * Returns an ISO 8601-compliant string representation of date of this Interval.
   * The time components are ignored.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @return {string}
   */
  toISODate() {
    return `${this.s.toISODate()}/${this.e.toISODate()}`;
  }

  /**
   * Returns an ISO 8601-compliant string representation of time of this Interval.
   * The date components are ignored.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @param {Object} options - The same options as {@link DateTime#toISO}
   * @return {string}
   *
   */
  toISOTime(options: ToISOTimeOptions = {}) {
    return `${this.s.toISOTime(options)}/${this.e.toISOTime(options)}`;
  }

  /**
   * Returns a string representation of this Interval formatted according to the specified format string.
   * @param {string} dateFormat - the format string. This string formats the start and end time. See {@link DateTime.toFormat} for details.
   * @param {Object} options - options
   * @param {string} [options.separator =  ' – '] - a separator to place between the start and end representations
   * @return {string}
   */
  toFormat(dateFormat: string, options = { separator: " – " }) {
    return `${this.s.toFormat(dateFormat)}${options.separator}${this.e.toFormat(dateFormat)}`;
  }

  toDuration(): Duration;
  toDuration(unit: DurationUnit | DurationUnit[]): Duration;
  toDuration(
    unit: DurationUnit | DurationUnit[],
    options: DurationOptions & ThrowOnInvalid
  ): Duration;
  toDuration(unit: DurationUnit | DurationUnit[], options: DurationOptions): Duration | null;
  /**
   * Return a Duration representing the time spanned by this interval.
   * @param {string|string[]} [unit=['milliseconds']] - the unit or units (such as 'hours' or 'days') to include in the duration.
   * @param {Object} options - options that affect the creation of the Duration
   * @param {string} [options.locale=end()'s locale] - the locale to use
   * @param {string} [options.numberingSystem=end()'s numberingSystem] - the numbering system to use
   * @param {string} [options.conversionAccuracy='casual'] - the conversion system to use
   * @param {bool} [options.nullOnInvalid=false] - whether to return `null` on error instead of throwing
   * @example Interval.fromDateTimes(dt1, dt2).toDuration().toObject() //=> { milliseconds: 88489257 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration('days').toObject() //=> { days: 1.0241812152777778 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration(['hours', 'minutes']).toObject() //=> { hours: 24, minutes: 34.82095 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration(['hours', 'minutes', 'seconds']).toObject() //=> { hours: 24, minutes: 34, seconds: 49.257 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration('seconds').toObject() //=> { seconds: 88489.257 }
   * @return {Duration}
   */
  toDuration(unit: DurationUnit | DurationUnit[] = "milliseconds", options: DurationOptions = {}) {
    return this.e.diff(this.s, unit, options);
  }

  /**
   * Run mapFn on the interval start and end, returning a new Interval from the resulting DateTimes
   * @param {function} mapFn
   * @return {Interval}
   * @example Interval.fromDateTimes(dt1, dt2).mapEndpoints(endpoint => endpoint.toUTC())
   * @example Interval.fromDateTimes(dt1, dt2).mapEndpoints(endpoint => endpoint.plus({ hours: 2 }))
   */
  mapEndpoints(mapFn: (dt: DateTime) => DateTime) {
    return Interval.fromDateTimes(mapFn(this.s), mapFn(this.e));
  }
}
