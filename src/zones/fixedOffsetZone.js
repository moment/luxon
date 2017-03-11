import { Util } from '../impl/util';
import { Zone } from '../zone';

export class FixedOffsetZone extends Zone {
  constructor(offset) {
    super();
    this.fixed = offset;
  }

  get name() {
    const hours = this.fixed / 60,
      minutes = Math.abs(this.fixed % 60),
      sign = hours > 0 ? '+' : '-',
      base = sign + Math.abs(hours),
      number = minutes > 0 ? `${base}:${Util.pad(minutes, 2)}` : base;

    return this.fixed === 0 ? 'UTC' : `UTC${number}`;
  }

  offsetName() {
    // todo - this isn't great
    return this.name();
  }

  get universal() {
    return true;
  }

  offset() {
    return this.fixed;
  }

  equals(otherZone) {
    return otherZone instanceof FixedOffsetZone && otherZone.fixed === this.fixed;
  }
}
