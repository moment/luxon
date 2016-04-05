export class LocalZone {

  name(opts = {format: 'long'}){
    //wait until formatToParts()
    return 'local';
  }

  universal() {
    return false;
  }

  fromDate(date, opts = {}){
    return date;
  }

  fromArgs(args){
    return new Date(...args);
  }

  equals(otherZone){
    return (otherZone instanceof LocalZone);
  }
}
