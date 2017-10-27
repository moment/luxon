# Luxon

[![MIT License][license-image]][license] [![Build Status][travis-image]][travis-url] [![NPM version][npm-version-image]][npm-url] [![Coverage Status][test-coverage-image]][test-coverage-url] ![Doc coverage][doc-coverage-image]



Luxon is an experimental library for working with dates and times in Javascript. For a brief intro, see the [homepage](http://isaaccambron.com/luxon). There's a demo [here](http://isaaccambron.com/luxon/demo/global.html).

```js
DateTime.local().setZone('America/New_York').minus({ weeks: 1 }).endOf('day').toISO();
```

## Download/install

[Download/install instructions](http://isaaccambron.com/luxon/docs/manual/design/install.html)

## Documentation

* [Guide][doc-url]
* [API docs](http://isaaccambron.com/luxon/docs/identifiers.html)
* [Guide for Moment users](http://isaaccambron.com/luxon/docs/manual/faq/moment.html)

## Development

See [contributing](contributing.md).

![Phasers to stun][phasers-image]

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg
[license]: license.md

[travis-url]: http://travis-ci.org/moment/luxon
[travis-image]: https://api.travis-ci.org/moment/luxon.svg?branch=master

[npm-url]: https://npmjs.org/package/luxon
[npm-version-image]: https://badge.fury.io/js/luxon.svg

[doc-url]: http://moment.github.io/luxon/docs/
[doc-coverage-image]: http://moment.github.io/luxon/docs/badge.svg

[test-coverage-url]: https://coveralls.io/github/moment/luxon?branch=master
[test-coverage-image]: https://coveralls.io/repos/github/moment/luxon/badge.svg?branch=master

[phasers-image]: https://img.shields.io/badge/phasers-stun-brightgreen.svg
