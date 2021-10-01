import Zone from "../zone";

/**
 * A zone that failed to parse. You should never need to instantiate this.
 * @implements {Zone}
 */
export default class InvalidZone extends Zone {
  readonly zoneName: string;

  constructor(zoneName: string) {
    super();
    /**  @private */
    this.zoneName = zoneName;
  }

  /** @override **/
  get type(): string {
    return "invalid";
  }

  /** @override **/
  get name(): string {
    return this.zoneName;
  }

  /** @override **/
  get isUniversal(): boolean {
    return false;
  }

  /** @override **/
  offsetName(): string | null {
    return null;
  }

  /** @override **/
  formatOffset(): string {
    return "";
  }

  /** @override **/
  offset(): number {
    return NaN;
  }

  /** @override **/
  equals(): boolean {
    return false;
  }

  /** @override **/
  get isValid(): boolean {
    return false;
  }
}
