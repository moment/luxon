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
}
