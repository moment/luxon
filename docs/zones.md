# Time zones and offsets

Luxon has support for time zones. This page explains how to use them.

## Don't worry!

You *usually* don't need to worry about time zones. Your code runs on a computer with a particular time zone and everything will work consistently in that zone without you doing anything. It's when you want to do complicated stuff *across* zones that you have to think about it. Even then, here are some pointers to help you avoid situations where you have to think carefully about time zones:

 1. Don't make servers think about *local* times. Configure them to use UTC and write your server's code to work in UTC. Times can often be thought of as a simple count of epoch milliseconds; what you would call that time (e.g. 9:30) in what zone doesn't (again, often) matter.
 2. Communicate times between systems in ISO 8601, like "2017-05-15T13:30:34Z" where possible (it doesn't matter if you use Z or some local offset; the point is that it precisely identifies the millisecond on the global timeline).
 3. Where possible, only think of time zones as a formatting concern; your application ideally never knows that the time it's working with is called "9:00" until it's being rendered to the user.
 4. Barring 3, do as much manipulation of the time (say, adding an hour to the current time) in the client code that's already running in the time zone where the results will matter.
 
All those things will make it less likely you ever need to work explicitly with time zones and may also save you plenty of other headaches. But those aren't possible for some applications; you might need to work with times in zones other than the one the program is running in, for any number of reasons. And that's where Luxon's time zone support comes in.

## Terminology

Bear with me here. Time zones are pain in the ass. Luxon has lots of tools to deal with them, but there's no getting around the fact that they're complicated. The terminology for time zones and offsets isn't well-established. But let's try to impose some order:

 1. An **offset** is a difference between the local time and the UTC time, such as +5 (hours) or -12:30. They may be expressed directly in minutes, or in hours, or in a combination of minutes and hours. Here we'll use hours.
 1. A **time zone** is a set of rules, associated with a geographical location, that determines the local offset from UTC at any given time. The best way to identify a zone is by its IANA string, such as "America/New_York". That zone says something to the effect of "The offset is -4, except between March and November, when it's -5".
 1. A **fixed-offset time zone** is any time zone that never changes offsets, such as UTC. Luxon supports fixed-offset zones directly; they're specified like UTC+7, which you can interpret as "always with an offset of +7".
 1. A **named offset** is a time zone-specific name for an offset, such as Eastern Daylight Time. It expresses both the zone (America's EST roughly implies America/New_York) and the current offset (EST means -4). They are also confusing in that they overspecify the offset (e.g. for any given time it is unnecessary to specify EST vs EDT; it's always whichever one is right). They are also ambiguous (BST is both British Summer Time and Bangladesh Standard Time), unstandardized, and internationalized (what would a Frenchman call the US's EST?). For all these reasons, you should avoid them when specifying times programmatically. Luxon only supports their use in formatting.
 
Some subtleties:

 1. Multiple zones can have the same offset (think about the US's zones and their Canadian equivalents), though they might not have the same offset all the time, depending on when their DSTs are. Thus zones and offsets have a  many-to-many relationship.
 1. Just because a time zone doesn't have a DST now doesn't mean it's fixed. Perhaps it had one in the past. Regardless, Luxon does not have first-class access to the list of rules, so it assumes any IANA-specified zone is not fixed and checks for its current offset programmatically.
 
If all this seems too terse, check out these articles. The terminology in them is subtly different but the concepts are the same:

 * [Time Zones Aren’t Offsets – Offsets Aren’t Time Zones](https://spin.atomicobject.com/2016/07/06/time-zones-offsets/)
 * [Stack Overflows timezone wiki page](https://stackoverflow.com/tags/timezone/info)

## Luxon works with time zones

Luxon's DateTime class supports zones directly. By default, a date created in Luxon is "in" the local time zone of the machine it's running on. By "in" we mean that the DateTime has, as one of its properties, an associated zone.

It's important to remember that a DateTime represents a specific instant in time and that instant has an unambiguous meaning independent of what time zone you're in; the zone is really piece of social metadata that affects how humans interact with the time, rather than a fact about the passing of time itself. Of course, Luxon is a library for humans, so that social metadata affects Luxon's behavior too. It just doesn't change *what time it is*.

Specifically, a DateTime's zone affects its behavior in these ways:

 1. Times will be formatted as they would be in that zone.
 1. Transformations to the DateTime (such as `plus` or `startOf`) will obey any DSTs in that zone that affect the calculation (see "Math across DSTs" below)
 
Generally speaking, Luxon does not support changing a DateTime's offset, just its zone. That allows it to enforce the behaviors in the list above. The offset for that DateTime is just whatever the zone says it is. If you are unconcerned with the effects above, then you can always give your DateTime a fixed-offset zone.

## Specifying a zone

Luxon's API methods that take a zone as an argument all let you specify the zone in a few ways.

| Type | Example | Description |
| --- | --- | --- |
| IANA | 'America/New_York' | that zone
| local | 'local' | the system's local zone
| UTC | 'utc' | Universal Coordinated Time
| fixed offset | 'UTC+7' | a fixed offset zone
| Zone | new YourZone() | A custom implementation of Luxon's Zone interface (advanced only)

### IANA support

IANA-specified zones are string identifiers like "America/New_York" or "Asia/Tokyo". Luxon gains direct support for them by abusing built-in Intl APIs. However, your environment may not support them, in which case, you can't fiddle with the zones directly. You can always use the local zone your system is in, UTC, and any fixed-offset zone like UTC+7. You can check if your runtime environment supports IANA zones with our handy utility:

```js
Info.features().zones; //=> true
```

If you're unsure if all your target environments (browser versions and Node versions) support this, check out the [Support Matrix](matrix.html). You can generally count on modern browsers to have this feature, except IE (it is supported in Edge). You may also [polyfill](matrix.html#zones) your environment.

If you specify a zone and your environment doesn't support that zone, you'll get an [invalid](validity.html) DateTime. That could be because the environment doesn't support zones at all, because for whatever reason it doesn't support that *particular* zone, or because the zone is just bogus. Like this:

```js
bogus = DateTime.local().setZone('America/Bogus')

bogus.isValid;         //=> false
bogus.invalidReason;   //=> 'unsupported zone'
```

## Creating DateTimes

### Local by default

By default, DateTime instances are created in the system's local zone and parsed strings are interpreted as specifying times in the system's local zone. For example, my computer is configured to use `America/New_York`, which has an offset of -4 in May:

```js
var local = DateTime.local(2017, 05, 15, 09, 10, 23);

local.zoneName;                //=> 'America/New_York'
local.toString();              //=> '2017-05-15T09:10:23.000-04:00'

var iso = DateTime.fromISO("2017-05-15T09:10:23");

iso.zoneName;                  //=> 'America/New_York'
iso.toString();                //=> '2017-05-15T09:10:23.000-04:00'
```

### Creating DateTimes in a zone

Many of Luxon's factory methods allow you to tell it specifically what zone to create the DateTime in:

```js
var overrideZone = DateTime.fromISO("2017-05-15T09:10:23", { zone: 'Europe/Paris' });

overrideZone.zoneName;         //=> 'Europe/Paris'
overrideZone.toString();       //=> '2017-05-15T09:10:23.000+02:00'
```

Note two things:

 1. The date and time specified in the string was interpreted as a Parisian local time (i.e. it's the time that corresponds to what would be called 9:10 *there*).
 2. The resulting DateTime object is in Europe/Paris.
 
Those are conceptually independent (i.e. Luxon could have converted the time to the local zone), but it practice it's more convenient for the same option to govern both.

In addition, one static method, `utc()`, specifically interprets the input as being specified in UTC. It also returns a DateTime in UTC:

```js
var utc = DateTime.utc(2017, 05, 15, 09, 10, 23);

utc.zoneName;                  //=> 'UTC'
utc.toString();                //=> '2017-05-15T09:10:23.000Z'
```

### Strings that specify an offset

Some input strings may specify an offset as part of the string itself. In these case, Luxon interprets the time as being specified with that offset, but converts the resulting DateTime into the system's local zone:

```js
var specifyOffset = DateTime.fromISO("2017-05-15T09:10:23-09:00");

specifyOffset.zoneName;         //=> 'America/New_York'
specifyOffset.toString();       //=> '2017-05-15T14:10:23.000-04:00'

var specifyZone = DateTime.fromFormat("2017-05-15T09:10:23 Europe/Paris", "yyyy-MM-dd'T'HH:mm:ss z");

specifyZone.zoneName           //=> 'America/New_York'
specifyZone.toString()         //=> '2017-05-15T03:10:23.000-04:00'
```

...unless a zone is specified as an option (see previous section), in which case the DateTime gets converted to *that* zone:

```js
var specifyOffsetAndOverrideZone = DateTime.fromISO("2017-05-15T09:10:23-09:00", { zone: 'Europe/Paris' });

specifyOffsetAndOverrideZone.zoneName;                 //=> 'Europe/Paris'
specifyOffsetAndOverrideZone.toString();               //=> '2017-05-15T20:10:23.000+02:00'
```

### setZone

Finally, some parsing functions allow you to "keep" the zone in the string as the DateTime's zone. Note that if only an offset is provided by the string, the zone will be a fixed-offset one, since Luxon doesn't know which zone is meant, even if you do.

```js
var keepOffset = DateTime.fromISO("2017-05-15T09:10:23-09:00", { setZone: true });

keepOffset.zoneName;           //=> 'UTC-9'
keepOffset.toString();         //=> '2017-05-15T09:10:23.000-09:00'

var keepZone = DateTime.fromFormat("2017-05-15T09:10:23 Europe/Paris", "yyyy-MM-dd'T'HH:mm:ss z", { setZone: true });

keepZone.zoneName;             //=> 'Europe/Paris'
keepZone.toString()            //=> '2017-05-15T09:10:23.000+02:00'
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


// but actually the same time
local.valueOf() === rezoned.valueOf(); //=> true
```

### keepLocalTime

Generally, it's best to think of the zone as a sort of metadata that you slide around independent of the underlying count of milliseconds. However, sometimes that's not what you want. Sometimes you want to change zones while keeping the local time fixed and instead altering the timestamp. Luxon supports this:

```js
var local = DateTime.local();
var rezoned = local.setZone('America/Los_Angeles', { keepLocalTime: true });

local.toString();      //=> '2017-09-13T18:36:23.187-04:00'
rezoned.toString();    //=> '2017-09-13T18:36:23.187-07:00'

local.valueOf() === rezoned.valueOf()  //=> false
```

If you find that confusing, I recommend just not using it. On the other hand, if you find yourself using this all the time, you are probably doing something wrong.

## Accessors

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

DateTime also has a `zone` property that holds a Luxon Zone object. You don't normally need to interact with it, but don't get it confused with the `zoneName`.

```js
dt.zone   //=> LocalZone {}
```

## DST weirdness

Because our ancestors were morons, they opted for a system wherein many governments shift around the local time twice a year for no good reason. And it's not like they do it in a neat, coordinated fashion. No, they do it whimsically, varying the shifts' timing from country to country (or region to region!) and from year to year. And of course, they do it the opposite way south of the Equator. This all a tremendous waste of everyone's energy and, er, time, but it is how the world works and a date and a time library has to deal with it.

Most of the time, DST shifts will happen without you having to do anything about it and everything will just work. Luxon goes to some pains to make DSTs as unweird as possible. But there are exceptions. This section covers them.

### Invalid times

Some local times simply don't exist. The Spring Forward DST shift involves shifting the local time forward by (usually) one hour. In my zone, `America/New_York`, on March 12, 2017 the millisecond after 1:59:59.999 is 3:00:00.000. Thus the times between 2:00:00.000 and 2:59:59.000, inclusive, don't exist in that zone. But of course, nothing stops a user from constructing a DateTime out of that local time.

If you create such a DateTime from scratch, the missing time will be advanced by an hour:


```js
DateTime.local(2017, 3, 12, 2, 30).toString(); //=> '2017-03-12T03:30:00.000-04:00'
```

You can also do date math that lands you in the middle of the shift. These also push forward:

```js
DateTime.local(2017, 3, 11, 2, 30).plus({days: 1}).toString()         //=> '2017-03-12T03:30:00.000-04:00'
DateTime.local(2017, 3, 13, 2, 30).minus({days: 1}).toString()        //=> '2017-03-12T03:30:00.000-04:00'
```

### Ambiguous times

Harder to handle are ambiguous times. During Fall Back, some local times happen twice. In my zone, `America/New_York`, on November 5, 2017 the millisecond after 1:59:59.000 became 1:00:00.000. But of course there was already a 1:00 that day, one hour before before this one. So if you create a DateTime with a local time of 1:30, which time do you mean? It's an important question, because they correspond to different moments in time.

However, Luxon's behavior here is undefined. It makes no promises about which of the two possible timestamps the instance will represent. Currently, its specific behavior is like this:

```js
DateTime.local(2017, 11, 5, 1, 30).offset / 60                   //=> -4
DateTime.local(2017, 11, 4, 1, 30).plus({days: 1}).offset / 60   //=> -4
DateTime.local(2017, 11, 6, 1, 30).minus({days: 1}).offset / 60  //=> -5
```

In other words, sometimes it picks one and sometimes the other. Luxon doesn't guarantee the specific behavior above. That's just what it happens to do.

If you're curious, this lack of definition is because Luxon doesn't actually know that any particular DateTime is an ambiguous time. It doesn't know the time zones rules at all. It just knows the local time does not contradict the offset and leaves it at that. To find out the time is ambiguous and define exact rules for how to resolve it, Luxon would have to test nearby times to see if it can find duplicate local time, and it would have to do that on every creation of a DateTime, regardless of whether it was anywhere near a real DST shift. Because that's onerous, Luxon doesn't bother.

### Math across DSTs

There's a whole [section](math.html) about date and time math, but it's worth highlighting one thing here: when Luxon does math across DSTs, it adjusts for them when working with higher-order, variable-length units like days, weeks, months, and years. When working with lower-order, exact units like hours, minutes, and seconds, it does not. For example, DSTs mean that days are not always the same length: one day a year is (usually) 23 hours long and another is 25 hours long. Luxon makes sure that adding days takes that into account. On the other hand, an hour is always 3,600,000 milliseconds.

An easy way to think of it is that if you add a day to a DateTime, you should always get the same time the next day, regardless of any intervening DSTs. On the other hand, adding 24 hours will result in DateTime that is 24 hours later, which may or may not be the same time the next day. In this example, my zone is `America/New_York`, which had a Spring Forward DST in the early hours of March 12.


```js
var start = DateTime.local(2017, 3, 11, 10);
start.hour                          //=> 10, just for comparison
start.plus({days: 1}).hour          //=> 10, stayed the same
start.plus({hours: 24}).hour        //=> 11, DST pushed forward an hour
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
