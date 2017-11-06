# Support matrix

Luxon uses a slew of new browser Intl capabilities to tackle some of the tricker parts of dates and times. This means that not everything works in every environment, especially things concerning explicit use of time zones and internationalization.

## What works everywhere

Fortunately, most of Luxon works in anything remotely recent. A non-exhaustive list:

 * Create DateTime instances in the local or UTC time zones
 * Parse and output known formats
 * Parse and output using ad-hoc English formats
 * All the transformations like `plus` and `minus`
 * All of `Duration` and `Interval`

## New capabilities and how they're used

Here are the areas that need help from newish browser capabilities:

 1. **Basic internationalization**. Luxon doesn't have internationalized strings in its code; instead it relies on the hosts implementation of the Intl API. This includes the very handy [toLocaleString](../class/src/datetime.js~DateTime.html#instance-method-toLocaleString). Most browsers and recent versions of Node support this.
 1. **Internationalized tokens**. Listing the months or weekdays of a locale and outputting or parsing ad-hoc formats in non-English locales requires that Luxon be able to programmatically introspect the results of an Intl call. It does this using Intl's [formatToParts](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/formatToParts) method, which is a relatively recent addition in most browsers. So you could have the Intl API without having that.
 1. **Zones**. Luxon's support of IANA zones works by abusing the Intl API. That means you have to have that API and that the API must support a reasonable list of time zones. Zones are a recent addition to some platforms.

You can check whether your environment supports these capabilities using Luxon's `Info` class:

```js
Info.features() //=> { intl: true, intlTokens: true, zones: true }
```

## The matrix

Here's the level of support for these features in different environments:

| Area        | Chrome | FF | IE   | Edge | Safari | Node        |
|-------------|--------|----|------|------|--------|-------------|
| Intl        |     24 | 29 | 11   |   12 |     10 | 0.11 w/ICU† |
| Intl tokens |     55 | 51 | None |   15 |     11 | 8 w/ICU     |
| Zones       |    24† | 52 | None |  15‡ |     10 | 6           |

† This is an educated guess. I haven't tested this or found a definitive reference.

‡ Earlier versions may also support this, but I haven't been able to test them.

Notes:
 * "w/ICU" refers to providing Node with ICU data. See [here](https://github.com/nodejs/node/wiki/Intl) for more info
 * Safari 11 is still in tech preview as of Sept 2017
 * IE is terrible and it's weird that anyone uses it
 
Here is the matrix pivoted, with some basic assumptions like "no one runs really old versions of Chrome":

| Browser      | Versions | Intl | Intl tokens | Zones |
|--------------+----------+------+-------------+-------|
| Chrome       | >= 56    | ✓    | ✓           | ✓     |
|              | < 56     | ✓    | ✕           | ✓     |
| FF           | >= 52    | ✓    | ✓           | ✓     |
|              | 51       | ✓    | ✓           | ✕     |
|              | < 51     | ✓    | ✕           | ✕     |
| Edge         | >= 15    | ✓    | ✓           | ✓     |
|              | < 15     | ✓    | ✕           | ✕     |
| IE           | >= 11    | ✓    | ✕           | ✕     |
|              | < 11     | ✕    | ✕           | ✕     |
| Safari       | >= 11    | ✓    | ✓           | ✓     |
|              | 10       | ✓    | ✕           | ✕     |
| Node w/ICU   | 8        | ✓    | ✓           | ✓     |
|              | >= 6     | ✓    | ✕           | ✓     |
|              | < 6      | ✓    | ✕           | ✓     |
| Node w/o ICU | >= 6     | ✕    | ✕           | ✓     |
|              | < 6      | ✓    | ✕           | ✕     |

## What happens if a feature isn't supported?

You shouldn't use features of Luxon on projects that might be run on environments that don't support those features. Luxon tries to degrade gracefully if you don't, though. Specifically, Luxon hardcodes the set of English strings it needs, and falls back to them if it needs them. Here's a (possibly incomplete) list of Luxon features affected by platform features without universal support:

| Feature                              | Full support | No Intl at all                              | Intl but no formatToParts                          | No IANA zone support |
|--------------------------------------|--------------|---------------------------------------------|----------------------------------------------------|----------------------|
| Most things                          | OK           | OK                                          | OK                                                 | OK                   |
| Using explicit time zones            | OK           | Invalid DateTime                            | OK                                                 | Invalid DateTime     |
| `DateTime#toLocaleString`            | OK           | Uses English with caveats†                  | OK                                                 | OK                   |
| `DateTime#toLocaleParts`             | OK           | Empty array                                 | Empty array                                        | OK                   |
| `DateTime#toFormat` in en-US         | OK           | OK                                          | OK                                                 | OK                   |
| `DateTime#toFormat` in other locales | OK           | Uses English                                | Uses English if format contains localized strings‡ | OK                   |
| `DateTime#fromString` in en-US       | OK           | OK                                          | OK                                                 | OK                   |
| `DateTime#offsetNameShort`, etc      | OK           | Returns null                                | OK in most locales§                                |                      |
| `fromString` in other locales        | OK           | Invalid DateTime if uses localized strings‡ | Uses English if format contains localized strings‡ | OK                   |
| `Info.months`, etc in en-US          | OK           | OK                                          | OK                                                 | OK                   |
| `Info.months`, etc in other locales  | OK           | Uses English                                | Uses English                                       | OK                   |

† Specifically, the caveat here is that this English fallback only works as you might expect for Luxon-provided preset arguments, like `DateTime.DATETIME_MED`. It won't work if you provide your own, modify for the presets, or even clone them, it will use `DateTime.DATETIME_HUGE`. If you don't provide any arguments at all, it defaults to `DateTime.DATE_SHORT`.

‡ This means that Luxon can't parse anything with a word in it like localized versions of "January" or "Tuesday". It's fine with numbers, as long as their in Latin (i.e. Western) numbers.

§ This fallback uses a hack that is not guaranteed to work in every locale in every browser. It's worked where I tested it, though. It will fall back to returning null if it fails.

## Polyfills

There are a couple of different polyfills available.

### Intl

To backfill the Intl and Intl tokens, there's the [Intl polyfill](https://github.com/andyearnshaw/Intl.js/). Use it if your environment doesn't have Intl support or if it has Intl but not `formatToParts`. Note that this fill comes with its own strings; there's no way to, say, just add the `formatToParts` piece. Also note that the data isn't as complete as some of the browsers' and some more obscure parsing/formatting features in Luxon don't work very well with it. Finally, note that it does not add zone capabilities.

### Zones

If you have an Intl API (either natively or through the Intl polyfill above) but no zone support, you can add it via the very nice [DateTime format pollyfill](https://github.com/yahoo/date-time-format-timezone).
