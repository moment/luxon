import {Instant} from './instant';

export class Info{

  static hasDST(zone = Instant.defaultZone){
    return !zone.universal() && Instant.now().month(1).offset() != Instant.now().month(5).offset();
  }

  static listMonths(locale, styleOrFormat = 'LLLL'){
  }

  static listWeekdays(locale, styleOrFormat = 'cccc'){
  }
}
