import {Util} from "./impl/util";
import {Locale} from "./impl/locale";
import {Formatter} from './impl/formatter';

const matrix = {
  years: {
    months: 12,
    days: 365,
    hours: 365 * 24,
    minutes: 365 * 24 * 60,
    seconds: 365 * 24 * 60 * 60,
    milliseconds: 365 * 24 * 60 * 60 * 1000

  },
  months: {
    days: 30,
    hours: 30 * 24,
    minutes: 30 * 24 * 60,
    seconds: 30 * 24 * 60 * 60,
    milliseconds: 30 * 24 * 60 * 60 * 1000
  },
  days: {
    hours: 24,
    minutes: 24 * 60,
    seconds: 24 * 60 * 60,
    milliseconds: 24 * 60 * 60 * 1000
  },
  hours: {
    minutes: 60,
    seconds: 60 * 60,
    milliseconds: 60 * 60 * 1000
  },
  minutes: {
    seconds: 60,
    milliseconds: 60 * 1000
  },
  seconds: {
    milliseconds: 1000
  }
};

const ordered = ['years', 'months', 'days', 'hours', 'minutes', 'seconds', 'milliseconds'];

function ensure(unit){
  let normalized = unit.endsWith('s') ? unit : unit + 's';
  if (ordered.indexOf(normalized) === -1){
    throw `Invalid unit ${unit}`;
  }
  return normalized;
}

function clone(dur, alts) {
  //deep merge for vals
  let conf = {};
  conf.values = Object.assign(dur.values, alts.values);
  if (alts.loc) conf.loc = alts.loc;
  return new Duration(conf);
}

export class Duration{

  constructor(config){
    this.values = config.values;

    Object.defineProperty(this, 'loc', {
      value: config.loc || Locale.create(),
      enumerable: true
    });

    Object.defineProperty(this, 'valid', {value: config.valid || true, enumerable: false});
  }

  static invalid(){
    return new Duration({valid: false});
  }

  static fromLength(count, unit = 'milliseconds'){
    unit = ensure(unit);
    return Duration.fromObject({[unit]: count});
  }

  static fromObject(obj){
    //todo - ensure() each key
    return new Duration({values: obj});
  }

  static fromISO(text){}

  static fromString(text, fmt){}

  locale(l){
    if (Util.isUndefined(l)){
      return this.loc;
    }
    else{
      return clone(this, {loc: Locale.create(l)});
    }
  }

  toFormatString(fmt, opts = {}){
    return Formatter.create(this.loc, opts).formatDurationFromString(this, fmt);
  }

  toObject(){
    return Object.assign({}, this.values);
  }

  toISO(){
    //we could use the formatter, but this is an easier way to get the minimum string
    let s = 'P';
    if (this.years() > 0) s += this.years() + 'Y';
    if (this.months() > 0) s += this.months() + 'M';
    if (this.days() > 0) s += this.days() + 'D';
    if (this.hours() > 0 || this.minutes() > 0 || this.seconds() > 0 || this.milliseconds() > 0) s += 'T';
    if (this.hours() > 0) s += this.hours() + 'H';
    if (this.minutes() > 0) s += this.minutes() + 'M';
    if (this.seconds() > 0) s += this.seconds() + 'S';
    return s;
  }

  toJSON(){}

  plus(countOrDuration, unit='milliseconds'){
    let dur = Util.friendlyDuration(countOrDuration, unit),
        result = {};

    for (let k of ordered){
      let val = dur.get(k) + this.get(k);
      if (val != 0){
        result[k] = val;
      }
    }

    return Duration.fromObject(result);
  }

  minus(countOrDuration, unit='milliseconds'){
    let dur = Util.friendlyDuration(countOrDuration, unit);
    return this.plus(dur.negate());
  }

  get(unit){
    return this[unit]();
  }

  set(values){
    let mixed = Object.assign(this.values, values);
    return clone(this, {values: mixed});
  }

  as(unit){
    return this.shiftTo(unit).get(unit);
  }

  normalize(){
    return this.shiftTo(...Object.keys(this.values));
  }

  shiftTo(...units){
    if (units.length == 0){
      return this;
    }

    let built = {},
        accumulated = {},
        vals = this.toObject(),
        lastUnit;

    for (let k of ordered) {

      if (units.indexOf(k) >= 0){
        built[k] = 0;
        lastUnit = k;

        //anything we haven't boiled down yet should get boiled to this unit
        for (let ak in accumulated){
          built[k] += matrix[ak][k] * accumulated[ak];
          delete(accumulated[ak]);
        }

        //plus anything that's already in this unit
        if (Util.isNumber(vals[k])){
          built[k] += vals[k];
        }

        //plus anything further down the chain that should be rolled up in to this
        for(let down in vals){
          if (ordered.indexOf(down) > ordered.indexOf(k)){
            let conv = matrix[k][down],
                added = Math.floor(vals[down] / conv);
            built[k] += added;
            vals[down] -= added * conv;
          }
        }
      }

      //otherwise, keep it in the wings to boil it later
      else if (Util.isNumber(vals[k])){
        accumulated[k] = vals[k];
      }
    }

    //anything leftover becomes the decimal for the last unit
    if (lastUnit){
      for (let key in accumulated){
        built[lastUnit] += accumulated[key] / matrix[lastUnit][key];
      }
    }

    return Duration.fromObject(built);
  }

  negate(){
    let negated = {};
    for(let k of Object.keys(this.values)){
      negated[k] = -this.values[k];
    }
    return Duration.fromObject(negated);
  };

  years(v){
    return Util.isUndefined(v) ? this.values.years || 0 : this.set({years: v});
  }

  months(v){
    return Util.isUndefined(v) ? this.values.months || 0 : this.set({months: v});
  }

  days(v){
    return Util.isUndefined(v) ? this.values.days || 0 : this.set({days: v});
  }

  hours(v){
    return Util.isUndefined(v) ? this.values.hours || 0 : this.set({hours: v});
  }

  minutes(v){
    return Util.isUndefined(v) ? this.values.minutes || 0 : this.set({minutes: v});
  }

  seconds(v){
    return Util.isUndefined(v) ? this.values.seconds || 0 : this.set({seconds: v});
  }

  milliseconds(v){
    return Util.isUndefined(v) ? this.values.milliseconds || 0 : this.set({milliseconds: v});
  }

  equals(other){
    for (let u of ordered){
      if (this.values[u] !== other.values[u])
        return false;
    }
    return true;
  }
}
