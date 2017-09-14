# Time zones and offsets

Bear with me here. Time zones are pain in the ass. Luxon has lots of tools to deal with them, but there's no getting around the fact that they're complicated.

## Terminology

The terminology for time zones and offsets isn't well-established. But let's try to impose some order:

 1. An **offset** is a difference between the local time and the UTC time, such as +5 (hours) or -12:30. They may be expressed directly in minutes, or in hours, or in a combination of minutes and hours. Here we'll use hours.
 1. A **time zone** is a set of rules, associated with a geographical location, that determines the local offset from UTC at any given time. The best way to identify a zone is by its IANA string, such as "America/New_York". That zone says something to the effect of "The offset is -4, except between March and September, when it's -5".
 1. A **fixed-offset time zone** is any time zone that never changes offsets, such as UTC. Luxon supports fixed-offset zones directly; they're specified like UTC+7, which you can interpret as "always with an offset of +7".
 1. A **named offset** is a time zone-specific name for an offset, such as Eastern Daylight Time. It expresses both the zone (America's EST roughly implies America/New_York) and the current offset (EST means +4). They are also confusing in that they overspecify the offset (e.g. for any given time it is unnecessary to specify EST vs EDT; it's always whichever one is right). They are also ambiguous (Australia also calls something EST), unstandardized, and internationalized (what would a Frenchman call the US's EST?). For all these reasons, you should avoid them when specifying times programmatically. Luxon only supports their use in formatting.
 
Some subtleties:

 1. Multiple zones can have the same offset (think about the US's zones and their Canadian equivalents), though they might not have the same offset all the time, depending on when their DSTs are. Thus zones and offsets have a  many-to-many relationship.
 1. Just because a time zone doesn't have a DST now doesn't mean it's fixed. Perhaps it had one in the past. Regardless, Luxon does not have first class access to the list of rules, so it assumes any IANA-specified zone is not fixed and checks for its current offset programmatically.
 
If all this seems too terse, check out these articles. The terminology in them is subtly different but the concepts are the same:

 * [Time Zones Aren’t Offsets – Offsets Aren’t Time Zones](https://spin.atomicobject.com/2016/07/06/time-zones-offsets/)
 * [Stack Overflows timezone wiki page](https://stackoverflow.com/tags/timezone/info)


## Luxon works with time zones

Luxon's DateTime class supports zones directly. By default, a date created in Luxon is "in" the local time zone of the machine it's running on. By "in" we mean that the DateTime has, as one of its properties, an associated zone. That zone affects its behavior in a number of ways:

 1. Times will be formatted as they would be in that zone.
 1. Transformations to the date (such as `plus` or `startOf`) will obey any DSTs in that zone that affect the calculation (see "Date math vs time math" below)
 
Generally speaking, Luxon does not support changing a DateTime's offset, just its zone. That allows it to enforce the behaviors in the list above. The offset for that DateTime is just whatever the zone says it is. If you are unconcerned with the effects above, then you can always give your DateTime a fixed-offset zone.

## Support for IANA-specified zones

IANA-specified zones are string identifiers like "America/New_York" or "Asia/Tokyo". Luxon gains direct support for them by abusing built-in Intl APIs. However, your environment may not support them, in which case, you can fiddle with the zones. You can always use the local zone your system is in, UTC, and any fixed-offset zone like UTC+7. You can check if your runtime environment supports IANA zones with our handy utility:

```js
Info.features().zones; //=> true
```

If your unsure if all your target environments (browser versions and Node versions) support this, check out the [Support Matrix](faq/matrix.html). You can generally count on modern browsers to have this feature, except IE (it is supported in Edge). You may also [polyfill](faq/matrix.html#zones).

If you specify a zone and your environment doesn't support that zone, you'll get an [invalid](usage/validity.html) DateTime. That could be because the environment doesn't support zones at all, because for whatever reason doesn't support that *particular* zone, or because the zone is just bogus. Like this:

```js
bogus = DateTime.local().setZone('America/Bogus')

bogus.isValid;         //=> false
bogus.invalidReason;   //=> 'unsupported zone'
```

## Constructing DateTimes with specific zones
Luxon's parsing and other creation functions will interpret the times specified as the zone-local expression of that time, unless a) an option is passed to make Luxon consider the string to have been expressed in certain zone or b) the input string itself provides information about how it is to be interpreted (such as an ISO 8601 string of "2017-05-15T09:10:23Z".

Note that the interpretation of the input data is conceptually independent of zone property in the resultant DateTime object. For example, Luxon can interpret a string as specifying a time in `Europe/Paris` but translate the time into the local zone of, say, `America/New_York`. However, Luxon's relevant parsing options typically put the resulting object in the same zone the string was read as. On the other hand, strings that specify their offset or zone directly are always converted to the target zone.

In addition, one static method, `utc()` specifically interprets the input as being specified in UTC. It also creates a DateTime in UTC.

Here are some examples. I ran these from `America/New_York`, which is has an offset of -4 :

Most methods create local times from local data:
```js
var local = DateTime.local(2017, 05, 15, 09, 10, 23);

local.zoneName;                //=> 'America/New_York'
local.toString();              //=> '2017-05-15T09:10:23.000-04:00'

var iso = DateTime.fromISO("2017-05-15T09:10:23");

iso.zoneName;                  //=> 'America/New_York'
iso.toString();                //=> '2017-05-15T09:10:23.000-04:00'
```

Some other methods allow you to interpret the input as being specified in another zone. These methods convert the DateTime to that zone.

```js
var utc = DateTime.utc(2017, 05, 15, 09, 10, 23);

utc.zoneName;                  //=> 'UTC'
utc.toString();                //=> '2017-05-15T09:10:23.000Z'
```

Many methods allow you to specify the zone. Note that the input time is interpreted in that zone AND the resultant DateTime is in that zone.

```js
var overrideZone = DateTime.fromISO("2017-05-15T09:10:23", {zone: 'Europe/Paris'});

overrideZone.zoneName;         //=> 'Europe/Paris'
overrideZone.toString();       //=> '2017-05-15T09:10:23.000+02:00'
```

Parsed string can sometimes specify an offset or zone. Luxon interprets the time in that zone or with that offset, but converts it to the system's local zone.
```js
var specifyOffset = DateTime.fromISO("2017-05-15T09:10:23-09:00");

specifyOffset.zoneName;         //=> 'America/New_York'
specifyOffset.toString();       //=> '2017-05-15T14:10:23.000-04:00'

var specifyZone = DateTime.fromString("2017-05-15T09:10:23 Europe/Paris", "yyyy-MM-dd'T'HH:mm:ss z");

specifyZone.zoneName           //=> 'America/New_York'
specifyZone.toString()         //=> '2017-05-15T03:10:23.000-04:00'
```

...unless a zone is specified as an option, in which case it's converted to *that* zone.

```js
var specifyOffsetAndOverrideZone = DateTime.fromISO("2017-05-15T09:10:23-09:00", {zone: 'Europe/Paris'});

specifyOffsetAndOverrideZone.zoneName;                 //=> 'Europe/Paris'
specifyOffsetAndOverrideZone.toString();               //=> '2017-05-15T20:10:23.000+02:00'
```

Finally, some parsing functions allow you to "keep" the zone in the string as the DateTime's zone. Note that if only an offset is provided by the string, the zone will be a fixed-offset one, since Luxon doesn't know which zone is meant, even if you do.
```js
var keepOffset = DateTime.fromISO("2017-05-15T09:10:23-09:00", {setZone: true});

keepOffset.zoneName;           //=> 'UTC-9'
keepOffset.toString();         //=> '2017-05-15T09:10:23.000-09:00'

var keepZone = DateTime.fromString("2017-05-15T09:10:23 Europe/Paris", "yyyy-MM-dd'T'HH:mm:ss z", {setZone: true});

keepZone.zoneName;             //=> 'Europe/Paris'
keepZone.toString()            //=> '2017-05-15T09:10:23.000+02:00'
```

## Getting information about the current zone and offset

Luxon DateTimes have a few different accessors that let you find out about the zone and offset:

```js
var dt = DateTime.local();

dt.zoneName          //=> 'America/New_York'
dt.offset            //=> -240
dt.offsetNameShort   //=> 'EDT'
dt.offsetNameLong    //=> 'Eastern Daylight Time'
dt.isOffsetFixed     //=> false
dt.isInDST           //=> true
```

Those are all documented in the [DateTime API docs](../class/src/datetime.js~DateTime.html).

DateTime also has a `zone` property that holds an Luxon Zone object. You don't normally need to interact with it, but don't get it confused with the `zoneName`.

```js
dt.zone   //=> LocalZone {}
```

## Changing zones

### setZone

Luxon objects are immutable, so when we say "changing zones" we really mean "creating a new instance with a different zone". Changing zone generally means "change the zone in which this DateTime is expressed (and according to which rules it is manipulated), but don't change the underlying timestamp." For example:


```js
var local = DateTime.local();
var rezoned = local.setZone('America/Los_Angeles');

// different local times with different offsets
local.toString()     //=> '2017-09-13T18:30:51.141-04:00'
rezoned.toString()   //=> '2017-09-13T15:30:51.141-07:00'


//but actually the same time
local.valueOf() === rezoned.valueOf(); //=> true
```

### Valid specifiers

You can specify that zone a few different ways. All the methods that take a zone argument support all of these.

| Type | Example | Description |
| --- | --- | --- |
| IANA | 'America/New_York' | that zone
| local | 'local' | the system's local zone
| UTC | 'utc' | Universal Coordinated Time
| fixed offset | 'UTC+7' | a fixed offset zone with that offset
| Zone | new YourZone() | A custom implementation of Luxon's Zone interface (advanced only)

### keepCalendarTime

Generally, it's best to think of the zone as a sort of metadata that you slide around independent of the underlying count of milliseconds. However, sometimes that's not what you want. Sometimes you want to change zones while keeping the local time fixed and instead altering the timestamp. Luxon supports this:

```js
var local = DateTime.local();
var rezoned = local.setZone('America/Los_Angeles', {keepCalendarTime: true});

local.toString();      //=> '2017-09-13T18:36:23.187-04:00'
rezoned.toString();    //=> '2017-09-13T18:36:23.187-07:00'

local.valueOf() === rezoned.valueOf()  //=> false
```

If you find that confusing, I recommend just not using it.

## DST weirdness

Because our ancestors were morons, they opted for a system wherein many governments shift around the local time twice a year for no good reason. And it's not like they do it in a neat, coordinated fashion. No, they do it whimsically, varying the shifts' timing from country to country (or region to region!) and from year to year. And of course, they do it the opposite way south of the equator. This all a tremendous waste of everyone's energy and, er, time, but it is how the world works and a date and time library has to deal with it.

### Invalid times

Some local times simply don't exist. In the Northern Hemisphere, Spring Forward involves shifting the local time forward by (usually) one hour. In my zone, `America/New_York`, on March 12, 2017 the millisecond after 1:59:59.999 became 3:00:00.000. Thus the times between 2:00:00.000 and 2:59:59.000, inclusive, don't exist in that zone. But of course, nothing stops a user from constructing a DateTime out of that local time.

If you create such a DateTime from scratch, the missing time will be advanced by an hour:


```js
DateTime.local(2017, 3, 12, 2, 30).toString(); //=> '2017-03-12T03:30:00.000-04:00'
```

You can also do date math that lands you in the middle of the shift. These behave the same way:

```js
DateTime.local(2017, 3, 11, 2, 30).plus({days: 1}).toString()         //=> '2017-03-12T03:30:00.000-04:00'
DateTime.local(2017, 3, 13, 2, 30).minus({days: 1}).toString()        //=> '2017-03-12T03:30:00.000-04:00'
```

### Ambiguous time

Harder to handle are ambiguous times. In the Northern Hemisphere, some local times happen twice. In my zone, `America/New_York`, on November 5, 2017, the millisecond after 1:59:59.000 became 1:00:00.000. But of course there was already a 1:00 that day an hour before. So if you create a DateTime with a local time of 1:30, which time do you mean? It's an important question, because those correspond to different moments in time.

However, Luxon's behavior here is undefined. It makes no promises about which of the two possible timestamps Luxon will represent. Currently, its specific behavior is like this:

```js
DateTime.local(2017, 11, 5, 1, 30).offset / 60                   //=> -4
DateTime.local(2017, 11, 4, 1, 30).plus({days: 1}).offset / 60   //=> -4
DateTime.local(2017, 11, 6, 1, 30).minus({days: 1}).offset / 60  //=> -5
```

In other words, sometimes it picks one and sometimes the other. Luxon doesn't guarantee the specific behavior above. That's just what it happens to do.

If you're curious, this lack of definition is because Luxon doesn't actually know that any particular DateTime is an ambiguous time. It doesn't know the time zones rules at all. It just knows the local time does not contradict the offset and leaves it at that. To find out the time is ambiguous and define exact rules for how to resolve them, it would have to test nearby times to see if it can find duplicate local time, and it would have to do that on every creation of a DateTime, regardless of whether it was anywhere near a real DST shift. Because that's onerous, Luxon doesn't bother.

### Math across DSTs

There's a whole [section](usage/math.html) about date and time math, but it's worth highlighting one thing here: when Luxon does math across DSTs, it adjusts for them when working with higher order, variable length durations like days, weeks, months, and years. When working with lower order, exact ones like hours, minutes, and seconds, it does not. For example, DSTs mean that days are not always the same length: one day a year is (usually) 23 hours long and another is 25 hours long. Luxon makes sure that adding days takes that into account. On the other hand, an hour is always 3,600,000 milliseconds.

An easy way to think of it is that if you add a day to a DateTime, you should always get the same time the next day, regardless of any intervening DSTs. On the other hand, adding 24 hours will result in DateTime that is 24 hours later, which may or may not be the same time the next day. In this example, my zone is `America/New_York`, which had a Spring Forward DST in the early hours of March 12.


```js
start = DateTime.local(2017, 3, 11, 10);
start.hour                          //=> 10
start.plus({days: 1}).hour          //=> 10
start.plus({hours: 24}).hour        //=> 11
```

## Changing the default zone

By default, Luxon creates DateTimes in the system's local zone. However, you can override this behavior globally:

```js
Settings.defaultZoneName = 'Asia/Tokyo'
DateTime.local().zoneName                 //=> 'Asia/Tokyo'

Settings.defaultZoneName = 'utc'
DateTime.local().zoneName                 //=> 'UTC'

// you can reset by setting to 'local'

Settings.defaultZoneName = 'local'
DateTime.local().zoneName                 //=> 'America/New_York'
```

