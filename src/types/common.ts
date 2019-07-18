export type ConversionAccuracy = "casual" | "longterm";

export type HourCycle = "h11" | "h12" | "h23" | "h24";

export type StringUnitLength = "narrow" | "short" | "long";
export type NumberUnitLength = "numeric" | "2-digit";
export type UnitLength = StringUnitLength | NumberUnitLength;

export interface ThrowOnInvalid {
  nullOnInvalid?: false;
}
