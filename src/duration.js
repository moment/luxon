let matrix = {
  hours: {
    minutes: 60,
    seconds: 60 * 60,
    milliseconds: 60 * 60 * 1000
  },
  minutes: {
    seconds: 60,
    milliseconds: 60 * 1000
  },
  seconds: {
    milliseconds: 1000
  }
};

let ordered = ['years', 'months', 'days', 'hours', 'minutes', 'seconds', 'milliseconds'];

export class Duration{

  constructor(obj){
    this._values = obj;
  }

  _clone(alts) {
    new Duration(Object.assign(this._values), alts);
  }

  static fromLength(count, unit){
    return fromObject({[unit]: count});
  }

  static fromObject(obj){
    return new Duration(obj);
  }

  static fromISO(text){}

  static fromString(text, fmt){}

  toFormatString(fmt){}

  toObject(){
    return Object.assign({}, this._values);
  }

  toISO(){}

  toJSON(){}

  plus(countOrDuration, unit='milliseconds'){
  }

  minus(countOrDuration, unit='milliseconds'){
  }

  get(unit){
    return this[unit]();
  }

  as(unit){
    return shiftTo(unit);
  }

  shiftTo(...units){
    if (units.length == 0){
      return this;
    }

    let built = {},
        accumulated = {};
    for (let k of ordered) {

      if (units.indexOf(k) >= 0){
        built[k] = 0;

        for (let ak in accumulated){
          built[k] += matrix[ak][k] * accumulated[ak];
          delete(accumulated[ak]);
        }

        if (this._values[k]) {
          built[k] += this._values[k];
        }
      }

      else if (this._values[k]) {
        accumulated[k] = this._values[k];
      }
    }
    return Duration.fromObject(built);
  }

  negate(){
    let negated = {};
    for(let k in Object.keys(this)){
      negated[k] = -this._values[k];
    }
    return Duration.fromObject(negated);
  };

  years(){
    return this._values.years || 0;
  }

  months(){
    return this._values.months || 0;
  }

  days(){
    return this._values.days || 0;
  }

  hours(){
    return this._values.hours || 0;
  }

  minutes(){
    return this._values.minutes || 0;
  }

  seconds(){
    return this._values.seconds || 0;
  }

  milliseconds(){
    return this._values.milliseconds || 0;
  }
}
