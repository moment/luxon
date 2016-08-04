import {Duration} from "../duration";

export class Util{
  static friendlyDuration(durationOrNumber, type){
    return typeof durationOrNumber === 'number' ?
      Duration.fromLength(durationOrNumber, type) :
      durationOrNumber;
  }

  static isUndefined(o){
    return typeof(o) === 'undefined';
  }

  static pad(input, n = 2){
    return ('0'.repeat(n) + input).slice(-n);
  };

  static towardZero(input){
    return input < 0 ? Math.ceil(input) : Math.floor(input);
  };

  //Instant -> JS date such that the date's UTC time is the instants local time
  static asIfUTC(inst){
    let ts = inst.ts - inst.offset();
    return new Date(ts);
  }

  static asIfLocal(inst){
    let ts = inst.ts + inst.local().offset();
    return new Date(ts);
  }
}
