# Intl

Luxon uses the native Intl API to provide easy-to-use internationalization. A quick example:

```js
DateTime.local().setLocale('el').toLocaleString(DateTime.DATE_FULL); //=>  '24 Σεπτεμβρίου 2017'
```

## How locales work

TODO

## Setting locale

`locale` is a property of Luxon object, and it defaults to 'en-us'. You can generally set it at construction time:

```js
DateTime.fromISO('2017-09-24', { locale: 'fr' }).locale //=> 'fr'
```

Or you can change it (meaning, create a clone DateTime with a different locale) using `setLocale`:


```js
DateTime.local().setLocale('fr').locale //=> 'fr'
```

`setLocale` is just a convenience for `reconfigure`:

```js
DateTime.local().reconfigure({ locale: 'fr' }).locale; //=> 'fr'
```

## Checking what you got

The local environment may not support the exact locale you asked for. The native Intl API will try to find the best match. If you want to know what that match was, use `resolvedLocaleOpts`:


```js
DateTime.fromObject({locale: 'fr-co'}).resolvedLocaleOpts(); //=> { locale: 'fr',
                                                             //     numberingSystem: 'latn',
                                                             //     outputCalendar: 'gregory' }
```

## Methods affected by Intl

TODO

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

## Default settings

TODO
