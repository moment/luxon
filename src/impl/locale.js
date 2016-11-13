import * as Intl from 'intl';
import {Util} from './util';
import {Instant} from 'luxon';

//We use the Intl polyfill exclusively here, for these reasons:
// 1. We need formatToParts(), which isn't implemented anywhere
// 2. Node doesn't ship with real locale support unless you do this: https://github.com/nodejs/node/wiki/Intl
// 3. It made for a cleaner job.

//However, it has some drawbacks:
// 1. It's an onerous requirement
// 2. It doesn't have TZ support
// 3. It doesn't support number and calendar overrides.

//In the future we might see either (probably both?) of these:
// 1. Drop the requirement for the polyfill if you want US-EN only.
//    Not doing this now because providing the defaults will slow me down.
// 2. Let the user actually do a real polyfill where they please once Chrome/Node supports formatToParts OR Intl supports zones.
//    This is impractical now because we still want access to the Chrome's native Intl's TZ support elsewhere.

function intlConfigString(localeCode, nums, cal){
  let loc = localeCode || new Intl.DateTimeFormat().resolvedOptions().locale;
  loc = Array.isArray(localeCode) ? localeCode : [localeCode];

  if (cal || nums){
    loc = loc.map((l) => {
      l += "-u";

      //This doesn't seem to really work yet, so this is mostly not exposed.
      //Also, this won't work with *parsing*, since we don't know how to translate them back into dates.
      //So we need a way to specifically ignore it when parsing or we'll get gibberish
      if (cal){
        l += "-ca-" + cal;
      }

      //this doesn't work yet either
      if (nums){
        l += "-nu-" + nums;
      }
      return l;
    });
  }
  return loc;
}

function mapMonths(f){
  let ms = [];
  for(let i=1; i<=12; i++){
    let inst = Instant.fromObject({year: 2016, month: i, day: 1}, {utc: true});
    ms.push(f(inst));
  };
  return ms;
}

function mapWeekdays(f){
  let ms = [];
  for(let i=0; i<7; i++){
    let inst = Instant.fromObject({year: 2016, month: 11, day: 13 + i}, {utc: true});
    ms.push(f(inst));
  };
  return ms;
}

export class Locale{

  static fromOpts(opts){
    return Locale.create(opts.code, opts.nums, opts.cal);
  }

  //todo: add caching
  static create(code, nums, cal){
    return new Locale(code, nums, cal);
  }

  constructor(code, numbering, calendar){
    Object.defineProperty(this, 'code', {value: code || 'en-us', enumerable: true});
    Object.defineProperty(this, 'nums', {value: numbering || null, enumerable: true});
    Object.defineProperty(this, 'cal', {value: calendar || null, enumerable: true});
    Object.defineProperty(this, 'intl', {value: intlConfigString(this.code, this.num, this.cal), enumerable: false});
  }

  clone(alts){
    return Locale.create(alts.code || this.code,
                         alts.nums || this.nums,
                         alts.cal || this.cal);
  }

  months(length){
    return mapMonths((inst) => this.extract(inst, {month: length}, 'month'));
  }

  monthsFormat(length){
    return mapMonths((inst) => this.extract(inst, {month: length, day: 'numeric'}, 'month'));
  }

  weekdays(length){
    return mapWeekdays((inst) => this.extract(inst, {weekday: length}, 'weekday'));
  }

  weekdaysFormat(length){
    return mapWeekdays((inst) => this.extract(inst, {weekday: length, year: 'numeric', month: 'long', day: 'numeric'}, 'weekday'));
  }

  meridiems(length){
  }

  eras(length){
  }

  fieldValues(){
  }

  extract(inst, intlOpts, field){
    let [df, d] = this.instFormatter(inst, intlOpts),
        results = df.formatToParts(d);

    return results.find((m) => m.type == field).value;
  }

  numberFormatter(opts = {}, intlOpts = {}){
    let realIntlOpts = Object.assign({useGrouping: false}, intlOpts );

    if (opts.padTo > 0){
      realIntlOpts.minimumIntegerDigits = opts.padTo;
    }

    if (opts.round){
      realIntlOpts.maximumFractionDigits = 0;
    }

    return new Intl.NumberFormat(this.intl, realIntlOpts);
  }

  instFormatter(inst, intlOpts = {}){
    let d, z;

    if (inst.zone.universal()){
      d = Util.asIfUTC(inst);
      z = 'UTC'; //this is wrong, but there's no way to tell the formatter that
    }
    else {
      d = inst.toJSDate();
      z = inst.zone.name();
    }

    let realIntlOpts = Object.assign({}, intlOpts);
    if (z){
      realIntlOpts.timeZone = z;
    }

    return [new Intl.DateTimeFormat(this.intl, realIntlOpts), d];
  }
}
