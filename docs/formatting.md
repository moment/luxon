# Formatting

This section covers creating strings to represent a DateTime. There are three types of formatting capabilities:

1.  Technical formats like ISO 8601 and RFC 2822
2.  Internationalizable human-readable formats
3.  Token-based formatting

## Technical formats (strings for computers)

### ISO 8601

[ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) is the most widely used set of string formats for dates and times. Luxon can _parse_ a wide range of them, but provides direct support for formatting only a few of them:

```js
dt.toISO(); //=> '2017-04-20T11:32:00.000-04:00'
dt.toISODate(); //=> '2017-04-20'
dt.toISOWeekDate(); //=> '2017-W17-7'
dt.toISOTime(); //=> '11:32:00.000-04:00'
```

Generally, you'll want the first one. Use it by default when building or interacting with APIs, communicating times over a wire, etc.

### HTTP and RFC 2822

There are a number of legacy standard date and time formats out there, and Luxon supports some of them. You shouldn't use them unless you have a specific reason to.

```js
dt.toRFC2822(); //=> 'Thu, 20 Apr 2017 11:32:00 -0400'
dt.toHTTP(); //=> 'Thu, 20 Apr 2017 03:32:00 GMT'
```

### Unix timestamps

DateTime objects can also be converted to numerical [Unix timestamps](https://en.wikipedia.org/wiki/Unix_time):

```js
dt.toMillis(); //=> 1492702320000
dt.toSeconds(); //=> 1492702320
dt.valueOf(); //=> 1492702320000, same as .toMillis()
```

## toLocaleString (strings for humans)

### The basics

Modern browsers (and other JS environments) provide support for human-readable, internationalized strings. Luxon provides convenient support for them, and you should use them anytime you want to display a time to a user. Use [toLocaleString](../class/src/datetime.js~DateTime.html#instance-method-toLocaleString) to do it:

```js
dt.toLocaleString(); //=> '4/20/2017'
dt.toLocaleString(DateTime.DATETIME_FULL); //=> 'April 20, 2017, 11:32 AM EDT'
dt.setLocale('fr').toLocaleString(DateTime.DATETIME_FULL); //=> '20 avril 2017 à 11:32 UTC−4'
```

### Intl.DateTimeFormat

In the example above, `DateTime.DATETIME_FULL` is one of several convenience formats provided by Luxon. But the arguments are really any object of options that can be provided to [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat). For example:

```js
dt.toLocaleString({ month: 'long', day: 'numeric' }); //=> 'April 20'
```

And that's all the preset is:

```
DateTime.DATETIME_FULL;  //=> {
                         //     year: 'numeric',
                         //     month: 'long',
                         //     day: 'numeric',
                         //     hour: 'numeric',
                         //     minute: '2-digit',
                         //     timeZoneName: 'short'
                         //   }
```

This also means you can modify the presets as you choose:

```js
dt.toLocaleString(DateTime.DATE_SHORT); //=>  '4/20/2017'
var newFormat = Object.assign({ weekday: 'long' }, DateTime.DATE_SHORT);
dt.toLocaleString(newFormat); //=>  'Thursday, 4/20/2017'
```

### Presets

Here's the full set of provided presets using the October 14, 1983 at 13:30:23 as an example.

| Name                        | Description                                                        | Example in en_US                                           | Example in fr                                            |
| --------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------- | -------------------------------------------------------- |
| DATE_SHORT                  | short date                                                         | 10/14/1983                                                 | 14/10/1983                                               |
| DATE_MED                    | abbreviated date                                                   | Oct 14, 1983                                               | 14 oct. 1983                                             |
| DATE_FULL                   | full date                                                          | October 14, 1983                                           | 14 octobre 1983                                          |
| DATE_HUGE                   | full date with weekday                                             | Tuesday, October 14, 1983                                  | vendredi 14 octobre 1983                                 |
| TIME_SIMPLE                 | time                                                               | 1:30 PM                                                    | 13:30                                                    |
| TIME_WITH_SECONDS           | time with seconds                                                  | 1:30:23 PM                                                 | 13:30:23                                                 |
| TIME_WITH_SHORT_OFFSET      | time with seconds and abbreviated named offset                     | 1:30:23 PM EDT                                             | 13:30:23 UTC−4                                           |
| TIME_WITH_LONG_OFFSET       | time with seconds and full named offset                            | 1:30:23 PM Eastern Daylight Time                           | 13:30:23 heure d’été de l’Est                            |
| TIME_24_SIMPLE              | 24-hour time                                                       | 13:30                                                      | 13:30                                                    |
| TIME_24_WITH_SECONDS        | 24-hour time with seconds                                          | 13:30:23                                                   | 13:30:23                                                 |
| TIME_24_WITH_SHORT_OFFSET   | 24-hour time with seconds and abbreviated named offset             | 13:30:23 EDT                                               | 13:30:23 UTC−4                                           |
| TIME_24_WITH_LONG_OFFSET    | 24-hour time with seconds and full named offset                    | 13:30:23 Eastern Daylight Time                             | 13:30:23 heure d’été de l’Est                            |
| DATETIME_SHORT              | short date & time                                                  | 10/14/1983, 1:30 PM                                        | 14/10/1983 à 13:30                                       |
| DATETIME_MED                | abbreviated date & time                                            | Oct 14, 1983, 1:30 PM                                      | 14 oct. 1983 à 13:30                                     |
| DATETIME_FULL               | full date and time with abbreviated named offset                   | October 14, 1983, 1:30 PM EDT                              | 14 octobre 1983 à 13:30 UTC−4                            |
| DATETIME_HUGE               | full date and time with weekday and full named offset              | Friday, October 14, 1983, 1:30 PM Eastern Daylight Time    | vendredi 14 octobre 1983 à 13:30 heure d’été de l’Est    |
| DATETIME_SHORT_WITH_SECONDS | short date & time with seconds                                     | 10/14/1983, 1:30:23 PM                                     | 14/10/1983 à 13:30:23                                    |
| DATETIME_MED_WITH_SECONDS   | abbreviated date & time with seconds                               | Oct 14, 1983, 1:30:23 PM                                   | 14 oct. 1983 à 13:30:23                                  |
| DATETIME_FULL_WITH_SECONDS  | full date and time with abbreviated named offset with seconds      | October 14, 1983, 1:30:23 PM EDT                           | 14 octobre 1983 à 13:30:23 UTC−4                         |
| DATETIME_HUGE_WITH_SECONDS  | full date and time with weekday and full named offset with seconds | Friday, October 14, 1983, 1:30:23 PM Eastern Daylight Time | vendredi 14 octobre 1983 à 13:30:23 heure d’été de l’Est |

### Intl

`toLocaleString`'s behavior is affected by the DateTime's `locale`, `numberingSystem`, and `outputCalendar` properties. See the [Intl](intl.html) section for more.

## Formatting with tokens (strings for Cthulhu)

This section covers generating strings from DateTimes with programmer-specified formats.

### Consider alternatives

You shouldn't create ad-hoc string formats if you can avoid it. If you intend for a computer to read the string, prefer ISO 8601. If a human will read it, prefer `toLocaleString`. Both are covered above. However, if you have some esoteric need where you need some specific format (e.g. because some other software expects it), then `toFormat` is how you do it.

### toFormat

See [DateTime#toFormat](../class/src/datetime.js~DateTime.html#instance-method-toFormat) for the API signature. As a brief motivating example:

```js
DateTime.fromISO('2014-08-06T13:07:04.054').toFormat('yyyy LLL dd'); //=> '2014 Aug 06'
```

The supported tokens are described in the table below.

### Intl

All of the strings (e.g. month names and weekday names) are internationalized by introspecting strings generated by the Intl API. Thus they exact strings you get are implementation-specific.

```js
DateTime.fromISO('2014-08-06T13:07:04.054')
  .setLocale('fr')
  .toFormat('yyyy LLL dd'); //=> '2014 août 06'
```

### Escaping

You may escape strings using single quotes:

```js
DateTime.local().toFormat("HH 'hours and' mm 'minutes'"); //=> '20 hours and 55 minutes'
```

### Standalone vs format tokens

Some tokens have a "standalone" and "format" version. Some languages require different forms of a word based on whether it is part of a longer phrase or just by itself (e.g. "Monday the 22nd" vs "Monday"). Use them accordingly.

```js
var d = DateTime.fromISO('2014-08-06T13:07:04.054').setLocale('ru');
d.toFormat('LLLL'); //=> 'август' (standalone)
d.toFormat('MMMM'); //=> 'августа' (format)
```

### Macro tokens

Some of the formats are "macros", meaning they correspond to multiple components. These use the native Intl API and will order their constituent parts in a locale-friendly way.

```js
DateTime.fromISO('2014-08-06T13:07:04.054').toFormat('ff'); //=> 'Aug 6, 2014, 1:07 PM'
```

The macro options available correspond one-to-one with the preset formats defined for `toLocaleString`.

### Table of tokens

(Examples below given for 2014-08-06T13:07:04.054 considered as a local time in America/New_York).

| Standalone token | Format token | Description                                                    | Example                                                     |
| ---------------- | ------------ | -------------------------------------------------------------- | ----------------------------------------------------------- |
| S                |              | millisecond, no padding                                        | 54                                                          |
| SSS              |              | millisecond, padded to 3                                       | 054                                                         |
| u                |              | fractional seconds, functionally identical to SSS              | 054                                                         |
| s                |              | second, no padding                                             | 4                                                           |
| ss               |              | second, padded to 2 padding                                    | 04                                                          |
| m                |              | minute, no padding                                             | 7                                                           |
| mm               |              | minute, padded to 2                                            | 07                                                          |
| h                |              | hour in 12-hour time, no padding                               | 1                                                           |
| hh               |              | hour in 12-hour time, padded to 2                              | 01                                                          |
| H                |              | hour in 24-hour time, no padding                               | 9                                                           |
| HH               |              | hour in 24-hour time, padded to 2                              | 13                                                          |
| Z                |              | narrow offset                                                  | +5                                                          |
| ZZ               |              | short offset                                                   | +05:00                                                      |
| ZZZ              |              | techie offset                                                  | +0500                                                       |
| ZZZZ             |              | abbreviated named offset                                       | EST                                                         |
| ZZZZZ            |              | unabbreviated named offset                                     | Eastern Standard Time                                       |
| z                |              | IANA zone                                                      | America/New_York                                            |
| a                |              | meridiem                                                       | AM                                                          |
| d                |              | day of the month, no padding                                   | 6                                                           |
| dd               |              | day of the month, padded to 2                                  | 06                                                          |
| c                | E            | day of the week, as number from 1-7 (Monday is 1, Sunday is 7) | 3                                                           |
| ccc              | EEE          | day of the week, as an abbreviate localized string             | Wed                                                         |
| cccc             | EEEE         | day of the week, as an unabbreviated localized string          | Wednesday                                                   |
| ccccc            | EEEEE        | day of the week, as a single localized letter                  | W                                                           |
| L                | M            | month as an unpadded number                                    | 8                                                           |
| LL               | MM           | month as an padded number                                      | 08                                                          |
| LLL              | MMM          | month as an abbreviated localized string                       | Aug                                                         |
| LLLL             | MMMM         | month as an unabbreviated localized string                     | August                                                      |
| LLLLL            | MMMMM        | month as a single localized letter                             | A                                                           |
| y                |              | year, unpadded                                                 | 2014                                                        |
| yy               |              | two-digit year                                                 | 14                                                          |
| yyyy             |              | four- to six- digit year, pads to 4                            | 2014                                                        |
| G                |              | abbreviated localized era                                      | AD                                                          |
| GG               |              | unabbreviated localized era                                    | Anno Domini                                                 |
| GGGGG            |              | one-letter localized era                                       | A                                                           |
| kk               |              | ISO week year, unpadded                                        | 17                                                          |
| kkkk             |              | ISO week year, padded to 4                                     | 2014                                                        |
| W                |              | ISO week number, unpadded                                      | 32                                                          |
| WW               |              | ISO week number, padded to 2                                   | 32                                                          |
| o                |              | ordinal (day of year), unpadded                                | 218                                                         |
| ooo              |              | ordinal (day of year), padded to 3                             | 218                                                         |
| q                |              | quarter, no padding                                            | 3                                                           |
| qq               |              | quarter, padded to 2                                           | 03                                                          |
| D                |              | localized numeric date                                         | 9/4/2017                                                    |
| DD               |              | localized date with abbreviated month                          | Aug 6, 2014                                                 |
| DDD              |              | localized date with full month                                 | August 6, 2014                                              |
| DDDD             |              | localized date with full month and weekday                     | Wednesday, August 6, 2014                                   |
| t                |              | localized time                                                 | 9:07 AM                                                     |
| tt               |              | localized time with seconds                                    | 1:07:04 PM                                                  |
| ttt              |              | localized time with seconds and abbreviated offset             | 1:07:04 PM EDT                                              |
| tttt             |              | localized time with seconds and full offset                    | 1:07:04 PM Eastern Daylight Time                            |
| T                |              | localized 24-hour time                                         | 13:07                                                       |
| TT               |              | localized 24-hour time with seconds                            | 13:07:04                                                    |
| TTT              |              | localized 24-hour time with seconds and abbreviated offset     | 13:07:04 EDT                                                |
| TTTT             |              | localized 24-hour time with seconds and full offset            | 13:07:04 Eastern Daylight Time                              |
| f                |              | short localized date and time                                  | 8/6/2014, 1:07 PM                                           |
| ff               |              | less short localized date and time                             | Aug 6, 2014, 1:07 PM                                        |
| fff              |              | verbose localized date and time                                | August 6, 2014, 1:07 PM EDT                                 |
| ffff             |              | extra verbose localized date and time                          | Wednesday, August 6, 2014, 1:07 PM Eastern Daylight Time    |
| F                |              | short localized date and time with seconds                     | 8/6/2014, 1:07:04 PM                                        |
| FF               |              | less short localized date and time with seconds                | Aug 6, 2014, 1:07:04 PM                                     |
| FFF              |              | verbose localized date and time with seconds                   | August 6, 2014, 1:07:04 PM EDT                              |
| FFFF             |              | extra verbose localized date and time with seconds             | Wednesday, August 6, 2014, 1:07:04 PM Eastern Daylight Time |
| X                |              | unix timestamp in seconds                                      | 1407287224                                                  |
| x                |              | unix timestamp in milliseconds                                 | 1407287224054                                              |
