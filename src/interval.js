import {Util} from './impl/util';
import {Instant} from './instant';
import {Duration} from './duration';

export class Interval{

  constructor(start, end){

    Object.defineProperty(this, 's', {value: start, enumerable: true});
    Object.defineProperty(this, 'e', {value: end, enumerable: true});

  }

  static fromInstants(start, end, opts = {}){
    return new Interval(start, end, opts);
  }

  static after(start, durationOrNumber, unit){
    let dur = Util.friendlyDuration(durationOrNumber, unit);
    return Interval.fromInstants(start, start.plus(dur));
  }

  static before(end, durationOrNumber, unit){
    let dur = Util.friendlyDuration(durationOrNumber, unit);
    return Interval.fromInstants(end.minus(dur), end);
sNull  }

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
    return this.e.minus(1).hasSame(this.s, unit);
  }

  count(unit = 'milliseconds'){
    let start = this.start().startOf(unit),
        end = this.end().startOf(unit);
    return Math.floor(end.diff(start, unit).get(unit)) + 1;
  }

  split(arg){
  }

  overlaps(other){
    return this.e > other.s && this.s < other.e;
  }

  abutsStart(other){
    return +this.e === +other.s;
  }

  abutsEnd(other){
    return +other.e === +this.start;
  }

  engulfs(other){
    return this.s <= other.s && this.e >= other.e;
  }

  divideEqually(numberOfParts){
  }

  intersection(other){
    let s = this.s > other.s ? this.s : other.s,
        e = this.e < other.e ? this.e : other.e;

    if (s > e){
      return null;
    }
    else{
      return Interval.fromInstants(s, e);
    }
  }

  union(other){
    let s = this.s < other.s ? this.s : other.s,
        e = this.e > other.e ? this.e : other.e;

    return Interval.fromInstants(s, e);
  }

  static merge(intervals){
    let [found, final] = intervals
          .sort((a, b) => a.s - b.s)
          .reduce(([found, current], item) => {
            if (!current){
              return [found, item];
            }
            else if (current.overlaps(item) || current.abutsStart(item)){
              return [found, current.union(item)];
            }
            else{
              return [found.concat([current]), item];
            }
          }, [[], null]);
    if (final){
      found.push(final);
    }
    return found;
  }

  static xor(intervals){
    let start = null,
        currentCount = 0,
        results = [],
        ends = intervals
          .map(i => [{time: i.s, type: 's'},
                     {time: i.e, type: 'e'}]),
        arr = Util.flatten(ends)
          .sort((a, b) => a.time - b.time);

    for (let i of arr){

      currentCount += i.type == 's' ? 1 : -1;

      if (currentCount === 1){
        start = i.time;
      }
      else {
        if (start && +start != +i.time){
          results.push(Interval.fromInstants(start, i.time));
        }

        start = null;
      }
    }

    return Interval.merge(results);
  }

  difference(...others){
    return Interval.xor([this].concat(others))
      .map((i) => this.intersection(i))
      .filter((i) => i && !i.isEmpty());
  }

  equals(other){
    return this.s.equals(other.s) && this.e.equals(other.e);
  }

  isEmpty(){
    return this.s.valueOf() === this.e.valueOf();
  }

  isValid(){
    return this.s <= this.e;
  }

  isAfter(other){
    return this.s > other;
  }

  isBefore(other){
    return this.e.plus(1) < other;
  }

  contains(instant){
    return this.s <= instant && this.e > instant;
  }

  toString(){
    return "[" + this.s.toString() + " - " + this.e.toString() + ")";
  }

  toISO(){}

  toFormatString(overallFormat, dateFormat){}

  toLocaleString(overallFormat){}
}
