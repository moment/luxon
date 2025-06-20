export const INVALID_ZONE_NAME = "invalid_zone";

let errorFormatter = (code, args) => `${code}(${JSON.stringify(args)})`;

export function setErrorFormatter(formatter) {
  errorFormatter = formatter;
}

class LuxonError extends Error {}

class LuxonValidationError extends LuxonError {
  /**
   * @param {number} code
   * @param args
   */
  constructor(code, args = {}) {
    super(errorFormatter(code, args));
    this.code = code;
    this.args = args;
  }
}

export class InvalidDateTimeError extends LuxonError {
  constructor(reason) {
    super(`Invalid DateTime: ${reason.toMessage()}`);
  }
}

export class InvalidIntervalError extends LuxonError {
  constructor(reason) {
    super(`Invalid Interval: ${reason.toMessage()}`);
  }
}

export class InvalidDurationError extends LuxonError {
  constructor(reason) {
    super(`Invalid Duration: ${reason.toMessage()}`);
  }
}

export class ConflictingSpecificationError extends LuxonError {}

export class InvalidUnitError extends LuxonError {
  constructor(unit) {
    super(`Invalid unit ${unit}`);
  }
}

export class InvalidArgumentError extends LuxonError {}

export class InvalidZoneError extends LuxonValidationError {}
