class LuxonError extends Error {}

export class InvalidDateTimeError extends LuxonError {
  constructor(reason) {
    super(`Invalid DateTime: ${reason}`);
  }
}

export class ConflictingSpecificationError extends LuxonError {}

export class InvalidUnitError extends LuxonError {
  constructor(unit) {
    super(`Invalid unit ${unit}`);
  }
}

export class InvalidArgumentError extends LuxonError {}
