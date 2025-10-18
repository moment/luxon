/**
 * @private
 */

import Zone from "../zone.ts";
import IANAZone from "../zones/IANAZone.ts";
import FixedOffsetZone from "../zones/fixedOffsetZone.ts";

import { isInteger } from "./util.ts";
import SystemZone from "../zones/systemZone.ts";
import { InvalidZoneError } from "../errors.js";

export type ZoneInput = Zone | string | number | null | undefined;

export function normalizeZone(input: ZoneInput, defaultZone: Zone): Zone;
export function normalizeZone(
  input: ZoneInput,
  defaultZone?: Zone | null | undefined
): Zone | null | undefined;
export function normalizeZone(
  input: ZoneInput,
  defaultZone?: Zone | null | undefined
): Zone | null | undefined {
  if (input == null) {
    return defaultZone;
  } else if (input instanceof Zone) {
    return input;
  } else if (typeof input === "string") {
    const lowered = input.toLowerCase();
    if (lowered === "default") return defaultZone;
    else if (lowered === "local" || lowered === "system") return SystemZone.instance as any;
    else if (lowered === "utc" || lowered === "gmt") return FixedOffsetZone.utcInstance;
    else return FixedOffsetZone.parseSpecifier(lowered) ?? IANAZone.create(input);
  } else if (isInteger(input)) {
    return FixedOffsetZone.instance(input);
  } else {
    throw new InvalidZoneError(`${input} is not a valid zone.`);
  }
}
