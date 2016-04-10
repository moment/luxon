export class LocalZone {

  name(opts = {format: 'long'}){
    //wait until formatToParts()
    return 'local';
  }

  universal() {
    return false;
  }

  offset(ts){
    return -(new Date(ts).getTimezoneOffset());
  }

  equals(otherZone){
    return (otherZone instanceof LocalZone);
  }
}
