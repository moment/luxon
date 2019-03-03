/* global test */
/* eslint no-global-assign: "off" */
import { DateTime, Settings } from "../src/luxon";


exports.withoutIntl = function (name, f) {
  const fullName = `With no Intl support, ${name}`;
  test(fullName, () => {
    const intl = Intl;
    try {
      Intl = undefined;
      Settings.resetCaches();
      f();
    } finally {
      Intl = intl;
    }
  });
};

exports.withoutFTP = function (name, f) {
  const fullName = `With no FormatToParts support, ${name}`;
  test(fullName, () => {
    const { formatToParts } = Intl.DateTimeFormat.prototype;
    try {
      Intl.DateTimeFormat.prototype.formatToParts = undefined;
      Settings.resetCaches();
      f();
    } finally {
      Intl.DateTimeFormat.prototype.formatToParts = formatToParts;
    }
  });
};

exports.withoutRTF = function (name, f) {
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

exports.withoutZones = function (name, f) {
  const fullName = `With no time zone support, ${name}`;
  test(fullName, () => {
    const { DateTimeFormat } = Intl;
    try {
      Intl.DateTimeFormat = (locale, opts = {}) => {
        if (opts.timeZone) {
          // eslint-disable-next-line no-throw-literal
          throw `Unsupported time zone specified ${opts.timeZone}`;
        }
        return DateTimeFormat(locale, opts);
      };
      Intl.DateTimeFormat.prototype = DateTimeFormat.prototype;

      Settings.resetCaches();
      f();
    } finally {
      Intl.DateTimeFormat = DateTimeFormat;
    }
  });
};

exports.withNow = function (name, dt, f) {
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
exports.withDefaultZone = function (zone, f) {
  return (value, f) => {
    try {
      Settings.defaultZoneName = value;
      f();
    } finally {
      Settings.defaultZoneName = null;
    }
  };
};

exports.setUnset = function (prop) {
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

exports.atHour = function (hour) {
  return DateTime.fromObject({ year: 2017, month: 5, day: 25 })
    .startOf("day")
    .set({ hour });
};

