import {Formatter} from './formatter';

export class FixedOffsetZone {

  constructor(offset){
    this.fixed = offset;
  }

  name(opts = {format: 'wide'}){
    let base = opts.format == 'wide' ? 'Universal Coordinated Time' : 'UTC',
        number = Formatter.formatOffset(this.fixed, {format: 'narrow'});
    return this.fixed == 0 ? 'UTC' : `UTC${number}`;
  }

  universal() {
    return true;
  }

  offset(ts){
    return this.fixed;
  }

  equals(otherZone){
    return (otherZone instanceof FixedOffsetZone) && otherZone.fixed == this.fixed;
  }
}
