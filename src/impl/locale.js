import { Util } from './util';
import { English } from './english';
import { DateTime } from '../datetime';

const localeCache = new Map();

function intlConfigString(localeCode, numberingSystem, outputCalendar) {
  let loc = localeCode || new Intl.DateTimeFormat().resolvedOptions().locale;
  loc = Array.isArray(localeCode) ? localeCode : [localeCode];

  if (outputCalendar || numberingSystem) {
    loc = loc.map(l => {
      l += '-u';

      if (outputCalendar) {
        l += '-ca-' + outputCalendar;
      }

      if (numberingSystem) {
        l += '-nu-' + numberingSystem;
      }
      return l;
    });
  }
  return loc;
}

function mapMonths(f) {
  const ms = [];
  for (let i = 1; i <= 12; i++) {
    const dt = DateTime.utc(2016, i, 1);
    ms.push(f(dt));
  }
  return ms;
}

function mapWeekdays(f) {
  const ms = [];
  for (let i = 1; i <= 7; i++) {
    const dt = DateTime.utc(2016, 11, 13 + i);
    ms.push(f(dt));
  }
  return ms;
}

/**
 * @private
 */

export class Locale {
  static fromOpts(opts) {
    return Locale.create(opts.localeCode, opts.numberingSystem, opts.outputCalendar);
  }

  static create(localeCode, numberingSystem, outputCalendar) {
    const codeR = localeCode || 'en-us',
      numberingSystemR = numberingSystem || null,
      outputCalendarR = outputCalendar || null,
      cacheKey = `${codeR}|${numberingSystemR}|${outputCalendarR}`,
      cached = localeCache.get(cacheKey);

    if (cached) {
      return cached;
    } else {
      const fresh = new Locale(codeR, numberingSystemR, outputCalendarR);
      localeCache.set(cacheKey, fresh);
      return fresh;
    }
  }

  constructor(localeCode, numbering, outputCalendar) {
    Object.defineProperty(this, 'localeCode', { value: localeCode, enumerable: true });
    Object.defineProperty(this, 'numberingSystem', { value: numbering || null, enumerable: true });
    Object.defineProperty(this, 'outputCalendar', {
      value: outputCalendar || null,
      enumerable: true
    });
    Object.defineProperty(this, 'intl', {
      value: intlConfigString(this.localeCode, this.numberingSystem, this.outputCalendar),
      enumerable: false
    });

    // cached usefulness
    Object.defineProperty(this, 'weekdaysCache', {
      value: { format: {}, standalone: {} },
      enumerable: false
    });
    Object.defineProperty(this, 'monthsCache', {
      value: { format: {}, standalone: {} },
      enumerable: false
    });
    Object.defineProperty(this, 'meridiemCache', {
      value: null,
      enumerable: false,
      writable: true
    });
    Object.defineProperty(this, 'eraCache', {
      value: {},
      enumerable: false,
      writable: true
    });
  }

  knownEnglish() {
    return (
      (this.localeCode === 'en' ||
        Intl.DateTimeFormat(this.intl).resolvedOptions().locale.startsWith('en-US')) &&
      this.numberingSystem === null &&
      (this.outputCalendar === null || this.outputCalendar === 'latn')
    );
  }

  clone(alts) {
    return Locale.create(
      alts.localeCode || this.localeCode,
      alts.numberingSystem || this.numberingSystem,
      alts.outputCalendar || this.outputCalendar
    );
  }

  months(length, format = false) {
    if (this.knownEnglish()) {
      const english = English.months(length);
      if (english) {
        return english;
      }
    }

    const intl = format ? { month: length, day: 'numeric' } : { month: length },
      formatStr = format ? 'format' : 'standalone';
    if (!this.monthsCache[formatStr][length]) {
      this.monthsCache[formatStr][length] = mapMonths(dt => this.extract(dt, intl, 'month'));
    }
    return this.monthsCache[formatStr][length];
  }

  weekdays(length, format = false) {
    if (this.knownEnglish()) {
      const english = English.weekdays(length);
      if (english) {
        return english;
      }
    }

    const intl = format
      ? { weekday: length, year: 'numeric', month: 'long', day: 'numeric' }
      : { weekday: length },
      formatStr = format ? 'format' : 'standalone';
    if (!this.weekdaysCache[formatStr][length]) {
      this.weekdaysCache[formatStr][length] = mapWeekdays(dt => this.extract(dt, intl, 'weekday'));
    }
    return this.weekdaysCache[formatStr][length];
  }

  meridiems() {
    if (this.knownEnglish()) {
      return English.meridiems;
    }

    // In theory there could be aribitrary day periods. We're gonna assume there are exactly two
    // for AM and PM. This is probably wrong, but it's makes parsing way easier.
    if (!this.meridiemCache) {
      const intl = { hour: 'numeric', hour12: true };
      this.meridiemCache = [DateTime.utc(2016, 11, 13, 9), DateTime.utc(2016, 11, 13, 19)].map(dt =>
        this.extract(dt, intl, 'dayperiod')
      );
    }

    return this.meridiemCache;
  }

  eras(length) {
    if (this.knownEnglish()) {
      return English.eras(length);
    }

    const intl = { era: length };

    // This is utter bullshit. Different calendars are going to define eras totally differently. What I need is the minimum set of dates
    // to definitely enumerate them.
    if (!this.eraCache[length]) {
      this.eraCache[length] = [DateTime.utc(-40, 1, 1), DateTime.utc(2017, 1, 1)].map(dt =>
        this.extract(dt, intl, 'era')
      );
    }

    return this.eraCache[length];
  }

  extract(dt, intlOpts, field) {
    const [df, d] = this.dtFormatter(dt, intlOpts),
      results = df.formatToParts(d),
      matching = results.find(m => m.type.toLowerCase() === field);

    return matching ? matching.value : null;
  }

  numberFormatter(opts = {}, intlOpts = {}) {
    const realIntlOpts = Object.assign({ useGrouping: false }, intlOpts);

    if (opts.padTo > 0) {
      realIntlOpts.minimumIntegerDigits = opts.padTo;
    }

    if (opts.round) {
      realIntlOpts.maximumFractionDigits = 0;
    }

    return new Intl.NumberFormat(this.intl, realIntlOpts);
  }

  dtFormatter(dt, intlOpts = {}) {
    let d, z;

    if (dt.zone.universal) {
      // if we have a fixed-offset zone that isn't actually UTC,
      // (like UTC+8), we need to make do with just displaying
      // the time in UTC; the formatter how to handle UTC+8
      d = Util.asIfUTC(dt);
      z = 'UTC';
    } else if (dt.zone.type === 'local') {
      d = dt.toJSDate();
    } else {
      d = dt.toJSDate();
      z = dt.zone.name;
    }

    const realIntlOpts = Object.assign({}, intlOpts);
    if (z) {
      realIntlOpts.timeZone = z;
    }

    return [new Intl.DateTimeFormat(this.intl, realIntlOpts), d];
  }
}
