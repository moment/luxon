import {chai} from 'chai';
import {Instant} from 'frozen-river';

export let create = () => {
  describe('creation functions', () => {
    describe('#now', () => {
      let now;

      beforeEach(() => {
        now = Instant.now();
      });

      it('is today', () => {
        now.toJSDate().getDate().should.equal(new Date().getDate());
      });
    });

    describe('#fromJSDate', () => {
      let instant, date;

      beforeEach(() => {
        date = new Date(1982, 4, 25);
        instant = Instant.fromJSDate(date);
      });

      it('returns the same date', () => {
        instant.valueOf().should.equal(date.valueOf());
      });

      it('copies the date', () => {
        let oldValue = instant.valueOf();
        date.setDate(14);
        instant.valueOf().should.equal(oldValue);
      });
    });

    describe('#fromMillis', () => {
      let value = 391147200000,
          instant;

      beforeEach(() => {
        instant = Instant.fromMillis(value);
      });

      it('has the same valueOf as the input', () => {
        instant.valueOf().should.equal(value);
      });
    });

    describe('#fromUnix', () => {
      let value = 391147200,
          instant;

      beforeEach(() => {
        instant = Instant.fromUnix(value);
      });

      it('has the same valueOf as the input', () => {
        instant.valueOf().should.equal(value * 1000);
      });
    });
  });
};
