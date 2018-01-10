# Intl

Luxon uses the native Intl API to provide easy-to-use internationalization. A quick example:

```js
DateTime.local().setLocale('el').toLocaleString(DateTime.DATE_FULL); //=>  '24 Σεπτεμβρίου 2017'
```

## How locales work

Luxon DateTimes can be configured using [BCP 47](https://tools.ietf.org/html/rfc5646) locale strings specifying the language to use generating or interpreting strings. The native Intl API provides the actual internationalized strings; Luxon just wraps it with a nice layer of convenience and integrates the localization functionality into the rest of Luxon. The Mozilla MDN Intl docs have a [good description](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation) of how the `locale` argument works. In Luxon, the methods are different but the semantics are the same, except in that Luxon allows you to specify a numbering system and output calendar independently of the locale string.

The rest of this document will concentrate on what Luxon does when provided with locale information.

## Setting the locale

`locale` is a property of Luxon object. Thus, locale is a sort of setting on the DateTime object, as opposed to an argument you provide the different methods that need internationalized.

You can generally set it at construction time:

```js
var dt = DateTime.fromISO('2017-09-24', { locale: 'fr' })
dt.locale //=> 'fr'
```

In this case, the specified locale didn't change the how the parsing worked (there's nothing localized about it), but it did set the locale property in the resulting instance. For other factory methods, such as `fromFormat`, the locale argument *does* affect how the string is parsed. See further down for more.

You can change the locale of a DateTime instance (meaning, create a clone DateTime with a different locale) using `setLocale`:


```js
DateTime.local().setLocale('fr').locale //=> 'fr'
```

`setLocale` is just a convenience for `reconfigure`:

```js
DateTime.local().reconfigure({ locale: 'fr' }).locale; //=> 'fr'
```

## Default locale

### Out-of-the-box behavior

By default the `locale` property of a new DateTime or Duration is `null`. This means different things in different contexts:

 1. `DateTime#toLocaleString`, `DateTime#toLocaleParts`, and other human-readable-string methods like `Info.months` will fall back on the system locale. On a browser, that means whatever the user has their browser or OS language set to. On Node, that usually means en-US.
 2. `DateTime.fromFormat` and `DateTime#toFormat` fall back on en-US. That's because these methods are often used to parse or format strings for consumption by APIs that don't care about the user's locale. So we need to pick a locale and stick with it, or the code will break depending on whose browser it runs in.
 3. There's an exception, though: DateTime#toFormat can take "macro" formats like "D" that produce localized strings as part of a larger string. These *do* default to the system locale because their entire purpose is to be localized.
 
### Setting the default

You can set a default locale so that news instances will always be created with the specified locale:

```js
Settings.defaultLocale = 'fr';
DateTime.local().locale; //=> 'fr'
```

Note that this also alters the behavior of `DateTime#toFormat` and `DateTime#fromFormat`.

### Using the system locale in string parsing

You generally don't want `DateTime#fromFormat` and `DateTime#toFormat` to use the system's locale, since your format won't be sensitive to the locale's string ordering. That's why Luxon doesn't behave that way by default. But if you really want that behavior, you can always do this:

 ```js
 Settings.defaultLocale = DateTime.local().resolvedLocaleOpts().locale;
 ```
 
## Checking what you got

The local environment may not support the exact locale you asked for. The native Intl API will try to find the best match. If you want to know what that match was, use `resolvedLocaleOpts`:


```js
DateTime.fromObject({locale: 'fr-co'}).resolvedLocaleOpts(); //=> { locale: 'fr',
                                                             //     numberingSystem: 'latn',
                                                             //     outputCalendar: 'gregory' }
```

## Methods affected by the locale

### Formatting

The most important method affected by the locale setting is `toLocaleString`, which allows you to produce internationalized, human-readable strings.

```js
dt.setLocale('fr').toLocaleString(DateTime.DATE_FULL) //=> '25 septembre 2017'
```

That's the normal way to do it: set the locale as property of the DateTime itself and let the `toLocaleString` inherit it. But you can specify the locale directly to `toLocaleString` too:

```js
dt.toLocaleString( Object.assign({ locale: 'es' }, DateTime.DATE_FULL)) //=> '25 de septiembre de 2017'
```

Ad-hoc formatting also respects the locale:

```js
dt.setLocale('fr').toFormat('MMMM dd, yyyy GG'); //=> 'septembre 25, 2017 après Jésus-Christ'
```

### Parsing

You can [parse](parsing.html) localized strings:

```js
DateTime.fromFormat('septembre 25, 2017 après Jésus-Christ', 'MMMM dd, yyyy GG', {locale: 'fr'})
```

### Listing

Some of the methods in the [Info](../class/src/info.js~Info.html) class let you list strings like months, weekdays, and eras, and they can be localized:


```js
Info.months('long', { locale: 'fr' })    //=> [ 'janvier', 'février', ...
Info.weekdays('long', { locale: 'fr' })  //=> [ 'lundi', 'mardi', ...
Info.eras('long', { locale: 'fr' })      //=> [ 'avant Jésus-Christ', 'après Jésus-Christ' ]
```

## numberingSystem

DateTimes also have a `numberingSystem` setting that lets you control what system of numerals is used in formatting. In general, you shouldn't override the numbering system provided by the locale. For example, no extra work is needed to get Arabic numbers to show up in Arabic-speaking locales:

```js
var dt = DateTime.local().setLocale('ar')


dt.resolvedLocaleOpts() //=> { locale: 'ar',
                        //     numberingSystem: 'arab',
                        //     outputCalendar: 'gregory' }

dt.toLocaleString() //=> '٢٤‏/٩‏/٢٠١٧'
```

For this reason, Luxon defaults its own `numberingSystem` property to null, by which it means "let the Intl API decide". However, you can override it if you want. This example is admittedly ridiculous:

```js
var dt  = DateTime.local().reconfigure({ locale: 'it', numberingSystem: 'beng' })
dt.toLocaleString(DateTime.DATE_FULL) //=> '২৪ settembre ২০১৭'
```

Similar to `locale`, you can set the default numbering system for new instances:

```js
Settings.defaultNumberingSystem = 'beng';
```
