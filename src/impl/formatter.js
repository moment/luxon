import { Util } from './util';

function stringifyTokens(splits, tokenToString) {
  let s = '';
  for (const token of splits) {
    if (token.literal) {
      s += token.val;
    } else {
      s += tokenToString(token.val);
    }
  }
  return s;
}

/**
 * @private
 */

export class Formatter {
  static create(locale, opts = {}) {
    const formatOpts = Object.assign({}, { round: true }, opts);
    return new Formatter(locale, formatOpts);
  }

  static parseFormat(fmt) {
    let current = null, currentFull = '', bracketed = false;
    const splits = [];
    for (let i = 0; i < fmt.length; i++) {
      const c = fmt.charAt(i);
      if (c === "'") {
        if (currentFull.length > 0) {
          splits.push({ literal: bracketed, val: currentFull });
        }
        current = null;
        currentFull = '';
        bracketed = !bracketed;
      } else if (bracketed) {
        currentFull += c;
      } else if (c === current) {
        currentFull += c;
      } else {
        if (currentFull.length > 0) {
          splits.push({ literal: false, val: currentFull });
        }
        currentFull = c;
        current = c;
      }
    }

    if (currentFull.length > 0) {
      splits.push({ literal: bracketed, val: currentFull });
    }

    return splits;
  }

  constructor(locale, formatOpts) {
    this.opts = formatOpts;
    this.loc = locale;
  }

  formatDateTime(dt, opts = {}) {
    const [df, d] = this.loc.dtFormatter(dt, Object.assign({}, this.opts, opts));
    return df.format(d);
  }

  formatDateTimeParts(dt, opts = {}) {
    const [df, d] = this.loc.dtFormatter(dt, Object.assign({}, this.opts, opts));
    return df.format(d);
  }

  resolvedDateOptions(dt) {
    const [df, d] = this.loc.dtFormatter(dt);
    return df.resolvedOptions(d);
  }

  num(n, p = 0) {
    const opts = Object.assign({}, this.opts);

    if (p > 0) {
      opts.padTo = p;
    }

    return this.loc.numberFormatter(opts).format(n);
  }

  formatDateTimeFromString(dt, fmt) {
    const string = (opts, extract) => this.loc.extract(dt, opts, extract),
      formatOffset = opts => {
        if (dt.isOffsetFixed() && dt.offset() === 0 && opts.allowZ) {
          return 'Z';
        }

        const hours = Util.towardZero(dt.offset() / 60),
          minutes = Math.abs(dt.offset() % 60),
          sign = hours >= 0 ? '+' : '-',
          base = `${sign}${Math.abs(hours)}`;

        switch (opts.format) {
          case 'short':
            return `${sign}${this.num(Math.abs(hours), 2)}:${this.num(minutes, 2)}`;
          case 'narrow':
            return minutes > 0 ? `${base}:${minutes}` : base;
          case 'techie':
            return `${sign}${this.num(Math.abs(hours), 2)}${this.num(minutes, 2)}`;
          default:
            throw new RangeError(`Value format ${opts.format} is out of range for property format`);
        }
      },
      tokenToString = token => {
        // Where possible: http://cldr.unicode.org/translation/date-time#TOC-Stand-Alone-vs.-Format-Styles
        switch (token) {
          // ms
          case 'S':
            return this.num(dt.millisecond());
          case 'SSS':
            return this.num(dt.millisecond(), 3);

          // seconds
          case 's':
            return this.num(dt.second());
          case 'ss':
            return this.num(dt.second(), 2);

          // minutes
          case 'm':
            return this.num(dt.minute());
          case 'mm':
            return this.num(dt.minute(), 2);

          // hours
          case 'h':
            return this.num(dt.hour() === 12 ? 12 : dt.hour() % 12);
          case 'hh':
            return this.num(dt.hour() === 12 ? 12 : dt.hour() % 12, 2);
          case 'H':
            return this.num(dt.hour());
          case 'HH':
            return this.num(dt.hour(), 2);
          // offset
          case 'Z':
            // like +6
            return formatOffset({ format: 'narrow', allowZ: true });
          case 'ZZ':
            // like +06:00
            return formatOffset({ format: 'short', allowZ: true });
          case 'ZZZ':
            // like +0600
            return formatOffset({ format: 'techie', allowZ: false });
          case 'ZZZZ':
            // like EST
            return dt.offsetNameShort();
          case 'ZZZZZ':
            // like Eastern Standard Time
            return dt.offsetNameLong();
          // zone
          case 'z':
            return dt.timezoneName();
          // like America/New_York
          // meridiems
          case 'a':
            return string({ hour: 'numeric', hour12: true }, 'dayperiod');

          // dates
          case 'd':
            return this.num(dt.day());
          case 'dd':
            return this.num(dt.day(), 2);

          // weekdays - format
          case 'c':
            // like 1
            return this.num(dt.weekday());
          case 'ccc':
            // like 'Tues'
            return string({ weekday: 'short' }, 'weekday');
          case 'cccc':
            // like 'Tuesday'
            return string({ weekday: 'long' }, 'weekday');
          case 'ccccc':
            // like 'T'
            return string({ weekday: 'narrow' }, 'weekday');
          // weekdays - standalone
          case 'E':
            // like 1
            return this.num(dt.weekday());
          case 'EEE':
            // like 'Tues'
            return string({ weekday: 'short' }, 'weekday');
          case 'EEEE':
            // like 'Tuesday'
            return string({ weekday: 'long' }, 'weekday');
          case 'EEEEE':
            // like 'T'
            return string({ weekday: 'narrow' }, 'weekday');
          // months - format
          case 'L':
            // like 1
            return string({ month: 'numeric', day: 'numeric' }, 'month');
          case 'LL':
            // like 01, doesn't seem to work
            return string({ month: '2-digit', day: 'numeric' }, 'month');
          case 'LLL':
            // like Jan
            return string({ month: 'short', day: 'numeric' }, 'month');
          case 'LLLL':
            // like January
            return string({ month: 'long' }, 'month');
          case 'LLLLL':
            // like J
            return string({ month: 'narrow' }, 'month');
          // months - standalone
          case 'M':
            // like 1
            return this.num(dt.month());
          case 'MM':
            // like 01
            return this.num(dt.month(), 2);
          case 'MMM':
            // like Jan
            return string({ month: 'short', day: 'numeric' }, 'month');
          case 'MMMM':
            // like January
            return string({ month: 'long', day: 'numeric' }, 'month');
          case 'MMMMM':
            // like J
            return string({ month: 'narrow' }, 'month');
          // years
          case 'y':
            // like 2014
            return this.num(dt.year());
          case 'yy':
            // like 14
            return this.num(dt.year().toString().slice(-2), 2);
          case 'yyyy':
            // like 0012
            return this.num(dt.year(), 4);
          // eras
          case 'G':
            // like AD
            return string({ era: 'short' }, 'era');
          case 'GG':
            // like Anno Domini
            return string({ era: 'long' }, 'era');
          case 'GGGGG':
            return string({ era: 'narrow' }, 'era');
          case 'kk':
            return this.num(dt.weekYear().toString().slice(-2), 2);
          case 'kkkk':
            return this.num(dt.weekYear(), 4);
          case 'W':
            return this.num(dt.weekNumber());
          case 'WW':
            return this.num(dt.weekNumber(), 2);
          case 'o':
            return this.num(dt.ordinal());
          case 'ooo':
            return this.num(dt.ordinal(), 3);
          // macros
          case 'D':
            // like 10/14/1983
            return this.formatDateTime(dt, { year: 'numeric', month: 'numeric', day: 'numeric' });
          case 'DD':
            // like Oct 14, 1983
            return this.formatDateTime(dt, { year: 'numeric', month: 'short', day: 'numeric' });
          case 'DDD':
            // like October 14, 1983
            return this.formatDateTime(dt, { year: 'numeric', month: 'long', day: 'numeric' });
          case 'DDDD':
            // like Tuesday, October 14, 1983
            return this.formatDateTime(dt, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            });
          case 't':
            return this.formatDateTime(dt, { hour: 'numeric', minute: '2-digit' });
          case 'tt':
            return this.formatDateTime(dt, {
              hour: 'numeric',
              minute: '2-digit',
              second: '2-digit'
            });
          // todo: ttt and tttt when we have zones
          case 'T':
            return this.formatDateTime(dt, { hour: 'numeric', minute: '2-digit', hour12: false });
          case 'TT':
            return this.formatDateTime(dt, {
              hour: 'numeric',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            });
          // todo: TTT and TTTT when we have zones
          case 'f':
            return this.formatDateTime(dt, {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            });
          case 'ff':
            return this.formatDateTime(dt, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            });

          // todo: add zones
          case 'fff':
            return this.formatDateTime(dt, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            });
          case 'ffff':
            return this.formatDateTime(dt, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
              hour: 'numeric',
              minute: '2-digit'
            });

          case 'F':
            return this.formatDateTime(dt, {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              second: '2-digit'
            });
          case 'FF':
            return this.formatDateTime(dt, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              second: '2-digit'
            });

          // todo: add zones
          case 'FFF':
            return this.formatDateTime(dt, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              second: '2-digit'
            });
          case 'FFFF':
            return this.formatDateTime(dt, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
              hour: 'numeric',
              minute: '2-digit',
              second: '2-digit'
            });

          default:
            return token;
        }
      };

    return stringifyTokens(Formatter.parseFormat(fmt), tokenToString);
  }

  formatDuration() {}

  formatDurationFromString(dur, fmt) {
    const tokenToField = token => {
      switch (token[0]) {
        case 'S':
          return 'millisecond';
        case 's':
          return 'second';
        case 'm':
          return 'minute';
        case 'h':
          return 'hour';
        case 'd':
          return 'day';
        case 'M':
          return 'month';
        case 'y':
          return 'year';
        default:
          return null;
      }
    },
      tokenToString = lildur =>
        token => {
          const mapped = tokenToField(token);
          if (mapped) {
            return this.num(lildur.get(mapped), token.length);
          } else {
            return token;
          }
        },
      tokens = Formatter.parseFormat(fmt),
      realTokens = tokens.reduce((found, { literal, val }) => literal ? found : found.concat(val), [
      ]),
      collapsed = dur.shiftTo(...realTokens.map(tokenToField).filter(t => t));
    return stringifyTokens(tokens, tokenToString(collapsed));
  }
}
