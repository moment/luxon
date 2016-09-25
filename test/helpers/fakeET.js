export class FakeET {

  name(opts = {format: 'long'}){
    return 'Eastern Time';
  }

  universal() {
    return false;
  }

  offset(ts){
    let year = new Date(ts).getFullYear(),
        start = Date.UTC(year, 2, 13, 4),
        end = Date.UTC(year, 10, 6, 5);

    return 60 * ((ts >= start && ts <= end) ? -4 : -5);
  }

  equals(otherZone){
    return (otherZone instanceof FakeET);
  }
}
