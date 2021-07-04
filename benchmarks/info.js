import Benchmark from "benchmark";
import Info from "../src/info";
import Locale from "../src/impl/locale.js";

function runWeekdaysSuite() {
  return new Promise((resolve, reject) => {
    const locale = Locale.create(null, null, null);

    new Benchmark.Suite()
      .add("Info.weekdays with existing locale", () => {
        Info.weekdays("long", { locObj: locale });
      })
      .add("Info.weekdays", () => {
        Info.weekdays("long");
      })
      .on("cycle", (event) => {
        console.log(String(event.target));
      })
      .on("complete", function () {
        console.log("Fastest is " + this.filter("fastest").map("name"));
        resolve();
      })
      .on("error", function () {
        reject(this.error);
      })
      .run();
  });
}

function runWeekdaysFormatSuite() {
  return new Promise((resolve, reject) => {
    const locale = Locale.create(null, null, null);

    new Benchmark.Suite()
      .add("Info.weekdaysFormat with existing locale", () => {
        Info.weekdaysFormat("long", { locObj: locale });
      })
      .add("Info.weekdaysFormat", () => {
        Info.weekdaysFormat("long");
      })
      .on("cycle", (event) => {
        console.log(String(event.target));
      })
      .on("complete", function () {
        console.log("Fastest is " + this.filter("fastest").map("name"));
        resolve();
      })
      .on("error", function () {
        reject(this.error);
      })
      .run();
  });
}

function runMonthsSuite() {
  return new Promise((resolve, reject) => {
    const locale = Locale.create(null, null, null);
    new Benchmark.Suite()
      .add("Info.months with existing locale", () => {
        Info.months("long", { locObj: locale });
      })
      .add("Info.months", () => {
        Info.months("long");
      })
      .on("cycle", (event) => {
        console.log(String(event.target));
      })
      .on("complete", function () {
        console.log("Fastest is " + this.filter("fastest").map("name"));
        resolve();
      })
      .on("error", function () {
        reject(this.error);
      })
      .run();
  });
}

function runMonthsFormatSuite() {
  return new Promise((resolve, reject) => {
    const locale = Locale.create(null, null, null);

    new Benchmark.Suite()
      .add("Info.monthsFormat with existing locale", () => {
        Info.monthsFormat("long", { locObj: locale });
      })
      .add("Info.monthsFormat", () => {
        Info.monthsFormat("long");
      })
      .on("cycle", (event) => {
        console.log(String(event.target));
      })
      .on("complete", function () {
        console.log("Fastest is " + this.filter("fastest").map("name"));
        resolve();
      })
      .on("error", function () {
        reject(this.error);
      })
      .run();
  });
}

const allSuites = [runMonthsSuite, runMonthsFormatSuite, runWeekdaysSuite, runWeekdaysFormatSuite];

export default allSuites;
