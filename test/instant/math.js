import {Instant} from 'luxon';
import {FakePT} from '../helpers/fakePT';

function createInstant(){
  return Instant.fromObject({
    year: 2010,
    month: 2,
    day: 3,
    hour: 4,
    minute: 5,
    second: 6,
    millisecond: 7
  });
}

export let math = () => {

  //------
  // #plus()
  //------

  it("Instant#plus(1, 'year') adds a year", () => {
    let i = createInstant().plus(1, 'years');
    expect(i.year()).toBe(2011);
  });

  it("Instant#plus(1, 'day') keeps the same time across a DST", () => {
    let i = Instant.fromISO("2016-03-12T10:00").rezone(new FakePT(), {keepCalendarTime: true}),
        later = i.plus(1, 'day');
    expect(later.day()).toBe(13);
    expect(later.hour()).toBe(10);
  });

  it("Instant#plus(24, 'hours') gains an hour to spring forward", () => {
    let i = Instant.fromISO("2016-03-12T10:00").rezone(new FakePT(), {keepCalendarTime: true}),
        later = i.plus(24, 'hours');
    expect(later.day()).toBe(13);
    expect(later.hour()).toBe(11);
  });

  //------
  // #minus()
  //------

  it("Instant#minus(1, 'year') subtracts a year", () => {
    let i = createInstant().minus(1, 'year');
    expect(i.year()).toBe(2009);
  });

  //------
  // #startOf()
  //------

  it("Instant#startOf('year') goes to the start of the year", () => {
    let i = createInstant().startOf('year');

    expect(i.year()).toBe(2010);

    expect(i.month()).toBe(1);
    expect(i.day()).toBe(1);
    expect(i.hour()).toBe(0);
    expect(i.minute()).toBe(0);
    expect(i.second()).toBe(0);
    expect(i.millisecond()).toBe(0);
  });

  it("Instant#startOf('month') goes to the start of the month", () => {
    let i = createInstant().startOf('month');

    expect(i.year()).toBe(2010);
    expect(i.month()).toBe(2);

    expect(i.day()).toBe(1);
    expect(i.hour()).toBe(0);
    expect(i.minute()).toBe(0);
    expect(i.second()).toBe(0);
    expect(i.millisecond()).toBe(0);
  });

  it("Instant#startOf('day') goes to the start of the day", () => {
    let i = createInstant().startOf('day');

    expect(i.year()).toBe(2010);
    expect(i.month()).toBe(2);
    expect(i.day()).toBe(3);

    expect(i.hour()).toBe(0);
    expect(i.minute()).toBe(0);
    expect(i.second()).toBe(0);
    expect(i.millisecond()).toBe(0);
  });

  it("Instant#startOf('hour') goes to the start of the hour", () => {
    let i = createInstant().startOf('hour');

    expect(i.year()).toBe(2010);
    expect(i.month()).toBe(2);
    expect(i.day()).toBe(3);
    expect(i.hour()).toBe(4);

    expect(i.minute()).toBe(0);
    expect(i.second()).toBe(0);
    expect(i.millisecond()).toBe(0);
  });

  it("Instant#startOf('minute') goes to the start of the minute", () => {
    let i = createInstant().startOf('minute');

    expect(i.year()).toBe(2010);
    expect(i.month()).toBe(2);
    expect(i.day()).toBe(3);
    expect(i.hour()).toBe(4);
    expect(i.minute()).toBe(5);

    expect(i.second()).toBe(0);
    expect(i.millisecond()).toBe(0);
  });

  it("Instant#startOf('second') goes to the start of the second", () => {
    let i = createInstant().startOf('second');

    expect(i.year()).toBe(2010);
    expect(i.month()).toBe(2);
    expect(i.day()).toBe(3);
    expect(i.hour()).toBe(4);
    expect(i.minute()).toBe(5);
    expect(i.second()).toBe(6);

    expect(i.millisecond()).toBe(0);
  });

  //------
  // #endOf()
  //------

  it("Instant#endOf('year') goes to the start of the year", () => {
    let i = createInstant().endOf('year');

    expect(i.year()).toBe(2010);

    expect(i.month()).toBe(12);
    expect(i.day()).toBe(31);
    expect(i.hour()).toBe(23);
    expect(i.minute()).toBe(59);
    expect(i.second()).toBe(59);
    expect(i.millisecond()).toBe(999);
  });

  it("Instant#endOf('month') goes to the start of the month", () => {
    let i = createInstant().endOf('month');

    expect(i.year()).toBe(2010);
    expect(i.month()).toBe(2);

    expect(i.day()).toBe(28);
    expect(i.hour()).toBe(23);
    expect(i.minute()).toBe(59);
    expect(i.second()).toBe(59);
    expect(i.millisecond()).toBe(999);
  });

  it("Instant#endOf('day') goes to the start of the day", () => {
    let i = createInstant().endOf('day');

    expect(i.year()).toBe(2010);
    expect(i.month()).toBe(2);
    expect(i.day()).toBe(3);

    expect(i.hour()).toBe(23);
    expect(i.minute()).toBe(59);
    expect(i.second()).toBe(59);
    expect(i.millisecond()).toBe(999);
  });

  it("Instant#endOf('hour') goes to the start of the hour", () => {
    let i = createInstant().endOf('hour');

    expect(i.year()).toBe(2010);
    expect(i.month()).toBe(2);
    expect(i.day()).toBe(3);
    expect(i.hour()).toBe(4);

    expect(i.minute()).toBe(59);
    expect(i.second()).toBe(59);
    expect(i.millisecond()).toBe(999);
  });

  it("Instant#endOf('minute') goes to the start of the minute", () => {
    let i = createInstant().endOf('minute');

    expect(i.year()).toBe(2010);
    expect(i.month()).toBe(2);
    expect(i.day()).toBe(3);
    expect(i.hour()).toBe(4);
    expect(i.minute()).toBe(5);

    expect(i.second()).toBe(59);
    expect(i.millisecond()).toBe(999);
  });

  it("Instant#endOf('second') goes to the start of the second", () => {
    let i = createInstant().endOf('second');

    expect(i.year()).toBe(2010);
    expect(i.month()).toBe(2);
    expect(i.day()).toBe(3);
    expect(i.hour()).toBe(4);
    expect(i.minute()).toBe(5);
    expect(i.second()).toBe(6);

    expect(i.millisecond()).toBe(999);
  });
};
