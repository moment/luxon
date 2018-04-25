/**
 * @private
 */

const n = 'numeric',
  s = 'short',
  l = 'long',
  d2 = '2-digit';

/**
 * Format like 10/14/1983
 * @type {Object}
 */
export const DATE_SHORT = {
  year: n,
  month: n,
  day: n
};

/**
 * Format like 'Oct 14, 1983'
 * @type {Object}
 */
export const DATE_MED = {
  year: n,
  month: s,
  day: n
};

/**
 * Format like 'October 14, 1983'
 * @type {Object}
 */
export const DATE_FULL = {
  year: n,
  month: l,
  day: n
};

/**
 * Format like 'Tuesday, October 14, 1983'
 * @type {Object}
 */
export const DATE_HUGE = {
  year: n,
  month: l,
  day: n,
  weekday: l
};

/**
 * Format like '09:30 AM'. Only 12-hour if the locale is.
 * @type {Object}
 */
export const TIME_SIMPLE = {
  hour: n,
  minute: d2
};

/**
 * {@link toLocaleString} format like '09:30:23 AM'. Only 12-hour if the locale is.
 * @type {Object}
 */
export const TIME_WITH_SECONDS = {
  hour: n,
  minute: d2,
  second: d2
};

/**
 * Format like '09:30:23 AM EDT'. Only 12-hour if the locale is.
 * @type {Object}
 */
export const TIME_WITH_SHORT_OFFSET = {
  hour: n,
  minute: d2,
  second: d2,
  timeZoneName: s
};

/**
 * Format like '09:30:23 AM Eastern Daylight Time'. Only 12-hour if the locale is.
 * @type {Object}
 */
export const TIME_WITH_LONG_OFFSET = {
  hour: n,
  minute: d2,
  second: d2,
  timeZoneName: l
};

/**
 * Format like '09:30', always 24-hour.
 * @type {Object}
 */
export const TIME_24_SIMPLE = {
  hour: n,
  minute: d2,
  hour12: false
};

/**
 * Format like '09:30:23', always 24-hour.
 * @type {Object}
 */
export const TIME_24_WITH_SECONDS = {
  hour: n,
  minute: d2,
  second: d2,
  hour12: false
};

/**
 * Format like '09:30:23 EDT', always 24-hour.
 * @type {Object}
 */
export const TIME_24_WITH_SHORT_OFFSET = {
  hour: n,
  minute: d2,
  second: d2,
  hour12: false,
  timeZoneName: s
};

/**
 * Format like '09:30:23 Eastern Daylight Time', always 24-hour.
 * @type {Object}
 */
export const TIME_24_WITH_LONG_OFFSET = {
  hour: n,
  minute: d2,
  second: d2,
  hour12: false,
  timeZoneName: l
};

/**
 * Format like '10/14/1983, 9:30 AM'. Only 12-hour if the locale is.
 * @type {Object}
 */
export const DATETIME_SHORT = {
  year: n,
  month: n,
  day: n,
  hour: n,
  minute: d2
};

/**
 * Format like '10/14/1983, 9:30:33 AM'. Only 12-hour if the locale is.
 * @type {Object}
 */
export const DATETIME_SHORT_WITH_SECONDS = {
  year: n,
  month: n,
  day: n,
  hour: n,
  minute: d2,
  second: d2
};

/**
 * Format like 'Oct 14, 1983, 9:30 AM'. Only 12-hour if the locale is.
 * @type {Object}
 */
export const DATETIME_MED = {
  year: n,
  month: s,
  day: n,
  hour: n,
  minute: d2
};

/**
 * Format like 'Oct 14, 1983, 9:30:33 AM'. Only 12-hour if the locale is.
 * @type {Object}
 */
export const DATETIME_MED_WITH_SECONDS = {
  year: n,
  month: s,
  day: n,
  hour: n,
  minute: d2,
  second: d2
};

/**
 * Format like 'October 14, 1983, 9:30 AM EDT'. Only 12-hour if the locale is.
 * @type {Object}
 */
export const DATETIME_FULL = {
  year: n,
  month: l,
  day: n,
  hour: n,
  minute: d2,
  timeZoneName: s
};

/**
 * Format like 'October 14, 1983, 9:03:33 AM EDT'. Only 12-hour if the locale is.
 * @type {Object}
 */
export const DATETIME_FULL_WITH_SECONDS = {
  year: n,
  month: l,
  day: n,
  hour: n,
  minute: d2,
  second: d2,
  timeZoneName: s
};

/**
 * Format like 'Friday, October 14, 1983, 9:30 AM Eastern Daylight Time'. Only 12-hour if the locale is.
 * @type {Object}
 */
export const DATETIME_HUGE = {
  year: n,
  month: l,
  day: n,
  weekday: l,
  hour: n,
  minute: d2,
  timeZoneName: l
};

/**
 * Format like 'Friday, October 14, 1983, 9:30:33 AM Eastern Daylight Time'. Only 12-hour if the locale is.
 * @type {Object}
 */
export const DATETIME_HUGE_WITH_SECONDS = {
  year: n,
  month: l,
  day: n,
  weekday: l,
  hour: n,
  minute: d2,
  second: d2,
  timeZoneName: l
};
