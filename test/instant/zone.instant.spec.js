import {chai} from 'chai';
import {Instant} from 'luxon';
import {FakePT} from '../helpers/fakePT';

export let zone = () => {
  describe('zone management', () => {

    let instant, millis = 391147200000; //1982-05-25T04:00:00.000Z

    beforeEach(() => {
      instant = Instant.fromMillis(millis);
    });

    describe('#timezone', () => {
      it('defaults to local', () => {
        instant.timezone().name().should.equal('local');
        instant.timezone().universal().should.equal(false);
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
        zoned.timezone().name().should.equal('UTC');
        zoned.timezone().universal().should.equal(true);
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
        zoned.timezone().name().should.equal('UTC+5');
        zoned.timezone().universal().should.equal(true);
      });
    });

    describe('#local', () => {
      let localed, relocaled;

      beforeEach(() => {
        localed = instant.local();
        relocaled = instant.utc().local();
      });

      it('resets the zone to local', () => {
        relocaled.timezone().name().should.equal('local');
        relocaled.timezone().universal().should.equal(false);
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
        zoned.timezone().name().should.equal('Pacific Time');
      });

      it("doesn't change the time", () => {
        zoned.valueOf().should.equal(instant.valueOf());
      });

      it('changes the calendar', () => {
        zoned.hour().should.equal(21); //pacific daylight time
      });
    });
  });
};
