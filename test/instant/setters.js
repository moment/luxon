import {Instant} from 'luxon';

export let setters = () => {

  let instant = () => Instant.fromJSDate(new Date(1982, 4, 25, 9, 23, 54, 123));

  //------
  // year/month/day/hour/minute/second/millisecond
  //-------

  it('Instant#year() sets the year', () => {
    expect(instant().year(2012).year()).toBe(2012);
  });

  it('Instant#month() sets the (1-indexed) month', () => {
    expect(instant().month(2).month()).toBe(2);
    expect(instant().month(2).hour()).toBe(9); //this will cross a DST for many people
  });

  it('Instant#day() sets the day', () => {
    expect(instant().day(5).day()).toBe(5);
  });

  it('Instant#hour() sets the hour', () => {
    expect(instant().hour(4).hour()).toBe(4);
  });

  it('Instant#minute() sets the minute', () => {
    expect(instant().minute(16).minute()).toBe(16);
  });

  it('Instant#second() sets the second', () => {
    expect(instant().second(45).second()).toBe(45);
  });

  it('Instant#millisecond() sets the millisecond', () => {
    expect(instant().millisecond(86).millisecond()).toBe(86);
  });
};
