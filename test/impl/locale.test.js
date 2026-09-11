/* global test expect */
import { DateTime, Duration, Info, Settings } from "../../src/luxon";
import Locale from "../../src/impl/locale";
import Helpers from "../helpers";

const withDefaultLocale = Helpers.withDefaultLocale;
const withDefaultNumberingSystem = Helpers.setUnset("defaultNumberingSystem");
const withDefaultOutputCalendar = Helpers.setUnset("defaultOutputCalendar");
const withDefaultWeekSettings = Helpers.setUnset("defaultWeekSettings");

const weekSettings = { firstDay: 1, minimalDays: 4, weekend: [6, 7] };

//------
// .create() caching
//------
test("Locale.create returns the same instance for the same configuration", () => {
  expect(Locale.create()).toBe(Locale.create());
  expect(Locale.create("fr")).toBe(Locale.create("fr"));
  expect(Locale.create("fr", "arab", "islamic")).toBe(Locale.create("fr", "arab", "islamic"));
  expect(Locale.create("fr", null, null, weekSettings)).toBe(
    Locale.create("fr", null, null, weekSettings)
  );
});

test("Locale.create returns different instances for different configurations", () => {
  const loc = Locale.create("fr");
  expect(Locale.create("de")).not.toBe(loc);
  expect(Locale.create("fr", "arab")).not.toBe(loc);
  expect(Locale.create("fr", null, "islamic")).not.toBe(loc);
  expect(Locale.create("fr", null, null, weekSettings)).not.toBe(loc);
});

test("Locale.create keys weekSettings by value", () => {
  const copy = { ...weekSettings, weekend: [...weekSettings.weekend] };
  expect(Locale.create("fr", null, null, copy)).toBe(Locale.create("fr", null, null, weekSettings));
  expect(Locale.create("fr", null, null, { ...copy, firstDay: 7 })).not.toBe(
    Locale.create("fr", null, null, weekSettings)
  );
});

test("Locale.create distinguishes a specified en-US from the defaultToEN fallback", () => {
  const fallback = Locale.create(null, null, null, null, true);
  const specified = Locale.create("en-US");
  expect(fallback.locale).toBe("en-US");
  expect(specified).not.toBe(fallback);
  // clone() redefaults the fallback to the current default locale but keeps a specified one
  withDefaultLocale("fr", () => {
    expect(fallback.redefaultToSystem().locale).toBe("fr");
    expect(specified.redefaultToSystem().locale).toBe("en-US");
  });
});

test("Locale.create picks up changes to Settings.defaultLocale", () => {
  const loc = Locale.create();
  withDefaultLocale("de", () => {
    const de = Locale.create();
    expect(de).not.toBe(loc);
    expect(de.locale).toBe("de");
    expect(Locale.create()).toBe(de);
  });
  expect(Locale.create()).toBe(loc);
});

test("Locale.create picks up changes to Settings.defaultNumberingSystem", () => {
  const loc = Locale.create("en-US");
  withDefaultNumberingSystem("arab", () => {
    const arab = Locale.create("en-US");
    expect(arab).not.toBe(loc);
    expect(arab.numberingSystem).toBe("arab");
  });
  expect(Locale.create("en-US")).toBe(loc);
});

test("Locale.create picks up changes to Settings.defaultOutputCalendar", () => {
  const loc = Locale.create("en-US");
  withDefaultOutputCalendar("islamic", () => {
    const islamic = Locale.create("en-US");
    expect(islamic).not.toBe(loc);
    expect(islamic.outputCalendar).toBe("islamic");
  });
  expect(Locale.create("en-US")).toBe(loc);
});

test("Locale.create picks up changes to Settings.defaultWeekSettings", () => {
  const loc = Locale.create("en-US");
  withDefaultWeekSettings({ firstDay: 3, minimalDays: 1, weekend: [] }, () => {
    const custom = Locale.create("en-US");
    expect(custom).not.toBe(loc);
    expect(custom.getStartOfWeek()).toBe(3);
  });
  expect(Locale.create("en-US")).toBe(loc);
});

test("Locale.create keeps sharing after the cache limits are exceeded", () => {
  for (let i = 0; i < 150; i++) {
    Locale.create(`x-luxon-test-${i}`);
  }
  for (let i = 0; i < 30; i++) {
    Locale.create("fr", null, null, { firstDay: 1, minimalDays: 1, weekend: [(i % 7) + 1] });
  }
  const fr = Locale.create("fr");
  expect(Locale.create("fr")).toBe(fr);
  expect(Locale.create("fr", null, null, weekSettings)).toBe(
    Locale.create("fr", null, null, weekSettings)
  );
  expect(fr.locale).toBe("fr");
});

test("Settings.resetCaches drops cached Locales", () => {
  const loc = Locale.create("fr");
  Settings.resetCaches();
  const fresh = Locale.create("fr");
  expect(fresh).not.toBe(loc);
  expect(fresh.equals(loc)).toBe(true);
  expect(Locale.create("fr")).toBe(fresh);
});

test("cached Locales do not remember Intl features that were missing when they were created", () => {
  const l = Intl.Locale;
  let loc;
  try {
    Intl.Locale = undefined;
    Settings.resetCaches();
    loc = Locale.create("en-US");
    expect(loc.getStartOfWeek()).toBe(1);
  } finally {
    Intl.Locale = l;
  }
  expect(Locale.create("en-US")).toBe(loc);
  expect(loc.getStartOfWeek()).toBe(7);
});

//------
// sharing through DateTime and Duration
//------
test("DateTimes with the same configuration share a Locale", () => {
  const loc = DateTime.now().loc;
  expect(DateTime.fromMillis(0).loc).toBe(loc);
  expect(DateTime.fromISO("2021-02-03T04:05:06Z").loc).toBe(loc);
  expect(DateTime.local(2021, 2, 3).loc).toBe(loc);
  expect(DateTime.fromObject({ year: 2021 }).loc).toBe(loc);
  expect(Duration.fromMillis(0).loc).toBe(loc);
  expect(DateTime.fromObject({}, { locale: "fr" }).loc).toBe(DateTime.now().setLocale("fr").loc);
  // toFormat redefaults the Locale to en-US through clone(), which must hit the cache too
  expect(DateTime.fromMillis(0).loc.redefaultToEN()).toBe(
    Locale.create(null, null, null, null, true)
  );
  expect(DateTime.fromMillis(0).loc.redefaultToEN({ locale: "fr" })).toBe(Locale.create("fr"));
});

test("DateTime#setLocale and #reconfigure use a differently configured Locale", () => {
  const dt = DateTime.fromMillis(0, { zone: "utc", locale: "en-US" });
  const fr = dt.setLocale("fr");
  const beng = dt.reconfigure({ numberingSystem: "beng" });
  const islamic = dt.reconfigure({ outputCalendar: "islamic" });
  expect(fr.loc).not.toBe(dt.loc);
  expect(beng.loc).not.toBe(dt.loc);
  expect(islamic.loc).not.toBe(dt.loc);
  expect(dt.toFormat("cccc d LLLL yyyy")).toBe("Thursday 1 January 1970");
  expect(fr.toFormat("cccc d LLLL yyyy")).toBe("jeudi 1 janvier 1970");
  expect(beng.toFormat("d")).toBe("১");
  expect(islamic.toFormat("yyyy")).toBe("1389");
  expect(dt.setLocale("fr").loc).toBe(fr.loc);
  expect(dt.reconfigure({ outputCalendar: "islamic" }).loc).toBe(islamic.loc);
});

test("a Locale cached before Settings.defaultLocale changes keeps formatting correctly", () => {
  let en;
  withDefaultLocale("en-US", () => {
    en = DateTime.fromMillis(0, { zone: "utc" });
  });
  withDefaultLocale("de", () => {
    const de = DateTime.fromMillis(0, { zone: "utc" });
    expect(de.loc).not.toBe(en.loc);
    expect(de.toFormat("cccc")).toBe("Donnerstag");
    expect(en.toFormat("cccc")).toBe("Thursday");
  });
  expect(en.toFormat("cccc")).toBe("Thursday");
  expect(Info.months("long", { locale: "de" })[0]).toBe("Januar");
});

test("deep-freezing a DateTime does not break other DateTimes with the same configuration", () => {
  const deepFreeze = (o) => {
    Object.freeze(o);
    for (const k of Object.getOwnPropertyNames(o)) {
      if (o[k] !== null && typeof o[k] === "object" && !Object.isFrozen(o[k])) deepFreeze(o[k]);
    }
    return o;
  };
  const frozen = deepFreeze(DateTime.fromMillis(0, { zone: "utc", locale: "fr" }));
  expect(Object.isFrozen(frozen.loc)).toBe(true);

  const dt = DateTime.fromMillis(0, { zone: "utc", locale: "fr" });
  expect(dt.loc).not.toBe(frozen.loc);
  expect(dt.loc).toBe(DateTime.fromMillis(0, { zone: "utc", locale: "fr" }).loc);
  expect(dt.weekdayLong).toBe("jeudi");
  expect(dt.toFormat("yyyy")).toBe("1970");
  expect(Duration.fromObject({ hours: 1 }, { locale: "fr" }).toHuman()).toMatchIgnoringWeirdSpaces(
    "1 heure"
  );
  expect(frozen.toFormat("yyyy")).toBe("1970");
});
