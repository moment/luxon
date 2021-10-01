export default class Invalid {
  private readonly _reason: string;
  private readonly _explanation: string | null;

  constructor(reason: string, explanation?: string | null) {
    this._reason = reason;
    this._explanation = explanation || null;
  }

  toMessage(): string {
    if (this._explanation) {
      return `${this._reason}: ${this._explanation}`;
    } else {
      return this._reason;
    }
  }

  get explanation(): string | null {
    return this._explanation;
  }

  get reason(): string {
    return this._reason;
  }
}
