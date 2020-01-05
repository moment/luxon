# Install guide

Luxon provides different builds for different JS environments. See below for a link to the right one and instructions on how to use it. Luxon supports all modern platforms, but see [the support matrix](matrix.html) for additional details.

## Basic browser setup

- [Download full](../../global/luxon.js)
- [Download minified](../../global/luxon.min.js)

You can also load the files from a [CDN](https://www.jsdelivr.com/package/npm/luxon).

Just include Luxon in a script tag. You can access its various classes through the `luxon` global.

```html
<script src="luxon.js"></script>
```

You may wish to alias the classes you use:

```js
var DateTime = luxon.DateTime;
```

### Internet Explorer

If you're supporting IE 10 or 11, you need some polyfills to get Luxon to work. Use polyfill.io:

```html
<script src="https://cdn.polyfill.io/v2/polyfill.js?features=default,String.prototype.repeat,Array.prototype.find,Array.prototype.findIndex,Math.trunc,Math.sign"></script>
```

See the [support matrix](matrix.html) for more information on what works and what doesn't in IE.

## Node

Supports Node 6+. Install via NPM:

```
npm install --save luxon
```

```js
const { DateTime } = require("luxon");
```

If you want to work with locales, you'll need to have `full-icu` support installed in Node. You can [build Node with it](https://github.com/nodejs/node/wiki/Intl), use an [NPM module](https://www.npmjs.com/package/full-icu) to provide it, or find it prepackaged for your platform, like `brew install node --with-full-icu`. If you skip this step, Luxon still works but methods like `setLocale()` will do nothing.

The instructions for using full-icu as a package are a little confusing. Node can't automatically discover that you've installed the it, so you need to tell it where to find the data, like this:

```
npm install full-icu
node --icu-data-dir=./node_modules/full-icu
```

You can also point to the data with an environment var, like this:

```
NODE_ICU_DATA="$(pwd)/node_modules/full-icu" node
```

## AMD (System.js, RequireJS, etc)

- [Download full](../../amd/luxon.js)
- [Download minified](../../amd/luxon.min.js)

```js
requirejs(["luxon"], function(luxon) {
  //...
});
```

## ES6

- [Download full](../../es6/luxon.js)
- [Download minified](../../es6/luxon.min.js)

```js
import { DateTime } from "luxon";
```

## Webpack

```
npm install --save luxon
```

```js
import { DateTime } from "luxon";
```

## Types

There are third-party typing files for Flow (via [flow-typed](https://github.com/flowtype/flow-typed)) and TypeScript (via [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped)).

For Flow, use:

```
flow-typed install luxon
```

For TypeScript, use:

```
npm install --save-dev @types/luxon
```

## React Native

React Native works just fine, but React Native for Android doesn't ship with Intl support, which you need for [a lot of Luxon's functionality](matrix.html). Use [jsc-android-buildscripts](https://github.com/SoftwareMansion/jsc-android-buildscripts) to fix it.
