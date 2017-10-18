import { Util } from './util';
import { English } from './english';
import { DateTime } from '../datetime';

const localeCache = new Map();

function intlConfigString(locale, numberingSystem, outputCalendar) {
  let loc = locale || new Intl.DateTimeFormat().resolvedOptions().locale;
  loc = Array.isArray(locale) ? locale : [locale];

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

function listStuff(loc, length, defaultOK, englishFn, intlFn) {
  const mode = loc.listingMode(defaultOK);

  if (mode === 'error') {
    return null;
  } else if (mode === 'en') {
    return englishFn(length);
  } else {
    return intlFn(length);
  }
}

/**
 * @private
 */

class PolyFormatter {
  constructor(opts) {
    this.padTo = opts.padTo || 0;
    this.round = opts.round || false;
  }

  format(i) {
    const maybeRounded = this.round ? Math.round(i) : i;
    return maybeRounded.toString().padStart(this.padTo, '0');
  }
}

/**
 * @private
 */

export class Locale {
  static fromOpts(opts) {
    return Locale.create(opts.locale, opts.numberingSystem, opts.outputCalendar);
  }

  static create(locale, numberingSystem, outputCalendar) {
    const localeR = locale || 'en-US',
      numberingSystemR = numberingSystem || null,
      outputCalendarR = outputCalendar || null,
      cacheKey = `${localeR}|${numberingSystemR}|${outputCalendarR}`,
      cached = localeCache.get(cacheKey);

    if (cached) {
      return cached;
    } else {
      const fresh = new Locale(localeR, numberingSystemR, outputCalendarR);
      localeCache.set(cacheKey, fresh);
      return fresh;
    }
  }

  static fromObject({ locale, numberingSystem, outputCalendar } = {}) {
    return Locale.create(locale, numberingSystem, outputCalendar);
  }

  constructor(locale, numbering, outputCalendar) {
    Object.defineProperty(this, 'locale', { value: locale, enumerable: true });
    Object.defineProperty(this, 'numberingSystem', {
      value: numbering || null,
      enumerable: true
    });
    Object.defineProperty(this, 'outputCalendar', {
      value: outputCalendar || null,
      enumerable: true
    });
    Object.defineProperty(this, 'intl', {
      value: intlConfigString(this.locale, this.numberingSystem, this.outputCalendar),
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

  // todo: cache me
  listingMode(defaultOk = true) {
    const hasIntl = Intl && Intl.DateTimeFormat,
      hasFTP = hasIntl && Intl.DateTimeFormat.prototype.formatToParts,
      isActuallyEn =
        this.locale === 'en' ||
        this.locale.toLowerCase() === 'en-us' ||
        (hasIntl &&
          Intl.DateTimeFormat(this.intl)
            .resolvedOptions()
            .locale.startsWith('en-US')),
      hasNoWeirdness =
        (this.numberingSystem === null || this.numberingSystem === 'latn') &&
        (this.outputCalendar === null || this.outputCalendar === 'gregory');

    if (!hasFTP && !(isActuallyEn && hasNoWeirdness) && !defaultOk) {
      return 'error';
    } else if (!hasFTP || (isActuallyEn && hasNoWeirdness)) {
      return 'en';
    } else {
      return 'intl';
    }
  }

  clone(alts) {
    if (!alts || Object.getOwnPropertyNames(alts).length === 0) {
      return this;
    } else {
      return Locale.create(
        alts.locale || this.locale,
        alts.numberingSystem || this.numberingSystem,
        alts.outputCalendar || this.outputCalendar
      );
    }
  }

  months(length, format = false, defaultOK = true) {
    return listStuff(this, length, defaultOK, English.months, () => {
      const intl = format ? { month: length, day: 'numeric' } : { month: length },
        formatStr = format ? 'format' : 'standalone';
      if (!this.monthsCache[formatStr][length]) {
        this.monthsCache[formatStr][length] = mapMonths(dt => this.extract(dt, intl, 'month'));
      }
      return this.monthsCache[formatStr][length];
    });
  }

  weekdays(length, format = false, defaultOK = true) {
    return listStuff(this, length, defaultOK, English.weekdays, () => {
      const intl = format
          ? { weekday: length, year: 'numeric', month: 'long', day: 'numeric' }
          : { weekday: length },
        formatStr = format ? 'format' : 'standalone';
      if (!this.weekdaysCache[formatStr][length]) {
        this.weekdaysCache[formatStr][length] = mapWeekdays(dt =>
          this.extract(dt, intl, 'weekday')
        );
      }
      return this.weekdaysCache[formatStr][length];
    });
  }

  meridiems(defaultOK = true) {
    return listStuff(
      this,
      undefined,
      defaultOK,
      () => English.meridiems,
      () => {
        // In theory there could be aribitrary day periods. We're gonna assume there are exactly two
        // for AM and PM. This is probably wrong, but it's makes parsing way easier.
        if (!this.meridiemCache) {
          const intl = { hour: 'numeric', hour12: true };
          this.meridiemCache = [
            DateTime.utc(2016, 11, 13, 9),
            DateTime.utc(2016, 11, 13, 19)
          ].map(dt => this.extract(dt, intl, 'dayperiod'));
        }

        return this.meridiemCache;
      }
    );
  }

  eras(length, defaultOK = true) {
    return listStuff(this, length, defaultOK, English.eras, () => {
      const intl = { era: length };

      // This is utter bullshit. Different calendars are going to define eras totally differently. What I need is the minimum set of dates
      // to definitely enumerate them.
      if (!this.eraCache[length]) {
        this.eraCache[length] = [DateTime.utc(-40, 1, 1), DateTime.utc(2017, 1, 1)].map(dt =>
          this.extract(dt, intl, 'era')
        );
      }

      return this.eraCache[length];
    });
  }

  extract(dt, intlOpts, field) {
    const [df, d] = this.dtFormatter(dt, intlOpts),
      results = df.formatToParts(d),
      matching = results.find(m => m.type.toLowerCase() === field);

    return matching ? matching.value : null;
  }

  numberFormatter(opts = {}, intlOpts = {}) {
    if (Intl && Intl.NumberFormat) {
      const realIntlOpts = Object.assign({ useGrouping: false }, intlOpts);

      if (opts.padTo > 0) {
        realIntlOpts.minimumIntegerDigits = opts.padTo;
      }

      if (opts.round) {
        realIntlOpts.maximumFractionDigits = 0;
      }

      return new Intl.NumberFormat(this.intl, realIntlOpts);
    } else {
      return new PolyFormatter(opts);
    }
  }

  dtFormatter(dt, intlOpts = {}) {
    let d, z;

    if (dt.zone.universal) {
      // if we have a fixed-offset zone that isn't actually UTC,
      // (like UTC+8), we need to make do with just displaying
      // the time in UTC; the formatter doesn't know how to handle UTC+8
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

  equals(other) {
    return (
      this.locale === other.locale &&
      this.numberingSystem === other.numberingSystem &&
      this.outputCalendar === other.outputCalendar
    );
  }
}
