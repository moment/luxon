import {Instant} from 'luxon';

export let many = () => {

  //------
  // min
  //-------

  it('instant#min returns the only instant if solo', () => {
    let m = Instant.min(Instant.fromJSDate(new Date(1982, 5, 25)));
    expect(m).toBeTruthy();
    expect(m.valueOf()).toBe(Instant.fromJSDate(new Date(1982, 5, 25)).valueOf());
  });

  it('instant#min returns the min instant', () => {
    let m = Instant.min(
      Instant.fromJSDate(new Date(1982, 5, 25)),
      Instant.fromJSDate(new Date(1982, 3, 25)),
      Instant.fromJSDate(new Date(1982, 3, 26))
    );
    expect(m.valueOf()).toBe(Instant.fromJSDate(new Date(1982, 3, 25)).valueOf());
  });

  it('instant#min is stable', () => {
    let m = Instant.min(
      Instant.fromJSDate(new Date(1982, 5, 25)),
      Instant.fromJSDate(new Date(1982, 3, 25)).locale('en-uk'),
      Instant.fromJSDate(new Date(1982, 3, 25)).locale('en-us'));
    expect(m.locale()).toBe('en-uk');
  });

  //------
  // max
  //-------

  it('instant#max returns the only instant if solo', () => {
    let m = Instant.max(Instant.fromJSDate(new Date(1982, 5, 25)));
    expect(m).toBeTruthy();
    expect(m.valueOf()).toBe(Instant.fromJSDate(new Date(1982, 5, 25)).valueOf());
  });

  it('instant#max returns the max instant', () => {
    let m = Instant.max(
      Instant.fromJSDate(new Date(1982, 5, 25)),
      Instant.fromJSDate(new Date(1982, 3, 25)),
      Instant.fromJSDate(new Date(1982, 3, 26))
    );
    expect(m.valueOf()).toBe(Instant.fromJSDate(new Date(1982, 5, 25)).valueOf());
  });

  it('instant#max is stable', () => {
    let m = Instant.max(
      Instant.fromJSDate(new Date(1982, 2, 25)),
      Instant.fromJSDate(new Date(1982, 3, 25)).locale('en-uk'),
      Instant.fromJSDate(new Date(1982, 3, 25)).locale('en-us')
    );
    expect(m.locale()).toBe('en-uk');
  });
};
