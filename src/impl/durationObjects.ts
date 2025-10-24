export interface DurationObject {
  years?: number;
  months?: number;
  quarters?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

export type DurationUnit = keyof DurationObject;

export interface DurationInputObject {}
