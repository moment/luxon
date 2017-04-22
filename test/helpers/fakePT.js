import { Zone } from '../../src/zone';

export class FakePT extends Zone {
  get type() {
    return 'fake';
  }

  get name() {
    return 'Fake Pacific Time';
  }

  offsetName(ts, opts = {}) {
    const off = this.offset(ts);
    return opts.format === 'long'
      ? off === -8 ? 'Pacific Standard Time' : 'Pacific Daylight Time'
      : off === -8 ? 'PST' : 'PDT';
  }

  get universal() {
    return false;
  }

  offset(ts) {
    const year = new Date(ts).getFullYear(),
      start = Date.UTC(year, 2, 13, 7),
      end = Date.UTC(year, 10, 6, 6);

    return 60 * (ts >= start && ts <= end ? -7 : -8);
  }

  equals(otherZone) {
    return otherZone.type === 'fake';
  }
}
