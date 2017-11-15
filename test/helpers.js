/* global test */
/* eslint no-global-assign: "off" */
import { Settings } from '../src/luxon';

export class Helpers {
  static withoutIntl(name, f) {
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
  }

  static withoutFTP(name, f) {
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
  }

  static withoutZones(name, f) {
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
  }

  // not a tester!
  static withDefaultZone(zone, f) {
    const localZone = Settings.defaultZoneName;
    try {
      Settings.defaultZoneName = zone;
      f();
    } finally {
      Settings.defaultZoneName = localZone;
    }
  }
}
