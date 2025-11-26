import { bench, describe } from "vitest";
import { objToLocalTS } from "../../src/impl/util.ts";
import { LuxonIntlError } from "../../src/errors.ts";

function formatToPartsDiff(dtf: Intl.DateTimeFormat, ts: number): number {
  const date = new Date(ts);

  if (isNaN(+date)) return NaN;

  const formatted = dtf.formatToParts(date);
  let bc = false;
  const obj = {
    year: 0,
    month: 0,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  };
  for (const item of formatted) {
    const { type, value } = item;
    if (type in obj) {
      // technically unsound, but we know this is safe here
      obj[type as keyof typeof obj] = parseInt(value, 10);
    } else if (type === "era") {
      bc = value === "BC";
    }
  }
  if (bc) {
    obj.year = -Math.abs(obj.year) + 1;
  }

  const asUTC = objToLocalTS(obj);
  let asTS = +date;
  const over = asTS % 1000;
  asTS -= over >= 0 ? over : 1000 + over;
  return (asUTC - asTS) / 1000;
}

function formatToPartsOffset(dtf: Intl.DateTimeFormat, ts: number): number {
  let offsetPart: Intl.DateTimeFormatPart | undefined;
  try {
    offsetPart = dtf.formatToParts(ts).find((p) => p.type === "timeZoneName");
  } catch (e) {
    return NaN;
  }
  const match = offsetPart?.value.match(/^GMT(?:([+-])(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
  if (match == null) {
    throw new LuxonIntlError(`Failed to extract GMT offset from ${offsetPart?.value}`);
  }
  const [, sign, h = 0, m = 0, s = 0] = match;
  let r = +h * 60 * 60 + +m * 60 + +s;
  if (sign === "-") {
    r *= -1;
  }
  return r / 60;
}

const gmtRegex = /^GMT(?:([+-])(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/;

function formatToPartsOffsetRecreateDtf(ts: number): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    timeZoneName: "longOffset",
  });
  let offsetPart: Intl.DateTimeFormatPart | undefined;
  try {
    offsetPart = dtf.formatToParts(ts).find((p) => p.type === "timeZoneName");
  } catch (e) {
    return NaN;
  }
  const match = offsetPart?.value.match(gmtRegex);
  if (match == null) {
    throw new LuxonIntlError(`Failed to extract GMT offset from ${offsetPart?.value}`);
  }
  const [, sign, h = 0, m = 0, s = 0] = match;
  let r = +h * 60 * 60 + +m * 60 + +s;
  if (sign === "-") {
    r *= -1;
  }
  return r / 60;
}

function dateNative(ts: number): number {
  return -new Date(ts).getTimezoneOffset();
}

describe("IANAZone offset", () => {
  const opts = {
    iterations: 5_000,
    warmupIterations: 500_000,
  };

  const dtf1 = new Intl.DateTimeFormat("en-US", {
    hourCycle: "h23",
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    era: "short",
  });
  const dtf2 = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    timeZoneName: "longOffset",
  });
  const ts = [1764102072075, 1734102072075, 1164102072075, 764102072075];
  bench(
    "formatToParts diff",
    () => {
      let x = 0;
      for (const t of ts) {
        x |= formatToPartsDiff(dtf1, t);
      }
    },
    opts
  );
  bench(
    "formatToParts offset",
    () => {
      let x = 0;
      for (const t of ts) {
        x |= formatToPartsOffset(dtf2, t);
      }
    },
    opts
  );
  bench(
    "formatToPartsOffsetRecreateDtf",
    () => {
      let x = 0;
      for (const t of ts) {
        x |= formatToPartsOffsetRecreateDtf(t);
      }
    },
    opts
  );
});
