/* eslint import/no-extraneous-dependencies: off */
/* eslint no-console: off */
import Benchmark from "benchmark";
import DateTime from "../src/datetime";
import Settings from "../src/settings";

function runDateTimeSuite() {
  return new Promise((resolve, reject) => {
    const suite = new Benchmark.Suite();

    const dt = DateTime.now();

    suite
      .add("DateTime.local", () => {
        DateTime.now();
      })
      .add("DateTime.fromObject with locale", () => {
        DateTime.fromObject({}, { locale: "fr" });
      })
      .add("DateTime.local with numbers", () => {
        DateTime.local(2017, 5, 15);
      })
      .add("DateTime.fromISO", () => {
        DateTime.fromISO("1982-05-25T09:10:11.445Z");
      })
      .add("DateTime.fromSQL", () => {
        DateTime.fromSQL("2016-05-14 10:23:54.2346");
      })
      .add("DateTime.fromString", () => {
        DateTime.fromString("1982/05/25 09:10:11.445", "yyyy/MM/dd HH:mm:ss.SSS");
      })
      .add("DateTime.fromString with zone", () => {
        DateTime.fromString("1982/05/25 09:10:11.445", "yyyy/MM/dd HH:mm:ss.SSS", {
          zone: "America/Los_Angeles"
        });
      })
      .add("DateTime#setZone", () => {
        dt.setZone("America/Los_Angeles");
      })
      .add("DateTime#toFormat", () => {
        dt.toFormat("yyyy-MM-dd");
      })
      .add("DateTime#toFormat with macro", () => {
        dt.toFormat("T");
      })
      .add("DateTime#toFormat with macro no cache", () => {
        dt.toFormat("T");
        Settings.resetCaches();
      })
      .add("DateTime#add", () => {
        dt.plus({ milliseconds: 3434 });
      })
      .add("DateTime#toISO", () => {
        dt.toISO();
      })
      .add("DateTime#toLocaleString", () => {
        dt.toLocaleString();
      })
      .add("DateTime#toRelativeCalendar", () => {
        dt.toRelativeCalendar({ base: DateTime.now(), locale: "fi" });
      })
      .on("cycle", event => {
        console.log(String(event.target));
      })
      // eslint-disable-next-line func-names
      .on("complete", function() {
        console.log("Fastest is " + this.filter("fastest").map("name"));
        resolve();
      })
      .on("error", function() {
        reject(this.error);
      })
      .run();
  });
}

const allSuites = [runDateTimeSuite];

export default allSuites;
