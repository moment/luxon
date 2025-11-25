import { describe, test, expect } from "vitest";

import { DateTime, Settings } from "../../src/luxon.ts";
import { useFakeTime } from "../helpers2.ts";

const dateTimeConstructors = {
  fromObject: (
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number = 0
  ): DateTime =>
    DateTime.fromObject({ year, month, day, hour, minute }, { zone: "America/New_York" }),
  local: (year: number, month: number, day: number, hour: number, minute: number = 0): DateTime =>
    DateTime.local(year, month, day, hour, minute, { zone: "America/New_York" }),
};

describe.each(Object.entries(dateTimeConstructors))(
  "DateTime.$0 bumps DST holes forward",
  (_, factory) => {
    describe.each([
      ["when current time is before the hole", Date.UTC(2017, 3, 12, 6)],
      ["when current time is after the hole", Date.UTC(2017, 3, 12, 10)],
      ["when current time is right at the hole", Date.UTC(2017, 3, 12, 7)],
    ])("%s", (_, systemTime) => {
      test.each([
        ["at the start of the hole", 0],
        ["in the middle of the hole", 30],
      ])("%s", (_, minute) => {
        useFakeTime(systemTime);
        const d = factory(2017, 3, 12, 2, minute);
        expect(d.hour).toBe(3);
        expect(d.minute).toBe(minute);
        expect(d.offset).toBe(-4 * 60);
      });
    });
  }
);

// TODO: Add option for which value to pick and add tests for that
describe.each(Object.entries(dateTimeConstructors))(
  "DateTime.$0 picks any valid instant for ambiguous dates",
  (_, factory) => {
    describe.each([
      ["when current time is before the ambiguity", Date.UTC(2017, 10, 5, 4)],
      ["when current time is after the ambiguity", Date.UTC(2017, 10, 5, 8)],
      ["when current time is during the ambiguity", Date.UTC(2017, 10, 5, 6)],
    ])("%s", (_, systemTime) => {
      test.each([
        ["at the start of the ambiguity", 0],
        ["in the middle of the ambiguity", 30],
      ])("%s", (_, minute) => {
        useFakeTime(systemTime);
        const d = factory(2017, 11, 5, 1, minute);
        expect(d.hour).toBe(1);
        expect(d.minute).toBe(minute);
        expect([d.toMillis(), d.offset]).toBeOneOf([
          [1509858000000 + minute * 60 * 1000, -4 * 60],
          [1509861600000 + minute * 60 * 1000, -5 * 60],
        ]);
      });
    });
  }
);

for (const [name, local] of Object.entries(dateTimeConstructors)) {
  describe(`DateTime.${name}`, () => {
    test("Adding an hour to land on the Spring Forward springs forward", () => {
      const d = local(2017, 3, 12, 1).plus({ hour: 1 });
      expect(d.hour).toBe(3);
      expect(d.offset).toBe(-4 * 60);
    });

    test("Subtracting an hour to land on the Spring Forward springs forward", () => {
      const d = local(2017, 3, 12, 3).minus({ hour: 1 });
      expect(d.hour).toBe(1);
      expect(d.offset).toBe(-5 * 60);
    });

    test("Adding an hour to land on the Fall Back falls back", () => {
      const d = local(2017, 11, 5, 0).plus({ hour: 2 });
      expect(d.hour).toBe(1);
      expect(d.offset).toBe(-5 * 60);
    });

    test("Subtracting an hour to land on the Fall Back falls back", () => {
      let d = local(2017, 11, 5, 3).minus({ hour: 2 });
      expect(d.hour).toBe(1);
      expect(d.offset).toBe(-5 * 60);

      d = d.minus({ hour: 1 });
      expect(d.hour).toBe(1);
      expect(d.offset).toBe(-4 * 60);
    });

    test("Changing a calendar date to land on a hole bumps forward", () => {
      let d = local(2017, 3, 11, 2).plus({ day: 1 });
      expect(d.hour).toBe(3);
      expect(d.offset).toBe(-4 * 60);

      d = local(2017, 3, 13, 2).minus({ day: 1 });
      expect(d.hour).toBe(3);
      expect(d.offset).toBe(-4 * 60);
    });

    test("Changing a calendar date to land on an ambiguous time chooses the closest one", () => {
      let d = local(2017, 11, 4, 1).plus({ day: 1 });
      expect(d.hour).toBe(1);
      expect(d.offset).toBe(-4 * 60);

      d = local(2017, 11, 6, 1).minus({ day: 1 });
      expect(d.hour).toBe(1);
      expect(d.offset).toBe(-5 * 60);
    });

    test("Start of a 0:00->1:00 DST day is 1:00", () => {
      const d = DateTime.fromObject(
        {
          year: 2017,
          month: 10,
          day: 15,
        },
        {
          zone: "America/Sao_Paulo",
        }
      ).startOf("day");
      expect(d.day).toBe(15);
      expect(d.hour).toBe(1);
      expect(d.minute).toBe(0);
      expect(d.second).toBe(0);
    });

    test("End of a 0:00->1:00 DST day is 23:59", () => {
      const d = DateTime.fromObject(
        {
          year: 2017,
          month: 10,
          day: 15,
        },
        {
          zone: "America/Sao_Paulo",
        }
      ).endOf("day");
      expect(d.day).toBe(15);
      expect(d.hour).toBe(23);
      expect(d.minute).toBe(59);
      expect(d.second).toBe(59);
    });
  });
}

describe("DateTime.local() with offset caching", () => {
  const edtTs = 1495653314000; // May 24, 2017 15:15:14 -0400
  const estTs = 1484456400000; // Jan 15, 2017 00:00 -0500

  const edtDate = [2017, 5, 24, 15, 15, 14, 0];
  const estDate = [2017, 1, 15, 0, 0, 0, 0];

  const timestamps = { EDT: edtTs, EST: estTs };
  const dates = { EDT: edtDate, EST: estDate };
  const zoneObj = { zone: "America/New_York" };

  for (const [cacheName, cacheTs] of Object.entries(timestamps)) {
    for (const [nowName, nowTs] of Object.entries(timestamps)) {
      for (const [dateName, date] of Object.entries(dates)) {
        test(`cache = ${cacheName}, now = ${nowName}, date = ${dateName}`, () => {
          const oldSettings = Settings.now;
          try {
            Settings.now = () => cacheTs;
            Settings.resetCaches();
            // load cache
            DateTime.local(2020, 1, 1, 0, zoneObj);

            Settings.now = () => nowTs;
            const dt = DateTime.local(...date, zoneObj);
            expect(dt.toMillis()).toBe(timestamps[dateName]);
            expect(dt.year).toBe(date[0]);
            expect(dt.month).toBe(date[1]);
            expect(dt.day).toBe(date[2]);
            expect(dt.hour).toBe(date[3]);
            expect(dt.minute).toBe(date[4]);
            expect(dt.second).toBe(date[5]);
          } finally {
            Settings.now = oldSettings;
          }
        });
      }
    }
  }
});
