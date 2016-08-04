import {Duration} from './duration';
import {Formatter} from './impl/formatter';
import {FixedOffsetZone} from './impl/fixedOffsetZone';
import {LocalZone} from './impl/localZone';
import {IntlZone} from './impl/intlZone';
import {Util} from './impl/util';

function bestBy(arr, by, compare) {
  return arr.reduce((best, next) => {
    let pair = [by(next), next];
    if (!best) {
      return pair;
    } else if (compare.apply(null, [best[0], pair[0]]) === best[0]) {
      return best;
    } else {
      return pair;
    }
  }, null)[1];
};

function now(){
  return new Date().valueOf();
}

function clone(inst, alts = {}){
  let current = {ts: inst.ts, zone: inst.zone, c: inst.c, o: inst.o, loc: inst.loc, nums: inst.nums};
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

  //javascript is stupid and i hate it
  if (obj.year < 100 && obj.year >= 0){
    let t = new Date(d);
    t.setFullYear(obj.year);
    d = t.valueOf();
  }

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

    Object.defineProperty(this, 'loc', {
      value: config.loc || 'en-us',
      enumerable: true
    });

    Object.defineProperty(this, 'nums', {
      value: config.nums || null,
      enumerable: true
    });

    Object.defineProperty(this, 'outputCal', {
      value: config.outputCal || 'gregory',
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

  static fromISO(text){
  }

  static fromString(text, fmt){
  }

  locale(l){
    if (Util.isUndefined(l)){
      return this.loc;
    }
    else{
      return clone(this, {loc: l});
    }
  }

  //the Intl polyfill respects the locale's numbering, but not the extension numbering. So unexpose this.
  //numbering(n){
  //  if (Util.isUndefined(n)){
  //    return this.nums;
  //  }
  //  else{
  //    return clone(this, {nums: n});
  //  }
  //}

  //same here
  //outputCalendar(c){
  //  if (Util.isUndefined(c)){
  //    return this.outputCal;
  //  }
  //  else{
  //    return clone(this, {outputCal: c});
  //  }
  //}

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

  get(unit){
    return this[unit]();
  }

  set(values){
    let mixed = Object.assign(this.toObject(), values);
    return clone(this, {ts: objToTS(mixed, this.o)});
  }

  year(v){
    return Util.isUndefined(v) ? this.c.year : this.set({year: v});
  }

  month(v){
    return Util.isUndefined(v) ? this.c.month : this.set({month: v});
  }

  day(v){
    return Util.isUndefined(v) ? this.c.day : this.set({day: v});
  }

  hour(v){
    return Util.isUndefined(v) ? this.c.hour : this.set({hour: v});
  }

  minute(v){
    return Util.isUndefined(v) ? this.c.minute : this.set({minute: v});
  }

  second(v){
    return Util.isUndefined(v) ? this.c.second : this.set({second: v});
  }

  millisecond(v){
    return Util.isUndefined(v) ? this.c.millisecond : this.set({millisecond: v});
  }

  weekday(){
    return Util.asIfUTC(this).getUTCDay();
  }

  offset(){
    return this.zone.offset(this.ts);
  }

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

  toFormatString(fmt, opts = {}){
    return Formatter.create(this, opts).formatInstantFromString(this, fmt);
  }

  toLocaleString(opts = {}){
    return Formatter.create(this, opts).formatInstant(this);
  }

  toISO(){
    return Formatter.create({loc: 'en'}).formatInstantFromString(this, "yyyy-MM-dd'T'HH:mm:ss.SSSZZ");
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

  plus(durationOrNumber, type){
    let dur = Util.friendlyDuration(durationOrNumber, type);
    return clone(this, adjustTime(this, dur));
  }

  minus(durationOrNumber, type){
    let dur = Util.friendlyDuration(durationOrNumber, type).negate();
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

  diff(otherInstant, opts = {units: 'millisecond'}){
  }

  diffNow(opts = {units: 'millisecond'}){
  }

  hasSame(otherInstant, unit){
    if (units === 'millisecond'){
      return this.valueOf() === otherInstant.valueOf();
    }
    else{
      let inputMs = otherInstant.valueOf();
      return this.startOf(unit).valueOf() <= inputMs && inputMs <= this.endOf(unit).valueOf();
    }
  }

  static min(...instants){
    return bestBy(instants, (i) => i.valueOf(), Math.min);
  }

  static max(...instants){
    return bestBy(instants, (i) => i.valueOf(), Math.max);
  }
}
