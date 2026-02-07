import type { DurationInputObject, DurationObject } from "./durationTypes.ts";
import Duration from "../duration.ts";
import { isLuxonType, type LuxonTypeMarker } from "./crossRealm.ts";
import { LuxonError } from "../errors.ts";
import { checkInteger } from "./typeChecks.ts";

export const LUXON_TYPE_DURATION = "duration" as LuxonTypeMarker<Duration>;

const durationUnits = [
  "years",
  "quarters",
  "months",
  "weeks",
  "days",
  "hours",
  "minutes",
  "seconds",
  "milliseconds",
  // Validate that all entries are keys of DurationObject
] as const satisfies Array<keyof DurationObject>;

type MapToSingular<T> = {
  [K in keyof T]: T[K] extends `${infer U}s` ? U : never;
};
const durationSingularUnits = [
  "year",
  "quarter",
  "month",
  "week",
  "day",
  "hour",
  "minute",
  "second",
  "millisecond",
  // Validate that
  //   a) all entries are keys of DurationInputObject
  //   b) the durationUnits and durationSingularUnits arrays match up
] as const satisfies Array<keyof DurationInputObject> satisfies MapToSingular<typeof durationUnits>;

export function normalizeToDurationObject(obj: Duration | DurationInputObject): DurationObject {
  if (isLuxonType(obj, LUXON_TYPE_DURATION)) {
    return obj;
  } else {
    const result: Partial<DurationObject> = Object.create(null);
    for (let i = 0; i < durationUnits.length; i++) {
      const unit = durationUnits[i];
      const a = obj[unit];
      const b = obj[durationSingularUnits[i]];
      if (a != null && b != null) {
        throw new LuxonError(`Duplicate unit ${unit}`);
      }
      const v = a ?? b ?? undefined;
      if (v !== undefined) {
        checkInteger(v, unit);
      }
      result[unit] = v;
    }
    for (const key in obj) {
      if (
        Object.hasOwn(obj, key) &&
        !durationUnits.includes(key as never) &&
        !durationSingularUnits.includes(key as never)
      ) {
        throw new LuxonError(`Unsupported duration unit ${key}`);
      }
    }
    return result as DurationObject;
  }
}
