import Locale from "../impl/locale";
import Duration from "../duration";
import { ConversionAccuracy } from "./common";
import { NumberingSystem } from "./locale";
import Invalid from "../impl/invalid";

export type DurationLike = Duration | DurationObject | number;

export interface DurationOptions {
  locale?: string;
  numberingSystem?: NumberingSystem;
  conversionAccuracy?: ConversionAccuracy;
  nullOnInvalid?: boolean;
}

export interface DurationObject extends NormalizedDurationValues {
  year?: number;
  quarter?: number;
  month?: number;
  week?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
  millisecond?: number;
}

export type DurationUnit = keyof DurationObject;

export interface DurationToFormatOptions {
  floor?: boolean;
  /**
   * @deprecated Use floor instead. Will floor the duration
   */
  round?: boolean;
}

export interface NormalizedDurationObject {
  conversionAccuracy?: ConversionAccuracy;
  values?: NormalizedDurationValues;
  loc?: Locale;
}
export interface NormalizedDurationValues {
  years?: number;
  quarters?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}
export type NormalizedDurationUnit = keyof NormalizedDurationValues;

export type ConversionMatrixUnit = Exclude<NormalizedDurationUnit, "milliseconds">;
export type ConversionMatrix = Readonly<{
  [key in ConversionMatrixUnit]: { [key in NormalizedDurationUnit]?: number };
}>;

export interface Config extends NormalizedDurationObject {
  invalid?: Invalid;
}
