import { DurationObject, DurationOptions, DurationUnit } from "../types/duration";
import DateTime from "../datetime";
import Duration from "../duration";

function dayDiff(earlier: DateTime, later: DateTime) {
  const utcDayStart = (dt: DateTime) =>
      dt.toUTC(0, { keepLocalTime: true }).startOf("day").valueOf(),
    ms = utcDayStart(later) - utcDayStart(earlier);
  return Math.floor(Duration.fromMillis(ms).as("days"));
}

function highOrderDiffs(
  cursor: DateTime,
  later: DateTime,
  units: DurationUnit[]
): [DateTime, DurationObject, DateTime, DurationUnit | undefined] {
  const differs: [DurationUnit, (a: DateTime, b: DateTime) => number][] = [
    ["years", (a: DateTime, b: DateTime) => b.year - a.year],
    ["quarters", (a: DateTime, b: DateTime) => b.quarter - a.quarter],
    ["months", (a: DateTime, b: DateTime) => b.month - a.month + (b.year - a.year) * 12],
    [
      "weeks",
      (a: DateTime, b: DateTime) => {
        const days = dayDiff(a, b);
        return (days - (days % 7)) / 7;
      },
    ],
    ["days", dayDiff],
  ];

  const results: DurationObject = {};
  let lowestOrder,
    highWater = cursor;

  for (const [unit, differ] of differs) {
    if (units.indexOf(unit) >= 0) {
      lowestOrder = unit;

      let delta = differ(cursor, later);
      highWater = cursor.plus({ [unit]: delta });

      if (highWater > later) {
        cursor = cursor.plus({ [unit]: delta - 1 });
        delta -= 1;
      } else {
        cursor = highWater;
      }

      results[unit] = delta;
    }
  }

  return [cursor, results, highWater, lowestOrder];
}

export default function (
  earlier: DateTime,
  later: DateTime,
  units: DurationUnit[],
  opts: DurationOptions
): Duration {
  // eslint-disable-next-line prefer-const
  let [cursor, results, highWater, lowestOrder] = highOrderDiffs(earlier, later, units);

  const remainingMillis = later.valueOf() - cursor.valueOf();

  const lowerOrderUnits = units.filter(
    (u) => ["hours", "minutes", "seconds", "milliseconds"].indexOf(u) >= 0
  );

  if (lowerOrderUnits.length === 0) {
    if (highWater < later) {
      highWater = cursor.plus({ [lowestOrder as DurationUnit]: 1 });
    }

    if (highWater !== cursor) {
      results[lowestOrder as DurationUnit] =
        (results[lowestOrder as DurationUnit] || 0) +
        remainingMillis / (highWater.valueOf() - cursor.valueOf());
    }
  }

  const duration = Duration.fromObject(results, opts);

  if (lowerOrderUnits.length > 0) {
    return Duration.fromMillis(remainingMillis, opts)
      .shiftTo(...lowerOrderUnits)
      .plus(duration);
  } else {
    return duration;
  }
}
