# Validity

## Invalid DateTimes

One of the most irritating aspects of programming with time is that it's possible to end up with invalid dates. This is a bit subtle: barring integer overflows, there's no count of milliseconds that don't correspond to a valid DateTime, but when working with calendar units, it's pretty easy to say something like "June 400th". Luxon considers that invalid and will mark it accordingly.

Unless if you've asked Luxon to throw an exception when it creates an invalid DateTime (see more on that below), it will fail silently, creating an instance that doesn't know how to do anything. You can check validity with `isValid`:

```js
> var dt = DateTime.fromObject({ month: 6, day: 400 });
dt.isValid //=> false
```

All of the methods or getters that return primitives return degenerate ones:

```js
dt.year; //=>  NaN
dt.toString(); //=> 'Invalid DateTime'
dt.toObject(); //=> {}
```

Methods that return other Luxon objects will return invalid ones:

```js
dt.plus({ days: 4 }).isValid; //=> false
```

## Reasons a DateTimes can be invalid

The most common way to do that is to over or underflow some unit:

 * February 40th
 * 28:00
 * -4 pm
 * etc
 
But there are other ways to do it:

```js
// specify a time zone that doesn't exist
DateTime.local().setZone('America/Blorp').isValid //=> false

// provide contradictory information (here, this date is not a Wedensday)
DateTime.fromObject({ year: 2017, month: 5, day: 25, weekday: 3}).isValid //=> false
```

Note that some other kinds of mistakes throw, based on our judgment that they are more likely programmer errors than data issues:

```js
DateTime.local().set({ blorp: 7 }); //=> kerplosion
```

## Debugging invalid DateTimes

Because DateTimes fail silently, they can be a pain to debug. There are two features that can help.

### invalidReason

Invalid DateTime objects are happy to tell you why they're invalid. Like this:

```js
DateTime.local().setZone('America/Blorp').invalidReason; //=>  'unsupported zone'
```

### throwOnInvalid

You can make Luxon throw whenever it creates an invalid DateTime.

```js
Settings.throwOnInvalid = true
DateTime.local().setZone('America/Blorp'); // Error: Invalid DateTime: unsupported zone
```

You can of course leave this on in production too, but be sure to try/catch it appropriately.

## Invalid Durations

Durations can be invalid too. The easiest way to get one is to diff an invalid DateTime. 

```js
DateTime.local(2017, 28).diffNow().isValid //=> false
```

## Invalid Intervals

Intervals can be invalid. This can happen a few different ways:

 * The end time is before the start time
 * It was created from invalid DateTime or Duration
