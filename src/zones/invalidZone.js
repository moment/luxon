import Zone from "../zone";

export default class InvalidZone extends Zone {
  constructor(zoneName) {
    super();
    this.zoneName = zoneName;
  }

  get type() {
    return "invalid";
  }

  get name() {
    return this.zoneName;
  }

  get universal() {
    return false;
  }

  offsetName() {
    return null;
  }

  offset() {
    return NaN;
  }

  equals() {
    return false;
  }

  get isValid() {
    return false;
  }
}
