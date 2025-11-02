import type { PartialNullable } from "./utilTypes.ts";

export interface DateObject {
  year: number;
  month: number;
  day: number;
}

export interface OrdinalDateObject {
  year: number;
  ordinal: number;
}

export interface WeekDateObject {
  weekYear: number;
  weekNumber: number;
  weekday: number;
}

export type AnyDateObject = DateObject | OrdinalDateObject | WeekDateObject;

export interface TimeObject {
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

export type DateTimeObject<T extends AnyDateObject = DateObject> = T & TimeObject;

interface AllDateObject extends DateObject, OrdinalDateObject, WeekDateObject {}

type AppendS<T> = T & {
  [K in keyof T as K extends string ? `${K}s` : never]: T[K];
};

export type DateTimeObjectInput = PartialNullable<AppendS<DateTimeObject<AllDateObject>>>;
export type NormalizedDateTimeObjectInput = Partial<DateTimeObject<AllDateObject>>;
