import {Formatter} from "./impl/formatter";
import {Duration} from "./duration";

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
    let def = this.now().toObject();
        date = new Date(
          m.year || def.year,
          (m.month || def.month) - 1,
          m.day || def.day,
          m.hour || 0,
          m.minute || 0,
          m.second || 0,
          m.millisecond || 0);
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

  clone(alts = {}){
    return new Instant(Object.assign(this._c, alts));
  }

  //zones and offsets

  isUTC(){
    return this._c.utc;
  }

  utc(){
    return this._c.utc ? this : this.clone({utc: true});
  }

  local(){
    return !this._c.utc ? this : this.clone({utc: false});
  }

  get timezone(){
  }

  get originalOffset(){
  }

  get offset(){
    return this._c.offset;
  }

  set offset(n){
    return this.clone({alts: {offset: 0}});
  }

  //get/set date and time

  set(values){
  }

  //convenience getters
  get(unit){
    this[unit]();
  }

  get year(){
    return this.isUTC() ? this._d.getUTCFullYear() : this._d.getFullYear();
  }

  get month(){
    return this.isUTC() ? this._d.getUTCMonth() : this._d.getMonth();
  }

  get day(){
    return this.isUTC() ? this._d.getUTCDate() : this._d.getDate();
  }

  get hour(){
    return this.isUTC() ? this._d.getUTCHour() : this._d.getHour();
  }

  get minute(){
    return this.isUTC() ? this._d.getUTCMinute() : this._d.getMinute();
  }

  get second(){
    return this.isUTC() ? this._d.getUTCSecond() : this._d.getSecond();
  }

  get millisecond(){
    return this.isUTC() ? this._d.getUTCMillisecond() : this._d.getMillisecond();
  }

  get weekday(){
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
      minute: this.minue(),
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

  diff(otherInstant, granularity='millisecond'){
  }

  diffNow(granularity='millisecond'){
  }
}
