import { Zone, DateTime } from "./src/luxon.ts";

const date = new Date(2015, 1, 2, 3, 4, 5, 6);
console.log(date.valueOf());



// console.log(
//   DateTime.parseFormatForOpts({ timeZoneName: "long" }, { locale: "en-US" })
// );
//
// console.log(DateTime.now().toLocaleString({ timeZoneName: "long" }, { locale: "en-US" }));
// console.log(DateTime.now().toFormat("ZZZZZ"));
// console.log(DateTime.fromFormatExplain(DateTime.now().toLocaleString({ timeZoneName: "short" }), "ZZZ"));