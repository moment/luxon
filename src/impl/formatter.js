//We use the Intl polyfill exclusively here, for these reasons:
// 1. We need formatToParts(), which isn't implemented anywhere
// 2. Node doesn't ship with real locale support unless you do this: https://github.com/nodejs/node/wiki/Intl
// 3. It made for a cleaner job.

//However, it has some drawbacks:
// 1. It's an onerous requirement
// 2. It doesn't have TZ support
// 3. It doesn't support number and calendar overrides.

//In the future we might see either (probably both?) of these:
// 1. Drop the requirement for the polyfill if you want US-EN only.
//    Not doing this now because providing the defaults will slow me down.
// 2. Let the user actually do a real polyfill where they please once Chrome/Node supports formatToParts OR Intl supports zones.
//    This is impractical now because we still want access to the Chrome's native Intl's TZ support elsewhere.

import * as Intl from 'intl';
import {Util} from './util';

function fullLocale(localeConfig){
  let loc = localeConfig.loc || new Intl.DateTimeFormat().resolvedOptions().locale;
  loc = Array.isArray(loc) ? loc : [loc];

  if (localeConfig.outputCal || localeConfig.nums){
    loc = loc.map((l) => {
      l += "-u";

      //this doesn't seem to really work yet, so this is mostly not exposed
      if (localeConfig.outputCal){
        l += "-ca-" + localeConfig.outputCal;
      }

      //this doesn't work yet either
      if (localeConfig.nums){
        l += "-nu-" + localeConfig.nums;
      }
      return l;
    });
  }
  return loc;
}

function parseFormat(fmt){
  let current = null, currentFull = '', splits = [], bracketed = false;
  for (let i = 0; i < fmt.length; i++){
    let c = fmt.charAt(i);
    if (c == "'"){
      if (currentFull.length > 0){
        splits.push({literal: bracketed, val: currentFull});
      }
      current = null;
      currentFull = '';
      bracketed = !bracketed;
    }
    else if (bracketed){
      currentFull += c;
    }
    else if (c === current){
      currentFull += c;
    }
    else {
      if (currentFull.length > 0){
        splits.push({literal: false, val: currentFull});
      }
      currentFull = c;
      current = c;
    }
  }

  if (currentFull.length > 0){
    splits.push({literal: bracketed, val: currentFull});
  }

  return splits;
}

function stringifyTokens(splits, tokenToString){

  let s = '';
  for (let token of splits){
    if (token.literal){
      s += token.val;
    }
    else {
      s += tokenToString(token.val);
    }
  }
  return s;
}

export class Formatter {

  static create(config, opts = {}){

    //todo add caching?
    let localeConfig = Object.assign({}, config, opts),
        formatOpts = Object.assign({}, {round: true}, opts);

    delete formatOpts.outputCal;
    delete formatOpts.nums;
    delete formatOpts.loc;

    return new Formatter(localeConfig, formatOpts);
  }

  constructor(localeConfig, formatOpts){
    this.opts = formatOpts;
    this.loc = fullLocale(localeConfig);
  }

  dateFormatter(inst, options = {}){

    //todo: add global cache?

    let d, z;

    if (inst.zone.universal()){
      d = Util.asIfUTC(inst);
      z = 'UTC'; //this is wrong, but there's no way to tell the formatter that
    }
    else {
      d = inst.toJSDate();
      z = inst.zone.name();
    }

    let opts = {};
    if (z) {
      opts['timeZone'] = z;
    }

    let realOpts = Object.assign(opts, this.opts, options);
    return [new Intl.DateTimeFormat(this.loc, realOpts), d];
  }

  numberFormatter(padTo = 0){
    //todo: add global cache?
    let opts = {useGrouping: false};
    if (padTo > 0){
      opts['minimumIntegerDigits'] = padTo;
      if (this.opts.round) {
        opts['maximumFractionDigits'] = 0;
      }
    }
    return new Intl.NumberFormat(this.loc, Object.assign({}, this.opts, opts));
  }

  formatInstant(inst, opts = {}){
    let [df, d] = this.dateFormatter(inst, opts);
    return df.format(d);
  }

  formatInstantParts(inst, opts = {}){
    let [df, d] = this.dateFormatter(inst, opts);
    return df.format(d);
  }

  resolvedDateOptions(inst){
    let [df, d] = this.dateFormatter(inst);
    return df.resolvedOptions(d);
  }

  num(n, p = 0, round = false){
    return this.numberFormatter(p, round).format(n);
  }

  formatInstantFromString(inst, fmt){

    let string = (opts, extract) => {
      let [df, d] = this.dateFormatter(inst, opts),
          results = df.formatToParts(d);

      return results.find((m) => m.type == extract).value;
    };

    let formatOffset = (opts) => {

      //todo - is this always right? Should be an option?
      if (inst.isOffsetFixed() && inst.offset() === 0){
        return 'Z';
      }

      let hours = Util.towardZero(inst.offset()/60),
          minutes = Math.abs(inst.offset() % 60),
          sign = hours > 0 ? '+' : '-',
          fmt = (n) => this.num(n, opts.format == 'short' ? 2 : 0);

      switch(opts.format){
      case 'short': return `${sign}${fmt(Math.abs(hours))}:${fmt(minutes)}`;
      case 'narrow':
        let base = sign + fmt(Math.abs(hours));
        return minutes > 0 ? `${base}:${fmt(minutes)}` : base;
      default: throw new RangeError(`Value format ${opts.format} is out of range for property format`);
      }
    };

    let tokenToString = (token) => {
      switch (token) {
      //ms
      case 'S': return this.num(inst.millisecond());
      case 'SSS': return this.num(inst.millisecond(), 3);

      //seconds
      case 's': return this.num(inst.second());
      case 'ss': return this.num(inst.second(), 2);

      //minutes
      case 'm': return this.num(inst.minute());
      case 'mm': return this.num(inst.minute(), 2);

      //hours
      case 'h': return this.num(inst.hour() == 12 ? 12 : inst.hour() % 12);
      case 'hh': return this.num(inst.hour() == 12 ? 12 : inst.hour() % 12, 2);
      case 'H': return this.num(inst.hour());
      case 'HH': return this.num(inst.hour(), 2);

      //offset
      case 'Z': return formatOffset({format: 'narrow'});         //like +6
      case 'ZZ': return formatOffset({format: 'short'});         //like +06:00

      //these don't work because we need TZ + formatToParts
      case 'z': return null;                                     //like EST
      case 'zz': return null;                                    //like Eastern Standard Time
      case 'zzz': return null;                                   //like America/New_York

      //meridiens
      case 'a': return string({hour: 'numeric', hour12: true}, 'dayPeriod');

      //dates
      case 'd': return this.num(inst.day());
      case 'dd': return this.num(inst.day(), 2);

      //weekdays - format
      case 'c': return this.num(inst.weekday());                               //like 1
      case 'ccc': return string({weekday: 'short'}, 'weekday');                //like 'Tues'
      case 'cccc': return string({weekday: 'long'}, 'weekday');                //like 'Tuesday'
      case 'ccccc': return string({weekday: 'narrow'}, 'weekday');             //like 'T'

     //weekdays - standalone

      case 'E': return this.num(inst.weekday());                               //like 1
      case 'EEE': return string({weekday: 'short'}, 'weekday');                //like 'Tues'
      case 'EEEE': return string({weekday: 'long'}, 'weekday');                //like 'Tuesday'
      case 'EEEEE': return string({weekday: 'narrow'}, 'weekday');             //like 'T'

      //months - format
      case 'L': return string({month: 'numeric', day: 'numeric'}, 'month');    //like 1
      case 'LL': return string({month: '2-digit', day: 'numeric'}, 'month');   //like 01
      case 'LLL': return string({month: 'short', day: 'numeric'}, 'month');    //like Jan
      case 'LLLL': return string({month: 'long', day: 'numeric'}, 'month');    //like January
      case 'LLLLL': return string({month: 'narrow', day: 'numeric'}, 'month'); //like J

      //months - standalone
      case 'M': return this.num(inst.month());                                 //like 1
      case 'MM': return this.num(inst.month(), 2);                             //like 01
      case 'MMM': return string({month: 'short', day: 'numeric'}, 'month');    //like Jan
      case 'MMMM': return string({month: 'long', day: 'numeric'}, 'month');    //like January
      case 'MMMMM': return string({month: 'narrow', day: 'numeric'}, 'month'); //like J

      //years
      case 'y': return this.num(inst.year());                           //like 2014
      case 'yy': return this.num(inst.year().toString().slice(-2), 2);  //like 14
      case 'yyyy': return this.num(inst.year(), 4);                     //like 0012

      //eras
      case 'G': return string({era: 'short'}, 'era');                   //like AD
      case 'GG': return string({era: 'long'}, 'era');                   //like Anno Domini
      case 'GGGGG': return string({era: 'narrow'}, 'era');              //like A

      //macros
      case 'D': return this.formatInstant(inst, {year: 'numeric', month: 'numeric', day: 'numeric'});
      case 'DD': return this.formatInstant(inst, {year: 'numeric', month: 'short', day: 'numeric'});
      case 'DDD': return this.formatInstant(inst, {year: 'numeric', month: 'long', day: 'numeric'});
      case 'DDDD': return this.formatInstant(inst, {year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'});

      case 't': return this.formatInstant(inst, {hour: 'numeric', minute: '2-digit'});
      case 'tt': return this.formatInstant(inst, {hour: 'numeric', minute: '2-digit', second: '2-digit'});
        //todo: ttt and tttt when we have zones

      case 'T': return this.formatInstant(inst, {hour: 'numeric', minute: '2-digit', hour12: false});
      case 'TT': return this.formatInstant(inst, {hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: false});
        //todo: TTT and TTTT when we have zones

      case 'f': return this.formatInstant(inst, {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit'});
      case 'ff': return this.formatInstant(inst, {year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'});

        //todo: add zones
      case 'fff': return this.formatInstant(inst, {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'});
      case 'ffff': return this.formatInstant(inst, {year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: 'numeric', minute: '2-digit'});

      case 'F': return this.formatInstant(inst, {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit'});
      case 'FF': return this.formatInstant(inst, {year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit'});

        //todo: add zones
      case 'FFF': return this.formatInstant(inst, {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit'});
      case 'FFFF': return this.formatInstant(inst, {year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: 'numeric', minute: '2-digit', second: '2-digit'});

      default:
        return token;
      };
    };

    return stringifyTokens(parseFormat(fmt), tokenToString);
  }

  formatDuration(){
    //https://github.com/tc39/ecma402/issues/47
  }

  formatDurationFromString(dur, fmt){

    let map = (token) => {
      switch (token[0]) {
      case 'S': return 'milliseconds';
      case 's': return 'seconds';
      case 'm': return 'minutes';
      case 'h': return 'hours';
      case 'd': return 'days';
      case 'M': return 'months';
      case 'y': return 'years';
      default: return null;
      }
    };

    let tokenToString = (dur) => {
      return (token) => {
        let mapped = map(token[0]);
        if (mapped){
          return this.num(dur.get(mapped), token.length);
        }
        else {
          return token;
        }
      };
    };

    let tokens = parseFormat(fmt),
        realTokens = tokens.reduce((found, {literal, val}) => literal ? found : found.concat(val), []),
        collapsed = dur.shiftTo.apply(dur, realTokens.map((t) => map(t)));

    return stringifyTokens(tokens, tokenToString(collapsed));
  }
}
