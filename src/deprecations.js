const warned = new Set();

export const DURATION_FRACTION = "duration.fraction";
export const DURATION_MIXED_SIGN = "duration.mixedSign";
export const DURATION_SHIFT_FRACTION = "duration.shiftFraction";

export function warnDeprecation(key) {
  if (!warned.has(key)) {
    warned.add(key);
    console.warn(
      `Luxon deprecation ${key}. See https://moment.github.io/luxon/#/deprecations?id=${key}`
    );
  }
}
