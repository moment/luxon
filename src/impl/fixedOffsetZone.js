import {Formatter} from './formatter';

class UTCDatelike {
  constructor(date, offset = 0, skipShift = false){
    this._d = date;
    this._o = offset;

    if (skipShift){
      this._s = new Date(date);
    }
    else{
      this._shift(date, 1);
    }
  }

  _adjust(date, dir){
    return this._o == 0 ? date : new Date(+date + this._o * 60 * 1000 * dir);
  }

  _shift(){
    this._s = this._adjust(this._d, 1);
  }

  _unshift(){
    this._d = this._adjust(this._s, -1);
  }

  getFullYear(){return this._s.getUTCFullYear();}
  getMonth(){return this._s.getUTCMonth();}
  getDate(){return this._s.getUTCDate();}
  getHours(){return this._s.getUTCHours();}
  getMinutes(){return this._s.getUTCMinutes();}
  getSeconds(){return this._s.getUTCSeconds();}
  getMilliseconds(){return this._s.getUTCMilliseconds();}
  getDay(){return this._s.getUTCDay();}
  getTimezoneOffset(){return -this._o;}

  setFullYear(y){
    s.setUTCFullYear(y),
    this._unshift();
  }

  setDate(d){
    s.setUTCDate(d);
    this._unshift();
  }

  setMonth(m){
    s.setUTCMonth(m);
    this._unshift();
  }

  setHours(h){
    s.setUTCHours(h);
    this._unshift();
  }

  setMinutes(m){
    s.setUTCMinutes(m);
    this._unshift();
  }

  setSeconds(s){
    s.setUTCSeconds(s);
    this._unshift();
  }

  setMilliseconds(ms){
    s.setUTCMilliseconds(ms);
    this._unshift();
  }

  setDay(d){
    s.setUTCDay(d);
    this._unshift();
  }

  setUTCOffset(o){
    this._o = o;
    this._shift();
  }

  setTime(ms){
    this._d.setTime(ms);
    this._shift();
  }

  getTime(){
    this._d.getTime();
  }

  valueOf(){
    return this._d.valueOf();
  }
}

export class FixedOffsetZone {

  constructor(offset){
    this._offset = offset;
  }

  name(opts = {format: 'wide'}){
    let base = format == 'wide' ? 'Universal Coordinated Time' : 'UTC',
        number = Formatter.formatOffset(this._offset, {format: 'narrow'});
    return this._offset == 0 ? 'UTC' : `UTC${number}`;
  }

  universal() {
    return true;
  }

  fromDate(date, opts = {keepCalendarTime: false}){
    return new UTCDatelike(date, this._offset, opts.keepCalendarTime);
  }

  fromArgs(args){
    return new UTCDatelike(new Date(Date.UTC(...args)));
  }

  equals(otherZone){
    return (otherZone instanceof FixedOffsetZone) && otherZone._offset == this._offset;
  }
}
