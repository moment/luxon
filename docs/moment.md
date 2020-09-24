# For Moment users

Luxon borrows lots of ideas from [Moment.js](http://momentjs.com), but there are a lot of differences too. This document clarifies what they are.

## Immutability

Luxon's objects are immutable, whereas Moment's are mutable. For example, in Moment:

```js
var m1 = moment();
var m2 = m1.add(1, 'hours');
m1.valueOf() === m2.valueOf(); //=> true
```

This happens because `m1` and `m2` are really the same object; `add()` *mutated* the object to be an hour later. Compare that to Luxon:

```js
var d1 = DateTime.now();
var d2 = d1.plus({ hours: 1 });
d1.valueOf() === d2.valueOf(); //=> false
```

This happens because the `plus` method returns a new instance, leaving `d1` unmodified. It also means that Luxon doesn't require copy constructors or clone methods.

## Major functional differences

1. Months in Luxon are 1-indexed instead of 0-indexed like in Moment and the native Date type.
1. Localizations and time zones are implemented by the native Intl API (or a polyfill of it), instead of by the library itself.
1. Luxon has both a Duration type and an Interval type. The Interval type is like Twix.
1. Luxon lacks the relative time features of Moment and won't support it until the required [facilities](https://github.com/tc39/proposal-intl-relative-time) are provided by the browser.

## Other API style differences

1. Luxon methods often take option objects as their last parameter
1. Luxon has different static methods for object creation (e.g. `fromISO`), as opposed to Moment's one function that dispatches based on the input
1. Luxon parsers are very strict, whereas Moment's are more lenient.
1. Luxon uses getters instead of accessor methods, so `dateTime.year` instead of `dateTime.year()`
1. Luxon centralizes its "setters", like `dateTime.set({year: 2016, month: 4})` instead of `dateTime.year(2016).month(4)` like in Moment.
1. Luxon's Durations are a separate top-level class.
1. Arguments to Luxon's methods are not automatically coerced into Luxon instances. E.g. `m.diff('2017-04-01')` would be `dt.diff(DateTime.fromISO('2017-04-01'))`.

## DateTime method equivalence

Here's a rough mapping of DateTime methods in Moment to ones in Luxon. I haven't comprehensively documented stuff that's in Luxon but not in Moment, just a few odds and ends that seemed obvious for inclusion; there are more. I've probably missed a few things too.

### Creation

| Operation               | Moment                   | Luxon                                 | Notes                                                                                                                                 |
| ----------------------- | ------------------------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Now                     | `moment()`               | `DateTime.now()`                      |                                                                                                                                       |
| From ISO                | `moment(String)`         | `DateTime.fromISO(String)`            |                                                                                                                                       |
| From RFC 2822           | `moment(String)`         | `DateTime.fromRFC2822(String)`        |                                                                                                                                       |
| From custom format      | `moment(String, String)` | `DateTime.fromFormat(String, String)` | The format tokens differ between Moment and Luxon, such that the same format string cannot be used between the two.                   |
| From object             | `moment(Object)`         | `DateTime.fromObject(Object)`         |                                                                                                                                       |
| From timestamp          | `moment(Number)`         | `DateTime.fromMillis(Number)`         |                                                                                                                                       |
| From JS Date            | `moment(Date)`           | `DateTime.fromJSDate(Date)`           |                                                                                                                                       |
| From civil time         | `moment(Array)`          | `DateTime.local(Number...)`           | Like `DateTime.local(2016, 12, 25, 10, 30)`                                                                                           |
| From UTC civil time     | `moment.utc(Array)`      | `DateTime.utc(Number...)`             | Moment also uses `moment.utc()` to take other arguments. In Luxon, use the appropriate method and pass in the `{ zone: 'utc'}` option |
| Clone                   | `moment(Moment)`         | N/A                                   | Immutability makes this pointless; just reuse the object                                                                              |
| Use the string's offset | `parseZone`              | See note                              | Methods taking strings that can specify offset or zone take a `setZone` argument                                                      |

### Getters and setters

#### Basic information getters

| Property | Moment      | Luxon     | Notes                                            |
| -------- | ----------- | --------- | ------------------------------------------------ |
| Validity | `isValid()` | `isValid` | See also `invalidReason`                         |
| Locale   | `locale()`  | `locale`  |                                                  |
| Zone     | `tz()`      | `zone`    | Moment requires a plugin for this, but not Luxon |

#### Unit getters

| Property               | Moment                               | Luxon         | Notes                                  |
| ---------------------- | ------------------------------------ | ------------- | -------------------------------------- |
| Year                   | `year()`                             | `year`        |                                        |
| Month                  | `month()`                            | `month`       |                                        |
| Day of month           | `date()`                             | `day`         |                                        |
| Day of week            | `day()`, `weekday()`, `isoWeekday()` | `weekday`     | 1-7, Monday is 1, Sunday is 7, per ISO |
| Day of year            | `dayOfYear()`                        | `ordinal`     |                                        |
| Hour of day            | `hour()`                             | `hour`        |                                        |
| Minute of hour         | `minute()`                           | `minute`      |                                        |
| Second of minute       | `second()`                           | `second`      |                                        |
| Millisecond of seconds | `millisecond()`                      | `millisecond` |                                        |
| Week of ISO week year  | `weekYear`, `isoWeekYear`            | `weekYear`    |                                        |
| Quarter                | `quarter`                            | None          | Just divide the months by 4            |

#### Programmatic get and set

For programmatic getting and setting, Luxon and Moment are very similar here:

| Operation  | Moment                | Luxon         | Notes                                   |
| ---------- | --------------------- | ------------- | --------------------------------------- |
| get value  | `get(String)`         | `get(String)` |                                         |
| set value  | `set(String, Number)` | None          |                                         |
| set values | `set(Object)`         | `set(Object)` | Like `dt.set({ year: 2016, month: 3 })` |

### Transformation

| Operation          | Moment                     | Luxon               | Notes                                   |
| ------------------ | -------------------------- | ------------------- | --------------------------------------- |
| Addition           | `add(Number, String)`      | `plus(Object)`      | Like `dt.plus({ months: 3, days: 2 })`  |
| Subtraction        | `subtract(Number, String)` | `minus(Object)`     | Like `dt.minus({ months: 3, days: 2 })` |
| Start of unit      | `startOf(String)`          | `startOf(String)`   |                                         |
| End of unit        | `endOf(String)`            | `endOf(String)`     |                                         |
| Change unit values | `set(Object)`              | `set(Object)`       | Like `dt.set({ year: 2016, month: 3 })` |
| Change time zone   | `tz(String)`               | `setZone(string)`   | Luxon doesn't require a plugin          |
| Change zone to utc | `utc()`                    | `toUTC()`           |                                         |
| Change local zone  | `local()`                  | `toLocal()`         |                                         |
| Change offset      | `utcOffset(Number)`        | None                | Set the zone instead                    |
| Change locale      | `locale(String)`           | `setLocale(String)` |                                         |

### Query

| Question                                   | Moment                  | Luxon                                            | Notes                                                                                           |
| ------------------------------------------ | ----------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Is this time before that time?             | `m1.isBefore(m2)`       | `dt1 < dt2`                                      | The Moment versions of these take a unit. To do that in Luxon, use `startOf` on both instances. |
| Is this time after that time?              | `m1.isAfter(m2)`        | `dt1 > dt2`                                      |                                                                                                 |
| Is this time the same or before that time? | `m1.isSameOrBefore(m2)` | `dt1 <= dt2`                                     |                                                                                                 |
| Is this time the same or after that time?  | `m1.isSameOrAfter(m2)`  | `dt1 >= dt2`                                     |                                                                                                 |
| Do these two times have the same [unit]?   | `m1.isSame(m2, unit)`   | `dt1.hasSame(dt2, unit)`                         |                                                                                                 |
| Is this time's [unit] before that time's?  | `m1.isBefore(m2, unit)` | `dt1.startOf(unit) < dt2.startOf(unit)`          |                                                                                                 |
| Is this time's [unit] after that time's?   | `m1.isAfter(m2, unit)`  | `dt1.startOf(unit) > dt2.startOf(unit)`          |                                                                                                 |
| Is this time between these two times?      | `m1.isBetween(m2, m3)`  | `Interval.fromDateTimes(dt2, dt3).contains(dt1)` |                                                                                                 |
| Is this time inside a DST                  | `isDST()`               | `isInDST`                                        |                                                                                                 |
| Is this time's year a leap year?           | `isInLeapYear()`        | `isInLeapYear`                                   |                                                                                                 |
| How many days are in this time's month?    | `daysInMonth()`         | `daysInMonth`                                    |                                                                                                 |
| How many days are in this time's year?     | None                    | `daysInYear`                                     |                                                                                                 |

### Output

#### Basics

See the [formatting guide](formatting.html) for more about the string-outputting methods.

| Output           | Moment         | Luxon                       | Notes                                                                                                                                             |
| ---------------- | -------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| simple string    | `toString()`   | `toString()`                | Luxon just uses ISO 8601 for this. See Luxon's `toLocaleString()`                                                                                 |
| full ISO 8601    | `iso()`        | `toISO()`                   |                                                                                                                                                   |
| ISO date only    | None           | `toISODate()`               |                                                                                                                                                   |
| ISO time only    | None           | `toISOTime()`               |                                                                                                                                                   |
| custom format    | `format(...)`  | `toFormat(...)`             | The format tokens differ between Moment and Luxon, such that the same format string cannot be used between the two.                               |
| RFC 2822         |                | `toRFC2822()`               |                                                                                                                                                   |
| HTTP date string |                | `toHTTP()`                  |                                                                                                                                                   |
| JS Date          | `toDate()`     | `toJSDate()`                |                                                                                                                                                   |
| Epoch time       | `valueOf()`    | `toMillis()` or `valueOf()` |                                                                                                                                                   |
| Object           | `toObject()`   | `toObject()`                |                                                                                                                                                   |
| Duration         | `diff(Moment)` | `diff(DateTime)`            | Moment's diff returns a count of milliseconds, but Luxon's returns a Duration. To replicate the Moment behavior, use `dt1.diff(d2).milliseconds`. |

#### Humanization

Luxon has `toRelative` and `toRelativeCalendar`. For internationalization, they use Intl.RelativeTimeFormat (or fall back to English when it is not supported by the browser).

| Operation            | Moment         | Luxon                                         |
| -------------------- | -------------- | --------------------------------------------- |
| Time from now        | `fromNow()`    | `toRelative()`                                |
| Time from other time | `from(Moment)` | `toRelative({ base: DateTime })`              |
| Time to now          | `toNow()`      | `DateTime.local().toRelative({ base: this })` |
| Time to other time   | `to(Moment)`   | `otherTime.toRelative({ base: this })`        |
| "Calendar time"      | `calendar()`   | `toRelativeCalendar()`                        |

## Durations

Moment Durations and Luxon Durations are broadly similar in purpose and capabilities. The main differences are:

1.  Luxon durations have more sophisticated conversion capabilities. They can convert from one set of units to another using `shiftTo`. They can also be configured to use different unit conversions. See [Duration Math](math.html#duration-math) for more.
1.  Luxon does not (yet) have an equivalent of Moment's Duration `humanize` method. Luxon will add that when [Unified Intl.NumberFormat](https://github.com/tc39/proposal-unified-intl-numberformat) is supported by browsers.
1.  Like DateTimes, Luxon Durations have separate methods for creating objects from different sources.

See the [Duration API docs](../class/src/duration.js~Duration.html) for more.

## Intervals

Moment doesn't have direct support intervals, which must be provided by plugins like Twix or moment-range. Luxon's Intervals have similar capabilities to theirs, with the exception of the humanization features. See the [Interval API docs](../class/src/interval.js~Interval.html) for more.
