/* global test */
import { DateTime, Settings, Zone } from "../src/luxon";
import { CalendarSystem, NumberingSystem } from "../src/types/locale";

export const withoutRTF = function (name: string, f: () => void): void {
  const fullName = `With no RelativeTimeFormat support, ${name}`;
  test(fullName, () => {
    const rtf = Intl.RelativeTimeFormat;
    try {
      // @ts-expect-error test
      Intl.RelativeTimeFormat = undefined;
      Settings.resetCaches();
      f();
    } finally {
      // @ts-expect-error test
      Intl.RelativeTimeFormat = rtf;
    }
  });
};

export const withDTFnoFormatToParts = function (name: string, f: () => void): void {
  const fullName = `With Intl.DateTimeFormat which has no formatToParts function, ${name}`;
  test(fullName, () => {
    const dtf = Intl.DateTimeFormat;
    class BadDateTimeFormat extends dtf {
      // @ts-expect-error test
      override formatToParts = undefined;
    }
    try {
      // @ts-expect-error test
      Intl.DateTimeFormat = BadDateTimeFormat;
      Settings.resetCaches();
      f();
    } finally {
      Intl.DateTimeFormat = dtf;
    }
  });
};

export const withDTFnoU = function (name: string, f: () => void): void {
  const fullName = `With Intl.DateTimeFormat which does not support -u- extension, ${name}`;
  test(fullName, () => {
    const dtf = Intl.DateTimeFormat;
    class BadDateTimeFormat extends dtf {
      constructor(
        locales?: string | string[] | undefined,
        options?: Intl.DateTimeFormatOptions | undefined
      ) {
        super(locales, options);
        if ((locales?.indexOf("-u-") || 0) > -1) throw new Error();
      }
    }
    try {
      // @ts-expect-error test
      Intl.DateTimeFormat = BadDateTimeFormat;
      Settings.resetCaches();
      f();
    } finally {
      Intl.DateTimeFormat = dtf;
    }
  });
};

export const withNow = function (name: string, dt: DateTime, f: () => void): void {
  test(name, () => {
    const oldNow = Settings.now;

    try {
      Settings.now = () => dt.valueOf();
      f();
    } finally {
      Settings.now = oldNow;
    }
  });
};

// not a tester!
export const withDefaultZone = function (zone: string | Zone, f: () => void): void {
  try {
    Settings.defaultZone = zone;
    f();
  } finally {
    Settings.defaultZone = null;
  }
};

export const withDefaultLocale = function (locale: string, f: () => void): void {
  try {
    Settings.defaultLocale = locale;
    f();
  } finally {
    Settings.defaultLocale = null;
  }
};

export const withDefaultNumberingSystem = function (
  numbering: NumberingSystem,
  f: () => void
): void {
  try {
    Settings.defaultNumberingSystem = numbering;
    f();
  } finally {
    Settings.defaultNumberingSystem = null;
  }
};

export const withDefaultOutputCalendar = function (calendar: CalendarSystem, f: () => void): void {
  try {
    Settings.defaultOutputCalendar = calendar;
    f();
  } finally {
    Settings.defaultOutputCalendar = null;
  }
};

export const withThrowOnInvalid = function (f: () => void): void {
  try {
    Settings.throwOnInvalid = true;
    f();
  } finally {
    Settings.throwOnInvalid = false;
  }
};

export const atHour = function (hour: number): DateTime {
  return DateTime.fromObject({ year: 2017, month: 5, day: 25 }).startOf("day").set({ hour });
};
