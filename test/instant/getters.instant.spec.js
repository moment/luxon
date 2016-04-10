import {chai} from 'chai';
import {Instant} from 'luxon';

export let getters = () => {
  describe('getter functions', () => {

    describe('local', () => {
      let instant;

      beforeEach(() => {
        instant = Instant.fromJSDate(new Date(1982, 4, 25, 9, 23, 54, 123));
      });

      describe('#year', () => {
        it('returns the right year', () => {
          instant.year().should.equal(1982);
        });
      });

      describe('#month', () => {
        it('returns a 1-indexed month', () => {
          instant.month().should.equal(5);
        });
      });

      describe('#day', () => {
        it('returns the day of the month', () => {
          instant.day().should.equal(25);
        });
      });

      describe('#hour', () => {
        it('returns the hour', () => {
          instant.hour().should.equal(9);
        });
      });

      describe('#minute', () => {
        it('returns the minute', () => {
          instant.minute().should.equal(23);
        });
      });

      describe('#second', () => {
        it('returns the second', () => {
          instant.second().should.equal(54);
        });
      });

      describe('#millisecond', () => {
        it('returns the millisecond', () => {
          instant.millisecond().should.equal(123);
        });
      });
    });

    describe('utc', () => {
      let instant;

      beforeEach(() => {
        instant = Instant.fromMillis(Date.UTC(1982, 4, 25, 9, 23, 54, 123)).utc();
      });

      describe('#year', () => {
        it('returns the right year', () => {
          instant.year().should.equal(1982);
        });
      });

      describe('#month', () => {
        it('returns a 1-indexed month', () => {
          instant.month().should.equal(5);
        });
      });

      describe('#day', () => {
        it('returns the day of the month', () => {
          instant.day().should.equal(25);
        });
      });

      describe('#hour', () => {
        it('returns the hour', () => {
          instant.hour().should.equal(9);
        });
      });

      describe('#minute', () => {
        it('returns the minute', () => {
          instant.minute().should.equal(23);
        });
      });

      describe('#second', () => {
        it('returns the second', () => {
          instant.second().should.equal(54);
        });
      });

      describe('#millisecond', () => {
        it('returns the millisecond', () => {
          instant.millisecond().should.equal(123);
        });
      });
    });

    describe('utc + offset', () => {
      //todo
    });
  });
};
