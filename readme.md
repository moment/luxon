# Luxon

[![MIT License][license-image]][license] [![Build Status][travis-image]][travis-url] [![NPM version][npm-version-image]][npm-url]

Luxon is an experimental library for working with dates and times in Javascript. For a brief intro, see the [homepage](http://isaaccambron.com/luxon). There's a demo [here](http://isaaccambron.com/luxon/demo/global.html).

```js
DateTime.local().setZone('America/New_York').minus({ weeks: 1 }).endOf('day').toISO();
```

## Download/install

[Download/install instructions](http://isaaccambron.com/luxon/docs/manual/design/install.html)

## Documentation

* [Guide](http://isaaccambron.com/luxon/docs/)
* [API docs](http://isaaccambron.com/luxon/docs/identifiers.html)

## Development

See [contributing](contributing.md).

![Phasers to stun][phasers-image]

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[license]: LICENSE.md

[travis-url]: http://travis-ci.org/icambron/luxon
[travis-image]: http://img.shields.io/travis/icambron/luxon/master.svg?style=flat-square

[npm-url]: https://npmjs.org/package/luxon
[npm-version-image]: http://img.shields.io/npm/v/luxon.svg?style=flat-square

[phasers-image]: https://img.shields.io/badge/phasers-stun-brightgreen.svg?style=flat-square
