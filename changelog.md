# Changelog

## 0.13

 * toLocaleString() and others default to the system's locale
 * support for ISO week durations in `Duration.fromISO`

## 0.12

 * Improve non-Intl fallbacks for toLocaleString
 * Fix `offsetNameShort` and `offsetNameLong` for non-Intl environments 
 * Added `weekdayShort`, `weekdayLong`, `monthShort`, `monthLong` DateTime getters

## 0.10

 * Only include build dir in NPM module

## 0.9

 * Move to Moment Github org

## 0.8

 * The local zone can now report its IANA name
 * Fixed parsing bug for `yy` and `kk`
 * Improved test coverage

## 0.7

 * Added `toLocaleParts`
 * Slighly more friendly month/weekday parsing
 * Default locale setting

## 0.6

 * Stricter `toJSDate`
 * `fromISO` now supports `year` and `year-month` formats
 * More graceful degradation in the absence of platform features

## 0.5

Experimental, but now broadly useful.
