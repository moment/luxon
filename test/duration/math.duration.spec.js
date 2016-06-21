import {chai} from 'chai';
import {Duration} from 'luxon';

export let math = () => {
  describe('math', () => {

    describe("plus", () => {

      it("add straightforward durations", () => {
        let first = Duration.fromObject({hours: 4, minutes: 12, seconds: 2}),
            second = Duration.fromObject({hours: 1, seconds: 6, milliseconds: 14}),
            result = first.plus(second);

        result.hours().should.equal(5);
        result.minutes().should.equal(12);
        result.seconds().should.equal(8);
        result.milliseconds().should.equal(14);
      });

      it("adds negatives", () => {
        let first = Duration.fromObject({hours: 4, minutes: -12, seconds: -2}),
            second = Duration.fromObject({hours: -5, seconds: 6, milliseconds: 14}),
            result = first.plus(second);

        result.hours().should.equal(-1);
        result.minutes().should.equal(-12);
        result.seconds().should.equal(4);
        result.milliseconds().should.equal(14);
      });

      it("adds single values", () => {
        let first = Duration.fromObject({hours: 4, minutes: 12, seconds: 2}),
            result = first.plus(5, 'minutes');

        result.hours().should.equal(4);
        result.minutes().should.equal(17);
        result.seconds().should.equal(2);
      });
    });

    describe("minus", () => {
      it("subtracts durations", () => {

        let first = Duration.fromObject({hours: 4, minutes: 12, seconds: 2}),
            second = Duration.fromObject({hours: 1, seconds: 6, milliseconds: 14}),
            result = first.minus(second);

        result.hours().should.equal(3);
        result.minutes().should.equal(12);
        result.seconds().should.equal(-4);
        result.milliseconds().should.equal(-14);
      });

      it("subtracts single values", () => {
        let first = Duration.fromObject({hours: 4, minutes: 12, seconds: 2}),
            result = first.minus(5, 'minutes');

        result.hours().should.equal(4);
        result.minutes().should.equal(7);
        result.seconds().should.equal(2);
      });
    });
  });
};
