# A quick tour

Luxon is a library that makes it easier to work with dates and times in JavaScript. If you want, add and subtract them, format and parse them, ask them hard questions, and so on, Luxon provides a much easier and comprehensive interface than the native types it wraps. We're going to talk about the most immediately useful subset of that interface.

This is going to be a bit brisk, but keep in mind that the API docs are comprehensive, so if you want to know more, feel free to [dive into them](https://moment.github.io/luxon/api-docs/index.html).

## Your first DateTime

The most important class in Luxon is `DateTime`. A DateTime represents a specific millisecond in time, along with a time zone and a locale. Here's one that represents May 15, 2017 at 8:30 in the morning:

```js
const dt = DateTime.local(2017, 5, 15, 8, 30);
```

[DateTime.local](../class/src/datetime.js~DateTime.html#static-method-local) takes any number of arguments, all the way out to milliseconds (months are 1-indexed). Underneath, this is similar to a JavaScript Date object. But we've decorated it with lots of useful methods.

## Creating a DateTime

There are lots of ways to create a DateTime by parsing strings or constructing them out of parts. You've already seen one, `DateTime.local()`, but let's talk about three more.

### Get the current date and time

To get the current time, just do this:

```js
const now = DateTime.now();
```

This is really the equivalent to calling `DateTime.local()` with no arguments, but it's a little clearer.

### Create from an object

The most powerful way to create a DateTime instance is to provide an object containing all the information:

```js
dt = DateTime.fromObject({day: 22, hour: 12 }, { zone: 'America/Los_Angeles', numberingSystem: 'beng'})
```

Don't worry too much about the properties you don't understand yet; the point is that you can set every attribute of a DateTime when you create it. One thing to notice from the example is that we just set the day and hour; the year and month get defaulted to the current one and the minutes, seconds, and milliseconds get defaulted to 0. So `DateTime.fromObject` is sort of the power user interface.

### Parse from ISO 8601

Luxon has lots of parsing capabilities, but the most important one is parsing [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) strings, because they're more-or-less the standard wire format for dates and times. Use `DateTime.fromISO`.


```js
DateTime.fromISO("2017-05-15")          //=> May 15, 2017 at midnight
DateTime.fromISO("2017-05-15T08:30:00") //=> May 15, 2017 at 8:30
```

You can parse a bunch of other formats, including [your own custom ones](parsing.md).

## Getting to know your DateTime instance

Now that we've made some DateTimes, let's see what we can ask of it.

### toString

The first thing we want to see is the DateTime as a string. Luxon returns ISO 8601 strings:

```js
DateTime.now().toString(); //=> '2017-09-14T03:20:34.091-04:00'
```

### Getting at components

We can get at the components of the time individually through getters. For example:

```js
dt = DateTime.now();
dt.year     //=> 2017
dt.month    //=> 9
dt.day      //=> 14
dt.second   //=> 47
dt.weekday  //=> 4
```

### Other fun accessors

```js
dt.zoneName     //=> 'America/New_York'
dt.offset       //=> -240
dt.daysInMonth  //=> 30
```

There are lots more!

## Formatting your DateTime

You may want to output your DateTime to a string for a machine or a human to read. Luxon has lots of tools for this, but two of them are most important. If you want to format a human-readable string, use `toLocaleString`:

```js
dt.toLocaleString()      //=> '9/14/2017'
dt.toLocaleString(DateTime.DATETIME_MED) //=> 'September 14, 3:21 AM'
```

This works well across different locales (languages) by letting the browser figure out what order the different parts go in and how to punctuate them.

If you want the string read by another program, you almost certainly want to use `toISO`:

```js
dt.toISO() //=> '2017-09-14T03:21:47.070-04:00'
```

Custom formats are also supported. See [formatting](formatting).

## Transforming your DateTime

### Immutability

Luxon objects are immutable. That means that you can't alter them in place, just create altered copies. Throughout the documentation, we use terms like "alter", "change", and "set" loosely, but rest assured we mean "create a new instance with different properties".

### Math

This is easier to show than to tell. All of these calls return new DateTime instances:

```js
var dt = DateTime.now();
dt.plus({ hours: 3, minutes: 2 });
dt.minus({ days: 7 });
dt.startOf('day');
dt.endOf('hour');
```

### Set

You can create new instances by overriding specific properties:

```js
var dt = DateTime.now();
dt.set({hour: 3}).hour   //=> 3
```

## Intl

Luxon provides several different Intl capabilities, but the most important one is in formatting:

```js
var dt = DateTime.now();
var f = {month: 'long', day: 'numeric'};
dt.setLocale('fr').toLocaleString(f)      //=> '14 septembre'
dt.setLocale('en-GB').toLocaleString(f)   //=> '14 September'
dt.setLocale('en-US').toLocaleString(f)  //=> 'September 14'
```

Luxon's Info class can also list months or weekdays for different locales:

```js
Info.months('long', {locale: 'fr'}) //=> [ 'janvier', 'février', 'mars', 'avril', ... ]
```

## Time zones

Luxon supports time zones. There's a whole [big section](zones) about it. But briefly, you can create DateTimes in specific zones and change their zones:

```js
DateTime.fromObject({}, {zone: 'America/Los_Angeles'}); // now, but expressed in LA's local time
DateTime.now().setZone("America/Los_Angeles"); // same
```

Luxon also supports UTC directly:

```js
DateTime.utc(2017, 5, 15);
DateTime.utc(); // now, in UTC time zone
DateTime.now().toUTC();
DateTime.utc().toLocal();
```

## Durations

The Duration class represents a quantity of time such as "2 hours and 7 minutes". You create them like this:

```js
var dur = Duration.fromObject({ hours: 2, minutes: 7 });
```

They can be added or subtracted from DateTimes like this:

```js
dt.plus(dur);
```

They have getters just like DateTime:

```js
dur.hours   //=> 2
dur.minutes //=> 7
dur.seconds //=> 0
```

And some other useful stuff:

```js
dur.as('seconds') //=> 7620
dur.toObject()    //=> { hours: 2, minutes: 7 }
dur.toISO()       //=> 'PT2H7M'
```

You can also format, negate, and normalize them. See it all in the `Duration` API docs.

## Intervals

Intervals are a specific period of time, such as "between now and midnight". They're really a wrapper for two DateTimes that form its endpoints. Here's what you can do with them:

```js
now = DateTime.now();
later = DateTime.local(2020, 10, 12);
i = Interval.fromDateTimes(now, later);

i.length()                             //=> 97098768468
i.length('years')                //=> 3.0762420239726027
i.contains(DateTime.local(2019))       //=> true

i.toISO()       //=> '2017-09-14T04:07:11.532-04:00/2020-10-12T00:00:00.000-04:00'
i.toString()    //=> '[2017-09-14T04:07:11.532-04:00 – 2020-10-12T00:00:00.000-04:00)
```

Note that Luxon's Intervals are always half-open, meaning the starting point is included in the interval while the end point is not.
The following code will not work as expected:
```js
const start = DateTime.now().startOf('day');
const end = start.endOf('day');
const i = Interval.fromDateTimes(start, end);

i.length('hours')    //=> 23.99999972222222
i.toString()         //=> [2025-07-09T00:00:00.000+02:00 – 2025-07-09T23:59:59.999+02:00)
```

This is because `endOf('day')` returns the last millisecond of the day and as a result that last millisecond is _not_
included in the interval.

`Interval.after` or `Interval.before` are better suited for creating Intervals of a specific length:
```js
const start = DateTime.now().startOf('day');
const i1 = Interval.after(start, { days: 1 });
const i2 = Interval.before(start, { days: 1 });

i1.length('hours')    //=> 24
i1.toString()         //=> [2025-07-09T00:00:00.000+02:00 – 2025-07-10T00:00:00.000+02:00)

i2.length('hours')    //=> 24
i2.toString()         //=> [2025-07-08T00:00:00.000+02:00 – 2025-07-09T00:00:00.000+02:00)
```

Intervals can be split up into smaller intervals, perform set-like operations with other intervals, and few other handy features. See the `Interval` API docs.
