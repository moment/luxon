import type { ZoneInput } from "./impl/zoneUtil.ts";

// Todo: This is currently a catchall bag for all options
// We need to categorize which are public and which are applicable for which functions
export interface AllDateTimeOptions {
  setZone?: boolean;
  zone?: ZoneInput;
  specificOffset?: number | undefined;
  overrideNow?: number | undefined;
}
