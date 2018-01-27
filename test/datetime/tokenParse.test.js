/* global test expect */
import { DateTime, InvalidArgumentError } from '../../src/luxon';

//------
// .fromFormat
//-------
test('DateTime.fromFormat() parses basic times', () => {
  const i = DateTime.fromFormat('1982/05/25 09:10:11.445', 'yyyy/MM/dd HH:mm:ss.SSS');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);
  expect(i.hour).toBe(9);
  expect(i.minute).toBe(10);
  expect(i.second).toBe(11);
  expect(i.millisecond).toBe(445);
});

test('DateTime.fromFormat() parses with variable-length inpus', () => {
  let i = DateTime.fromFormat('1982/05/03 09:07:05.004', 'y/M/d H:m:s.S');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(3);
  expect(i.hour).toBe(9);
  expect(i.minute).toBe(7);
  expect(i.second).toBe(5);
  expect(i.millisecond).toBe(4);

  i = DateTime.fromFormat('82/5/3 9:7:5.4', 'yy/M/d H:m:s.S');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(3);
  expect(i.hour).toBe(9);
  expect(i.minute).toBe(7);
  expect(i.second).toBe(5);
  expect(i.millisecond).toBe(4);
});

test('DateTime.fromFormat() parses meridiems', () => {
  let i = DateTime.fromFormat('1982/05/25 9 PM', 'yyyy/MM/dd h a');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);
  expect(i.hour).toBe(21);

  i = DateTime.fromFormat('1982/05/25 9 AM', 'yyyy/MM/dd h a');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);
  expect(i.hour).toBe(9);

  i = DateTime.fromFormat('1982/05/25 12 AM', 'yyyy/MM/dd h a');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);
  expect(i.hour).toBe(0);

  i = DateTime.fromFormat('1982/05/25 12 PM', 'yyyy/MM/dd h a');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);
  expect(i.hour).toBe(12);
});

test('DateTime.fromFormat() parses variable-digit years', () => {
  expect(DateTime.fromFormat('', 'y').isValid).toBe(false);
  expect(DateTime.fromFormat('2', 'y').year).toBe(2);
  expect(DateTime.fromFormat('22', 'y').year).toBe(22);
  expect(DateTime.fromFormat('222', 'y').year).toBe(222);
  expect(DateTime.fromFormat('2222', 'y').year).toBe(2222);
  expect(DateTime.fromFormat('22222', 'y').year).toBe(22222);
  expect(DateTime.fromFormat('222222', 'y').year).toBe(222222);
  expect(DateTime.fromFormat('2222222', 'y').isValid).toBe(false);
});

test('DateTime.fromFormat() with yyyyy optionally parses extended years', () => {
  expect(DateTime.fromFormat('222', 'yyyyy').isValid).toBe(false);
  expect(DateTime.fromFormat('2222', 'yyyyy').year).toBe(2222);
  expect(DateTime.fromFormat('22222', 'yyyyy').year).toBe(22222);
  expect(DateTime.fromFormat('222222', 'yyyyy').year).toBe(222222);
  expect(DateTime.fromFormat('2222222', 'yyyyy').isValid).toBe(false);
});

test('DateTime.fromFormat() with yyyyyy strictly parses extended years', () => {
  expect(DateTime.fromFormat('2222', 'yyyyyy').isValid).toBe(false);
  expect(DateTime.fromFormat('222222', 'yyyyyy').year).toBe(222222);
  expect(DateTime.fromFormat('022222', 'yyyyyy').year).toBe(22222);
  expect(DateTime.fromFormat('2222222', 'yyyyyy').isValid).toBe(false);
});

test('DateTime.fromFormat() defaults yy to the right century', () => {
  expect(DateTime.fromFormat('55', 'yy').year).toBe(2055);
  expect(DateTime.fromFormat('70', 'yy').year).toBe(1970);
  expect(DateTime.fromFormat('1970', 'yy').year).toBe(1970);
});

test('DateTime.fromFormat() parses hours', () => {
  expect(DateTime.fromFormat('5', 'h').hour).toBe(5);
  expect(DateTime.fromFormat('12', 'h').hour).toBe(12);
  expect(DateTime.fromFormat('05', 'hh').hour).toBe(5);
  expect(DateTime.fromFormat('12', 'hh').hour).toBe(12);
  expect(DateTime.fromFormat('5', 'H').hour).toBe(5);
  expect(DateTime.fromFormat('13', 'H').hour).toBe(13);
  expect(DateTime.fromFormat('05', 'HH').hour).toBe(5);
  expect(DateTime.fromFormat('13', 'HH').hour).toBe(13);
});

test('DateTime.fromFormat() parses milliseconds', () => {
  expect(DateTime.fromFormat('1', 'S').millisecond).toBe(1);
  expect(DateTime.fromFormat('12', 'S').millisecond).toBe(12);
  expect(DateTime.fromFormat('123', 'S').millisecond).toBe(123);
  expect(DateTime.fromFormat('1234', 'S').isValid).toBe(false);

  expect(DateTime.fromFormat('1', 'S').millisecond).toBe(1);
  expect(DateTime.fromFormat('12', 'S').millisecond).toBe(12);
  expect(DateTime.fromFormat('123', 'S').millisecond).toBe(123);

  expect(DateTime.fromFormat('1', 'SSS').isValid).toBe(false);
  expect(DateTime.fromFormat('12', 'SSS').isValid).toBe(false);
  expect(DateTime.fromFormat('123', 'SSS').millisecond).toBe(123);
  expect(DateTime.fromFormat('023', 'SSS').millisecond).toBe(23);
  expect(DateTime.fromFormat('1234', 'SSS').isValid).toBe(false);
});

test('DateTime.fromFormat() parses fractional seconds', () => {
  expect(DateTime.fromFormat('1', 'u').millisecond).toBe(100);
  expect(DateTime.fromFormat('12', 'u').millisecond).toBe(120);
  expect(DateTime.fromFormat('123', 'u').millisecond).toBe(123);
  expect(DateTime.fromFormat('023', 'u').millisecond).toBe(23);
  expect(DateTime.fromFormat('003', 'u').millisecond).toBe(3);
  expect(DateTime.fromFormat('1234', 'u').millisecond).toBe(123);
  expect(DateTime.fromFormat('1235', 'u').millisecond).toBe(123);
});

test('DateTime.fromFormat() parses weekdays', () => {
  expect(DateTime.fromFormat('5', 'E').weekday).toBe(5);
  expect(DateTime.fromFormat('5', 'c').weekday).toBe(5);

  expect(DateTime.fromFormat('Fri', 'EEE').weekday).toBe(5);
  expect(DateTime.fromFormat('Fri', 'ccc').weekday).toBe(5);

  expect(DateTime.fromFormat('Friday', 'EEEE').weekday).toBe(5);
  expect(DateTime.fromFormat('Friday', 'cccc').weekday).toBe(5);
});

test('DateTime.fromFormat() parses eras', () => {
  let dt = DateTime.fromFormat('0206 AD', 'yyyy G');
  expect(dt.year).toEqual(206);

  dt = DateTime.fromFormat('0206 BC', 'yyyy G');
  expect(dt.year).toEqual(-206);

  dt = DateTime.fromFormat('0206 Before Christ', 'yyyy GG');
  expect(dt.year).toEqual(-206);
});

test('DateTime.fromFormat() parses standalone month names', () => {
  let i = DateTime.fromFormat('May 25 1982', 'LLLL dd yyyy');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat('Sep 25 1982', 'LLL dd yyyy');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(9);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat('5 25 1982', 'L dd yyyy');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat('05 25 1982', 'LL dd yyyy');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat('mai 25 1982', 'LLLL dd yyyy', { locale: 'fr' });
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat('janv. 25 1982', 'LLL dd yyyy', { locale: 'fr' });
  expect(i.year).toBe(1982);
  expect(i.month).toBe(1);
  expect(i.day).toBe(25);
});

test('DateTime.fromFormat() parses format month names', () => {
  let i = DateTime.fromFormat('May 25 1982', 'MMMM dd yyyy');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat('Sep 25 1982', 'MMM dd yyyy');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(9);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat('5 25 1982', 'M dd yyyy');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat('05 25 1982', 'MM dd yyyy');
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat('mai 25 1982', 'MMMM dd yyyy', { locale: 'fr' });
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  i = DateTime.fromFormat('janv. 25 1982', 'MMM dd yyyy', { locale: 'fr' });
  expect(i.year).toBe(1982);
  expect(i.month).toBe(1);
  expect(i.day).toBe(25);
});

test('DateTime.fromFormat() makes trailing periods in month names optional', () => {
  const i = DateTime.fromFormat('janv 25 1982', 'LLL dd yyyy', {
    locale: 'fr'
  });
  expect(i.year).toBe(1982);
  expect(i.month).toBe(1);
  expect(i.day).toBe(25);
});

test('DateTime.fromFormat() does not match arbitrary stuff with those periods', () => {
  const i = DateTime.fromFormat('janvQ 25 1982', 'LLL dd yyyy', {
    locale: 'fr'
  });
  expect(i.isValid).toBe(false);
});

test('DateTime.fromFormat() uses case-insensitive matching', () => {
  const i = DateTime.fromFormat('Janv. 25 1982', 'LLL dd yyyy', {
    locale: 'fr'
  });
  expect(i.year).toBe(1982);
  expect(i.month).toBe(1);
  expect(i.day).toBe(25);
});

test('DateTime.fromFormat() parses offsets', () => {});

test('DateTime.fromFormat() validates weekday numbers', () => {
  let d = DateTime.fromFormat('2, 05/25/1982', 'E, LL/dd/yyyy');
  expect(d.year).toBe(1982);
  expect(d.month).toBe(5);
  expect(d.day).toBe(25);

  d = DateTime.fromFormat('1, 05/25/1982', 'E, LL/dd/yyyy');
  expect(d.isValid).toBeFalsy();
});

test('DateTime.fromFormat() validates weekday names', () => {
  let d = DateTime.fromFormat('Tuesday, 05/25/1982', 'EEEE, LL/dd/yyyy');
  expect(d.isValid).toBe(true);
  expect(d.year).toBe(1982);
  expect(d.month).toBe(5);
  expect(d.day).toBe(25);

  d = DateTime.fromFormat('Monday, 05/25/1982', 'EEEE, LL/dd/yyyy');
  expect(d.isValid).toBeFalsy();

  d = DateTime.fromFormat('mardi, 05/25/1982', 'EEEE, LL/dd/yyyy', {
    locale: 'fr'
  });
  expect(d.isValid).toBe(true);
  expect(d.year).toBe(1982);
  expect(d.month).toBe(5);
  expect(d.day).toBe(25);
});

test('DateTime.fromFormat() defaults weekday to this week', () => {
  const d = DateTime.fromFormat('Monday', 'EEEE'),
    now = DateTime.local();
  expect(d.weekYear).toBe(now.weekYear);
  expect(d.weekNumber).toBe(now.weekNumber);
  expect(d.weekday).toBe(1);

  const d2 = DateTime.fromFormat('3', 'E');
  expect(d2.weekYear).toBe(now.weekYear);
  expect(d2.weekNumber).toBe(now.weekNumber);
  expect(d2.weekday).toBe(3);
});

test('DateTime.fromFormat() parses ordinals', () => {
  let d = DateTime.fromFormat('2016 200', 'yyyy ooo');
  expect(d.year).toBe(2016);
  expect(d.ordinal).toBe(200);

  d = DateTime.fromFormat('2016 200', 'yyyy ooo');
  expect(d.year).toBe(2016);
  expect(d.ordinal).toBe(200);

  d = DateTime.fromFormat('2016 016', 'yyyy ooo');
  expect(d.year).toBe(2016);
  expect(d.ordinal).toBe(16);

  d = DateTime.fromFormat('2016 200', 'yyyy o');
  expect(d.year).toBe(2016);
  expect(d.ordinal).toBe(200);

  d = DateTime.fromFormat('2016 16', 'yyyy o');
  expect(d.year).toBe(2016);
  expect(d.ordinal).toBe(16);
});

test('DateTime.fromFormat() throws on mixed units', () => {
  expect(() => {
    DateTime.fromFormat('2017 34', 'yyyy WW');
  }).toThrow();

  expect(() => {
    DateTime.fromFormat('2017 05 340', 'yyyy MM ooo');
  }).toThrow();
});

test('DateTime.fromFormat() accepts weekYear by itself', () => {
  let d = DateTime.fromFormat('2004', 'kkkk');
  expect(d.weekYear).toBe(2004);
  expect(d.weekNumber).toBe(1);
  expect(d.weekday).toBe(1);

  d = DateTime.fromFormat('04', 'kk');
  expect(d.weekYear).toBe(2004);
  expect(d.weekNumber).toBe(1);
  expect(d.weekday).toBe(1);
});

test('DateTime.fromFormat() accepts weekNumber by itself', () => {
  const now = DateTime.local();

  let d = DateTime.fromFormat('17', 'WW');
  expect(d.weekYear).toBe(now.weekYear);
  expect(d.weekNumber).toBe(17);
  expect(d.weekday).toBe(1);

  d = DateTime.fromFormat('17', 'W');
  expect(d.weekYear).toBe(now.weekYear);
  expect(d.weekNumber).toBe(17);
  expect(d.weekday).toBe(1);
});

test('DateTime.fromFormat() accepts weekYear/weekNumber/weekday', () => {
  const d = DateTime.fromFormat('2004 17 2', 'kkkk WW E');
  expect(d.weekYear).toBe(2004);
  expect(d.weekNumber).toBe(17);
  expect(d.weekday).toBe(2);
});

test('DateTime.fromFormat() allows regex content', () => {
  const d = DateTime.fromFormat('Monday', 'EEEE'),
    now = DateTime.local();
  expect(d.weekYear).toBe(now.weekYear);
  expect(d.weekNumber).toBe(now.weekNumber);
  expect(d.weekday).toBe(1);
});

test('DateTime.fromFormat() allows literals', () => {
  const i = DateTime.fromFormat('1982/05/25 hello 09:10:11.445', "yyyy/MM/dd 'hello' HH:mm:ss.SSS");

  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);
  expect(i.hour).toBe(9);
  expect(i.minute).toBe(10);
  expect(i.second).toBe(11);
  expect(i.millisecond).toBe(445);
});

test('DateTime.fromFormat() returns invalid when unparsed', () => {
  expect(DateTime.fromFormat('Splurk', 'EEEE').isValid).toBe(false);
});

test('DateTime.fromFormat() returns invalid for out-of-range values', () => {
  const rejects = (s, fmt, opts = {}) =>
    expect(DateTime.fromFormat(s, fmt, opts).isValid).toBeFalsy();

  rejects('8, 05/25/1982', 'E, MM/dd/yyyy', { locale: 'fr' });
  rejects('Tuesday, 05/25/1982', 'EEEE, MM/dd/yyyy', { locale: 'fr' });
  rejects('Giberish, 05/25/1982', 'EEEE, MM/dd/yyyy');
  rejects('14/25/1982', 'MM/dd/yyyy');
  rejects('05/46/1982', 'MM/dd/yyyy');
});

test('DateTime.fromFormat() accepts a zone argument', () => {
  const d = DateTime.fromFormat('1982/05/25 09:10:11.445', 'yyyy/MM/dd HH:mm:ss.SSS', {
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

test('DateTime.fromFormat() parses IANA zones', () => {
  const d = DateTime.fromFormat(
    '1982/05/25 09:10:11.445 Asia/Tokyo',
    'yyyy/MM/dd HH:mm:ss.SSS z'
  ).toUTC();
  expect(d.offset).toBe(0);
  expect(d.hour).toBe(0);
  expect(d.minute).toBe(10);
});

test('DateTime.fromFormat() with setZone parses IANA zones and sets it', () => {
  const d = DateTime.fromFormat('1982/05/25 09:10:11.445 Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss.SSS z', {
    setZone: true
  });
  expect(d.zoneName).toBe('Asia/Tokyo');
  expect(d.offset).toBe(9 * 60);
  expect(d.hour).toBe(9);
  expect(d.minute).toBe(10);
});

test('DateTime.fromFormat() parses fixed offsets', () => {
  const formats = [['Z', '-4'], ['ZZ', '-4:00'], ['ZZZ', '-0400']];

  for (const i in formats) {
    if (formats.hasOwnProperty(i)) {
      const [format, example] = formats[i],
        dt = DateTime.fromFormat(
          `1982/05/25 09:10:11.445 ${example}`,
          `yyyy/MM/dd HH:mm:ss.SSS ${format}`
        );
      expect(dt.toUTC().hour).toBe(13);
      expect(dt.toUTC().minute).toBe(10);
    }
  }
});

test('DateTime.fromFormat() with setZone parses fixed offsets and sets it', () => {
  const formats = [['Z', '-4'], ['ZZ', '-4:00'], ['ZZZ', '-0400']];

  for (const i in formats) {
    if (formats.hasOwnProperty(i)) {
      const [format, example] = formats[i],
        dt = DateTime.fromFormat(
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

test("DateTime.fromFormat() throws if you don't provide a format", () => {
  expect(() => DateTime.fromFormat('yo')).toThrowError(InvalidArgumentError);
});

test('DateTime.fromFormat validates weekdays', () => {
  let dt = DateTime.fromFormat('Wed 2017-11-29 02:00', 'EEE yyyy-MM-dd HH:mm');
  expect(dt.isValid).toBe(true);

  dt = DateTime.fromFormat('Thu 2017-11-29 02:00', 'EEE yyyy-MM-dd HH:mm');
  expect(dt.isValid).toBe(false);

  dt = DateTime.fromFormat('Wed 2017-11-29 02:00 +12:00', 'EEE yyyy-MM-dd HH:mm ZZ');
  expect(dt.isValid).toBe(true);

  dt = DateTime.fromFormat('Wed 2017-11-29 02:00 +12:00', 'EEE yyyy-MM-dd HH:mm ZZ', {
    setZone: true
  });

  expect(dt.isValid).toBe(true);

  dt = DateTime.fromFormat('Tue 2017-11-29 02:00 +12:00', 'EEE yyyy-MM-dd HH:mm ZZ', {
    setZone: true
  });
  expect(dt.isValid).toBe(false);
});

//------
// .fromFormatExplain
//-------

function keyCount(o) {
  return Object.keys(o).length;
}

test('DateTime.fromFormatExplain() explains success', () => {
  const ex = DateTime.fromFormatExplain('May 25, 1982 09:10:12.445', 'MMMM dd, yyyy HH:mm:ss.SSS');
  expect(ex.rawMatches).toBeInstanceOf(Array);
  expect(ex.matches).toBeInstanceOf(Object);
  expect(keyCount(ex.matches)).toBe(7);
  expect(ex.result).toBeInstanceOf(Object);
  expect(keyCount(ex.result)).toBe(7);
});

test('DateTime.fromFormatExplain() explains a bad match', () => {
  const ex = DateTime.fromFormatExplain('May 25, 1982 09:10:12.445', 'MMMM dd, yyyy mmmm');
  expect(ex.rawMatches).toBeNull();
  expect(ex.matches).toBeInstanceOf(Object);
  expect(keyCount(ex.matches)).toBe(0);
  expect(ex.result).toBeInstanceOf(Object);
  expect(keyCount(ex.result)).toBe(0);
});

//------
// .fromStringExplain
//-------
test('DateTime.fromStringExplain is an alias for DateTime.fromFormatExplain', () => {
  const ff = DateTime.fromFormatExplain('1982/05/25 09:10:11.445', 'yyyy/MM/dd HH:mm:ss.SSS'),
    fs = DateTime.fromStringExplain('1982/05/25 09:10:11.445', 'yyyy/MM/dd HH:mm:ss.SSS');

  expect(ff).toEqual(fs);
});

//------
// .fromString
//-------

test('DateTime.fromString is an alias for DateTime.fromFormat', () => {
  const ff = DateTime.fromFormat('1982/05/25 09:10:11.445', 'yyyy/MM/dd HH:mm:ss.SSS'),
    fs = DateTime.fromString('1982/05/25 09:10:11.445', 'yyyy/MM/dd HH:mm:ss.SSS');

  expect(ff).toEqual(fs);
});
