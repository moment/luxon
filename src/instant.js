import {Formatter} from "./impl/formatter";
import {Duration} from "./duration";

function objectToDate(obj, defaults, utc = false){
  let args = [
    obj.year || defaults.year,
    (obj.month || defaults.month) - 1,
    obj.day || defaults.day,
    obj.hour || defaults.hour,
    obj.minute || defaults.minute,
    obj.second || defaults.second,
    obj.millisecond || defaults.millisecond
  ];

  return utc ? new Date(Date.UTC(...args)) : new Date(...args);
}

function makeGetSet(name, getter){
  return function(v){
    if (typeof(v) === 'undefined') {
      return getter(this._shifted, this.isUTC());
    }
    else{
      return this.set({[name]: v});
    }
  };
}

class GetSet {

  static getYear(d, isUTC){
    return isUTC ? d.getUTCFullYear() : d.getFullYear();
  }

  static getMonth(d, isUTC){
    return (isUTC ? d.getUTCMonth() : d.getMonth()) + 1;
  }

  static getDay(d, isUTC){
    return isUTC ? d.getUTCDate() : d.getDate();
  }

  static getHour(d, isUTC){
    return isUTC ? d.getUTCHours() : d.getHours();
  }

  static getMinute(d, isUTC){
    return isUTC ? d.getUTCMinutes() : d.getMinutes();
  }

  static getSecond(d, isUTC){
    return isUTC ? d.getUTCSeconds() : d.getSeconds();
  }

  static getMillisecond(d, isUTC){
    return isUTC ? d.getUTCMilliseconds() : d.getMilliseconds();
  }

  static setYear(d, v, isUTC){
    isUTC ? d.setUTCFullYear(v) : d.setFullYear(v);
  }

  static setMonth(d, v, isUTC){
    isUTC ? d.setUTCMonth(v - 1) : d.setMonth(v - 1);
  }

  static setDay(d, v, isUTC){
    isUTC ? d.setUTCDate(v) : d.setDate(v);
  }

  //shouldn't need setters for lower-order fields
}

function adjustTime(inst, dur){
  let d = new Date(inst._d);

  //things with change the date exclusively
  if (dur.years()) {GetSet.setYear(d, d.getYear() + dur.years());}
  if (dur.months()) {GetSet.setMonth(d, d.getMonth() + dur.months());}
  if (dur.days()) {GetSet.setDay(d, d.getDay() + dur.days());}

  //things that change the millis
  let leftovers = {},
      durObj = dur.toObject();

  for(let key of ['hours', 'minutes', 'seconds', 'millisconds']){
    if (typeof(durObj[key]) === 'number'){
      leftovers[key] = durObj[key];
    }
  }

  let millisToAdd = Duration
        .fromObject(leftovers)
        .shiftTo('milliseconds')
        .milliseconds();

  d.setTime(+d + millisToAdd);
  return d;
}

function friendlyDuration(durationOrNumber, type){
  return typeof durationOrNumber === 'number' ?
    Duration.fromLength(durationOrNumber, type) :
    durationOrNumber;
}

export class Instant{

  constructor(config = {}){

    this._c = config;
    this._d = config.date;

    this._c.offset = config.offset || 0;

    if (this._c.offset === 0){
      this._shifted = this._d;
    }
    else{
      let originalOffset = -Math.round(config.date.getTimezoneOffset() / 15) * 15,
          diff = this._c.offset - originalOffset;
      this._shifted = adjustTime(this, Duration.fromObject({minutes: diff}));
    }
  }

  //create instants

  static now(){
    return new Instant({date: new Date()});
  }

  static fromJSDate(date){
    return new Instant({date: new Date(date)});
  }

  static fromMillis(milliseconds){
    return new Instant({date: new Date(milliseconds)});
  }

  static fromUnix(seconds){
    return this.fromMillis(seconds * 1000);
  }

  static fromObject(obj, opts = {utc: false}){
    let now = Instant.now();
    if (opts.utc){
      now = now.utc();
    }

    let defaulted = Object.assign(now.toObject(), {hour: 0, minute: 0, second: 0, millisecond: 0}),
        date = objectToDate(obj, defaulted, opts.utc);

    return new Instant({date: date, utc: opts.utc});
  }

  static fromISOString(text){
  }

  static fromString(text, fmt){
  }

  //operate on many instants
  static max(...instants){
  }

  static min(...instants){
  }

  //basics

  _clone(alts = {}){
    return new Instant(Object.assign(this._c, alts));
  }

  //localization

  locale(l){
    if (typeof(l) === 'undefined'){
      return this._c.localeConfig || 'us-en';
    }
    else{
      return this._clone({locale: l});
    }
  }

  //zones and offsets

  isUTC(){
    return this._c.utc;
  }

  utc(){
    return this._c.utc ? this : this._clone({utc: true, offset: 0});
  }

  local(){
    return !this._c.utc ? this : this._clone({utc: false, offset: 0});
  }

  timezone(opts = {}){
    //wait for formatToParts()
  }

  utcOffset(n){
    if (typeof(n) === 'undefined'){
      return this._c.offset;
    }
    else{
      return this._clone({offset: n, utc: true});
    }
  }

  asInUTCOffset(n){
    return this._clone({offset: n, utc: true});
  }

  //get/set date and time

  set(values){
    let mixed = Object.assign(this.toObject(), values);
    return this._clone({date: objectToDate(mixed)});
  }

  //convenience getters
  get(unit){
    return this[unit]();
  }

  weekday(){
    return this.isUTC ? this._shifted.getUTCDay() : this._shifted.getDay();
  }

  //useful info

  isInLeapYear(){
    let year = this.year();
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  isDST(){
    return this.utcOffset() > this.month(0).utcOffset() || this.utcOffset() > this.month(5).utcOffset();
  }

  daysInMonth(){
    let year = this.year(),
        month = this.month();

    return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  }

  daysInYear(){
    return this.isInLeapYear() ? 366 : 365;
  }

  //generate strings and other values
  toFormatString(fmt, opts = {}){
    return Formatter.create(this._c, opts).formatFromString(this);
  }

  toLocalString(opts = {}){
    return Formatter.create(this._c, opts).formatDate(this);
  }

  toISO(){
    return Formatter.create({locale: 'en'}).formatFromString(this, 'yyyy-MM-ddTHH:mm:ss.SSSZ');
  }

  toString(){
    return this.utc().toISO();
  }

  valueOf(){
    return this._d.valueOf();
  }

  toJSON(){
    return this.toISO();
  }

  toObject(opts = {}){
    return {
      year: this.year(),
      month: this.month(),
      day: this.day(),
      hour: this.hour(),
      minute: this.minute(),
      second: this.second(),
      millisecond: this.millisecond()
    };
  }

  toJSDate(){
    return new Date(this._d);
  }

  resolvedLocaleOpts(opts = {}){
    return Formatter.create(this._c, opts).resolvedOptions();
  }

  //add/subtract/compare
  plus(durationOrNumber, type){
    let dur = friendlyDuration(durationOrNumber, type);
    this._clone({date: adjustTime(this, dur)});
  }

  minus(durationOrNumber, type){
    let dur = friendlyDuration(durationOrNumber, type).negate();
    this._clone({date: adjustTime(this, dur)});
  }

  diff(otherInstant, opts = {granularity: 'millisecond'}){
  }

  diffNow(opts = {granularity : 'millisecond'}){
  }
}

Instant.prototype.year = makeGetSet('year', GetSet.getYear);
Instant.prototype.month = makeGetSet('month', GetSet.getMonth);
Instant.prototype.day = makeGetSet('day', GetSet.getDay);
Instant.prototype.hour = makeGetSet('hour', GetSet.getHour);
Instant.prototype.minute = makeGetSet('minute', GetSet.getMinute);
Instant.prototype.second = makeGetSet('second', GetSet.getSecond);
Instant.prototype.millisecond = makeGetSet('millisecond', GetSet.getMillisecond);
