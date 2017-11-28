# Install guide

Luxon provides different builds for different JS environments. See below for a link to the right one and instructions on how to use it. Luxon supports all modern platforms, but see [the support matrix](matrix.html) for additional details.

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

### Internet Explorer

If you're supporting IE 10 or 11, you need some polyfills to get Luxon to work. You have two options: use a polyfilled build or apply the polyfills yourself. The polyfilled builds are here:

* [Download full polyfilled](../../global-filled/luxon.js)
* [Download minified polyfilled](../../global-filled/luxon.min.js)

Note that none of this polyfills the Intl API to enhance internationalization or zone capabilities; this is just about making sure the browser has stuff like `Object.assign`. To polyfill that stuff see [here](matrix.html#polyfills).

To polyfill it yourself, use polyfill.io:

```html
<script src="https://cdn.polyfill.io/v2/polyfill.min.js"></script>
```

This will *also* add the Intl stuff, so that's two birds with one stone.

## Node

Supports Node 6+. Install via NPM:

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

There are also polyfilled versions of this; see the Internet Explorer section above for additional options and caveats.

* [Download full polyfilled](../../amd-filled/luxon.js)
* [Download minified polyfilled](../../amd-filled/luxon.min.js)

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
