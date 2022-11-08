/* global test expect */
import { Interval, DateTime } from "../../src/luxon";

const fromISOs = (s, e) =>
    DateTime.fromISO(s, { setZone: true }).until(DateTime.fromISO(e, { setZone: true })),
  interval = fromISOs("1982-05-25T09:00Z", "1983-10-14T13:30Z"),
  invalid = Interval.invalid("because");

//------
// .toString()
//------

test("Interval#toString returns a simple range format", () =>
  expect(interval.toString()).toBe("[1982-05-25T09:00:00.000Z – 1983-10-14T13:30:00.000Z)"));

test("Interval#toString returns an unfriendly string for invalid intervals", () =>
  expect(invalid.toString()).toBe("Invalid Interval"));

//------
// .toLocaleString()
//------

test("Interval#toLocaleString defaults to the DATE_SHORT format", () =>
  expect(interval.toLocaleString()).toBe("5/25/1982 – 10/14/1983"));

test("Interval#toLocaleString returns an unfriendly string for invalid intervals", () =>
  expect(invalid.toLocaleString()).toBe("Invalid Interval"));

test("Interval#toLocaleString lets the locale set the numbering system", () => {
  expect(
    Interval.after(interval.start.reconfigure({ locale: "ja-JP" }), { hour: 2 }).toLocaleString({
      hour: "numeric",
    })
  ).toBe("9時～11時");
});

test("Interval#toLocaleString accepts locale settings from the start DateTime", () => {
  expect(
    Interval.fromDateTimes(
      interval.start.reconfigure({ locale: "be" }),
      interval.end
    ).toLocaleString()
  ).toBe("25.5.1982 – 14.10.1983");
});

test("Interval#toLocaleString accepts numbering system settings from the start DateTime", () => {
  expect(
    Interval.fromDateTimes(
      interval.start.reconfigure({ numberingSystem: "beng" }),
      interval.end
    ).toLocaleString()
  ).toBe("৫/২৫/১৯৮২ – ১০/১৪/১৯৮৩");
});

test("Interval#toLocaleString accepts ouptput calendar settings from the start DateTime", () => {
  expect(
    Interval.fromDateTimes(
      interval.start.reconfigure({ outputCalendar: "islamic" }),
      interval.end
    ).toLocaleString()
  ).toBe("8/2/1402 – 1/8/1404 AH");
});

test("Interval#toLocaleString accepts options to the formatter", () => {
  expect(interval.toLocaleString({ weekday: "short" })).toBe("Tue – Fri");
});

test("Interval#toLocaleString can override the start DateTime's locale", () => {
  expect(
    Interval.fromDateTimes(
      interval.start.reconfigure({ locale: "be" }),
      interval.end
    ).toLocaleString({}, { locale: "fr" })
  ).toBe("25/05/1982 – 14/10/1983");
});

test("Interval#toLocaleString can override the start DateTime's numbering system", () => {
  expect(
    Interval.fromDateTimes(
      interval.start.reconfigure({ numberingSystem: "beng" }),
      interval.end
    ).toLocaleString({ numberingSystem: "mong" })
  ).toBe("᠕/᠒᠕/᠑᠙᠘᠒ – ᠑᠐/᠑᠔/᠑᠙᠘᠓");
});

test("Interval#toLocaleString can override the start DateTime's output calendar", () => {
  expect(
    Interval.fromDateTimes(
      interval.start.reconfigure({ outputCalendar: "islamic" }),
      interval.end
    ).toLocaleString({}, { outputCalendar: "coptic" })
  ).toBe("9/17/1698 – 2/3/1700 ERA1");
});

test("Interval#toLocaleString shows things in the right IANA zone", () => {
  expect(
    Interval.fromDateTimes(
      interval.start.setZone("Australia/Melbourne"),
      interval.end
    ).toLocaleString(DateTime.DATETIME_SHORT)
  ).toBe("5/25/1982, 7:00 PM – 10/14/1983, 11:30 PM");
});

test("Interval#toLocaleString shows things in the right fixed-offset zone", () => {
  expect(
    Interval.fromDateTimes(interval.start.setZone("UTC-8"), interval.end).toLocaleString(
      DateTime.DATETIME_SHORT
    )
  ).toBe("5/25/1982, 1:00 AM – 10/14/1983, 5:30 AM");
});

test("Interval#toLocaleString shows things in the right fixed-offset zone when showing the zone", () => {
  expect(
    Interval.fromDateTimes(interval.start.setZone("UTC-8"), interval.end).toLocaleString(
      DateTime.DATETIME_FULL
    )
  ).toBe("May 25, 1982 at 1:00 AM GMT-8 – October 14, 1983 at 5:30 AM GMT-8");
});

test("Interval#toLocaleString shows things with UTC if fixed-offset with 0 offset is used", () => {
  expect(
    Interval.fromDateTimes(interval.start.setZone("UTC"), interval.end).toLocaleString(
      DateTime.DATETIME_FULL
    )
  ).toBe("May 25, 1982 at 9:00 AM UTC – October 14, 1983 at 1:30 PM UTC");
});

test("Interval#toLocaleString does the best it can with unsupported fixed-offset zone when showing the zone", () => {
  expect(
    Interval.fromDateTimes(interval.start.setZone("UTC+4:30"), interval.end).toLocaleString(
      DateTime.DATETIME_FULL
    )
  ).toBe("May 25, 1982 at 9:00 AM UTC – October 14, 1983 at 1:30 PM UTC");
});

test("Interval#toLocaleString uses locale-appropriate time formats", () => {
  expect(
    Interval.after(interval.start.reconfigure({ locale: "en-US" }), { hour: 2 }).toLocaleString(
      DateTime.TIME_SIMPLE
    )
  ).toBe("9:00 – 11:00 AM");
  expect(
    Interval.after(interval.start.reconfigure({ locale: "en-US" }), { hour: 2 }).toLocaleString(
      DateTime.TIME_24_SIMPLE
    )
  ).toBe("09:00 – 11:00");

  // France has 24-hour by default
  expect(
    Interval.after(interval.start.reconfigure({ locale: "fr" }), { hour: 2 }).toLocaleString(
      DateTime.TIME_SIMPLE
    )
  ).toBe("09:00 – 11:00");
  expect(
    Interval.after(interval.start.reconfigure({ locale: "fr" }), { hour: 2 }).toLocaleString(
      DateTime.TIME_24_SIMPLE
    )
  ).toBe("09:00 – 11:00");

  // Spain does't prefix with "0" and doesn't use spaces
  expect(
    Interval.after(interval.start.reconfigure({ locale: "es" }), { hour: 2 }).toLocaleString(
      DateTime.TIME_SIMPLE
    )
  ).toBe("9:00–11:00");
  expect(
    Interval.after(interval.start.reconfigure({ locale: "es" }), { hour: 2 }).toLocaleString(
      DateTime.TIME_24_SIMPLE
    )
  ).toBe("9:00–11:00");
});

test("Interval#toLocaleString sets the separator between days for same-month dates", () => {
  expect(Interval.after(interval.start, { day: 2 }).toLocaleString(DateTime.DATE_MED)).toBe(
    "May 25 – 27, 1982"
  );
});

//------
// .toISO()
//------

test("Interval#toISO returns a simple ISO format", () =>
  expect(interval.toISO()).toBe("1982-05-25T09:00:00.000Z/1983-10-14T13:30:00.000Z"));

test("Interval#toISO accepts ISO options", () =>
  expect(interval.toISO({ suppressSeconds: true })).toBe("1982-05-25T09:00Z/1983-10-14T13:30Z"));

test("Interval#toISO returns an unfriendly string for invalid intervals", () =>
  expect(invalid.toISO()).toBe("Invalid Interval"));

//------
// .toISODate()
//------

test("Interval#toISODate returns a simple ISO date interval format", () =>
  expect(interval.toISODate()).toBe("1982-05-25/1983-10-14"));

test("Interval#toISODate returns an unfriendly string for invalid intervals", () =>
  expect(invalid.toISODate()).toBe("Invalid Interval"));

//------
// .toISOTime()
//------

test("Interval#toISOTime returns a simple ISO time interval format", () =>
  expect(interval.toISOTime()).toBe("09:00:00.000Z/13:30:00.000Z"));

test("Interval#toISOTime returns an unfriendly string for invalid intervals", () =>
  expect(invalid.toISOTime()).toBe("Invalid Interval"));

test("Interval#toISOTime accepts ISO options", () => {
  expect(interval.toISOTime({ suppressSeconds: true })).toBe("09:00Z/13:30Z");
  expect(interval.toISOTime({ suppressMilliseconds: true })).toBe("09:00:00Z/13:30:00Z");
});

//------
// .toFormat()
//------

test("Interval#toFormat accepts date formats", () => {
  expect(interval.toFormat("EEE, LLL dd, yyyy")).toBe("Tue, May 25, 1982 – Fri, Oct 14, 1983");
  expect(interval.toFormat("HH:mm")).toBe("09:00 – 13:30");
});

test("Interval#toFormat accepts date formats", () => {
  expect(interval.toFormat("EEE, LLL dd, yyyy", { separator: " until " })).toBe(
    "Tue, May 25, 1982 until Fri, Oct 14, 1983"
  );
});

test("Interval#toFormat returns an unfriendly string for invalid intervals", () => {
  expect(invalid.toFormat("EEE, LLL dd, yyyy")).toBe("Invalid Interval");
});
