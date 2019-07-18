import { DateTime } from "../../src/luxon";

const dateTime = DateTime.fromJSDate(new Date(1982, 4, 25, 9, 23, 54, 123));

//------
// #toObject
//-------
test("DateTime#toObject returns the object", () => {
  expect(dateTime.toObject()).toEqual({
    year: 1982,
    month: 5,
    day: 25,
    hour: 9,
    minute: 23,
    second: 54,
    millisecond: 123
  });
});
