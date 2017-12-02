# Support matrix

This page covers what platforms are supported by Luxon and what caveats apply to them.

## Official support

Luxon officially supports the last two versions of the major browsers, with some caveats.


| Browser      | Versions | Caveats                                                           |
|--------------|----------|-------------------------------------------------------------------|
| Chrome       |    >= 61 |                                                                   |
| FF           |    >= 56 |                                                                   |
| Edge         |    >= 15 |                                                                   |
| IE           |    >= 10 | needs platform polyfills, no basic intl, no intl tokens, no zones |
| Safari       |       11 |                                                                   |
|              |       10 | no intl tokens, no zones                                          |
| Node w/ICU   |        8 |                                                                   |
|              |        6 | no zones                                                          |
| Node w/o ICU |        8 | no intl tokens                                                    |
|              |        6 | no intl tokens, no zones                                          |


 * Those caveats are explained in the next sections.
 * "w/ICU" refers to providing Node with ICU data. See [here](https://github.com/nodejs/node/wiki/Intl) for more info.

## Internet Explorer

If you're supporting IE 10 or 11, you need some polyfills just to make Luxon work at all. You have two options: use a polyfilled build or apply the polyfills yourself.

The polyfilled builds of Luxon are here:

* [Download full polyfilled](../../global-filled/luxon.js)
* [Download minified polyfilled](../../global-filled/luxon.min.js)

These polyfilled builds don't add intl support, just the basic JS features you need to run Luxon (i.e. the caveats and additional polyfill options in the "Platform Caveats" still apply).

To polyfill it yourself, use polyfill.io:

```html
<script src="https://cdn.polyfill.io/v2/polyfill.min.js"></script>
```

This will also add basic intl and intl token support. So the only caveat remaining is the lack of zone support.

## Platform caveats

**If the platforms you're targeting don't have caveats listed above, ignore this section**.

In the support table above, you can see that some platforms have caveats. They affect a subset of Luxon's features that depend on specific APIs that some older browsers don't support.

 1. **Basic internationalization**. Luxon doesn't have internationalized strings in its code; instead it relies on the hosts implementation of the Intl API. This includes the very handy [toLocaleString](../class/src/datetime.js~DateTime.html#instance-method-toLocaleString). Most browsers and recent versions of Node support this.
 1. **Internationalized tokens**. Listing the months or weekdays of a locale and outputting or parsing ad-hoc formats in non-English locales requires that Luxon be able to programmatically introspect the results of an Intl call. It does this using Intl's [formatToParts](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/formatToParts) method, which is a relatively recent addition in most browsers. So you could have the Intl API without having that.
 1. **Zones**. Luxon's support of IANA zones works by abusing the Intl API. That means you have to have that API and that the API must support a reasonable list of time zones. Zones are a recent addition to some platforms.
 
 If the browser lacks these capabilities, Luxon tries its best:

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

† Specifically, the caveat here is that this English fallback only works as you might expect for Luxon-provided preset arguments, like `DateTime.DATETIME_MED`. If you provide your own, modify for the presets, or even clone them, it will use `DateTime.DATETIME_HUGE`. If you don't provide any arguments at all, it defaults to `DateTime.DATE_SHORT`.

‡ This means that Luxon can't parse anything with a word in it like localized versions of "January" or "Tuesday". It's fine with numbers, as long as their in Latin (i.e. Western) numbers.

§ This fallback uses a hack that is not guaranteed to work in every locale in every browser. It's worked where I tested it, though. It will fall back to returning null if it fails.

## Polyfills

### Intl and Intl tokens

To backfill the Intl and Intl tokens, there's the [Intl polyfill](https://github.com/andyearnshaw/Intl.js/). Use it if your environment doesn't have Intl support or if it has Intl but not `formatToParts`. Note that this fill comes with its own strings; there's no way to, say, just add the `formatToParts` piece. Also note that the data isn't as complete as some of the browsers' and some more obscure parsing/formatting features in Luxon don't work very well with it. Finally, note that it does not add zone capabilities.

The easiest way to add this is through polyfill.io:

```html
<script src="https://cdn.polyfill.io/v2/polyfill.js?features=intl">
```

### Zones

If you have an Intl API (either natively or through the Intl polyfill above) but no zone support, you can add it via the very nice [DateTime format pollyfill](https://github.com/yahoo/date-time-format-timezone).

## Older platforms

 * **Older versions of both Chrome and Firefox** will most likely work. It's just that I only officially support the last two versions. As you get to older versions of these browsers, the caveats listed above begin to apply to them. (e.g. FF started supporting `formatToParts` in 51 and time zones in 52). I haven't broken that out because it's complicated, Luxon doesn't officially support them, and no one runs them anyway.
 * **Older versions of IE** probably won't work at all.
 * **Older versions of Node** probably won't work without recompiling the source code with a different Node target. In which case they'll work with some of the caveats.

## Other platforms

If the platform you're targeting isn't on the list and you're unsure what caveats apply, you can check which pieces are supported:

```js
Info.features() //=> { intl: true, intlTokens: true, zones: true }
```

Specific notes on other platforms:

 * **React Native on (specifically) Android** doesn't come with Intl support, so all three caveats apply to it. Use [jsc-android-buildscripts](https://github.com/SoftwareMansion/jsc-android-buildscripts) to fix it.
