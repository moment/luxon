import {Instant} from './instant';
import {Locale} from './impl/locale';

export class Info{

  static hasDST(zone = Instant.defaultZone){
    return !zone.universal() && Instant.now().month(1).offset() != Instant.now().month(5).offset();
  }

  static months(length, locale, numbering){
    return new Locale(locale, numbering).months(length);
  }

  static monthsFormat(length, locale, numbering){
    return new Locale(locale, numbering).monthsFormat(length);
  }

  static weekdays(length, locale, numbering){
  }
}
