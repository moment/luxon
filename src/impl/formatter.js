export class Formatter {

  static create(config, opts = {}){

    //todo add caching?
    var localeConfig = Object.assign({}, config, opts);
    var formatOpts = Object.assign({}, opts);

    delete formatOpts.calendar;
    delete formatOpts.numbering;
    delete formatOpts.locale;

    if (localeConfig.utc){
      formatOpts.timeZone = "UTC";
    }

    return new Formatter(localeConfig, formatOpts);
  }

  constructor(localeConfig, formatOpts){
    var loc = localeConfig.locale || new Intl.DateTimeFormat().resolvedOptions().locale;
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

  formatDate(jsDate){
    return this._df.format(jsDate);
  }

  resolvedOptions(){
    return this._df.resolvedOptions();
  }
}
