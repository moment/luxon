export class Duration {

  constructor(obj){
  }

  static fromLength(count, unit){
  }

  static fromObject(obj){
    new Duration(obj);
  }

  static fromISO(text){}

  static fromString(text, fmt){}

  toFormatString(){}

  toObject(){}

  toISO(){}

  toJSON(){}

  plus(countOrDuration, unit='milliseconds'){
  }

  subtract(countOrDuration, unit='milliseconds'){
  }

    in(unit){
    }

  get(unit){
  }

  as(unit){
  }

  shiftTo(unit){
  }
}
