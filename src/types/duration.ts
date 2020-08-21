import { ConversionAccuracy } from "./common";
import { NumberingSystem } from "./locale";

export interface DurationOptions {
  locale?: string;
  numberingSystem?: NumberingSystem;
  conversionAccuracy?: ConversionAccuracy;
  nullOnInvalid?: boolean;
}

export interface DurationObject {
  years?: number;
  year?: number;
  quarters?: number;
  quarter?: number;
  months?: number;
  month?: number;
  weeks?: number;
  week?: number;
  days?: number;
  day?: number;
  hours?: number;
  hour?: number;
  minutes?: number;
  minute?: number;
  seconds?: number;
  second?: number;
  milliseconds?: number;
  millisecond?: number;
}

export type DurationUnit = keyof DurationObject;

export interface DurationToFormatOptions {
  floor?: boolean;
}
