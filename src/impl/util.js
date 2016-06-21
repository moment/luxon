import {Duration} from "../duration";

export class Util{
  static friendlyDuration(durationOrNumber, type){
    return typeof durationOrNumber === 'number' ?
      Duration.fromLength(durationOrNumber, type) :
      durationOrNumber;
  }
}
