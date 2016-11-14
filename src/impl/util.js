import {Duration} from "../duration";

export class Util{
  static friendlyDuration(durationOrNumber, type){
    return Util.isNumber(durationOrNumber) ?
      Duration.fromLength(durationOrNumber, type) :
      durationOrNumber;
  }

  static isUndefined(o){
    return typeof(o) === 'undefined';
  }

  static isNumber(o){
    return typeof(o) === 'number';
  }

  static pad(input, n = 2){
    return ('0'.repeat(n) + input).slice(-n);
  };

  static towardZero(input){
    return input < 0 ? Math.ceil(input) : Math.floor(input);
  };

  //Instant -> JS date such that the date's UTC time is the instant's local time
  static asIfUTC(inst){
    let ts = inst.ts - inst.offset();
    return new Date(ts);
  }

  //http://stackoverflow.com/a/15030117
  static flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
      return flat.concat(Array.isArray(toFlatten) ? Util.flatten(toFlatten) : toFlatten);
    }, []);
  }

  static bestBy(arr, by, compare) {
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

  static zip(...arrays){
    return arrays[0].map(
      (_, c) => arrays.map(arr => arr[c]));
  }

  static isLeapYear(year){
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }

  static daysInMonth(year, month){
    if (month === 2){
      return Util.isLeapYear(year) ? 29 : 28;
    }
    else{
      return [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
    }
  }
}
