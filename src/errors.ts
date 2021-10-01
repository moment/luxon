// these aren't really private, but nor are they really useful to document

import Invalid from "./impl/invalid";

/**
 * @private
 */
class LuxonError extends Error {}

/**
 * @private
 */
export class InvalidDateTimeError extends LuxonError {
  constructor(reason: Invalid) {
    super(`Invalid DateTime: ${reason.toMessage()}`);
  }
}

/**
 * @private
 */
export class InvalidIntervalError extends LuxonError {
  constructor(reason: Invalid) {
    super(`Invalid Interval: ${reason.toMessage()}`);
  }
}

/**
 * @private
 */
export class InvalidDurationError extends LuxonError {
  constructor(reason: Invalid) {
    super(`Invalid Duration: ${reason.toMessage()}`);
  }
}

/**
 * @private
 */
export class ConflictingSpecificationError extends LuxonError {
  constructor(reason: string) {
    super(reason);
    this.name = "ConflictingSpecificationError";
  }
}

/**
 * @private
 */
export class InvalidUnitError extends LuxonError {
  constructor(unit: string) {
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
