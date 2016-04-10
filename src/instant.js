import {Duration} from './duration';
import {Formatter} from './impl/formatter';
import {Gregorian} from './impl/gregorian';
import {FixedOffsetZone} from './impl/fixedOffsetZone';
import {LocalZone} from './impl/localZone';

function isUndefined(o){
  return typeof(o) == 'undefined';
}

function now(){
  return new Date().valueOf();
}

function clone(inst, alts = {}){
  let current = {ts: inst.ts, zone: inst.zone, c: inst.c, o: inst.o};
  return new Instant(Object.assign(current, alts, {old: Object.assign({}, current)}));
}

function rezone(inst, zone, opts){
  if (zone.equals(inst.zone)){
    return inst;
  }
  else {
    //inst keepCalendarTime thing probably doesn't work for variable-offset zones
    let newTS = opts.keepCalendarTime ? inst.ts - inst.o + zone(inst.ts) : inst.ts;
    return clone(inst, {ts: newTS, zone: zone});
  }
}

function fixOffset(ts, tz, o){
  //todo! actually implement me!
  //outline:
  //1. test whether the zone matches the offset
  //2. if not, change the ts by the difference in the offset
  //3. check it again
  //4. if it's the same, good to go
  //5. if it's different, steal underpants
  //6. profit!
  return [ts, tz, o];
}

function adjustTime(inst, dur){
  let tz = inst.zone,
      o = tz.offset(this.ts),
      c = Object.assign({}, inst.c, {
        year: inst.c.year + dur.years,
        month: inst.c.month + dur.months,
        day: inst.c.day + dur.days
      }),
      ts = Gregorian.objToTS(c, o);

  [ts, tz, o] = fixOffset(ts, tz, o);

  let millisToAdd = Duration
        .fromObject(leftovers)
        .shiftTo('milliseconds')
        .milliseconds();

  ts += millisToAdd;

  [ts, tz, o] = fixOffset(ts, tz, o);

  return {ts: Gregorian.tsToObj(ts, o), zone: tz};
}

function friendlyDuration(durationOrNumber, type){
  return typeof durationOrNumber === 'number' ?
    Duration.fromLength(durationOrNumber, type) :
    durationOrNumber;
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

    let c = (config.old && config.old.ts == this.ts && config.old.zone.equals(this.zone)) ?
          config.old.c :
          Gregorian.tsToObj(this.ts, this.zone.offset(this.ts));

    let o = (config.old && config.old.zone.equals(this.zone)) ?
          config.old.o :
          this.zone.offset(this.ts);

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

  static fromObject(obj, opts = {utc: false}){
    let tsNow = now();

    let zone = opts.utc ? new FixedOffsetZone(0) : new LocalZone(),
        offsetProvis = zone.offset(tsNow),
        defaulted = Object.assign(Gregorian.tsToObj(tsNow, offsetProvis), {hour: 0, minute: 0, second: 0, millisecond: 0}, obj),
        tsProvis = Gregorian.objToTS(defaulted, offsetProvis),
        [tsFinal, zoneFinal, _] = fixOffset(tsProvis, zone, offsetProvis);

    return new Instant({ts: tsFinal, zone: zoneFinal});
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

  //localization

  locale(l){
    if (isUndefined(l)){
      return this.locale;
    }
    else{
      return this.clone(this, {locale: l});
    }
  }

  //zones and offsets

  utc(){
    return this.useUTCOffset(0);
  }

  useUTCOffset(offset, opts = {keepCalendarTime: false}){
    return rezone(this, new FixedOffsetZone(offset), opts);
  }

  local(){
    return rezone(this, new LocalZone());
  }

  timezone(){
    return this.zone;
  }

  timezoneName(opts = {}){
    return this.zone.name(opts);
  }

  isOffsetFixed(){
    return this.zone.universal();
  }

  //getters/setters
  get(unit){
    return this[unit]();
  }

  set(values){
    let mixed = Object.assign(this.toObject(), values);
    return this.clone(this, {ts: Gregorian.objToTS(mixed)});
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

  isDST(){
    return this.offset() > this.month(0).offset() || this.offset() > this.month(5).offset();
  }

  daysInMonth(){
    let year = this.year(),
        month = this.month();

    return Gregorian.daysInMonth(year, month);
  }

  daysInYear(){
    return Gregorian.daysInYear(this.year());
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
    this.clone(this, adjustTime(this, dur));
  }

  minus(durationOrNumber, type){
    let dur = friendlyDuration(durationOrNumber, type).negate();
    this.clone(this, adjustTime(this, dur));
  }

  diff(otherInstant, opts = {granularity: 'millisecond'}){
  }

  diffNow(opts = {granularity : 'millisecond'}){
  }
}
