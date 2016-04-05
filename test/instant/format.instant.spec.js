import {chai} from 'chai';
import {Instant} from 'luxon';

export let format = () => {
  describe('format functions', () => {
    describe('#toIso', () => {
      //since we should the offset, need to do this in UTC so we know what the answer will be
      let date = Instant.fromObject({year: 1982, month: 5, day: 25, hour: 9, minute: 23, second: 54, millisecond: 123}, {utc: true});

      it('shows Z in UTC', () => {
        date.toISO().should.equal('1982-05-25T09:23:54.123Z');
      });

      it('shows the offset if it has one', () => {
        date.useUTCOffset(-6 * 60).toISO().should.equal('1982-05-25T03:23:54.123-06:00');
      });
    });
  });
};
