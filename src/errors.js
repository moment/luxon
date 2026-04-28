// these aren't really private, but nor are they really useful to document

/**
 * @private
 */
class LuxonError extends Error {}

/**
 * @private
 */
export class InvalidDateTimeError extends LuxonError {
  constructor(reason) {
    super(`Invalid DateTime: ${reason.toMessage()}`);
  }
}

/**
 * Thrown by parsing methods like DateTime.fromISO or DateTime.fromFormat when the input string
 * cannot be parsed in the expected format.
 */
export class ParseError extends RangeError {
  /**
   * @param target {string} - The target type to be parsed, e.g., Duration or DateTime
   * @param format {string} - The format being parsed, e.g., "ISO 8601" or "yyyy-MM-dd"
   * @param input {string} - The input string being parsed
   * @param [reason] {string|undefined} - Additional reason for the parsing failure
   */
  constructor(target, format, input, reason) {
    super(`Failed to parse \`${input}\` as ${format} for ${target}`);
    this.name = "ParseError";
    this.target = target;
    this.format = format;
    this.input = input;
    this.reason = reason;
  }
}

/**
 * Thrown when an invalid value is passed for a unit.
 */
export class InvalidUnitValueError extends TypeError {
  /**
   *
   * @param unit {string}
   * @param expectedType {string}
   * @param value {unknown}
   */
  constructor(unit, expectedType, value) {
    super(`Invalid value ${value} for unit ${unit}, expected ${expectedType}`);
    this.name = "InvalidUnitValueError";
    this.unit = unit;
    this.value = value;
  }
}

/**
 * Thrown when roundingMode was specified as "unnecessary", but rounding was necessary.
 */
export class RoundingNecessaryError extends Error {
  constructor() {
    super("Rounding is necessary for this operation");
    this.name = "RoundingNecessaryError";
  }
}

/**
 * Thrown when a Duration operation requires a date reference (such as converting days to hours),
 * but no date reference was provided.
 */
export class DateReferenceRequiredError extends TypeError {
  constructor() {
    super("Duration operation requires a date reference");
    this.name = "DateReferenceRequiredError";
  }
}

/**
 * @private
 */
export class InvalidIntervalError extends LuxonError {
  constructor(reason) {
    super(`Invalid Interval: ${reason.toMessage()}`);
  }
}

/**
 * @private
 */
export class InvalidDurationError extends LuxonError {
  constructor(reason) {
    super(`Invalid Duration: ${reason.toMessage()}`);
  }
}

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
