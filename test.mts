import { Zone, DateTime } from "./src/luxon.ts";

const d = new Date(1935, 0, 1, 0, 0, 0, 0);
const dUtc = new Date(Date.UTC(1935, 0, 1, 0, 0, 0, 0));

const dtf = new Intl.DateTimeFormat("en-US", { hour: 'numeric', timeZoneName: "longOffset" });
const parts = dtf.formatToParts(d);
const timeZoneName = parts.find(p => p.type === "timeZoneName")!;
const match = timeZoneName.value.match(/^GMT([+-]\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/)
console.log(match, d.getTimezoneOffset());


// console.log(
//   DateTime.parseFormatForOpts({ timeZoneName: "long" }, { locale: "en-US" })
// );
//
// console.log(DateTime.now().toLocaleString({ timeZoneName: "long" }, { locale: "en-US" }));
// console.log(DateTime.now().toFormat("ZZZZZ"));
// console.log(DateTime.fromFormatExplain(DateTime.now().toLocaleString({ timeZoneName: "short" }), "ZZZ"));
