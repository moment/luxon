# Support matrix

Luxon uses a slew of new browser Intl capabilities to tackle some of the tricker parts of dates and times. This means that not everything works in every environment.

## What works everywhere

Fortunately, most of Luxon works in anything remotely recent. A non-exhaustive list:

 * Create DateTime instances in the local or UTC time zones
 * Parse and output known formats
 * Parse and output using ad-hoc English formats
 * All the transformations like `plus` and `minus`
 * All of `Duration` and `Interval`

## New capabilities and how they're used

Here are the areas that need help from newish browser capabilities:

 * **Basic internationalization**. Luxon doesn't have internationalized strings in its code; instead it relies on the hosts implementation of the Intl API. This includes the very handy [toLocaleString](../class/src/datetime.js~DateTime.html#instance-method-toLocaleString).
 * **Internationalized tokens**. Listing the months or weekdays of a locale and outputting or parsing ad-hoc formats in non-English locales requires that Luxon be able to programmatically introspect the results of an Intl call. It does this using Intl's [formatToParts](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/formatToParts) method, which is relatively recent. So you could have the Intl API without having that.
 * Zones. Luxon's support of IANA zones works by abusing the Intl API. That means you have to have that API and that the API must support a reasonable list of time zones. Zones are in some platforms a recent addition

You can check whether your environment supports these capabilities using Luxon's `Info` class:

```js
Info.features() //=> { intl: true, intlTokens: true, zones: true }
```

## The matrix

Here's the level of support for these features in different environments:

| Area        | Chrome | FF  | IE   | Edge | Safari | Node          |
| ---         | ---    | --- | ---  | ---  | ----   | ---           |
| Intl        | 24+    | 29+ | 11+  | 12+  | 10+    |  0.11_ w/ICU† |
| Intl tokens | 56+    | 51+ | None | 15+‡ | 11+    |  8+ w/ICU     |
| Zones       | 24+†   | 52+ | None | 15+‡ | 10+    |  6+           |

† This is an educated guess. I haven't tested this or found a definitive reference.

‡ Earlier versions may also support this, but I haven't been able to test them.

Notes:
 * "w/ICU" refers to providing Node with ICU data. See [here](https://github.com/nodejs/node/wiki/Intl) for more info
 * Safari 11 is still in tech preview as of Sept 2017
 * IE is terrible and it's weird that anyone uses it

## What happens if a feature isn't supported?

You shouldn't use features of Luxon on projects that might be run on environments that don't support those features. Luxon tries to degrade gracefully if you don't, though.

[todo: outline the behavior here, with reference to https://github.com/icambron/luxon/issues/23]

## Polyfills

There are a couple of different polyfills available.

### Intl

To backfill the Intl and Intl tokens, there's the [Intl polyfill](https://github.com/andyearnshaw/Intl.js/). Use it if your environment doesn't have Intl support or if it has Intl but not `formatToParts`. Note that this fill comes with its own strings; there's no way to, say, just add the `formatToParts` piece. Also note that the data isn't as complete as some of the browsers' and some more obscure parsing/formatting features in Luxon don't work very well with it. Finally, note that it does not add zone capabilities.

### Zones

If you have an Intl API (either natively or through the Intl polyfill above) but no zone support, you can add it via the very nice [DateTime format pollyfill](https://github.com/yahoo/date-time-format-timezone).
