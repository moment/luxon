import { add, complete, cycle, suite } from "benny";
import Info from "../src/info";
import Locale from "../src/impl/locale";

const locale = Locale.create(undefined, null, null);
suite(
  "runWeekdays",
  add("Info.weekdays with existing locale", () => {
    Info.weekdays("long", { locObj: locale });
  }),
  add("Info.weekdays", () => {
    Info.weekdays("long");
  }),
  cycle(),
  complete()
);

suite(
  "runWeekdaysFormat",
  add("Info.weekdaysFormat with existing locale", () => {
    Info.weekdaysFormat("long", { locObj: locale });
  }),
  add("Info.weekdaysFormat", () => {
    Info.weekdaysFormat("long");
  }),
  cycle(),
  complete()
);

suite(
  "runMonths",
  add("Info.months with existing locale", () => {
    Info.months("long", { locObj: locale });
  }),
  add("Info.months", () => {
    Info.months("long");
  }),
  cycle(),
  complete()
);

suite(
  "runMonthsFormat",
  add("Info.monthsFormat with existing locale", () => {
    Info.monthsFormat("long", { locObj: locale });
  }),
  add("Info.monthsFormat", () => {
    Info.monthsFormat("long");
  }),
  cycle(),
  complete()
);
