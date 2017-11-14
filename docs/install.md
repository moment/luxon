# Install guide

Luxon provides different builds for different JS environments. See below for a link to the right one and instructions on how to use it.

## Basic browser setup

* [Download full](../../global/luxon.js)
* [Download minified](../../global/luxon.min.js)

Just include Luxon in a script tag. You can access its various classes through the `luxon` global.

```html
<script src="luxon.js"></script>
```

You may wish to alias the classes you use:

```js
var DateTime = luxon.DateTime;
```

## Node

Install via NPM:

```
npm install --save luxon
```

```js
const { DateTime } = require('luxon');
```

## AMD (System.js, RequireJS, etc)

* [Download full](../../amd/luxon.js)
* [Download minified](../../amd/luxon.min.js)

```js
requirejs(['luxon'], function(luxon) {
  //...
});
```

## ES6

* [Download full](../../es6/luxon.js)
* [Download minified](../../es6/luxon.min.js)

```js
import { DateTime } from 'luxon';
```

## Webpack

```
npm install --save luxon
```

```js
import { DateTime } from 'luxon';
```

## Meteor

[Help wanted.]

## React Native

[This section is a bit of a placeholder because I know little about RN. So contributions welcome!]

Luxon works in React Native. On Android, the Intl API isn't provided out of the box. Luxon works without Intl support but a lot of its features work as you expect, especially regarding time zones and internationalization. You can use the international variant of [jsc-android-buildscripts](https://github.com/SoftwareMansion/jsc-android-buildscripts) to Intl support.
