export class Interval {

  constructor(start, end){
  }

  static fromInstants(start, end){
    new Interval(start, end);
  }

  static after(start, duration){
  }

  static before(end, duration){
  }

  toDuration(){}

  start(){}

  end(){}

  length(unit){}

  hasSame(unit){}

  count(durationOrUnit, opts){}

  iterate(durationOrUnit, opts){}

  split(arg){
  }

  overlaps(other){
  }

  abuts(other){
  }

  engulfs(other){
  }

  intersection(other){
  }

  union(other){
  }

  equals(other){
  }

  isFuture(){
  }

  isPast(){
  }

  isCurrent(){
  }

  toFormatString(overallFormat, dateFormat){}

  toLocaleString(overallFormat){}
}
