import {Formatter} from './formatter';
import {Util} from './util';

export class FixedOffsetZone {

  constructor(offset){
    this.fixed = offset;
  }

  get name(){
    let hours = this.fixed/60,
        minutes = Math.abs(this.fixed % 60),
        sign = hours > 0 ? '+' : '-',
        base = sign + Math.abs(hours),
        number = minutes > 0 ? `${base}:${Util.pad(minutes, 2)}` : base;

    return this.fixed == 0 ? 'UTC' : `UTC${number}`;
  }

  get universal() {
    return true;
  }

  offset(ts){
    return this.fixed;
  }

  equals(otherZone){
    return (otherZone instanceof FixedOffsetZone) && otherZone.fixed == this.fixed;
  }
}
