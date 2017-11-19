/* global test expect */
import { DateTime } from '../../src/luxon';
import { InvalidArgumentError } from '../../src/luxon';

//------
// .fromString
//-------
test('DateTime.fromString() parses basic times', () => {
  const i = DateTime.fromString('1982/05/25 09:10:11.445', 'yyyy/MM/dd HH:mm:ss.SSS');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);
  expect(i.hour).toBe(9);
  expect(i.minute).toBe(10);
  expect(i.second).toBe(11);
  expect(i.millisecond).toBe(445);
});

test('DateTime.fromString() parses with variable-length inpus', () => {
  let i = DateTime.fromString('1982/05/03 09:07:05.004', 'yy/M/d H:m:s.S');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(3);
  expect(i.hour).toBe(9);
  expect(i.minute).toBe(7);
  expect(i.second).toBe(5);
  expect(i.millisecond).toBe(4);

  i = DateTime.fromString('82/5/3 9:7:5.4', 'yy/M/d H:m:s.S');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(3);
  expect(i.hour).toBe(9);
  expect(i.minute).toBe(7);
  expect(i.second).toBe(5);
  expect(i.millisecond).toBe(4);
});

test('DateTime.fromString() parses meridiems', () => {
  let i = DateTime.fromString('1982/05/25 9 PM', 'yyyy/MM/dd h a');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);
  expect(i.hour).toBe(21);

  i = DateTime.fromString('1982/05/25 9 AM', 'yyyy/MM/dd h a');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);
  expect(i.hour).toBe(9);
});

test('DateTime.fromString() parses hours', () => {
  expect(DateTime.fromString('5', 'h').hour).toBe(5);
  expect(DateTime.fromString('12', 'h').hour).toBe(12);
  expect(DateTime.fromString('05', 'hh').hour).toBe(5);
  expect(DateTime.fromString('12', 'hh').hour).toBe(12);
  expect(DateTime.fromString('5', 'H').hour).toBe(5);
  expect(DateTime.fromString('13', 'H').hour).toBe(13);
  expect(DateTime.fromString('05', 'HH').hour).toBe(5);
  expect(DateTime.fromString('13', 'HH').hour).toBe(13);
});

test('DateTime.fromString() parses weekdays', () => {
  expect(DateTime.fromString('5', 'E').weekday).toBe(5);
  expect(DateTime.fromString('5', 'c').weekday).toBe(5);

  expect(DateTime.fromString('Fri', 'EEE').weekday).toBe(5);
  expect(DateTime.fromString('Fri', 'ccc').weekday).toBe(5);

  expect(DateTime.fromString('Friday', 'EEEE').weekday).toBe(5);
  expect(DateTime.fromString('Friday', 'cccc').weekday).toBe(5);
});

test('DateTime.fromString() parses eras', () => {
  let dt = DateTime.fromString('0206 AD', 'yyyy G');
  expect(dt.year).toEqual(206);

  dt = DateTime.fromString('0206 BC', 'yyyy G');
  expect(dt.year).toEqual(-206);

  dt = DateTime.fromString('0206 Before Christ', 'yyyy GG');
  expect(dt.year).toEqual(-206);
});

test('DateTime.fromString() parses standalone month names', () => {
  let i = DateTime.fromString('May 25 1982', 'LLLL dd yyyy');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromString('Sep 25 1982', 'LLL dd yyyy');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(9);
  expect(i.day).toBe(25);

  i = DateTime.fromString('5 25 1982', 'L dd yyyy');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromString('05 25 1982', 'LL dd yyyy');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromString('mai 25 1982', 'LLLL dd yyyy', { locale: 'fr' });
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromString('janv. 25 1982', 'LLL dd yyyy', { locale: 'fr' });
  expect(i.year).toBe(1982);
  expect(i.month).toBe(1);
  expect(i.day).toBe(25);
});

test('DateTime.fromString() parses format month names', () => {
  let i = DateTime.fromString('May 25 1982', 'MMMM dd yyyy');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromString('Sep 25 1982', 'MMM dd yyyy');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(9);
  expect(i.day).toBe(25);

  i = DateTime.fromString('5 25 1982', 'M dd yyyy');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromString('05 25 1982', 'MM dd yyyy');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromString('mai 25 1982', 'MMMM dd yyyy', { locale: 'fr' });
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromString('janv. 25 1982', 'MMM dd yyyy', { locale: 'fr' });
  expect(i.year).toBe(1982);
  expect(i.month).toBe(1);
  expect(i.day).toBe(25);
});

test('DateTime.fromString() makes trailing periods in month names optional', () => {
  const i = DateTime.fromString('janv 25 1982', 'LLL dd yyyy', {
    locale: 'fr'
  });
  expect(i.year).toBe(1982);
  expect(i.month).toBe(1);
  expect(i.day).toBe(25);
});

test('DateTime.fromString() does not match arbitrary stuff with those periods', () => {
  const i = DateTime.fromString('janvQ 25 1982', 'LLL dd yyyy', {
    locale: 'fr'
  });
  expect(i.isValid).toBe(false);
});

test('DateTime.fromString() uses case-insensitive matching', () => {
  const i = DateTime.fromString('Janv. 25 1982', 'LLL dd yyyy', {
    locale: 'fr'
  });
  expect(i.year).toBe(1982);
  expect(i.month).toBe(1);
  expect(i.day).toBe(25);
});

test('DateTime.fromString() defaults yy to the right century', () => {});

test('DateTime.fromString() parses offsets', () => {});

test('DateTime.fromString() validates weekday numbers', () => {
  let d = DateTime.fromString('2, 05/25/1982', 'E, LL/dd/yyyy');
  expect(d.year).toBe(1982);
  expect(d.month).toBe(5);
  expect(d.day).toBe(25);

  d = DateTime.fromString('1, 05/25/1982', 'E, LL/dd/yyyy');
  expect(d.isValid).toBeFalsy();
});

test('DateTime.fromString() validates weekday names', () => {
  let d = DateTime.fromString('Tuesday, 05/25/1982', 'EEEE, LL/dd/yyyy');
  expect(d.isValid).toBe(true);
  expect(d.year).toBe(1982);
  expect(d.month).toBe(5);
  expect(d.day).toBe(25);

  d = DateTime.fromString('Monday, 05/25/1982', 'EEEE, LL/dd/yyyy');
  expect(d.isValid).toBeFalsy();

  d = DateTime.fromString('mardi, 05/25/1982', 'EEEE, LL/dd/yyyy', {
    locale: 'fr'
  });
  expect(d.isValid).toBe(true);
  expect(d.year).toBe(1982);
  expect(d.month).toBe(5);
  expect(d.day).toBe(25);
});

test('DateTime.fromString() defaults weekday to this week', () => {
  const d = DateTime.fromString('Monday', 'EEEE'),
    now = DateTime.local();
  expect(d.weekYear).toBe(now.weekYear);
  expect(d.weekNumber).toBe(now.weekNumber);
  expect(d.weekday).toBe(1);

  const d2 = DateTime.fromString('3', 'E');
  expect(d2.weekYear).toBe(now.weekYear);
  expect(d2.weekNumber).toBe(now.weekNumber);
  expect(d2.weekday).toBe(3);
});

test('DateTime.fromString() parses ordinals', () => {
  let d = DateTime.fromString('2016 200', 'yyyy ooo');
  expect(d.year).toBe(2016);
  expect(d.ordinal).toBe(200);

  d = DateTime.fromString('2016 200', 'yyyy ooo');
  expect(d.year).toBe(2016);
  expect(d.ordinal).toBe(200);

  d = DateTime.fromString('2016 016', 'yyyy ooo');
  expect(d.year).toBe(2016);
  expect(d.ordinal).toBe(16);

  d = DateTime.fromString('2016 200', 'yyyy o');
  expect(d.year).toBe(2016);
  expect(d.ordinal).toBe(200);

  d = DateTime.fromString('2016 16', 'yyyy o');
  expect(d.year).toBe(2016);
  expect(d.ordinal).toBe(16);
});

test('DateTime.fromString() throws on mixed units', () => {
  expect(() => {
    DateTime.fromString('2017 34', 'yyyy WW');
  }).toThrow();

  expect(() => {
    DateTime.fromString('2017 05 340', 'yyyy MM ooo');
  }).toThrow();
});

test('DateTime.fromString() accepts weekYear by itself', () => {
  let d = DateTime.fromString('2004', 'kkkk');
  expect(d.weekYear).toBe(2004);
  expect(d.weekNumber).toBe(1);
  expect(d.weekday).toBe(1);

  d = DateTime.fromString('04', 'kk');
  expect(d.weekYear).toBe(2004);
  expect(d.weekNumber).toBe(1);
  expect(d.weekday).toBe(1);
});

test('DateTime.fromString() accepts weekNumber by itself', () => {
  const now = DateTime.local();

  let d = DateTime.fromString('17', 'WW');
  expect(d.weekYear).toBe(now.weekYear);
  expect(d.weekNumber).toBe(17);
  expect(d.weekday).toBe(1);

  d = DateTime.fromString('17', 'W');
  expect(d.weekYear).toBe(now.weekYear);
  expect(d.weekNumber).toBe(17);
  expect(d.weekday).toBe(1);
});

test('DateTime.fromString() accepts weekYear/weekNumber/weekday', () => {
  const d = DateTime.fromString('2004 17 2', 'kkkk WW E');
  expect(d.weekYear).toBe(2004);
  expect(d.weekNumber).toBe(17);
  expect(d.weekday).toBe(2);
});

test('DateTime.fromString() allows regex content', () => {
  const d = DateTime.fromString('Monday', 'EEEE'),
    now = DateTime.local();
  expect(d.weekYear).toBe(now.weekYear);
  expect(d.weekNumber).toBe(now.weekNumber);
  expect(d.weekday).toBe(1);
});

test('DateTime.fromString() allows literals', () => {
  const i = DateTime.fromString('1982/05/25 hello 09:10:11.445', "yyyy/MM/dd 'hello' HH:mm:ss.SSS");

  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);
  expect(i.hour).toBe(9);
  expect(i.minute).toBe(10);
  expect(i.second).toBe(11);
  expect(i.millisecond).toBe(445);
});

test('DateTime.fromString() returns invalid when unparsed', () => {
  expect(DateTime.fromString('Splurk', 'EEEE').isValid).toBe(false);
});

test('DateTime.fromString() returns invalid for out-of-range values', () => {
  const rejects = (s, fmt, opts = {}) =>
    expect(DateTime.fromString(s, fmt, opts).isValid).toBeFalsy();

  rejects('8, 05/25/1982', 'E, MM/dd/yyyy', { locale: 'fr' });
  rejects('Tuesday, 05/25/1982', 'EEEE, MM/dd/yyyy', { locale: 'fr' });
  rejects('Giberish, 05/25/1982', 'EEEE, MM/dd/yyyy');
  rejects('14/25/1982', 'MM/dd/yyyy');
  rejects('05/46/1982', 'MM/dd/yyyy');
});

test('DateTime.fromString() accepts a zone argument', () => {
  const d = DateTime.fromString('1982/05/25 09:10:11.445', 'yyyy/MM/dd HH:mm:ss.SSS', {
    zone: 'Asia/Tokyo'
  });
  expect(d.zoneName).toBe('Asia/Tokyo');
  expect(d.offset).toBe(9 * 60);
  expect(d.year).toBe(1982);
  expect(d.month).toBe(5);
  expect(d.day).toBe(25);
  expect(d.hour).toBe(9);
  expect(d.minute).toBe(10);
  expect(d.second).toBe(11);
  expect(d.millisecond).toBe(445);
});

test('DateTime.fromString() parses IANA zones', () => {
  const d = DateTime.fromString(
    '1982/05/25 09:10:11.445 Asia/Tokyo',
    'yyyy/MM/dd HH:mm:ss.SSS z'
  ).toUTC();
  expect(d.offset).toBe(0);
  expect(d.hour).toBe(0);
  expect(d.minute).toBe(10);
});

test('DateTime.fromString() with setZone parses IANA zones and sets it', () => {
  const d = DateTime.fromString('1982/05/25 09:10:11.445 Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss.SSS z', {
    setZone: true
  });
  expect(d.zoneName).toBe('Asia/Tokyo');
  expect(d.offset).toBe(9 * 60);
  expect(d.hour).toBe(9);
  expect(d.minute).toBe(10);
});

test('DateTime.fromString() parses fixed offsets', () => {
  const formats = [['Z', '-4'], ['ZZ', '-4:00'], ['ZZZ', '-0400']];

  for (const i in formats) {
    if (formats.hasOwnProperty(i)) {
      const [format, example] = formats[i],
        dt = DateTime.fromString(
          `1982/05/25 09:10:11.445 ${example}`,
          `yyyy/MM/dd HH:mm:ss.SSS ${format}`
        );
      expect(dt.toUTC().hour).toBe(13);
      expect(dt.toUTC().minute).toBe(10);
    }
  }
});

test('DateTime.fromString() with setZone parses fixed offsets and sets it', () => {
  const formats = [['Z', '-4'], ['ZZ', '-4:00'], ['ZZZ', '-0400']];

  for (const i in formats) {
    if (formats.hasOwnProperty(i)) {
      const [format, example] = formats[i],
        dt = DateTime.fromString(
          `1982/05/25 09:10:11.445 ${example}`,
          `yyyy/MM/dd HH:mm:ss.SSS ${format}`,
          { setZone: true }
        );
      expect(dt.offset).toBe(-4 * 60);
      expect(dt.toUTC().hour).toBe(13);
      expect(dt.toUTC().minute).toBe(10);
    }
  }
});

test("DateTime.fromString() throws if you don't provide a format", () => {
  expect(() => DateTime.fromString('yo')).toThrowError(InvalidArgumentError);
});
