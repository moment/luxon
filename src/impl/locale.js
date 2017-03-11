import * as Intl from 'intl';
import { Util } from './util';
import { Instant } from '../instant';

// We use the Intl polyfill exclusively here, for these reasons:
// 1. We need formatToParts(), which isn't in Node or even most browsers
// 2. Node doesn't ship with real locale support unless you do this: https://github.com/nodejs/node/wiki/Intl
// 3. It standardizes the tests across different browsers.
// 4. It made for a cleaner job.
// However, it has some drawbacks:
// 1. It's an onerous requirement
// 2. It doesn't have TZ support
// 3. It doesn't support number and calendar overrides.
// In the future we might see either (probably both?) of these:
// 1. Drop the requirement for the polyfill if you want US-EN only.
//    Not doing this now because providing the defaults will slow me down.
// 2. Let the user actually do a real polyfill where they please once Chrome/Node supports
//    formatToParts OR Intl supports zones.
//    This is impractical now because we still want access to the Chrome's native Intl's TZ
//    support elsewhere.
const localeCache = new Map();

function intlConfigString(localeCode, nums, cal) {
  let loc = localeCode || new Intl.DateTimeFormat().resolvedOptions().locale;
  loc = Array.isArray(localeCode) ? localeCode : [localeCode];

  if (cal || nums) {
    loc = loc.map(l => {
      l += '-u';

      // This doesn't seem to really work yet, so this is mostly not exposed.
      // Also, this won't work with *parsing*, since we don't know how to translate
      // them back into dates.
      // So we need a way to specifically ignore it when parsing or we'll get gibberish
      if (cal) {
        l += '-ca-' + cal;
      }

      // this doesn't work yet either
      if (nums) {
        l += '-nu-' + nums;
      }
      return l;
    });
  }
  return loc;
}

function mapMonths(f) {
  const ms = [];
  for (let i = 1; i <= 12; i++) {
    const inst = Instant.fromObject({ year: 2016, month: i, day: 1 }, { utc: true });
    ms.push(f(inst));
  }
  return ms;
}

function mapWeekdays(f) {
  const ms = [];
  for (let i = 0; i < 7; i++) {
    const inst = Instant.fromObject({ year: 2016, month: 11, day: 13 + i }, { utc: true });
    ms.push(f(inst));
  }
  return ms;
}

/**
 * @private
 */

export class Locale {
  static fromOpts(opts) {
    return Locale.create(opts.localeCode, opts.nums, opts.cal);
  }

  static create(localeCode, nums, cal) {
    const codeR = localeCode || 'en-us',
      numsR = nums || null,
      calR = cal || null,
      cacheKey = `${codeR}|${numsR}|${calR}`,
      cached = localeCache.get(cacheKey);

    if (cached) {
      return cached;
    } else {
      const fresh = new Locale(codeR, numsR, calR);
      localeCache.set(cacheKey, fresh);
      return fresh;
    }
  }

  constructor(localeCode, numbering, calendar) {
    Object.defineProperty(this, 'localeCode', { value: localeCode, enumerable: true });
    Object.defineProperty(this, 'nums', { value: numbering || null, enumerable: true });
    Object.defineProperty(this, 'cal', { value: calendar || null, enumerable: true });
    Object.defineProperty(this, 'intl', {
      value: intlConfigString(this.localeCode, this.num, this.cal),
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
  }

  clone(alts) {
    return Locale.create(
      alts.localeCode || this.localeCode,
      alts.nums || this.nums,
      alts.cal || this.cal
    );
  }

  months(length, format = false) {
    const intl = format ? { month: length, day: 'numeric' } : { month: length },
      formatStr = format ? 'format' : 'standalone';
    if (!this.monthsCache[formatStr][length]) {
      this.monthsCache[formatStr][length] = mapMonths(inst => this.extract(inst, intl, 'month'));
    }
    return this.monthsCache[formatStr][length];
  }

  weekdays(length, format = false) {
    const intl = format
      ? { weekday: length, year: 'numeric', month: 'long', day: 'numeric' }
      : { weekday: length },
      formatStr = format ? 'format' : 'standalone';
    if (!this.weekdaysCache[formatStr][length]) {
      this.weekdaysCache[formatStr][length] = mapWeekdays(inst =>
        this.extract(inst, intl, 'weekday'));
    }
    return this.weekdaysCache[formatStr][length];
  }

  meridiems() {
    const intl = { hour: 'numeric', hour12: true };

    // In theory there could be aribitrary day periods. We're gonna assume there are exactly two
    // for AM and PM. This is probably wrong, but it's makes parsing way easier.
    if (!this.meridiemCache) {
      this.meridiemCache = [
        Instant.fromObject({ year: 2016, month: 11, day: 13, hour: 9 }, { utc: true }),
        Instant.fromObject({ year: 2016, month: 11, day: 13, hour: 19 }, { utc: true })
      ].map(inst => this.extract(inst, intl, 'dayperiod'));
    }

    return this.meridiemCache;
  }

  // eras(length){
  // }
  // fieldValues(){
  // }
  extract(inst, intlOpts, field) {
    const [df, d] = this.instFormatter(inst, intlOpts),
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

  instFormatter(inst, intlOpts = {}) {
    let d, z;

    if (inst.zone.universal) {
      // if we have a fixed-offset zone that isn't actually UTC,
      // (like UTC+8), we need to make due with just displaying
      // the time in UTC; the formatter has no idea what UTC+8 means
      d = Util.asIfUTC(inst);
      z = 'UTC';
    } else {
      d = inst.toJSDate();
      z = inst.zone.name;
    }

    const realIntlOpts = Object.assign({}, intlOpts);
    if (z) {
      realIntlOpts.timeZone = z;
    }

    return [new Intl.DateTimeFormat(this.intl, realIntlOpts), d];
  }
}
