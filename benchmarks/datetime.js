/* eslint import/no-extraneous-dependencies: off */
/* eslint no-console: off */
import Benchmark from 'benchmark';
import { DateTime } from '../src/datetime';

const suite = new Benchmark.Suite();

suite
  .add('DateTime.now', () => {
    DateTime.local();
  })
  .add('DateTime.local with numbers', () => {
    DateTime.local(2017, 5, 15);
  })
  .add('DateTime.fromString', () => {
    DateTime.fromString('1982/05/25 09:10:11.445', 'yyyy/MM/dd HH:mm:ss.SSS');
  })
  .add('DateTime.fromString with zone', () => {
    DateTime.fromString('1982/05/25 09:10:11.445', 'yyyy/MM/dd HH:mm:ss.SSS', {
      zone: 'America/Los_Angeles'
    });
  })
  .add('DateTime#setZone', () => {
    DateTime.local().setZone('America/Los_Angeles');
  })
  .add('DateTime#toFormat', () => {
    DateTime.local().toFormat('yyyy-MM-dd');
  })
  .add('DateTime#add', () => {
    DateTime.local().plus({ milliseconds: 3434 });
  })
  .on('cycle', event => {
    console.log(String(event.target));
  })
  .on('complete', () => {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
