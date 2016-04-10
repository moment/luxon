import {chai} from 'chai';
import {Instant} from 'luxon';
import {FakePT} from '../helpers/fakePT';

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

    describe('#fromObject', () => {

      it('sets all the fields', () => {

        let instant = Instant.fromObject({
          year: 1982,
          month: 5,
          day: 25,
          hour: 9,
          minute: 23,
          second: 54,
          millisecond: 123
        });

        instant.isOffsetFixed().should.equal(false);
        instant.year().should.equal(1982);
        instant.month().should.equal(5);
        instant.day().should.equal(25);
        instant.hour().should.equal(9);
        instant.minute().should.equal(23);
        instant.second().should.equal(54);
        instant.millisecond().should.equal(123);
      });

      it('allows utc: true option', () => {

        let instant = Instant.fromObject({
          year: 1982,
          month: 5,
          day: 25,
          hour: 9,
          minute: 23,
          second: 54,
          millisecond: 123
        }, {utc: true});

        instant.isOffsetFixed().should.equal(true);
        instant.year().should.equal(1982);
        instant.month().should.equal(5);
        instant.day().should.equal(25);
        instant.hour().should.equal(9);
        instant.minute().should.equal(23);
        instant.second().should.equal(54);
        instant.millisecond().should.equal(123);
      });

      it('allows a zone to be specified', () => {
        let base = {
          year: 1982,
          day: 25,
          hour: 9,
          minute: 23,
          second: 54,
          millisecond: 123
        },
            daylight = Instant.fromObject(Object.assign({}, base, {month: 5}), {zone: new FakePT()}),
            standard = Instant.fromObject(Object.assign({}, base, {month: 12}), {zone: new FakePT()});

        daylight.isOffsetFixed().should.equal(false);
        daylight.offset().should.equal(-7 * 60);
        daylight.year().should.equal(1982);
        daylight.month().should.equal(5);
        daylight.day().should.equal(25);
        daylight.hour().should.equal(9);
        daylight.minute().should.equal(23);
        daylight.second().should.equal(54);
        daylight.millisecond().should.equal(123);

        standard.isOffsetFixed().should.equal(false);
        standard.offset().should.equal(-8 * 60);
        standard.year().should.equal(1982);
        standard.month().should.equal(12);
        standard.day().should.equal(25);
        standard.hour().should.equal(9);
        standard.minute().should.equal(23);
        standard.second().should.equal(54);
        standard.millisecond().should.equal(123);

      });

      it('defaults high-order values to the current date', () => {

        let instant = Instant.fromObject({}),
            now = Instant.now();
        instant.year().should.equal(now.year());
        instant.month().should.equal(now.month());
        instant.day().should.equal(now.day());
      });

      it('defaults lower-order values to 0', () => {

        let instant = Instant.fromObject({});

        instant.hour().should.equal(0),
        instant.minute().should.equal(0),
        instant.second().should.equal(0),
        instant.millisecond().should.equal(0);
      });
    });
  });
};
