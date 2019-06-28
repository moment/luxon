/**
 * @private
 */

import Zone from "../zone.js";
import IANAZone from "../zones/IANAZone.js";
import FixedOffsetZone from "../zones/fixedOffsetZone.js";
import InvalidZone from "../zones/invalidZone.js";

import { isUndefined, isString, isNumber } from "./util.js";
import { SystemZone } from "../luxon.js";

export function normalizeZone(input, defaultZone) {
  let offset;
  if (isUndefined(input) || input === null) return defaultZone;
  if (input instanceof Zone) return input;
  if (isString(input)) {
    const lowered = input.toLowerCase();
    if (lowered === "default") return defaultZone;
    if (lowered === "system") return SystemZone.instance;
    if (lowered === "utc") return FixedOffsetZone.utcInstance;
    if ((offset = IANAZone.parseGMTOffset(input)) != null) {
      // handle Etc/GMT-4, which V8 chokes on
      return FixedOffsetZone.instance(offset);
    }
    if (IANAZone.isValidSpecifier(lowered)) return IANAZone.create(input);
    return FixedOffsetZone.parseSpecifier(lowered) || new InvalidZone(input);
  }
  if (isNumber(input)) return FixedOffsetZone.instance(input);
  if (typeof input === "object" && input.offset && typeof input.offset === "number") {
    // This is dumb, but the instanceof check above doesn't seem to really work
    // so we're duck checking it
    return input;
  }
  return new InvalidZone(input);
}
