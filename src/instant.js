import {Duration} from './duration';
import {Formatter} from './impl/formatter';
import {UTCDate} from './impl/utcdate';

function isUndefined(o){
  return typeof(o) == 'undefined';
}

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

  return utc ? toUTC(Date.UTC(...args)) : new Date(...args);
}

function toUTC(dateOrMS, offset=0){
  return new UTCDate(new Date(dateOrMS), -offset);
}

function adjustTime(inst, dur){
  let d = new Date(inst._d);

  //things with change the date exclusively
  if (dur.years()) {d.setYear(d, d.getYear() + dur.years());}
  if (dur.months()) {d.setMonth(d, d.getMonth() + dur.months());}
  if (dur.days()) {d.setDay(d, d.getDay() + dur.days());}

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
    this._c = Object.assign({utc: false, offset: 0}, config);
    this._d = config.date;
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
    if (isUndefined(l)){
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
    return this._c.utc ? this : this._clone({
      date: toUTC(this._d),
      utc: true,
      offset: 0
    });
  }

  local(){
    return !this._c.utc ? this : this._clone({
      date: new Date(+this._d),
      utc: false,
      offset: 0
    });
  }

  timezone(opts = {}){
    //wait for formatToParts()
  }

  utcOffset(offset){
    if (isUndefined(offset)){
      return this._c.offset;
    }
    else{
      return this._clone({
        date: toUTC(this._d, offset),
        offset: offset,
        utc: true});
    }
  }

  asInUTC(offset = 0){
    return this._clone({
      date: toUTC(this._d, offset, true),
      offset: offset,
      utc: true});
  }

  //get/set date and time

  set(values){
    let mixed = Object.assign(this.toObject(), values);
    return this._clone({date: objectToDate(mixed)});
  }

  //convenience getters/setters
  get(unit){
    return this[unit]();
  }

  year(v){
    return isUndefined ? this._d.getFullYear() : this.set({year: v});
  }

  month(v){
    return isUndefined ? this._d.getMonth() + 1 : this.set({month: v});
  }

  day(v){
    return isUndefined ? this._d.getDate() : this.set({day: v});
  }

  hour(v){
    return isUndefined ? this._d.getHours() : this.set({hour: v});
  }

  minute(v){
    return isUndefined ? this._d.getMinutes() : this.set({minute: v});
  }

  second(v){
    return isUndefined ? this._d.getSeconds() : this.set({second: v});
  }

  millisecond(v){
    return isUndefined ? this._d.getMilliseconds() : this.set({millsecond: v});
  }

  weekday(){
    return this._d.getDay();
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

  toLocaleString(opts = {}){
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
