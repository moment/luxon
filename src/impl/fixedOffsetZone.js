import {Formatter} from './formatter';

export class FixedOffsetZone {

  constructor(offset){
    this._offset = offset;
  }

  name(opts = {format: 'wide'}){
    let base = opts.format == 'wide' ? 'Universal Coordinated Time' : 'UTC',
        number = Formatter.formatOffset(this._offset, {format: 'narrow'});
    return this._offset == 0 ? 'UTC' : `UTC${number}`;
  }

  universal() {
    return true;
  }

  offset(ts){
    return this._offset;
  }

  equals(otherZone){
    return (otherZone instanceof FixedOffsetZone) && otherZone._offset == this._offset;
  }
}
