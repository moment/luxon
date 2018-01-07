var Benchmark = require('benchmark'),
  DateTime = require('../../build/node/luxon').DateTime;

module.exports = {
  name: 'DateTime',
  tests: {
    now: {
      fn: () => DateTime.local(),
      async: true
    },
    'local with numbers': {
      fn: () => DateTime.local(2017, 5, 15),
      async: true
    },
    fromString: {
      fn: () => DateTime.fromString('1982/05/25 09:10:11.445', 'yyyy/MM/dd HH:mm:ss.SSS'),
      async: true
    },
    fromStringZoned: {
      setup: () => {},
      fn: () =>
        DateTime.fromString('1982/05/25 09:10:11.445', 'yyyy/MM/dd HH:mm:ss.SSS', {
          zone: 'America/Los_Angeles'
        }),
      async: true
    },
    setZone: {
      fn: () => {
        DateTime.local().setZone('America/Los_Angeles');
      }
    },
    toFormat: {
      fn: () => DateTime.local().toFormat('yyyy-MM-dd'),
      async: true
    },
    add: {
      setup: () => {},
      fn: () => DateTime.local().plus({ milliseconds: 3434 }),
      async: true
    }
  }
};
