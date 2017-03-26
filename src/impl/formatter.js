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
        // todo - is this always right? Should be an option?
        if (dt.isOffsetFixed() && dt.offset() === 0) {
          return 'Z';
        }

        const hours = Util.towardZero(dt.offset() / 60),
          minutes = Math.abs(dt.offset() % 60),
          sign = hours > 0 ? '+' : '-',
          formatter = n => this.num(n, opts.format === 'short' ? 2 : 0),
          base = sign + formatter(Math.abs(hours));

        switch (opts.format) {
          case 'short':
            return `${sign}${formatter(Math.abs(hours))}:${formatter(minutes)}`;
          case 'narrow':
            return minutes > 0 ? `${base}:${formatter(minutes)}` : base;
          default:
            throw new RangeError(`Value format ${opts.format} is out of range for property format`);
        }
      },
      tokenToString = token => {
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
            return formatOffset({ format: 'narrow' });
          // like +6
          case 'ZZ':
            return formatOffset({ format: 'short' });
          // like +06:00
          case 'ZZZ':
            return dt.offsetNameLong();
          // like Eastern Standard Time
          case 'ZZZZ':
            return dt.offsetNameShort();
          // like EST
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
            return this.num(dt.weekday());
          // like 1
          case 'ccc':
            return string({ weekday: 'short' }, 'weekday');
          // like 'Tues'
          case 'cccc':
            return string({ weekday: 'long' }, 'weekday');
          // like 'Tuesday'
          case 'ccccc':
            return string({ weekday: 'narrow' }, 'weekday');
          // like 'T'
          // weekdays - standalone
          case 'E':
            return this.num(dt.weekday());
          // like 1
          case 'EEE':
            return string({ weekday: 'short' }, 'weekday');
          // like 'Tues'
          case 'EEEE':
            return string({ weekday: 'long' }, 'weekday');
          // like 'Tuesday'
          case 'EEEEE':
            return string({ weekday: 'narrow' }, 'weekday');
          // like 'T'
          // months - format
          case 'L':
            return string({ month: 'numeric', day: 'numeric' }, 'month');
          // like 1
          case 'LL':
            return string({ month: '2-digit', day: 'numeric' }, 'month');
          // like 01, doesn't seem to work
          case 'LLL':
            return string({ month: 'short', day: 'numeric' }, 'month');
          // like Jan
          case 'LLLL':
            return string({ month: 'long' }, 'month');
          // like January
          case 'LLLLL':
            return string({ month: 'narrow' }, 'month');
          // like J
          // months - standalone
          case 'M':
            return this.num(dt.month());
          // like 1
          case 'MM':
            return this.num(dt.month(), 2);
          // like 01
          case 'MMM':
            return string({ month: 'short', day: 'numeric' }, 'month');
          // like Jan
          case 'MMMM':
            return string({ month: 'long', day: 'numeric' }, 'month');
          // like January
          case 'MMMMM':
            return string({ month: 'narrow' }, 'month');
          // like J
          // years
          case 'y':
            return this.num(dt.year());
          // like 2014
          case 'yy':
            return this.num(dt.year().toString().slice(-2), 2);
          // like 14
          case 'yyyy':
            return this.num(dt.year(), 4);
          // like 0012
          // eras
          case 'G':
            return string({ era: 'short' }, 'era');
          // like AD
          case 'GG':
            return string({ era: 'long' }, 'era');
          // like Anno Domini
          case 'GGGGG':
            return string({ era: 'narrow' }, 'era');
          // like A
          // macros
          // Some of these output take zones or offsets. We have to choose between that
          // internationalization, though
          // since Node doesn't ship with Itln data and the polyfill doesn't support zones.
          // Revisit when either of those change or I give up on this dance and require
          // a special Node build.
          case 'D':
            return this.formatDateTime(dt, { year: 'numeric', month: 'numeric', day: 'numeric' });
          case 'DD':
            return this.formatDateTime(dt, { year: 'numeric', month: 'short', day: 'numeric' });
          case 'DDD':
            return this.formatDateTime(dt, { year: 'numeric', month: 'long', day: 'numeric' });
          case 'DDDD':
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
