import { Zone, DateTime } from "./src/luxon.ts";

const proto = Object.getPrototypeOf(DateTime.now());
console.log(Object.getOwnPropertyNames(proto));

const outputCalendar = proto["resolvedLocaleOptions"];
console.log(outputCalendar);


// console.log(
//   DateTime.parseFormatForOpts({ timeZoneName: "long" }, { locale: "en-US" })
// );
//
// console.log(DateTime.now().toLocaleString({ timeZoneName: "long" }, { locale: "en-US" }));
// console.log(DateTime.now().toFormat("ZZZZZ"));
// console.log(DateTime.fromFormatExplain(DateTime.now().toLocaleString({ timeZoneName: "short" }), "ZZZ"));
