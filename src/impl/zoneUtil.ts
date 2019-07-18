/**
 * @private
 */

import Zone from "../zone";
import IANAZone from "../zones/IANAZone";
import FixedOffsetZone from "../zones/fixedOffsetZone";
import SystemZone from "../zones/systemZone";
import { InvalidZoneError } from "../errors";

import { isUndefined, isString, isNumber } from "./util";
import { ZoneLike } from "../types/zone";

export function normalizeZone(input: ZoneLike, defaultZone: Zone) {
  if (isUndefined(input) || input === null) return defaultZone;
  if (input instanceof Zone) return input;
  if (isString(input)) {
    const lowered = input.toLowerCase();
    if (lowered === "default") return defaultZone;
    if (lowered === "system") return SystemZone.instance;
    if (lowered === "utc") return FixedOffsetZone.utcInstance;
    const offset = IANAZone.parseGMTOffset(input);
    if (offset != null) {
      // handle Etc/GMT-4, which V8 chokes on
      return FixedOffsetZone.instance(offset);
    }
    if (IANAZone.isValidSpecifier(lowered)) return IANAZone.create(input);
    const fixed = FixedOffsetZone.parseSpecifier(lowered);
    if (fixed !== null) return fixed;
    throw new InvalidZoneError(input);
  }
  if (isNumber(input)) return FixedOffsetZone.instance(input);
  throw new InvalidZoneError(input);
}
