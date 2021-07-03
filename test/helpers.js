/* global test */
/* eslint no-global-assign: "off" */
import { DateTime, Settings } from "../src/luxon";

exports.withoutRTF = function(name, f) {
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
};

exports.withNow = function(name, dt, f) {
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
exports.withDefaultZone = function(zone, f) {
  try {
    Settings.defaultZoneName = zone;
    f();
  } finally {
    Settings.defaultZoneName = null;
  }
};

exports.withDefaultLocale = function(locale, f) {
  try {
    Settings.defaultLocale = locale;
    f();
  } finally {
    Settings.defaultLocale = null;
  }
};

exports.setUnset = function(prop) {
  return (value, f) => {
    const existing = Settings[prop];
    try {
      Settings[prop] = value;
      f();
    } finally {
      Settings[prop] = existing;
    }
  };
};

exports.atHour = function(hour) {
  return DateTime.fromObject({ year: 2017, month: 5, day: 25 })
    .startOf("day")
    .set({ hour });
};
