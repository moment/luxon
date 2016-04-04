import {chai} from 'chai';
import {Instant, Duration} from 'luxon';

export let create = () => {
  describe('create functions', () => {

    describe('#fromObject', () => {
      it('sets all the values', () => {
        let dur = Duration.fromObject({years: 1, months: 2, days: 3, hours: 4, minutes: 5, seconds: 6, milliseconds: 7});
        dur.years().should.equal(1);
        dur.months().should.equal(2);
        dur.days().should.equal(3);
        dur.hours().should.equal(4);
        dur.minutes().should.equal(5);
        dur.seconds().should.equal(6);
        dur.milliseconds().should.equal(7);
      });
    });
  });
};
