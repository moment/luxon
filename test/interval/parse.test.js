/* global test expect */
import { Interval } from "../../src/luxon";

//------
// .fromISO()
//------

test("Interval.fromISO can parse a variety of ISO formats", () => {
  const check = (s, ob1, ob2) => {
    const i = Interval.fromISO(s);
    expect(i.start.toObject()).toEqual(ob1);
    expect(i.end.toObject()).toEqual(ob2);
  };

  // keeping these brief because I don't want to rehash the existing DT ISO tests

  check(
    "2007-03-01T13:00:00/2008-05-11T15:30:00",
    {
      year: 2007,
      month: 3,
      day: 1,
      hour: 13,
      minute: 0,
      second: 0,
      millisecond: 0
    },
    {
      year: 2008,
      month: 5,
      day: 11,
      hour: 15,
      minute: 30,
      second: 0,
      millisecond: 0
    }
  );

  check(
    "2007-03-01T13:00:00/2016-W21-3",
    {
      year: 2007,
      month: 3,
      day: 1,
      hour: 13,
      minute: 0,
      second: 0,
      millisecond: 0
    },
    {
      year: 2016,
      month: 5,
      day: 25,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    }
  );

  check(
    "2007-03-01T13:00:00/P1Y2M10DT2H30M",
    {
      year: 2007,
      month: 3,
      day: 1,
      hour: 13,
      minute: 0,
      second: 0,
      millisecond: 0
    },
    {
      year: 2008,
      month: 5,
      day: 11,
      hour: 15,
      minute: 30,
      second: 0,
      millisecond: 0
    }
  );

  check(
    "P1Y2M10DT2H30M/2008-05-11T15:30:00",
    {
      year: 2007,
      month: 3,
      day: 1,
      hour: 13,
      minute: 0,
      second: 0,
      millisecond: 0
    },
    {
      year: 2008,
      month: 5,
      day: 11,
      hour: 15,
      minute: 30,
      second: 0,
      millisecond: 0
    }
  );
});

test("Interval.fromISO accepts a zone argument", () => {
  const dateDate = Interval.fromISO("2016-01-01/2016-12-31", { zone: "Europe/Paris" });
  expect(dateDate.isValid).toBe(true);
  expect(dateDate.start.zoneName).toBe("Europe/Paris");

  const dateDur = Interval.fromISO("2016-01-01/P1Y", { zone: "Europe/Paris" });
  expect(dateDur.isValid).toBe(true);
  expect(dateDur.start.zoneName).toBe("Europe/Paris");

  const durDate = Interval.fromISO("P1Y/2016-01-01", { zone: "Europe/Paris" });
  expect(durDate.isValid).toBe(true);
  expect(durDate.start.zoneName).toBe("Europe/Paris");
});

const badInputs = [
  null,
  "",
  "hello",
  "foo/bar",
  "R5/2008-03-01T13:00:00Z/P1Y2M10DT2H30M" // valid ISO 8601 interval with a repeat, but not supported here
];

test.each(badInputs)("Interval.fromISO will return invalid for [%s]", s => {
  const i = Interval.fromISO(s);
  expect(i.isValid).toBe(false);
  expect(i.invalidReason).toBe("unparsable");
});
