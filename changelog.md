# Changelog

## 0.3.1

 * Fixed `toLocaleString` for fixed-offset zones in the absence of Intl
 * Added `Info.isValidIANAZone`
 * Made malformed zone specifiers result in invalid DateTime instances

## 0.3.0

 * Rename DateTime.fromString to DateTime.fromFormat (leaving deprecated DateTime.fromString)
 * Rename DateTime.fromStringExplain to DateTime.fromFormatExplain (leaving deprecated DateTime.fromStringExplain)
 * Support Etc/GMT IANA zones
 * Perf fixes for zones
 * Rework build infrastructure

## 0.2.12

 * Fix DateTime.fromObject's handling of default zones
 * Change `keepCalendarTime` to `keepLocalTime`

## 0.2.11

 * Handle no arguments in `DateTime.min` and `DateTime.max`
 * Documentation fixes

## 0.2.10

 * Fix bug where Durations could sometimes mutate

## 0.2.9

 * Fix `DateTime.fromMillis(0)` more thoroughly

## 0.2.8

 * Fix sourcemaps

## 0.2.7

 * Fix `DateTime.fromMillis(0)`

## 0.2.6

 * Fix 'h' and 'hh' `toFormat` tokens for midnight

## 0.2.5

 * Better `shiftTo` behavior for durations with floating point components

## 0.2.4

 * Fix `toHTTP` to use 24-hour hours
 * Tighten up regular expressions
 * Various documentation fixes

## 0.2.3

 * Fixes for `diff` with multiple units

## 0.2.2

 * Fixes for `fromSQL`, `toSQL`, `toSQLTime`, and `toSQLDate`
 * Add `includeOffset` option to `toISO` and `toISOTime`

## 0.2.1

 * Add `module` field to package.json

## 0.2.0

 * Remove polyfills from main builds
 * Update compilation toolchain to target builds more exactly
 * Fix IE in polyfill build

## 0.1.0

 * Add `.fromSQL`, `#toSQL`, `#toSQLTime`, `#toSQLDate`
 * Fix AM/PM parsing
 * Major perf improvements
 * Default to system locale when using macro formats in `#toFormat`
 * `.fromISO` accepts standalone times
 * See https://github.com/moment/luxon/issues/93 for important news concerning field accessibility

## 0.0.22

 * Add 'u' formatting and parsing
 * Add 'y', 'yyyyy', and 'yyyyyy' parsing tokens
 * Add 'yyyyyy' formatting token
 * Better error messages for missing arguments to `DateTime.fromString`

## 0.0.21
 * Fix zones for Edge

## 0.0.20
 * Fix `fromISO` to accept various levels of subsecond precision

## 0.0.19
 * Fixed parsing for ordinals
 * Made parsing stricter

## 0.0.18
 * Fixed formatting for non-hour aligned fixed-offset zones
 * Fixed longterm conversion accuracy option in diffs
 * Fixed invalid handling in `Interval#set`

## 0.0.17
 * Fixing formatting for fixed-offset zones

## 0.0.16
 * Fixes for IE 9 & 10

## 0.0.15
 * Fixing busted release 0.0.14

## 0.0.13

 * toLocaleString() and others default to the system's locale
 * support for ISO week durations in `Duration.fromISO`

## 0.0.12

 * Improve non-Intl fallbacks for toLocaleString
 * Fix `offsetNameShort` and `offsetNameLong` for non-Intl environments
 * Added `weekdayShort`, `weekdayLong`, `monthShort`, `monthLong` DateTime getters

## 0.0.10

 * Only include build dir in NPM module

## 0.0.9

 * Move to Moment Github org

## 0.0.8

 * The local zone can now report its IANA name
 * Fixed parsing bug for `yy` and `kk`
 * Improved test coverage

## 0.0.7

 * Added `toLocaleParts`
 * Slightly more friendly month/weekday parsing
 * Default locale setting

## 0.0.6

 * Stricter `toJSDate`
 * `fromISO` now supports `year` and `year-month` formats
 * More graceful degradation in the absence of platform features

## 0.0.5

Experimental, but now broadly useful.
