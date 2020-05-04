/* global expect */
import { Info } from "../../src/luxon";

const Helpers = require("../helpers");

//------
// Info.months()
//------
Helpers.withoutFTP("Info.months lists 2-digit months in English without FTP support", () => {
  expect(Info.months("2-digit", { locale: "fr" })).toEqual([
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12"
  ]);
});

Helpers.withoutFTP("Info.months lists numeric months in English without FTP support", () => {
  expect(Info.months("numeric", { locale: "fr" })).toEqual([
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12"
  ]);
});

Helpers.withoutFTP("Info.months lists short months in English without FTP support", () => {
  expect(Info.months("short", { locale: "fr" })).toEqual([
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ]);
});

Helpers.withoutFTP("Info.months lists long months in English without FTP support", () => {
  expect(Info.months("long")).toEqual([
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]);
});

Helpers.withoutFTP("Info.months lists narrow months in English without FTP support", () => {
  expect(Info.months("narrow", { locale: "fr" })).toEqual([
    "J",
    "F",
    "M",
    "A",
    "M",
    "J",
    "J",
    "A",
    "S",
    "O",
    "N",
    "D"
  ]);
});

//------
// Info.weekdays()
//------
Helpers.withoutFTP("Info.weekdays lists the long weekdays in English without FTP support", () => {
  expect(Info.weekdays("long", { locale: "fr" })).toEqual([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ]);
});

Helpers.withoutFTP("Info.weekdays lists the short weekdays in English without FTP support", () => {
  expect(Info.weekdays("short", { locale: "fr" })).toEqual([
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun"
  ]);
});

Helpers.withoutFTP("Info.weekdays lists the narrow weekdays in English without FTP support", () => {
  expect(Info.weekdays("narrow", { locale: "fr" })).toEqual(["M", "T", "W", "T", "F", "S", "S"]);
});

Helpers.withoutFTP(
  "Info.weekdays lists the numeric weekdays in English without FTP support",
  () => {
    expect(Info.weekdays("numeric", { locale: "fr" })).toEqual(["1", "2", "3", "4", "5", "6", "7"]);
  }
);

//------
// Info.meridiems()
//------
Helpers.withoutFTP("Info.meridiems lists all the meridiems in English without FTP support", () => {
  expect(Info.meridiems({ locale: "en" })).toEqual(["AM", "PM"]);
});

//------
// Info.eras()
//------

Helpers.withoutFTP("Info.eras lists all the eras in English without FTP support", () => {
  expect(Info.eras()).toEqual(["BC", "AD"]);
  expect(Info.eras("short")).toEqual(["BC", "AD"]);
  expect(Info.eras("long")).toEqual(["Before Christ", "Anno Domini"]);
});
