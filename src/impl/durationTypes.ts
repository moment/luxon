import type Duration from "../duration.ts";

export interface DurationObject {
  years: number | undefined;
  months: number | undefined;
  quarters: number | undefined;
  weeks: number | undefined;
  days: number | undefined;
  hours: number | undefined;
  minutes: number | undefined;
  seconds: number | undefined;
  milliseconds: number | undefined;
}

export type DurationUnit = keyof DurationObject;
export type DurationCalendarUnit = Extract<
  DurationUnit,
  "years" | "months" | "quarters" | "weeks" | "days"
>;
export type DurationTimeUnit = Exclude<DurationUnit, DurationCalendarUnit>;

export interface DurationInputObject {
  year?: number;
  years?: number;
  month?: number;
  months?: number;
  quarter?: number;
  quarters?: number;
  week?: number;
  weeks?: number;
  day?: number;
  days?: number;
  hour?: number;
  hours?: number;
  minute?: number;
  minutes?: number;
  second?: number;
  seconds?: number;
  millisecond?: number;
  milliseconds?: number;
}

export type DurationInput = number | Duration | DurationInputObject;
