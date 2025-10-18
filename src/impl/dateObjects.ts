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
