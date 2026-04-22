import { Settings, DateTime } from "./src/luxon.js";
// Settings.defaultZone = "Europe/Berlin";

console.log(DateTime.fromFormat("2026-01-30T07:30:21 1769758221", "yyyy-MM-dd'T'HH:mm:ss X", { zone: "America/New_York"}).toISO());
console.log(DateTime.fromFormat("2026-01-30T07:30:21", "yyyy-MM-dd'T'HH:mm:ss", { zone: "America/New_York"}).toISO());