import {Formatter} from "./impl/formatter";
import {Duration} from "./duration";

function objectToDate(obj, defaults){
  return new Date(
    obj.year || defaults.year,
    (obj.month || defaults.month) - 1,
    obj.day || defaults.day,
    obj.hour || defaults.hour,
    obj.minute || defaults.minute,
    obj.second || defaults.second,
    obj.millisecond || defaults.millisecond
  );
}

export class Instant {

  constructor(config = {}){
    this._c = config;
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

  static fromObject(obj){
    let now = this.now().toObject(),
        lowOrder = {hour: 0, minute: 0, second: 0, millisecond: 0},
        date = objectToDate(obj, Object.assign(now, lowOrder));
    return new Instant({date: date});
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

  //zones and offsets

  isUTC(){
    return this._c.utc;
  }

  utc(){
    return this._c.utc ? this : this._clone({utc: true});
  }

  local(){
    return !this._c.utc ? this : this._clone({utc: false});
  }

  get timezone(){
  }

  get originalOffset(){
  }

  get offset(){
    return this._c.offset;
  }

  set offset(n){
    return this._clone({alts: {offset: 0}});
  }

  //get/set date and time

  set(values){
    let mixed = Object.assign(this.toObject(), values);
    return this._clone({date: objectToDate(mixed)});
  }

  //convenience getters
  get(unit){
    this[unit]();
  }

  year(){
    return this.isUTC() ? this._d.getUTCFullYear() : this._d.getFullYear();
  }

  month(){
    return (this.isUTC() ? this._d.getUTCMonth() : this._d.getMonth()) + 1;
  }

  day(){
    return this.isUTC() ? this._d.getUTCDate() : this._d.getDate();
  }

  hour(){
    return this.isUTC() ? this._d.getUTCHours() : this._d.getHours();
  }

  minute(){
    return this.isUTC() ? this._d.getUTCMinutes() : this._d.getMinutes();
  }

  second(){
    return this.isUTC() ? this._d.getUTCSeconds() : this._d.getSeconds();
  }

  millisecond(){
    return this.isUTC() ? this._d.getUTCMilliseconds() : this._d.getMilliseconds();
  }

  weekday(){
    return this.isUTC() ? this._d.getUTCDay() : this._d.getDay();
  }

  //useful info

  isInLeapYear(){}

  isDST(){}

  isInDSTShift(){}

  daysInMonth(){}

  //generate strings and other values

  toFormatString(fmd){
  }

  toLocaleString(opts = {}){
    return Formatter.create(this._c, opts).formatDate(this._d);
  }

  toISO(){
  }

  toString(){
  }

  valueOf(){
    return this._d.valueOf();
  }

  toJSON(){}

  toObject(){
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
  }

  minus(druationOrNumber, type){
  }

  diff(otherInstant, opts = {granularity: 'millisecond'}){
  }

  diffNow(opts = {granularity : 'millisecond'}){
  }
}
