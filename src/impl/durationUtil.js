import { isInteger, roundTo } from "./util.js";
import { DURATION_SHIFT_FRACTION, warnDeprecation } from "../deprecations.js";

export function roundLastDurationPart(value, opts) {
  if (opts.round) {
    return roundTo(value, 0, opts.rounding);
  } else if (!isInteger(value)) {
    warnDeprecation(DURATION_SHIFT_FRACTION);
  }
  return value;
}
