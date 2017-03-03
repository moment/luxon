export class FakeET {

  get name() {
    return 'Fake Eastern Time';
  }

  get universal() {
    return false;
  }

  offsetName(ts, opts = {}) {
    const off = this.offset(ts);
    return opts.format === 'long' ?
      (off === -5 ? 'EST' : 'EDT') :
      (off === -5 ? 'Eastern Standard Time' : 'Eastern Daylight Time');
  }

  offset(ts) {
    const year = new Date(ts).getFullYear();
    const start = Date.UTC(year, 2, 13, 4);
    const end = Date.UTC(year, 10, 6, 5);

    return 60 * ((ts >= start && ts <= end) ? -4 : -5);
  }

  equals(otherZone) {
    return (otherZone instanceof FakeET);
  }
}
