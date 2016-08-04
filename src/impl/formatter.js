//hack for now so that I can use formatToParts()
import * as Alt from 'intl';
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

export class Formatter {

  static create(config, opts = {}){

    //todo add caching?
    let localeConfig = Object.assign({}, config, opts),
        formatOpts = Object.assign({}, opts);

    delete formatOpts.outputCal;
    delete formatOpts.nums;
    delete formatOpts.loc;

    return new Formatter(localeConfig, formatOpts);
  }

  constructor(localeConfig, formatOpts){
    this.opts = formatOpts;
    this.loc = fullLocale(localeConfig);
  }

  dateFormatter(inst, alt = false, options = {}){

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

    if (alt){
      return [new Alt.DateTimeFormat(this.loc, realOpts), d];
    }
    else {
      return [new Intl.DateTimeFormat(this.loc, realOpts), d];
    }
  }

  numberFormatter(padTo = 0){
    //todo: add global cache?

    let opts = {useGrouping: false};
    if (padTo > 0){
      opts['minimumIntegerDigits'] = padTo;
    }
    //The polyfill uses the locale's numbering, so it's a little better ATM.
    //The built-in does this fine in the latest Chrome so presumably this will change.
    //We'd def like to change to the built-in b/c it respects numbering overrides
    return new Alt.NumberFormat(this.loc, Object.assign({}, this.opts, opts));
  }

  formatDate(inst){
    //I need to do this:https://github.com/nodejs/node/wiki/Intl
    //That will allow me to not use the polyfill here.
    let [df, d] = this.dateFormatter(inst, true);
    return df.format(d);
  }

  formatParts(inst){
    let [df, d] = this.dateFormatter(inst, true);
    return df.format(d);
  }

  resolvedOptions(inst, forParts = false){
    let [df, d] = this.dateFormatter(inst, forParts);
    return df.resolvedOptions(d);
  }

  formatFromString(inst, fmt){

    let num = (n, p = 0) => this.numberFormatter(p).format(n);

    let string = (opts, extract) => {
      let [df, d] = this.dateFormatter(inst, true, opts),
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
          fmt = (n) => num(n, opts.format == 'short' ? 2 : 0);

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
      case 'S': return num(inst.millisecond());
      case 'SSS': return num(inst.millisecond(), 3);

      //seconds
      case 's': return num(inst.second());
      case 'ss': return num(inst.second(), 2);

      //minutes
      case 'm': return num(inst.minute());
      case 'mm': return num(inst.minute(), 2);

      //hours
      case 'h': return num(inst.hour() == 12 ? 12 : inst.hour() % 12);
      case 'hh': return num(inst.hour() == 12 ? 12 : inst.hour() % 12, 2);
      case 'H': return num(inst.hour());
      case 'HH': return num(inst.hour(), 2);

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
      case 'd': return num(inst.day());
      case 'dd': return num(inst.day(), 2);

      //weekdays
      case 'E': return num(inst.weekday());                        //like 1
      case 'EEE': return string({weekday: 'narrow'}, 'weekday');    //like 'T'
      case 'EEEE': return string({weekday: 'short'}, 'weekday');    //like 'Tues'
      case 'EEEEE': return string({weekday: 'long'}, 'weekday');    //like 'Tuesday'

      //months
      case 'M': return num(inst.month());                          //like 1
      case 'MM': return num(inst.month(), 2);                      //like 01
      case 'MMM': return string({month: 'narrow'}, 'month');       //like J
      case 'MMMM': return string({month: 'short'}, 'month');       //like Jan
      case 'MMMMM': return string({month: 'long'}, 'month');       //like January

      //years
      case 'y': return num(inst.year());                           //like 2014
      case 'yy': return num(inst.year().toString().slice(-2), 2);  //like 14
      case 'yyyy': return num(inst.year(), 4);                     //like 0012

      //eras
      case 'G': return string({era: 'narrow'}, 'era');             //like A
      case 'GG': return string({era: 'short'}, 'era');             //like AD
      case 'GGG': return string({era: 'long'}, 'era');             //like Anno Domini

      default:
        return token;
      };
    };

    let current = null, currentFull = '', splits = [], bracketed = false;
    for (let i = 0; i < fmt.length; i++){
      let c = fmt.charAt(i);
      if (c == ']'){
        bracketed = false;
        splits.push({literal: true, val: currentFull});
        current = null;
        currentFull = '';
      }
      else if (c == '['){
        bracketed = true;
      }
      else if (bracketed){
        currentFull += c;
      }
      else if (c === current){
        currentFull += c;
      }
      else {
        splits.push({literal: false, val: currentFull});
        currentFull = c;
        current = c;
      }
    }

    if (currentFull.length > 0){
      splits.push({literal: bracketed, val: currentFull});
    }

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
}
