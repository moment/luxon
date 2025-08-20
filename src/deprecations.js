// this is public for tests
export const warnedDeprecations = new Set();
export let logDeprecations = true;
export function setLogDeprecations(log) {
  logDeprecations = log;
}

export const DURATION_ACCURACY = "duration.accuracy";
export const DURATION_FRACTION = "duration.fraction";
export const DURATION_MIXED_SIGN = "duration.mixedSign";
export const DURATION_SHIFT_FRACTION = "duration.shiftFraction";
export const DURATION_AMBIGUOUS_CONVERSION = "duration.ambiguousConversion";

export function warnDeprecation(key) {
  if (!warnedDeprecations.has(key)) {
    warnedDeprecations.add(key);
    if (logDeprecations) {
      console.warn(
        `Luxon deprecation ${key}. See https://moment.github.io/luxon/#/deprecations?id=${key}`
      );
    }
  }
}
