# Calendars

This covers Luxon's support for various calendar systems. If you don't need to use non-standard calendars, you don't need to read any of this.

## Fully supported calendars

Luxon has full support for Gregorian and ISO Week calendars. What I mean by that is that Luxon can parse dates specified in those calendars, format dates into strings using those calendars, and transform dates using the units of those calendars. For example, here is Luxon working directly with an ISO calendar:

```js
DateTime.fromISO('2017-W23-3').plus({ weeks: 1, days: 2 }).toISOWeekDate(); //=>  '2017-W24-5'
```

The main reason I bring all this is up is to contrast it with the capabilities for other calendars described below.

## Output calendars

Luxon has limited support for other calendaring systems. Which calendars are supported at all is a platform-dependent, but can generally be expected to be these: Buddhist, Chinese, Coptic, Ethioaa, Ethiopic, Hebrew, Indian, Islamic, Islamicc, Japanese, Persian, and ROC. **Support is limited to formatting strings with them**, hence the qualified name "output calendar".

In practice this is pretty useful; you can show users the date in their preferred calendaring system while the software works with dates using Gregorian units or Epoch milliseconds. But the limitations are real enough; Luxon doesn't know how to do things like "add one Islamic month".

The output calendar is a property of the DateTime itself. For example:

```js
var dtHebrew = DateTime.now().reconfigure({ outputCalendar: "hebrew" });
dtHebrew.outputCalendar; //=> 'hebrew'
dtHebrew.toLocaleString() //=> '4 Tishri 5778'
```

You can modulate the structure of that string with arguments to `toLocaleString` (see [the docs on that](formatting.md?id=tolocalestring-strings-for-humans)), but the point here is just that you got the alternative calendar.

### Generally supported calendars

Here's a table of the different calendars with examples generated formatting the same date generated like this:

```js
DateTime.fromObject({ outputCalendar: c }).toLocaleString(DateTime.DATE_FULL);
```

| Calendar | Example                  |
| ---      | ---                      |
| buddhist | September 24, 2560 BE    |
| chinese  | Eighth Month 5, 2017     |
| coptic   | Tout 14, 1734 ERA1       |
| ethioaa  | Meskerem 14, 7510 ERA0   |
| ethiopic | Meskerem 14, 2010 ERA1   |
| hebrew   | 4 Tishri 5778            |
| indian   | Asvina 2, 1939 Saka      |
| islamic  | Muharram 4, 1439 AH      |
| islamicc | Muharram 3, 1439 AH      |
| japanese | September 24, 29 Heisei  |
| persian  | Mehr 2, 1396 AP          |
| roc      | September 24, 106 Minguo |


### Default output calendar

You can set the default output calendar for new DateTime instances like this:

```js
Settings.defaultOutputCalendar = 'persian';
```
