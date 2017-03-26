import { Util } from './impl/util';

export class Interval {
  constructor(start, end) {
    Object.defineProperty(this, 's', { value: start, enumerable: true });
    Object.defineProperty(this, 'e', { value: end, enumerable: true });
  }

  static fromDateTimes(start, end, opts = {}) {
    return new Interval(start, end, opts);
  }

  static after(start, durationOrNumber, unit) {
    const dur = Util.friendlyDuration(durationOrNumber, unit);
    return Interval.fromDateTimes(start, start.plus(dur));
  }

  static before(end, durationOrNumber, unit) {
    const dur = Util.friendlyDuration(durationOrNumber, unit);
    return Interval.fromDateTimes(end.minus(dur), end);
  }

  toDuration(...units) {
    return this.e.diff(this.s, ...units);
  }

  start() {
    return this.s;
  }

  end() {
    return this.e;
  }

  length(unit = 'millisecond') {
    return this.toDuration(...[unit]).get(unit);
  }

  hasSame(unit) {
    return this.e.minus(1).hasSame(this.s, unit);
  }

  count(unit = 'millisecond') {
    const start = this.start().startOf(unit), end = this.end().startOf(unit);
    return Math.floor(end.diff(start, unit).get(unit)) + 1;
  }

  splitAt(...dateTimes) {
    const sorted = dateTimes.sort(), results = [];
    let s = this.s, i = 0;

    while (s < this.e) {
      const added = sorted[i] || this.e, next = +added > +this.e ? this.e : added;
      results.push(Interval.fromDateTimes(s, next));
      s = next;
      i += 1;
    }

    return results;
  }

  splitBy(countOrDuration, unit = 'millisecond') {
    const dur = Util.friendlyDuration(countOrDuration, unit), results = [];
    let s = this.s, added, next;

    while (s < this.e) {
      added = s.plus(dur);
      next = +added > +this.e ? this.e : added;
      results.push(Interval.fromDateTimes(s, next));
      s = next;
    }

    return results;
  }

  divideEqually(numberOfParts) {
    return this.splitBy(this.length() / numberOfParts).slice(0, numberOfParts);
  }

  overlaps(other) {
    return this.e > other.s && this.s < other.e;
  }

  abutsStart(other) {
    return +this.e === +other.s;
  }

  abutsEnd(other) {
    return +other.e === +this.s;
  }

  engulfs(other) {
    return this.s <= other.s && this.e >= other.e;
  }

  intersection(other) {
    const s = this.s > other.s ? this.s : other.s, e = this.e < other.e ? this.e : other.e;

    if (s > e) {
      return null;
    } else {
      return Interval.fromDateTimes(s, e);
    }
  }

  union(other) {
    const s = this.s < other.s ? this.s : other.s, e = this.e > other.e ? this.e : other.e;

    return Interval.fromDateTimes(s, e);
  }

  static merge(intervals) {
    const [found, final] = intervals.sort((a, b) => a.s - b.s).reduce(([sofar, current], item) => {
      if (!current) {
        return [sofar, item];
      } else if (current.overlaps(item) || current.abutsStart(item)) {
        return [sofar, current.union(item)];
      } else {
        return [sofar.concat([current]), item];
      }
    }, [[], null]);
    if (final) {
      found.push(final);
    }
    return found;
  }

  static xor(intervals) {
    let start = null, currentCount = 0;
    const results = [],
      ends = intervals.map(i => [{ time: i.s, type: 's' }, { time: i.e, type: 'e' }]),
      arr = Util.flatten(ends).sort((a, b) => a.time - b.time);

    for (const i of arr) {
      currentCount += i.type === 's' ? 1 : -1;

      if (currentCount === 1) {
        start = i.time;
      } else {
        if (start && +start !== +i.time) {
          results.push(Interval.fromDateTimes(start, i.time));
        }

        start = null;
      }
    }

    return Interval.merge(results);
  }

  difference(...others) {
    return Interval.xor([this].concat(others))
      .map(i => this.intersection(i))
      .filter(i => i && !i.isEmpty());
  }

  equals(other) {
    return this.s.equals(other.s) && this.e.equals(other.e);
  }

  isEmpty() {
    return this.s.valueOf() === this.e.valueOf();
  }

  isValid() {
    return this.s <= this.e;
  }

  isAfter(other) {
    return this.s > other;
  }

  isBefore(other) {
    return this.e.plus(1) < other;
  }

  contains(dateTime) {
    return this.s <= dateTime && this.e > dateTime;
  }

  toString() {
    return `[${this.s.toString()} - ${this.e.toString()})`;
  }
  // toISO(){}
  // toFormatString(overallFormat, dateFormat){}
  // toLocaleString(overallFormat){}
}
