/* global test expect */

import { DateTime } from "../../src/luxon";

//------
// .startOf() with useLocaleWeeks
//------
test("startOf locale week adheres to the locale", () => {
  const dt = DateTime.fromISO("2023-06-14T13:00:00Z", { setZone: true });
  expect(
    dt.reconfigure({ locale: "de-DE" }).startOf("week", { useLocaleWeeks: true }).toISO()
  ).toBe("2023-06-12T00:00:00.000Z");
  expect(
    dt.reconfigure({ locale: "en-US" }).startOf("week", { useLocaleWeeks: true }).toISO()
  ).toBe("2023-06-11T00:00:00.000Z");
});

test("startOf locale week handles crossing into the previous year", () => {
  const dt = DateTime.fromISO("2023-01-01T13:00:00Z", { setZone: true });
  expect(
    dt.reconfigure({ locale: "de-DE" }).startOf("week", { useLocaleWeeks: true }).toISO()
  ).toBe("2022-12-26T00:00:00.000Z");
});

//------
// .endOf() with useLocaleWeeks
//------
test("endOf locale week adheres to the locale", () => {
  const dt = DateTime.fromISO("2023-06-14T13:00:00Z", { setZone: true });
  expect(dt.reconfigure({ locale: "de-DE" }).endOf("week", { useLocaleWeeks: true }).toISO()).toBe(
    "2023-06-18T23:59:59.999Z"
  );
  expect(dt.reconfigure({ locale: "en-US" }).endOf("week", { useLocaleWeeks: true }).toISO()).toBe(
    "2023-06-17T23:59:59.999Z"
  );
});

test("endOf locale week handles crossing into the next year", () => {
  const dt = DateTime.fromISO("2022-12-31T13:00:00Z", { setZone: true });
  expect(dt.reconfigure({ locale: "de-DE" }).endOf("week", { useLocaleWeeks: true }).toISO()).toBe(
    "2023-01-01T23:59:59.999Z"
  );
});
