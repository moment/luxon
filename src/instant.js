import {Duration} from './duration';
import {Interval} from './interval';
import {Formatter} from './impl/formatter';
import {FixedOffsetZone} from './impl/fixedOffsetZone';
import {LocalZone} from './impl/localZone';
import {IntlZone} from './impl/intlZone';
import {Util} from './impl/util';
import {ISOParser} from './impl/isoParser';

function now(){
  return new Date().valueOf();
}

function clone(inst, alts = {}){
  let current = {ts: inst.ts, zone: inst.zone, c: inst.c, o: inst.o, loc: inst.loc, nums: inst.nums};
  return new Instant(Object.assign({}, current, alts, {old: current}));
}

//Seems like this might be more complicated than it appears. E.g.:
//https://github.com/v8/v8/blob/master/src/date.cc#L212
function fixOffset(ts, tz, o, leaveTime = false){
  //1. test whether the zone matches the offset for this ts
  let o2 = tz.offset(ts);
  if (o === o2){
    return [ts, o];
  }

  //2. if not, change the ts by the difference in the offset
  if (!leaveTime){
    ts -= (o2 - o) * 60 * 1000;
  }

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

function objToTS(obj, zone, offset){

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

  let tsProvis = +d - offset * 60 * 1000;
  return fixOffset(tsProvis, zone, offset);
}

function adjustTime(inst, dur){
  let oPre = inst.o,

      //todo: only do this part if there are higher-order items in the dur
      c = Object.assign({}, inst.c, {
        year: inst.c.year + dur.years(),
        month: inst.c.month + dur.months(),
        day: inst.c.day + dur.days()
      }),
      [ts, o] = objToTS(c, inst.zone, oPre);

  let millisToAdd = Duration
        .fromObject({hours: dur.hours(),
                     minutes: dur.minutes(),
                     seconds: dur.seconds(),
                     milliseconds: dur.milliseconds()
                    })
        .as('milliseconds');

  if (millisToAdd != 0){
    ts += millisToAdd;
    [ts, o] = fixOffset(ts, inst.zone, o, true);
  }

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
      value: config.outputCal || null,
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
        [tsFinal, _] = objToTS(defaulted, zone, offsetProvis);

    return new Instant({ts: tsFinal, zone: zone});
  }

  static fromISO(text, opts = {acceptOffset: false, assumeUTC: false}){
    let parsed = ISOParser.parseISODate(text);
    if (parsed){
      let {local, offset} = parsed,
          zone = local ? (opts.assumeUTC ? new FixedOffsetZone(0) : new LocalZone()) : new FixedOffsetZone(offset),
          inst = Instant.fromObject(parsed, {zone: zone});

      return opts.acceptOffset ? inst : inst.local();
    }
    else{
      return null;
    }
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
      let newTS = opts.keepCalendarTime ? this.ts + (this.o - zone.offset(this.ts)) * 60 * 1000 : this.ts;
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
      return this.offset() > this.month(0).offset() || this.offset() > this.month(5).offset();
    }
  }

  get(unit){
    return this[unit]();
  }

  set(values){
    let mixed = Object.assign(this.toObject(), values),
        [ts, o] = objToTS(mixed, this.zone, this.o);
    return clone(this, {ts: ts, o: o});
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
    return this.toISO();
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

  diff(otherInstant, ...units){

    if (units.length == 0) units = ['milliseconds'];

    let flipped = otherInstant.valueOf() > this.valueOf(),
        cursor = flipped ? this : otherInstant,
        post = flipped ? otherInstant : this,
        lowestOrder = null,
        accum = {};

    if (units.indexOf('years') >= 0){

      let dYear = post.year() - cursor.year();

      cursor = cursor.year(post.year());

      if (cursor > post){
        cursor = cursor.minus(1, 'years');
        dYear -= 1;
      }

      accum.years = dYear;
      lowestOrder = 'years';
    }

    if (units.indexOf('months') >= 0){
      let dYear = post.year() - cursor.year(),
          dMonth = post.month() - cursor.month() + dYear * 12;

      cursor = cursor.set({year: post.year(), month: post.month()});

      if (cursor > post){
        cursor = cursor.minus(1, 'months');
        dMonth -= 1;
      }

      accum.months = dMonth;
      lowestOrder = 'months';
    }

    //days is tricky because we want to ignore offset differences
    if (units.indexOf('days') >= 0){
      //there's almost certainly a quicker, simpler way to do this
      let utcDayStart = (i) => Instant.fromJSDate(Util.asIfUTC(i)).startOf('day').valueOf(),
          ms = utcDayStart(post) - utcDayStart(cursor),
          dDay = Math.floor(Duration.fromLength(ms).shiftTo('days').days());

      cursor = cursor.set({year: post.year(), month: post.month(), day: post.day()});

      if (cursor > post){
        cursor.minus(1, 'day');
        dDay =- 1;
      }

      accum.days = dDay;
      lowestOrder = 'days';
    }

    let remaining = Duration.fromLength(post - cursor),
        moreUnits = units.filter((u) => ['hours', 'minutes', 'seconds', 'milliseconds'].indexOf(u) >= 0),
        shiftTo = moreUnits.length > 0 ? moreUnits : [lowestOrder],
        shifted = remaining.shiftTo(...shiftTo),
        merged = shifted.plus(Duration.fromObject(accum));

    return flipped ? merged.negate() : merged;
  }

  diffNow(...units){
    return this.diff(Instant.now(), ...units);
  }

  until(otherInstant, opts = {}){
    return Interval.fromInstants(this, otherInstant, opts);
  }

  hasSame(otherInstant, unit){
    if (unit === 'millisecond'){
      return this.valueOf() === otherInstant.valueOf();
    }
    else{
      let inputMs = otherInstant.valueOf();
      return this.startOf(unit) <= inputMs && inputMs <= this.endOf(unit);
    }
  }

  equals(other){
    //todo - check other stuff?
    return this.valueOf() === other.valueOf();
  }

  static min(...instants){
    return Util.bestBy(instants, (i) => i.valueOf(), Math.min);
  }

  static max(...instants){
    return Util.bestBy(instants, (i) => i.valueOf(), Math.max);
  }
}
