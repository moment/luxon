function pad(input, n = 2) {
  return ('0'.repeat(n) + input).slice(-n);
};

function formatOffset(inst){

  //todo - is this always right? Should be an option?
  if (inst.isUTC() && inst.utcOffset() === 0){
    return 'Z';
  }

  //todo - use the duration formatter once there's a duration formatter
  let offsetMins = inst.utcOffset(),
      hours = offsetMins/60,
      minutes = offsetMins % 60,
      sign = hours > 0 ? '+' : '-';
  ;

  //todo - use the number formatter and the right : separator
  return sign + pad(Math.abs(hours)) + ':' + pad(minutes);
}

export class Formatter {

  static create(config, opts = {}){

    //todo add caching?
    let localeConfig = Object.assign({}, config, opts),
        formatOpts = Object.assign({}, opts);

    delete formatOpts.calendar;
    delete formatOpts.numbering;
    delete formatOpts.locale;

    if (localeConfig.utc){
      formatOpts.timeZone = "UTC";
    }

    return new Formatter(localeConfig, formatOpts);
  }

  constructor(localeConfig, formatOpts){
    let loc = localeConfig.locale || new Intl.DateTimeFormat().resolvedOptions().locale;
    loc = Array.isArray(loc) ? loc : [loc];

    if (localeConfig.calendar || localeConfig.numbering){
      loc = loc.map((l) => {
        l += "-u";

        if (localeConfig.calendar){
          l += "-ca-" + localeConfig.calendar;
        }
        if (localeConfig.numbering){
          l += "-nu-" + localeConfig.numbering;
        }
        return l;
      });
    }

    this._df = new Intl.DateTimeFormat(loc, formatOpts);
    this._nf = new Intl.NumberFormat(loc, formatOpts);
  }

  formatDate(inst){
    return this._df.format(inst.toJSDate());
  }

  resolvedOptions(){
    return this._df.resolvedOptions();
  }

  formatFromString(inst, fmt){
    //Don't implement until formatToParts() is done. Waste of time otherwise.
    //See https://github.com/tc39/ecma402/issues/30
    //I've added some silly placeholders so that I can get ISO formatting working

    function tokenToString(token){
      switch (token) {
      //ms
      case 'S': return inst.millisecond().toString();
      case 'SSS': return pad(inst.millisecond(), 3);

      //seconds
      case 's': return inst.second().toString();
      case 'ss': return pad(inst.second());

      //minutes
      case 'm': return inst.minute().toString();
      case 'mm': return pad(inst.minute());

      //hours
      case 'h': return (inst.hour() % 12).toString();
      case 'hh': return pad(inst.hour() % 12);
      case 'H': return inst.hour().toString();
      case 'HH': return pad(inst.hour());

      //offset
      case 'Z': return formatOffset(inst);
      case 'z': return null;
      case 'zzz': return null;

      //meridiens
      case 'a': return null;
      case 'aaaa': return null;

      //dates
      case 'd': return inst.day().toString();
      case 'dd': return pad(inst.day());

      //weekdays
      case 'E': return inst.weekday().toString();
      case 'EE': return pad(inst.weekday());
      case 'EEE': return null;
      case 'EEEE': return null;
      case 'EEEEE': return null;

      //months
      case 'M': return inst.month().toString();
      case 'MM': return pad(inst.month(), 2);
      case 'MMM': return null;
      case 'MMMM': return null;
      case 'MMMMM': return null;

      //years
      case 'y': return inst.year().toString();
      case 'yy': return inst.year().toString().slice(-2);
      case 'yyyy': return pad(inst.year(), 4);

      //eras
      case 'G': return null;

      //local

      default:
        return token;
      };
    };

    let current = null, splits = [];
    for (let i = 0; i < fmt.length; i++){
      let c = fmt.charAt(i);
      if (c === current) {
        splits[splits.length - 1] += c;
      }
      else {
        splits.push(c);
        current = c;
      }
    }

    let s = '';
    for (let token of splits) {
      s += tokenToString(token);
    }
    return s;
  }
}
