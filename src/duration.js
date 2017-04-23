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

export class Duration {
  constructor(config) {
    this.values = config.values;

    Object.defineProperty(this, 'loc', { value: config.loc || Locale.create(), enumerable: true });

    Object.defineProperty(this, 'valid', { value: config.valid || true, enumerable: false });
  }

  static invalid() {
    return new Duration({ valid: false });
  }

  static fromLength(count, unit = 'millisecond') {
    const realUnit = Util.normalizeUnit(unit);
    return Duration.fromObject({ [realUnit]: count });
  }

  static fromObject(obj) {
    return new Duration({ values: Util.normalizeObject(obj) });
  }

  static fromISO(text) {
    const vals = RegexParser.parseISODuration(text);
    return Duration.fromObject(vals);
  }

  locale(l) {
    return Util.isUndefined(l) ? this.loc : clone(this, { loc: Locale.create(l) });
  }

  toFormat(fmt, opts = {}) {
    return Formatter.create(this.loc, opts).formatDurationFromString(this, fmt);
  }

  toObject() {
    return Object.assign({}, this.values);
  }

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

  toJSON() {
    return this.toISO();
  }

  plus(countOrDuration, unit = 'millisecond') {
    const dur = Util.friendlyDuration(countOrDuration, unit), result = {};

    for (const k of Util.orderedUnits) {
      const val = dur.get(k) + this.get(k);
      if (val !== 0) {
        result[k] = val;
      }
    }

    return Duration.fromObject(result);
  }

  minus(countOrDuration, unit = 'millisecond') {
    const dur = Util.friendlyDuration(countOrDuration, unit);
    return this.plus(dur.negate());
  }

  get(unit) {
    const accessor = `${Util.normalizeUnit(unit)}s`;
    return this[accessor]();
  }

  set(values) {
    const mixed = Object.assign(this.values, Util.normalizeObject(values));
    return clone(this, { values: mixed });
  }

  as(unit) {
    return this.shiftTo(unit).get(unit);
  }

  normalize() {
    return this.shiftTo(...Object.keys(this.values));
  }

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

  negate() {
    const negated = {};
    for (const k of Object.keys(this.values)) {
      negated[k] = -this.values[k];
    }
    return Duration.fromObject(negated);
  }

  years(v) {
    return Util.isUndefined(v) ? this.values.year || 0 : this.set({ year: v });
  }

  months(v) {
    return Util.isUndefined(v) ? this.values.month || 0 : this.set({ month: v });
  }

  days(v) {
    return Util.isUndefined(v) ? this.values.day || 0 : this.set({ day: v });
  }

  hours(v) {
    return Util.isUndefined(v) ? this.values.hour || 0 : this.set({ hour: v });
  }

  minutes(v) {
    return Util.isUndefined(v) ? this.values.minute || 0 : this.set({ minute: v });
  }

  seconds(v) {
    return Util.isUndefined(v) ? this.values.second || 0 : this.set({ second: v });
  }

  milliseconds(v) {
    return Util.isUndefined(v) ? this.values.millisecond || 0 : this.set({ millisecond: v });
  }

  equals(other) {
    for (const u of Util.orderedUnits) {
      if (this.values[u] !== other.values[u]) {
        return false;
      }
    }
    return true;
  }
}
