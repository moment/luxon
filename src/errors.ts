// these aren't really private, but nor are they really useful to document

import type Invalid from "./impl/invalid.js";

/**
 * @private
 */
export class LuxonError extends Error {
  readonly code: string | undefined;

  constructor(message?: string, code?: string) {
    super(message);
    this.code = code;
  }
}

export class LuxonIntlError extends LuxonError {}

/**
 * @private
 */
export class InvalidDateTimeError extends LuxonError {
  constructor(reason) {
    super(`Invalid DateTime: ${reason.toMessage()}`);
  }
}

export class InvalidFormatError extends LuxonError {}

/**
 * @private
 */
export class InvalidIntervalError extends LuxonError {}

/**
 * @private
 */
export class InvalidDurationError extends LuxonError {
  constructor(reason: Invalid) {
    super(`Invalid Duration: ${reason.toMessage()}`);
  }
}

export class InvalidZoneError extends LuxonError {}

/**
 * @private
 */
export class ConflictingSpecificationError extends LuxonError {}

/**
 * @private
 */
export class InvalidUnitError extends LuxonError {
  constructor(unit) {
    super(`Invalid unit ${unit}`);
  }
}

/**
 * @private
 */
export class InvalidArgumentError extends LuxonError {}

/**
 * @private
 */
export class ZoneIsAbstractError extends LuxonError {
  constructor() {
    super("Zone is an abstract class");
  }
}
