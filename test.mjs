import { Zone, DateTime } from "./src/luxon.ts";

const regexp = /^(\d+)-(\d+)-(\d+)$/;

console.log("2024-04-01".match(regexp));

console.log(/[a-z_+-/]{1,256}?/i.source);
