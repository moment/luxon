import Duration from "../duration.ts";
import type DateTime from "../datetime.ts";
import { utcTs } from "./util.ts";

function dayDiff(earlier: DateTime, later: DateTime): number {
  const ms =
    utcTs(later.year, later.month, later.day) - utcTs(earlier.year, earlier.month, earlier.day);
  return Math.trunc(ms / (24 * 60 * 60 * 1000));
}

function highOrderDiffs(
  cursor: DateTime,
  later: DateTime,
  units: string[]
): [cursor: DateTime, results: any, highWater: DateTime, lowestOrder: string] {
  const differs: Array<[string, (a: DateTime, b: DateTime) => number]> = [
    ["years", (a, b) => b.year - a.year],
    ["quarters", (a, b) => b.quarter - a.quarter + (b.year - a.year) * 4],
    ["months", (a, b) => b.month - a.month + (b.year - a.year) * 12],
    [
      "weeks",
      (a, b) => {
        const days = dayDiff(a, b);
        return (days - (days % 7)) / 7;
      },
    ],
    ["days", dayDiff],
  ];

  const results: any = {};
  const earlier = cursor;
  let lowestOrder, highWater;

  /* This loop tries to diff using larger units first.
     If we overshoot, we backtrack and try the next smaller unit.
     "cursor" starts out at the earlier timestamp and moves closer and closer to "later"
     as we use smaller and smaller units.
     highWater keeps track of where we would be if we added one more of the smallest unit,
     this is used later to potentially convert any difference smaller than the smallest higher order unit
     into a fraction of that smallest higher order unit
  */
  for (const [unit, differ] of differs) {
    if (units.indexOf(unit) >= 0) {
      lowestOrder = unit;

      results[unit] = differ(cursor, later);
      highWater = earlier.plus(results);

      if (highWater > later) {
        // we overshot the end point, backtrack cursor by 1
        results[unit]--;
        cursor = earlier.plus(results);

        // if we are still overshooting now, we need to backtrack again
        // this happens in certain situations when diffing times in different zones,
        // because this calculation ignores time zones
        if (cursor > later) {
          // keep the "overshot by 1" around as highWater
          highWater = cursor;
          // backtrack cursor by 1
          results[unit]--;
          cursor = earlier.plus(results);
        }
      } else {
        cursor = highWater;
      }
    }
  }

  return [cursor, results, highWater!, lowestOrder!];
}

export default function (earlier: DateTime, later: DateTime, units: string[], opts: any): Duration {
  let [cursor, results, highWater, lowestOrder] = highOrderDiffs(earlier, later, units);

  const remainingMillis = +later - +cursor;

  const lowerOrderUnits = units.filter(
    (u) => ["hours", "minutes", "seconds", "milliseconds"].indexOf(u) >= 0
  );

  if (lowerOrderUnits.length === 0) {
    if (highWater < later) {
      highWater = cursor.plus({ [lowestOrder]: 1 });
    }

    if (highWater !== cursor) {
      results[lowestOrder] = (results[lowestOrder] || 0) + remainingMillis / (+highWater - +cursor);
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
