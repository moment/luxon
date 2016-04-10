import {chai} from 'chai';
import {Instant} from 'luxon';
import {FakePT} from '../helpers/fakePT';

export let zone = () => {
  describe('zone management', () => {

    let instant, millis = 391147200000; //1982-05-25T04:00:00.000Z

    beforeEach(() => {
      instant = Instant.fromMillis(millis);
    });

    describe('timezone basics', () => {
      it('defaults to local', () => {
        instant.timezoneName().should.equal('local');
        instant.isOffsetFixed().should.equal(false);
      });
    });

    describe('#utc', () => {
      let zoned;
      beforeEach(() => {
        zoned = instant.utc();
      });

      it("doesn't change the time", () => {
        zoned.valueOf().should.equal(instant.valueOf());
      });

      it('changes the calendar', () => {
        zoned.hour().valueOf().should.equal(4);
      });

      it('changes the zone setting', () => {
        zoned.timezoneName().should.equal('UTC');
        zoned.isOffsetFixed().should.equal(true);
        zoned.isInDST().should.equal(false);
      });
    });

    describe('#useUTCOffset', () => {
      let zoned;
      beforeEach(() => {
        zoned = instant.useUTCOffset(5 * 60);
      });

      it("doesn't change the time", () => {
        zoned.valueOf().should.equal(instant.valueOf());
      });

      it('changes the calendar', () => {
        zoned.hour().valueOf().should.equal(9);
      });

      it('changes the zone setting', () => {
        zoned.timezoneName().should.equal('UTC+5');
        zoned.isOffsetFixed().should.equal(true);
        zoned.isInDST().should.equal(false);
      });
    });

    describe('#local', () => {
      let localed, relocaled;

      beforeEach(() => {
        localed = instant.local();
        relocaled = instant.utc().local();
      });

      it('resets the zone to local', () => {
        relocaled.timezoneName().should.equal('local');
        relocaled.isOffsetFixed().should.equal(false);
      });

      it("doesn't change the time", () => {
        localed.valueOf().should.equal(instant.valueOf());
        relocaled.valueOf().should.equal(instant.valueOf());
      });

      it('changes the calendar', () => {
        let expected = new Date(millis).getHours();
        relocaled.hour().should.equal(expected);
        localed.hour().should.equal(expected);
      });
    });

    describe('#rezone', () => {
      let zoned;
      beforeEach(() => {
        zoned = instant.rezone(new FakePT());
      });

      it('sets the zone', () => {
        zoned.timezoneName().should.equal('Pacific Time');
        zoned.isOffsetFixed().should.equal(false);
      });

      it("doesn't change the time", () => {
        zoned.valueOf().should.equal(instant.valueOf());
      });

      it('changes the calendar', () => {
        zoned.hour().should.equal(21); //pacific daylight time
        zoned.isInDST().should.equal(true);
      });
    });

    describe('#isInDST', () => {
      let zoned;

      beforeEach(() => {
        zoned = instant.rezone(new FakePT());
      });

      it('returns false for pre-DST times', () => {
        zoned.month(1).isInDST().should.equal(false);
      });

      it('returns true for during-DST times', () => {
        zoned.month(4).isInDST().should.equal(true);
      });

      it('returns false for post-DST times', () => {
        zoned.month(12).isInDST().should.equal(false);
      });
    });

    describe('intlZone', () => {
      //this will only work in Chrome/V8 for now
      let zoned;

      beforeEach(() => {
        zoned = instant.timezone('Europe/Paris');
      });

      it('sets the zone', () => {
        zoned.timezoneName().should.equal('Europe/Paris');
      });

      it("doesn't change the time", () => {
        zoned.valueOf().should.equal(instant.valueOf());
      });

      it('changes the calendar', () => {
        zoned.hour().should.equal(6); //cest is +2
      });

    });
  });
};
