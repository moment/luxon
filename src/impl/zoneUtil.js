/**
 * @private
 */

import Zone from "../zone.js";
import IANAZone from "../zones/IANAZone.js";
import FixedOffsetZone from "../zones/fixedOffsetZone.js";
import InvalidZone from "../zones/invalidZone.js";

import { isUndefined, isString, isNumber } from "./util.js";
import SystemZone from "../zones/systemZone.js";

// IANA aliases that are defined as identical to UTC in tzdata's "etcetera".
// Map them to the fixed UTC zone so toISO() emits "Z" consistently with setZone("UTC").
// See https://github.com/moment/luxon/issues/1358
const UTC_ZONE_ALIASES = new Set([
  "utc",
  "gmt",
  "etc/utc",
  "etc/uct",
  "etc/universal",
  "etc/zulu",
  "etc/greenwich",
  "etc/gmt",
  "etc/gmt+0",
  "etc/gmt-0",
  "etc/gmt0",
]);

function isUtcZoneAlias(lowered) {
  return UTC_ZONE_ALIASES.has(lowered);
}

export function normalizeZone(input, defaultZone) {
  let offset;
  if (isUndefined(input) || input === null) {
    return defaultZone;
  } else if (input instanceof Zone) {
    return input;
  } else if (isString(input)) {
    const lowered = input.toLowerCase();
    if (lowered === "default") return defaultZone;
    else if (lowered === "local" || lowered === "system") return SystemZone.instance;
    else if (isUtcZoneAlias(lowered)) return FixedOffsetZone.utcInstance;
    else return FixedOffsetZone.parseSpecifier(lowered) || IANAZone.create(input);
  } else if (isNumber(input)) {
    return FixedOffsetZone.instance(input);
  } else if (typeof input === "object" && "offset" in input && typeof input.offset === "function") {
    // This is dumb, but the instanceof check above doesn't seem to really work
    // so we're duck checking it
    return input;
  } else {
    return new InvalidZone(input);
  }
}
