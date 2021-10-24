import { DateTime } from "../../src/luxon";
import * as Formats from "../../src/impl/formats";

test("Can get presets from DateTime", () => {
  expect(DateTime.DATE_SHORT).toBe(Formats.DATE_SHORT);
  expect(DateTime.DATE_MED).toBe(Formats.DATE_MED);
  expect(DateTime.DATE_MED_WITH_WEEKDAY).toBe(Formats.DATE_MED_WITH_WEEKDAY);
  expect(DateTime.DATE_FULL).toBe(Formats.DATE_FULL);
  expect(DateTime.DATE_HUGE).toBe(Formats.DATE_HUGE);
  expect(DateTime.TIME_SIMPLE).toBe(Formats.TIME_SIMPLE);
  expect(DateTime.TIME_WITH_SECONDS).toBe(Formats.TIME_WITH_SECONDS);
  expect(DateTime.TIME_WITH_SHORT_OFFSET).toBe(Formats.TIME_WITH_SHORT_OFFSET);
  expect(DateTime.TIME_WITH_LONG_OFFSET).toBe(Formats.TIME_WITH_LONG_OFFSET);
  expect(DateTime.TIME_24_SIMPLE).toBe(Formats.TIME_24_SIMPLE);
  expect(DateTime.TIME_24_WITH_SECONDS).toBe(Formats.TIME_24_WITH_SECONDS);
  expect(DateTime.TIME_24_WITH_SHORT_OFFSET).toBe(Formats.TIME_24_WITH_SHORT_OFFSET);
  expect(DateTime.TIME_24_WITH_LONG_OFFSET).toBe(Formats.TIME_24_WITH_LONG_OFFSET);
  expect(DateTime.DATETIME_SHORT).toBe(Formats.DATETIME_SHORT);
  expect(DateTime.DATETIME_SHORT_WITH_SECONDS).toBe(Formats.DATETIME_SHORT_WITH_SECONDS);
  expect(DateTime.DATETIME_MED).toBe(Formats.DATETIME_MED);
  expect(DateTime.DATETIME_MED_WITH_SECONDS).toBe(Formats.DATETIME_MED_WITH_SECONDS);
  expect(DateTime.DATETIME_MED_WITH_WEEKDAY).toBe(Formats.DATETIME_MED_WITH_WEEKDAY);
  expect(DateTime.DATETIME_FULL).toBe(Formats.DATETIME_FULL);
  expect(DateTime.DATETIME_FULL_WITH_SECONDS).toBe(Formats.DATETIME_FULL_WITH_SECONDS);
  expect(DateTime.DATETIME_HUGE).toBe(Formats.DATETIME_HUGE);
  expect(DateTime.DATETIME_HUGE_WITH_SECONDS).toBe(Formats.DATETIME_HUGE_WITH_SECONDS);
});
