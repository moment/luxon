// This is a placeholder. My actual needs:
// * a gulp wrapper that supports Benchmark 2.x
// * a way of collecting suites together and running them all
// * a good way to do all this with Babel
// But for now we'll just run this file I guess

var Benchmark = require('benchmark');
var DateTime = require('../build/cjs/luxon').DateTime;

new Benchmark.Suite()
  .add('now', () => DateTime.local())
  .add('local with numbers', () => DateTime.local(2017, 5, 15))
  .add('fromString', () =>
    DateTime.fromString('1982/05/25 09:10:11.445', 'yyyy/MM/dd HH:mm:ss.SSS')
  )
  .add('add', () => DateTime.local().plus({ milliseconds: 3434 }))
  .on('cycle', event => console.log(String(event.target)))
  .run();
