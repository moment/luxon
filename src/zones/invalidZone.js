import Zone from "../zone.js";

/**
 * A zone that failed to parse. You should never need to instantiate this.
 * @implements {Zone}
 * @deprecated
 */
export default class InvalidZone extends Zone {
  #zoneName;

  constructor(zoneName) {
    super();
    this.#zoneName = zoneName;
  }

  /** @override **/
  get type() {
    return "invalid";
  }

  /** @override **/
  get name() {
    return this.#zoneName;
  }

  /** @override **/
  get isUniversal() {
    return false;
  }

  /** @override **/
  offsetName() {
    return null;
  }

  /** @override **/
  formatOffset() {
    return "";
  }

  /** @override **/
  offset() {
    return NaN;
  }

  /** @override **/
  equals() {
    return false;
  }

  /** @override **/
  get isValid() {
    return false;
  }
}
