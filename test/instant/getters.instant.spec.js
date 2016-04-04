import {chai} from 'chai';
import {Instant} from 'luxon';

export let getters = () => {
  describe('getter functions', () => {

    describe('local', () => {
      let date = Instant.fromJSDate(new Date(1982, 4, 25, 9, 23, 54, 123));

      describe('#year', () => {
        it('returns the right year', () => {
          date.year().should.equal(1982);
        });
      });

      describe('#month', () => {
        it('returns a 1-indexed month', () => {
          date.month().should.equal(5);
        });
      });

      describe('#day', () => {
        it('returns the day of the month', () => {
          date.day().should.equal(25);
        });
      });

      describe('#weekday', () => {
        it('returns the day of the week', () => {
          date.weekday().should.equal(2);
        });
      });

      describe('#hour', () => {
        it('returns the hour', () => {
          date.hour().should.equal(9);
        });
      });

      describe('#minute', () => {
        it('returns the minute', () => {
          date.minute().should.equal(23);
        });
      });

      describe('#second', () => {
        it('returns the second', () => {
          date.second().should.equal(54);
        });
      });

      describe('#millisecond', () => {
        it('returns the millisecond', () => {
          date.millisecond().should.equal(123);
        });
      });
    });

    describe('utc', () => {
      let date = Instant.fromJSDate(Date.UTC(1982, 4, 25, 9, 23, 54, 123)).utc();

      describe('#year', () => {
        it('returns the right year', () => {
          date.year().should.equal(1982);
        });
      });

      describe('#month', () => {
        it('returns a 1-indexed month', () => {
          date.month().should.equal(5);
        });
      });

      describe('#day', () => {
        it('returns the day of the month', () => {
          date.day().should.equal(25);
        });
      });

      describe('#weekday', () => {
        it('returns the day of the week', () => {
          date.weekday().should.equal(2);
        });
      });

      describe('#hour', () => {
        it('returns the hour', () => {
          date.hour().should.equal(9);
        });
      });

      describe('#minute', () => {
        it('returns the minute', () => {
          date.minute().should.equal(23);
        });
      });

      describe('#second', () => {
        it('returns the second', () => {
          date.second().should.equal(54);
        });
      });

      describe('#millisecond', () => {
        it('returns the millisecond', () => {
          date.millisecond().should.equal(123);
        });
      });
    });

    describe('utc + offset', () => {
      //todo
    });
  });
};
