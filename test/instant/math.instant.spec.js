import {chai} from 'chai';
import {Instant} from 'luxon';

export let math = () => {
  describe('math', () => {
    let instant;

    beforeEach(() => {
      instant = Instant.fromObject({
        year: 2010,
        month: 2,
        day: 3,
        hour: 4,
        minute: 5,
        second: 6,
        millisecond: 7
      });
    });

    describe('#plus', () => {
      describe('year', () => {
        it('results in a later year', () => {
          instant.plus(1, 'years').year().should.equal(2011);
        });
      });
    });

    describe('#minus', () => {
    });

    describe('#startOf', () => {

      describe('year', () => {

        let started;

        beforeEach(() => {
          started = instant.startOf('year');
        });

        it('stays in the right year', () => {
          started.year().should.equal(2010);
        });

        it('strips out lower order items', () => {
          started.month().should.equal(1);
          started.day().should.equal(1);
          started.hour().should.equal(0);
          started.minute().should.equal(0);
          started.second().should.equal(0);
          started.millisecond().should.equal(0);
        });
      });

      describe('month', () => {

        let started;

        beforeEach(() => {
          started = instant.startOf('month');
        });

        it('stays in the right month', () => {
          started.year().should.equal(2010);
          started.month().should.equal(2);
        });

        it('strips out lower order items', () => {
          started.day().should.equal(1);
          started.hour().should.equal(0);
          started.minute().should.equal(0);
          started.second().should.equal(0);
          started.millisecond().should.equal(0);
        });
      });

      describe('day', () => {

        let started;

        beforeEach(() => {
          started = instant.startOf('day');
        });

        it('stays in the right hour', () => {
          started.year().should.equal(2010);
          started.month().should.equal(2);
          started.day().should.equal(3);
        });

        it('strips out lower order items', () => {
          started.hour().should.equal(0);
          started.minute().should.equal(0);
          started.second().should.equal(0);
          started.millisecond().should.equal(0);
        });
      });

      describe('hour', () => {

        let started;

        beforeEach(() => {
          started = instant.startOf('hour');
        });

        it('stays in the right hour', () => {
          started.year().should.equal(2010);
          started.month().should.equal(2);
          started.day().should.equal(3);
          started.hour().should.equal(4);
        });

        it('strips out lower order items', () => {
          started.minute().should.equal(0);
          started.second().should.equal(0);
          started.millisecond().should.equal(0);
        });
      });

      describe('minute', () => {

        let started;

        beforeEach(() => {
          started = instant.startOf('minute');
        });

        it('stays in the right minute', () => {
          started.year().should.equal(2010);
          started.month().should.equal(2);
          started.day().should.equal(3);
          started.hour().should.equal(4);
          started.minute().should.equal(5);
        });

        it('strips out lower order items', () => {
          started.second().should.equal(0);
          started.millisecond().should.equal(0);
        });
      });

      describe('second', () => {

        let started;

        beforeEach(() => {
          started = instant.startOf('second');
        });

        it('stays in the right minute', () => {
          started.year().should.equal(2010);
          started.month().should.equal(2);
          started.day().should.equal(3);
          started.hour().should.equal(4);
          started.minute().should.equal(5);
          started.second().should.equal(6);
        });

        it('strips out lower order items', () => {
          started.millisecond().should.equal(0);
        });
      });
    });

    describe('#endOf', () => {

      describe('year', () => {

        let ended;

        beforeEach(() => {
          ended = instant.endOf('year');
        });

        it('stays in the right year', () => {
          ended.year().should.equal(2010);
        });

        it('maxes lower order items', () => {
          ended.month().should.equal(12);
          ended.day().should.equal(31);
          ended.hour().should.equal(23);
          ended.minute().should.equal(59);
          ended.second().should.equal(59);
          ended.millisecond().should.equal(999);
        });
      });

      describe('month', () => {

        let ended;

        beforeEach(() => {
          ended = instant.endOf('month');
        });

        it('stays in the right month', () => {
          ended.year().should.equal(2010);
          ended.month().should.equal(2);
        });

        it('maxes lower order items', () => {
          ended.day().should.equal(28);
          ended.hour().should.equal(23);
          ended.minute().should.equal(59);
          ended.second().should.equal(59);
          ended.millisecond().should.equal(999);
        });
      });

      describe('day', () => {

        let ended;

        beforeEach(() => {
          ended = instant.endOf('day');
        });

        it('stays in the right hour', () => {
          ended.year().should.equal(2010);
          ended.month().should.equal(2);
          ended.day().should.equal(3);
        });

        it('maxes lower order items', () => {
          ended.hour().should.equal(23);
          ended.minute().should.equal(59);
          ended.second().should.equal(59);
          ended.millisecond().should.equal(999);
        });
      });

      describe('hour', () => {

        let ended;

        beforeEach(() => {
          ended = instant.endOf('hour');
        });

        it('stays in the right hour', () => {
          ended.year().should.equal(2010);
          ended.month().should.equal(2);
          ended.day().should.equal(3);
          ended.hour().should.equal(4);
        });

        it('maxes lower order items', () => {
          ended.minute().should.equal(59);
          ended.second().should.equal(59);
          ended.millisecond().should.equal(999);
        });
      });

      describe('minute', () => {

        let ended;

        beforeEach(() => {
          ended = instant.endOf('minute');
        });

        it('stays in the right minute', () => {
          ended.year().should.equal(2010);
          ended.month().should.equal(2);
          ended.day().should.equal(3);
          ended.hour().should.equal(4);
          ended.minute().should.equal(5);
        });

        it('maxes lower order items', () => {
          ended.second().should.equal(59);
          ended.millisecond().should.equal(999);
        });
      });

      describe('second', () => {

        let ended;

        beforeEach(() => {
          ended = instant.endOf('second');
        });

        it('stays in the right minute', () => {
          ended.year().should.equal(2010);
          ended.month().should.equal(2);
          ended.day().should.equal(3);
          ended.hour().should.equal(4);
          ended.minute().should.equal(5);
          ended.second().should.equal(6);
        });

        it('maxes lower order items', () => {
          ended.millisecond().should.equal(999);
        });
      });
    });
  });
};
