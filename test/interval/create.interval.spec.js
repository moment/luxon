import {chai} from 'chai';
import {Instant, Interval, Duration} from 'luxon';

export let create = () => {
  describe('create', () => {

    describe("fromInstants", () => {

      it("sets start and end", () => {

        let start = Instant.fromObject({year: 2016, month: 5, day: 25}),
            end = Instant.fromObject({year: 2016, month: 5, day: 27}),
            int = Interval.fromInstants(start, end);

        int.start().should.equal(start);
        int.end().should.equal(end);
      });
    });

    describe("after", () => {

      it("takes a duration", () => {
        let start = Instant.fromObject({year: 2016, month: 5, day: 25}),
            int = Interval.after(start, Duration.fromObject({days: 3}));

        int.start().should.equal(start);
        int.end().day().should.equal(28);
      });

      it("takes a number and unit", () => {

        let start = Instant.fromObject({year: 2016, month: 5, day: 25}),
            int = Interval.after(start, 3, 'days');

        int.start().should.equal(start);
        int.end().day().should.equal(28);
      });
    });

    describe("before", () => {
      it("takes a duration", () => {
        let end = Instant.fromObject({year: 2016, month: 5, day: 25}),
            int = Interval.before(end, Duration.fromObject({days: 3}));

        int.start().day().should.equal(22);
        int.end().should.equal(end);
      });

      it("takes a number and unit", () => {

        let end = Instant.fromObject({year: 2016, month: 5, day: 25}),
            int = Interval.before(end, 3, 'days');

        int.start().day().should.equal(22);
        int.end().should.equal(end);
      });
    });
  });
};
