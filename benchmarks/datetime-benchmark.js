var Benchmark = require('benchmark'),
  DateTime = require('../../build/node/luxon').DateTime;

module.exports = {
  name: 'DateTime',
  tests: {
    now: {
      setup: () => {},
      fn: () => DateTime.local(),
      async: true
    },
    'local with numbers': {
      setup: () => {},
      fn: () => DateTime.local(2017, 5, 15),
      async: true
    },
    fromString: {
      setup: () => {},
      fn: () => DateTime.fromString('1982/05/25 09:10:11.445', 'yyyy/MM/dd HH:mm:ss.SSS'),
      async: true
    },
    add: {
      setup: () => {},
      fn: () => DateTime.local().plus({ milliseconds: 3434 }),
      async: true
    }
  }
};
