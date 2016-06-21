import {Duration} from './duration';
import {Formatter} from './impl/formatter';
import {FixedOffsetZone} from './impl/fixedOffsetZone';
import {LocalZone} from './impl/localZone';
import {IntlZone} from './impl/intlZone';

function isUndefined(o){
  return typeof(o) === 'undefined';
}

function now(){
  return new Date().valueOf();
}

function clone(inst, alts = {}){
  let current = {ts: inst.ts, zone: inst.zone, c: inst.c, o: inst.o};
  return new Instant(Object.assign({}, current, alts, {old: current}));
}

//seems like this might be more complicated than it appears. E.g.:
//https://github.com/v8/v8/blob/master/src/date.cc#L212
function fixOffset(ts, tz, o){
  //1. test whether the zone matches the offset for this ts
  let o2 = tz.offset(ts);
  if (o === o2){
    return [ts, o];
  }

  //2. if not, change the ts by the difference in the offset
  ts -= (o2 - o) * 60 * 1000;

  //3. check it again
  let o3 = tz.offset(ts);

  //4. if it's the same, good to go
  if (o2 === o3){
    return [ts, o2];
  }

  //5. if it's different, steal underpants
  //6. ???
  //7. profit!
  return [ts, o];
}

function tsToObj(ts, offset){

  ts += offset * 60 * 1000;

  let d = new Date(ts);

  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    second: d.getUTCSeconds(),
    millisecond: d.getUTCMilliseconds()
  };
}

function objToTS(obj, offset){

  let d = Date.UTC(obj.year,
                   obj.month - 1,
                   obj.day,
                   obj.hour,
                   obj.minute,
                   obj.second,
                   obj.millisecond);

  return +d - offset * 60 * 1000;
}

function adjustTime(inst, dur){
  let o = inst.o,

      //todo: only do this part if there are higher-order items in the dur
      c = Object.assign({}, inst.c, {
        year: inst.c.year + dur.years(),
        month: inst.c.month + dur.months(),
        day: inst.c.day + dur.days()
      }),
      ts = objToTS(c, o);

  [ts, o] = fixOffset(ts, inst.zone, o);

  let millisToAdd = Duration
        .fromObject({hours: dur.hours(),
                     minutes: dur.minutes(),
                     seconds: dur.seconds(),
                     milliseconds: dur.milliseconds()
                    })
        .as('milliseconds');

  ts += millisToAdd;

  [ts, o] = fixOffset(ts, inst.zone, o);

  return {ts: ts, o: o};
}

function friendlyDuration(durationOrNumber, type){
  return typeof durationOrNumber === 'number' ?
    Duration.fromLength(durationOrNumber, type) :
    durationOrNumber;
}

function isLeap(year){
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export class Instant{

  constructor(config = {}){
    Object.defineProperty(this, 'ts', {
      value: config.ts || Instant.now(),
      enumerable: true
    });

    Object.defineProperty(this, 'zone', {
      value: config.zone || Instant.defaultZone,
      enumerable: true
    });

    Object.defineProperty(this, 'locale', {
      value: config.locale || 'en-us',
      enumerable: true
    });

    let unchanged = (config.old && config.old.ts === this.ts && config.old.zone.equals(this.zone)),
        c = unchanged ? config.old.c : tsToObj(this.ts, this.zone.offset(this.ts)),
        o = unchanged ? config.old.o : this.zone.offset(this.ts);

    Object.defineProperty(this, 'c', {value: c});
    Object.defineProperty(this, 'o', {value: o});
  }

  static get defaultZone(){
    return new LocalZone();
  }

  //create instants

  static now(){
    return new Instant({ts: now()});
  }

  static fromJSDate(date){
    return new Instant({ts: date.valueOf()});
  }

  static fromMillis(milliseconds){
    return new Instant({ts: milliseconds});
  }

  static fromUnix(seconds){
    return this.fromMillis(seconds * 1000);
  }

  static fromObject(obj, opts = {utc: false, zone: null}){
    let tsNow = now(),
        zone = opts.zone ? opts.zone : (opts.utc ? new FixedOffsetZone(0) : new LocalZone()),
        offsetProvis = zone.offset(tsNow),
        defaulted = Object.assign(tsToObj(tsNow, offsetProvis), {hour: 0, minute: 0, second: 0, millisecond: 0}, obj),
        tsProvis = objToTS(defaulted, offsetProvis),
        [tsFinal, _] = fixOffset(tsProvis, zone, offsetProvis);

    return new Instant({ts: tsFinal, zone: zone});
  }

  static fromISOString(text){
  }

  static fromString(text, fmt){
  }

  //localization

  locale(l){
    if (isUndefined(l)){
      return this.locale;
    }
    else{
      return clone(this, {locale: l});
    }
  }

  //zones and offsets

  utc(){
    return this.useUTCOffset(0);
  }

  useUTCOffset(offset, opts = {keepCalendarTime: false}){
    return this.rezone(new FixedOffsetZone(offset), opts);
  }

  local(){
    return this.rezone(new LocalZone());
  }

  timezone(zoneName){
    return this.rezone(new IntlZone(zoneName));
  }

  rezone(zone, opts = {keepCalendarTime: false}){
    if (zone.equals(this.zone)){
      return this;
    }
    else {
      //this keepCalendarTime thing probably doesn't work for variable-offset zones
      let newTS = opts.keepCalendarTime ? this.ts - this.o + zone(this.ts) : this.ts;
      return clone(this, {ts: newTS, zone: zone});
    }
  }

  timezoneName(opts = {}){
    return this.zone.name(opts);
  }

  isOffsetFixed(){
    return this.zone.universal();
  }

  isInDST(){
    if (this.isOffsetFixed()){
      return false;
    }
    else{
      return this.offset() > this.month(1).offset();
    }
  }

  //getters/setters
  get(unit){
    return this[unit]();
  }

  set(values){
    let mixed = Object.assign(this.toObject(), values);
    return clone(this, {ts: objToTS(mixed, this.o)});
  }

  year(v){
    return isUndefined(v) ? this.c.year : this.set({year: v});
  }

  month(v){
    return isUndefined(v) ? this.c.month : this.set({month: v});
  }

  day(v){
    return isUndefined(v) ? this.c.day : this.set({day: v});
  }

  hour(v){
    return isUndefined(v) ? this.c.hour : this.set({hour: v});
  }

  minute(v){
    return isUndefined(v) ? this.c.minute : this.set({minute: v});
  }

  second(v){
    return isUndefined(v) ? this.c.second : this.set({second: v});
  }

  millisecond(v){
    return isUndefined(v) ? this.c.millisecond : this.set({millsecond: v});
  }

  weekday(){
    return "Not implemented";
  }

  offset(){
    return this.zone.offset(this.ts);
  }

  //useful info
  isInLeapYear(){
    let year = this.year();
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  daysInMonth(){
    if (this.month() == 2){
      return isLeap(this.year()) ? 29 : 28;
    }
    else{
      return [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][this.month() - 1];
    }
  }

  daysInYear(){
    return leap(this.year()) ? 366 : 365;
  }

  //generate strings and other values
  toFormatString(fmt, opts = {}){
    return Formatter.create(this, opts).formatFromString(this);
  }

  toLocaleString(opts = {}){
    return Formatter.create(this, opts).formatDate(this);
  }

  toISO(){
    return Formatter.create({locale: 'en'}).formatFromString(this, 'yyyy-MM-ddTHH:mm:ss.SSSZ');
  }

  toString(){
    return this.utc().toISO();
  }

  valueOf(){
    return this.ts;
  }

  toJSON(){
    return this.toISO();
  }

  toObject(opts = {}){
    return Object.assign({}, this.c);
  }

  toJSDate(){
    return new Date(this.ts);
  }

  resolvedLocaleOpts(opts = {}){
    return Formatter.create(this, opts).resolvedOptions();
  }

  //add/subtract/compare
  plus(durationOrNumber, type){
    let dur = friendlyDuration(durationOrNumber, type);
    return clone(this, adjustTime(this, dur));
  }

  minus(durationOrNumber, type){
    let dur = friendlyDuration(durationOrNumber, type).negate();
    return clone(this, adjustTime(this, dur));
  }

  startOf(unit){
    let o = {};
    switch (unit) {
      case 'year': o.month = 1;
      case 'month': o.day = 1;
      case 'day': o.hour = 0;
      case 'hour': o.minute = 0;
      case 'minute': o.second = 0;
      case 'second': o.millisecond = 0;
    }
    return this.set(o);
  }

  endOf(unit){
    return this
      .startOf(unit)
      .plus(1, unit)
      .minus(1, 'milliseconds');
  }

  diff(otherInstant, opts = {granularity: 'millisecond'}){
  }

  diffNow(opts = {granularity : 'millisecond'}){
  }

  //operate on many instants
  static max(...instants){
  }

  static min(...instants){
  }
}
