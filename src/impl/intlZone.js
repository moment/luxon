export class IntlZone {

  constructor(name){
    this.zoneName = name;
  }

  name(opts = {format: 'long'}){
    return this.zoneName;
  }

  universal() {
    return false;
  }

  offset(ts){
    //formatToParts() will simplify this
    let date = new Date(ts),
        formatted = new Intl.DateTimeFormat('en-us', {
          hour12: false,
          timeZone: this.zoneName,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'}).format(date),
        parsed = /(\d+)\/(\d+)\/(\d+), (\d+):(\d+)/.exec(formatted),
        [, fMonth, fDay, fYear, fHour, fMinute] = parsed,
        asUTC = Date.UTC(fYear, fMonth - 1, fDay, fHour, fMinute),
        asTS = date.valueOf();
    return  (asUTC - asTS) / (60 * 1000);
  }

  equals(otherZone){
    return (otherZone instanceof IntlZone) && otherZone.zoneName == this.zoneName;
  }
}
