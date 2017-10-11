# Math

This covers some oddball topics with date and time math, which has some quirky corner cases. This page tries document those corners.

## Calendar math vs time math

### The basics

Math with dates and times can be unintuitive to programmers. If it's Feb 13, 2017 and I say "in exactly one month", you know I mean March 13. Exactly one month after than is April 13. But because February is a shorter month than March, that means we added a different amount of time in each case. On the other hand, if I said "30 days from February 13", you'd try to figure out what day that landed on in March. Here it is in Luxon:

```js
DateTime.local(2017, 2, 13).plus({months: 1}).toISODate() //=> '2017-03-13'

DateTime.local(2017, 2, 13).plus({days: 30}).toISODate() //=> '2017-03-15'
```

More generally we can differentiate two modes of math:

 * Calendar math works with higher-order, variable-length units like years and months
 * Time math works with lower-order, constant-length units such as hours, minutes, and seconds.

### Which units use which math?

These units use calendar math:

 * **Years** vary because of leap years.
 * **Months** vary because they're just different lengths.
 * **Days** vary because DST transitions mean some days are 23 or 25 hours long.
 * **Weeks** are always the same number of days, but days vary so weeks do too.
 
These units use time math:

 * **Hours** are always 60 minutes
 * **Minutes** are always 60 seconds
 * **Seconds** are always 1000 milliseconds

Don't worry about leap seconds. Javascript and most other programming environments don't account for them; they just happen as abrupt, invisible changes to the underlying system's time.

### How to think about calendar math

It's best not to think of calendar math as requiring arcane checks for what variability is required. Instead, think of them as **adjusting that unit directly and keeping lower order date components constant**. Let's go back to the Feb 13 + 1 month example. If you didn't have Luxon, you would do something like this to accomplish that:

```js
var d = new Date('2017-02-13')
d.setMonth(d.getMonth() + 1)
d.toLocaleString() //=> '3/13/2017, 12:00:00 AM'
```

And under the covers, that's more or less what Luxon does too. It doesn't boil the operation down to a milliseconds delta because that's not what's being asked. Instead, it fiddles with what it thinks the date should be and then uses the built-in Gregorian calendar to compute the new timestamp.

### DSTs

There's a whole section about this in the [time zones documentation](usage/zones#math-across-dsts). But here's a quick example (Spring Forward is early on March 12 in my time zone):

```
var start = DateTime.local(2017, 3, 11, 10);
start.hour                          //=> 10, just for comparison
start.plus({days: 1}).hour          //=> 10, stayed the same
start.plus({hours: 24}).hour        //=> 11, DST pushed forward an hour
```

So in adding a day, we kept the hour at 10, even though that's only 23 hours later.

### Time math

Time math is different. In time math, we're just adjusting the clock, adding or subtracting from the epoch timestamp. Adding 63 hours is really the same as adding 63 hours' worth of milliseconds. Under the covers, Luxon does this exactly the opposite of how it does calendar math; it boils the operation down to milliseconds, computes the new timestamp, and then computes the date out of that.

## Math with multiple units

Of course, maybe you want to do math with multiple units:

```js
DateTime.fromISO('2017-05-15').plus({months: 2, days: 6}).toISODate(); //=> '2017-07-21'
```

This isn't as simple as it looks. For example, but should you expect this to do?

```js
DateTime.fromISO('2017-04-30').plus({months: 1, days: 1}).toISODate() //=> '2017-05-31'
```

If the day is added first, we'll get an intermediate value of May 1. Adding a month to that gives us June 1. But if the month is added first, we'll an intermediate May 30 and day after that is May 31. (See "Calendar math vs time math above if this is confusing.) So the order matters.

Luxon has a simple rule for this: **math is done from highest order to lowest order**. So the result of the example above is May 31. This rule isn't logically necessary, but it does seem reflect what people mean. Of course, Luxon can't enforce this rule if you do the math in separate operations:

```js
DateTime.fromISO('2017-04-30').plus({days: 1}).plus({months: 1}).toISODate() //=> '2017-06-01'
```

It's not a coincidence that Luxon's interface makes it awkward to do this wrong.

## Duration math

### Basics

[Durations](../class/src/duration.js~Duration.html) are quantities of time, like "3 days and 6 hours". They are completely unmoored from the timeline, it has no idea *which* 3 days and 6 hours they represent; it's just how Luxon represents those quantities in abstract. This is both tremendously useful and occasionally confusing. I'm not going to give a detailed tour of their capabilities here (see the API docs for that), but I do want to clear up some of those confusions.

Here's some very basic stuff to get us going anyway:

```js
var dur = Duration.fromObject({ days: 3, hours: 6})

// examine it
dur.toObject()          //=> { days: 3, hours: 6 }

// express in minutes
dur.as('minutes')       //=> 4680

// convert to minutes
dur.shiftTo('minutes').toObject() //=> { minutes: 4680 }

// add to a DateTime
DateTime.fromISO("2017-05-15").plus(dur).toISO() //=> '2017-05-18T06:00:00.000-04:00'
```

### Diffs

You can subtract one time from another to find out how much time there is between them. Luxon's [diff](../class/src/datetime.js~DateTime.html#instance-method-diff) method does this and it returns a Duration. For example:

```js
var end = DateTime.fromISO('2017-03-13');
var start = DateTime.fromISO('2017-02-13');

var diffInMonths = end.diff(start, 'months');
diffInMonths.toObject(); //=> { months: 1 }
```

Notice we had to pick the unit to keep track of the diff in. The default is milliseconds:

```js
var diff = end.diff(start);
diff.toObject() //=> { milliseconds: 2415600000 }
```

Finally, you can diff using multiple units:

```js
var end = DateTime.fromISO('2017-03-13');
var start = DateTime.fromISO('2017-02-15');
end.diff(start, ['months', 'days']) //=> { months: 1, days: 2 }
```

### Casual vs longterm conversion accuracy

Durations represent bundles of time with specific units, but Luxon allows you to convert between them:

 * `shiftTo` returns a new Duration denominated in the specified units.
 * `as` converts the duration to just that unit and returns its value

```js
var dur = Duration.fromObject({ months: 4, weeks: 2, days: 6 })

dur.as('days')                            //=> 140
dur.shiftTo('days').toObject()            //=> { days: 140 }
dur.shiftTo('weeks', 'hours').toObject()  //=> { weeks: 18, hours: 144 }
```

But how do those conversions actually work? First, uncontroversially:

 * 1 week = 7 days
 * 1 day = 24 hours
 * 1 hour = 60 minutes
 * 1 minute = 60 seconds
 * 1 second = 1000 milliseconds
 
These are always true and you can roll them up and down with consistency (e.g. `1 hour = 60 * 60 * 1000 milliseconds`). However, this isn't really true for the higher order units, which vary in length, even putting DSTs aside. A year is sometimes 365 days long and sometimes 366. Months are 28, 29, 30, or 31 days. By default Luxon converts between these units using what you might call "casual" conversions:

|         |  Month | Week | Day |
| ---     |  ---   | ---  | --- |
| Year    |     12 |  365 | 365 |
| Month   |        |   30 |   4 |

These should match your intuition and for most purposes they work well. But they're not just wrong; they're not even self-consistent:

```js
dur.shiftTo('months').shiftTo('days').as('years') //=> 0.9863013698630136
```

This is because 12 * 30 != 365. These errors can be annoying, but they can also cause significant issues if the errors accumulate:

```js
var dur = Duration.fromObject({ years: 50000 });
DateTime.local().plus(dur.shiftTo('milliseconds')).year //=> 51984
DateTime.local().plus(dur).year                         //=> 52017
```

Those are 33 years apart! So Luxon offers an alternative conversion scheme, based on the 400-year calendar cycle:

|         |  Month | Week       | Day       |
| ---     |  ---   | ---        | ---       |
| Year    |     12 |  52.1775   | 365.2425  |
| Month   |        |  30.436875 |  4.348125 |

You can see why these are irritating to work with, which is why they're not the default.

Luxon methods that create Durations de novo accept an option called `conversionAccuracy` You can set it 'casual' or 'longterm'. It's a property of the Duration itself, so any conversions you do use the rule you've picked, and any new Durations you derive from it will retain that property.

```js
Duration.fromObject({ years: 23, conversionAccuracy: 'longterm' });
Duration.parse('PY23', { conversionAccuracy: 'longterm' });

end.diff(start, { conversionAccuracy: 'longterm' })
```

You can also create an accurate Duration out of an existing one:

```js
var pedanticDuration = casualDuration.reconfigure({conversionAccuracy: 'longterm' });
```

These Durations will do their conversions differently.


### Losing information

Be careful of converting between units. It's easy to lose information. Let's say we converted a diff into days:


```js
var end = DateTime.fromISO('2017-03-13');
var start = DateTime.fromISO('2017-02-13');
diffInMonths.as('days'); //=> 30
```

That's our conversion between months and days (you could also do a long-term-accurate conversion; it wouldn't fix the issue ahead). But this isn't the number of days between February 15 and March 15!

```
var diffInDays = end.diff(start, 'days');
diffInDays.toObject(); //=> { days: 28 }
```

It's important to remember that diffs are Duration objects, and a Duration is just a dumb pile of time units that got spat out by our computation. Unlike an Interval, a Duration doesn't "remember" what the inputs to the diff were. So we lost some information converting between units. This mistake is really common when rolling up:


```js
var diff = end.diff(start) //default unit is milliseconds

// wtf, that's not a month!
diff.as('months'); //=> 0.9319444 

// it's not even the right number of days! (hint: my time zone has a DST)
diff.shiftTo('hours').as('days'); //=> 27.958333333333332
```

Normally you won't run into this problem if you think clearly about what you want to do with a diff. But sometimes you really do want an object that represents the subtraction itself, not the result. [Intervals](../class/src/interval.js~Interval.html) can help. Intervals are mostly use to keep track of ranges of time, but they make for "anchored" diffs too. For example:

```js
var end = DateTime.fromISO('2017-03-13');
var start = DateTime.fromISO('2017-02-13');
var i = Interval.fromDateTimes(start, end);

i.length('days');       //=> 28
i.length('months')      //=> 1
```

Because the Interval stores its endpoints and computes `length` on the fly, it retakes the diff each time you query it. Of course, precisely because an Interval *isn't* an abstract bundle of time, it can't be used in places where diffs can. For example, you can add them to DateTime via `plus()` because Luxon wouldn't know what units to do the math in (see "Calendar vs time math" above). But you can convert the interval into a Duration by picking the units:

```js
i.toDuration('months').toObject(); //=> { months: 1 }
i.toDuration('days').toObject(); //=> { days: 28 }
```

You can even pick multiple units:

```js
end = DateTime.fromISO('2018-05-25');
i = start.until(end);
i.toDuration(['years', 'months', 'days']).toObject(); //=> { years: 1, months: 3, days: 12 }
```
