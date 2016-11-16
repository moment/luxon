import {Util} from "./util";

export class LocalZone {

  get name(){
    return new Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  get universal() {
    return false;
  }

  offsetName(ts, opts = {}){
    return Util.parseZoneInfo(ts,
                              opts.offsetFormat = opts.format || 'long',
                              opts.localeCode || 'en-us');
  }

  offset(ts){
    return -(new Date(ts).getTimezoneOffset());
  }

  equals(otherZone){
    return (otherZone instanceof LocalZone);
  }
}
