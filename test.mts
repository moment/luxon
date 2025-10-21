import { Zone, DateTime } from "./src/luxon.ts";


console.log(DateTime.parseFormatForOpts({ dateStyle: "full" }));

// console.log(
//   DateTime.parseFormatForOpts({ timeZoneName: "long" }, { locale: "en-US" })
// );
//
// console.log(DateTime.now().toLocaleString({ timeZoneName: "long" }, { locale: "en-US" }));
// console.log(DateTime.now().toFormat("ZZZZZ"));
// console.log(DateTime.fromFormatExplain(DateTime.now().toLocaleString({ timeZoneName: "short" }), "ZZZ"));