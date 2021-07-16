# Support matrix

This page covers what platforms are supported by Luxon and what caveats apply to them.

## Official support

Luxon officially supports the last two versions of the major browsers, with some caveats. The table below shows which of the not-universally-supported features are available in what environments.

| Browser                          | Versions | Intl relative time formatting |
| -------------------------------- | -------- | ----------------------------- |
| Chrome                           | >= 73    | ✓                             |
| Firefox                          | >= 65    | ✓                             |
| Edge                             | >= 79    | ✓                             |
|                                  | 18       | ✗                             |
| Safari                           | >= 14    | ✓                             |
|                                  | 13       | ✗                             |
| iOS Safari (iOS version numbers) | >= 14    | ✓                             |
| Node                             | >= 12    | ✓                             |

- Those capabilities are explained in the next sections, along with possible polyfill options
- "w/ICU" refers to providing Node with ICU data. See the [install](install.md?id=node) for instructions

## Effects of missing features

**If the platforms you're targeting has all its boxes above check off, ignore this section**.

In the support table above, you can see that some environments are missing capabilities.  In the current version of
Luxon, there's only one partially-supported feature, so this is currently pretty simple. (Older versions of Luxon supported
older browsers, so there were nuanced feature caveats. Newer versions will add more caveats as new browser capabilities
become available and Luxon takes advantage of them if they're present.)

1.  **Relative time formatting**. Luxon's support for relative time formatting (e.g. `DateTime#toRelative` and `DateTime#toRelativeCalendar`) depends on Intl.RelativeTimeFormat. Luxon will fall back to using English if that capability is missing.

If the browser lacks these capabilities, Luxon tries its best:

| Feature                                | Full support |  No relative time format |
| -------------------------------------- | ------------ |  ----------------------- |
| Most things                            | OK           |  OK                      |
| `DateTime#toRelative` in en-US         | OK           |  OK                      |
| `DateTime#toRelative` in other locales | Uses English |  Uses English            |


## Older platforms

- **Older versions of both Chrome and Firefox** will most likely work. It's just that I only officially support the last two versions. As you get to older versions of these browsers, the missing capabilities listed above begin to apply to them. (e.g. FF started supporting `formatToParts` in 51 and time zones in 52). I haven't broken that out because it's complicated, Luxon doesn't officially support them, and no one runs them anyway.
- **Older versions of IE** probably won't work at all.
- **Older versions of Node** probably won't work without recompiling Luxon with a different Node target. In which case they'll work with some features missing.

## Other platforms

If the platform you're targeting isn't on the list and you're unsure what caveats apply, you can check which pieces are supported:

```js
Info.features(); //=> { relative: false }
```

Specific notes on other platforms:

- **React Native on (specifically) Android** doesn't come with Intl support, so all the possible-to-be-missing capabilities above are unavailable. Use [jsc-android-buildscripts](https://github.com/SoftwareMansion/jsc-android-buildscripts) to fix it.
