/* eslint import/no-extraneous-dependencies: off */
/* eslint no-console: off */
import Benchmark from "benchmark";
import DateTime from "../src/datetime";

const suite = new Benchmark.Suite();

const dt = DateTime.local();

suite
  .add("DateTime.local", () => {
    DateTime.local();
  })
  .add("DateTime.fromObject with locale", () => {
    DateTime.fromObject({ locale: "fr" });
  })
  .add("DateTime.local with numbers", () => {
    DateTime.local(2017, 5, 15);
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
  .add("DateTime#add", () => {
    dt.plus({ milliseconds: 3434 });
  })
  .add("DateTime#toISO", () => {
    dt.toISO();
  })
  .add("DateTime#toFormatString", () => {
    dt.toLocaleString();
  })
  .on("cycle", event => {
    console.log(String(event.target));
  })
  // eslint-disable-next-line func-names
  .on("complete", function() {
    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  .run();
