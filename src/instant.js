import {Duration} from './duration';
import {Formatter} from './impl/formatter';
import {FixedOffsetZone} from './impl/fixedOffsetZone';
import {LocalZone} from './impl/localZone';

function isUndefined(o){
  return typeof(o) == 'undefined';
}

function objectToArgs(obj, defaults){
  return [
    obj.year || defaults.year,
    (obj.month || defaults.month) - 1,
    obj.day || defaults.day,
    obj.hour || defaults.hour,
    obj.minute || defaults.minute,
    obj.second || defaults.second,
    obj.millisecond || defaults.millisecond
  ];
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
    this._c = config;

    if (this._c.zone === null){
      this._c.zone = new LocalZone();
    }

    this._d = config.date;
    this._z = this._c.zone;
  }

  static get defaultZone(){
    return new LocalZone();
  }

  //create instants

  static now(){
    return new Instant({date: Instant.defaultZone.fromDate(new Date())});
  }

  static fromJSDate(date){
    return new Instant({date: Instant.defaultZone.fromDate(new Date(date))});
  }

  static fromMillis(milliseconds){
    return new Instant({date: Instant.defaultZone.fromDate(new Date(milliseconds))});
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
        zone = opts.utc ? new FixedOffsetZone(0) : new LocalZone(),
        date = zone.fromArgs(objectToArgs(obj, defaulted));

    return new Instant({date: date, zone: zone});
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

  _rezone(zone, opts){
    if (zone.equals(this._z)){
      return this;
    }
    else {
      return this._clone({
        date: zone.fromDate(this._d, opts),
        zone: zone
      });
    }
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

  utc(){
    return this.useUTCOffset(0);
  }

  useUTCOffset(offset, opts = {keepCalendarTime: false}){
    return this._rezone(new FixedOffsetZone(offset), opts);
  }

  local(){
    return this._rezone(new LocalZone());
  }

  timezone(){
    return this._z;
  }

  timezoneName(opts = {}){
    return this._z.name(opts);
  }

  isOffsetFixed(){
    return this._z.universal();
  }

  //getters/setters
  get(unit){
    return this[unit]();
  }
  set(values){
    let mixed = Object.assign(this.toObject(), values);
    return this._clone({date: this._z.fromArgs(objectToArgs(mixed))});
  }

  year(v){
    return isUndefined(v) ? this._d.getFullYear() : this.set({year: v});
  }

  month(v){
    return isUndefined(v) ? this._d.getMonth() + 1 : this.set({month: v});
  }

  day(v){
    return isUndefined(v) ? this._d.getDate() : this.set({day: v});
  }

  hour(v){
    return isUndefined(v) ? this._d.getHours() : this.set({hour: v});
  }

  minute(v){
    return isUndefined(v) ? this._d.getMinutes() : this.set({minute: v});
  }

  second(v){
    return isUndefined(v) ? this._d.getSeconds() : this.set({second: v});
  }

  millisecond(v){
    return isUndefined(v) ? this._d.getMilliseconds() : this.set({millsecond: v});
  }

  weekday(){
    return this._d.getDay();
  }

  offset(){
    return -this._d.getTimezoneOffset();
  }

  //useful info

  isInLeapYear(){
    let year = this.year();
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  isDST(){
    return this.offset() > this.month(0).offset() || this.offset() > this.month(5).offset();
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
    this._clone({date: this._z.fromDate(adjustTime(this, dur))});
  }

  minus(durationOrNumber, type){
    let dur = friendlyDuration(durationOrNumber, type).negate();
    this._clone({date: this._z.fromDate(adjustTime(this, dur))});
  }

  diff(otherInstant, opts = {granularity: 'millisecond'}){
  }

  diffNow(opts = {granularity : 'millisecond'}){
  }
}
