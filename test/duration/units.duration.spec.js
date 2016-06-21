import {chai} from 'chai';
import {Duration} from 'luxon';

export let units = () => {
  describe('units', () => {

    describe('shiftTo', () => {

      describe('rollup', () => {

        it('rolls milliseconds up shiftTo hours and minutes', () => {

          let dur = Duration.fromLength(5760000, 'milliseconds');

          dur.shiftTo('hours').hours().should.equal(1.6);

          let mod = dur.shiftTo('hours', 'minutes');
          mod.hours().should.equal(1);
          mod.minutes().should.equal(36);
          mod.seconds().should.equal(0);
        });
      });

      describe('boil down', () => {
        it('boils hours down shiftTo milliseconds', () => {
          let dur = Duration .fromLength(1, 'hour').shiftTo('milliseconds');
          dur.milliseconds().should.equal(3600000);
        });

        it('boils hours down shiftTo minutes and milliseconds', () => {
          let dur = Duration .fromObject({hours: 1, seconds: 30}).shiftTo('minutes', 'milliseconds');
          dur.minutes().should.equal(60);
          dur.milliseconds().should.equal(30000);
        });
      });

      describe('boil down and rollup', () => {
        it('rolls up years and hours shiftTo months, days, and minutes', () => {
          let dur = Duration.fromObject({years: 2, hours: 5000}).shiftTo('months', 'days', 'minutes');

          dur.months().should.equal(30);
          dur.days().should.equal(28);
          dur.minutes().should.equal(8 * 60);
        });
      });
    });
  });
};
