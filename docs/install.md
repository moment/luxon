# Install guide

Luxon provides different builds for different JS environments. See below for a link to the right one and instructions on how to use it. Luxon supports all modern platforms, but see [the support matrix](matrix.md) for additional details.

## Basic browser setup

- [Download full](https://moment.github.io/luxon/global/luxon.js)
- [Download minified](https://moment.github.io/luxon/global/luxon.min.js)

You can also load the files from a [CDN](https://www.jsdelivr.com/package/npm/luxon).

Just include Luxon in a script tag. You can access its various classes through the `luxon` global.

```html
<script src="luxon.js"></script>
```

You may wish to alias the classes you use:

```js
var DateTime = luxon.DateTime;
```

## Node

Supports Node 6+. Install via NPM:

```
npm install --save luxon
```

```js
const { DateTime } = require("luxon");
```

If you want to work with locales, you need ICU support:

 1. **For Node 13+, it comes built-in, no action necessary**
 2. For older Nodes (only 12 is supported), you need to install it yourself:
    1. Install a build of Node with full ICU baked in, such as via nvm: nvm install <version> -s --with-intl=full-icu --download=all or brew: brew install node --with-full-icu
    2. Install the ICU data externally and point Node to it. The instructions on how to do that are below.

The instructions for using full-icu as a package are a little confusing. Node can't automatically discover that you've installed it, so you need to tell it where to find the data, like this:

```
npm install full-icu
node --icu-data-dir=./node_modules/full-icu
```

You can also point to the data with an environment var, like this:

```
NODE_ICU_DATA="$(pwd)/node_modules/full-icu" node
```

## AMD (System.js, RequireJS, etc)

- [Download full](https://moment.github.io/luxon/amd/luxon.js)
- [Download minified](https://moment.github.io/luxon/amd/luxon.min.js)

```js
requirejs(["luxon"], function(luxon) {
  //...
});
```

## ES6

- [Download full](https://moment.github.io/luxon/es6/luxon.js)
- [Download minified](https://moment.github.io/luxon/es6/luxon.min.js)

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

React Native works just fine, but React Native for Android doesn't ship with Intl support, which you need for [a lot of Luxon's functionality](matrix.md). Use [jsc-android-buildscripts](https://github.com/SoftwareMansion/jsc-android-buildscripts) to fix it.
