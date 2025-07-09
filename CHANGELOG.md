# Changelog

# 3.7.1 (2025-07-09)
- Revert change in ES6 packaging

# 3.7.0 (2025-07-09)
- Added `showZeros` option to `Duration#toHuman`
- Added `Duration#removeZeros` method.
- Added `rounding` option to `DateTime#toRelative`
- Added `precision` option to ISO formatting methods
- Added `signMode` option to `Duration#toFormat`
- Allow escaping single quotes in format strings
- Improve output of `Info.months` and `Info.monthsFormat` for `ja` locale
- Accept lowercase `t` as a separator in ISO strings
- Accept lowercase `z` as an offset in ISO strings
- Reject non-finite numbers where previously only `NaN` was rejected
- Improve the documentation for Interval
- Added a dark theme for the documentation site

# 3.6.1 (2025-03-31)
- Add Fallback for `minimalDays` being removed from Intl.WeekInfo
- Fix various caches when JS keywords like "constructor" are used for names

# 3.6.0 (2025-03-25)
- Add `Interval.lastDateTime`
- Fix a bug that could cause wrong timezone calculations when multiple timezones are in use 

# 3.5.0 (2024-08-03)

- Various performance improvements
- throwOnInvalid causes the constructor to throw if the year is invalid

# 3.4.4 (2023-11-12)

- Localized week support (#1454)
- Added custom inspect for Node (#1526)
- Fix sorting in `Interval.splitAt` (#1524)

# 3.4.3 (2023-09-05)

- Fixes another regression from 3.4.0 (#1496)

# 3.4.2 (2023-08-26)

- Fixes regression from 3.4.1 (#1493)

# 3.4.1 (2023-08-23)

- Fixes for regressions from 3.4.0 (#1482 and #1488)

# 3.4.0 (2023-08-08)

- Fix type checking on input zones
- Fix Islamic months listing
- Fix normalize() for negative inputs

# 3.3.0 (2023-03-03)

- Fix off-by-one in Interval#count (#1308)
- Support formatting for custom zones (#1377)
- Fix parsing for narrow spaces (#1369)
- Handle leap year issue with AD 100 (#1390)
- Allow parsing of just an offset

# 3.2.1 (2023-01-04)

- Fix for RFC-2822 regex vulnerability
- Better handling of BCP tags with -x- extensions

# 3.2.0 (2022-12-29)

- Allow timeZone to be specified as an intl option
- Fix for diff's handling of end-of-month when crossing leap years (#1340)
- Add Interval.toLocaleString() (#1320)

# 3.1.1 (2022-11-28)

- Add Settings.twoDigitCutoffYear

# 3.1.0 (2022-10-31)

- Add Duration.rescale

# 3.0.4 (2022-09-24)

- Fix quarters in diffs (#1279)
- Export package.json in package (#1239)

# 3.0.2 (2022-08-28)

- Lots of doc changes
- Added DateTime.expandFormat
- Added support for custom conversion matrices in Durations

# 3.0.1 (2022-07-09)

- Add DateTime.parseFormatForOpts

# 3.0.0 (2022-07-09)

- Add "default" as an option for specifying a zone, and change "system" to really mean the system zone (breaking change)

# 2.5.0 (2022-07-09)

- Support for ESM-style node imports
- Fix Wednesday parsing for RFC 850 strings
- Increase number of digits allowed in ISO durations

## 2.4.0 (2022-05-08)

- Add support for parsing the ISO zone extension, like `2022-05-08T20:42:00.000-04:00[America/New_York]`
- Add an `extendedZone` option to `toISO()` and `toISOTime`
- Improvements to `DateTime.isInDST()`
- Fix for parsing in Vietnames (and probably other languages)

## 2.3.2 (2022-04-17)

- Fix timezone calculations for negative years
- add week formatting token "w" for durations
- fix weekday computation for years 0-100

## 2.3.1 (2022-02-23)

- Added an `includeOffsetSpace` option to `toSQL` and `toSQLTime`
- Added `toUnixInteger`
- Don't use `-0` when negating durations with zeros in them

## 2.3.0 (2022-01-02)

- Major perf improvements to `toISO()`, `toISODate()`, `toISOTime()`, and `toSQLDate()`
- Fixed date padding for negative years in `toISO()`
- Added Duration#toHuman()

## 2.2.0 (2021-12-10)

- Allow offsets to pick among ambiguous times when both an offset and zone are provided to `fromFormat`
- Fix a floating point bug in `Duration.shiftTo()`

## 2.1.1 (2021-11-08)

- Fix issue in quirky environments that lack `hourCycle` support and sometimes computed offsets 12 hours off

## 2.1.0 (2021-11-07)

- Stop special casing of `Etc/GMT*` zones
- export fromDurationLike
- memoize zone validation
- Support for fractional elements in duration ISO parsing
- Added `uu` and `uuu` tokens for fractional millisecond parsing

## 2.0.2 (2021-08-08)

Fix locale defaulting

## 2.0.0 (2021-07-3)

See [Upgrading section](https://moment.github.io/luxon/#/upgrading?id=_1x-to-20)

## 1.28.0 (2021-07-03)

- Fix ISO parsing for offset specifiers in Year-Ordinal formats

## 1.27.0 (2021-05-08)

- Fix GMT zone parsing for older versions of Node
- Support multiple units in `toRelative`
- Various documentation updates

## 1.26.0 (2021-02-13)

- Add fromISOTime, toISOTime and toMillis to Duration (#803)
- Fix padding of negative years in IsoDate (#871)
- Fix hasSame unit comparison (#798)
- Export VERSION information (#794)
- Durations are considered equal with extra zero units. Fixes #809 (#811)

## 1.25.0 (2020-08-23)

- fix fromFormat with Intl formats containing non-breaking spaces
- Support higher precision in ISO milliseconds
- Some fixes for 00:30 timezones
- Fix some throwOnInvalid for invalid Intervals
- Various doc fixes
- Fix Interval#isSame for empty intervals
- Mark package as side effect-free
- Add support for intervals with a large number of seconds

## 1.24.1 (2020-05-04)

- Remove erroneous `console.log` call

## 1.24.0 (2020-05-03)

- Update polyfills for pollyfilled build

## 1.23.0 (2020-04-02)

- Allow minus sign prefix when creating Duration from ISO

## 1.22.2 (2020-03-25)

- Added more details to error messages for type errors

## 1.22.1 (2020-03-19)

- Added support for ISO basic format to DateTime#toISO

## 1.22.0 (2020-01-26)

- Fix setZone's handling of pre-1970 dates with millisecond components
- Fix keepLocalTime for large jumps near the target zone's DST
- Fix cache perf for toRelative()

## 1.21.3 (2019-11-28)

- Fix parsing of meridiems in macro tokens in newer versions of v8

## 1.21.2 (2019-11-18)

- Fix bug in Chrome Canary that threw off time zone calculations

## 1.21.1 (2019-11-03)

- Fix for quarter parsing
- Some documentation updates

## 1.21.0 (2019-10-30)

- Added quarter support to the parser
- Fix some rounding issues in ISO formatting

## 1.20.0 (2019-10-29)

- Added Duration#mapUnits
- added Interval#toISODate and Interval#toISOTime
- Some documentation fixes

## 1.19.3

- Cache offset values
- Fix handling of negative sub 1-hour offsets

## 1.19.2

- Speculative fix for Node 6

## 1.19.1

- Fix Intl.DateTimeFormat usage for polyfills

## 1.19.0

- Interval#splitAt now ignores input dates outside the interval
- Don't allow decimals in DateTime creation

## 1.18.2

- Fix handling of decimals in DateTime#plus and #minus

## 1.18.1

- Fix validity when adding or subtracting time that exceeds Date max/min boundaries

## 1.18.0

- Add support for macro tokens in the parser

## 1.17.2

- Fix issue with `toRelative` using `style: short` with plural days

## 1.17.1

- Reject out-of-range numbers in DateTime.fromMillis
- Reject 0s in ISO date inputs

## 1.17.0

- DateTime.min and DateTime.max throw if they get the wrong kind of arguments
- Fixed throwOnInvalid logic for Interval
- Added `DATETIME_MED_WITH_WEEKDAY` preset

## 1.16.1

- Catch errors trying to use Intl in weird versions of IE 11

## 1.16.0

- Fixed locale default logic for `DateTime#toFormat("ZZZZ")

## 1.15.0

- Added `formatOffset` to Zones

## 1.14.0

- Allow the zone argument to Interval.fromISO with duration components
- Ignore the zone argument to Duration factory methods

## 1.13.3

- Fix keepLocalTime calculations that span offset changes

## 1.13.2

- Fixed ISO formatting for dates > 999

## 1.13.1

- Performance improvements for regex parsing

## 1.13.0

- Support numberSystem in fromFormat
- Fix validity for bad initial zone specifiers

## 1.12.1

- Fix cross-month diffs in some scenarios
- Fix time zone parsing when the time zone isn't at the end
- Memoize IANA zone creation

## 1.12.0

- Add some explicit CDN support to the NPM package
- Add week token to duration ISO support
- Lots of cleanup and test coverage changes

## 1.11.4

- `setZone("local")` now returns the defaultZone if it is set
- Fixes for the polyfilled build

## 1.11.3

- Allow 24:00 in ISO (and other) strings
- Fix some bugs with the typecheck functions like `DateTime.isDateTime()`

## 1.11.2

- Fixed handling of some characters in fromFormat literal sections
- Handle string values in object arguments to DateTime methods
- Fixed toRelativeCalendar's handling of zones in the base date

## 1.11.1

- Fix DateTime#plus() when spanning across AD 100

## 1.11.0

- Fix low-year handling for IANA zones
- `DateTime#toLocal()` now uses the default locale
- Fix zero duration formatting
- Many documentation fixes

## 1.10.0

- Fix endOf("day") during DSTs (#399)
- Add `Interval#mapEndpoints (#400)
- Add `DateTime#zone` and `Info.normalizeZone` (#404)

## 1.9.0

- Add `DateTime#toRelative` and `DateTime#toRelativeCalendar`

## 1.8.3

- Allow "UTC" in the zone position of `fromSQL`
- Force `isDateTime` and `isDuration` to return booleans in all cases

## 1.8.2

- Trim leading \u200e characters from offset names in Edge 16 and 17

## 1.8.1

- Add `DateTime.fromSeconds` and `DateTime#toSeconds`

## 1.7.1

- Floor the seconds instead of rounding them when outputting the 'X' format
- Change the options to toLocale to override the configuration (the previous options were essentially ignored)

## 1.6.2

- Fixing merge error that resulted in bad error messages

## 1.6.0

- **midly breaking** Rework negative durations
- Fix handling
