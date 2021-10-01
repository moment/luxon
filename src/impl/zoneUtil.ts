/**
 * @private
 */

import Zone from "../zone";
import IANAZone from "../zones/IANAZone";
import FixedOffsetZone from "../zones/fixedOffsetZone";
import InvalidZone from "../zones/invalidZone";

import { isUndefined, isString, isNumber } from "./util";
import { ZoneLike } from "../types/zone";

export function normalizeZone(input: ZoneLike, defaultZone: Zone): Zone {
  let offset;
  if (isUndefined(input) || input === null) {
    return defaultZone;
  } else if (input instanceof Zone) {
    return input;
  } else if (isString(input)) {
    const lowered = input.toLowerCase();
    if (lowered === "local" || lowered === "system") return defaultZone;
    else if (lowered === "utc" || lowered === "gmt") return FixedOffsetZone.utcInstance;
    else if ((offset = IANAZone.parseGMTOffset(input)) != null) {
      // handle Etc/GMT-4, which V8 chokes on
      return FixedOffsetZone.instance(offset);
    } else if (IANAZone.isValidSpecifier(lowered)) return IANAZone.create(input);
    else return FixedOffsetZone.parseSpecifier(lowered) || new InvalidZone(input);
  } else if (isNumber(input)) {
    return FixedOffsetZone.instance(input);
  } else {
    return new InvalidZone(input);
  }
}
