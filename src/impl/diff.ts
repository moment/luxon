import Duration from "../duration";
import DateTime from "../datetime";
import { DurationUnit, DurationOptions, DurationObject } from "../types/duration";

function dayDiff(earlier: DateTime, later: DateTime) {
  const utcDayStart = (dt: DateTime) =>
      dt
        .toUTC(0, { keepLocalTime: true })
        .startOf("days")
        .valueOf(),
    ms = utcDayStart(later) - utcDayStart(earlier);
  return Math.floor(Duration.fromMillis(ms).as("days"));
}

function highOrderDiffs(
  earlier: DateTime,
  later: DateTime,
  units: DurationUnit[]
): [DateTime, DurationObject, DateTime, DurationUnit | undefined] {
  const differs: [DurationUnit, (a: DateTime, b: DateTime) => number][] = [
    ["years", (a, b) => b.year - a.year],
    ["months", (a, b) => b.month - a.month + (b.year - a.year) * 12],
    [
      "weeks",
      (a, b) => {
        const days = dayDiff(a, b);
        return (days - (days % 7)) / 7;
      }
    ],
    ["days", dayDiff]
  ];

  const results: DurationObject = {};
  let lowestOrder: DurationUnit | undefined,
    highWater = earlier,
    cursor = earlier.reconfigure({});

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

export default function(
  earlier: DateTime,
  later: DateTime,
  units: DurationUnit[],
  options: DurationOptions
) {
  // eslint-disable-next-line prefer-const
  let [cursor, results, highWater, lowestOrder] = highOrderDiffs(earlier, later, units);

  const remainingMillis = later.valueOf() - cursor.valueOf();

  const lowerOrderUnits = units.filter(
    u => ["hours", "minutes", "seconds", "milliseconds"].indexOf(u) >= 0
  );

  if (lowerOrderUnits.length === 0) {
    // if there are no low order units, there is at least one high order unit
    // and lowestOrder is hence defined
    if (highWater < later) {
      highWater = cursor.plus({ [lowestOrder as DurationUnit]: 1 });
    }

    if (highWater !== cursor) {
      results[lowestOrder as DurationUnit] =
        (results[lowestOrder as DurationUnit] as number) +
        remainingMillis / (highWater.valueOf() - cursor.valueOf());
    }
  }

  const duration = Duration.fromObject(results, options);

  if (lowerOrderUnits.length > 0) {
    return Duration.fromMillis(remainingMillis, options)
      .shiftTo(...lowerOrderUnits)
      .plus(duration);
  } else {
    return duration;
  }
}
