// these aren't really private, but nor are they really useful to document

import type Invalid from "./impl/invalid.js";

export interface BaseLuxonError extends Error {
  readonly code: string | number | undefined;
}

/**
 * @private
 */
export class LuxonError extends Error implements BaseLuxonError {
  readonly code: string | number | undefined;

  constructor(message?: string, code?: string | number) {
    super(message);
    this.code = code;
  }
}

export class LuxonTypeError extends TypeError implements BaseLuxonError {
  readonly code: string | number | undefined;

  constructor(message?: string, code?: string | number) {
    super(message);
    this.code = code;
  }
}

export class LuxonParseError extends RangeError {}

export class LuxonIntlError extends LuxonError {}

/**
 * @private
 */
export class InvalidDateTimeError extends LuxonError {}

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
export class InvalidArgumentError extends LuxonTypeError {}

/**
 * @private
 */
export class ZoneIsAbstractError extends LuxonError {
  constructor() {
    super("Zone is an abstract class");
  }
}
