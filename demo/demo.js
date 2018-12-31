/* eslint-disable no-undef */
function demo(luxon) {
  var DateTime = luxon.DateTime,
    Duration = luxon.Duration,
    Info = luxon.Info,
    examples = [],
    run = function(code) {
      var result;
      try {
        // eslint-disable-next-line no-eval
        result = eval(code);
      } catch (e) {
        console.error(e);
        return "[error]";
      }

      switch (true) {
        case result.isValid === false:
          return "Invalid";
        case result instanceof DateTime:
          return "[ DateTime " + result.toISO() + " ]";
        case result instanceof Duration:
          return "[ Duration " + JSON.stringify(result.toObject()) + " ]";
        default:
          return JSON.stringify(result);
      }
    },
    example = function(code) {
      examples.push(
        "<tr class='example'><td class='code'>" +
          code +
          "</td><td class='divider'>//=> </td><td class='result'>" +
          run(code) +
          "</td></tr>"
      );
    };

  example("Info.features()");
  example("DateTime.local()");
  example("DateTime.local(2017, 5, 15, 17, 36)");
  example("DateTime.utc(2017, 5, 15, 17, 36)");
  example("DateTime.local().toUTC()");
  example("DateTime.utc(2017, 5, 15, 17, 36).toLocal()");
  example("DateTime.local().toObject()");
  example("DateTime.fromObject({year: 2017, month: 5, day: 15, hour: 17, minute: 36})");
  example(
    "DateTime.fromObject({year: 2017, month: 5, day: 15, hour: 17, minute: 36, zone: 'America/New_York' })"
  );
  example(
    "DateTime.fromObject({year: 2017, month: 5, day: 15, hour: 17, minute: 36, zone: 'Asia/Singapore' })"
  );
  example("DateTime.local().plus({minutes: 15, seconds: 8})");
  example("DateTime.local().plus({days: 6})");
  example("DateTime.local().minus({days: 6})");
  example("DateTime.local().diff(DateTime.local(1982, 5, 25)).milliseconds");
  example("DateTime.local().diff(DateTime.local(1982, 5, 25), 'days').days");
  example("DateTime.local().diff(DateTime.local(1982, 5, 25), ['days', 'hours'])");
  example("DateTime.local().toLocaleString()");
  example("DateTime.local().setLocale('zh').toLocaleString()");
  example("DateTime.local().toLocaleString(DateTime.DATE_MED)");
  example("DateTime.local().setLocale('zh').toLocaleString(DateTime.DATE_MED)");
  example("DateTime.local().setLocale('fr').toLocaleString(DateTime.DATE_FULL)");
  example("DateTime.fromISO('2017-05-15')");
  example("DateTime.fromISO('2017-05-15T17:36')");
  example("DateTime.fromISO('2017-W33-4')");
  example("DateTime.fromISO('2017-W33-4T04:45:32.343')");
  example("DateTime.fromFormat('12-16-2017', 'MM-dd-yyyy')");
  example("DateTime.local().toFormat('MM-dd-yyyy')");
  example("DateTime.local().toFormat('MMMM dd, yyyy')");
  example("DateTime.local().setLocale('fr').toFormat('MMMM dd, yyyy')");
  example("DateTime.fromFormat('May 25, 1982', 'MMMM dd, yyyy')");
  example("DateTime.fromFormat('mai 25, 1982', 'MMMM dd, yyyy', { locale: 'fr' })");
  example("DateTime.local().plus({ days: 1 }).toRelativeCalendar()");
  example("DateTime.local().plus({ days: -1 }).toRelativeCalendar()");
  example("DateTime.local().plus({ months: 1 }).toRelativeCalendar()");
  example("DateTime.local().setLocale('fr').plus({ days: 1 }).toRelativeCalendar()");
  example("DateTime.local().setLocale('fr').plus({ days: -1 }).toRelativeCalendar()");
  example("DateTime.local().setLocale('fr').plus({ months: 1 }).toRelativeCalendar()");

  var all = "<h1>Some Luxon examples</h1>";
  all +=
    "<p>This is not meant to be a comprehensive showcase of Luxon's capabilities, just a quick flavoring.</p>";
  all += "<table>";
  all += examples.join("");
  all += "</table>";

  document.body.innerHTML = all;
}

if (typeof define !== "undefined") {
  define(["luxon"], function(luxon) {
    return function() {
      demo(luxon);
    };
  });
} else {
  window.demo = demo;
}
