import Duration from "../duration.js";

function dayDiff(earlier, later) {
  const utcDayStart = (dt) => dt.toUTC(0, { keepLocalTime: true }).startOf("day").valueOf(),
    ms = utcDayStart(later) - utcDayStart(earlier);
  return Math.floor(Duration.fromMillis(ms).as("days"));
}

function highOrderDiffs(earlier, later, units) {
  const diffHeuristics = [
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

  const results = {};
  let lowestOrder, highWater;

  for (const [unit, diffHeuristic] of diffHeuristics) {
    if (units.indexOf(unit) >= 0) {
      lowestOrder = unit;

      results[unit] = diffHeuristic(earlier.plus(results), later);
      // If the heuristic is an over-estimate, decrement it until the sum is less than the target date. The heurisitics rarely if ever create over-estimates, so this code is not typically exectued at all.
      while (earlier.plus(results) > later) results[unit]--;
      // Now that the result is definitely an underestimate, increment it until the sum exceeds the target date. Typically this loop runs exactly once, and may run twice in edge cases.
      while ((highWater = earlier.plus(results)) <= later) results[unit]++;
      // Finally decrement the result once to ensure a tight underestimate, and proceed to the next lower order unit.
      results[unit]--;
    }
  }

  return [earlier.plus(results), results, highWater, lowestOrder];
}

export default function (earlier, later, units, opts) {
  let [cursor, results, highWater, lowestOrder] = highOrderDiffs(earlier, later, units);

  const remainingMillis = later - cursor;

  const lowerOrderUnits = units.filter(
    (u) => ["hours", "minutes", "seconds", "milliseconds"].indexOf(u) >= 0
  );

  if (lowerOrderUnits.length === 0 && highWater !== cursor) {
    results[lowestOrder] = (results[lowestOrder] || 0) + remainingMillis / (highWater - cursor);
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
