# Changelog

## 1.22.0

 * Fix setZone's handling of pre-1970 dates with milisecond components
 * Fix keepLocalTime for large jumps near the target zone's DST
 * Fix cache perf for toRelative()

## 1.21.3

 * Fix parsing of meridiems in macro tokens in newer versions of v8

## 1.21.2

 * Fix bug in Chrome Canary that threw off time zone calculations

## 1.21.1

 * Fix for quarter parsing
 * Some documentation updates

## 1.21.0

 * Added quarter support to the parser
 * Fix some rounding issues in ISO formatting

## 1.20.0

 * Added Duration#mapUnits
 * added Interval#toISODate and Interval#toISOTime
 * Some documentation fixes

## 1.19.3

 * Cache offset values
 * Fix handling of negative sub 1-hour offsets

## 1.19.2

 * Speculative fix for Node 6

## 1.19.1

 * Fix Intl.DateTimeFormat usage for polyfills

## 1.19.0

 * Interval#splitAt now ignores input dates outside the interval
 * Don't allow decimals in DateTime creation

## 1.18.2

 * Fix handling of decimals in DateTime#plus and #minus

## 1.18.1

 * Fix validity when adding or subtracting time that exceeds Date max/min boundaries

## 1.18.0

 * Add support for macro tokens in the parser

## 1.17.2

 * Fix issue with `toRelative` using `style: short` with plural days

## 1.17.1

 * Reject out-of-range numbers in DateTime.fromMillis
 * Reject 0s in ISO date inputs

## 1.17.0

 * DateTime.min and DateTime.max throw if they get the wrong kind of arguments
 * Fixed throwOnInvalid logic for Interval
 * Added `DATETIME_MED_WITH_WEEKDAY` preset

## 1.16.1

 * Catch errors trying to use Intl in weird versions of IE 11

## 1.16.0

 * Fixed locale default logic for `DateTime#toFormat("ZZZZ")

## 1.15.0

 * Added `formatOffset` to Zones

## 1.14.0

 * Allow the zone argument to Interval.fromISO with duration components
 * Ignore the zone argument to Duration factory methods

## 1.13.3

 * Fix keepLocalTime calculations that span offset changes

## 1.13.2

 * Fixed ISO formatting for dates > 999

## 1.13.1

 * Performance improvements for regex parsing

## 1.13.0

 * Support numberSystem in fromFormat
 * Fix validity for bad initial zone specifiers

## 1.12.1

 * Fix cross-month diffs in some scenarios
 * Fix time zone parsing when the time zone isn't at the end
 * Memoize IANA zone creation

## 1.12.0

 * Add some explicit CDN support to the NPM package
 * Add week token to duration ISO support
 * Lots of cleanup and test coverage changes

## 1.11.4

 * `setZone("local")` now returns the defaultZone if it is set
 * Fixes for the polyfilled build

## 1.11.3

 * Allow 24:00 in ISO (and other) strings
 * Fix some bugs with the typecheck functions like `DateTime.isDateTime()`

## 1.11.2

 * Fixed handling of some characters in fromFormat literal sections
 * Hanlde string values in object arguments to DateTime methods
 * Fixed toRelativeCalendar's handling of zones in the base date

## 1.11.1

 * Fix DateTime#plus() when spanning across AD 100

## 1.11.0

 * Fix low-year handling for IANA zones
 * `DateTime#toLocal()` now uses the default locale
 * Fix zero duration formatting
 * Many documentation fixes

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
- Fix handling weekdays at the end of leap week years
- Add isDuration, isDateTime, and isInterval
- Fix handling of Luxon object arguments passed from other execution contexts

## 1.5.0

- Improved error message
- Added DateTime#invalidExplanation, Duration#invalidExplanation, Interval#invalidExplanation to provide more details on invalid objects

## 1.4.6

- Cache Intl objects for an 85x speed up on basic operations using non-en locales

## 1.4.5

- Fix minified builds

## 1.4.4

- Fix hour formatting in RFC822 strings
- Interval.fromISO accepts formats with durations

## 1.4.3

Removal accidentally-introduced runtime dependency

## 1.4.2

- Handle locale strings with BCP 47 extensions. Especially helpful for environments with funky default locales
- Support for [weekYear]-W[weekNumber] ISO 8601 strings

## 1.4.1

- Empty diffs now have all the asked-for units in them, set at 0
- Duration operations perserve the superset of units

## 1.4.0

- Add x and X to toFormat for formatting Epoch seconds and Epoch milliseconds
- Parser allows a wider range of IANA zone specifiers
- BREAKING: Etc/GMT+10 is now interpreted as UTC-10, per spec

## 1.3.3

Documentation fixes

## 1.3.2

- DateTime.fromMillis will throw if passed a non-number
- Fixes for type checking across JS contexts

## 1.3.1

- Include milliseconds in Duration#toISO
- Avoid deprecation warning from DateTime#inspect in Node 10

## 1.3.0

- **mildly breaking change** Duration.toFormat now floors its outputs instead of rounding them (see #224)
- Added 'floor' option to Duration.toFormat and deprecated the 'round' option
- Added `Dateime.toBSON`
- Fixed infinite loop when passing invalid or zero-length durations to Interval#splitBy
- Added better error handling to Duration.fromObject()

## 1.2.1

- 222x speed-up in DateTime creation for non-en locales
- Added `DateTime#toMillis` alias for `DateTime#valueOf`
- Fixed types on zone exports

## 1.2.0

- Export Zone classes
- Fix `endOf` and `startOf` for quarters
- Change `toFormat("Z")` to return a number for UTC
- Allow "GTM" as an argument to `setZone`

## 1.1.0

- Support for zone names with more than two components
- Fixed long-term-accurate conversions for months
- Added `weeksInWeekYear`

## 1.0.0

- The big one-oh. No changes from 0.5.8.

## 0.5.8

- Large perf improvements for `DateTime#toFormat()`, when using non-intl numbers

## 0.5.7

- Added AMD build to the NPM package
- Large performance improvements to technical formatting (e.g. `DateTime#toISO`)

## 0.5.6

- Refactor internals
- Added support for fractional seconds in `Duration.fromISO`
- Added browser global to the NPM package

## 0.5.5

- Best-we-can-do fix for `DateTime#toLocaleString()` for fixed-offset zones when showing the zone name in the output
- Fixed `Duration#shiftTo` for unormalized Durations that need a rollup cascade

## 0.5.4

- Fix default locales in Node
- Fix prototype to help with React inspection
- Improve REPL output for Durations in Node

## 0.5.3

- Remove errant ICU runtime dep (again)

## 0.5.2

- Remove comments from minified builds (introduced by 0.5.1)

## 0.5.1

- Fixed minified builds (oops)
- Fix computation of fractional parts of diffs

## 0.5.0

- `isBefore()` returns true for the end of the interval, consistent with being half-open
- `zoneName` now rturns `null` for invalid DateTimes
- Added quarter support
- Adding a month to Jan 31 gives Feb 28/29

## 0.4.0

- Always round down to the nearest millisecond when parsing

## 0.3.1

- Fixed `toLocaleString` for fixed-offset zones in the absence of Intl
- Added `Info.isValidIANAZone`
- Made malformed zone specifiers result in invalid DateTime instances

## 0.3.0

- Rename DateTime.fromString to DateTime.fromFormat (leaving deprecated DateTime.fromString)
- Rename DateTime.fromStringExplain to DateTime.fromFormatExplain (leaving deprecated DateTime.fromStringExplain)
- Support Etc/GMT IANA zones
- Perf fixes for zones
- Rework build infrastructure

## 0.2.12

- Fix DateTime.fromObject's handling of default zones
- Change `keepCalendarTime` to `keepLocalTime`

## 0.2.11

- Handle no arguments in `DateTime.min` and `DateTime.max`
- Documentation fixes

## 0.2.10

- Fix bug where Durations could sometimes mutate

## 0.2.9

- Fix `DateTime.fromMillis(0)` more thoroughly

## 0.2.8

- Fix sourcemaps

## 0.2.7

- Fix `DateTime.fromMillis(0)`

## 0.2.6

- Fix 'h' and 'hh' `toFormat` tokens for midnight

## 0.2.5

- Better `shiftTo` behavior for durations with floating point components

## 0.2.4

- Fix `toHTTP` to use 24-hour hours
- Tighten up regular expressions
- Various documentation fixes

## 0.2.3

- Fixes for `diff` with multiple units

## 0.2.2

- Fixes for `fromSQL`, `toSQL`, `toSQLTime`, and `toSQLDate`
- Add `includeOffset` option to `toISO` and `toISOTime`

## 0.2.1

- Add `module` field to package.json

## 0.2.0

- Remove polyfills from main builds
- Update compilation toolchain to target builds more exactly
- Fix IE in polyfill build

## 0.1.0

- Add `.fromSQL`, `#toSQL`, `#toSQLTime`, `#toSQLDate`
- Fix AM/PM parsing
- Major perf improvements
- Default to system locale when using macro formats in `#toFormat`
- `.fromISO` accepts standalone times
- See https://github.com/moment/luxon/issues/93 for important news concerning field accessibility

## 0.0.22

- Add 'u' formatting and parsing
- Add 'y', 'yyyyy', and 'yyyyyy' parsing tokens
- Add 'yyyyyy' formatting token
- Better error messages for missing arguments to `DateTime.fromString`

## 0.0.21

- Fix zones for Edge

## 0.0.20

- Fix `fromISO` to accept various levels of subsecond precision

## 0.0.19

- Fixed parsing for ordinals
- Made parsing stricter

## 0.0.18

- Fixed formatting for non-hour aligned fixed-offset zones
- Fixed longterm conversion accuracy option in diffs
- Fixed invalid handling in `Interval#set`

## 0.0.17

- Fixing formatting for fixed-offset zones

## 0.0.16

- Fixes for IE 9 & 10

## 0.0.15

- Fixing busted release 0.0.14

## 0.0.13

- toLocaleString() and others default to the system's locale
- support for ISO week durations in `Duration.fromISO`

## 0.0.12

- Improve non-Intl fallbacks for toLocaleString
- Fix `offsetNameShort` and `offsetNameLong` for non-Intl environments
- Added `weekdayShort`, `weekdayLong`, `monthShort`, `monthLong` DateTime getters

## 0.0.10

- Only include build dir in NPM module

## 0.0.9

- Move to Moment Github org

## 0.0.8

- The local zone can now report its IANA name
- Fixed parsing bug for `yy` and `kk`
- Improved test coverage

## 0.0.7

- Added `toLocaleParts`
- Slightly more friendly month/weekday parsing
- Default locale setting

## 0.0.6

- Stricter `toJSDate`
- `fromISO` now supports `year` and `year-month` formats
- More graceful degradation in the absence of platform features

## 0.0.5

Experimental, but now broadly useful.
