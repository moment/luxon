import { test } from "vitest";
import { DateTime, Settings } from "../src/luxon.ts";
import { hasLocaleWeekInfo } from "../src/impl/util.ts";

export function withoutRTF(name, f) {
  const fullName = `With no RelativeTimeFormat support, ${name}`;
  test(fullName, () => {
    const rtf = Intl.RelativeTimeFormat;
    try {
      Intl.RelativeTimeFormat = undefined;
      Settings.resetCaches();
      f();
    } finally {
      Intl.RelativeTimeFormat = rtf;
    }
  });
}

export function withoutLocaleWeekInfo(name, f) {
  const fullName = `With no Intl.Locale.weekInfo support, ${name}`;
  test(fullName, () => {
    const l = Intl.Locale;
    try {
      Intl.Locale = undefined;
      Settings.resetCaches();
      f();
    } finally {
      Intl.Locale = l;
    }
  });
}

export function withNow(name, dt, f) {
  test(name, () => {
    const oldNow = Settings.now;

    try {
      Settings.now = () => dt.valueOf();
      f();
    } finally {
      Settings.now = oldNow;
    }
  });
}

// not a tester!
export function withDefaultZone(zone, f) {
  try {
    Settings.defaultZone = zone;
    f();
  } finally {
    Settings.defaultZone = null;
  }
}

export function withDefaultLocale(locale, f) {
  try {
    Settings.defaultLocale = locale;
    f();
  } finally {
    Settings.defaultLocale = null;
  }
}

export function setUnset(prop) {
  return (value, f) => {
    const existing = Settings[prop];
    try {
      Settings[prop] = value;
      f();
    } finally {
      Settings[prop] = existing;
    }
  };
}

export function atHour(hour) {
  return DateTime.fromObject({ year: 2017, month: 5, day: 25 }).startOf("day").set({ hour });
}

export function supportsMinDaysInFirstWeek() {
  if (!hasLocaleWeekInfo()) return false;
  const locale = new Intl.Locale("en-US");
  const wi = locale.getWeekInfo?.() ?? locale.weekInfo;
  return "minimalDays" in wi;
}
