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

function ensure(unit){
  //todo - yell if it's not a valid unit
  return unit.endsWith('s') ? unit : unit + 's';
}

export class Duration{

  constructor(obj){
    this.values = obj;
  }

  _clone(alts) {
    new Duration(Object.assign(this.values), alts);
  }

  static fromLength(count, unit){
    unit = ensure(unit);
    return Duration.fromObject({[unit]: count});
  }

  static fromObject(obj){
    //todo - ensure() each key
    return new Duration(obj);
  }

  static fromISO(text){}

  static fromString(text, fmt){}

  toFormatString(fmt){}

  toObject(){
    return Object.assign({}, this.values);
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

  as(...units){
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

        if (typeof(this.values[k]) === 'number') {
          built[k] += this.values[k];
        }
      }

      else if (typeof(this.values[k]) === 'number') {
        accumulated[k] = this.values[k];
      }
    }

    return Duration.fromObject(built);
  }

  negate(){
    let negated = {};
    for(let k of Object.keys(this.values)){
      negated[k] = -this.values[k];
    }
    return Duration.fromObject(negated);
  };

  years(){
    return this.values.years || 0;
  }

  months(){
    return this.values.months || 0;
  }

  days(){
    return this.values.days || 0;
  }

  hours(){
    return this.values.hours || 0;
  }

  minutes(){
    return this.values.minutes || 0;
  }

  seconds(){
    return this.values.seconds || 0;
  }

  milliseconds(){
    return this.values.milliseconds || 0;
  }
}
