# Intl

Luxon uses the native Intl API to provide easy-to-use internationalization. A quick example:

```js
DateTime.now()
  .setLocale("el")
  .toLocaleString(DateTime.DATE_FULL); //=>  '24 Σεπτεμβρίου 2017'
```

## Making sure you have access to other locales

Please see the [install guide](install.md) for instructions on making sure your platform has access to the Intl APIs and the ICU data to power it. This especially important for Node, which doesn't ship with ICU data by default.

## How locales work

Luxon DateTimes can be configured using [BCP 47](https://tools.ietf.org/html/rfc5646) locale strings specifying the language to use generating or interpreting strings. The native Intl API provides the actual internationalized strings; Luxon just wraps it with a nice layer of convenience and integrates the localization functionality into the rest of Luxon. The Mozilla MDN Intl docs have a [good description](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation) of how the `locale` argument works. In Luxon, the methods are different but the semantics are the same, except in that Luxon allows you to specify a numbering system and output calendar independently of the locale string.

The rest of this document will concentrate on what Luxon does when provided with locale information.

## Setting the locale

`locale` is a property of Luxon object. Thus, locale is a sort of setting on the DateTime object, as opposed to an argument you provide the different methods that need internationalized.

You can generally set it at construction time:

```js
var dt = DateTime.fromISO("2017-09-24", { locale: "fr" });
dt.locale; //=> 'fr'
```

In this case, the specified locale didn't change the how the parsing worked (there's nothing localized about it), but it did set the locale property in the resulting instance. For other factory methods, such as `fromFormat`, the locale argument _does_ affect how the string is parsed. See further down for more.

You can change the locale of a DateTime instance (meaning, create a clone DateTime with a different locale) using `setLocale`:

```js
DateTime.now().setLocale("fr").locale; //=> 'fr'
```

`setLocale` is just a convenience for `reconfigure`:

```js
DateTime.now().reconfigure({ locale: "fr" }).locale; //=> 'fr'
```

## Default locale

### Out-of-the-box behavior

By default, the `locale` property of a new DateTime or Duration is the system locale. On a browser, that means whatever the user has their browser or OS language set to. On Node, that usually means en-US.

As a result, `DateTime#toLocaleString`, `DateTime#toLocaleParts`, and other human-readable-string methods like `Info.months` will by default generate strings in the user's locale.

However, note that `DateTime.fromFormat` and `DateTime#toFormat` fall back on en-US. That's because these methods are often used to parse or format strings for consumption by APIs that don't care about the user's locale. So we need to pick a locale and stick with it, or the code will break depending on whose browser it runs in. There's an exception, though: `DateTime#toFormat` can take "macro" formats like "D" that produces localized strings as part of a larger string. These *do* default to the system locale because their entire purpose is to be provide localized strings.

### Setting the default

You can set a default locale so that new instances will always be created with the specified locale:

```js
Settings.defaultLocale = "fr";
DateTime.now().locale; //=> 'fr'
```

Note that this also alters the behavior of `DateTime#toFormat` and `DateTime#fromFormat`.

### Using the system locale in string parsing

You generally don't want `DateTime#fromFormat` and `DateTime#toFormat` to use the system's locale, since your format won't be sensitive to the locale's string ordering. That's why Luxon doesn't behave that way by default. But if you really want that behavior, you can always do this:

```js
Settings.defaultLocale = DateTime.now().resolvedLocaleOptions().locale;
```

## Checking what you got

The local environment may not support the exact locale you asked for. The native Intl API will try to find the best match. If you want to know what that match was, use `resolvedLocaleOpts`:

```js
DateTime.local({ locale: "fr-co" }).resolvedLocaleOptions(); //=> { locale: 'fr',
//     numberingSystem: 'latn',
//     outputCalendar: 'gregory' }
```

## Methods affected by the locale

### Formatting

The most important method affected by the locale setting is `toLocaleString`, which allows you to produce internationalized, human-readable strings.

```js
dt.setLocale("fr").toLocaleString(DateTime.DATE_FULL); //=> '25 septembre 2017'
```

That's the normal way to do it: set the locale as property of the DateTime itself and let the `toLocaleString` inherit it. But you can specify the locale directly to `toLocaleString` too:

```js
dt.toLocaleString({ locale: "es" , ...DateTime.DATE_FULL }); //=> '25 de septiembre de 2017'
```

Ad-hoc formatting also respects the locale:

```js
dt.setLocale("fr").toFormat("MMMM dd, yyyy GG"); //=> 'septembre 25, 2017 après Jésus-Christ'
```

### Parsing

You can [parse](parsing.md) localized strings:

```js
DateTime.fromFormat("septembre 25, 2017 après Jésus-Christ", "MMMM dd, yyyy GG", { locale: "fr" });
```

### Listing

Some of the methods in the `Info` class let you list strings like months, weekdays, and eras, and they can be localized:

```js
Info.months("long", { locale: "fr" }); //=> [ 'janvier', 'février', ...
Info.weekdays("long", { locale: "fr" }); //=> [ 'lundi', 'mardi', ...
Info.eras("long", { locale: "fr" }); //=> [ 'avant Jésus-Christ', 'après Jésus-Christ' ]
```

## numberingSystem

DateTimes also have a `numberingSystem` setting that lets you control what system of numerals is used in formatting. In general, you shouldn't override the numbering system provided by the locale. For example, no extra work is needed to get Arabic numbers to show up in Arabic-speaking locales:

```js
var dt = DateTime.now().setLocale("ar");

dt.resolvedLocaleOptions(); //=> { locale: 'ar',
//     numberingSystem: 'arab',
//     outputCalendar: 'gregory' }

dt.toLocaleString(); //=> '٢٤‏/٩‏/٢٠١٧'
```

For this reason, Luxon defaults its own `numberingSystem` property to null, by which it means "let the Intl API decide". However, you can override it if you want. This example is admittedly ridiculous:

```js
const dt = DateTime.local().reconfigure({ locale: "it", numberingSystem: "beng" });
dt.toLocaleString(DateTime.DATE_FULL); //=> '২৪ settembre ২০১৭'
```

Similar to `locale`, you can set the default numbering system for new instances:

```js
Settings.defaultNumberingSystem = "beng";
```

## Locale-based weeks

Most of Luxon uses the [ISO week date](https://en.wikipedia.org/wiki/ISO_week_date) system when working with week-related data.
This means that the week starts on Monday and the first week of the year is that week, which has 4 or more of its days in January.

This definition works for most use-cases, however locales can define different rules. For example, in many English-speaking countries
the week is said to start on Sunday and the 1 January always defines the first week of the year. This information is
available through the Luxon as well.

Note that your runtime needs to support [`Intl.Locale#getWeekInfo`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getWeekInfo) for this to have an effect. If unsupported, Luxon will fall back
to using the ISO week dates.

### Accessing locale-based week info

The `Info` class exposes methods `getStartOfWeek`, `getMinimumDaysInFirstWeek` and `getWeekendWeekdays` for informational
purposes.

### Accessing locale-based week data

```js
const dt = DateTime.local(2022, 1, 1, { locale: "en-US" });
dt.localWeekday // 7, because Saturday is the 7th day of the week in en-US
dt.localWeekNumber // 1, because 1 January is always in the first week in en-US
dt.localWeekYear // 2022, because 1 January is always in the first week in en-US
dt.weeksInLocalWeekYear // 53, because 2022 has 53 weeks in en-US
```

### Using locale-based week data when creating DateTimes

When creating a DateTime instance using `fromObject`, you can use the `localWeekday`, `localWeekNumber` and `localWeekYear`
properties. They will use the same locale that the newly created DateTime will use, either explicitly provided or falling back
to the system default.

```js
const dt = DateTime.fromObject({localWeekYear: 2022, localWeekNumber: 53, localWeekday: 7});
dt.toISODate(); // 2022-12-31
```

### Setting locale-based week data

When modifying an existing DateTime instance using `set`, you can use the `localWeekday`, `localWeekNumber` and `localWeekYear`
properties. They will use the locale of the existing DateTime as reference.

```js
const dt = DateTime.local(2022, 1, 2, { locale: "en-US" });
const modified = dt.set({localWeekNumber: 2});
modified.toISODate(); // 2022-01-08
```

### Locale-based weeks with math

The methods `startOf`, `endOf`, `hasSame` of `DateTime` as well as `count` of `Interval` accept an option `useLocaleWeeks`. 
If enabled, the methods will treat the `week` unit according to the locale, respecting the correct start of the week.

```js
const dt = DateTime.local(2022, 1, 6, { locale: "en-US" });
const startOfWeek = dt.startOf('week', {useLocaleWeeks: true});
startOfWeek.toISODate(); // 2022-01-02, a Sunday
```

### Overriding defaults

You can override the runtime-provided defaults for the week settings using `Settings.defaultWeekSettings`:

```js
Settings.defaultWeekSettings = { firstDay: 7, minimalDays: 1, weekend: [6, 7] }
```