import { Zone, DateTime } from "./src/luxon.ts";

const mySymbol = Symbol("mySymbol");
const x = Object.create(null);

Object.defineProperty(x, mySymbol, {
  enumerable: false,
  writable: false,
  configurable: false,
  value: "hello world",
});

console.log({ ...x });

// console.log(
//   DateTime.parseFormatForOpts({ timeZoneName: "long" }, { locale: "en-US" })
// );
//
// console.log(DateTime.now().toLocaleString({ timeZoneName: "long" }, { locale: "en-US" }));
// console.log(DateTime.now().toFormat("ZZZZZ"));
// console.log(DateTime.fromFormatExplain(DateTime.now().toLocaleString({ timeZoneName: "short" }), "ZZZ"));
