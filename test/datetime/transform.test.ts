import { DateTime } from "../../src";

const dtMaker = () =>
    DateTime.fromObject(
      {
        year: 1982,
        month: 5,
        day: 25,
        hour: 9,
        minute: 23,
        second: 54,
        millisecond: 123
      },
      {
        zone: "utc"
      }
    ),
  dt = dtMaker();

//------
// #toMillis()
//------
test("DateTime#toMillis() returns milliseconds for valid DateTimes", () => {
  const js = dt.toJSDate();
  expect(dt.toMillis()).toBe(js.getTime());
});

//------
// #toSeconds()
//------
test("DateTime#toSeconds() returns seconds for valid DateTimes", () => {
  const js = dt.toJSDate();
  expect(dt.toSeconds()).toBe(js.getTime() / 1000);
});

//------
// #valueOf()
//------
test("DateTime#valueOf() just does toMillis()", () => {
  expect(dt.valueOf()).toBe(dt.toMillis());
});

//------
// #toJSDate()
//------
test("DateTime#toJSDate() returns a native Date equivalent", () => {
  const js = dt.toJSDate();
  expect(js).toBeInstanceOf(Date);
  expect(js.getTime()).toBe(dt.toMillis());
});

//------
// #toBSON()
//------
test("DateTime#toBSON() return a BSON serializable equivalent", () => {
  const js = dt.toBSON();
  expect(js).toBeInstanceOf(Date);
  expect(js.getTime()).toBe(dt.toMillis());
});
