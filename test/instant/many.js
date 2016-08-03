import test from 'tape';
import {Instant} from 'luxon';

export let many = () => {

  //------
  // min
  //-------

  test('instant#min returns the only instant if solo', t => {
    let m = Instant.min(Instant.fromJSDate(new Date(1982, 5, 25)));
    t.ok(m);
    t.is(m.valueOf(), Instant.fromJSDate(new Date(1982, 5, 25)).valueOf());
    t.end();
  });

  test('instant#min returns the min instant', t => {
    let m = Instant.min(
      Instant.fromJSDate(new Date(1982, 5, 25)),
      Instant.fromJSDate(new Date(1982, 3, 25)),
      Instant.fromJSDate(new Date(1982, 3, 26))
    );
    t.is(m.valueOf(), Instant.fromJSDate(new Date(1982, 3, 25)).valueOf());
    t.end();
  });

  test('instant#min is stable', t => {
    let m = Instant.min(
      Instant.fromJSDate(new Date(1982, 5, 25)),
      Instant.fromJSDate(new Date(1982, 3, 25)).locale('en-uk'),
      Instant.fromJSDate(new Date(1982, 3, 25)).locale('en-us'));
    t.is(m.locale(), 'en-uk');
    t.end();
  });

  //------
  // max
  //-------

  test('instant#max returns the only instant if solo', t => {
    let m = Instant.max(Instant.fromJSDate(new Date(1982, 5, 25)));
    t.ok(m);
    t.is(m.valueOf(), Instant.fromJSDate(new Date(1982, 5, 25)).valueOf());
    t.end();
  });

  test('instant#max returns the max instant', t => {
    let m = Instant.max(
      Instant.fromJSDate(new Date(1982, 5, 25)),
      Instant.fromJSDate(new Date(1982, 3, 25)),
      Instant.fromJSDate(new Date(1982, 3, 26))
    );
    t.is(m.valueOf(), Instant.fromJSDate(new Date(1982, 5, 25)).valueOf());
    t.end();
  });

  test('instant#max is stable', t => {
    let m = Instant.max(
      Instant.fromJSDate(new Date(1982, 2, 25)),
      Instant.fromJSDate(new Date(1982, 3, 25)).locale('en-uk'),
      Instant.fromJSDate(new Date(1982, 3, 25)).locale('en-us')
    );
    t.is(m.locale(), 'en-uk');
    t.end();
  });
};
