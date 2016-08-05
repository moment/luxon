import {Util} from './impl/util';
import {Instant} from './instant';
import {Duration} from './duration';

export class Interval{

  constructor(start, end, opts = {openStart: false, openEnd: false}){
    //todo - break if start > end
    Object.defineProperty(this, "s", {value: start, enumerable: true});
    Object.defineProperty(this, "e", {value: end, enumerable: true});

    Object.defineProperty(this, 'openStart', {value: opts['openStart'], enumerable: true});
    Object.defineProperty(this, 'openEnd', {value: opts['openEnd'], enumerable: true});

    let firstTick = opts['openStart'] ? start : start.plus(1, 'millisecond'),
        lastTick = opts['openEnd'] ? end : end.minus(1, 'millisecond');

    Object.defineProperty(this, "firstTick", {value: firstTick, enumerable: false});
    Object.defineProperty(this, "lastTick", {value: end, enumerable: false});
  }

  static fromInstants(start, end){
    return new Interval(start, end);
  }

  static after(start, durationOrNumber, unit){
    let dur = Util.friendlyDuration(durationOrNumber, unit);
    return Interval.fromInstants(start, start.plus(dur));
  }

  static before(end, durationOrNumber, unit){
    let dur = Util.friendlyDuration(durationOrNumber, unit);
    return Interval.fromInstants(end.minus(dur), end);
  }

  toDuration(...units){
    return this.e.diff(this.s, ...units);
  }

  start(){
    return this.s;
  }

  end(){
    return this.e;
  }

  length(unit = 'milliseconds'){
    return this.toDuration(...[unit]).get(unit);
  }

  hasSame(unit){
    this.firstTick.isSame(this.lastTick, unit);
  }

  count(unit = 'milliseconds'){
    let start = this.start().startOf(unit),
        end = this.end().startOf(unit);
    return Math.floor(end.diff(start, unit).get(unit)) + 1;
  }

  split(arg){
  }

  overlaps(other){
    return this.lastTick > other.firstTick && this.firstTick < other.lastTick;
  }

  abutsStart(other){
    return +this.lastTick + 1 === +other.firstTick;
  }

  abutsEnd(other){
    return +other.lastTick + 1 === +this.firstTick;
  }

  engulfs(other){
    return this.firstTick <= other.firstTick && this.lastTick >= other.lastTick;
  }

  divideEqually(numberOfParts){
  }

  intersection(other){
    //needs to inherit this's endness
  }

  union(other){
    //needs to inherit this's endness
  }

  xor(other){
    //needs to inherit this's endness
  }

  equals(other){
    return this.s === other.s
      && this.e === other.e
      && this.openStart == other.openStart
      && this.openEnd == other.openEnd;
  }

  isEmpty(){
    return +this.firstTick === +this.lastTick;
  }

  isFuture(){
    return this.firstTick > Instant.now();
  }

  isPast(){
    return this.lastTick < Instant.now();
  }

  isCurrent(){
    return this.contains(Instant.now());
  }

  isStartOpen(){
    return this.openStart;
  }

  isEndOpen(){
    return this.openEnd;
  }

  contains(instant){
    return this.start() < instant &&
      this.end() > instant;
  }

  toString(){}

  toISO(){}

  toFormatString(overallFormat, dateFormat){}

  toLocaleString(overallFormat){}

  isInDST(){
    return this.offset() > this.month(0).offset() || this.offset() > this.month(5).offset();
  }

}
