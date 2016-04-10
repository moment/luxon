export class FakePT {

  name(opts = {format: 'long'}){
    return 'Pacific Time';
  }

  universal() {
    return false;
  }

  offset(ts){
    let year = new Date(ts).getFullYear(),
        start = Date.UTC(year, 2, 13, 7),
        end = Date.UTC(year, 10, 6, 6);

    return 60 * ((ts >= start && ts <= end) ? -7 : -8);
  }

  equals(otherZone){
    return (otherZone instanceof FakePT);
  }
}
