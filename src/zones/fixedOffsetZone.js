import { Util } from '../impl/util';
import { Zone } from '../zone';

let singleton = null;

export class FixedOffsetZone extends Zone {
  static get utcInstance() {
    if (singleton === null) {
      singleton = new FixedOffsetZone(0);
    }
    return singleton;
  }

  static instance(offset) {
    return offset === 0 ? FixedOffsetZone.utcInstance : new FixedOffsetZone(offset);
  }

  static parseSpecifier(s) {
    if (s) {
      const r = s.match(/^utc([+-]\d+)?$/i);
      if (r) {
        return new FixedOffsetZone(r[1] ? parseInt(r[1], 10) * 60 : 0);
      }
    }
    return null;
  }

  constructor(offset) {
    super();
    this.fixed = offset;
  }

  get type() {
    return 'fixed';
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
    return otherZone.type === 'fixed' && otherZone.fixed === this.fixed;
  }
}
