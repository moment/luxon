# Errors

Sometimes Luxon throws errors. Here's a rundown on when and why.

## InvalidUnitError

## UnitOutOfRangeError

## InvalidZoneError

## MissingPlatformFeatureError

## ConflictingSpecificationError

## InvalidArgumentError

The most important error is the `InvalidDateTime` error. One of the most irritating aspects of programming with time is that it's possible to end up with invalid dates. This is a bit subtle: barring integer overflows, there's no count of milliseconds that don't correspond to a valid DateTime, but when working with calendar units, it's pretty easy to say something like "June 400th". Luxon considers that invalid and will throw an error.

```js
> var dt = DateTime.fromObject({ month: 6, day: 400 }); // throws!
```

Some examples:

- February 40th
- 28:00
- -4 pm
- etc

But there are other ways to do it:

```js
// specify a time zone that doesn't exist
DateTime.local().setZone("America/Blorp"); // throws

// provide contradictory information (here, this date is not a Wedensday)
DateTime.fromObject({ year: 2017, month: 5, day: 25, weekday: 3 }).; // throws
```

The structure of error is like so:

````js
{
  reason: "invalid zone" // this reason
}
````

##InvalidArgumentError

Sometimes Luxon decides that the problem isn't so much the data being wrong, but that the programmer misunderstood the interface. For that, Luxon throws an `InvalidArgumentError`.


```js
DateTime.local().set({ blorp: 7 }); //=> kerplosion
````

## Debugging invalid DateTimes

Because DateTimes fail silently, they can be a pain to debug. Luxon has some features that can help.

### invalidReason and invalidExplanation

Invalid DateTime objects are happy to tell you why they're invalid. `invalidReason` will give you a consistent error code you can use, whereas `invalidExplanation` will spell it out

```js
var dt = DateTime.local().setZone("America/Blorp");
dt.invalidReason; //=>  'unsupported zone'
dt.invalidExplanation; //=> 'the zone "America/Blorp" is not supported'
```

### throwOnInvalid

You can make Luxon throw whenever it creates an invalid DateTime. The message will combine `invalidReason` and `invalidExplanation`:

```js
Settings.throwOnInvalid = true;
DateTime.local().setZone("America/Blorp"); //=> Error: Invalid DateTime: unsupported zone: the zone "America/Blorp" is not supported
```

You can of course leave this on in production too, but be sure to try/catch it appropriately.

## Invalid Durations

Durations can be invalid too. The easiest way to get one is to diff an invalid DateTime.

```js
DateTime.local(2017, 28).diffNow().isValid; //=> false
```

## Invalid Intervals

Intervals can be invalid. This can happen a few different ways:

- The end time is before the start time
- It was created from invalid DateTime or Duration
